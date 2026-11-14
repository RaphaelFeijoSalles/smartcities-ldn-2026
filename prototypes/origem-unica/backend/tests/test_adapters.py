from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pytest

from app.adapters.cnes import CnesAdapter
from app.adapters.csv_adapter import CsvAdapter
from app.adapters.siglon import SiglonAdapter


def test_siglon_maps_inspected_real_schema(monkeypatch) -> None:
    adapter = SiglonAdapter()
    monkeypatch.setattr(
        adapter,
        "_get_json",
        lambda _: {
            "features": [
                {
                    "attributes": {
                        "OBJECTID_1": 48,
                        "UBS": "Centro",
                        "NOME": "Clair Pavan",
                        "ENDEREÇO": "Rua Souza Naves, 754",
                        "TELEFONE": "(43) 3379-0871",
                    },
                    "geometry": {"x": -51.1578, "y": -23.3190},
                }
            ]
        },
    )

    result = adapter.fetch()

    assert result.status == "LIVE"
    assert result.records[0].source_id == "48"
    assert result.records[0].name == "Centro"
    assert result.records[0].longitude == -51.1578


def test_cnes_maps_inspected_real_schema(monkeypatch) -> None:
    adapter = CnesAdapter(page_size=20)
    monkeypatch.setattr(
        adapter,
        "_get_json",
        lambda _: {
            "estabelecimentos": [
                {
                    "codigo_cnes": 2577712,
                    "nome_fantasia": "UBS CENTRO CLAIR APARECIDA PAVAN",
                    "endereco_estabelecimento": "RUA SOUZA NAVES",
                    "numero_estabelecimento": "754",
                    "bairro_estabelecimento": "CENTRO",
                    "numero_telefone_estabelecimento": "(43)33790871",
                    "latitude_estabelecimento_decimo_grau": -23.31906,
                    "longitude_estabelecimento_decimo_grau": -51.15683,
                }
            ]
        },
    )

    result = adapter.fetch()

    assert result.records[0].source_id == "2577712"
    assert result.records[0].identifiers == {"CNES": "2577712"}
    assert result.records[0].address == "RUA SOUZA NAVES, 754, CENTRO"


def test_csv_adapter_marks_fixture_as_mock(tmp_path: Path) -> None:
    fixture = tmp_path / "fixture.csv"
    fixture.write_text(
        "source,source_id,name,address,phone,latitude,longitude\n"
        "SIGLON,X1,UNIDADE MOCK,,,,\n",
        encoding="utf-8",
    )

    result = CsvAdapter(fixture, "SIGLON").fetch()

    assert result.status == "MOCK"
    assert result.records[0].data_origin.startswith("MOCK:")
    assert result.records[0].original["fixture_notice"] == "SINTÉTICO / MOCK"


def test_siglon_rejects_truncated_dataset(monkeypatch):
    adapter = SiglonAdapter()
    monkeypatch.setattr(adapter, "_get_json", lambda _: {"exceededTransferLimit": True, "features": []})
    with pytest.raises(RuntimeError, match="truncated"):
        adapter.fetch()


def test_cnes_pagination_collects_unique_records(monkeypatch):
    adapter = CnesAdapter(page_size=2)
    offsets = []

    def get_page(url):
        query = parse_qs(urlparse(url).query)
        offsets.append(int(query["offset"][0]))
        assert query["codigo_municipio"] == ["411370"]
        ids = [1, 2] if offsets[-1] == 0 else [3]
        return {"estabelecimentos": [{"codigo_cnes": i, "nome_fantasia": "SINTÉTICO"} for i in ids]}

    monkeypatch.setattr(adapter, "_get_json", get_page)
    assert [r.source_id for r in adapter.fetch().records] == ["1", "2", "3"]
    assert offsets == [0, 1]


def test_cnes_repeated_page_triggers_fallback_instead_of_partial_success(monkeypatch):
    adapter = CnesAdapter(page_size=1)
    monkeypatch.setattr(adapter, "_get_json", lambda _: {"estabelecimentos": [{"codigo_cnes": 1}]})
    with pytest.raises(RuntimeError, match="repeated"):
        adapter.fetch()
