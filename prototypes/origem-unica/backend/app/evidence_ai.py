"""Read-only analysis of the validated Londrina housing snapshots."""
from __future__ import annotations

import asyncio
import hmac
import json
import logging
import math
import os
import sqlite3
import time
from contextlib import closing
from datetime import date, datetime, timezone

import httpx
from fastapi import APIRouter, Header, HTTPException, Response

from app.habitacao import REQUIREMENTS, norm, official_url

MODEL = "gpt-6.1-terra"
OUTPUT_TOKENS = 512
REQUEST_BYTES = 6_144
DAILY_CALLS = 8
COOLDOWN = 30
TIMEOUT = 12
MUNICIPALITY = "4113700"
STATUS = {"REGULAR", "PENDENTE"}
INSTRUMENT_IDS = ("fundo", "conselho", "adesao", "plhis")
REQUIRED_SUMMARY = {"snhis", "mcmv"}
LIMITATIONS = {
    "dated": (["snhis", "mcmv"], "Os snapshots retratam as datas indicadas. Confira a situação atual no sistema oficial."),
    "rows": (["mcmv"], "A contagem MCMV representa linhas da fonte. O conjunto pode conter operações repetidas."),
}
STEPS = {
    "check_snhis": ("snhis", "Conferir a situação municipal e as datas no SNHIS oficial."),
    "check_mcmv": ("mcmv", "Revisar as linhas MCMV na fonte antes de comparar ou agregar registros."),
    "check_pending": ("snhis", "Conferir com a CEFUS/CAIXA a pendência declarada no snapshot."),
}
INSTRUCTIONS = (
    "Organize uma análise de evidências habitacionais usando somente os fatos JSON fornecidos. "
    "Devolva apenas identificadores do esquema. Selecione e ordene de dois a quatro fatos em summary, "
    "com snhis e mcmv obrigatórios. Em evidence cite todos os fatos, sem repetição. "
    "Em limitations inclua dated e rows. Em next_steps ordene de uma a duas ações relevantes; "
    "priorize check_pending quando o fato snhis indicar PENDENTE. Nunca inclua prosa ou outros campos."
)
log = logging.getLogger(__name__)


class AnalysisUnavailable(ValueError):
    pass


def dated_iso(value):
    if not isinstance(value, str) or date.fromisoformat(value).isoformat() != value:
        raise AnalysisUnavailable("Data inválida")
    return value


def snapshot_url(snapshot):
    url = snapshot["source"]["url"]
    if snapshot["mode"] != "OFFICIAL" or not isinstance(url, str) or len(url) > 480 or not official_url(url):
        raise AnalysisUnavailable("Snapshot sem URL oficial")
    return url


def housing_facts(snhis, mcmv):
    """Project only references and values needed for the analysis, from validated cache."""
    try:
        row = snhis["records"][MUNICIPALITY]
        situation = row["situacao_snhis"]
        if row["codigo_ibge"] != MUNICIPALITY or (row["nome"], row["uf"]) != ("Londrina", "PR") or situation not in STATUS:
            raise AnalysisUnavailable("Situação municipal indisponível")
        url = snapshot_url(snhis)
        reference = dated_iso(row["data_referencia"])
        facts = {
            "snhis": {"label": "Situação municipal no SNHIS", "value": situation, "dates": [reference], "url": url},
        }
        requirements = {r["requisito"]: r["situacao_fonte"] for r in row["requisitos"]}
        for fact_id, name in zip(INSTRUMENT_IDS, REQUIREMENTS.values(), strict=True):
            status = norm(requirements.get(name))
            facts[fact_id] = {
                "label": name, "value": status if status in STATUS else "NÃO VERIFICADO",
                "dates": [reference], "url": url,
            }

        rows = [item for item in mcmv["records"] if item["codigo_municipio_fonte"] == MUNICIPALITY[:6]]
        references = sorted({dated_iso(item["data_referencia"]) for item in rows})
        if not 1 <= len(references) <= 8:
            raise AnalysisUnavailable("Referências MCMV indisponíveis")
        facts["mcmv"] = {
            "label": "Linhas da fonte MCMV", "value": len(rows), "dates": references,
            "url": snapshot_url(mcmv),
        }
        return facts
    except (KeyError, TypeError, ValueError) as exc:
        raise AnalysisUnavailable("Snapshots oficiais de Londrina incompletos.") from exc


def options(facts):
    steps = ["check_snhis", "check_mcmv"]
    if facts["snhis"]["value"] == "PENDENTE":
        steps.append("check_pending")
    return {
        "summary": list(facts), "evidence": list(facts),
        "limitations": list(LIMITATIONS), "next_steps": steps,
    }


