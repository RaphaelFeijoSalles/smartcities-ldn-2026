# Smart Cities Londrina 2026 — equipe AI-First

> **ESTADO ATUAL — 15/11/2026:** produto escolhido: **Origem Única**, governança e conciliação de dados públicos, com primeiro caso em **Habitação (SNHIS/MCMV)**. O texto histórico de brainstorm abaixo é um registro anterior à escolha e não descreve a fase atual.
>
> **Aplicação:** https://raphaelfeijosalles.github.io/smartcities-ldn-2026/tools/origem-unica/ · **API:** https://origem-unica-api.onrender.com · **Contratos:** [backend](prototypes/origem-unica/backend/README.md), [importação pública](prototypes/origem-unica/backend/DATA_IMPORT.md), [IA/segurança](prototypes/origem-unica/backend/HABITACAO_IA.md).
>
> **Integração 15/11:** PRs #43, #45–#48, #50–#52, #55–#59 integradas; #7, #9, #10, #12–#15 são pesquisas históricas. **Backend Render:** versão combinada anterior aos novos merges de documentação; conferir deploy. **Pendente:** Issue #49 (interface/API restrita para importação e revisão); QA independente e coleta SIGLON real; análise IA paga deve continuar desabilitada até storage persistente, credenciais e validação controlada. **Referência:** Londrina REGULAR no snapshot SNHIS 20/10/2026; MCMV 42 linhas no snapshot 30/06/2026, não 42 empreendimentos únicos.


## HOJE: decisão e início do MVP — 14/11

