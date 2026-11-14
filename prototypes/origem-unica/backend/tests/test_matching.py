from app.matching import reconcile
from app.models import NormalizedRecord


def record(
    source: str,
    source_id: str,
    name: str,
    address: str | None = None,
    phone: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
) -> NormalizedRecord:
    return NormalizedRecord(
        source=source,
        source_id=source_id,
        name=name,
        address=address,
        phone=phone,
        latitude=latitude,
        longitude=longitude,
        fetched_at="2026-11-14T12:00:00+00:00",
        data_origin="TEST: synthetic fixture",
        original={"fixture": True},
    )


def test_exact_normalized_name_address_and_coordinates_match() -> None:
    left = record("SIGLON", "1", "UBS Centro", "Rua Souza Naves, 754", latitude=-23.319, longitude=-51.157)
    right = record("CNES", "2", "Centro", "Rua Souza Naves, 754", latitude=-23.319, longitude=-51.157)

    items = reconcile([left], [right])

    assert len(items) == 1
    assert items[0]["comparison_status"] == "MATCH"
    assert items[0]["conflicts"] == []


def test_same_name_with_conflicting_address_is_conflict() -> None:
    left = record("SIGLON", "1", "UBS Norte", "Rua A, 10", latitude=-23.20, longitude=-51.10)
    right = record("CNES", "2", "UBS Norte", "Rua B, 999", latitude=-23.30, longitude=-51.20)

    item = reconcile([left], [right])[0]

    assert item["comparison_status"] == "CONFLICT"
    assert {conflict["field"] for conflict in item["conflicts"]} == {"address", "coordinates"}


def test_missing_information_is_not_invented_or_reported_as_conflict() -> None:
    left = record("SIGLON", "1", "UBS Sul", None, None, latitude=-23.3, longitude=-51.2)
    right = record("CNES", "2", "UBS Sul", "Rua Existente, 20", "4330000000", latitude=-23.3, longitude=-51.2)

    item = reconcile([left], [right])[0]

    assert item["comparison_status"] == "MATCH"
    assert item["conflicts"] == []
    assert item["sources"][0]["address"] is None
    assert item["sources"][0]["phone"] is None


def test_one_record_cannot_be_matched_twice() -> None:
    left = [
        record("SIGLON", "1", "UBS Leste", "Rua Um, 1", latitude=-23.1, longitude=-51.1),
        record("SIGLON", "2", "UBS Leste", "Rua Um, 1", latitude=-23.1, longitude=-51.1),
    ]
    right = [record("CNES", "3", "UBS Leste", "Rua Um, 1", latitude=-23.1, longitude=-51.1)]

    items = reconcile(left, right)

    paired = [item for item in items if len(item["sources"]) == 2]
    only_left = [item for item in items if item["comparison_status"] == "ONLY_IN_A"]
    assert len(paired) == 1
    assert len(only_left) == 1