def validate_plan(candidate, facts):
    allowed = options(facts)
    if not isinstance(candidate, dict) or candidate.keys() != allowed.keys():
        raise AnalysisUnavailable("Formato de análise inválido")
    limits = {"summary": (2, 4), "evidence": (len(facts), len(facts)), "limitations": (2, 2), "next_steps": (1, 2)}
    for key, values in candidate.items():
        lower, upper = limits[key]
        if not isinstance(values, list) or not lower <= len(values) <= upper or any(
            not isinstance(item, str) or item not in allowed[key] for item in values
        ) or len(set(values)) != len(values):
            raise AnalysisUnavailable("Referências de análise inválidas")
    if not REQUIRED_SUMMARY.issubset(candidate["summary"]):
        raise AnalysisUnavailable("Resumo sem as duas fontes")
    return candidate


def demo_plan(facts):
    next_steps = ["check_snhis", "check_mcmv"]
    if "check_pending" in options(facts)["next_steps"]:
        next_steps = ["check_pending", "check_mcmv"]
    return {
        "summary": ["snhis", "mcmv"], "evidence": list(facts),
        "limitations": list(LIMITATIONS), "next_steps": next_steps,
    }


def render_analysis(plan, facts, mode):
    return {
        "mode": mode,
        "municipality": {"name": "Londrina", "uf": "PR", "ibge": MUNICIPALITY},
        "summary": [
            {"text": f"{facts[key]['label']}: {facts[key]['value']}.", "fact_ids": [key]}
            for key in plan["summary"]
        ],
        "evidence": [{"id": key, **facts[key]} for key in plan["evidence"]],
        "limitations": [
            {"text": LIMITATIONS[key][1], "fact_ids": LIMITATIONS[key][0]} for key in plan["limitations"]
        ],
        "next_steps": [
            {"text": STEPS[key][1], "fact_ids": [STEPS[key][0]]} for key in plan["next_steps"]
        ],
    }


async def openai_plan(facts, api_key, model, transport=None):
    allowed = options(facts)
    request = {
        "model": model, "instructions": INSTRUCTIONS,
        "input": json.dumps({"municipio": "Londrina/PR", "ibge": MUNICIPALITY, "fatos": facts}, ensure_ascii=False),
        "store": False, "reasoning": {"effort": "none"}, "max_output_tokens": OUTPUT_TOKENS,
        "text": {"format": {
            "type": "json_schema", "name": "housing_evidence_plan", "strict": True,
            "schema": {
                "type": "object",
                "properties": {key: {"type": "array", "items": {"type": "string", "enum": choices}}
                               for key, choices in allowed.items()},
                "required": list(allowed), "additionalProperties": False,
            },
        }},
    }
    body = json.dumps(request, ensure_ascii=False, separators=(",", ":")).encode()
    if len(body) > REQUEST_BYTES:
        raise AnalysisUnavailable("Entrada acima do limite")
    async with asyncio.timeout(TIMEOUT):
        async with httpx.AsyncClient(timeout=TIMEOUT, transport=transport) as client:
            async with client.stream(
                "POST", "https://api.openai.com/v1/responses", content=body,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            ) as response:
                response.raise_for_status()
                raw = bytearray()
                async for chunk in response.aiter_bytes():
                    if len(raw) + len(chunk) > 24_576:
                        raise AnalysisUnavailable("Resposta acima do limite")
                    raw.extend(chunk)
    try:
        payload = json.loads(raw)
        if payload["status"] != "completed":
            raise AnalysisUnavailable("Resposta incompleta")
        content = [part for message in payload["output"] if message.get("type") == "message"
                   and message.get("role") == "assistant" for part in message["content"]]
        if len(content) != 1 or content[0]["type"] != "output_text":
            raise AnalysisUnavailable("Resposta recusada ou inválida")
        plan = validate_plan(json.loads(content[0]["text"]), facts)
    except AnalysisUnavailable:
        raise
    except (AttributeError, KeyError, TypeError, ValueError, OverflowError) as exc:
        raise AnalysisUnavailable("Resposta do provedor inválida") from exc
    # Optional telemetry must not fabricate zero consumption or invalidate a valid plan.
    usage = payload.get("usage")
    counts = [usage.get(key) for key in ("input_tokens", "output_tokens")] if isinstance(usage, dict) else []
    if len(counts) == 2 and all(type(value) is int and 0 <= value <= 10_000_000 for value in counts):
        log.info("housing_ai_tokens usage_known=true input=%d output=%d", *counts)
    else:
        log.info("housing_ai_tokens usage_known=false")
    return plan


