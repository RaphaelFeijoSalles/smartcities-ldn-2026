import asyncio
import json
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import app.main as main
from app.evidence_ai import (
    AnalysisUnavailable, MODEL, OUTPUT_TOKENS, demo_plan, evidence_router,
    housing_facts, openai_plan, reserve_live_call, validate_plan,
)

ENDPOINT = "/api/habitacao/municipios/4113700/analise"
TOKEN = "test-token-" + "a" * 32
SYNTHETIC_SENSITIVE_MARKER = "Campo sintético indevido"


@pytest.fixture
def snapshots():
    snhis = json.loads((Path(__file__).parent / "fixtures/snhis_londrina_official.json").read_text())
    mcmv = {
        "mode": "OFFICIAL",
        "source": {"url": "https://www.gov.br/cidades/arquivo-de-teste.zip"},
        "records": [{
            "codigo_municipio_fonte": "411370",
            "data_referencia": "2026-06-30",
            "txt_nome_empreendimento": SYNTHETIC_SENSITIVE_MARKER,
            "qtd_uh": 999999,
        }] * 2,
    }
    return SimpleNamespace(cached=snhis), SimpleNamespace(cached=mcmv)


def client_for(snapshots, provider):
    app = FastAPI()
    app.include_router(evidence_router(*snapshots, provider=provider))
    return TestClient(app)


async def unexpected_provider(*args):
    raise AssertionError("O provedor não deve ser chamado neste cenário")


@pytest.fixture
def live(monkeypatch, tmp_path):
    monkeypatch.setenv("ORIGEM_UNICA_AI_MODE", "live")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test-not-real")
    monkeypatch.setenv("ORIGEM_UNICA_AI_ACCESS_TOKEN", TOKEN)
    monkeypatch.setenv("ORIGEM_UNICA_AI_BUDGET_DB", str(tmp_path / "budget.db"))
    return {"Authorization": f"Bearer {TOKEN}"}


