from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import UTC, datetime
import math
from typing import Any

import httpx

from app.models import AdapterResult


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def normalize_coordinates(latitude: Any, longitude: Any) -> tuple[float | None, float | None]:
    """Only expose complete, finite WGS84 pairs; callers retain raw values."""
    if isinstance(latitude, bool) or isinstance(longitude, bool):
        return None, None
    try:
        lat, lon = float(latitude), float(longitude)
    except (TypeError, ValueError, OverflowError):
        return None, None
    if not (math.isfinite(lat) and math.isfinite(lon) and -90 <= lat <= 90 and -180 <= lon <= 180):
        return None, None
    return lat, lon


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
