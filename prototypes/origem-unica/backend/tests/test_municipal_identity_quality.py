"""Synthetic records exercise shape validation, not the IBGE registry."""
import pytest

from app.tabular_compare import compare
from app.tabular_import import analyze, read_table


def meta():
    return dict(name='SINTETICO', url='https://example.org/synthetic',
                reference_date='2026-11-15', version='1', classification='synthetic',
                nature='housing_status', namespace='test:municipality-7')


def table(code):
    return read_table(('Codigo IBGE;Municipio\n' + code + ';Exemplo\n').encode(), 'synthetic.csv')


@pytest.mark.parametrize('code', ['123456', '12345678', '12345X7', '１２３４５６７', '1234.5'])
def test_invalid_codes_are_quarantined_even_if_both_sides_equal(code):
    t = table(code)
    profile, _ = analyze(t, meta())
    assert profile['quality_status'] == 'FAIL'
    assert profile['profile']['requires_human_review'] is True
    assert any(r['rule'] == 'INVALID_IBGE_CODE_FORMAT' and r['count'] == 1 for r in profile['review_queue'])
    result = compare(t, meta(), t, meta())
    assert result['metrics']['invalid_key'] == 2
    assert result['metrics']['match'] == 0
    assert result['quality_status'] == 'FAIL'
    assert [r['rule'] for r in result['review_queue']].count('INVALID_IDENTITY_FORMAT') == 2


def test_seven_digits_match_without_claiming_official_validity():
    t = table('1234567')
    result = compare(t, meta(), t, meta())
    assert result['metrics']['match'] == 1
    assert result['metrics']['invalid_key'] == 0
    assert result['official_validity'] == 'UNKNOWN'


def test_empty_identity_is_missing_not_invalid():
    t = table('')
    result = compare(t, meta(), t, meta())
    assert result['metrics']['missing_key'] == 2
    assert result['metrics']['invalid_key'] == 0


def test_api_compare_and_review_preserve_quarantine():
    import base64
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from app.data_import_api import data_import_router

    app = FastAPI()
    app.include_router(data_import_router('test-only'))
    client = TestClient(app)
    doc = {'filename': 'synthetic.csv', 'content_base64': base64.b64encode(
        b'Codigo IBGE;Municipio\n123456;Exemplo\n').decode(), 'provenance': meta()}
    pair = {'left': doc, 'right': doc}
    headers = {'Authorization': 'Bearer test-only'}
    response = client.post('/api/data-import/compare', json=pair, headers=headers)
    assert response.status_code == 200
    report = response.json()
    assert report['metrics']['invalid_key'] == 2
    decision = {'item_id': report['review_queue'][0]['item_id'], 'resolution': 'ACKNOWLEDGED_DIFFERENCE'}
    result = client.post('/api/data-import/review', json={**pair, 'report_id': report['report_id'],
                                                          'decisions': [decision]}, headers=headers)
    assert result.status_code == 200
    assert result.json()['quality_status'] == 'FAIL'
    assert result.json()['metrics']['match'] == 0
    assert result.json()['official_validity'] == 'UNKNOWN'
