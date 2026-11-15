import base64
import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.data_import_api import MAX_REQUEST_BYTES, data_import_router
from app.tabular_compare import compare
from app.tabular_import import ImportRejected, MAX_BYTES, analyze, read_table


def meta():
    return dict(name='SINTÉTICO', url='https://example.org/synthetic', reference_date='2026-11-14',
                version='1', classification='synthetic', nature='street_registry', namespace='test:codlog')


def table(text='CODLOG;Nome;Lei\n1;Rua Á;\n2;Rua B;12\n'):
    return read_table(text.encode(), 'test.csv')


def document(text='CODLOG,Nome\n1,Rua A\n'):
    return {'filename': 'test.csv', 'content_base64': base64.b64encode(text.encode()).decode(), 'provenance': meta()}


def client(token='test-only'):
    app = FastAPI()
    app.include_router(data_import_router(token))
    return TestClient(app)


def test_preserves_originals_maps_aliases_and_tracks_provenance():
    t = table('Código do Logradouro;Nome do Logradouro\n001;R. Á\n')
    result, mapping = analyze(t, meta())
    assert t.rows == [{'Código do Logradouro': '001', 'Nome do Logradouro': 'R. Á'}]
    assert mapping == {'codlog': 'Código do Logradouro', 'name': 'Nome do Logradouro'}
    assert result['provenance']['sha256'] == t.sha256
    assert result['provenance']['verification'] == 'SYNTHETIC'
    assert 'R. Á' not in json.dumps(result, ensure_ascii=False)


@pytest.mark.parametrize('payload,name', [
    (b'', 'a.csv'), (b'x' * (MAX_BYTES + 1), 'a.csv'), (b'abc', 'a.xlsx'), (b'not excel', 'a.xls'),
    (b'id,id\n1,2\n', 'a.csv'), (b'id,name\n1,2,3\n', 'a.csv'), (b'\xff\xfe', 'a.csv'),
    (b'CODLOG,Nome\n1,\x00\n', 'a.csv'), (b'CODLOG,Nome\n"unterminated,A\n', 'a.csv'),
    (b'CODLOG,Nome\n', 'a.csv'),
])
def test_invalid_files_rejected(payload, name):
    with pytest.raises(ImportRejected):
        read_table(payload, name)


def test_dimensions_and_cell_limits():
    for text in ['CODLOG,Nome\n' + '1,A\n' * 5001,
                 ','.join('c' + str(i) for i in range(65)) + '\n' + ','.join('a' for _ in range(65)),
                 'CODLOG,Nome\n1,' + 'a' * 2049 + '\n']:
        with pytest.raises(ImportRejected):
            table(text)


def test_ambiguous_headers_need_choice():
    t = table('CODLOG;Nome;Nome do Logradouro\n1;A;B\n')
    with pytest.raises(ImportRejected, match='ambiguous'):
        analyze(t, meta())
    _, mapping = analyze(t, meta(), {'name': 'Nome'})
    assert mapping['name'] == 'Nome'
    with pytest.raises(ImportRejected):
        analyze(t, meta(), {'codlog': 'Absent'})


def test_official_url_is_not_attestation():
    m = meta()
    m.update(classification='official_claimed', url='https://geo.londrina.pr.gov.br/source')
    result, _ = analyze(table(), m)
    assert result['provenance']['verification'] == 'UNVERIFIED'
    assert result['official_validity'] == 'UNKNOWN'


@pytest.mark.parametrize('change', [dict(url='http://example.org'), dict(reference_date='yesterday'),
    dict(classification='official'), dict(namespace=''), dict(nature='people'), dict(name=[])])
def test_invalid_provenance(change):
    m = meta()
    m.update(change)
    with pytest.raises(ImportRejected):
        analyze(table(), m)


def test_review_queue_and_duplicate_identity_not_paired():
    left = table('CODLOG;Nome\n1;A\n1;B\n;C\n2;R. X\n3;D\n')
    right = table('codigo_logradouro;nome_logradouro\n1;A\n2;Rua X\n4;E\n')
    result = compare(left, meta(), right, meta())
    assert result['metrics'] == dict(match=0, conflict=1, incomplete=0, only_left=1, only_right=1, ambiguous=1, missing_key=1, invalid_key=0)
    assert result['writes_performed'] is False
    assert len([r for r in result['review_queue'] if r['rule'] != 'SOURCE_QUALITY_ISSUES']) == 5
    assert 'Rua X' not in json.dumps(result)
    assert next(r for r in result['review_queue'] if r['rule'] == 'EXACT_VALUE_DIFFERENCE')['left_rows'] == [5]


def test_matching_fields_do_not_hide_source_quality_defects():
    left = table('CODLOG;Nome;Observacao\n1;Rua A;\n')
    right = table('CODLOG;Nome\n1;Rua A\n')
    result = compare(left, meta(), right, meta())
    assert result['metrics']['match'] == 1
    assert result['quality_status'] == 'FAIL'
    issue = next(item for item in result['review_queue'] if item['rule'] == 'SOURCE_QUALITY_ISSUES')
    assert issue['side'] == 'left'
    assert issue['source_report_id'] == result['sources'][0]['report_id']
    assert result['sources'][1]['quality_status'] == 'PASS'
    assert result == compare(left, meta(), right, meta())


def test_clean_sources_and_matching_values_remain_pass():
    t = table('CODLOG;Nome\n1;Rua A\n')
    result = compare(t, meta(), t, meta())
    assert result['quality_status'] == 'PASS'
    assert result['review_queue'] == []


