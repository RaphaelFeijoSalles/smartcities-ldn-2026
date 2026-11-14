from __future__ import annotations

from typing import Any
from urllib.parse import urlencode

from app.adapters.base import SourceAdapter, utc_now
from app.models import AdapterResult, NormalizedRecord


class SiglonAdapter(SourceAdapter):
    source = "SIGLON"
    layer_url = (
        "https://geo.londrina.pr.gov.br/server/rest/services/Publico/"
        "SaudeUnidadesBasicasAbrangenciaPublico/MapServer/0"
    )
    data_origin = f"{layer_url}/query"

    def __init__(self, timeout: float = 20.0) -> None:
        super().__init__(timeout=timeout)

    def fetch(self) -> AdapterResult:
        query = urlencode(
            {
                "where": "1=1",
                "outFields": "OBJECTID_1,OBJECTID,UBS,NOME,ENDEREÇO,TELEFONE",
                "returnGeometry": "true",
                "outSR": "4326",
                "resultRecordCount": "2000",
                "f": "json",
            }
        )
        payload = self._get_json(f"{self.data_origin}?{query}")
        if payload.get("error"):
            raise RuntimeError(f"SIGLON ArcGIS error: {payload['error']}")

        fetched_at = utc_now()
        records = [self._normalize(feature, fetched_at) for feature in payload.get("features", [])]
        if not records:
            raise RuntimeError("SIGLON returned no features")
        return AdapterResult(
            source=self.source,
            records=records,
            status="LIVE",
            fetched_at=fetched_at,
            data_origin=self.data_origin,
        )

    def _normalize(self, feature: dict[str, Any], fetched_at: str) -> NormalizedRecord:
        attributes = feature.get("attributes") or {}
        geometry = feature.get("geometry") or {}
        source_id = attributes.get("OBJECTID_1") or attributes.get("OBJECTID")
        return NormalizedRecord(
            source=self.source,
            source_id=str(source_id),
            name=_clean(attributes.get("UBS")) or "Unidade sem nome",
            address=_clean(attributes.get("ENDEREÇO")),
            phone=_clean(attributes.get("TELEFONE")),
            latitude=_float_or_none(geometry.get("y")),
            longitude=_float_or_none(geometry.get("x")),
            fetched_at=fetched_at,
            data_origin=self.data_origin,
            original={"attributes": attributes, "geometry": geometry},
        )


def _clean(value: Any) -> str | None:
    if value is None:
        return None
    cleaned = " ".join(str(value).replace("\u00a0", " ").split())
    return cleaned or None


def _float_or_none(value: Any) -> float | None:
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None
