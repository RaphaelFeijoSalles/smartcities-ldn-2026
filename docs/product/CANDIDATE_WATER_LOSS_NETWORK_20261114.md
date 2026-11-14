# Candidata — HidroRastro: balanço hídrico por setor, indícios de perda e fila de inspeção

**Pesquisa:** 14/11/2026 · **Status:** hipótese nova, NÃO escolhida pela equipe e NÃO implementada. Relaciona-se aos desafios apresentados **04.1 Central de monitoramento urbano**, **03.3 Infraestrutura verde e hídrica** (confirmar abrangência de água tratada) e **01.1 Integração de dados**. Usar 04.1 como enquadramento principal até validação com mentor.

## Proposta do participante
Observar a água que entra e sai de diferentes pontos de distribuição, usar pressão/vazão para estimar volume não explicado e priorizar verificação de vazamentos ou consumo irregular. Encaminhar à equipe responsável. **Não acusar moradores, endereços ou propriedades de “gato” sem investigação autorizada.**

## Veredito com condicionantes
- **Dor real:** Londrina tem indicador público de perdas na distribuição; serviço delegado à **Sanepar**, não operação direta da Prefeitura.
- **MVP em 2 minutos com dados sintéticos e uma estatística municipal de referência:** viável, desde que mostre **balanço por setor**, não “perda calculada apenas pela queda de pressão”. Demonstração técnica, **não medição real**.
- **Detecção/quantificação por pontos reais de Londrina só com dados abertos:** **NÃO DEMONSTRADA**. Os portais nacionais divulgam indicadores municipais/agregados, não leituras de pressão e vazão em cada nó/tubo; não encontramos telemetria setorial livre para download.
- **Piloto com dado real:** depende de autorização da Sanepar, mapa da topologia hidráulica, medidores de entrada e saída, demanda legítima por setor, dados com timestamp, operação de válvulas/bombas e regras de tratamento da telemetria.
- **Concorrência:** a Sanepar já declara uso de telemetria, acústica, IA, satélite e software preditivo. Em Londrina, **AquaVoltex** ficou em 2º lugar no Smart Cities 2024 com monitoramento de vazamentos. NÃO alegar ideia inédita.
- **Notas de discussão (subjetivas, fora do ranking canônico):** oportunidade 4,4/5; demo sintética 4,2/5; **uso operacional apenas com dados abertos sem parceria = baixo**, pois a base setorial não foi localizada. Notas NÃO são pesos oficiais nem previsão de sucesso.