def test_missing_comparison_values_are_not_matches():
    result = compare(table('CODLOG;Nome\n1;A\n'), meta(), table('CODLOG;Nome\n1; \n'), meta())
    assert result['metrics']['incomplete'] == 1
    assert result['metrics']['match'] == 0


def test_exact_match_but_leading_zeros_not_coerced():
    result = compare(table('CODLOG;Nome\n01;A\n2;B\n'), meta(), table('CODLOG;Nome\n1;A\n2;B\n'), meta())
    assert result['metrics']['match'] == 1
    assert result['metrics']['only_left'] == result['metrics']['only_right'] == 1


@pytest.mark.parametrize('change', [dict(namespace='another:codlog'), dict(nature='housing_status'), dict(classification='unverified')])
def test_incompatible_sources_blocked(change):
    m = meta()
    m.update(change)
    with pytest.raises(ImportRejected):
        compare(table(), meta(), table(), m)


def test_api_auth_disabled_and_limits():
    assert client('').post('/api/data-import/profile', json={}).status_code == 503
    c = client()
    assert c.post('/api/data-import/profile', content='bad').status_code == 401
    headers = {'Authorization': 'Bearer test-only'}
    assert c.post('/api/data-import/profile', content='bad', headers=headers).status_code == 415
    headers['Content-Type'] = 'application/json'
    assert c.post('/api/data-import/profile', content=b'x' * (MAX_REQUEST_BYTES + 1), headers=headers).status_code == 413
    assert c.post('/api/data-import/profile', content='{', headers=headers).status_code == 422
    assert c.post('/api/data-import/profile', json=[], headers=headers).status_code == 422


def test_http_profile_and_comparison_contract_no_values_leaked():
    c = client()
    headers = {'Authorization': 'Bearer test-only'}
    response = c.post('/api/data-import/profile', json={'document': document()}, headers=headers)
    assert response.status_code == 200
    assert response.json()['contract_version'] == '1'
    assert response.json()['profile']['row_count'] == 1
    response = c.post('/api/data-import/compare', json={'left': document(), 'right': document('CODLOG,Nome\n1,Rua B\n')}, headers=headers)
    assert response.status_code == 200
    assert response.json()['metrics']['conflict'] == 1
    assert response.json()['review_queue'][0]['fields'] == ['name']
    assert 'Rua A' not in response.text and 'Rua B' not in response.text


@pytest.mark.parametrize('value', [None, [], {}, {'filename': 'x.csv', 'content_base64': '!!!'},
    {'filename': 'x.csv', 'content_base64': 'a' * (MAX_BYTES * 2)}])
def test_api_invalid_document_is_safe(value):
    response = client().post('/api/data-import/profile', json={'document': value}, headers={'Authorization': 'Bearer test-only'})
    assert response.status_code == 422


def test_xls_real_binary_parsed_and_compared_to_csv():
    from pathlib import Path
    payload = base64.b64decode(Path('tests/fixtures/tabular_synthetic.xls.b64').read_text())
    xls = read_table(payload, 'synthetic.xls')
    assert xls.format == 'xls'
    assert xls.rows[0]['CODLOG'] == 1.0
    result = compare(xls, meta(), table('CODLOG;Nome\n1;Rua A\n2;Rua B\n'), meta())
    assert result['metrics']['match'] == 2


@pytest.mark.parametrize('header', ['CPF', 'NIS', 'E-mail', 'Nome completo'])
def test_personal_columns_rejected(header):
    with pytest.raises(ImportRejected, match='personal'):
        table('CODLOG;' + header + '\n1;SINTETICO\n')


@pytest.mark.parametrize('mapping', [{'name': []}, [], 'bad', {'unknown': 'Nome'}])
def test_bad_mapping_returns_validation_error(mapping):
    d = document()
    d['mapping'] = mapping
    response = client().post('/api/data-import/profile', json={'document': d}, headers={'Authorization': 'Bearer test-only'})
    assert response.status_code == 422


def test_xls_parser_wall_timeout_fails_closed(monkeypatch):
    import subprocess
    import app.tabular_import as module
    def timeout(*args, **kwargs):
        assert kwargs['timeout'] == 6
        assert args[0][1] == '-I'
        raise subprocess.TimeoutExpired('parser', 6)
    monkeypatch.setattr(module.subprocess, 'run', timeout)
    with pytest.raises(ImportRejected, match='resource_limit'):
        read_table(bytes.fromhex('D0CF11E0A1B11AE1') + b'SYNTHETIC', 'test.xls')


def test_xls_parser_crash_fails_closed(monkeypatch):
    import subprocess
    import app.tabular_import as module
    monkeypatch.setattr(module.subprocess, 'run', lambda *a, **k: subprocess.CompletedProcess([], -9, b'', b'SYNTHETIC SECRET'))
    with pytest.raises(ImportRejected) as error:
        read_table(bytes.fromhex('D0CF11E0A1B11AE1') + b'SYNTHETIC', 'test.xls')
    assert 'SECRET' not in str(error.value)


def test_numeric_identity_duplicates_consistent_in_profile_and_comparison():
    from app.tabular_import import Table
    t = Table(['CODLOG', 'Nome'], [{'CODLOG': 1.0, 'Nome': 'A'}, {'CODLOG': '1', 'Nome': 'B'}], 'synthetic', 'xls')
    report, _ = analyze(t, meta())
    assert report['profile']['duplicate_key_rows'] == 1
    result = compare(t, meta(), table('CODLOG;Nome\n1;A\n'), meta())
    assert result['metrics']['ambiguous'] == 1
    assert t.rows[0]['CODLOG'] == 1.0
