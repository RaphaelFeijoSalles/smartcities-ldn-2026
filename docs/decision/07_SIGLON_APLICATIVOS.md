# SIGLON — catálogo de aplicativos públicos para checagem de concorrentes

**Link informado pela equipe:** https://geo.londrina.pr.gov.br/portal/apps/sites/#/aplicativospublicossiglon  
**Revisão:** 13/11/2026.

## O que foi possível verificar
- A URL leva a uma aplicação web do portal SIGLON. Ela é carregada de forma dinâmica; a lista completa de aplicativos não ficou acessível no conteúdo textual recuperado. **Não presumir que verificamos todas as funcionalidades existentes**.
- A [página institucional do SIGLON](https://portal.londrina.pr.gov.br/o-que-e-siglon) descreve uma plataforma de georreferenciamento de dados públicos, alimentada por diferentes órgãos.
- **Alerta da própria Prefeitura:** dados geográficos não devem ser usados para consulta de viabilidade técnica sem consultar os órgãos competentes.

## Checklist anti-clone para o brainstorm
1. Abra o link e localize os aplicativos referentes a **endereços, turismo, árvores, drenagem, resíduos ou ativos urbanos**.
2. Anote o **nome, finalidade, tipo de dado, data da atualização e fonte** de cada aplicativo relevante, sem inferir atualização em tempo real.
3. Pergunte ao operador: falta **visualização, coleta de atualização por terceiro, autorização, conciliação de registros ou acompanhamento de tarefa**?
4. Identifique quem é responsável por autorizar a edição e quais dados podem ser usados no MVP, sem copiar uma base restrita.
5. Se algum aplicativo já fizer todo o fluxo proposto, **mude a ideia** antes de implementar.

## Hipóteses que devem consultar o portal
- **C01 Reconcilia Dados** — localizar ferramentas que conciliem endereços e registro de origem/atualização; não refazer um GIS.
- **C11 Turismo Colaborativo** — checar se prestadores já têm interface para publicar/atualizar locais, eventos e serviços; vídeos pagos são produto separado.
- **C08/C09/C10** — checar se existem inventários de drenagem, árvores e ativos para não clonar mapas ou publicar diagnóstico técnico sem competência.

## Como atualizar com uma só chamada de IA
Após observar os aplicativos, descreva para o agente: **“Atualize o registro R14, os limites e os candidatos afetados no catálogo e seus testes; não edite o layout, não afirme permissão de API e abra uma PR pequena”**. O passo-a-passo integral está em [README do painel](../../tools/decision-board/README.md).

**Fatos e hipóteses são distintos.** Uma aplicação presente no catálogo prova que um sistema existe, mas não demonstra qual demanda continua sem solução. Não alegar parceria ou autorização institucional.
