# ESTADO CANÔNICO — 15/11/2026 (substitui o status histórico abaixo)

- **Produto ativo:** Origem Única. Primeiro caso Habitação Social: consulta e análise de evidências públicas SNHIS/MCMV. Saúde × CNES e Logradouros são laboratórios de expansão. A escolha atual invalida afirmações históricas abaixo de que produto não foi selecionado.
- **Main:** integração de IA/segurança, UX, importação e qualidade de dados nas PRs #43, #45, #46, #47, #48, #50, #51, #52, #55, #56, #57, #58, #59; PRs #7, #9, #10, #12, #13, #14, #15 preservam pesquisas de alternativas, sem selecioná-las.
- **Infra:** Render `origem-unica-api`, Python, root `prototypes/origem-unica/backend`, branch main, autodeploy desabilitado; GitHub Pages frontend. Verificar commit publicado após merges. Serviço antigo `smartcities-ldn-2026` em Node não é API canônica.
- **IA:** `ORIGEM_UNICA_AI_MODE=demo` no serviço principal. O modo `live` requer chave privada, token separado, ledger SQLite persistente e teste controlado; o Render Free não fornece disco persistente. Nenhum segredo deve ir ao frontend ou ao Git.
- **Dados:** snapshot oficial SNHIS Londrina REGULAR em 20/10/2026, não certificação atual. MCMV: 42 **linhas** na referência 30/06/2026, não necessariamente 42 empreendimentos. Importadores autenticados CSV/XLS e adaptador SIGLON estão no código, mas **a API de importação não está montada na FastAPI principal**. Trabalho aberto na Issue #49; não publicar upload de dados com Bearer embutido na UI estática.
- **Qualidade/segurança:** contratos e checks por PR passaram; faltam smoke integrado da main, validação visual/acessibilidade e consulta SIGLON real. Não atualizar cadastros oficiais nem acessar bases pessoais sem autorização.
- **Próximas frentes com ownership distinto:** (A) integração restrita/API + interface da Issue #49; (B) QA ponta a ponta e browser na Issue #25; (C) geodados e fonte SIGLON real na Issue #29. Evitar duplicar importadores já entregues.

---

## STATUS MAIS RECENTE — 14/11/2026

- **#8 MERGED:** Decision Lab e 15 desafios estão em `main`. Este registro substitui afirmações anteriores de que a PR #8 continua aberta.
- **EcoVisão C16** já consta da main via PR #22; 16 propostas para 15 desafios, notas provisórias e gates pendentes.
- **#11, #16, #17, #22 MERGED:** depoimento CML, LexBase, EcoVisão + links de duas fotos da Folha 2020 e organização da equipe, todos em main. Pixels não copiados ao Git.
- **#18:** `spike/ecovisao-p0-api-20261114` com API/UI e dados sintéticos, não YOLO. **Aguardar decisão e gates antes de merge.**
- **Equipe e handoff:** [START_NOW_20261114.md](START_NOW_20261114.md), Miguel sai às 13h, João assume PC com autenticação própria; Tiago GEO, Matheus validação, Raphael integração.
- **Pesquisa e issues antigas:** verificar [inventário atualizado](../decision/06_ESTADO_E_PRS.md). Não fechar Issues 1–5 antes dos aceites.
- **Produto escolhido:** PENDING; **regras completas de IA/IP:** UNKNOWN; **benchmark YOLO:** NOT RUN; **demo real:** NOT VERIFIED.

---

# Continuidade operacional — fonte de verdade viva

**Atualizado:** 13/11/2026 — preparação para brainstorm.
**Fase:** RESEARCH / DECISION — sem projeto MVP definido.
**Objetivo imediato:** decidir problema e primeiro fluxo testável. **Implementação:** NOT STARTED.

## Segunda etapa de apoio à decisão — painel preparado (13/11)
- **A interface estática foi criada** em `tools/decision-board/` na PR #8: filtros, evidências, ranking provisório editável, comparador de até 3, exportação Markdown/JSON.
- **Fonte de conteúdo:** `data/decision/smartcities-decision-v1.json`; avaliações **separadas** em `data/decision/smartcities-assessments-v1.json`; manutenção com um único prompt descrito no README do painel.
- **Verificação:** testes de lógica/CI e smoke manual móvel/desktop são gates separados; nunca chamar interface visual testada só por compilar.
- **Estado de produto:** NOT SELECTED; dados de usuário VALIDATION UNKNOWN, regulação completa UNKNOWN; `main` não foi alterada.
- **SIGLON:** link novo e ressalvas em `docs/decision/07_SIGLON_APLICATIVOS.md`.

## Atualização de pesquisa — 13/11/2026, sem decisão de produto
- **Abertura do evento trouxe 15 desafios**, detalhados em 5 áudios e pesquisados por 9 PRs em aberto. Uma central consolidada de decisão foi montada em [docs/decision/README.md](../decision/README.md) na PR #8.
- **Estado:** pesquisa consolidada, produto **NOT SELECTED**, MVP **NOT STARTED**, regras integrais de IA/IP ainda **UNKNOWN**.
- **Próximo gate:** reunião e decisão na Issue #2, com usuário, problema, 2-min demo, dados, owner e 3 Issues pequenas.
- **Importante:** os rankings preliminares anteriores ao áudio 5 não são notas definitivas; preparar a LP comparadora usando `data/decision/smartcities-decision-v1.json` sem scores pré-atribuídos.

## Confirmado
- Repositório privado e disponível.
- Tema público: Transformação Digital na Gestão Pública, 13–15/11, Londrina.
- Git: Issues + branches pequenas + PRs, sem push direto para main.
- Raphael = integração técnica; Miguel = frente comercial/produto (papéis iniciais).
- Dados externos não podem ser confundidos com registros sintéticos ou números simulados.

## Pendente de decisão HOJE
- Enunciados e regras oficiais dos desafios, uso permitido de IA/código prévio.
- Problema, usuário, comprador e hipótese principal.
- Ideia escolhida e hipótese rejeitada.
- Stack final proporcional ao P0.
- Responsáveis por frontend, backend/dados, QA e pitch.
- Fluxo da demo, critério de sucesso e horário de congelamento.

## Próximas ações
1. Realizar [brainstorm de 20 minutos](../product/BRAINSTORM.md).
2. Registrar decisão e justificativa no dossiê.
3. Abrir ou atualizar Issues técnicas com ownership; só então codar.
4. Miguel realizar validações; registrar quem foi ouvido e o que respondeu.
5. Manter um artefato demonstrável em todo checkpoint de integração.

## Registro curto das decisões
Preencher ao final do brainstorm:
- Problema escolhido: **A DEFINIR**
- Usuário/cliente: **A DEFINIR**
- Um diferencial: **A DEFINIR**
- P0, caso feliz: **A DEFINIR**
- Prazo interno para demo: **A DEFINIR**
- Donos das três primeiras Issues: **A DEFINIR**

Cada sessão deve atualizar este arquivo com **status real**, sem apagar histórico técnico das PRs.
