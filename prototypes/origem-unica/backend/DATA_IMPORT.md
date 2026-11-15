# Importação pública e conciliação — contrato v1

Responsável: Work / engenharia de dados. Missão noturna de 15/11/2026.
Esta entrega evolui os dois arquivos da PR #41, copiados sem alterações, sobre main `63f6a91`.
Ao integrar, usar esta PR como sucessora da #41; não aplicar ambas cegamente.
Não modifica main.py, IA, UI, dependências, CI ou produção.

## Executar localmente

No diretório `prototypes/origem-unica/backend`, instalar requirements.txt no ambiente virtual.
Definir `ORIGEM_UNICA_DATA_IMPORT_TOKEN` com um segredo local e iniciar:

```bash
.venv/bin/uvicorn app.data_import_api:create_data_import_app --factory --host 127.0.0.1 --port 8010
```

Sem token o processamento retorna 503. Autenticação Bearer ocorre antes da leitura do corpo.
Não publicar esse serviço por padrão. O integrador pode montar `data_import_router()` na aplicação
principal depois de alinhar autenticação, CORS, limites de concorrência e proxy. Nenhum registro
pessoal ou arquivo interno é permitido. Allowlist de domínios: arruamento público e situação
habitacional municipal agregada. Cabeçalhos comuns de dados pessoais são rejeitados; isso não
substitui a verificação do responsável pelo arquivo. Não há retenção nem escrita das linhas.

## POST /api/data-import/profile

Content-Type application/json e Authorization Bearer. Corpo:

```json
{
  "document": {
    "filename": "arruamento.csv",
    "content_base64": "Q09ETE9HLE5vbWUKMSxSdWEgQQo=",
    "provenance": {
      "name": "Exemplo SINTÉTICO",
      "url": "https://example.org/synthetic",
      "reference_date": "2026-11-14",
      "version": "1",
      "classification": "synthetic",
      "nature": "street_registry",
      "namespace": "synthetic:codlog"
    },
    "mapping": {"codlog": "CODLOG", "name": "Nome"}
  }
}
```

`mapping` é opcional; aliases inequívocos são propostos automaticamente. Se dois cabeçalhos
mapearem o mesmo campo, exigir escolha explícita. Preservam-se cabeçalhos e células originais
em memória, sem sobrescrita. O relatório devolve nomes de colunas, métricas e hashes, sem células.

`nature`: street_registry (codlog, name, locality, law) ou housing_status
(ibge_code, municipality, uf, status). Código de identidade é obrigatório.
`namespace` deve identificar a autoridade/escopo do identificador (por exemplo município + CODLOG),
e é declarado pelo cliente: não constitui verificação independente.
`classification`: synthetic, unverified ou official_claimed. URL governamental ou declaração
`official_claimed` NÃO transforma upload em oficial verificado. `verification` permanece UNVERIFIED;
validade administrativa sempre UNKNOWN. SHA-256 identifica os bytes, não autenticidade.

Resposta v1: provenance (metadados, hash, formato, versão do adaptador), profile (contagem,
mapa de cabeçalhos, colisões, ausências, duplicatas e chaves incompletas), field_mapping,
review_queue, quality_status, official_validity e writes_performed=false.

O resultado da comparação também inclui `SOURCE_QUALITY_ISSUES` para cada
fonte cujo perfil tenha pendências, apontando `source_report_id` para os detalhes.
Assim, coincidência nos campos comparados não transforma uma fonte incompleta ou
com cabeçalhos colidentes em qualidade PASS. Reconhecer uma pendência não altera
a qualidade nem corrige os dados originais.
PASS significa ausência das regras sinalizadas; não comprova completude semântica ou legal.

## POST /api/data-import/compare

Corpo `{"left": documento, "right": documento}` no mesmo formato do exemplo.
Exige mesma natureza e namespace; não mistura sintético com não sintético. Compara somente
campos mapeados em ambos, pelo identificador exato; espaços externos são removidos, zeros à
esquerda preservados. Números inteiros do XLS são compatíveis com seus textos decimais no CSV.
Não expande abreviações ou remove acentos para decidir igualdade. Não faz fuzzy matching.

Duplicatas de identidade são colocadas em quarentena, sem pareamento. Chaves incompletas,
linhas sem par, diferenças e células faltantes alimentam uma fila PENDING sem valores brutos.
Cada item identifica regra, campos e linhas lógicas (1-based, cabeçalho=1, linhas vazias omitidas).
A fila é uma projeção reproduzível do relatório, não um workflow persistente de aprovação.
Reenviar os mesmos bytes e metadados produz o mesmo relatório.

Métricas: match, conflict, incomplete, only_left, only_right, ambiguous (grupos de identidade),
missing_key (linhas). Métricas de grupos e linhas não devem ser somadas como contagem de linhas.
Comparações entre datas diferentes descrevem diferenças de snapshots, não necessariamente erros.

## Limites e erros

