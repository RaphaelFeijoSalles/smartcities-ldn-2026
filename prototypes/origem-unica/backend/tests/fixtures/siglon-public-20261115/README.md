# Issue #29 — evidência pública de esquema SIGLON

Base: main `2e6259d`. Coleta de metadados em 15/11/2026, 11:00:15 UTC (08:00:15 Brasília), conforme mtime local do arquivo concluído, não timestamp assinado do servidor. Responsável: Codex. Branch: `test/issue-29-siglon-public-evidence-20261115`.

## Resultado

- **PASS leitura pública de metadados:** HTTP 200, 11.687 bytes, 0,199731 s. Bytes originais em metadata.json; SHA-256 e URL em manifest.json. O arquivo declara copyright Prefeitura/SIGLON/IPPUL; preservado integralmente como evidência técnica do esquema, sem licença de redistribuição de dados cadastrais presumida.
- **PASS compatibilidade do esquema:** OBJECTID é OID; NOME, CODLOG, LEI e LOCALIDADE são strings nullable. O adaptador integrado seleciona esses campos e ignora BLOB/geometria. Teste com metadados observados e registros **SINTÉTICOS** confirma leitura, ausência de LEI, escopo de subconjunto e falha fechada em truncamento/timeout.
- **BLOCKED inventário real:** GET returnIdsOnly com httpx, limite 12 s, terminou em ReadTimeout antes de receber resposta. O adaptador não pôde executar a extração real após essa etapa. Sem retries automáticos.
- **BLOCKED amostra pública de dez linhas:** consulta independente limitada a dez registros, só os cinco campos públicos, sem geometria: curl exit 28, HTTP 000, 0 bytes, 15,001808 s. Nenhuma linha foi obtida, inventada ou adicionada à fixture municipal.
- **UNKNOWN:** data de referência dos dados, estabilidade temporal de CODLOG, consistência entre páginas, completude de LEI e significado jurídico de cada referência. Não há contagem de erros ou ausências reais. Metadados descrevem atualização cartográfica histórica de 2015 baseada em imagens 2012–2014; isso não estabelece referência atual da camada. `reference_date=null` preserva a incerteza.

A consulta via ferramenta web também não abriu a URL; o HTTP 200 acima veio do curl local. Não foi necessário acessar bases privadas, credenciais, pessoas, serviço de IA, geometria ou legislação. Nenhuma escrita externa, merge ou deploy.

## Reprodução

```bash
curl --silent --show-error --max-time 15 --max-filesize 2097152 \
  --output /tmp/siglon-metadata.json \
  --write-out 'status=%{http_code} bytes=%{size_download} seconds=%{time_total}\n' \
  'https://geo.londrina.pr.gov.br/server/rest/services/Publico/SmopArruamento/FeatureServer/0?f=json'

curl --silent --show-error --max-time 15 --max-filesize 2097152 \
  --output /tmp/siglon-sample.json \
  --write-out 'status=%{http_code} bytes=%{size_download} seconds=%{time_total}\n' \
  'https://geo.londrina.pr.gov.br/server/rest/services/Publico/SmopArruamento/FeatureServer/0/query?f=json&where=1%3D1&outFields=OBJECTID%2CNOME%2CCODLOG%2CLEI%2CLOCALIDADE&returnGeometry=false&orderByFields=OBJECTID&resultRecordCount=10'
```

Não considerar um HTTP 200 de metadados como prova de funcionamento da query. Uma resposta limitada com exceededTransferLimit também não constitui snapshot completo. Depois de obter inventário e uma referência documentada, usar `SiglonStreetsAdapter.fetch(reference_date=..., selected_ids=...)` existente; não criar outro parser. A data usada no teste sintético é somente uma declaração de teste e não referência da fonte municipal.

No backend: `uv run --with-requirements requirements.txt python -m pytest -q tests/test_siglon_streets.py tests/test_siglon_observed_schema.py` → **20 passed**, 0,19 s. Os quatro casos novos cobrem hash/tipos e compatibilidade do esquema observado; as features continuam simuladas. Nenhuma alteração em módulos funcionais, frontend, IA, importadores, CI ou dependências.

Pendências concretas: obter inventário e dez linhas quando a query estiver acessível; registrar hashes/horários dessas respostas; confirmar referência externa e estabilidade de CODLOG com responsável; revisar LEI como referência textual sem interpretar vigência. A issue #29 permanece parcialmente BLOCKED. Sem interface alterada, screenshots não se aplicam.

Suíte completa: `uv run --with-requirements requirements.txt python -m pytest -q` → **229 passed, 1 warning**, 5,26 s (aviso Starlette/httpx). `git diff --check` → PASS. Suítes JS não repetidas: nenhum arquivo JS/HTML/CSS alterado nesta issue.
