"""Official public Londrina excerpt; fault mutations are synthetic test inputs only."""
import copy
import json
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

from app.habitacao import InvalidSource, SnhisService, parse_file, parse_rows
from app.main import create_app


@pytest.fixture
def official():
    return json.loads((Path(__file__).parent / 'fixtures/snhis_londrina_official.json').read_text())


def unavailable():
    raise httpx.ConnectError('offline')


def test_found_and_provenance(tmp_path, official):
    service = SnhisService(tmp_path / 'snapshot.json', lambda: official)
    with TestClient(create_app(housing_service=service)) as client:
        r = client.get('/api/habitacao/municipios/411370').json()
        assert r['municipio']['codigo_ibge'] == '4113700'
        assert r['situacao_snhis'] == 'REGULAR'
        assert r['nivel_verificacao'] == 'OFFICIAL_SNAPSHOT'
        assert r['fonte'] == official['source']
        assert r['data_referencia'] == '2026-10-20'
        assert client.get('/api/habitacao/municipios/4113700').json()['municipio']['nome'] == 'Londrina'
        assert client.get('/api/habitacao/municipios/abc').status_code == 422
        assert client.get('/api/health').status_code == 200


def test_absent_is_not_irregular(tmp_path, official):
    r = SnhisService(tmp_path / 's.json', lambda: official).municipio('9999999')
    assert r['situacao_snhis'] == 'UNKNOWN'
    assert r['nivel_verificacao'] == 'UNVERIFIED'
    assert r['municipio']['nome'] is None


def test_unknown_regularity(tmp_path, official):
    # MOCK fault injection; never distributed as an official snapshot.
    official = copy.deepcopy(official)
    row = official['records']['4113700']
    row['situacao_fonte'] = None
    row['situacao_snhis'] = 'UNKNOWN'
    r = SnhisService(tmp_path / 'mock.json', lambda: official).municipio('411370')
    assert r['nivel_verificacao'] == 'UNVERIFIED'
    assert r['situacao_snhis'] == 'UNKNOWN'


def test_unavailable_without_snapshot(tmp_path):
    r = SnhisService(tmp_path / 'missing.json', unavailable).municipio('411370')
    assert r['mode'] == 'UNVERIFIED'
    assert r['situacao_snhis'] == 'UNKNOWN'
    assert r['fonte']['downloaded_at'] is None


def test_unavailable_preserves_official_snapshot_after_restart(tmp_path, official):
    path = tmp_path / 'cache.json'
    first = SnhisService(path, lambda: official).municipio('411370')
    original = path.read_bytes()
    r = SnhisService(path, unavailable).municipio('411370')
    assert r['mode'] == 'SNAPSHOT'
    assert r['atualizacao_indisponivel'] is True
    assert r['fonte'] == first['fonte']
    assert path.read_bytes() == original


@pytest.mark.parametrize('content', [b'<html>error</html>', b'foo;bar\n1;2', b'COIBGE;COIBGE\n1;2', b''])
def test_invalid_csv(content):
    with pytest.raises(InvalidSource):
        parse_file(content, '.csv')


def rows(status='Regular'):
    # SINTÉTICOS / MOCK. Only parser unit inputs, not a runtime fallback.
    return [['COIBGE', 'MUNICÍPIO', 'UF', 'SITUAÇÃO MUNICÍPIO', 'DT REFERÊNCIA', 'SITUAÇÃO LEI FLHIS', 'CNPJ'],
            ['4113700', 'Município SINTÉTICO / MOCK', 'PR', status, '20/10/2026', 'Pendente', 'DISCARD']]


def test_duplicate_rejected():
    data = rows()
    with pytest.raises(InvalidSource, match='duplicado'):
        parse_rows(data + [data[1]])


def test_status_not_inferred_from_requirements_and_allowlist():
    r = parse_rows(rows())['4113700']
    assert r['situacao_snhis'] == 'REGULAR'
    assert r['requisitos'][0]['situacao_fonte'] == 'Pendente'
    assert 'CNPJ' not in json.dumps(r)
    assert parse_rows(rows(''))['4113700']['situacao_snhis'] == 'UNKNOWN'
    assert parse_rows(rows('nova classificação'))['4113700']['situacao_snhis'] == 'UNKNOWN'


def test_corrupt_cache_is_not_official(tmp_path, official):
    official['source']['url'] = 'https://example.org/forged.xls'
    path = tmp_path / 'bad.json'
    path.write_text(json.dumps(official))
    assert SnhisService(path, unavailable).municipio('411370')['mode'] == 'UNVERIFIED'


def test_invalid_refresh_does_not_replace_cache(tmp_path, official):
    path = tmp_path / 'cache.json'
    SnhisService(path, lambda: official).municipio('411370')
    original = path.read_bytes()
    def invalid():
        return parse_file(b'garbage', '.csv')
    assert SnhisService(path, invalid).municipio('411370')['mode'] == 'SNAPSHOT'
    assert path.read_bytes() == original


@pytest.mark.parametrize('payload', ['[]', 'null', '{}', '{"schema_version":1}'])
def test_malformed_persisted_snapshot_is_unverified(tmp_path, payload):
    path = tmp_path / 'bad.json'
    path.write_text(payload)
    assert SnhisService(path, unavailable).municipio('411370')['mode'] == 'UNVERIFIED'


def test_ttl_reuses_download(tmp_path, official):
    calls = []
    def fetch():
        calls.append(1)
        return official
    service = SnhisService(tmp_path / 'cache.json', fetch)
    service.municipio('411370')
    service.municipio('4113700')
    assert len(calls) == 1
