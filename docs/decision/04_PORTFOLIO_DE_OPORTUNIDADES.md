# Portfólio de hipóteses — 15 produtos, ainda SEM ranking

**Última revisão:** 13/11/2026. As 15 opções abaixo são **propostas de produto da equipe** derivadas de 15 desafios presenciais, de cinco áudios e de pesquisa externa. Não são 15 produtos solicitados pela Prefeitura. **Nenhum produto foi aprovado**; não há nota final atribuída.

> Prioridade nesta primeira etapa = identificar **que problema merece uma entrevista agora**, não prever vencedor do hackathon. As notas antigas do desafio (PR #8) não devem ser reutilizadas automaticamente.

## Onde fazer o esforço de validação imediatamente

| Frente a testar | Qual evidência já existe | Pergunta que pode eliminar a hipótese |
|---|---|---|
| **Normas (02.1)** | Representante da Câmara descreveu acervo heterogêneo e protótipo anterior bloqueado | Temos três arquivos históricos legalmente utilizáveis, e qual lacuna de consulta ainda existe? |
| **Conciliação de dados (01.1)** | CTD e gerente SIGLON relataram dados dispersos, duplicações e decisão difícil | Que par de bases específicas não se comunica e qual é a regra de autoridade da fonte? |
| **Resíduos (03.2)** | Palestra mencionou reincidência e qualidade; CMTU relatou contaminação | Precisam rastrear lotes, reincidência ou ambos? Qual é o registro que usam hoje? |
| **Turismo colaborativo (04.3)** | Gerente SIGLON pediu coleta participativa de prestadores; marketplace é ideia do usuário | Existe fluxo/API para atualização? Criador e turista pagariam/participariam de vídeos? |

**Reserva condicionada a mentor técnico:** resiliência/drenagem e inventário arbóreo, onde dados e protocolos podem ser bloqueadores. **Não escolher por essa tabela; usar [rubrica e gates](05_PROTOCOLO_DE_DECISAO.md).**

## Fichas compactas por setor

### S1 — Governança, dados e transparência

#### C01 — Reconcilia Dados · desafios 01.1, 01.2

**Dor:** Duas fontes divergem e ninguém sabe, sem regra de autoridade, qual registro revisar.

**Usuário:** Servidor responsável por dados e integrador de sistemas. **Comprador/decisor possível, não confirmado:** CTD ou secretaria gestora.

**Demo de até 2 min:** Importar 2 CSVs sintéticos de endereços; detectar diferenças; registrar origem, responsável e decisão humana.

**Sistemas/alternativas a checar:** SIGLON e sistemas setoriais.

**Entrevista decisiva:** Qual par de bases reais causa mais retrabalho e qual é o identificador autorizado?

**Bloqueios:** dados restritos; governança sobre fonte mestra.

**Bases da hipótese:** A1: CTD — silos e governança; A4: SIGLON — geodados e turismo; R2: SIGLON — geodados existentes.

#### C02 — SINISA com Proveniência · desafios 01.1, 01.3

**Dor:** Respostas a indicadores dependem de coleta manual e dados difíceis de recuperar.

**Usuário:** Servidor que consolida e valida saneamento. **Comprador/decisor possível, não confirmado:** Secretaria/órgão operador de saneamento.

**Demo de até 2 min:** Comparar duas medições fictícias, fonte, período e responsável; detectar incoerência e gerar pedido de revisão.

**Sistemas/alternativas a checar:** SINISA e fluxos já usados pela equipe municipal.

**Entrevista decisiva:** Quais dados o órgão pode reusar e em qual formato?

**Bloqueios:** acesso a dados oficiais; regras atuais do SINISA.

**Bases da hipótese:** A3: Clima, SINISA, resíduos e drenagem; A4: SIGLON — geodados e turismo.

### S2 — Inteligência legislativa

#### C03 — LexBase · desafio 02.1

**Dor:** O acervo normativo histórico mistura papel, microfilme, PDF e HTML e não está estruturado de maneira uniforme.

**Usuário:** Servidores da Câmara, procuradoria, vereadores e pesquisadores. **Comprador/decisor possível, não confirmado:** Câmara Municipal ou outras câmaras.

**Demo de até 2 min:** Normalizar 3 documentos de tipos distintos e recuperar trecho com proveniência, metadados e vínculo.

**Sistemas/alternativas a checar:** Sistemas legislativos, LexML e consulta existente.

**Entrevista decisiva:** Quais 3 documentos são legalmente utilizáveis e o que falta nos sistemas atuais?

**Bloqueios:** autorização de fontes; validação jurídica/versão.

**Bases da hipótese:** A2: CML — acervo normativo; R4: Legislação pública de Londrina.

#### C04 — LexPerguntas · desafio 02.2

**Dor:** Consulta em linguagem natural ficou presa num protótipo por limitações do acervo.

**Usuário:** Cidadão e servidor legislativo. **Comprador/decisor possível, não confirmado:** Câmara Municipal.

**Demo de até 2 min:** Uma pergunta sobre norma de amostra previamente estruturada com resposta limitada, trecho e link da fonte.

**Sistemas/alternativas a checar:** Portais legislativos e buscadores existentes.

**Entrevista decisiva:** O que a interface atual não resolve? A base confiável pode ser demonstrada?

**Bloqueios:** depende de LexBase; alucinação/segurança jurídica.

**Bases da hipótese:** A2: CML — acervo normativo; R4: Legislação pública de Londrina.

### S3 — Sustentabilidade e clima

#### C05 — EcoLote · desafio 03.2

**Dor:** Rejeitos e contaminação prejudicam qualidade de material recebido para reciclagem.

**Usuário:** Equipe de cooperativa e CMTU. **Comprador/decisor possível, não confirmado:** Prestador/órgão de resíduos.

**Demo de até 2 min:** Registrar três lotes fictícios e categorias de rejeito; calcular proporção e propor revisão/campanha educativa.

**Sistemas/alternativas a checar:** Rotinas e sistemas das cooperativas/CMTU ainda a identificar.

**Entrevista decisiva:** Como a contaminação já é registrada e quem manteria o dado?

**Bloqueios:** observação do processo real; permissão de dados por lote.

**Bases da hipótese:** A3: Clima, SINISA, resíduos e drenagem; R3: CMTU — contaminação de recicláveis.

#### C06 — EcoCiclo · desafio 03.2

**Dor:** Locais de descarte irregular podem voltar ao mesmo estado após limpezas.

**Usuário:** Gestor de limpeza/educação ambiental. **Comprador/decisor possível, não confirmado:** CMTU/SEMA/serviço prestador.

**Demo de até 2 min:** Registrar limpeza fictícia, nova ocorrência e plano de prevenção com responsável e histórico.

**Sistemas/alternativas a checar:** Londrina ON e controle operacional de zeladoria.

**Entrevista decisiva:** Como registrar reincidência sem refazer canal de chamados?

**Bloqueios:** validação com operador; localização/privacidade.

**Bases da hipótese:** A3: Clima, SINISA, resíduos e drenagem.

#### C07 — Resiliência Integrada · desafio 03.1

**Dor:** Ocorrências climáticas exigem comunicação rápida entre órgãos e responsabilidades claras.

**Usuário:** Equipes de Defesa Civil/SEMA/gestão. **Comprador/decisor possível, não confirmado:** Prefeitura/órgão de resiliência.

**Demo de até 2 min:** Simular árvore caída, exibir protocolo de encaminhamento aprovado e trilha de atualização humana.

**Sistemas/alternativas a checar:** Defesa Civil e sistemas atuais de ocorrências.

**Entrevista decisiva:** Qual protocolo oficial e qual etapa de fato gera atraso?

**Bloqueios:** risco à segurança; não emitir alerta/dispatch real.

**Bases da hipótese:** A3: Clima, SINISA, resíduos e drenagem.

#### C08 — DrenaAtlas · desafio 03.3

**Dor:** Mapas, obras e documentos de drenagem podem estar dispersos ou defasados.

**Usuário:** Técnico de drenagem, planejamento e manutenção. **Comprador/decisor possível, não confirmado:** Órgão municipal responsável por drenagem.

**Demo de até 2 min:** Cruzar 3 ativos fictícios, uma evidência documental e indicar pendência de vistoria.

**Sistemas/alternativas a checar:** SIGLON e sistemas de projetos.

**Entrevista decisiva:** Qual inventário existe e qual documento ainda não foi digitalizado?

**Bloqueios:** validação de engenharia; não inferir risco de enchente real.

**Bases da hipótese:** A3: Clima, SINISA, resíduos e drenagem; A4: SIGLON — geodados e turismo; R2: SIGLON — geodados existentes.

#### C09 — Árvore Viva · desafio 03.3

**Dor:** Levantamentos arbóreos por agentes diferentes podem não formar cadastro vivo e consistente.

**Usuário:** SEMA e responsáveis por inventário urbano. **Comprador/decisor possível, não confirmado:** Órgão ambiental/urbanismo.

**Demo de até 2 min:** Três árvores fictícias com fonte, data de inspeção e pendência de atualização.

**Sistemas/alternativas a checar:** SIGLON e inventários existentes.

**Entrevista decisiva:** Quem atualiza e há inspeção com acesso público?

**Bloqueios:** laudo técnico; privacidade/localização.

**Bases da hipótese:** A4: SIGLON — geodados e turismo.

### S4 — Infraestrutura e financiamento

#### C10 — InfraCheck · desafios 04.1, 03.3

**Dor:** Ativos carecem de informações comparáveis para orientar vistorias e manutenção.

**Usuário:** Engenheiro/técnico municipal. **Comprador/decisor possível, não confirmado:** Secretaria/órgão de manutenção.

**Demo de até 2 min:** Checklist de 3 ativos urbanos fictícios inspirado em ASCE com premissas, revisão e vistoria sugerida.

**Sistemas/alternativas a checar:** SIGLON e plataformas de manutenção existentes.

**Entrevista decisiva:** Qual critério técnico validado muda decisão e qual dado existe?

**Bloqueios:** profissional habilitado; não se apropriar de scores de outros índices.

**Bases da hipótese:** A3: Clima, SINISA, resíduos e drenagem; A4: SIGLON — geodados e turismo; R7: INFRA-BR; R8: ASCE Infrastructure Report Card; R9: IPS Brasil.

#### C11 — Turismo Colaborativo · desafio 04.3

**Dor:** Prestadores precisam manter informações de locais e eventos sem depender de coleta manual periódica da Prefeitura.

**Usuário:** Prestador turístico, curador municipal, visitante. **Comprador/decisor possível, não confirmado:** Setor de turismo, hotel, organização ou entidade de destino.

**Demo de até 2 min:** Prestador cadastra ponto fictício, curador revisa e visitante vê registro com atualização e fonte.

**Sistemas/alternativas a checar:** SIGLON, mapa turístico e cadastros existentes.

**Entrevista decisiva:** Qual fluxo atual atualiza os pontos e se há API/protocolo de publicação?

**Bloqueios:** moderação e autorização; diferencial vs SIGLON.

**Bases da hipótese:** A4: SIGLON — geodados e turismo; R2: SIGLON — geodados existentes; R12: Turismo — mapa e vídeo divulgados em 13/11/2026.

#### C12 — Histórias Vivas · desafio 04.3

**Dor:** Criadores locais buscam remuneração por conteúdo e turistas podem querer experiências culturais autorais.

**Usuário:** Turista e criador de vídeo/guia. **Comprador/decisor possível, não confirmado:** Turista, hotel, museu/evento.

**Demo de até 2 min:** Três paradas, vídeo autoral autorizado, desbloqueio/check-in simulados, pagamento e royalty fictícios.

**Sistemas/alternativas a checar:** Tourizzy, VoiceMap, Questo, Tour Londrina e mapa público.

**Entrevista decisiva:** Por que o turista pagaria e o criador participaria? Como distribuir sem alta aquisição?

**Bloqueios:** direitos autorais; competição direta; marketplace de dois lados; payments/IA fora do P0.

**Bases da hipótese:** U1: Marketplace turístico de vídeos, passes e IA de foto; A4: SIGLON — geodados e turismo; R6: Turismo vídeo geolocalizado — Tourizzy.

### S5 — Inclusão digital e serviços

#### C13 — Cidadão Assistido · desafio 05.1

**Dor:** Conexão não garante autonomia em serviços digitais a idosos e grupos com barreiras de letramento.

**Usuário:** Pessoa com dificuldade de serviço digital. **Comprador/decisor possível, não confirmado:** Órgão de atendimento/educação digital.

**Demo de até 2 min:** Uma tarefa pública em modo simulado com passos visuais/áudio, acessibilidade e ajuda humana.

**Sistemas/alternativas a checar:** Portais públicos e atendimento presencial.

**Entrevista decisiva:** Qual tarefa repetidamente exige ajuda e quem validaria uma interface acessível?

**Bloqueios:** teste com usuário real; não coletar dados financeiros/identificáveis.

**Bases da hipótese:** A5: Inclusão, educação, RH e previdência.

#### C14 — EduIntervenção · desafio 05.2

**Dor:** Frequência e desempenho precisam gerar ações pedagógicas revisadas por profissionais.

**Usuário:** Professor, coordenação e responsável escolar. **Comprador/decisor possível, não confirmado:** Secretaria de Educação/rede de ensino.

**Demo de até 2 min:** Frequência fictícia → sinalizar caso → revisão docente → registrar intervenção.

**Sistemas/alternativas a checar:** Sistemas escolares/educacionais existentes.

**Entrevista decisiva:** Qual etapa administrativa não está coberta e qual efeito mensurável?

**Bloqueios:** dados de menores; revisão docente.

**Bases da hipótese:** A5: Inclusão, educação, RH e previdência.

#### C15 — RH em Fluxo · desafio 05.3

**Dor:** RH/previdência exige consistência e rastreabilidade em diversas etapas sensíveis.

**Usuário:** Servidor de RH e beneficiário. **Comprador/decisor possível, não confirmado:** Administração/caixa previdenciária.

**Demo de até 2 min:** Solicitação administrativa fictícia → checklist → revisões humanas → status.

**Sistemas/alternativas a checar:** Sistemas de RH, eSocial e ponto já em teste.

**Entrevista decisiva:** Qual etapa específica gera retrabalho e qual integração é permitida?

**Bloqueios:** dados laborais/médicos; complexidade legal.

**Bases da hipótese:** A5: Inclusão, educação, RH e previdência.

## Como levar à comparação visual (próxima etapa)

- **Catálogo pronto:** [smartcities-decision-v1.json](../../data/decision/smartcities-decision-v1.json). Possui 5 setores, 15 desafios, 15 hipóteses, 20 evidências/referências, usuários, comprador hipotético, demo, concorrência e bloqueios.
- **Sem scores gravados:** seis critérios de 1–5 com pesos transparentes e tratamento para UNKNOWN, acompanhados dos gates de segurança, aderência, usuário, demo e anti-clone.
- **LP a produzir na próxima rodada:** filtros por setor, cards comparáveis, evidências clicáveis, pontuação editável com justificativa, bloqueios visíveis e exportação de decisão para GitHub.
- **Não criar backend para essa LP**: dados versionados e interface local estática, sem credenciais. O banco de ideias será a própria fonte verificável.

### Diferenciar status antes de contar vitória

- **Evidência em áudio:** uma pessoa relatou dor; não representa compra, autorização de API ou teste de protótipo.
- **Evidência pública:** um documento/notícia relata indicador ou programa; não implica que nossa solução seja necessária.
- **Hipótese de produto:** nossa interpretação, mesmo quando ligada a um áudio.
- **Validação com usuário:** só existe depois de conversa identificada por função/data/resposta e revisão da equipe.

**Não fazer implementação até registrar a decisão na [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2).**
