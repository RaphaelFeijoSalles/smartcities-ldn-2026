from __future__ import annotations

import hashlib
import math
import re
import unicodedata
from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Any

from app.models import NormalizedRecord


GENERIC_NAME_TOKENS = {"ubs", "unidade", "basica", "saude", "posto", "cs"}


@dataclass(frozen=True, slots=True)
class Candidate:
    left_index: int
    right_index: int
    score: float
    shared_identifier: bool
    exact_name: bool
    name_similarity: float
    address_similarity: float | None
    distance_meters: float | None


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    decomposed = unicodedata.normalize("NFKD", value)
    ascii_text = "".join(char for char in decomposed if not unicodedata.combining(char))
    return " ".join(re.sub(r"[^a-zA-Z0-9]+", " ", ascii_text).lower().split())


def name_key(value: str | None) -> str:
    tokens = [token for token in normalize_text(value).split() if token not in GENERIC_NAME_TOKENS]
    return " ".join(tokens)


def text_similarity(left: str | None, right: str | None, *, names: bool = False) -> float | None:
    left_value = name_key(left) if names else normalize_text(left)
    right_value = name_key(right) if names else normalize_text(right)
    if not left_value or not right_value:
        return None
    left_tokens = set(left_value.split())
    right_tokens = set(right_value.split())
    overlap = len(left_tokens & right_tokens)
    coverage = overlap / min(len(left_tokens), len(right_tokens))
    jaccard = overlap / len(left_tokens | right_tokens)
    sequence = SequenceMatcher(None, left_value, right_value).ratio()
    return round(max(sequence, (0.7 * coverage) + (0.3 * jaccard)), 4)


