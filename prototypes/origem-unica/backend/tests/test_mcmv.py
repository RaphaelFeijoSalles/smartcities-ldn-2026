"""SINTÉTICOS / MOCK: in-memory CSV inputs, never a production fallback."""
import csv
import io
import zipfile

import pytest

from app.habitacao import InvalidSource
from app.mcmv import FIELDS, McmvService, parse_projects


def archive(duplicate=False):
    stream = io.StringIO()
    writer = csv.DictWriter(stream, fieldnames=[*FIELDS, 'cod_ibge', 'data_referencia', 'txt_cnpj_construtora_entidade'], delimiter=';')
    writer.writeheader()
    row = dict.fromkeys(FIELDS, 'SINTÉTICO / MOCK')
    row.update(cod_ibge='411.370', data_referencia='30/06/2026', qtd_uh='1', qtd_uh_entregues='0')
    writer.writerow(row)
    if duplicate:
        writer.writerow(row)
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w') as z:
        z.writestr('mock.csv', stream.getvalue())
    return output.getvalue()


def test_csv_zip_and_allowlist():
    items = parse_projects(archive())
    assert items[0]['codigo_municipio_fonte'] == '411370'
    assert items[0]['data_referencia'] == '2026-06-30'
    assert items[0]['qtd_uh'] == 1
    assert 'txt_cnpj_construtora_entidade' not in items[0]


def test_duplicate_operations_preserved_and_flagged():
    items = parse_projects(archive(True))
    assert len(items) == 2
    assert all(r['operacao_repetida_na_fonte'] for r in items)


def test_invalid_zip():
    with pytest.raises(InvalidSource):
        parse_projects(b'not a zip')


def test_mcmv_unavailable(tmp_path):
    def offline():
        raise OSError('offline')
    response = McmvService(tmp_path / 'cache.json', offline).empreendimentos('411370')
    assert response['mode'] == 'UNVERIFIED'
    assert response['count'] == 0
