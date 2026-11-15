"""Bounded public tabular input. No network, persistence or official attestation."""
from __future__ import annotations

import csv
import hashlib
import io
import math
import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path, PurePath
from typing import Any
from urllib.parse import urlsplit

from app.data_quality import canonical_header, profile_rows

MAX_BYTES = 1_048_576
MAX_ROWS = 5000
MAX_COLUMNS = 64
MAX_CELL = 2048
ADAPTER_VERSION = 'tabular-v1.1'
SCHEMAS = {
    'street_registry': {
        'codlog': ('codlog', 'codigo_logradouro', 'codigo_do_logradouro'),
        'name': ('nome', 'nome_logradouro', 'nome_do_logradouro', 'logradouro'),
        'locality': ('localidade', 'distrito'),
        'law': ('lei', 'lei_denominacao'),
    },
    'housing_status': {
        'ibge_code': ('codigo_ibge', 'coibge', 'cod_ibge'),
        'municipality': ('municipio', 'nome_municipio'),
        'uf': ('uf',),
        'status': ('situacao_municipio', 'situacao', 'status'),
    },
}


class ImportRejected(ValueError):
    """Safe error with no source values."""


@dataclass(frozen=True)
class Table:
    headers: list[str]
    rows: list[dict[str, Any]]
    sha256: str
    format: str


def _table(matrix, payload: bytes, fmt: str) -> Table:
    iterator = iter(matrix)
    original = next(iterator, None)
    if original is None:
        raise ImportRejected('empty_file')
    if not 1 <= len(original) <= MAX_COLUMNS:
        raise ImportRejected('column_limit')
    if any(not isinstance(h, str) or not h.strip() or len(h) > 128 for h in original):
        raise ImportRejected('invalid_header')
    headers = list(original)
    forbidden = {'cpf', 'cnpj', 'nis', 'email', 'e_mail', 'telefone', 'nome_beneficiario', 'nome_completo'}
    if any(canonical_header(h) in forbidden for h in headers):
        raise ImportRejected('personal_or_sensitive_columns_not_supported')
    if len(set(headers)) != len(headers):
        raise ImportRejected('duplicate_original_headers')
    rows = []
    for values in iterator:
        if len(values) != len(headers):
            raise ImportRejected('ragged_row')
        if all(v is None or str(v).strip() == '' for v in values):
            continue
        if len(rows) >= MAX_ROWS:
            raise ImportRejected('row_limit')
        if any(len(str(v)) > MAX_CELL or isinstance(v, float) and not math.isfinite(v) for v in values):
            raise ImportRejected('invalid_cell')
        rows.append(dict(zip(headers, values)))
    if not rows:
        raise ImportRejected('no_data_rows')
    return Table(headers, rows, hashlib.sha256(payload).hexdigest(), fmt)


def read_table(payload: bytes, filename: str) -> Table:
    if not payload or len(payload) > MAX_BYTES:
        raise ImportRejected('file_size_limit')
    suffix = PurePath(filename).suffix.lower()
    if suffix == '.csv':
        try:
            text = payload.decode('utf-8-sig')
            if '\x00' in text:
                raise ImportRejected('invalid_csv_encoding')
            # Delimiter inference is bounded and restricted to common tabular separators.
            dialect = csv.Sniffer().sniff(text[:8192], delimiters=',;\t')
            return _table(csv.reader(io.StringIO(text, newline=''), dialect, strict=True), payload, 'csv')
        except (UnicodeError, csv.Error) as exc:
            raise ImportRejected('invalid_csv') from exc
    if suffix == '.xls':
        if not payload.startswith(bytes.fromhex('D0CF11E0A1B11AE1')):
            raise ImportRejected('invalid_xls_signature')
        try:
            worker = subprocess.run(
                [sys.executable, '-I', str(Path(__file__).with_name('xls_worker.py'))],
                input=payload, capture_output=True, timeout=6, check=False,
            )
            if worker.returncode or len(worker.stdout) > 4 * MAX_BYTES:
                raise ImportRejected('invalid_xls_or_resource_limit')
            result = json.loads(worker.stdout)
            if not isinstance(result, dict) or set(result) != {'rows'} or not isinstance(result['rows'], list):
                raise ImportRejected('invalid_xls_worker_result')
            return _table(result['rows'], payload, 'xls')
        except (OSError, subprocess.TimeoutExpired, ValueError) as exc:
            if isinstance(exc, ImportRejected):
                raise
            raise ImportRejected('invalid_xls_or_resource_limit') from exc
    raise ImportRejected('unsupported_format_use_csv_or_xls')