- 1 MiB por arquivo; 5.000 linhas não vazias; 64 colunas; 2.048 caracteres/célula; 128/cabeçalho.
- Corpo HTTP limitado a dois arquivos base64 + 16 KiB; leitura incremental inclusive sem Content-Length.
- CSV UTF-8/BOM, separadores vírgula/ponto e vírgula/tabulação, aspas estritas. Sem CP1252 implícito.
- XLS OLE/BIFF com uma única planilha, dimensões limitadas, rejeição de células com erro.
  Fórmulas não são executadas; xlrd lê valores armazenados. XLSX não é suportado nesta versão.
- Sem download de URLs fornecidas pelo cliente: evita SSRF. URLs são metadados.
- 401: credencial; 503: desabilitado; 413: corpo excessivo; 415: Content-Type; 422: entrada inválida.
- Token compartilhado serve apenas à demonstração restrita; não é autenticação B2G multiusuário.
  Antes de exposição pública: rate limiting, quotas e isolamento de parsing de XLS em processo.
  Limite de bytes não limita sozinho toda a alocação interna de um parser XLS.

## Evidências do primeiro incremento

- `.venv/bin/python -m pytest -q`: 126 PASS, 1 aviso de depreciação Starlette/httpx.
- Testes incluem HTTP autenticado, limites, inválidos, aliases, ambiguidade, proveniência,
  XLS binário sintético real, CSV/XLS, duplicatas, faltas e ausência de valores nas respostas.
- Arquivo XLS base64 de teste: gerado com xlwt somente no preparo da fixture; não é dependência.
- Coleta SIGLON em 15/11 UTC: timeout de 15s sem bytes; consulta via pesquisa também indisponível.
  BLOCKED coleta real; nenhuma linha inventada. Endpoint-alvo:
  https://geo.londrina.pr.gov.br/server/rest/services/Publico/SmopArruamento/FeatureServer/0
- Integração UI, produção e CORS da aplicação central: UNKNOWN/não alterados.


## Incremento 3 — limites do parser e identidade coerente

Substitui a ressalva anterior sobre isolamento XLS: agora o XLS roda em subprocesso Python
isolado (`-I`), com 256 MiB de espaço de endereçamento, 3 s de CPU e timeout externo de 6 s.
Limites de saída: 2 MiB de caracteres expandidos e 4 MiB de JSON. Sem resource/POSIX, falha
fechada; alvo suportado é Linux. Crash e timeout resultam em 422 seguro, sem stderr do parser.
Não é um sandbox de sistema operacional nem substitui quotas por usuário/concorrência.
O adaptador tabular passa a v1.1. Identidades numéricas integrais de XLS e textos decimais
seguem a mesma regra no perfil e na comparação; originais preservados e zeros textuais mantidos.
SIGLON recebe teto agregado de 4 MiB por coleta, além de 2 MiB por resposta.

Verificação deste incremento: 148 PASS Python; 44 PASS Node; smoke de Uvicorn via HTTP real
em localhost comparou XLS com CSV sintéticos e retornou 200, 1 match, 1 conflict e nenhuma escrita.
Um primeiro teste entre sessões isoladas recebeu connection refused; o smoke acima executou
servidor e cliente no mesmo ambiente e passou. CI remoto deste head deve ser consultado.

## Incremento 4 — recibo de revisão vinculado ao snapshot

`profile` e `compare` passam a incluir report_id e item_id por pendência. IDs são SHA-256
reproduzíveis sobre conteúdo estruturado, incluindo hashes de arquivos/proveniência; não são
assinaturas digitais nem certificação de origem. Alterar bytes ou metadados muda a identidade.

`POST /api/data-import/review` recebe `left`, `right`, `report_id` e `decisions`.
Os documentos são reenviados no mesmo formato do compare; o servidor recalcula o relatório.
Não aceita relatório arbitrário do cliente. Fonte diferente ou relatório antigo retorna 422.
Decisões: de 1 a 256, sem IDs repetidos, cada objeto contendo exclusivamente item_id e resolution.
Resoluções: ACKNOWLEDGED_DIFFERENCE, REQUEST_SOURCE_CHECK ou DEFERRED.

A resposta mantém métricas, quality_status, provenance e official_validity intactos e adiciona
review_receipt (report_id, decisões ordenadas, receipt_id) e review_summary. Reconhecer uma
diferença não torna qualidade PASS nem altera uma fonte. Pedido de verificação/adiamento mantém
PENDING. Não há texto livre ou dados de revisor. O recibo é declaração do cliente autenticado,
com actor_identity_verified=false e persistence=NONE_EXPORT_ONLY. Não é trilha de auditoria
persistente. Para preservar decisões, exportar a resposta JSON. A cada chamada reenviar o conjunto
de decisões a preservar; decisões de chamada anterior não ficam armazenadas no servidor.

Exemplo do trecho adicional ao par de documentos:

```json
{
  "report_id": "hash retornado por compare",
  "decisions": [
    {"item_id": "hash da pendência", "resolution": "REQUEST_SOURCE_CHECK"}
  ]
}
```

Verificação: testes de IDs estáveis, invalidação por mudança de fonte, rejeição de decisões
inventadas/repetidas, imutabilidade do relatório original e contrato HTTP autenticado.
