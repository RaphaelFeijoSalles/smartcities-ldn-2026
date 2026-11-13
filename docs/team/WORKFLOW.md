# Workflow enxuto — humanos + agentes

## Princípio
**Cada tarefa deve poder avançar sem que Raphael vire suporte de Git de todo mundo.** Tarefas de 20–45 min como referência, reduzidas se travarem. Melhor PR pequena integrada que muitas branches inacabadas.

## Quadro único
Issues no GitHub: `BACKLOG` → `READY` → `IN PROGRESS` → `REVIEW` → `DONE`; laterais `BLOCKED` e `NEEDS DECISION`. Inicialmente use o título/comentários da Issue; automatizar labels depois se útil.

## Ciclo
1. Integrador descreve Issue com problema, aceite, arquivos de responsabilidade e validação.
2. Integrante escolhe a Issue; confirma que ninguém já está fazendo.
3. Cria branch `feat/HACK-<id>-nome` a partir de `main` atualizada. Não fazer push para `main`.
4. A IA lê `AGENTS.md` e a Issue, edita apenas paths autorizados e executa testes focais.
5. Publica branch, abre PR com template e sinaliza bloqueios.
6. Integrador revisa e faz merge na `main`, verificando que a demonstração permanece funcional. Outros atualizam `main` antes da tarefa seguinte.

## Ownership inicial, ajustável ao brainstorm
- Raphael: arquitetura, decisões técnicas, integração, contratos, configuração/CI, merges.
- Miguel: problema/usuários/comprador, pesquisa, validação, marketing, LP/copy e pitch.
- Outros: telas, componentes, tarefas de backend isoladas, testes e protótipo; **definir responsável nominal na Issue**.
- `hot files`: `README.md`, `AGENTS.md`, contratos, rotas globais, pacotes/dependências, CI, migrations, config e fluxo de deploy. Só integrador ou acordo explícito.

## Regras de segurança e velocidade
- Nunca compartilhar token, dar push direto em `main`, reescrever histórico alheio ou alegar testes não feitos.
- Nada de deploy público ou gastos sem autorização. Demo local é suficiente inicialmente.
- Prototipar **um caso feliz completo** primeiro, depois estados de erro.
- Checkpoint de integração regular; antes da apresentação, parar features e ensaiar.
- Se não houver ambiente técnico instalado, o integrante pode avançar pesquisa, copy, testes exploratórios ou protótipo visual, sem bloquear a equipe.

## Handoff em até 8 linhas
```text
Issue / responsável / branch / PR:
O que está pronto:
Como reproduzir:
Testes executados (PASS/FAIL/NOT RUN):
Arquivos alterados:
Pendências:
Bloqueios/riscos:
Mudanças que preciso do integrador:
```