def reserve_live_call(path):
    """A shared SQLite transaction reserves cost before any provider request."""
    now = time.time()
    day = datetime.fromtimestamp(now, timezone.utc).date().isoformat()
    with closing(sqlite3.connect(path, timeout=1)) as db, db:
        db.execute("BEGIN IMMEDIATE")
        db.execute("""CREATE TABLE IF NOT EXISTS housing_ai_budget
                   (id INTEGER PRIMARY KEY, day TEXT, calls INTEGER, last REAL)""")
        previous = db.execute("SELECT day, calls, last FROM housing_ai_budget WHERE id=1").fetchone()
        if previous:
            try:
                stored_day, calls, last = previous
                valid = (type(calls) is int and 1 <= calls <= DAILY_CALLS
                         and type(last) in (int, float) and math.isfinite(last) and last >= 0
                         and dated_iso(stored_day) == datetime.fromtimestamp(last, timezone.utc).date().isoformat())
            except (TypeError, ValueError, OverflowError, OSError):
                valid = False
            if not valid:
                # Never repair/reset a corrupt ledger automatically: that would restore paid quota.
                raise sqlite3.DatabaseError("Invalid AI budget state")
        if previous and (now - previous[2] < COOLDOWN or (previous[0] == day and previous[1] >= DAILY_CALLS)):
            return False
        count = previous[1] + 1 if previous and previous[0] == day else 1
        db.execute("INSERT OR REPLACE INTO housing_ai_budget VALUES (1, ?, ?, ?)", (day, count, now))
        return True


def evidence_router(snhis, mcmv, provider=openai_plan):
    router = APIRouter(tags=["Habitação"])
    next_demo = 0.0

    @router.post(f"/api/habitacao/municipios/{MUNICIPALITY}/analise")
    async def analyze(response: Response, authorization: str = Header(default="")):
        nonlocal next_demo
        started = time.monotonic()
        mode = os.getenv("ORIGEM_UNICA_AI_MODE", "demo").strip().lower()
        if mode not in {"demo", "live"}:
            raise HTTPException(503, "Análise desativada.")
        if mode == "live":
            api_key = os.getenv("OPENAI_API_KEY", "").strip()
            token = os.getenv("ORIGEM_UNICA_AI_ACCESS_TOKEN", "").strip()
            budget = os.getenv("ORIGEM_UNICA_AI_BUDGET_DB", "").strip()
            if not api_key or len(token) < 32 or not os.path.isabs(budget):
                raise HTTPException(503, "Modo IA temporariamente indisponível.")
            if not hmac.compare_digest(authorization.encode(), f"Bearer {token}".encode()):
                raise HTTPException(401, "Código de acesso necessário.", headers={"WWW-Authenticate": "Bearer"})
        elif started < next_demo:
            raise HTTPException(429, "Aguarde antes de pedir outra análise.", headers={"Retry-After": "2"})
        else:
            next_demo = started + 2

        try:
            # The normal housing endpoints warm and replace these validated snapshots.
            facts = housing_facts(snhis.cached, mcmv.cached)
        except AnalysisUnavailable as exc:
            raise HTTPException(503, "Abra Habitação para carregar os dois snapshots oficiais e tente novamente.") from exc

        if mode == "live":
            try:
                reserved = await asyncio.to_thread(reserve_live_call, budget)
            except sqlite3.Error as exc:
                log.info("housing_ai outcome=budget_unavailable")
                raise HTTPException(503, "Controle de orçamento indisponível.") from exc
            if not reserved:
                raise HTTPException(429, "Cota de análise ou intervalo mínimo atingido.", headers={"Retry-After": str(COOLDOWN)})
            model = os.getenv("ORIGEM_UNICA_AI_MODEL", MODEL).strip() or MODEL
            try:
                plan = validate_plan(await provider(facts, api_key, model), facts)
            except (TimeoutError, httpx.TimeoutException) as exc:
                log.info("housing_ai outcome=timeout")
                raise HTTPException(504, "O serviço de IA excedeu o tempo limite.") from exc
            except httpx.HTTPStatusError as exc:
                upstream_status = exc.response.status_code
                log.info("housing_ai outcome=provider_http_error status=%d", upstream_status)
                if upstream_status == 429:
                    raise HTTPException(503, "O provedor de IA atingiu um limite de uso ou cota. Consulte o responsável antes de tentar novamente.") from exc
                raise HTTPException(502, "O provedor de IA está indisponível.") from exc
            except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
                log.info("housing_ai outcome=invalid_or_unavailable")
                raise HTTPException(502, "Não foi possível validar a análise de IA.") from exc
        else:
            plan = demo_plan(facts)
        log.info("housing_ai outcome=success mode=%s duration_ms=%d", mode, (time.monotonic() - started) * 1000)
        response.headers["Cache-Control"] = "no-store"
        return render_analysis(plan, facts, "AI" if mode == "live" else "DEMO")

    return router
