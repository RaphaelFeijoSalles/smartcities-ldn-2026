"""Deterministic, privacy-minimising profile for a new tabular source.

This module does not infer legal validity, resolve records, or send data to AI.
It accepts already-loaded rows and returns aggregate diagnostics only.
"""
from __future__ import annotations

import re
import unicodedata
from collections import Counter
from collections.abc import Mapping, Sequence
from typing import Any


def canonical_header(value: str) -> str:
    """Canonical comparison key; never replaces the original header."""
    decomp = unicodedata.normalize("NFKD", value)
    plain = "".join(c for c in decomp if not unicodedata.combining(c))
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", plain.casefold())).strip("_")


def _missing(value: Any) -> bool:
    return value is None or isinstance(value, str) and not value.strip()


def profile_rows(
    rows: Sequence[Mapping[str, Any]],
    *,
    source: str,
    reference_date: str | None = None,
    key_fields: Sequence[str] = (),
) -> dict[str, Any]:
    """Return aggregate diagnostics only; never expose raw cell values.

    Complete identical keys count as duplicates beyond the first occurrence.
    Incomplete keys require review and are not automatically duplicates.
    """
    if not source.strip():
        raise ValueError("source is required for provenance")
    headers = list(dict.fromkeys(column for row in rows for column in row))
    if not all(isinstance(column, str) for column in headers):
        raise ValueError("column headers must be strings")
    if any(field not in headers for field in key_fields):
        raise ValueError("key_fields must exist in the input")

    normalized = {header: canonical_header(header) for header in headers}
    groups: dict[str, list[str]] = {}
    for original, canonical in normalized.items():
        groups.setdefault(canonical, []).append(original)
    collisions = {canonical: originals for canonical, originals in groups.items() if len(originals) > 1}

    missing = {header: sum(_missing(row.get(header)) for row in rows) for header in headers}
    seen: Counter[tuple[str, ...]] = Counter()
    incomplete = 0
    for row in rows:
        if not key_fields:
            continue
        values = tuple(row.get(field) for field in key_fields)
        if any(_missing(value) for value in values):
            incomplete += 1
            continue
        # Keep keys in memory only; no record values enter the report.
        seen[tuple(repr(value) for value in values)] += 1
    duplicates = sum(count - 1 for count in seen.values() if count > 1)
    return {
        "source": source,
        "reference_date": reference_date,
        "row_count": len(rows),
        "column_count": len(headers),
        "column_mapping": normalized,
        "header_collisions": collisions,
        "missing_by_column": missing,
        "key_fields": list(key_fields),
        "incomplete_key_rows": incomplete,
        "duplicate_key_rows": duplicates,
        "requires_human_review": bool(collisions or duplicates or incomplete),
        "notice": "Diagnóstico agregado, não constitui validação jurídica nem correção automática.",
    }
