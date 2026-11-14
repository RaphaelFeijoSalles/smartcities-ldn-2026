# Entrega vertical — 14/11/2026

- Problema: disponibilizar cadastros públicos de saúde no contrato de `/api/records`, com fallback explícito e sem bloquear a demo.
- Contexto: Issue #2; owner backend João/Codex; branch `feat/origem-unica-backend`. A Issue #2 ainda não registra aprovação final do produto. Sem merge/deploy nesta entrega.
- Ownership: somente `prototypes/origem-unica/backend/**`; frontend e arquivos compartilhados preservados.
- Aceite local: HTTP 200, fonte real acessível, JSON aprovado pelo gate independente e fallback exercitado.

## Evidência executada

Consulta HTTP em `2026-11-14T18:03:58.595229+00:00` (15:03 BRT):

- SIGLON: 54 registros, `LIVE`. Fonte: https://geo.londrina.pr.gov.br/server/rest/services/Publico/SaudeUnidadesBasicasAbrangenciaPublico/MapServer/0/query
- CNES: 57 registros, `LIVE`. Fonte: https://apidadosabertos.saude.gov.br/cnes/estabelecimentos
- `/api/records`: HTTP 200, `mode=LIVE`, 64 itens; 14 MATCH, 25 POSSIBLE_MATCH, 8 CONFLICT, 7 ONLY_IN_A, 10 ONLY_IN_B. São resultados heurísticos desta consulta, não validação humana nem indicadores oficiais.
- Gate `validateRecords` de `origin/qa/origem-unica-integration-contract-20261114`, commit `3ffa4ed`: executado contra a resposta HTTP local, zero erros. Código carregado diretamente de `git show`, sem copiar ou alterar arquivos de QA.
- `.venv/bin/python -m pytest -q`: **PASS — 14 testes**; um aviso de depreciação Starlette/httpx, sem falhas.
- `.venv/bin/python -m compileall -q app`: **PASS**.
- Casos cobertos: matching, CORS/HTTP, cache, queda de uma/ambas fontes, separação real/mock, modo offline, paginação CNES e rejeição de truncamento SIGLON.
- Smoke visual: **NOT RUN**, frontend pertence a outro agente.

## Execução e limites

Ver `README.md` neste diretório para instalação, execução e modo offline `ORIGEM_UNICA_MOCK=1`.
O JSON mantém `mode`, `generated_at`, `items`, `sources`, `conflicts` e proveniência. Quando qualquer fonte usa fixture, o modo global é MOCK; a origem de cada registro continua explícita. Registros sem par usam `score=null`.

As fontes públicas podem oscilar: SIGLON teve timeout em duas tentativas e respondeu em consultas seguintes. O horário de coleta não representa atualização do cadastro oficial. Os testes de matching são sintéticos; a precisão em registros reais ainda exige revisão humana. Não há persistência de decisões ou alteração de cadastros oficiais.

## Publicação

**BLOCKED — autenticação GitHub ausente.** `git push -u origin feat/origem-unica-backend` falhou com `could not read Username for 'https://github.com'`. `gh` também solicitou login. Leitura pública por Git/API funciona, mas não concede permissão de escrita.

Após autenticar com `gh auth login` e `gh auth setup-git`, publicar:

```bash
git push -u origin feat/origem-unica-backend
```

Nenhum merge, deploy, alteração de dependências, CI ou frontend foi feito. A demonstração visual integrada e a publicação da branch continuam pendentes.
