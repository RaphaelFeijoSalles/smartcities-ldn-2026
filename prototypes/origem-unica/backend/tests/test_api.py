from app.main import create_app


class StubService:
    def snapshot(self):
        return {
            "mode": "MOCK",
            "generated_at": "2026-11-14T12:00:00+00:00",
            "items": [
                {
                    "id": "record-test",
                    "name": "UNIDADE SINTÉTICA",
                    "comparison_status": "CONFLICT",
                    "score": 0.8,
                    "sources": [],
                    "conflicts": [{"field": "address", "values": {}}],
                }
            ],
            "sources": [{"source": "SIGLON", "status": "FALLBACK", "count": 1}],
        }


def test_api_contract_and_local_cors() -> None:
    app = create_app(StubService())
    endpoints = {route.path: route.endpoint for route in app.routes if hasattr(route, "endpoint")}

    assert endpoints["/api/health"]()["status"] == "ok"
    assert endpoints["/api/records"]()["items"][0]["id"] == "record-test"
    assert endpoints["/api/conflicts"]()["count"] == 1
    assert endpoints["/api/sources/status"]()["sources"][0]["status"] == "FALLBACK"

    cors = next(middleware for middleware in app.user_middleware if middleware.cls.__name__ == "CORSMiddleware")
    assert cors.kwargs["allow_origins"] == ["http://localhost:4173"]
    assert cors.kwargs["allow_methods"] == ["GET"]
