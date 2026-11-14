from __future__ import annotations

import csv
from pathlib import Path

from app.adapters.base import SourceAdapter, normalize_coordinates, utc_now
from app.models import AdapterResult, NormalizedRecord


class CsvAdapter(SourceAdapter):
    """Independent local CSV adapter, also used as the explicit demo fallback."""

    def __init__(self, path: Path, source_filter: str | None = None) -> None:
        super().__init__(timeout=0)
        self.path = path
        self.source_filter = source_filter
        self.source = source_filter or "CSV"
        self.data_origin = f"MOCK:file://{path.name}"

    def fetch(self) -> AdapterResult:
        fetched_at = utc_now()
        records: list[NormalizedRecord] = []
        with self.path.open(encoding="utf-8", newline="") as handle:
            for row in csv.DictReader(handle):
                source = (row.get("source") or "CSV").strip()
                if self.source_filter and source != self.source_filter:
                    continue
                latitude, longitude = normalize_coordinates(row.get("latitude"), row.get("longitude"))
                records.append(
                    NormalizedRecord(
                        source=source,
                        source_id=(row.get("source_id") or "").strip(),
                        name=(row.get("name") or "Unidade MOCK sem nome").strip(),
                        address=_none_if_blank(row.get("address")),
                        phone=_none_if_blank(row.get("phone")),
                        latitude=latitude,
                        longitude=longitude,
                        fetched_at=fetched_at,
                        data_origin="MOCK: fixture sintética local; não representa cadastro real",
                        original={**row, "fixture_notice": "SINTÉTICO / MOCK"},
                    )
                )
        if not records:
            raise RuntimeError(f"CSV has no records for {self.source}")
        return AdapterResult(
            source=self.source,
            records=records,
            status="MOCK",
            fetched_at=fetched_at,
            data_origin=self.data_origin,
        )


def _none_if_blank(value: str | None) -> str | None:
    cleaned = (value or "").strip()
    return cleaned or None
