import asyncio
import base64
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

from app import data_import_local
from app.data_import_api import MAX_REQUEST_BYTES
from app.main import create_app

ORIGIN = "http://127.0.0.1:8011"
TOKEN = "test-only-token-" + "x" * 32
HEADERS = {"Origin": ORIGIN, "X-Public-Data": "confirmed"}
PREFIX = "/api/data-import"
PROFILE = PREFIX + "/profile"


def browser_client(app, peer="127.0.0.1"):
    return TestClient(app, base_url=ORIGIN, client=(peer, 40400))


@pytest.fixture
def local_app(monkeypatch):
    monkeypatch.setenv("ORIGEM_UNICA_DATA_IMPORT_LOCAL", "1")
    monkeypatch.setenv("ORIGEM_UNICA_DATA_IMPORT_TOKEN", TOKEN)
    monkeypatch.setenv("ORIGEM_UNICA_CORS_ORIGINS", "http://localhost:4173")
    return create_app()


def document(csv=b"codlog,nome\n01,Rua Alfa\n", classification="synthetic"):
    return {
        "filename": "fixture.csv",
        "content_base64": base64.b64encode(csv).decode(),
        "provenance": {
            "name": "Fonte fictícia",
            "url": "https://example.invalid/csv",
            "reference_date": "2026-01-01",
            "version": "2026-01",
            "classification": classification,
            "nature": "street_registry",
            "namespace": "qa:codlog",
        },
    }


def test_disabled_by_default_even_if_token_exists(monkeypatch):
    monkeypatch.delenv("ORIGEM_UNICA_DATA_IMPORT_LOCAL", raising=False)
    monkeypatch.setenv("ORIGEM_UNICA_DATA_IMPORT_TOKEN", TOKEN)
    with browser_client(create_app()) as client:
        assert client.get("/data-import").status_code == 404
        assert client.post(PROFILE, headers=HEADERS, json={"document": document()}).status_code == 404
        assert client.get("/api/health").status_code == 200


@pytest.mark.parametrize("secret", ["", "short", "x" * 32 + "\n"])
def test_invalid_token_fails_closed(monkeypatch, secret):
    monkeypatch.setenv("ORIGEM_UNICA_DATA_IMPORT_LOCAL", "1")
    monkeypatch.setenv("ORIGEM_UNICA_DATA_IMPORT_TOKEN", secret)
    with pytest.raises(ValueError, match="requires a server token"):
        create_app()


@pytest.mark.parametrize(("peer", "headers"), [
    ("192.0.2.10", HEADERS),
    ("127.0.0.1", {**HEADERS, "Host": "public.example"}),
    ("127.0.0.1", {**HEADERS, "Origin": "http://localhost:4173"}),
    ("127.0.0.1", {**HEADERS, "X-Forwarded-For": "127.0.0.1"}),
    ("127.0.0.1", {**HEADERS, "Forwarded": "for=127.0.0.1"}),
    ("127.0.0.1", {"X-Public-Data": "confirmed"}),
    ("127.0.0.1", {"Origin": ORIGIN}),
    ("127.0.0.1", {**HEADERS, "Authorization": "Bearer " + TOKEN}),
])
def test_import_boundary_rejects_before_processing(local_app, peer, headers):
    with browser_client(local_app, peer) as client:
        response = client.post(PROFILE, headers=headers, json={"document": document()})
        assert response.status_code == 403
        assert "access-control-allow-origin" not in response.headers
        assert response.headers["cache-control"] == "no-store"
        assert TOKEN not in response.text
        assert client.get("/api/health").status_code == 200


def test_preflight_denied_even_for_public_cors_origin(local_app):
    headers = {"Origin": "http://localhost:4173", "Access-Control-Request-Method": "POST"}
    with browser_client(local_app) as client:
        assert client.options("/api/health", headers=headers).headers["access-control-allow-origin"] == headers["Origin"]
        response = client.options(PROFILE, headers={**headers, "Access-Control-Request-Headers": "x-public-data"})
        assert response.status_code == 403
        assert "access-control-allow-origin" not in response.headers
        assert client.get("/data-import", headers={"Origin": headers["Origin"]}).status_code == 403
    with browser_client(local_app, "192.0.2.10") as remote:
        assert remote.get("/data-import").status_code == 403
        assert not any(path.startswith(PREFIX) for path in remote.get("/openapi.json").json()["paths"])


def test_local_assets_send_security_headers_without_token(local_app):
    with browser_client(local_app) as client:
        for path, kind in [("/data-import", "text/html"), ("/data-import/workspace.mjs", "text/javascript"),
                           ("/data-import/workspace.css", "text/css")]:
            res = client.get(path)
            assert res.status_code == 200
            assert res.headers["content-type"].startswith(kind)
            assert res.headers["cache-control"] == "no-store"
            assert "frame-ancestors 'none'" in res.headers["content-security-policy"]
            assert res.headers["referrer-policy"] == "no-referrer"
            assert TOKEN not in res.text


