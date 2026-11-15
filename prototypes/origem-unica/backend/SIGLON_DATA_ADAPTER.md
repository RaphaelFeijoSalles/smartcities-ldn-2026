# Incremento 2 — adaptador SIGLON e exportação JSON local

Dependência: PR #48 (contrato/importadores). Esta branch adiciona somente novos módulos de dados.
Não altera IA, frontend, rotas centrais, dependências ou produção.

## SIGLON Arruamento v1

`app.adapters.siglon_streets.SiglonStreetsAdapter` aponta exclusivamente à camada pública:
https://geo.londrina.pr.gov.br/server/rest/services/Publico/SmopArruamento/FeatureServer/0

Descobre campos nos metadados via aliases inequívocos; não afirma ter observado o esquema real
nesta sessão. Exige CODLOG/nome e identificador ArcGIS descoberto. Consulta inventário de IDs,
coleta em lotes de 200, só atributos públicos selecionados e sem geometria. Rejeita respostas
truncadas, IDs duplicados/inesperados, registros faltantes, campos ausentes e falhas HTTP.
Não segue redirecionamentos, não tenta novamente e não usa fallback sintético.

Limites: 2 MiB por resposta, até 5.000 registros e CSV derivado até 1 MiB.
Se o inventário exceder 5.000, o operador deve escolher `selected_ids` explícitos; a proveniência
marca `explicit_object_id_subset`, nunca camada completa. Inventário e respostas recebem hashes.
Ausência de CODLOG/lei é pendência de revisão, não prova de erro cadastral ou irregularidade.
Vielas/acessos sem denominação não são renomeados automaticamente. A data de referência deve
ser declarada pelo operador: o adaptador registra que não a verificou. `fetched_at` é coleta,
não data oficial do conteúdo. Mudanças concorrentes na fonte deixam consistência UNKNOWN.

Uso local restrito após inspeção do esquema/referência:

```python
from app.adapters.siglon_streets import SiglonStreetsAdapter
from app.tabular_import import analyze
# A data precisa ter evidência externa. Não substituir referência desconhecida por hoje.
table, provenance, lineage = SiglonStreetsAdapter().fetch(reference_date="2026-11-14", selected_ids=[1, 2])
report, mapping = analyze(table, provenance)
report["lineage"] = lineage
```

Os IDs no exemplo são ilustrativos. Validar o inventário antes de escolher recorte real.
HTTP live permanece BLOCKED no ambiente desta missão: timeout já documentado na PR #48.
Os testes ArcGIS são SINTÉTICOS e não validam disponibilidade/esquema municipais reais.

## Exemplo histórico real, com linhagem explícita

O repositório já contém `tests/fixtures/snhis_londrina_official.json`, extraído na implementação
habitacional anterior. O comando abaixo converte somente os campos públicos municipais desse
snapshot histórico em CSV em memória, passa pelo importador novo e exporta JSON determinístico.
Não baixa XLS, não inventa linhas, não afirma nova verificação da fonte nem certificação atual.
Preserva hash do snapshot, hash declarado do XLS e data de coleta anterior como DECLARADOS.
A referência segue 20/10/2026; `verification=UNVERIFIED`, `official_validity=UNKNOWN`.

```bash
.venv/bin/python -m app.data_import_cli snhis-example > /tmp/snhis-quality-report.json
```

## Exportação de relatórios públicos sem células brutas

`app.data_import_cli` aceita profile/compare com CSV/XLS e JSON de proveniência do contrato v1.
Escreve somente o relatório em stdout; erros seguros em stderr e exit code 2.
Exit code 0 indica execução, não qualidade PASS. Conferir quality_status e official_validity.

```bash
.venv/bin/python -m app.data_import_cli profile --left publico.csv --left-metadata fonte.json
.venv/bin/python -m app.data_import_cli compare --left antes.csv --left-metadata antes.json --right depois.xls --right-metadata depois.json
```

Não usar arquivos pessoais/internos. Para snapshots de datas diferentes, diferenças são mudanças
observadas, não necessariamente erros. Não há persistência nem escrita na fonte externa.

## Verificação

143 PASS no backend, incluindo 14 novos testes ArcGIS e 3 CLI/linhagem histórica.
Um aviso de depreciação Starlette/httpx. Smoke CLI real do snapshot versionado PASS.
PR #48: dois workflows remotos concluídos com success no head 2940669.
CI deste incremento deve ser verificado separadamente após publicar a branch.