**[Plano rápido dos 5 integrantes e handoff de Miguel → João às 13h](docs/team/START_NOW_20261114.md)** · [Issue #2 para registrar a escolha](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2).

- A **PR #8 e a PR #22 já estão MERGED**; Decision Lab, 16 candidatas e organização da equipe estão na `main`.
- A LP tem **16 propostas para os 15 desafios**, incluindo **EcoVisão (C16)**.
- **LexBase** continua melhor avaliada na LP (4,70/5); **EcoVisão** é a aposta operacional pela combinação Python + geografia + estatística + validação ambiental, **condicionada** à licença/teste de detector.
- **Fotos da Folha de Londrina (2020)**: referências bibliográficas mescladas pela [PR #17](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/17), não copiadas nem usadas para treinar sem permissão.
- **Código inicial EcoVisão** na [PR #18](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/18) — FastAPI + SQLite + UI responsiva, **100% dados sintéticos, sem YOLO executado**. Não mesclar como produto decidido antes da votação e verificação da Issue #1.

**Não é necessário fechar as 11 PRs antigas para começar:** use a [matriz de integração](docs/decision/06_ESTADO_E_PRS.md), escolha uma proposta e trabalhe em uma PR por tarefa. Proibido confundir build verde com validação de detecção real.



> **Fase: decisão do brainstorm + spike técnico isolado.** Ainda não há produto escolhido; a PR #18 contém um protótipo EcoVisão com dados sintéticos, não um MVP oficialmente aprovado. O objetivo deste repositório é permitir que todos colaborem sem travar no Git, com pesquisa rastreável, tarefas curtas e IA com escopo seguro.

**Evento:** Smart Cities Hackathon, Londrina, 13–15/11/2026. Tema divulgado: **Transformação Digital na Gestão Pública**. O regulamento/desafios oficiais específicos ainda precisam ser confirmados na abertura. Não confundir hipóteses deste repositório com desafios oficiais.

## Compartilhar o painel com a equipe (GitHub Pages)

**[Guia de ativação do GitHub Pages](docs/decision/PUBLISHING_GITHUB_PAGES.md)** — a publicação está preparada, mas exige conferir **Settings → Pages → GitHub Actions**; a PR #8 **já foi mesclada**. Depois disso o site ficará no endereço previsto `https://raphaelfeijosalles.github.io/smartcities-ldn-2026/` (confirmar na aba Pages antes de divulgar).

O Pages publica **somente o painel de brainstorm**, não o futuro MVP. O sistema concorrente poderá seguir em **Vercel + Render + Supabase** conforme a ideia escolhida.

## Painel responsivo para escolher a ideia — Decision Lab

**[Abrir o código e instruções do painel](tools/decision-board/README.md)** · Teste local: na raiz do repositório execute `python3 -m http.server 4173` e abra `http://localhost:4173/tools/decision-board/`.

O painel apresenta 15 candidatos com filtros, fontes, ranking provisório editável, shortlist de até três, comparador e exportação Markdown/JSON para a [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2). **Responsivo, sem framework/banco/backend/chave de IA.** Para manutenção por uma chamada de IA, use o prompt único no README do painel. Nenhuma escolha de produto foi feita. [SIGLON: aplicativos públicos e verificação anti-clone](docs/decision/07_SIGLON_APLICATIVOS.md).

## Central de decisão — 5 setores, 15 desafios e 5 áudios (13/11)

**Ponto de entrada atualizado:** [leitura de 2 minutos e documentação consolidada](docs/decision/README.md). É a síntese canônica para o brainstorm; pesquisar primeiro nesta central antes de abrir nova Issue/PR. **Não escolhemos produto; existe apenas o protótipo isolado na PR #18.**

- [15 desafios setorizados](docs/decision/02_DESAFIOS_E_SETORES.md) · [evidências dos 5 depoimentos e pesquisa](docs/decision/03_EVIDENCIAS_E_FONTES.md)
- [15 produtos candidatos, sem ranking antecipado](docs/decision/04_PORTFOLIO_DE_OPORTUNIDADES.md) · [critérios de seleção e gates](docs/decision/05_PROTOCOLO_DE_DECISAO.md)
- [Mapa das PRs anteriores, anti-duplicação](docs/decision/06_ESTADO_E_PRS.md) · [dados prontos para próxima LP comparativa](data/decision/smartcities-decision-v1.json)

**Regra anti-loop:** usar a central para decidir. As PRs antigas guardam evidência e aprofundamento, não tarefas paralelas de reconstrução da mesma análise.

## Para começar em 3 minutos
1. **Toda a equipe:** leia [o guia de início](docs/team/ONBOARDING.md).
2. **Brainstorm de hoje:** abra [as decisões de 20 minutos](docs/product/BRAINSTORM.md) e [a matriz de ideias](docs/research/IDEAS.md).
3. **Miguel / negócios:** abra [validação comercial](docs/business/VALIDATION.md) e [roteiro de pitch](docs/business/PITCH.md).
4. **Quem vai programar com IA:** leia [AGENTS.md](AGENTS.md) e [workflow de Git](docs/team/WORKFLOW.md).
5. **Integração:** veja [estado e próximos passos](docs/team/CONTINUITY.md) antes de iniciar qualquer trabalho.

## Referências locais para escolher a ideia
- [MasterPlan Londrina 2040 — projetos históricos, gestão digital e governança](docs/research/MASTERPLAN_LONDRINA_2040.md)
- [Fórum Desenvolve Londrina — estudos 2015–2025, problemas e indicadores](docs/research/FORUM_DESENVOLVE_LONDRINA.md)
- [Matriz de oportunidades: cruzamento MasterPlan × Fórum](docs/research/MASTERPLAN_FORUM_OPPORTUNITIES.md)

**Importante:** são fontes de inspiração e hipóteses para o brainstorm, não desafios oficiais nem decisão de produto. Os projetos originais são históricos e a Prefeitura atualizou o planejamento em 2026.

## Acordo de desenvolvimento
- **Uma Issue → um responsável → uma branch → um PR pequeno.** Cada tarefa precisa ter critérios de aceite.
- Cada IA lê `AGENTS.md` e a Issue antes de alterar código. Não modificar arquivos de outra pessoa, contratos compartilhados ou `main` sem alinhar.
- **Proibido declarar algo pronto sem teste/evidência.** GitHub é a fonte de verdade; mensagens não substituem PR.
- O projeto será decidido em grupo, mas a implementação será vertical: **uma jornada de ponta a ponta demonstrável antes de adicionar extras**.
- Não criar login, banco, backend, deploy ou integrações pesadas antes de justificar necessidade do MVP. Escolha de stack e desenho final ficam pendentes do problema.

## Estrutura
```text
AGENTS.md                     normas para os agentes de IA
CLAUDE.md                     atalho para agentes compatíveis
docs/research/                evento, fontes e oportunidades
docs/product/                 brainstorm, escopo e hipóteses
docs/business/                usuário, comprador, validação e pitch
docs/engineering/             arquitetura/contratos (a decidir)
docs/team/                    onboarding, Git, fluxo e continuidade
.github/                      templates de Issues e PRs
```

## Prioridade imediata
1. Confirmar desafios, critérios, regras de IA e IP com organização.
2. Escolher **um problema específico** usando avaliação comparável.
3. Definir **usuário, comprador, resultado observável e demo de 90 segundos**.
4. Distribuir as primeiras Issues por domínio, com ownership sem sobreposição.
5. Implementar uma jornada local com dados sintéticos antes de expandir.

**Situação atual:** repositório de preparação documental; nenhuma integração pública, regra de IA ou condição de premiação foi presumida como autorização oficial.

[Evento (site divulgado)](https://www.londrinainteligente.com.br/hackathon-2026) · [Fontes e fatos verificados](docs/research/SOURCES.md)
