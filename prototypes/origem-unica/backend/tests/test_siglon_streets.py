"""All ArcGIS payloads are SYNTHETIC, not observed municipal records."""
import httpx
import pytest
from app.adapters.siglon_streets import SiglonStreetsAdapter
from app.tabular_import import ImportRejected, analyze


def adapter(*, ids=None, features=None, metadata=None, truncate=False):
    calls = []
    def handler(request):
        calls.append(request)
        assert request.url.host == 'geo.londrina.pr.gov.br'
        assert request.url.params['f'] == 'json'
        if not request.url.path.endswith('/query'):
            payload = metadata if metadata is not None else {'objectIdField': 'OBJECTID', 'fields': [
                {'name': 'OBJECTID'}, {'name': 'CODLOG'}, {'name': 'NOME'}, {'name': 'LEI'}]}
        elif request.url.params.get('returnIdsOnly'):
            payload = {'objectIds': [1, 2] if ids is None else ids}
        else:
            assert request.url.params['returnGeometry'] == 'false'
            payload = {'features': features if features is not None else [
                {'attributes': {'OBJECTID': 2, 'CODLOG': '002', 'NOME': 'Viela SINTÉTICA', 'LEI': None}},
                {'attributes': {'OBJECTID': 1, 'CODLOG': None, 'NOME': 'Acesso SINTÉTICO', 'LEI': ''}}],
                'exceededTransferLimit': truncate}
        return httpx.Response(200, json=payload)
    return SiglonStreetsAdapter(httpx.Client(transport=httpx.MockTransport(handler))), calls


def test_mapping_provenance_and_legitimate_missing_values():
    source, calls = adapter()
    table, meta, lineage = source.fetch(reference_date='2026-11-14')
    report, _ = analyze(table, meta)
    assert report['profile']['incomplete_key_rows'] == 1
    assert report['profile']['row_count'] == 2
    assert report['provenance']['verification'] == 'UNVERIFIED'
    assert table.rows[0]['NOME'] == 'Acesso SINTÉTICO'
    assert lineage['scope'] == 'full_layer'
    assert lineage['source_consistency'].startswith('UNKNOWN')
    assert len(calls) == 3


@pytest.mark.parametrize('kwargs', [dict(ids=[1, 1]), dict(ids=['1']), dict(ids=[]), dict(ids=list(range(5001))),
    dict(truncate=True), dict(features=[]), dict(features=[{'attributes': {'OBJECTID': 3}}]), dict(metadata={'fields': []})])
def test_fail_closed_incomplete_schema_inventory_and_pages(kwargs):
    source, _ = adapter(**kwargs)
    with pytest.raises(ImportRejected):
        source.fetch(reference_date='2026-11-14')


def test_subset_explicit_and_not_a_full_snapshot():
    features = [{'attributes': {'OBJECTID': 2, 'CODLOG': '002', 'NOME': 'SINTÉTICO', 'LEI': ''}}]
    source, _ = adapter(features=features)
    table, _, lineage = source.fetch(reference_date='2026-11-14', selected_ids=[2])
    assert len(table.rows) == 1
    assert lineage['scope'] == 'explicit_object_id_subset'
    assert lineage['object_ids'] == [2]


@pytest.mark.parametrize('status', [302, 401, 429, 500])
def test_http_failures_no_retry_no_fallback(status):
    calls = []
    def handler(request):
        calls.append(request)
        return httpx.Response(status, headers={'location': 'https://example.org'})
    source = SiglonStreetsAdapter(httpx.Client(transport=httpx.MockTransport(handler)))
    with pytest.raises(ImportRejected):
        source.fetch(reference_date='2026-11-14')
    assert len(calls) == 1
