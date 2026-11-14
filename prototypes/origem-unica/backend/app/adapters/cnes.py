from __future__ import annotations

from typing import Any
from urllib.parse import urlencode

from app.adapters.base import SourceAdapter, normalize_coordinates, utc_now
from app.models import AdapterResult, NormalizedRecord


class CnesAdapter(SourceAdapter):
    source = "CNES"
    data_origin = "https://apidadosabertos.saude.gov.br/cnes/estabelecimentos"

    def __init__(
        self,
        timeout: float = 10.0,
        municipality_code: int = 411370,
        page_size: int = 20,
        max_pages: int = 20,
    ) -> None:
        super().__init__(timeout=timeout)
        self.municipality_code = municipality_code
        self.page_size = page_size
        self.max_pages = max_pages

    def fetch(self) -> AdapterResult:
        fetched_at = utc_now()
        raw_records: list[dict[str, Any]] = []
        seen_ids: set[str] = set()

        for page in range(self.max_pages):
            query = urlencode(
                {
                    "codigo_tipo_unidade": 2,
                    "codigo_municipio": self.municipality_code,
                    "status": 1,
                    "limit": self.page_size,
                    "offset": page,
                }
            )
            payload = self._get_json(f"{self.data_origin}?{query}")
            page_records = payload.get("estabelecimentos") or []
            new_records = []
            for raw in page_records:
                source_id = str(raw.get("codigo_cnes") or "")
                if source_id and source_id not in seen_ids:
                    seen_ids.add(source_id)
                    new_records.append(raw)
            raw_records.extend(new_records)
            if len(page_records) < self.page_size:
                break
            if page_records and not new_records:
                raise RuntimeError("CNES pagination repeated a page")
        else:
            raise RuntimeError("CNES pagination exceeded safety limit")

        if not raw_records:
            raise RuntimeError("CNES returned no establishments")
        records = [self._normalize(raw, fetched_at) for raw in raw_records]
        return AdapterResult(
            source=self.source,
            records=records,
            status="LIVE",
            fetched_at=fetched_at,
            data_origin=self.data_origin,
        )

    def _normalize(self, raw: dict[str, Any], fetched_at: str) -> NormalizedRecord:
        source_id = str(raw.get("codigo_cnes") or raw.get("codigo_estabelecimento_saude") or "")
        address_parts = [
            raw.get("endereco_estabelecimento"),
            raw.get("numero_estabelecimento"),
            raw.get("bairro_estabelecimento"),
        ]
        address = ", ".join(_clean(part) for part in address_parts if _clean(part)) or None
        cep = _clean(raw.get("codigo_cep_estabelecimento"))
        if address and cep:
            address = f"{address} - CEP {cep}"
        identifiers = {"CNES": source_id} if source_id else {}
        long_id = _clean(raw.get("codigo_estabelecimento_saude"))
        if long_id:
            identifiers["CNES_LONG"] = long_id
        latitude, longitude = normalize_coordinates(
            raw.get("latitude_estabelecimento_decimo_grau"),
            raw.get("longitude_estabelecimento_decimo_grau"),
        )
        return NormalizedRecord(
            source=self.source,
            source_id=source_id,
            name=_clean(raw.get("nome_fantasia")) or _clean(raw.get("nome_razao_social")) or "Unidade sem nome",
            address=address,
            phone=_clean(raw.get("numero_telefone_estabelecimento")),
            latitude=latitude,
            longitude=longitude,
            fetched_at=fetched_at,
            data_origin=self.data_origin,
            original=raw,
            identifiers=identifiers,
        )


def _clean(value: Any) -> str | None:
    if value is None:
        return None
    cleaned = " ".join(str(value).split())
    return cleaned or None