def provenance(metadata: dict, table: Table) -> dict:
    required = ('name', 'url', 'reference_date', 'version', 'classification', 'nature', 'namespace')
    if set(metadata) != set(required) or any(not isinstance(metadata[k], str) or not metadata[k].strip() or len(metadata[k]) > 512 for k in required):
        raise ImportRejected('invalid_provenance')
    if metadata['nature'] not in SCHEMAS or metadata['classification'] not in {'official_claimed', 'synthetic', 'unverified'}:
        raise ImportRejected('invalid_source_classification')
    try:
        parsed = urlsplit(metadata['url'])
    except ValueError as exc:
        raise ImportRejected('invalid_source_url') from exc
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.fragment:
        raise ImportRejected('invalid_source_url')
    try:
        date.fromisoformat(metadata['reference_date'])
    except ValueError as exc:
        raise ImportRejected('invalid_reference_date') from exc
    return {**metadata, 'verification': 'UNVERIFIED' if metadata['classification'] != 'synthetic' else 'SYNTHETIC',
            'sha256': table.sha256, 'adapter_version': ADAPTER_VERSION, 'format': table.format}


def column_mapping(table: Table, nature: str, explicit: dict[str, str] | None = None) -> dict[str, str]:
    schema = SCHEMAS[nature]
    explicit = {} if explicit is None else explicit
    if not isinstance(explicit, dict) or any(not isinstance(k, str) or not isinstance(v, str) or k not in schema or v not in table.headers for k, v in explicit.items()):
        raise ImportRejected('invalid_column_mapping')
    result = {}
    for field, aliases in schema.items():
        candidates = [h for h in table.headers if canonical_header(h) in aliases]
        if field in explicit:
            result[field] = explicit[field]
        elif len(candidates) == 1:
            result[field] = candidates[0]
        elif len(candidates) > 1:
            raise ImportRejected('ambiguous_column_mapping_requires_explicit_choice')
    if len(set(result.values())) != len(result):
        raise ImportRejected('mapping_reuses_column')
    return result


def identity_key(value):
    if value is None or isinstance(value, str) and not value.strip():
        return None
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def analyze(table: Table, metadata: dict, explicit: dict | None = None) -> tuple[dict, dict]:
    source = provenance(metadata, table)
    mapping = column_mapping(table, source['nature'], explicit)
    key = 'codlog' if source['nature'] == 'street_registry' else 'ibge_code'
    if key not in mapping:
        raise ImportRejected('required_identity_column_missing')
    profile_input = [{**row, mapping[key]: identity_key(row.get(mapping[key]))} for row in table.rows]
    profile = profile_rows(profile_input, source=source['name'], reference_date=source['reference_date'], key_fields=[mapping[key]])
    missing_cells = sum(profile['missing_by_column'].values())
    review = []
    for rule, count in [('INCOMPLETE_KEY', profile['incomplete_key_rows']), ('DUPLICATE_KEY', profile['duplicate_key_rows']),
                        ('MISSING_CELLS', missing_cells), ('HEADER_COLLISION', len(profile['header_collisions']))]:
        if count:
            review.append({'rule': rule, 'count': count, 'state': 'PENDING', 'action': 'human_review_only'})
    report = {'contract_version': '1', 'provenance': source, 'profile': profile, 'field_mapping': mapping,
              'review_queue': review, 'quality_status': 'FAIL' if review else 'PASS',
              'official_validity': 'UNKNOWN', 'writes_performed': False}
    return report, mapping
