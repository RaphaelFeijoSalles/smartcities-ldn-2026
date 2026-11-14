# Fonte primária — áudio sobre resiliência climática, SINISA, resíduos e drenagem

**Evento:** Smart Cities Hackathon Londrina, 13/11/2026.  
**Arquivo enviado na conversa:** `13-11-2026 21.21.m4a` (~9min51s). O áudio não foi anexado a este repositório para evitar publicar a voz do palestrante sem autorização.  
**Fonte da análise:** conteúdo falado recuperado do arquivo, não notícia ou inferência. O palestrante não foi identificado pelo nome.

## Desafios apresentados — distinguindo fala e hipótese nossa

| Desafio | Evidência do palestrante | Nossa hipótese de software | O que validar |
|---|---|---|---|
| **03.1 Resiliência e clima** | Quedas de árvores, chuva intensa e alagamentos exigem coordenação entre Defesa Civil, Bombeiros, prefeitura, CMTU e SEMA. Pergunta recorrente: quem é acionado, em qual ordem e como acelerar atendimento? | **Resiliência Integrada:** mapa de papéis, protocolos e acompanhamento simulado de ocorrência; sem despacho automático | Qual protocolo oficial e canal já existe? Quem é dono do caso? |
| **03.1/01.1 Dados e planejamento** | SINISA reúne informações de saneamento; servidores podem ter dificuldades para encontrar valores e comprovações; registros técnicos ficam dispersos ou dependem da memória de alguém | **DataSaneamento:** catálogo de fontes, responsáveis, período, evidências e inconsistências para revisão de dados | Que campos e padrões de envio são realmente exigidos? O que o município já usa? |
| **03.2 Gestão integrada de resíduos** | Limpezas em locais de descarte irregular podem ser rapidamente desfeitas por recorrência; educação ambiental e qualidade do material destinado à coleta seletiva são questões relevantes | **EcoCiclo:** registro de locais com reincidência e ações educativas, sem identificação/vigilância automatizada de pessoas | Como CMTU/SEMA registram locais de descarte e reincidência hoje? |
| **03.3 Infraestrutura verde e hídrica** | Assoreamento do Lago Igapó é associado na fala a sedimentos, desafios de drenagem e possível documentação técnica não digitalizada. O palestrante pede atacar causas, não só limpar o efeito | **DrenaLondrina:** inventário documental/geográfico de drenagem, pontos de inspeção e histórico de ação | Quais projetos e redes estão digitalizados? Existe SIGLON/inventário específico? |

## Exemplo concreto contado na palestra
Em Santa Terezinha de Itaipu, o palestrante relatou que os dados de **135 poços** — vazão, volume e profundidade — estavam concentrados na memória de uma pessoa. **Isso é uma experiência relatada de outro município, não um diagnóstico documentado de Londrina.** A hipótese técnica relevante é reduzir dependência de conhecimento tácito e garantir proveniência.

## Outra fonte citada
O palestrante sugeriu séries históricas do **INMET** e discutiu o **SINISA** (Sistema Nacional de Informações em Saneamento Básico), mas não especificou dataset ou método de previsão. Não concluir que IA prevê eventos extremos de maneira confiável; não prometer alertas meteorológicos operacionais.

**Nota de interpretação:** a transcrição pode conter termos imprecisos. A fala atribuiu o preenchimento do SINISA e finalidade de prestação de contas à administração; conferir critérios regulatórios diretamente nas fontes oficiais antes de incorporar exigências legais ao software.

## O denominador comum dos áudios 1, 2 e 3
- Áudio 1 (CTD): fontes municipais heterogêneas e divergência sobre quais registros são atuais.
- Áudio 2 (Câmara): leis em formatos históricos incompatíveis que bloquearam um protótipo de consultas por IA.
- **Áudio 3 (clima/saneamento):** dados difíceis de localizar, sem inventário confiável, com informação concentrada e protocolos intersetoriais pouco claros.

**Hipótese transversal para brainstorm:** um **motor mínimo de proveniência e qualidade de dados** aplicável a documentos normativos, ativos de drenagem ou registros de serviços. **Não** começar por uma plataforma genérica para toda a prefeitura: selecionar um domínio real, obter uma amostra autorizada e executar um fluxo de ponta a ponta.

## MVPs demonstráveis em dois minutos
1. **Resiliência Integrada:** ocorrência SINTÉTICA de árvore caída → órgão/protocolo definido em tabela aprovada → responsável confirma encaminhamento → linha do tempo.
2. **DataSaneamento:** dois registros SINTÉTICOS de extensão de rede com divergência → mostrar origem/período e campo faltante → pedir revisão humana e exportar trilha.
3. **EcoCiclo:** ponto fictício de descarte recorrente → histórico de limpeza → registrar reincidência → encaminhar para campanha educativa.
4. **DrenaLondrina:** mapa esquemático de três pontos fictícios → associar foto/doc técnico autorizado → apontar ausência de inspeção → gerar plano de vistoria.

Sem dados de terceiros, geolocalização pessoal, reconhecimento de infratores, alerta emergencial real ou decisão de risco geotécnico por IA.

## Entrevista de validação — apenas seis perguntas
1. Qual desses problemas se repete semanalmente e qual setor faz a triagem?
2. Qual **sistema existente** registra isso e o que exatamente não consegue entregar?
3. Que campo e fonte oficiais são necessários para tomar uma decisão?
4. Podemos usar **três registros autorizados ou sintéticos** na apresentação?
5. Quem aprovaria a regra de encaminhamento e qual deve ser o gatilho de escalonamento humano?
6. Qual métrica real permitiria avaliar um piloto (tempo, completude, reincidência)?

## Próxima decisão
Confrontar esta fonte com o ranking dos 15 desafios documentado na [PR #8](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/8) e o relato da Câmara na [PR #11](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/11). **Nenhuma ideia foi escolhida automaticamente.** Registrar a seleção na [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2).
