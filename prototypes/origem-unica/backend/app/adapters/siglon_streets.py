"""Versioned, bounded SIGLON reader. Tests are synthetic; no automatic fallback."""
from __future__ import annotations

import csv
import hashlib
import io
import json
from datetime import datetime, timezone

import httpx

from app.data_quality import canonical_header
from app.tabular_import import MAX_BYTES, MAX_ROWS, ImportRejected, SCHEMAS, read_table

LAYER_URL = 'https://geo.londrina.pr.gov.br/server/rest/services/Publico/SmopArruamento/FeatureServer/0'
VERSION = 'siglon-streets-v1'
MAX_RESPONSE_BYTES = 2 * MAX_BYTES


class SiglonStreetsAdapter:
    def __init__(self, client: httpx.Client | None = None):
        self.client = client

    def _json(self, client, url, params, budget):
        try:
            with client.stream('GET', url, params=params, follow_redirects=False, timeout=12) as response:
                if response.status_code != 200:
                    raise ImportRejected('siglon_http_failure')
                body = bytearray()
                for chunk in response.iter_bytes():
                    if len(body) + len(chunk) > MAX_RESPONSE_BYTES:
                        raise ImportRejected('siglon_response_limit')
                    body.extend(chunk)
            budget[0] += len(body)
            if budget[0] > 4 * MAX_BYTES:
                raise ImportRejected('siglon_total_response_limit')
            result = json.loads(body)
            if not isinstance(result, dict) or result.get('error'):
                raise ImportRejected('siglon_invalid_response')
            return result, hashlib.sha256(body).hexdigest()
        except (httpx.HTTPError, ValueError) as exc:
            if isinstance(exc, ImportRejected):
                raise
            raise ImportRejected('siglon_unavailable_or_invalid_json') from exc

    def fetch(self, *, reference_date: str, selected_ids: list[int] | None = None):
        if self.client is None:
            with httpx.Client() as client:
                return self._fetch(client, reference_date, selected_ids)
        return self._fetch(self.client, reference_date, selected_ids)

    def _fetch(self, client, reference_date, selected_ids):
        budget = [0]
        metadata, metadata_hash = self._json(client, LAYER_URL, {'f': 'json'}, budget)
        fields = metadata.get('fields')
        if not isinstance(fields, list) or not fields or any(not isinstance(f, dict) or not isinstance(f.get('name'), str) for f in fields):
            raise ImportRejected('siglon_invalid_schema')
        oid = metadata.get('objectIdField')
        names = [f['name'] for f in fields]
        if oid not in names:
            raise ImportRejected('siglon_missing_object_id_field')
        mapping = {}
        for target, aliases in SCHEMAS['street_registry'].items():
            candidates = [name for name in names if canonical_header(name) in aliases]
            if len(candidates) > 1:
                raise ImportRejected('siglon_ambiguous_schema')
            if candidates:
                mapping[target] = candidates[0]
        if not {'codlog', 'name'} <= mapping.keys():
            raise ImportRejected('siglon_required_fields_missing')
        ids_data, ids_hash = self._json(client, LAYER_URL + '/query', {'f': 'json', 'where': '1=1', 'returnIdsOnly': 'true'}, budget)
        ids = ids_data.get('objectIds')
        if ids_data.get('exceededTransferLimit') or not isinstance(ids, list) or any(type(v) is not int for v in ids) or len(set(ids)) != len(ids):
            raise ImportRejected('siglon_invalid_identity_inventory')
        scope = 'full_layer'
        if selected_ids is not None:
            if not isinstance(selected_ids, list) or any(type(v) is not int for v in selected_ids) or not selected_ids or len(set(selected_ids)) != len(selected_ids):
                raise ImportRejected('siglon_invalid_selection')
            if not set(selected_ids) <= set(ids):
                raise ImportRejected('siglon_selection_not_in_inventory')
            ids = selected_ids
            scope = 'explicit_object_id_subset'
        if not ids or len(ids) > MAX_ROWS:
            raise ImportRejected('siglon_scope_empty_or_exceeds_row_limit_select_subset')
        ids = sorted(ids)
        selected_fields = list(dict.fromkeys([oid, *mapping.values()]))
        pages, rows = [], []
        seen = set()
        for start in range(0, len(ids), 200):
            batch = ids[start:start + 200]
            page, digest = self._json(client, LAYER_URL + '/query', {
                'f': 'json', 'objectIds': ','.join(map(str, batch)),
                'outFields': ','.join(selected_fields), 'returnGeometry': 'false',
            }, budget)
            features = page.get('features')
            if page.get('exceededTransferLimit') or not isinstance(features, list):
                raise ImportRejected('siglon_truncated_page')
            received = set()
            for feature in features:
                attrs = feature.get('attributes') if isinstance(feature, dict) else None
                if not isinstance(attrs, dict) or set(selected_fields) - attrs.keys():
                    raise ImportRejected('siglon_invalid_feature')
                object_id = attrs[oid]
                if type(object_id) is not int or object_id not in batch or object_id in seen:
                    raise ImportRejected('siglon_unexpected_or_duplicate_object_id')
                if any(v is not None and not isinstance(v, (str, int, float)) for v in attrs.values()):
                    raise ImportRejected('siglon_non_scalar_attribute')
                seen.add(object_id)
                received.add(object_id)
                rows.append(attrs)
            if received != set(batch):
                raise ImportRejected('siglon_missing_requested_features')
            pages.append(digest)
        output = io.StringIO(newline='')
        writer = csv.writer(output)
        writer.writerow(mapping.values())
        for row in sorted(rows, key=lambda r: r[oid]):
            writer.writerow('' if row[field] is None else row[field] for field in mapping.values())
        table = read_table(output.getvalue().encode(), 'siglon-derived.csv')
        provenance = dict(name='SIGLON — Arruamento (extração pública)', url=LAYER_URL,
                          reference_date=reference_date, version=VERSION, classification='official_claimed',
                          nature='street_registry', namespace='BR:4113700:SIGLON:CODLOG')
        lineage = dict(adapter_version=VERSION, fetched_at=datetime.now(timezone.utc).isoformat(),
                       scope=scope, object_ids=ids, metadata_sha256=metadata_hash,
                       inventory_sha256=ids_hash, page_sha256=pages,
                       reference_date_basis='operator_declared_not_verified_by_adapter',
                       source_consistency='UNKNOWN: source may change between requests',
                       export_sha256=table.sha256)
        return table, provenance, lineage
