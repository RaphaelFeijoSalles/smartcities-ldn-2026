import csv

import pytest

from app.adapters.cnes import CnesAdapter
from app.adapters.csv_adapter import CsvAdapter
from app.adapters.siglon import SiglonAdapter


@pytest.mark.parametrize("source", ["SIGLON", "CNES", "CSV"])
@pytest.mark.parametrize(
    "latitude,longitude,expected",
    [
        (-23.3, None, (None, None)),
        (None, -51.2, (None, None)),
        (None, None, (None, None)),
        (-23.3, -51.2, (-23.3, -51.2)),
        ("invalid", -51.2, (None, None)),
        (-23.3, "invalid", (None, None)),
        ("", -51.2, (None, None)),
        (-23.3, "", (None, None)),
        ("NaN", -51.2, (None, None)),
        (-23.3, "Infinity", (None, None)),
        (91, -51.2, (None, None)),
        (-23.3, -181, (None, None)),
        (0, 0, (0.0, 0.0)),
        (-90, 180, (-90.0, 180.0)),
    ],
)
def test_coordinates_are_complete_and_raw_values_preserved(source, latitude, longitude, expected, tmp_path):
    if source == "SIGLON":
        raw = {"attributes": {"OBJECTID_1": 1, "UBS": "SINTÉTICO"},
               "geometry": {"y": latitude, "x": longitude}}
        record = SiglonAdapter()._normalize(raw, "2026-11-14T18:00:00+00:00")
        assert record.original == raw
    elif source == "CNES":
        raw = {"codigo_cnes": 1, "nome_fantasia": "SINTÉTICO",
               "latitude_estabelecimento_decimo_grau": latitude,
               "longitude_estabelecimento_decimo_grau": longitude}
        record = CnesAdapter()._normalize(raw, "2026-11-14T18:00:00+00:00")
        assert record.original == raw
    else:
        path = tmp_path / "synthetic.csv"
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["source", "source_id", "name", "latitude", "longitude"])
            writer.writerow(["CSV", "1", "SINTÉTICO", latitude, longitude])
        result = CsvAdapter(path).fetch()
        assert len(result.records) == 1
        record = result.records[0]
        assert record.original["latitude"] == ("" if latitude is None else str(latitude))
        assert record.original["longitude"] == ("" if longitude is None else str(longitude))
    assert (record.latitude, record.longitude) == expected
    payload = record.source_payload()
    assert (payload["latitude"], payload["longitude"]) == expected
    assert (payload["normalized"]["latitude"], payload["normalized"]["longitude"]) == expected