def test_bounds_count_requests_without_throttling_public_api(local_app):
    with browser_client(local_app) as client:
        assert client.post(PROFILE, headers=HEADERS, content=b"not-json").status_code == 415
        large = client.post(PROFILE, headers={**HEADERS, "Content-Type": "application/json"},
                            content=b" " * (MAX_REQUEST_BYTES + 1))
        assert large.status_code == 413
        for _ in range(data_import_local.MAX_ATTEMPTS - 2):
            assert client.post(PROFILE, headers=HEADERS, json={"document": document()}).status_code == 200
        limited = client.post(PROFILE, headers=HEADERS, json={"document": document()})
        assert limited.status_code == 429
        assert limited.headers["retry-after"] == "60"
        assert client.get("/api/health").status_code == 200


def test_concurrent_upload_has_deadline_and_does_not_hold_gate(local_app, monkeypatch):
    monkeypatch.setattr(data_import_local, "UPLOAD_SECONDS", 0.25)

    async def exercise():
        started = asyncio.Event()

        async def slow_body():
            started.set()
            await asyncio.sleep(10)
            yield b"{}"

        transport = httpx.ASGITransport(app=local_app, client=("127.0.0.1", 40400))
        async with httpx.AsyncClient(transport=transport, base_url=ORIGIN) as client:
            uploading = asyncio.create_task(client.post(
                PROFILE, headers={**HEADERS, "Content-Type": "application/json"}, content=slow_body()
            ))
            await asyncio.wait_for(started.wait(), 2)
            parallel = await client.post(PROFILE, headers=HEADERS, json={"document": document()})
            assert parallel.status_code == 429
            assert parallel.headers["retry-after"] == "1"
            assert (await asyncio.wait_for(uploading, 2)).status_code == 408
            assert (await client.post(PROFILE, headers=HEADERS, json={"document": document()})).status_code == 200

    asyncio.run(exercise())


def test_profile_xls_and_ambiguous_mapping(local_app):
    legacy = document()
    legacy["filename"] = "fixture.xls"
    legacy["content_base64"] = (Path(__file__).parent / "fixtures" / "tabular_synthetic.xls.b64").read_text().strip()
    ambiguous = document(b"codlog,nome,logradouro\n01,Rua Alfa,Rua Beta\n", "official_claimed")
    with browser_client(local_app) as client:
        xls = client.post(PROFILE, headers=HEADERS, json={"document": legacy})
        assert xls.status_code == 200, xls.text
        assert xls.json()["provenance"]["format"] == "xls"
        response = client.post(PROFILE, headers=HEADERS, json={"document": ambiguous})
        assert response.status_code == 422
        assert response.json()["detail"] == "ambiguous_column_mapping_requires_explicit_choice"
        ambiguous["mapping"] = {"name": "logradouro"}
        mapped = client.post(PROFILE, headers=HEADERS, json={"document": ambiguous}).json()
        assert mapped["field_mapping"]["name"] == "logradouro"
        assert mapped["provenance"]["verification"] == "UNVERIFIED"
        assert mapped["official_validity"] == "UNKNOWN"


def test_compare_human_review_recomputes_report(local_app):
    pair = {"left": document(), "right": document(b"codlog,nome\n01,Rua Beta\n")}
    with browser_client(local_app) as client:
        comparison = client.post(PREFIX + "/compare", headers=HEADERS, json=pair)
        assert comparison.status_code == 200
        report = comparison.json()
        assert report["metrics"]["conflict"] == 1
        assert report["sources"][0]["provenance"]["verification"] == "SYNTHETIC"
        assert report["review_queue"][0]["left_rows"] == [2]
        request = {**pair, "report_id": report["report_id"], "decisions": [
            {"item_id": report["review_queue"][0]["item_id"], "resolution": "ACKNOWLEDGED_DIFFERENCE"}
        ]}
        receipt = client.post(PREFIX + "/review", headers=HEADERS, json=request)
        assert receipt.status_code == 200
        reviewed = receipt.json()
        assert reviewed["review_receipt"]["persistence"] == "NONE_EXPORT_ONLY"
        assert reviewed["review_receipt"]["actor_identity_verified"] is False
        assert reviewed["review_summary"]["acknowledged"] == 1
        for field in ("report_id", "metrics", "official_validity", "quality_status", "writes_performed"):
            assert reviewed[field] == report[field]
        request["right"] = document(b"codlog,nome\n01,Rua Gama\n")
        stale = client.post(PREFIX + "/review", headers=HEADERS, json=request)
        assert stale.status_code == 422
        assert stale.json()["detail"] == "stale_or_different_report"
