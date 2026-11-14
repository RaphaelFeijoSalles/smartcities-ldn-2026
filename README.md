# Smart Cities Londrina 2026 — equipe AI-First

> **Fase: DISCOVERY / BRAINSTORM.** Ainda não há produto escolhido nem MVP implementado. O objetivo deste repositório é permitir que todos colaborem sem travar no Git, com pesquisa rastreável, tarefas curtas e IA com escopo seguro.

**Evento:** Smart Cities Hackathon, Londrina, 13–15/11/2026. Tema divulgado: **Transformação Digital na Gestão Pública**. O regulamento/desafios oficiais específicos ainda precisam ser confirmados na abertura. Não confundir hipóteses deste repositório com desafios oficiais.

## Compartilhar o painel com a equipe (GitHub Pages)

**[Guia de ativação do GitHub Pages](docs/decision/PUBLISHING_GITHUB_PAGES.md)** — a publicação está preparada, mas exige selecionar **Settings → Pages → GitHub Actions** e mesclar a PR #8 na `main`. Depois disso o site ficará no endereço previsto `https://raphaelfeijosalles.github.io/smartcities-ldn-2026/` (confirmar na aba Pages antes de divulgar).

O Pages publica **somente o painel de brainstorm**, não o futuro MVP. O sistema concorrente poderá seguir em **Vercel + Render + Supabase** conforme a ideia escolhida.

## Painel responsivo para escolher a ideia — Decision Lab

**[Abrir o código e instruções do painel](tools/decision-board/README.md)** · Teste local: na raiz do repositório execute `python3 -m http.server 4173` e abra `http://localhost:4173/tools/decision-board/`.

O painel apresenta 15 candidatos com filtros, fontes, ranking provisório editável, shortlist de até três, comparador e exportação Markdown/JSON para a [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2). **Responsivo, sem framework/banco/backend/chave de IA.** Para manutenção por uma chamada de IA, use o prompt único no README do painel. Nenhuma escolha de produto foi feita. [SIGLON: aplicativos públicos e verificação anti-clone](docs/decision/07_SIGLON_APLICATIVOS.md).

## Central de decisão — 5 setores, 15 desafios e 5 áudios (13/11)

**Ponto de entrada atualizado:** [leitura de 2 minutos e documentação consolidada](docs/decision/README.md). É a síntese canônica para o brainstorm; pesquisar primeiro nesta central antes de abrir nova Issue/PR. **Ainda não escolhemos produto e o código do MVP não começou.**

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
