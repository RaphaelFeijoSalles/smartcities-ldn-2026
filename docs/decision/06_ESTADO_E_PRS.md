# Estado de PRs, Issues e merge — verificado em 14/11/2026

**Fonte:** consulta direta ao GitHub nesta data. **PR #8 = CLOSED/MERGED. Há 11 PRs abertas (#6,#7,#9–#17) e 5 Issues abertas (#1–#5), antes das PRs/issues criadas em 14/11.** O código EcoVisão P0 também está em PR experimental #18; a branch de organização contém referências Folha + 16º candidato ao painel e requer integração.

**Regras de governança:** não fechar PR como se o conteúdo estivesse na main; não mesclar código provisório como aplicação escolhida. Revisar `mergeable` e CI novamente antes de qualquer merge, pois estados mudam. PR “CI verde” não prova adequação jurídica, licença ou teste de vídeo.

## Estado/ação de cada PR

| PR | Tema | Estado na auditoria | Ação recomendada |
|---:|---|---|---|
| [#8](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/8) | Decision Lab + pesquisa consolidada | **MERGED** | **Não refazer** |
| [#6](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/6) | Outro quadro de brainstorm | Aberta, GitHub relatou `mergeable:false` | Comparar com Decision Lab; se duplicada, registrar motivo e **fechar sem merge**; recuperar apenas recurso único se houver |
| [#7](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/7) | MasterPlan/Fórum + README | Aberta, `mergeable:false` | Integrar arquivos de pesquisa úteis com revisão; **não sobrescrever README** atual; depois fechar PR antiga como substituída ou resolver conflito |
| [#9](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/9) | Turismo vídeo/IA | Aberta, `mergeable:false` | Manter como hipótese; resolver bloqueio/status antes de merge documental |
| [#10](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/10) | INFRA-BR, ASCE, IPS | Aberta, `mergeable:false` | Revisar fontes e integrar dossiês para histórico, não para sprint atual |
| [#11](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/11) | Áudio CML | Aberta, `mergeable:true` | Documental prioritária, revisar autoria/evidência e mesclar se CI/aceite passarem |
| [#12](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/12) | Áudio ambiente/SINISA | Aberta, `mergeable:false` | Revalidar conflito/status; fonte de contexto, não bloquear MVP |
| [#13](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/13) | Áudio SIGLON | Aberta, `mergeable:false` | Revalidar conflito/status; lembrar SIGLON já existe |
| [#14](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/14) | Áudio 5, inclusão | Aberta, `mergeable:true` | Revisar e mesclar documentalmente se CI verde |
| [#15](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/15) | HidroRastro | Aberta, `mergeable:true` | Manter como hipótese de produto; merge só documentação revisada |
| [#16](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/16) | LexBase | Aberta, `mergeable:true` | **Alta prioridade** para preservar opção reserva; integrar dossiê |
| [#17](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/17) | EcoVisão + modelos e fotos da Folha | Aberta, `mergeable:true` antes dos novos links | **Alta prioridade**; checar licença/limites; referência das imagens é externa, não copiar |
| [#18](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/18) | Spike EcoVisão FastAPI/SQLite/UI | **NOVA, não mesclada** | Exige **Issue #2 decisão, Issue #1 regras, CI e smoke manual**. YOLO NOT RUN |

**Nenhuma PR aberta da pesquisa precisa ser mesclada para começar a comparar opções ou executar o spike isolado.** Não tratar `mergeable:false` automaticamente como um conflito de código confirmado; conferir a aba GitHub e o diff.

## Por onde começar merges quando a equipe decidir
1. **Escolher e registrar produto e reserva na Issue #2**, regras essenciais na #1. Não escolher por nota de IA isolada.
2. **Priorizar PR documental #17 e #16** (contexto de EcoVisão/LexBase), depois outras PRs documentais úteis, sempre com CI/revisão.
3. **Revisar e mesclar esta PR de organização** (painel agora inclui EcoVisão C16 + roteiro da equipe). Executar testes do Decision Lab.
4. **PR #18**: abrir a demo local, verificar 7 testes de API, smoke em celular e desktop; mesclar **somente se EcoVisão for escolhida ou o experimento for aceito no escopo**.
5. Preparar PRs isoladas de mapa/UX, detector/benchmark, dataset/validação e integração; só mesclar após os gates individuais.
6. **PRs antigas #6 e #7:** resolver duplicação ou conteúdo exclusivo depois de estabilizar demo; fechamento deve citar PR/commit que substitui, para não perder pesquisa.

## Issues existentes — por que ainda abertas?
| Issue | Gate obrigatório para fechar | Responsável operacional |
|---|---|---|
| [#1 Regras](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/1) | Enunciado/edital completo e autorização de IA, código preexistente, licenças, IP, critérios; fonte datada | Raphael + equipe/organizador |
| [#2 Decisão](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2) | Ideia escolhida, reserva, usuário, alternativa atual, demo P0, fonte de dados, responsáveis e 3 Issues | Equipe; Raphael coordena |
| [#3 Onboarding](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/3) | Integrante abre PR sozinho e outro revisa/integra; tokens seguros | João/Tiago + Raphael |
| [#4 Comercial](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/4) | Miguel registra 2–5 conversas se houver, usuário, comprador, alternativa e pitch; sem inventar entrevistas | Miguel, antes de 13h para handoff |
| [#5 Engenharia](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/5) | Fluxo real testado por colega, PR revisada, demo/vídeo de backup e testes | Raphael + equipe |

## Três decisões que impedem declarar o hackathon pronto
1. **Enunciado/regulamento e escolha** ainda não foram comprovados nos arquivos canônicos.
2. **Detector em vídeo brasileiro** ainda não foi testado com licença de pesos/código esclarecida — mock ≠ produto de visão computacional.
3. **Demonstração end-to-end** ainda não tem smoke manual confirmado em diferentes aparelhos.

## Handoff e artefatos
- [Plano de hoje](../team/START_NOW_20261114.md)
- [PR de código EcoVisão](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/18)
- [Issue #2 de decisão](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2)

**Última regra:** manter a main estável; não reduzir PR count à custa de perder evidência ou mascarar blockers.
