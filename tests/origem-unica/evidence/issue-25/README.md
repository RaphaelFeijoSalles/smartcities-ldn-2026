# QA #25 — main 2e6259d, 15/11/2026

Responsável: Codex, branch `test/issue-25-consolidated-smoke-20261115`.
Ownership: apenas testes e evidências. Backend, frontend, importadores, IA, CI e produção não alterados.

## Resultados verificáveis

| Gate | Resultado | Evidência |
|---|---|---|
| Python main | PASS | `uv run --with-requirements requirements.txt python -m pytest -q`: 225 passed, 1 aviso Starlette/httpx, 7.19 s |
| HTTP local real | PASS | mesmo ambiente, `python -m pytest -q tests/test_local_http_smoke.py`: 1 passed, 1.83 s; Uvicorn + httpx + contrato Node via URL, MOCK sintético, nenhum provedor externo |
| Node antes da correção | FAIL | 59 pass / 1 fail: regex inválida em habitacao-focus-contract.test.mjs impedia carregar o teste |
| Node após a correção | PASS | `node --test tests/origem-unica/*.test.mjs tools/origem-unica/*.test.mjs`: 60 passed |
| Build Pages | PASS | `node scripts/build-decision-pages.mjs`: artifact validated, 16 ideias / 15 desafios; sem publicação |
| Browser Habitação | PASS | Chromium 1366×768, 375×812, 320×720: panorama CONFIRMADO, 3/3 e 42 linhas; filtros, foco, falha MCMV parcial; sem overflow horizontal ou pageerror |
| Browser Saúde | PASS | mesmos tamanhos: busca, revisão local, CSV filtrado, falha da API preserva dados, mudança da fonte invalida revisão; alternância MOCK/LIVE simulada |
| Browser Logradouros | PASS | mesmos tamanhos: CODLOG, busca, candidatos, CSV de pendências, seleção vazia e limpar filtros; sem overflow ou pageerror |
| Painel IA | PASS simulado | `analysis-browser.mjs`: 1440/1366/768/375/320 px, DEMO/AI interceptada, relatório e 5 falhas; nenhuma chamada OpenAI |
| Produção, atualidade SIGLON e fonte LIVE real | UNKNOWN | não consultados; os testes não comprovam operação externa |
| Revisão móvel independente por Matheus | BLOCKED | depende da execução por outro integrante; emulação Chromium não substitui essa revisão |

## Reproduzir

Python: executar os comandos acima em `prototypes/origem-unica/backend`; Node/build na raiz.
Para browser, fornecer uma instalação local de Playwright via `UX_PLAYWRIGHT` (caminho absoluto para index.mjs) e Chromium via `UX_CHROMIUM`. Nenhuma dependência adicionada ao projeto.

```bash
UX_SUITE=habitacao UX_SNHIS=prototypes/origem-unica/backend/HABITACAO_CONTRACT.json UX_MCMV=tests/origem-unica/mcmv-synthetic.fixture.json node tests/origem-unica/ux-browser.mjs
UX_SUITE=saude node tests/origem-unica/ux-browser.mjs
UX_SUITE=logradouros node tests/origem-unica/ux-browser.mjs
AI_PLAYWRIGHT=/caminho/playwright/index.mjs AI_CHROMIUM=/usr/bin/google-chrome node tests/origem-unica/analysis-browser.mjs
```

As nove capturas PNG desta pasta são **TESTES COM TRANSPORTE INTERCEPTADO**: Saúde usa fixture de contrato sintética, Logradouros usa MOCK e Habitação combina o contrato histórico SNHIS versionado com 42 linhas MCMV **SINTÉTICAS**. Não representam produção ou coleta oficial nova. A situação REGULAR do contrato histórico refere-se a 20/10/2026, não certificação atual. A captura mostra um recorte; as asserções verificam overflow da página inteira. Exportações são verificadas pelo conteúdo baixado, não apenas pelo clique.

Correção: trocar a regex inválida por includes literal preserva a intenção do contrato de foco. Novo smoke HTTP verifica /health, /records, /conflicts, /sources/status e a ausência do router de importação na main auditada. Esse último gate deverá mudar quando a #49 integrar a montagem opt-in; esta PR não implementa a #49.

Limitações: não é auditoria completa WCAG; o smoke HTTP usa fontes MOCK e não testa download de dados externos. Nenhum dado pessoal, segredo, chamada paga, merge ou deploy. Hipótese de execução: Linux com Node e dependências Python declaradas. Pendências: revisão humana das capturas, dispositivo móvel independente e smoke de produção autorizado. Aceite desta PR: testes reproduzíveis e documentação honesta das fronteiras de evidência.
