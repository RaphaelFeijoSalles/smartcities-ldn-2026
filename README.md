# Smart Cities Londrina 2026 — equipe AI-First

> **Fase: DISCOVERY / BRAINSTORM.** Ainda não há produto escolhido nem MVP implementado. O objetivo deste repositório é permitir que todos colaborem sem travar no Git, com pesquisa rastreável, tarefas curtas e IA com escopo seguro.

**Evento:** Smart Cities Hackathon, Londrina, 13–15/11/2026. Tema divulgado: **Transformação Digital na Gestão Pública**. O regulamento/desafios oficiais específicos ainda precisam ser confirmados na abertura. Não confundir hipóteses deste repositório com desafios oficiais.

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
