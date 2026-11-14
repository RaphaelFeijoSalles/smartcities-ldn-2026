from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.service import ReconciliationService


def create_app(service: ReconciliationService | None = None) -> FastAPI:
    app = FastAPI(
        title="Origem Única API",
        version="0.1.0",
        description="Conciliação somente leitura entre cadastros públicos de saúde.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4173"],
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["Accept", "Content-Type"],
    )
    app.state.reconciliation_service = service or ReconciliationService()

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "origem-unica-backend"}

    @app.get("/api/records")
    def records() -> dict[str, Any]:
        snapshot = app.state.reconciliation_service.snapshot()
        return {
            "mode": snapshot["mode"],
            "generated_at": snapshot["generated_at"],
            "items": snapshot["items"],
        }

    @app.get("/api/conflicts")
    def conflicts() -> dict[str, Any]:
        snapshot = app.state.reconciliation_service.snapshot()
        items = [item for item in snapshot["items"] if item["comparison_status"] == "CONFLICT"]
        return {
            "mode": snapshot["mode"],
            "generated_at": snapshot["generated_at"],
            "count": len(items),
            "items": items,
        }

    @app.get("/api/sources/status")
    def sources_status() -> dict[str, Any]:
        snapshot = app.state.reconciliation_service.snapshot()
        return {
            "mode": snapshot["mode"],
            "generated_at": snapshot["generated_at"],
            "sources": snapshot["sources"],
        }

    return app


app = create_app()
