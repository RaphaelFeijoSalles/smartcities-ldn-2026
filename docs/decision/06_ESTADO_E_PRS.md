# Inventário de artefatos e dívida de integração

**Verificado em 13/11/2026:** PRs **#6–#14 abertas, sem merge**. A `main` mantém o README/onboarding inicial; **não contém** a maior parte da pesquisa das branches. Isso é relevante: membros clonando `main` não veem esses documentos por padrão.

## Catálogo das PRs existentes — sem refazer trabalho
| PR | Conteúdo | Estado operacional |
|---|---|---|
| [#6](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/6) | Ferramenta de brainstorm estática, testes e pesquisa da Ouvidoria/Londrina ON | Código de apoio; testes anteriores passaram; validação de navegador/manual separada |
| [#7](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/7) | MasterPlan 2040 + Fórum Desenvolve e cruzamento de propostas | Pesquisa histórica, manter ressalvas sobre projetos atuais |
| [#8](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/8) | Entidades, Barcelona, CODEL/CTD, Rua Sergipe, 15 desafios, **CENTRAL CANÔNICA + DECISION LAB responsivo e testado em CI** | PR de consolidação, aberta; revisar antes de merge |
| [#9](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/9) | Marketplace de vídeos turísticos, passes, GPS e IA por foto | Hipótese do participante, concorrência direta e riscos |
| [#10](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/10) | INFRA-BR, ASCE e IPS Brasil + ideação | Índices **não diretamente comparáveis** |
| [#11](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/11) | Áudio CML sobre acervo/consulta/possíveis conflitos, com LexML | Fonte primária, atenção a normas jurídicas |
| [#12](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/12) | Áudio clima/SINISA/resíduos/drenagem | Fonte primária |
| [#13](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/13) | Áudio gerente SIGLON + turismo colaborativo | Fonte primária; evita criar GIS paralelo |
| [#14](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/14) | Áudio inclusão/educação/RH | Fonte primária; confirma 05.3 |

## Regra anti-loop para novos agentes
1. **Antes de propor nova pesquisa, leia esta central e o link da PR específica.** Não abrir outra PR para repetir conclusão.
2. **Fonte de decisão:** `docs/decision/*` nesta PR; documentos antigos são aprofundamento e **não alteram o resultado da reunião** sem evidência nova.
3. Não iniciar código para todas as ideias; só o produto selecionado na Issue #2.
4. **Integração sugerida (requer revisão humana):** revisar primeiro #8 (central); depois as PRs de fonte #11–#14 e #7/#9/#10 conforme uso; #6 apenas se o quadro auxiliar for necessário. Evitar merges simultâneos que causem conflitos de README/índice.
5. Não duplicar pesquisa longa no README nem na Issue. O README deve apontar para a central; a Issue registra decisão e responsáveis.
6. A PR aberta não prova aprovação ou deploy. **Só marcar DONE quando merge/testes ocorrerem de verdade.**

## Situação de execução
- Pesquisa: **CONSOLIDADA PARA DECISÃO** nesta branch; não significa pesquisa de mercado validada com compradores. Painel de comparação estático entregue em `tools/decision-board/` com avaliações provisórias separadas.
- Código do MVP: **NOT STARTED** até escolha confirmada.
- Stack: **TBD**, preferir web local com fixtures e lógica determinística no P0.
- Regras integrais do hackathon (IA, código preexistente, IP): **UNKNOWN**, confirmar no regulamento.
- Compra/venda, dados privados, GPS real, sistemas municipais: **NÃO AUTORIZADOS** por esta documentação.

### Próxima atualização obrigatória
Após a decisão da equipe, atualizar `docs/team/CONTINUITY.md` e Issue #2 com evidência, meta P0, 3 Issues isoladas e owner por feature. Não classificar o produto como aprovado antes disso.