def test_demo_is_explicit_and_projects_only_bounded_facts(monkeypatch, snapshots):
    monkeypatch.delenv("ORIGEM_UNICA_AI_MODE", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    client = client_for(snapshots, unexpected_provider)
    response = client.post(ENDPOINT)
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    data = response.json()
    assert data["mode"] == "DEMO"
    evidence = {item["id"]: item for item in data["evidence"]}
    assert evidence["snhis"]["value"] == "REGULAR"
    assert evidence["snhis"]["dates"] == ["2026-10-20"]
    assert evidence["mcmv"]["value"] == 2
    assert evidence["mcmv"]["dates"] == ["2026-06-30"]
    assert {"fundo", "conselho", "adesao", "plhis"} <= evidence.keys()
    assert all(set(item["fact_ids"]) <= evidence.keys()
               for section in ("summary", "limitations", "next_steps") for item in data[section])
    assert SYNTHETIC_SENSITIVE_MARKER not in response.text
    assert "999999" not in response.text
    assert client.post(ENDPOINT).status_code == 429


def test_route_is_wired_and_preflight_is_restricted(monkeypatch, snapshots):
    monkeypatch.setenv("ORIGEM_UNICA_AI_MODE", "demo")
    monkeypatch.setattr(main, "McmvService", lambda: snapshots[1])
    client = TestClient(main.create_app(housing_service=snapshots[0]))
    headers = {"Origin": "http://localhost:4173", "Access-Control-Request-Method": "POST",
               "Access-Control-Request-Headers": "Authorization"}
    assert client.options(ENDPOINT, headers=headers).status_code == 200
    assert client.options(ENDPOINT, headers={**headers, "Origin": "https://unsigned.example"}).status_code == 400
    assert client.post(ENDPOINT).json()["mode"] == "DEMO"
    assert client.get("/api/health").json()["status"] == "ok"


@pytest.mark.parametrize("issue", ["no_key", "no_budget", "wrong_token", "cold_cache"])
def test_live_gates_before_provider(monkeypatch, snapshots, live, issue):
    if issue == "no_key":
        monkeypatch.delenv("OPENAI_API_KEY")
    elif issue == "no_budget":
        monkeypatch.delenv("ORIGEM_UNICA_AI_BUDGET_DB")
    elif issue == "wrong_token":
        live["Authorization"] = "Bearer wrong"
    else:
        snapshots[0].cached = None
    response = client_for(snapshots, unexpected_provider).post(ENDPOINT, headers=live)
    assert response.status_code == (401 if issue == "wrong_token" else 503)


def test_live_uses_configured_model_and_applies_cooldown(monkeypatch, snapshots, live):
    monkeypatch.setenv("ORIGEM_UNICA_AI_MODEL", "test-configured-model")
    calls = []

    async def fake_provider(facts, api_key, model):
        calls.append(model)
        assert api_key == "sk-test-not-real"
        return demo_plan(facts)

    client = client_for(snapshots, fake_provider)
    assert client.post(ENDPOINT, headers=live).json()["mode"] == "AI"
    assert client.post(ENDPOINT, headers=live).status_code == 429
    assert calls == ["test-configured-model"]


@pytest.mark.parametrize("failure, status", [("timeout", 504), ("invented", 502), ("upstream", 502)])
def test_provider_errors_do_not_fall_back_or_reveal_payload(snapshots, live, failure, status):
    async def fail(facts, *_):
        if failure == "timeout":
            raise TimeoutError("debug secret timeout")
        if failure == "upstream":
            raise httpx.ConnectError("debug secret upstream")
        return {**demo_plan(facts), "summary": ["snhis", "fato_inventado"]}

    response = client_for(snapshots, fail).post(ENDPOINT, headers=live)
    assert response.status_code == status
    assert "debug secret" not in response.text
    assert "fato_inventado" not in response.text
    assert "mode" not in response.json()


def test_budget_is_atomic_and_persists_across_connections(tmp_path, monkeypatch):
    path = tmp_path / "budget.db"
    clock = [1_800_000_000]
    monkeypatch.setattr("app.evidence_ai.time.time", lambda: clock[0])
    with ThreadPoolExecutor(max_workers=6) as pool:
        assert sum(pool.map(reserve_live_call, [path] * 6)) == 1
    for _ in range(7):
        clock[0] += 31
        assert reserve_live_call(path)
    clock[0] += 31
    assert not reserve_live_call(path)
    with sqlite3.connect(path) as db:
        assert db.execute("SELECT calls FROM housing_ai_budget").fetchone() == (8,)
    clock[0] += 86_400
    assert reserve_live_call(path)


def test_model_references_and_suggestions_are_checkable(snapshots):
    facts = housing_facts(*(item.cached for item in snapshots))
    plan = demo_plan(facts)
    for proposed in [
        {**plan, "evidence": ["snhis"] * len(facts)},
        {**plan, "summary": ["snhis", "fundo"]},
        {**plan, "next_steps": ["check_pending"]},
        {**plan, "summary": ["snhis", {"text": "decreto inventado"}]},
        {**plan, "official_status": "PENDENTE"},
    ]:
        with pytest.raises(AnalysisUnavailable):
            validate_plan(proposed, facts)


@pytest.mark.parametrize("response_mode", ["completed", "incomplete", "refused", "malformed"])
def test_responses_http_contract_and_untrusted_output(snapshots, response_mode):
    facts = housing_facts(*(item.cached for item in snapshots))

    def respond(request):
        body = json.loads(request.content)
        assert request.url == "https://api.openai.com/v1/responses"
        assert request.headers["Authorization"] == "Bearer sk-test-not-real"
        assert body["model"] == MODEL
        assert body["store"] is False
        assert body["max_output_tokens"] == OUTPUT_TOKENS
        assert body["text"]["format"]["strict"] is True
        assert "tools" not in body
        assert json.loads(body["input"])["fatos"] == facts
        assert SYNTHETIC_SENSITIVE_MARKER not in body["input"]
        assert "999999" not in body["input"]
        if response_mode == "malformed":
            return httpx.Response(200, json={"status": "completed", "output": [None]})
        return httpx.Response(200, json={
            "status": "incomplete" if response_mode == "incomplete" else "completed",
            "output": [{"type": "message", "role": "assistant", "content": [
                {"type": "refusal", "refusal": "Indisponível"} if response_mode == "refused" else
                {"type": "output_text", "text": json.dumps(demo_plan(facts))}
            ]}],
        })

    call = openai_plan(facts, "sk-test-not-real", MODEL, httpx.MockTransport(respond))
    if response_mode == "completed":
        assert asyncio.run(call) == demo_plan(facts)
    else:
        with pytest.raises(AnalysisUnavailable):
            asyncio.run(call)
