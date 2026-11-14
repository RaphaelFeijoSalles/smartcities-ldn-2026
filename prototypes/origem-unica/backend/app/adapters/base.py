from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import UTC, datetime
from typing import Any

import httpx

from app.models import AdapterResult


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


class SourceAdapter(ABC):
    source: str
    data_origin: str

    def __init__(self, timeout: float = 10.0) -> None:
        self.timeout = timeout

    @abstractmethod
    def fetch(self) -> AdapterResult:
        raise NotImplementedError

    def _get_json(self, url: str) -> dict[str, Any]:
        response = httpx.get(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "Origem-Unica-demo/0.1 (public-read-only)",
            },
            timeout=self.timeout,
            follow_redirects=True,
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise RuntimeError("Public source returned a non-object JSON response")
        return payload
