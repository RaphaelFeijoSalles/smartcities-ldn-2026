"""Public MCMV subsidized projects only; no individual financing contracts."""
import csv
from collections import Counter
import hashlib
import io
import os
import re
import zipfile
from datetime import datetime
from pathlib import Path

import httpx
from fastapi import HTTPException

from app.habitacao import PORTAL, InvalidSource, Links, SnhisService, now, official_url

DICTIONARY = 'https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/arquivos-1/Dicionarios_SNH_2025_10_09.pdf'
FIELDS = ('dt_assinatura', 'cod_operacao', 'txt_nome_empreendimento', 'txt_nome_municipio', 'txt_sigla_uf',
          'txt_modalidade', 'txt_situacao_empreendimento', 'qtd_uh', 'qtd_uh_entregues')


def parse_projects(content):
    try:
        archive = zipfile.ZipFile(io.BytesIO(content))
        members = archive.infolist()
        if len(members) != 1 or not members[0].filename.endswith('.csv') or members[0].file_size > 20_000_000:
            raise InvalidSource('ZIP deve conter um CSV de até 20 MB')
        data = archive.read(members[0]).decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(data), delimiter=';', strict=True)
        required = set(FIELDS) | {'cod_ibge', 'data_referencia'}
        if not required.issubset(reader.fieldnames or []) or len(reader.fieldnames) != len(set(reader.fieldnames)):
            raise InvalidSource('Colunas MCMV inválidas')
        records = []
        for row in reader:
            if None in row or any(row.get(k) is None for k in required):
                raise InvalidSource('Linha MCMV incompleta')
            code = row['cod_ibge'].replace('.', '').strip()
            if not re.fullmatch('[0-9]{6}', code):
                raise InvalidSource('Código municipal MCMV inválido')
            record = {k: row[k].strip() or None for k in FIELDS}
            record['codigo_municipio_fonte'] = code
            record['data_referencia'] = datetime.strptime(row['data_referencia'], '%d/%m/%Y').date().isoformat()
            for k in ('qtd_uh', 'qtd_uh_entregues'):
                if record[k] is not None:
                    record[k] = int(record[k].replace('.', ''))
                    if record[k] < 0:
                        raise InvalidSource('Quantidade negativa')
            records.append(record)
        if not records:
            raise InvalidSource('Arquivo MCMV vazio')
        counts = Counter((r['codigo_municipio_fonte'], r['cod_operacao']) for r in records)
        for record in records:
            record['operacao_repetida_na_fonte'] = (counts[(record['codigo_municipio_fonte'], record['cod_operacao'])] > 1) if record['cod_operacao'] else None
        return records
    except (zipfile.BadZipFile, UnicodeError, csv.Error) as exc:
        raise InvalidSource('ZIP/CSV MCMV inválido') from exc


def download_projects():
    with httpx.Client(timeout=20, follow_redirects=False) as client:
        page = client.get(PORTAL)
        page.raise_for_status()
        links = Links()
        links.feed(page.text)
        urls = {url for url, label in links.links if 'DADOS DO MCMV' in label and 'SUBSIDIADO' in label
                and 'EMPREENDIMENTOS' in label and url.endswith('.zip') and official_url(url)}
        if len(urls) != 1:
            raise InvalidSource('Link MCMV ausente ou ambíguo')
        url = urls.pop()
        with client.stream('GET', url) as response:
            response.raise_for_status()
            content = bytearray()
            for chunk in response.iter_bytes():
                content.extend(chunk)
                if len(content) > 20_000_000:
                    raise InvalidSource('ZIP excede 20 MB')
            updated = response.headers.get('last-modified')
        records = parse_projects(bytes(content))
        return {'schema_version': 1, 'mode': 'OFFICIAL', 'records': records,
                'source': {'instituicao': 'Ministério das Cidades', 'portal': PORTAL,
                           'url': url, 'dicionario': DICTIONARY, 'downloaded_at': now(),
                           'last_modified': updated, 'sha256': hashlib.sha256(content).hexdigest()}}


class McmvService(SnhisService):
    def __init__(self, cache_path=None, fetcher=download_projects, ttl=3600):
        super().__init__(cache_path or os.getenv('ORIGEM_UNICA_MCMV_CACHE',
            str(Path.home() / '.cache/origem-unica/mcmv.json')), fetcher, ttl)

    @staticmethod
    def validate(snapshot):
        if not isinstance(snapshot, dict) or snapshot['schema_version'] != 1 or snapshot['mode'] != 'OFFICIAL' or not isinstance(snapshot['records'], list) or not snapshot['records']:
            raise InvalidSource('Snapshot MCMV inválido')
        source = snapshot['source']
        if not official_url(source['url']) or source['portal'] != PORTAL or source['dicionario'] != DICTIONARY or not re.fullmatch('[0-9a-f]{64}', source['sha256']):
            raise InvalidSource('Proveniência MCMV inválida')
        datetime.fromisoformat(source['downloaded_at'])
        for row in snapshot['records']:
            if not re.fullmatch('[0-9]{6}', row['codigo_municipio_fonte']) or not set(FIELDS).issubset(row):
                raise InvalidSource('Registro MCMV inválido')
        return snapshot

    def empreendimentos(self, code):
        # MCMV file exposes six digits. Do not invent a seventh check digit.
        if not re.fullmatch('[0-9]{6}', code):
            raise HTTPException(422, 'MCMV: informe código municipal de 6 dígitos, como 411370')
        snapshot, error = self.snapshot()
        items = [row for row in snapshot['records'] if row['codigo_municipio_fonte'] == code] if snapshot else []
        return {'mode': 'SNAPSHOT' if snapshot else 'UNVERIFIED', 'municipio': code,
                'count': len(items), 'items': items,
                'aviso': 'count conta linhas da fonte, não empreendimentos únicos. Operações repetidas são preservadas e sinalizadas; não somar unidades sem revisão.',
                'fonte': snapshot['source'] if snapshot else {'portal': PORTAL, 'downloaded_at': None},
                'nivel_verificacao': 'OFFICIAL_SNAPSHOT' if snapshot else 'UNVERIFIED',
                'atualizacao_indisponivel': bool(error),
                'mensagens_pendencia': ([error] if error else []) + ([] if items else [
                    'Nenhum empreendimento verificado na fonte disponível; não comprova inexistência.'])}
