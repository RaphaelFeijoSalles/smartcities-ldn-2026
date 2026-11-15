import json

import pytest

from app.data_review import ReviewRejected, review
from app.tabular_compare import compare
from test_tabular_pipeline import client, document, meta, table


def report():
    return compare(table('CODLOG;Nome\n1;R. A\n2;B\n'), meta(), table('CODLOG;Nome\n1;Rua A\n2;B\n'), meta())


def test_identifiers_stable_and_changed_input_invalidates_receipt():
    a = report()
    assert a == report()
    changed = compare(table('CODLOG;Nome\n1;C\n'), meta(), table('CODLOG;Nome\n1;D\n'), meta())
    assert a['report_id'] != changed['report_id']
    with pytest.raises(ReviewRejected, match='stale'):
        review(changed, a['report_id'], [])


def test_acknowledgement_is_not_correction_or_quality_pass():
    a = report()
    decision = {'item_id': a['review_queue'][0]['item_id'], 'resolution': 'ACKNOWLEDGED_DIFFERENCE'}
    result = review(a, a['report_id'], [decision])
    assert result['review_summary'] == dict(total=1, acknowledged=1, pending=0)
    assert a['review_queue'][0]['state'] == 'PENDING'
    assert result['quality_status'] == a['quality_status'] == 'FAIL'
    assert result['metrics'] == a['metrics']
    assert result['sources'] == a['sources']
    assert result['official_validity'] == 'UNKNOWN'
    assert result['writes_performed'] is False
    assert result['review_receipt']['actor_identity_verified'] is False
    assert result == review(a, a['report_id'], [decision])


@pytest.mark.parametrize('decisions', [None, [], [{}], [{'item_id': [], 'resolution': 'DEFERRED'}],
    [{'item_id': 'invented', 'resolution': 'DEFERRED'}], [{'item_id': 'x', 'resolution': 'AUTO_CORRECT'}]])
def test_invalid_decisions_rejected(decisions):
    a = report()
    with pytest.raises(ReviewRejected):
        review(a, a['report_id'], decisions)


def test_request_source_keeps_item_pending():
    a = report()
    decision = {'item_id': a['review_queue'][0]['item_id'], 'resolution': 'REQUEST_SOURCE_CHECK'}
    result = review(a, a['report_id'], [decision])
    assert result['review_summary']['pending'] == 1
    with pytest.raises(ReviewRejected, match='repeated'):
        review(a, a['report_id'], [decision, decision])


def test_http_review_recomputes_sources_and_rejects_stale_input():
    c = client()
    headers = {'Authorization': 'Bearer test-only'}
    pair = {'left': document(), 'right': document('CODLOG,Nome\n1,Rua B\n')}
    a = c.post('/api/data-import/compare', json=pair, headers=headers).json()
    body = {**pair, 'report_id': a['report_id'], 'decisions': [
        {'item_id': a['review_queue'][0]['item_id'], 'resolution': 'ACKNOWLEDGED_DIFFERENCE'}]}
    response = c.post('/api/data-import/review', json=body, headers=headers)
    assert response.status_code == 200
    result = response.json()
    assert result['review_summary']['acknowledged'] == 1
    assert result['metrics']['conflict'] == 1
    assert 'Rua B' not in json.dumps(result)
    body['right'] = document('CODLOG,Nome\n1,Rua C\n')
    response = c.post('/api/data-import/review', json=body, headers=headers)
    assert response.status_code == 422
    assert response.json()['detail'] == 'stale_or_different_report'


def test_report_identity_idempotent_and_covers_later_lineage():
    from app.data_review import identify_report
    a = report()
    assert identify_report(a) == a
    enriched = identify_report({**a, 'lineage': {'snapshot': 'versioned'}})
    assert enriched['report_id'] != a['report_id']
