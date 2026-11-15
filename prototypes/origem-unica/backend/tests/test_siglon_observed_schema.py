"""Observed public metadata; all inventory IDs and street rows below are SYNTHETIC."""
import hashlib
import json
from pathlib import Path

import httpx
import pytest

from app.adapters.siglon_streets import SiglonStreetsAdapter
from app.tabular_import import ImportRejected

FIXTURES = Path(__file__).parent / 'fixtures/siglon-public-20261115'


def test_observed_metadata_integrity_and_public_fields():
    raw = (FIXTURES / 'metadata.json').read_bytes()
    manifest = json.loads((FIXTURES / 'manifest.json').read_text())
    assert hashlib.sha256(raw).hexdigest() == manifest['sha256']
    assert len(raw) == manifest['bytes']
    metadata = json.loads(raw)
    fields = {field['name']: field for field in metadata['fields']}
    assert metadata['objectIdField'] == 'OBJECTID'
    assert fields['OBJECTID']['type'] == 'esriFieldTypeOID'
    assert all(fields[name]['type'] == 'esriFieldTypeString'
               for name in ('NOME', 'CODLOG', 'LEI', 'LOCALIDADE'))
    assert manifest['reference_date'] is None


@pytest.mark.parametrize('failure', [None, 'timeout', 'truncated'])
def test_existing_adapter_with_observed_schema_and_synthetic_records(failure):
    metadata = json.loads((FIXTURES / 'metadata.json').read_text())
    calls = []

    def respond(request):
        calls.append(request)
        if not request.url.path.endswith('/query'):
            return httpx.Response(200, json=metadata)
        if request.url.params.get('returnIdsOnly'):
            if failure == 'timeout':
                raise httpx.ReadTimeout('SYNTHETIC timeout', request=request)
            return httpx.Response(200, json={'objectIds': [900001]})
        assert request.url.params['returnGeometry'] == 'false'
        selected = request.url.params['outFields'].split(',')
        assert set(selected) == {'OBJECTID', 'CODLOG', 'NOME', 'LOCALIDADE', 'LEI'}
        assert 'SE_ANNO_CAD_DATA' not in selected
        return httpx.Response(200, json={
            'features': [{'attributes': {'OBJECTID': 900001, 'CODLOG': 'SYNTHETIC-001',
                'NOME': 'Via SINTÉTICA', 'LOCALIDADE': 'SINTÉTICA', 'LEI': None}}],
            'exceededTransferLimit': failure == 'truncated',
        })

    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        adapter = SiglonStreetsAdapter(client)
        if failure:
            with pytest.raises(ImportRejected):
                adapter.fetch(reference_date='2026-11-15', selected_ids=[900001])
            assert len(calls) == (2 if failure == 'timeout' else 3)
        else:
            table, provenance, lineage = adapter.fetch(
                reference_date='2026-11-15', selected_ids=[900001])
            assert len(table.rows) == 1
            assert table.rows[0]['LEI'] == ''
            assert table.rows[0]['NOME'] == 'Via SINTÉTICA'
            assert provenance['classification'] == 'official_claimed'
            assert lineage['reference_date_basis'] == 'operator_declared_not_verified_by_adapter'
            assert lineage['scope'] == 'explicit_object_id_subset'
