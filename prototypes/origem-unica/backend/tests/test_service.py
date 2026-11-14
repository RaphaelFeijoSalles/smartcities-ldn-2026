from dataclasses import replace

from fastapi.testclient import TestClient

from app.adapters.csv_adapter import CsvAdapter
from app.main import create_app
from app.service import ReconciliationService


class FailedSource:
    source = "SIGLON"

    def fetch(self):
        raise TimeoutError("source unavailable")


def test_http_fallback_keeps_real_provenance_and_does_not_match_mock():
    service = ReconciliationService()
    fixture = CsvAdapter(service.fallback_csv, "SIGLON").fetch()
    synthetic = fixture.records[0]

    class LiveSource:
        source = "CNES"
        calls = 0

        def fetch(self):
            self.calls += 1
            return replace(
                fixture, source="CNES", status="LIVE", data_origin="https://example.org/cnes",
                records=[replace(synthetic, source="CNES", data_origin="https://example.org/cnes")],
            )

    live = LiveSource()
    service.adapters = [FailedSource(), live]
    with TestClient(create_app(service)) as client:
        response = client.get("/api/records", headers={"Origin": "http://localhost:4173"})
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == "http://localhost:4173"
        payload = response.json()
        assert payload["mode"] == "MOCK"
        assert all(len(item["sources"]) == 1 for item in payload["items"])
        assert all(item["score"] is None for item in payload["items"])
        statuses = client.get("/api/sources/status").json()["sources"]
        assert statuses[0]["status"] == "FALLBACK"
        assert "TimeoutError" in statuses[0]["error"]
        assert statuses[1]["status"] == "LIVE"
        assert live.calls == 1
        assert client.get("/api/conflicts").json()["count"] == 0


def test_both_sources_unavailable_still_returns_http_records():
    other = FailedSource()
    other.source = "CNES"
    with TestClient(create_app(ReconciliationService(adapters=[FailedSource(), other]))) as client:
        response = client.get("/api/records")
        assert response.status_code == 200
        assert response.json()["mode"] == "MOCK"
        assert response.json()["items"]
        assert all(
            source["data_origin"].startswith("MOCK:")
            for item in response.json()["items"] for source in item["sources"]
        )


def test_explicit_offline_demo_never_uses_network(monkeypatch):
    monkeypatch.setenv("ORIGEM_UNICA_MOCK", "1")
    service = ReconciliationService()
    assert all(isinstance(adapter, CsvAdapter) for adapter in service.adapters)
    with TestClient(create_app(service)) as client:
        assert client.get("/api/records").json()["mode"] == "MOCK"
        assert all(s["status"] == "MOCK" for s in client.get("/api/sources/status").json()["sources"])
