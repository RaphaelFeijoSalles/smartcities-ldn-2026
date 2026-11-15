"""Adversarial checks for PR #40; activate when its module is integrated."""
import asyncio
import json
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

ai = pytest.importorskip("app.evidence_ai")

ENDPOINT = "/api/habitacao/municipios/4113700/analise"
TOKEN = "synthetic-" + "x" * 40


@pytest.fixture
def facts_and_services():
    source = Path(__file__).parent / "fixtures/snhis_londrina_official.json"
    snhis = json.loads(source.read_text())
    mcmv = {"mode": "OFFICIAL", "source": {"url": "https://www.gov.br/cidades/fonte.zip"},
            "records": [{"codigo_municipio_fonte": "411370", "data_referencia": "2026-06-30",
                         "txt_nome_empreendimento": "SINTÉTICO: conteúdo privado", "qtd_uh": 987654}]}
    services = (SimpleNamespace(cached=snhis), SimpleNamespace(cached=mcmv))
    return ai.housing_facts(snhis, mcmv), services


@pytest.mark.parametrize("change", [
    lambda p: {**p, "summary": ["snhis", "mcmv", "situação inventada"]},
    lambda p: {**p, "evidence": [*p["evidence"][:-1], "fonte inventada"]},
    lambda p: {**p, "next_steps": ["check_pending"]},
    lambda p: {**p, "snhis_status": "PENDENTE"},
    lambda p: {**p, "limitations": ["dated", "rows", "sem limite"]},
])
def test_adversarial_plan_cannot_change_facts(facts_and_services, change):
    facts, _ = facts_and_services
    with pytest.raises(ai.AnalysisUnavailable):
        ai.validate_plan(change(ai.demo_plan(facts)), facts)
    rendered = ai.render_analysis(ai.demo_plan(facts), facts, "DEMO")
    assert rendered["evidence"][0]["value"] == "REGULAR"
    assert "SINTÉTICO: conteúdo privado" not in json.dumps(rendered)


@pytest.mark.parametrize("payload", [
    {"status": "incomplete", "output": []},
    {"status": "completed", "output": [{"type": "message", "role": "assistant", "content": [{"type": "refusal", "refusal": "no"}]}]},
    {"status": "completed", "output": [{"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "not json"}]}]},
])
def test_invalid_provider_response_is_rejected(facts_and_services, payload):
    facts, _ = facts_and_services
    transport = httpx.MockTransport(lambda _: httpx.Response(200, json=payload))
    with pytest.raises(ai.AnalysisUnavailable):
        asyncio.run(ai.openai_plan(facts, "synthetic-key", ai.MODEL, transport))


def test_oversized_provider_response_is_rejected(facts_and_services):
    facts, _ = facts_and_services
    transport = httpx.MockTransport(lambda _: httpx.Response(200, content=b"x" * 24577))
    with pytest.raises(ai.AnalysisUnavailable, match="limite"):
        asyncio.run(ai.openai_plan(facts, "synthetic-key", ai.MODEL, transport))


@pytest.mark.parametrize("failure,expected", [("wrong_token", 401), ("missing_key", 503),
                                               ("bad_db", 503), ("timeout", 504),
                                               ("provider_429", 502)])
def test_live_fail_closed(monkeypatch, tmp_path, facts_and_services, failure, expected):
    _, services = facts_and_services
    monkeypatch.setenv("ORIGEM_UNICA_AI_MODE", "live")
    monkeypatch.setenv("OPENAI_API_KEY", "synthetic-key")
    monkeypatch.setenv("ORIGEM_UNICA_AI_ACCESS_TOKEN", TOKEN)
    monkeypatch.setenv("ORIGEM_UNICA_AI_BUDGET_DB", str(tmp_path / "budget.sqlite"))
    if failure == "missing_key":
        monkeypatch.delenv("OPENAI_API_KEY")
    if failure == "bad_db":
        monkeypatch.setenv("ORIGEM_UNICA_AI_BUDGET_DB", str(tmp_path))

    async def provider(*_):
        if failure == "timeout":
            raise TimeoutError("synthetic-secret")
        if failure == "provider_429":
            raise httpx.HTTPStatusError("synthetic-secret", request=httpx.Request("POST", "https://api.openai.com/v1/responses"), response=httpx.Response(429))
        raise AssertionError("provider must not be called")

    app = FastAPI()
    app.include_router(ai.evidence_router(*services, provider=provider))
    auth = "Bearer wrong" if failure == "wrong_token" else f"Bearer {TOKEN}"
    response = TestClient(app).post(ENDPOINT, headers={"Authorization": auth})
    assert response.status_code == expected
    assert "synthetic-secret" not in response.text
    assert "synthetic-key" not in response.text
