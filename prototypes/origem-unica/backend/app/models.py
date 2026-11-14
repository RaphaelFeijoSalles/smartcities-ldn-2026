from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class NormalizedRecord:
    source: str
    source_id: str
    name: str
    address: str | None
    phone: str | None
    latitude: float | None
    longitude: float | None
    fetched_at: str
    data_origin: str
    original: dict[str, Any] = field(default_factory=dict)
    identifiers: dict[str, str] = field(default_factory=dict)

    def normalized_payload(self) -> dict[str, Any]:
        return {
            "source": self.source,
            "source_id": self.source_id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "fetched_at": self.fetched_at,
            "data_origin": self.data_origin,
        }

    def source_payload(self) -> dict[str, Any]:
        return {
            "system": self.source,
            "source_id": self.source_id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "fetched_at": self.fetched_at,
            "data_origin": self.data_origin,
            "normalized": self.normalized_payload(),
            "original": self.original,
        }


@dataclass(slots=True)
class AdapterResult:
    source: str
    records: list[NormalizedRecord]
    status: str
    fetched_at: str
    data_origin: str
    error: str | None = None

    def status_payload(self) -> dict[str, Any]:
        return {
            "source": self.source,
            "status": self.status,
            "count": len(self.records),
            "fetched_at": self.fetched_at,
            "data_origin": self.data_origin,
            "error": self.error,
        }
