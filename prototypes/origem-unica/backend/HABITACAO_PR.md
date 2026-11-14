# feat(habitacao): importar SNHIS oficial e empreendimentos MCMV

## Problema / Issue
A API existente concilia saúde, mas não disponibiliza situação municipal SNHIS nem empreendimentos públicos MCMV com proveniência. Missão de habitação de 14/11/2026, relacionada à Issue #5; nenhuma Issue específica atribuída. Owner backend João/Codex, revisão Raphael. Não fecha a Issue #5.

## Entrega e arquivos
Somente `prototypes/origem-unica/backend/**`: adaptadores/serviços `app/habitacao.py`, `app/mcmv.py`; registro das duas rotas em `app/main.py`; testes e recorte público oficial; `HABITACAO.md`, contrato JSON e este texto de PR. Frontend preservado.

- GET `/api/habitacao/municipios/{codigo_ibge}`: XLS real descoberto no portal, requisitos, situação declarada, datas e proveniência. Seis ou sete dígitos; ausências são UNKNOWN/UNVERIFIED.
- GET `/api/habitacao/empreendimentos?municipio=411370`: ZIP/CSV oficial, somente empreendimentos subsidiados, operações repetidas preservadas e sinalizadas.
- Cache persistente público, atualização atômica, fallback último snapshot válido; sem snapshot, UNVERIFIED. Nenhum fallback sintético automático.

## Testes executados
- `/tmp/habitacao-venv/bin/python -m pytest -q`: **80 passed** (inclui SIGLON/CNES existentes). Um aviso de depreciação Starlette/httpx no ambiente de teste, sem falha.
- Smoke HTTP local via FastAPI TestClient, com downloads oficiais reais: ambos **HTTP 200 / OFFICIAL_SNAPSHOT**. SNHIS Londrina REGULAR em 20/10/2026; MCMV 42 linhas para Londrina em 30/06/2026, não 42 empreendimentos únicos.
- `git diff --check`: PASS.
- Screenshots: não aplicável (backend). Resposta real: `HABITACAO_CONTRACT.json`.

## Hipóteses, limitações e riscos
Consulta representa data histórica do arquivo, não certificação atual. Dicionário SNHIS diverge do XLS (documentado). Campos são permitidos explicitamente; CNPJ e contratos pessoais não são retidos. MCMV repete operações com valores distintos: sem soma ou consolidação automática. Link/formato alterado exige revisão; falha preserva snapshot anterior. Cache local não é assinatura digital. Sem edição de fontes oficiais, merge ou deploy.

**Alinhamento pendente:** XLS requer `xlrd>=2.0.1,<3`, instalado no ambiente de teste. Adição ao requirements (hot file) aguarda integrador; instalação manual documentada. Sem leitor e sem cache, endpoint retorna UNVERIFIED.

**BLOCKED publicação:** terminal Git/gh sem autenticação; Source Control do VS Code indisponível nas ferramentas. Commit local e descrição prontos. Não confundir com PR já aberta.

## Fora de escopo evitado
Frontend, dependências/lockfiles sem alinhamento, CI, login, banco, CadÚnico, FGTS individual, scraping autenticado, escrita SNHIS/CEFUS, merge e deploy.
