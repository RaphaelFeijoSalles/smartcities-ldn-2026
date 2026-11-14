"""Tests are local and synthetic; no camera, external API, or AI model is run."""
import pytest
from fastapi.testclient import TestClient

from prototypes.ecovisao.api import main as service


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(service, "DB_PATH", tmp_path / "test.sqlite")
    with TestClient(service.app) as c:
        yield c


def test_health_discloses_no_model_execution(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["detector"] == "NOT_RUN"
    assert r.json()["mode"] == "DEMO_SYNTHETIC"


def test_initial_events_and_metrics_are_synthetic(client):
    r = client.get("/api/ocorrencias")
    assert r.status_code == 200
    assert len(r.json()["items"]) == 3
    assert all(item["source_kind"] == "DEMO_SYNTHETIC" for item in r.json()["items"])
    assert all(item["location_source"] == "DEMO_SYNTHETIC" for item in r.json()["items"])
    metrics = client.get("/api/metricas").json()
    assert metrics["total_candidates"] == 3
    assert metrics["pending_review"] == 3
    assert metrics["confirmed_for_inspection"] == 0


def test_review_requires_human_and_changes_counters(client):
    r = client.patch("/api/ocorrencias/1/review", json={
        "status": "CONFIRMED_FOR_INSPECTION",
        "note": "Demonstração: validar em campo",
    })
    assert r.status_code == 200
    assert r.json()["status"] == "CONFIRMED_FOR_INSPECTION"
    counters = client.get("/api/metricas").json()
    assert counters["confirmed_for_inspection"] == 1
    assert counters["pending_review"] == 2


def test_rejection_is_not_an_infraction_or_fine(client):
    r = client.patch("/api/ocorrencias/2/review", json={
        "status": "REJECTED", "note": "Simulação de falso positivo",
    })
    assert r.status_code == 200
    assert client.get("/api/metricas").json()["rejected"] == 1
    assert "autuacao" not in r.json()


def test_reject_real_sources_and_out_of_range_confidence(client):
    occurrence = client.get("/api/ocorrencias").json()["items"][0]
    for key in ("id", "status", "review_note"):
        occurrence.pop(key, None)
    occurrence["source_kind"] = "REAL_VIDEO"
    assert client.post("/api/ocorrencias", json=occurrence).status_code == 422
    occurrence["source_kind"] = "DEMO_SYNTHETIC"
    occurrence["confianca"] = 5.7
    assert client.post("/api/ocorrencias", json=occurrence).status_code == 422


def test_create_synthetic_event_and_missing_id(client):
    payload = {
        "bairro": "Setor fictício D",
        "latitude": -23.311,
        "longitude": -51.167,
        "timestamp": "2026-11-14T10:00:00-03:00",
        "confianca": 0.71,
    }
    response = client.post("/api/ocorrencias", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "PENDING_REVIEW"
    assert response.json()["location_source"] == "DEMO_SYNTHETIC"
    assert client.get("/api/metricas").json()["total_candidates"] == 4
    assert client.patch("/api/ocorrencias/999/review", json={
        "status": "REJECTED", "note": "Não existe",
    }).status_code == 404


def test_frontend_served(client):
    result = client.get("/")
    assert result.status_code == 200
    assert "EcoVisão" in result.text
