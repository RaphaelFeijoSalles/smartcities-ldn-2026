# MasterPlan Londrina 2040 — extração para o Smart Cities 2026

**Consulta:** 13/11/2026. **Status:** pesquisa de referência, NÃO um desafio oficial do hackathon, uma parceria institucional ou uma validação de usuário.  
**Documento-base:** [MasterPlan Londrina 2040, Prefeitura/CODEL (PDF)](https://codel.londrina.pr.gov.br/images/CODEL_MASTERPLAN/MasterPlan_Londrina_2040.pdf). **Contexto:** [página da CODEL, atualizada em 2026](https://codel.londrina.pr.gov.br/index.php/masterplan.html).

## 1. O que é e por que importa
- Plano estratégico de longo prazo elaborado a partir de 2020/2021 com participação de poder público, empresas e sociedade; organiza **diagnóstico → visão de futuro → metas → carteira de projetos → governança**.
- A versão consultada contém **seis áreas de resultado**, **30 desafios prioritários** e **79 projetos estratégicos**; isso descreve a carteira daquele documento, **não o número de projetos ativos hoje**. Ver capítulo 3, [páginas 68–70 do PDF](https://codel.londrina.pr.gov.br/images/CODEL_MASTERPLAN/MasterPlan_Londrina_2040.pdf#page=69).
- A área **“Protagonista e Eficiente”** trata explicitamente de transformação digital, transparência, integração, desburocratização e gestão por resultados, em linha com o tema do hackathon. Ver [páginas 58–66](https://codel.londrina.pr.gov.br/images/CODEL_MASTERPLAN/MasterPlan_Londrina_2040.pdf#page=59).
- O plano destaca como dificuldades históricas a fragmentação entre sistemas/secretarias, burocracia e carência de decisões com base em evidências. **São diagnóstico do estudo original; não afirmar que permanecem iguais em novembro/2026 sem validação.**

## 2. Projetos numerados úteis para inspirações de software
Transcrição resumida dos títulos da **carteira histórica** de [página 70 do PDF](https://codel.londrina.pr.gov.br/images/CODEL_MASTERPLAN/MasterPlan_Londrina_2040.pdf#page=71), não status contemporâneo:

| ID do plano | Projeto histórico | Oportunidade digital a INVESTIGAR | Cuidado |
|---|---|---|---|
| 9 e 10 | Plano Londrina Cidade Inteligente; Londrina Cidade da IA | Módulos específicos de decisão assistida, não um “chatbot genérico” | Já existem iniciativas de IA; confirmar duplicação |
| 67 | Governança do MasterPlan | Acompanhar compromissos, responsáveis, evidências e marcos | Há governança e registros existentes |
| 69 | Profissionalização da captação de recursos | Estruturar proposta, elegibilidade e checklist de projetos | Não prometer acesso a verbas nem interpretar edital automaticamente |
| 71 | Londrina Governo Digital | Simplificar UM serviço/processo real | Órgãos já têm portais, SEI e serviços digitais |
| 72 | Centros integrados de atendimento | Handoff entre departamentos com rastreio de etapa | Exigir fluxo atual e autorização para integração |
| 73 | Revisão de leis obsoletas/conflitantes | Navegação de requisitos com fontes e revisão humana | **Não** emitir parecer jurídico automatizado |
| 74 | Modernização e profissionalização da gestão | Painel operacional de gargalos e retrabalho | Demonstrar utilidade além de dashboard comum |
| 75 | Melhoria da qualidade do gasto público | Comparação explicável de cenários com restrições | Dados e premissas rastreáveis; não afirmar economia real |
| 76 | Modernização administrativa | Checklists, triagem e procedimentos repetitivos | Confirmar responsável pelo processo e impacto |
| 77 | Aprimoramento da transparência das informações | Explicação acessível de progresso e indicadores com fontes | Checar portais de transparência existentes |

**Fonte para IDs/títulos:** MasterPlan, capítulo 3, pág. 70. **Ideias da terceira coluna são hipóteses da equipe**, não propostas oficiais implementadas.

## 3. Padrões reutilizáveis para um MVP forte
1. **Cadeia de evidência:** problema histórico → objetivo público → ação → responsável → indicador → fonte → data de atualização.
2. **Governança visível:** deixar claro *quem decide*, *quem executa*, *qual é o próximo passo* e *como acompanhar a execução*.
3. **Planejamento conectado:** não apresentar ferramenta isolada; mostrar integração possível com plano, secretaria, serviço e indicador.
4. **Cidadão no resultado:** não terminar em gráfico; demonstrar como o gestor toma uma decisão mais clara.
5. **Continuidade:** exportação, trilha de decisões, explicação de critérios e funcionamento sem dependência de uma pessoa ou fornecedor.

## 4. Descoberta atual (não confundir o PDF original com 2026)
A [página de Governança Pública da Prefeitura (atualizada em novembro/2026)](https://portal.londrina.pr.gov.br/governanca-publica) já expõe **uma apresentação e uma planilha de alinhamento entre MasterPlan, planos estratégicos das secretarias e ODS**, além de informar reavaliação dos planos de órgãos municipais em 2026 e atualização do próprio MasterPlan.

**Implicação competitiva:** um app que somente correlacione plano + secretaria + ODS **já reproduziria trabalho existente**. O diferencial precisa ser validado: ex. registrar execução com evidências; mostrar lacunas de informação; facilitar o acompanhamento de indicadores; explicar trade-offs de priorização. Nenhum desses diferenciais foi confirmado como necessidade dos usuários.

## 5. Cinco perguntas para um mentor/servidor
1. Como a equipe acompanha hoje os **projetos prioritários**: planilha, SEI, dashboard ou outra ferramenta?
2. Qual etapa do acompanhamento dá mais trabalho: coletar dados, atualizar status, comprovar entregas, coordenar pastas ou reportar resultados?
3. Que informação é **pública** e atualizada, e qual exige autorização?
4. Onde há um indicador existente mas falta capacidade de **tomar uma ação** a partir dele?
5. Um protótipo que complemente a ferramenta atual seria testável por algum servidor/gestor amanhã?

## Registro de limites
- O material histórico não prova situação atual dos 79 projetos nem implica apoio da Prefeitura.
- Não coletar dados pessoais nem fazer integração institucional sem autorização.
- Para o hackathon, usar **dados sintéticos marcados** no protótipo e citar documentos originais no pitch.
- Antes de escolher produto, confirmar desafios oficiais e critérios na [Issue #1](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/1).

### Links
- [PDF original MasterPlan 2040](https://codel.londrina.pr.gov.br/images/CODEL_MASTERPLAN/MasterPlan_Londrina_2040.pdf)
- [CODEL — Masterplan, metodologia](https://codel.londrina.pr.gov.br/index.php/masterplan.html)
- [Portal de Governança Pública, atualização e mapeamento em 2026](https://portal.londrina.pr.gov.br/governanca-publica)
- [Fórum Desenvolve Londrina — Masterplan](https://www.forumdesenvolvelondrina.org.br/masterplan)