def haversine_meters(left: NormalizedRecord, right: NormalizedRecord) -> float | None:
    coordinates = (left.latitude, left.longitude, right.latitude, right.longitude)
    if any(value is None for value in coordinates):
        return None
    lat1, lon1, lat2, lon2 = (math.radians(float(value)) for value in coordinates)
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    return round(6_371_000 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


def reconcile(
    left_records: list[NormalizedRecord],
    right_records: list[NormalizedRecord],
) -> list[dict[str, Any]]:
    candidates: list[Candidate] = []
    for left_index, left in enumerate(left_records):
        for right_index, right in enumerate(right_records):
            candidate = _candidate(left_index, right_index, left, right)
            if candidate is not None:
                candidates.append(candidate)

    candidates.sort(
        key=lambda item: (item.shared_identifier, item.exact_name, item.score),
        reverse=True,
    )
    used_left: set[int] = set()
    used_right: set[int] = set()
    items: list[dict[str, Any]] = []

    for candidate in candidates:
        if candidate.left_index in used_left or candidate.right_index in used_right:
            continue
        left = left_records[candidate.left_index]
        right = right_records[candidate.right_index]
        used_left.add(candidate.left_index)
        used_right.add(candidate.right_index)
        items.append(_paired_item(left, right, candidate))

    items.extend(
        _single_item(record, "ONLY_IN_A")
        for index, record in enumerate(left_records)
        if index not in used_left
    )
    items.extend(
        _single_item(record, "ONLY_IN_B")
        for index, record in enumerate(right_records)
        if index not in used_right
    )
    return sorted(items, key=lambda item: (item["comparison_status"], item["name"], item["id"]))


def _candidate(
    left_index: int,
    right_index: int,
    left: NormalizedRecord,
    right: NormalizedRecord,
) -> Candidate | None:
    # Never suggest that a fabricated unit reconciles with an official unit.
    if left.data_origin.startswith("MOCK:") != right.data_origin.startswith("MOCK:"):
        return None
    shared_identifier = bool(
        set(left.identifiers) & set(right.identifiers)
        and any(
            left.identifiers[key] == right.identifiers[key]
            for key in set(left.identifiers) & set(right.identifiers)
        )
    )
    left_name = name_key(left.name)
    right_name = name_key(right.name)
    exact_name = bool(left_name and left_name == right_name)
    name_similarity = text_similarity(left.name, right.name, names=True) or 0.0
    address_similarity = text_similarity(left.address, right.address)
    distance = haversine_meters(left, right)

    evidence = shared_identifier or exact_name or (
        name_similarity >= 0.72
        and ((address_similarity or 0.0) >= 0.62 or (distance is not None and distance <= 500))
    )
    if not evidence:
        return None

    components: list[tuple[float, float]] = [(name_similarity, 0.45)]
    if address_similarity is not None:
        components.append((address_similarity, 0.35))
    if distance is not None:
        geo_score = max(0.0, 1.0 - (distance / 1000.0))
        components.append((geo_score, 0.20))
    score = sum(value * weight for value, weight in components) / sum(weight for _, weight in components)
    if shared_identifier:
        score = max(score, 0.99)
    return Candidate(
        left_index=left_index,
        right_index=right_index,
        score=round(score, 4),
        shared_identifier=shared_identifier,
        exact_name=exact_name,
        name_similarity=name_similarity,
        address_similarity=address_similarity,
        distance_meters=distance,
    )


def _paired_item(
    left: NormalizedRecord,
    right: NormalizedRecord,
    candidate: Candidate,
) -> dict[str, Any]:
    conflicts = _conflicts(left, right, candidate)
    if candidate.shared_identifier or candidate.exact_name:
        if conflicts:
            status = "CONFLICT"
        elif candidate.shared_identifier or candidate.address_similarity == 1.0 or (
            candidate.distance_meters is not None and candidate.distance_meters <= 150
        ):
            status = "MATCH"
        else:
            status = "POSSIBLE_MATCH"
    else:
        status = "POSSIBLE_MATCH"
    return {
        "id": _stable_id(left, right),
        "name": left.name or right.name,
        "comparison_status": status,
        "score": candidate.score,
        "evidence": {
            "shared_identifier": candidate.shared_identifier,
            "exact_normalized_name": candidate.exact_name,
            "name_similarity": candidate.name_similarity,
            "address_similarity": candidate.address_similarity,
            "distance_meters": candidate.distance_meters,
            "notice": "Score heurístico não substitui validação humana.",
        },
        "sources": [left.source_payload(), right.source_payload()],
        "conflicts": conflicts,
    }


def _conflicts(
    left: NormalizedRecord,
    right: NormalizedRecord,
    candidate: Candidate,
) -> list[dict[str, Any]]:
    conflicts: list[dict[str, Any]] = []
    if left.address and right.address and (candidate.address_similarity or 0.0) < 0.68:
        conflicts.append(_conflict("address", left, right, left.address, right.address))
    left_phone = re.sub(r"\D", "", left.phone or "")
    right_phone = re.sub(r"\D", "", right.phone or "")
    if left_phone and right_phone and left_phone != right_phone:
        conflicts.append(_conflict("phone", left, right, left.phone, right.phone))
    if candidate.distance_meters is not None and candidate.distance_meters > 500:
        conflicts.append(
            _conflict(
                "coordinates",
                left,
                right,
                {"latitude": left.latitude, "longitude": left.longitude},
                {"latitude": right.latitude, "longitude": right.longitude},
            )
        )
    return conflicts


def _conflict(
    field: str,
    left: NormalizedRecord,
    right: NormalizedRecord,
    left_value: Any,
    right_value: Any,
) -> dict[str, Any]:
    return {"field": field, "values": {left.source: left_value, right.source: right_value}}


def _single_item(record: NormalizedRecord, status: str) -> dict[str, Any]:
    return {
        "id": _stable_id(record),
        "name": record.name,
        "comparison_status": status,
        "score": None,
        "evidence": {"notice": "Sem candidato determinístico na outra fonte."},
        "sources": [record.source_payload()],
        "conflicts": [],
    }


def _stable_id(*records: NormalizedRecord) -> str:
    value = "|".join(sorted(f"{record.source}:{record.source_id}" for record in records))
    return f"record-{hashlib.sha1(value.encode('utf-8')).hexdigest()[:12]}"  # noqa: S324 - non-security id
