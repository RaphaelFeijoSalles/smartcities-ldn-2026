# INFRA-BR × ASCE × IPS Brasil — referências para diagnósticos urbanos

**Consulta:** 13/11/2026. **Status:** pesquisa, não decisão de produto. **Não misturar escores de metodologias, territórios ou anos diferentes.**

## 1. O que cada índice mede e onde pode ser usado
| Índice | Fonte e escopo | Construção | Aplicabilidade correta |
|---|---|---|---|
| **INFRA-BR** — Índice Confea de Infraestrutura do Brasil | CONFEA; compara **27 Unidades da Federação**, não bairros nem municípios | Dimensões → componentes → indicadores. Fontes públicas, normalização e orientação de variáveis, tratamento de ausentes/outliers, ACP para pesos de indicadores e agregação de componentes | Inspirar *estrutura do diagnóstico*, escolha de indicadores, provenance e gaps. NÃO importar o escore estadual como “nota de Londrina” |
| **ASCE Infrastructure Report Card** | Sociedade Americana de Engenheiros Civis; **EUA**, 2025 com 18 categorias | Oito critérios avaliados: capacidade, condição, financiamento, necessidades futuras, operação/manutenção, segurança pública, resiliência, inovação | Inspirar **checklist de avaliação de um ativo** e plano de ação. Notas americanas NÃO medem infraestrutura brasileira |
| **IPS Brasil** — Índice de Progresso Social | Escala 0–100 por municípios; resultado social/ambiental, sem PIB no índice | Três dimensões, componentes e indicadores de resultados; normalização e validação estatística | Conectar investimentos/serviços urbanos a **resultados na vida das pessoas**, sem inferir causalidade automática |

**Fontes oficiais:**
- https://infrabr.org.br/metodologia
- https://infrabr.org.br/sobre?tab=faq
- https://infrabr.org.br/indice-nacional?tab=ranking
- https://www.infrabr.org.br/relatorios/metodologico/2026
- https://infrastructurereportcard.org/making-the-grade/
- https://www.asce.org/publications-and-news/civil-engineering-source/society-news/article/2025/03/25/asce-report-card-gives-us-infrastructure-highest-ever-c-grade/
- https://ipsbrasil.org.br/conheca/metodologia
- https://ipsbrasil.org.br/relatorios/download/IPSBrasil2026_Relatorio%20Geral.pdf