## Dados: o que realmente está aberto
| Fonte | Escopo encontrado | Para que serve | O que NÃO proporciona |
|---|---|---|---|
| [SINISA 2025 — ano-base 2024](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/sinisa/resultados-sinisa/resultados-sinisa-2025) | Planilhas por prestador/município: produção, consumo, perdas, indicadores e glossários | Contextualizar perdas históricas e comparar indicadores em anos compatíveis | Leituras de pressão/vazão por tubulação ou sensor em tempo real |
| [SINISA 2024 — ano-base 2023](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/sinisa/resultados-sinisa) | Dados nacionais de saneamento por módulo | Linha de base antiga, com transparência do período | Contagem localizável de vazamentos em ruas |
| [Instituto Água e Saneamento — Londrina](https://www.aguaesaneamento.org.br/municipios-e-saneamento/pr/londrina) | Apresenta **29,6% no índice de perdas na distribuição**, com fonte SINISA 2024 | Provar relevância local, com ano/denominador corretos | Não significa que 29,6% da água escorre fisicamente; inclui perdas aparentes |
| [ANA Dados Abertos](https://dadosabertos.ana.gov.br/) e [Hidroweb](https://www.snirh.gov.br/hydroweb/) | Rios, reservatórios, precipitação e uso de recursos hídricos | Contexto hidrológico regional; eventualmente abastecimento | Pressão na rede urbana de distribuição de água tratada |
| [SIGLON downloads](https://portal.londrina.pr.gov.br/downloads-siglon) | Camadas e geosserviços municipais públicos | Mapa-base/zonas públicas, conforme licença e responsabilidade | Não assumir que topologia da Sanepar, válvulas ou hidrômetros são publicados |
| [Sanepar qualidade](https://www.sanepar.com.br/qualidade) | Controle da qualidade da água | Contextualização dos serviços | Não é telemetria da rede nem série de perdas por trecho |

**Cuidado metodológico:** anexo contratual de Londrina publicado pela Sanepar traz metas de **“índice real de perdas”** em outro período/definição; não comparar diretamente com o índice do SINISA sem reconciliar fórmula, exportação/importação, período, serviço e perdas aparentes. [Contrato e metas](https://www.sanepar.com.br/sites/default/files/2025-11/LONDRINA%20-%20COP%20N%C2%BA%20160-16.pdf).

## Como medir de modo tecnicamente defensável
**Unidade operacional ideal:** setor de medição e controle (DMA), delimitado hidraulicamente. Fluxos de entrada/saída, consumo legítimo e mudanças de armazenamento devem ser considerados no **mesmo intervalo**.

\[
V_{nao\_explicado}\approx V_{entradas}-V_{saidas}-V_{consumo\_autorizado}-\Delta V_{reservatorios}
\]

Se a área não for hidraulicamente isolada, houver múltiplos caminhos não medidos, vazão em horários diferentes ou medidores descalibrados, **não há estimativa confiável**. Consumo não contabilizado pode incluir erro de medição e conexões não registradas, mas **não se conclui fraude** a partir de desequilíbrio.

A **pressão** serve como variável complementar para anomalias, controle e investigação. Uma queda de pressão isolada pode decorrer de consumo, altitude, manobra de válvula, bomba, manutenção ou vazamento. **Pressão sozinha não quantifica a perda.**

A **vazão mínima noturna** é método usado para triagem de perdas em setores, ajustando consumo legítimo noturno e variação de operação. Para localizar vazamento exato, em geral são necessários equipamentos/inspeção complementares (geofone, correlacionador, setorização e validação de campo).

Fontes metodológicas:
- [EPA — Control and Mitigation of Drinking Water Losses](https://www.epa.gov/sites/default/files/2015-05/documents/epa816r10019.pdf)
- [World Bank — métodos de redução de perdas](https://documents1.worldbank.org/curated/en/479201468316169165/pdf/441260WSP0BOX31e0reduction01PUBLIC1.pdf)
- [EPA — EPANET, simulador aberto de redes](https://www.epa.gov/water-research/epanet)

## Fluxo de demo viável (2 min; todos os volumes são FICTÍCIOS)
1. **Mapa esquemático de 3 setores** com reservatório, medidores e pressão ilustrativa. Não retratar como rede real da cidade.
2. Selecionar Setor B, com **entrada 12 m³/h**, **saída medida 8 m³/h** e **consumo autorizado 2 m³/h** durante a hora, sem mudança de armazenamento → **diferença 2 m³/h** (2 m³ nesse intervalo).
3. Mostrar histórico fictício de vazão noturna e pressão, qualidade da medição e **alerta “anomalia a investigar”**.
4. Abrir **solicitação simulada de inspeção**, com evidências, período, hipótese de vazamento e revisão humana.
5. Apresentar **limite explícito**: sem telemetria setorial da Sanepar não fazemos monitoramento real; os dados abertos só provam a pertinência municipal.

## Arquitetura AI-First, baixo risco
- **P0:** UI React/TypeScript opcional ou HTML/JS estático com SVG e fixtures JSON; motor determinístico de balanço e regras de alerta; dataset sintético rotulado; uso de mapa real somente com base verificada e autorizada. Não exigir sensores/IA generativa/conta/internet para demo.
- **P1:** importador CSV de setores reais e séries reais **com autorização**; relatórios com metadados, período, calibração e flags de confiança.
- **P2:** análise robusta de séries temporais e **EPANET** para simulação/modelagem, condicionado a topologia e parâmetros hidráulicos. IA pode explicar anomalias com fonte, mas não inventar volume ou acusar irregularidade.
- **P3:** piloto com prestador e feedback operacional, KPI de inspeções corretas, latência de descoberta, redução de perdas **realmente medida** e falsos positivos.
- **Destinatário operacional:** **Sanepar**. [Canal para informar vazamento](https://www.sanepar.com.br/informe-um-problema). Prefeitura pode ser comunicada em contextos institucionais, mas **não é o responsável padrão pelo reparo da rede da Sanepar**.

## Principal risco de produto: já existe
- [Sanepar — tecnologias de perdas 2026](https://www.sanepar.com.br/noticias/com-sanepar-parana-tem-um-dos-menores-indices-de-desperdicio-de-agua-no-brasil): telemetria, IA acústica, satélite, geofones, modelos preditivos, válvulas redutoras.
- [Sanepar — telemetria na rede 2026](https://www.sanepar.com.br/noticias/sanepar-usa-sensores-inteligentes-para-monitorar-redes-de-agua-e-esgoto-no-litoral): monitoramento em cidades do litoral; **não assumir disponibilidade pública em Londrina**.
- [Smart Cities Londrina 2024 — 2º colocado AquaVoltex](https://www.londrinainteligente.com.br/hackathon2024): monitoramento de vazamentos de água. É essencial perguntar como diferenciar ou colaborar.

## Perguntas decisivas para mentor/Sanepar
1. **“Existe alguma série de vazão e pressão por setor de Londrina que possamos usar anonimizadamente ou em um piloto? Se não, podemos receber uma amostra fictícia com estrutura realista?”**
2. “Qual etapa de identificação → priorização → inspeção → fechamento ainda depende de planilha ou trabalho manual, considerando os sistemas já existentes?”
3. “Os setores hidráulicos, suas entradas/saídas, macromedidores e consumo estão documentados e disponíveis para o teste?”
4. “Que padrões de falha e fontes de falso alarme precisam ser separados de um vazamento?”
5. “Qual evidência mínima validaria valor: priorização mais rápida, menos falso positivo, volume verificado ou resultado de inspeção?”

**Decisão:** não escolher automaticamente. Submeter à [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2), junto ao Decision Lab da PR #8, e comparar com LexBase/Reconcilia Dados/EcoLote. O candidato só deve entrar no ranking final após definir **operador, fonte de dados permitida e diferencial frente aos sistemas da Sanepar**.
