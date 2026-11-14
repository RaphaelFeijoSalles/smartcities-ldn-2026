"""Read-only SNHIS file importer. Never infers regularity from requirements."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import re
import tempfile
import threading
import time
import unicodedata
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import httpx
from fastapi import APIRouter, HTTPException

PORTAL = 'https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/programa-minha-casa-minha-vida/bases-de-dados-do-programa-minha-casa-minha-vida'
DICT_URL = 'https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/programa-minha-casa-minha-vida/minha-casa-minha-vida-fnhis-sub-50-1/arquivos-fnhis-sub-50/copy_of_Dicionarios_SNH_2025_10_09.pdf'
REQUIREMENTS = {
    'SITUACAO LEI FLHIS': 'Lei do Fundo Local de Habitação de Interesse Social',
    'SITUACAO LEI CGFLHIS': 'Lei do Conselho Gestor do Fundo Local',
    'SITUACAO TERMO ADESAO': 'Assinatura e publicação do termo de adesão ao SNHIS',
    'SITUACAO PLANO HABIT': 'Plano Local de Habitação de Interesse Social',
}


def norm(value):
    return ' '.join(unicodedata.normalize('NFKD', str(value)).encode('ascii', 'ignore').decode().upper().split())


def now():
    return datetime.now(timezone.utc).isoformat()


class InvalidSource(ValueError):
    pass


def parse_rows(rows):
    """Allowlist fields: CNPJ and other incidental source columns are discarded."""
    rows = iter(rows)
    headers = [norm(v) for v in next(rows, [])]
    headers = ['CODIGO IBGE' if v == 'COIBGE' else v for v in headers]
    required = {'CODIGO IBGE', 'MUNICIPIO', 'UF', 'SITUACAO MUNICIPIO', 'DT REFERENCIA'}
    if not required.issubset(headers) or len(headers) != len(set(headers)):
        raise InvalidSource('Colunas obrigatórias ausentes ou duplicadas')
    result = {}
    for values in rows:
        if not any(str(v).strip() for v in values):
            continue
        if len(values) != len(headers):
            raise InvalidSource('Quantidade de colunas inválida')
        row = dict(zip(headers, values))
        value = row['CODIGO IBGE']
        code = str(int(value)) if isinstance(value, (int, float)) and value == int(value) else str(value).strip()
        if not re.fullmatch(r'[0-9]{7}', code):
            raise InvalidSource('Código IBGE inválido')
        if code in result:
            raise InvalidSource('Código IBGE duplicado: ' + code)
        # State-level rows are in the source but are not municipalities.
        if code.endswith('00000'):
            continue
        name, uf = str(row['MUNICIPIO']).strip(), str(row['UF']).strip()
        if not name or not re.fullmatch('[A-Z]{2}', uf):
            raise InvalidSource('Município ou UF inválido')
        reference = str(row['DT REFERENCIA']).strip()
        try:
            reference = datetime.strptime(reference, '%d/%m/%Y').date().isoformat()
        except ValueError as exc:
            raise InvalidSource('Data de referência inválida') from exc
        status = str(row['SITUACAO MUNICIPIO']).strip() or None
        result[code] = {
            'codigo_ibge': code, 'nome': name, 'uf': uf,
            'situacao_fonte': status,
            'situacao_snhis': {'REGULAR': 'REGULAR', 'PENDENTE': 'PENDENTE'}.get(norm(status), 'UNKNOWN'),
            'data_referencia': reference,
            'requisitos': [{'requisito': label, 'situacao_fonte': str(row.get(key, '')).strip() or None,
                           'fonte': DICT_URL} for key, label in REQUIREMENTS.items()],
        }
    if not result:
        raise InvalidSource('Arquivo sem municípios')
    return result


def parse_file(content: bytes, suffix: str):
    if suffix == '.xls':
        import xlrd
        try:
            book = xlrd.open_workbook(file_contents=content)
            sheet = book.sheet_by_index(0)
            return parse_rows(sheet.row_values(i) for i in range(sheet.nrows))
        except (xlrd.XLRDError, IndexError) as exc:
            raise InvalidSource('XLS inválido') from exc
    if suffix == '.csv':
        try:
            decoded = content.decode('utf-8-sig')
        except UnicodeDecodeError:
            decoded = content.decode('cp1252')
        try:
            dialect = csv.Sniffer().sniff(decoded[:8192], delimiters=';,\t')
            return parse_rows(csv.reader(io.StringIO(decoded), dialect, strict=True))
        except csv.Error as exc:
            raise InvalidSource('CSV inválido') from exc
    raise InvalidSource('Formato não suportado; esperado XLS ou CSV')


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.href = None
        self.label = ''

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.href = dict(attrs).get('href')
            self.label = ''

    def handle_data(self, data):
        if self.href:
            self.label += data

    def handle_endtag(self, tag):
        if tag == 'a' and self.href:
            self.links.append((urljoin(PORTAL, self.href), norm(self.label)))
            self.href = None


def official_url(url):
    parsed = urlsplit(url)
    return parsed.scheme == 'https' and parsed.hostname == 'www.gov.br' and parsed.path.startswith('/cidades/') and not parsed.username


def download_snapshot():
    # No authenticated pages, no analytical contracts for individuals, no REST guesses.
    with httpx.Client(timeout=20, follow_redirects=False) as client:
        page = client.get(PORTAL)
        page.raise_for_status()
        links = Links()
        links.feed(page.text)
        candidates = [url for url, label in links.links if 'SNHIS' in label and 'REGULARIDADE' in label
                      and 'DICIONARIO' not in label and official_url(url)
                      and Path(urlsplit(url).path).suffix.lower() in {'.xls', '.csv'}]
        if len(set(candidates)) != 1:
            raise InvalidSource('Link oficial SNHIS ausente ou ambíguo')
        url = candidates[0]
        with client.stream('GET', url) as response:
            response.raise_for_status()
            chunks, size = [], 0
            for chunk in response.iter_bytes():
                size += len(chunk)
                if size > 20_000_000:
                    raise InvalidSource('Arquivo excede limite de 20 MB')
                chunks.append(chunk)
            content = b''.join(chunks)
            updated = response.headers.get('last-modified')
        records = parse_file(content, Path(urlsplit(url).path).suffix.lower())
        return {'schema_version': 1, 'mode': 'OFFICIAL', 'records': records,
                'source': {'instituicao': 'Ministério das Cidades / CEFUS-CAIXA',
                           'portal': PORTAL, 'url': url, 'dicionario': DICT_URL,
                           'downloaded_at': now(), 'last_modified': updated,
                           'sha256': hashlib.sha256(content).hexdigest()}}


class SnhisService:
    def __init__(self, cache_path=None, fetcher=download_snapshot, ttl=3600):
        self.cache_path = Path(cache_path or os.getenv('ORIGEM_UNICA_SNHIS_CACHE',
            str(Path.home() / '.cache/origem-unica/snhis.json')))
        self.fetcher, self.ttl = fetcher, ttl
        self.cached = None
        self.next_refresh = 0.0
        self.error = None
        self.lock = threading.Lock()
        try:
            self.cached = self.validate(json.loads(self.cache_path.read_text()))
        except (OSError, ValueError, KeyError, TypeError):
            pass

    @staticmethod
    def validate(snapshot):
        if not isinstance(snapshot, dict) or snapshot['schema_version'] != 1 or snapshot['mode'] != 'OFFICIAL' or not isinstance(snapshot['records'], dict) or not snapshot['records']:
            raise InvalidSource('Snapshot inválido')
        source = snapshot['source']
        if not official_url(source['url']) or source['portal'] != PORTAL or source['dicionario'] != DICT_URL or not re.fullmatch('[0-9a-f]{64}', source['sha256']):
            raise InvalidSource('Proveniência inválida')
        datetime.fromisoformat(source['downloaded_at'])
        for code, row in snapshot['records'].items():
            if not isinstance(row, dict):
                raise InvalidSource('Registro inválido')
            if code != row['codigo_ibge'] or not re.fullmatch('[0-9]{7}', code):
                raise InvalidSource('Snapshot inválido')
            if row['situacao_snhis'] != {'REGULAR': 'REGULAR', 'PENDENTE': 'PENDENTE'}.get(norm(row['situacao_fonte']), 'UNKNOWN'):
                raise InvalidSource('Situação inválida')
            for key in ('nome', 'uf', 'situacao_fonte', 'data_referencia', 'requisitos'):
                if key not in row:
                    raise InvalidSource('Snapshot incompleto')
            datetime.strptime(row['data_referencia'], '%Y-%m-%d')
            if not isinstance(row['requisitos'], list) or len(row['requisitos']) != len(REQUIREMENTS):
                raise InvalidSource('Requisitos inválidos')
            for requirement, label in zip(row['requisitos'], REQUIREMENTS.values()):
                if requirement['requisito'] != label or requirement['fonte'] != DICT_URL or 'situacao_fonte' not in requirement:
                    raise InvalidSource('Requisito sem proveniência')
        return snapshot

    def snapshot(self):
        with self.lock:
            if time.monotonic() >= self.next_refresh:
                try:
                    fresh = self.validate(self.fetcher())
                    self.cached = fresh
                    self.error = None
                    self.cache_path.parent.mkdir(parents=True, exist_ok=True)
                    with tempfile.NamedTemporaryFile('w', dir=self.cache_path.parent, delete=False) as handle:
                        json.dump(fresh, handle, ensure_ascii=False)
                        temp = handle.name
                    os.replace(temp, self.cache_path)
                except (httpx.HTTPError, OSError, ValueError, KeyError, TypeError, ImportError) as exc:
                    self.error = 'Falha ao atualizar fonte/cache: ' + type(exc).__name__
                self.next_refresh = time.monotonic() + self.ttl
            return self.cached, self.error

    def municipio(self, code):
        if not re.fullmatch('[0-9]{6,7}', code):
            raise HTTPException(422, 'Informe código IBGE com 6 ou 7 dígitos')
        snapshot, error = self.snapshot()
        records = snapshot['records'] if snapshot else {}
        matches = [row for key, row in records.items() if key == code or (len(code) == 6 and key[:6] == code)]
        row = matches[0] if len(matches) == 1 else None
        messages = []
        if error:
            messages.append(error)
        if not row:
            messages.append('Município não verificado na fonte disponível. Ausência não indica irregularidade.')
        elif row['situacao_snhis'] == 'UNKNOWN':
            messages.append('Regularidade não informada ou não reconhecida; não indica irregularidade.')
        if row:
            messages.extend('Fonte registra pendência: ' + r['requisito'] for r in row['requisitos'] if norm(r['situacao_fonte']) == 'PENDENTE')
            if row['situacao_snhis'] == 'PENDENTE':
                messages.append('Fonte registra situação municipal Pendente na data de referência.')
        return {
            'mode': 'SNAPSHOT' if snapshot else 'UNVERIFIED',
            'municipio': {'codigo_solicitado': code, 'codigo_ibge': row['codigo_ibge'] if row else None,
                          'nome': row['nome'] if row else None, 'uf': row['uf'] if row else None},
            'situacao_snhis': row['situacao_snhis'] if row else 'UNKNOWN',
            'situacao_fonte': row['situacao_fonte'] if row else None,
            'requisitos': row['requisitos'] if row else [
                {'requisito': label, 'situacao_fonte': None, 'fonte': DICT_URL} for label in REQUIREMENTS.values()],
            'fonte': snapshot['source'] if snapshot else {'portal': PORTAL, 'dicionario': DICT_URL, 'downloaded_at': None},
            'data_referencia': row['data_referencia'] if row else None,
            'nivel_verificacao': 'OFFICIAL_SNAPSHOT' if row and row['situacao_snhis'] != 'UNKNOWN' else 'UNVERIFIED',
            'atualizacao_indisponivel': bool(error), 'mensagens_pendencia': messages,
            'aviso': 'Retrato da fonte na data de referência; não constitui certificação de regularidade atual.',
        }


def housing_router(service):
    router = APIRouter(prefix='/api/habitacao', tags=['Habitação'])

    @router.get('/municipios/{codigo_ibge}')
    def municipio(codigo_ibge: str):
        return service.municipio(codigo_ibge)

    return router