## 2. Resultados observados — não criar comparações falsas
- **INFRA-BR 2026:** Brasil **56,92/100**; Paraná **64,80/100**, **5º entre 27 UFs**. Para PR, dimensões: Energia e Conectividade **71,70**; Mobilidade **49,30**; Água **61,87**; Bem-estar Social e Cidadania **70,50**; Meio Ambiente e Resiliência **59,14**; Saneamento Básico **76,29**. **Não representam Londrina**, não medem condições de uma rua específica.
- **ASCE 2025:** conceito geral **C** para os EUA. Algumas categorias: Solid Waste **C+**; Stormwater **D**; Transit **D**. Conceitos e grades dos EUA; não converter para escala brasileira sem justificativa e dados.
- **IPS Brasil 2026:** **Londrina 67,73/100**, no grupo dos dez municípios não capitais acima de 500 mil habitantes de maior IPS. O IPS **2024/2025/2026 não é estritamente comparável** sem conciliação metodológica por mudança de indicadores/tratamentos. Não usar o PIB per capita como parte do score IPS.
- Fontes de resultados: [ranking INFRA-BR](https://infrabr.org.br/indice-nacional?tab=ranking), [ASCE](https://infrastructurereportcard.org/making-the-grade/), [IPS 2026](https://ipsbrasil.org.br/relatorios/download/IPSBrasil2026_Relatorio%20Geral.pdf) e [Agência Estadual PR, IPS Londrina](https://www.parana.pr.gov.br/aen/Noticia/Acima-da-media-Parana-e-protagonista-de-ranking-nacional-que-mede-bem-estar-da).

## 3. Matriz de indicadores aplicáveis ao hackathon
| Tema e desafio presencial | Referência | Variáveis para um P0 (fontes reais a validar) | Pergunta acionável |
|---|---|---|---|
| **03.2 Gestão integrada de resíduos** | INFRA-BR saneamento (recuperação de recicláveis, cobertura); ASCE waste; IPS condições socioambientais | massa de material, taxa de rejeito, tipo de contaminação, destino (por cooperativa/lote **sintético**) | Qual causa de rejeito merece campanha/ação? |
| **03.3 Infraestrutura verde e hídrica / 03.1 resiliência** | INFRA-BR meio ambiente, ASCE stormwater/condition | impermeabilização, ponto de inspeção, criticidade, última manutenção, medida de adaptação | Onde executar vistoria primeiro e por quê? |
| **01.1 Integração de dados / 01.3 indicadores** | Método multidimensional INFRA-BR/IPS | fonte, unidade, território, ano, cobertura, defasagem, responsável, completude, qualidade | Dois órgãos têm definições compatíveis e dados atuais? |
| **04.1 Monitoramento urbano** | ASCE 8 critérios + INFRA-BR infraestrutura | condição, manutenção, segurança, custo/financiamento e risco, todos por ativo fictício | Qual intervenção é prioridade e qual dado falta? |
| **05.1 Internet pública / 05.2 educação** | INFRA-BR telecom/escolas + IPS oportunidades | cobertura, acesso e resultado para usuários distintos | Quem está sem acesso e como verificar inclusão? |
| **04.2 PPPs/financiamento** | ASCE funding/future need + INFRA-BR acesso/resultado | hipótese de custo, necessidade futura, documentação, indicadores de benefício | Que evidência falta antes de propor um projeto? |

## 4. Regra de modelagem para nosso software
Registrar **cada indicador** em formato rastreável, mesmo no protótipo:
```yaml
indicator_id: recycling_recovery_rate
label: Taxa de recuperação de recicláveis
unit: percent
territory: Londrina
geographical_level: municipality
reference_period: 2026-08
source_name: EXEMPLO_SINTETICO
source_url: null
observed_value: null # nunca inventar índice local real
demo_value: 62.0    # SINTÉTICO e rotulado na interface
direction: higher_is_better
limitation: Sem dados públicos por cooperativa; valores apenas de demonstração
decision_supported: Avaliar se vale investigar um gargalo
validation_status: DEMO_ONLY
```
**Não copiar 62% para slides como dado real.** O valor acima é exemplo apenas da forma do contrato.

### Restrições para agentes
- Escore com fórmula própria precisa explicar **pesos, normalização, valores ausentes, orientação e base**; não chamá-lo de “índice INFRA-BR” ou “nota ASCE”.
- Comparar **UF com UF, município com município** e mesmo período/definição; não usar ranking estadual para classificar a Rua Sergipe.
- Se faltar dado, mostrar **INSUFFICIENT_DATA**, não preencher silenciosamente.
- Tratar evolução e correlações sem inferir causalidade de políticas.
- Índice existente **não prova** problema operacional validado: é ponto de partida para entrevistar operador/usuário.

## 5. Perguntas rápidas para mentor
1. Qual indicador desse tema realmente muda a decisão do gestor?
2. Qual sistema já o mede, em que frequência e com qual qualidade?
3. Quem é o responsável pelo dado e há série territorial/temporal disponível?
4. Como traduzir um sinal ruim em uma **ação verificável** com responsável e prazo?
5. Que dado sensível ou caro precisamos evitar no MVP?

## Evidência necessária antes de usar números no pitch
- fonte original e edição;
- recorte territorial e temporal;
- fórmula e unidade;
- limitações e alteração de metodologia;
- se a métrica é real, calculada sobre dados fictícios ou hipótese.

**Sinal de oportunidade ≠ solução escolhida.** Usar esta pesquisa para selecionar um problema e resultado que a equipe consiga demonstrar em 2 minutos.
