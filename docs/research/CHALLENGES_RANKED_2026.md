# Ranking preliminar dos 15 desafios — Smart Cities Londrina 2026

**Data:** 13/11/2026. **NÃO É NOTA OFICIAL DO EVENTO.** É uma heurística feita para a equipe escolher um MVP viável até domingo, com base na apresentação presencial e pesquisa pública. Atualizar depois de entrevistas/mentoria.

**Fonte dos títulos:** [transcrição da foto do slide presencial](CHALLENGES_OFFICIAL_2026.md). **Escopo do desafio ≠ produto definido.** Todas as soluções propostas abaixo são **hipóteses**.

## Método de avaliação, reproduzível

Cada critério recebe nota de **1 (fraco) a 5 (forte)** e média ponderada:
1. **Aderência direta ao desafio presencial — 30%**
2. **Dor sustentada por sinal público, ainda sem validação de usuário — 25%**
3. **Clareza de demonstração (2 minutos) — 20%**
4. **Viabilidade de um MVP limitado até domingo — 15%**
5. **Caminho plausível de adoção/piloto (não contratação garantida) — 10%**

`score = aderencia*0.30 + dor*0.25 + demo*0.20 + viabilidade*0.15 + adocao*0.10`.

**Gates contra falsas vencedoras:** se **viabilidade <= 2**, não escolher sem um especialista/fluxo recortado; se não houver validação com alguém do domínio, classificar como hipótese; se já houver solução institucional equivalente, redefinir diferencial ou descartar. Empates são ordenados por ID, **não** indicam certeza estatística.

| # | ID | Desafio | Notas A/D/Demo/V/Adoção | Total / 5 | Situação |
|---|---|---|---|---:|---|
| **1** | 03.2 | Gestão integrada de resíduos | 5 / 5 / 5 / 5 / 4 | **4.90** | **Validar primeiro** |
| **2** | 02.1 | Estruturação do acervo normativo da CML | 5 / 4 / 5 / 5 / 4 | **4.65** | **Validar primeiro** |
| **3** | 01.1 | Integração de dados | 5 / 4 / 5 / 4 / 4 | **4.50** | **Validar primeiro** |
| **4** | 03.3 | Infraestrutura verde e hídrica | 5 / 3 / 5 / 4 / 3 | **4.15** | Alternativa |
| **5** | 04.3 | Turismo digital | 4 / 3 / 5 / 5 / 3 | **4.00** | Alternativa |
| **6** | 02.2 | Automatização humanizada de atendimento ao cidadão | 4 / 3 / 5 / 5 / 2 | **3.90** | Alternativa |
| **7** | 01.3 | Planejamento e monitoramento de indicadores em tempo real | 4 / 4 / 4 / 3 / 4 | **3.85** | Alternativa |
| **8** | 01.2 | Governança de TI e Política Municipal de dados | 5 / 3 / 3 / 4 / 3 | **3.75** | Alternativa |
| **9** | 03.1 | Plano de resiliência e clima | 4 / 4 / 4 / 3 / 3 | **3.75** | Alternativa |
| **10** | 04.1 | Central de monitoramento urbano | 4 / 4 / 4 / 2 / 4 | **3.70** | **Cuidado: esforço/risco elevado** |
| **11** | 02.3 | Detecção de conflitos legais | 5 / 3 / 4 / 2 / 3 | **3.65** | **Cuidado: esforço/risco elevado** |
| **12** | 05.1 | Internet pública para todos | 4 / 4 / 3 / 1 / 3 | **3.25** | **Cuidado: esforço/risco elevado** |
| **13** | 04.2 | PPPs e concessões | 4 / 3 / 3 / 2 / 3 | **3.15** | **Cuidado: esforço/risco elevado** |
| **14** | 05.3 | Modernização de RH e previdência | 4 / 3 / 3 / 2 / 3 | **3.15** | **Cuidado: esforço/risco elevado** |
| **15** | 05.2 | Plataforma única de educação | 3 / 3 / 4 / 2 / 3 | **3.05** | **Cuidado: esforço/risco elevado** |

**Leitura rápida:** os 3 primeiros são a **fila de validação**, não uma decisão da equipe. O ranking pode mudar ao encontrar o enunciado detalhado, um mentor com acesso ao processo ou a alternativa que já existe.

## 15 perfis — problema, MVP, demo, validação e risco

### 01.1 — Integração de dados (Governança, dados e transparência)
**Nota:** 4.50/5 — A/D/Demo/V/Adoção = 5/4/5/4/4. 

- **Problema a verificar:** Dados de órgãos/planilhas não se comunicam suficientemente para uma decisão única.
- **Recorte de MVP:** Importar dois CSVs fictícios de secretarias diferentes, normalizar IDs, mostrar divergências e consolidar um caso.
- **Demo de 2 minutos:** Carregar base A + B → encontrar registro desencontrado → corrigir/conciliar → exibir evidência e status.
- **Dados necessários:** Dois CSVs sintéticos; portal Dados Abertos e Governança para investigar formatos.
- **Quem ouvir:** CTD, governança municipal, área de TI de secretaria.
- **Pergunta decisiva:** “Qual é o primeiro par de bases que gera retrabalho hoje? Qual identificador pode ser usado legalmente?”
- **O que já existe / anti-clone:** Prefeitura já possui planilha de indicadores, BI e sistemas operacionais.
- **Risco principal:** Sem sistema real pode virar só um ETL genérico; não alegar integração institucional.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/governanca-publica.

### 01.2 — Governança de TI e Política Municipal de dados (Governança, dados e transparência)
**Nota:** 3.75/5 — A/D/Demo/V/Adoção = 5/3/3/4/3. 

- **Problema a verificar:** Falta visibilidade sobre titularidade, finalidade, atualização e qualidade de conjuntos de dados.
- **Recorte de MVP:** Catálogo simulado de datasets com responsáveis, níveis de acesso, finalidade, data de atualização e checklist de qualidade.
- **Demo de 2 minutos:** Cadastrar fonte fictícia → detectar campo sem responsável/sem política → indicar plano de revisão.
- **Dados necessários:** Metadados sintéticos e política pública existente como referência.
- **Quem ouvir:** CTD, área de governança de dados, encarregado LGPD.
- **Pergunta decisiva:** “Já existe catálogo? Qual campo obrigatoriamente falta no handoff entre setores?”
- **O que já existe / anti-clone:** Portal de Dados Abertos, governança e documentos LGPD municipais.
- **Risco principal:** Não inventar política municipal nem classificar base legal automaticamente.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/index.php/dados-abertos.

### 01.3 — Planejamento e monitoramento de indicadores em tempo real (Governança, dados e transparência)
**Nota:** 3.85/5 — A/D/Demo/V/Adoção = 4/4/4/3/4. 

- **Problema a verificar:** Indicadores podem não refletir rapidamente a execução ou carecer de responsáveis/qualidade.
- **Recorte de MVP:** Painel de dois indicadores de exemplo com fonte, período, meta, atualização e alerta de dado vencido.
- **Demo de 2 minutos:** Alterar registro sintético → recalcular indicador → destacar desvio/atraso → explicar o próximo passo.
- **Dados necessários:** Planilha/BI de indicadores municipal como referência; feed sintético.
- **Quem ouvir:** Planejamento municipal, CODEL, controle interno.
- **Pergunta decisiva:** “Qual indicador já existe mas ainda não ajuda a decidir? Qual periodicidade real de atualização?”
- **O que já existe / anti-clone:** Governança pública já publica planilha e BI; IPPUL tem SIPLAM.
- **Risco principal:** NÃO vender 'tempo real' se a fonte só atualiza mensalmente ou é fictícia.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/governanca-publica.

### 02.1 — Estruturação do acervo normativo da CML (Inteligência legislativa)
**Nota:** 4.65/5 — A/D/Demo/V/Adoção = 5/4/5/5/4. 

- **Problema a verificar:** Pesquisa normativa pode exigir navegar diversas fontes, redações, datas e vínculos.
- **Recorte de MVP:** Índice de 5–10 atos de exemplo com número, data, assunto, origem, vigência desconhecida/validada e vínculo com alteração.
- **Demo de 2 minutos:** Buscar uma norma → filtrar versão/assunto → abrir fonte → comparar relações sem inventar interpretação.
- **Dados necessários:** Amostra pequena de atos públicos com URLs e registros estruturados; separar leis municipais de atos internos da CML.
- **Quem ouvir:** Câmara Municipal de Londrina, procuradoria, servidores do Legislativo.
- **Pergunta decisiva:** “Qual acervo precisa de estruturação? Já existe ferramenta interna/terceirizada e qual lacuna tem?”
- **O que já existe / anti-clone:** Site da Câmara, Diário Oficial do Legislativo e portal de Leis Municipais.
- **Risco principal:** Vigência/consolidação exige revisão competente; não criar 'base oficial' paralela.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/index.php/legislacao.

### 02.2 — Automatização humanizada de atendimento ao cidadão (Inteligência legislativa)
**Nota:** 3.90/5 — A/D/Demo/V/Adoção = 4/3/5/5/2. 

- **Problema a verificar:** Atendimento pode ser confuso se o cidadão não entende passos, fontes ou opção humana.
- **Recorte de MVP:** Assistente de um serviço legislativo específico com FAQ documentada, respostas fundamentadas e encaminhamento humano.
- **Demo de 2 minutos:** Pergunta sobre procedimento sintético → fonte/caminho oficial → opção clara de atendimento humano.
- **Dados necessários:** FAQ pública e roteiro de atendimento verificado; nenhum dado pessoal.
- **Quem ouvir:** CML/atendimento, Ouvidoria, cidadão com necessidade de acessibilidade.
- **Pergunta decisiva:** “Qual pergunta recorrente recebe resposta ruim e já não é tratada nos canais atuais?”
- **O que já existe / anti-clone:** Londrina ON já oferece chatbot; atendimento legislativo pode ter outro escopo.
- **Risco principal:** Chatbot genérico já é comoditizado; diferenciar por linguagem simples, fonte e escalonamento humano.
- **Fonte para checagem:** https://blog.londrina.pr.gov.br/?p=214574.

### 02.3 — Detecção de conflitos legais (Inteligência legislativa)
**Nota:** 3.65/5 — A/D/Demo/V/Adoção = 5/3/4/2/3. **Gate técnico/de domínio: não escolher a versão ampla.**

- **Problema a verificar:** Textos normativos podem conter referências conflitantes ou alterações difíceis de relacionar.
- **Recorte de MVP:** Detectar apenas divergências textuais explícitas em 3 atos controlados, com destaque de trechos e revisão humana.
- **Demo de 2 minutos:** Carregar duas normas de demonstração → apontar referências/termos potencialmente incompatíveis → exigir revisão jurídica.
- **Dados necessários:** Casos sintéticos + exemplos públicos previamente verificados.
- **Quem ouvir:** Procuradoria da CML, advogado legislativo, área de revisão normativa.
- **Pergunta decisiva:** “Que tipo de conflito textual é frequente e detectável sem conclusão jurídica automática?”
- **O que já existe / anti-clone:** Portais de legislação e revisão técnica humana.
- **Risco principal:** Falso positivo/negativo de conflito tem consequências jurídicas; nunca afirmar inconstitucionalidade/revogação automaticamente.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/index.php/legislacao.

### 03.1 — Plano de resiliência e clima (Sustentabilidade e clima)
**Nota:** 3.75/5 — A/D/Demo/V/Adoção = 4/4/4/3/3. 

- **Problema a verificar:** Planos climáticos demandam transformar riscos e medidas em ações com responsáveis.
- **Recorte de MVP:** Matriz sintética de riscos climáticos de um bairro com medidas, responsáveis e indicadores de preparação.
- **Demo de 2 minutos:** Selecionar cenário de chuva fictícia → cruzar risco e medida já cadastrada → gerar plano de ação verificável.
- **Dados necessários:** Plano municipal de cidade resiliente, cartas temáticas e cenários fictícios.
- **Quem ouvir:** Defesa Civil, SEMA, IPPUL.
- **Pergunta decisiva:** “Qual rotina de acompanhamento de ações climáticas hoje depende de planilha e pessoa responsável?”
- **O que já existe / anti-clone:** Programa Cidade Resiliente e instrumentos municipais de planejamento.
- **Risco principal:** Não fazer previsão meteorológica, alerta de desastre ou mapa de risco real sem base confiável.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/cidade-resiliente.

### 03.2 — Gestão integrada de resíduos (Sustentabilidade e clima)
**Nota:** 4.90/5 — A/D/Demo/V/Adoção = 5/5/5/5/4. 

- **Problema a verificar:** Contaminação de recicláveis reduz reaproveitamento e pode prejudicar a triagem.
- **Recorte de MVP:** Cooperativa fictícia registra lote + tipo de rejeito; sistema agrega por categoria e sugere campanha educativa verificável.
- **Demo de 2 minutos:** Registrar lote sintético contaminado → calcular taxa e motivo → exibir decisão/próxima ação e fonte da regra.
- **Dados necessários:** Dados de lotes sintéticos; reportagem CMTU de 24/08/2026 como evidência contextual.
- **Quem ouvir:** CMTU, ANPEA, cooperativas de recicláveis.
- **Pergunta decisiva:** “Como se registra contaminação hoje? Existe coleta por lote e qual dado pode ser compartilhado?”
- **O que já existe / anti-clone:** Serviço de coleta e cooperativas atuantes; buscar ferramentas de controle utilizadas.
- **Risco principal:** Não apresentar taxa fictícia como índice municipal; sem entrevista a dor do software é hipótese.
- **Fonte para checagem:** https://cmtu.londrina.pr.gov.br/index.php/ult-noticias/2337-coleta-seletiva-trata-800-toneladas-de-reciclaveis-por-mes-em-londrina.html.

### 03.3 — Infraestrutura verde e hídrica (Sustentabilidade e clima)
**Nota:** 4.15/5 — A/D/Demo/V/Adoção = 5/3/5/4/3. 

- **Problema a verificar:** Manutenção de jardins de chuva, áreas verdes e drenagem requer inspeções e prioridades.
- **Recorte de MVP:** Mapa pequeno com pontos fictícios de manutenção, checklist técnico orientativo e prioridade revisável.
- **Demo de 2 minutos:** Selecionar ponto de drenagem fictício → registrar problema → justificar prioridade e responsável.
- **Dados necessários:** Pontos sintéticos sobre croqui, ou camadas públicas SIGLON quando licenciadas.
- **Quem ouvir:** SEMA, IPPUL, CMTU, CEAL/CREA.
- **Pergunta decisiva:** “Qual inventário de infraestrutura verde/hídrica existe e quem responde à manutenção?”
- **O que já existe / anti-clone:** SIGLON e instrumentos do IPPUL; sistemas de fiscalização/manutenção podem existir.
- **Risco principal:** Não produzir mapa de alagamento real, laudo de engenharia ou ordem de obra automatizada.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/downloads-siglon.

### 04.1 — Central de monitoramento urbano (Infraestrutura e financiamento)
**Nota:** 3.70/5 — A/D/Demo/V/Adoção = 4/4/4/2/4. **Gate técnico/de domínio: não escolher a versão ampla.**

- **Problema a verificar:** Informações de diferentes equipamentos urbanos e operações ficam distribuídas.
- **Recorte de MVP:** Central simulatória de 3 ativos e incidentes com status, última atualização e acionamento responsável.
- **Demo de 2 minutos:** Simular falha de iluminação → abrir alerta → encaminhar à equipe → marcar evidência da conclusão.
- **Dados necessários:** Telemetria totalmente sintética e instalações públicas como contexto.
- **Quem ouvir:** CTD, CMTU, Londrina Iluminação.
- **Pergunta decisiva:** “Qual alerta já existe nos centros de operação e qual ainda é tratado manualmente?”
- **O que já existe / anti-clone:** Rua Sergipe já recebeu pilotos inteligentes; sistemas de operação não devem ser duplicados.
- **Risco principal:** Requer hardware, integrações e autorização para operação real; não conectar sensores ou câmeras.
- **Fonte para checagem:** https://codel.londrina.pr.gov.br/index.php/alt/406-projeto-rua-inteligente-trara-inovacao-e-tecnologia-a-rua-sergipe.html.

### 04.2 — PPPs e concessões (Infraestrutura e financiamento)
**Nota:** 3.15/5 — A/D/Demo/V/Adoção = 4/3/3/2/3. **Gate técnico/de domínio: não escolher a versão ampla.**

- **Problema a verificar:** Documentação e acompanhamento de concessões demandam estrutura, fontes e métricas.
- **Recorte de MVP:** Checklist informativo de uma proposta fictícia, documentos e riscos pendentes, sem avaliar viabilidade legal.
- **Demo de 2 minutos:** Cadastrar projeto hipotético → ver etapas/documentos faltantes → gerar lista para revisão de especialista.
- **Dados necessários:** Checklist de exemplo e atos oficiais públicos, sem qualificar contratação.
- **Quem ouvir:** CODEL, CTD, planejamento, assessoria jurídica, Confea.
- **Pergunta decisiva:** “Qual etapa administrativa é repetitiva e não automatizada no processo de estruturação?”
- **O que já existe / anti-clone:** Processos públicos de concessão e editais próprios; não confundir com chamamento CODEL 03/2025.
- **Risco principal:** Altamente regulado e não se resolve com 'score de PPP'; risco de simular elegibilidade falsa.
- **Fonte para checagem:** https://codel.londrina.pr.gov.br/index.php/editais-2.html.

### 04.3 — Turismo digital (Infraestrutura e financiamento)
**Nota:** 4.00/5 — A/D/Demo/V/Adoção = 4/3/5/5/3. 

- **Problema a verificar:** Visitantes podem não encontrar roteiros acessíveis, confiáveis e atualizados.
- **Recorte de MVP:** Roteiro turístico local de 3 pontos com opções de acessibilidade, horários verificados ou indefinidos e navegação offline.
- **Demo de 2 minutos:** Selecionar tempo/disponibilidade → gerar roteiro com fontes e restrições → apresentar percurso.
- **Dados necessários:** Três locais/horários com fontes públicas e alternativa sintética.
- **Quem ouvir:** CODEL, setor de turismo, ACIL, comércios.
- **Pergunta decisiva:** “Qual público não é atendido pelas soluções atuais e o que atrapalha o passeio?”
- **O que já existe / anti-clone:** O hackathon 2025 já teve turismo inteligente; apps e mapas turísticos existentes.
- **Risco principal:** Solução de roteiro genérica ou informações de funcionamento desatualizadas.
- **Fonte para checagem:** https://www.londrinainteligente.com.br/hackathon-2026.

### 05.1 — Internet pública para todos (Inclusão digital e serviços)
**Nota:** 3.25/5 — A/D/Demo/V/Adoção = 4/4/3/1/3. **Gate técnico/de domínio: não escolher a versão ampla.**

- **Problema a verificar:** Acesso desigual à conectividade pode excluir cidadãos de serviços essenciais.
- **Recorte de MVP:** Simulador de planejamento de pontos públicos Wi-Fi com critérios transparentes de cobertura/custo, sem implantar rede.
- **Demo de 2 minutos:** Selecionar 3 regiões fictícias → comparar necessidade/cobertura → mostrar plano preliminar revisável.
- **Dados necessários:** Indicadores agregados de inclusão e cobertura, quando disponíveis; posições sintéticas.
- **Quem ouvir:** CTD, inclusão digital, bairros, provedores, poder público.
- **Pergunta decisiva:** “Existe mapa de cobertura e política de hotspots? Qual grupo está realmente sem acesso?”
- **O que já existe / anti-clone:** Ações de conectividade públicas e de operadoras podem existir, precisam ser mapeadas.
- **Risco principal:** Infraestrutura física, conectividade e orçamento inviáveis num fim de semana; não coletar geolocalização pessoal.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/index.php/dados-abertos.

### 05.2 — Plataforma única de educação (Inclusão digital e serviços)
**Nota:** 3.05/5 — A/D/Demo/V/Adoção = 3/3/4/2/3. **Gate técnico/de domínio: não escolher a versão ampla.**

- **Problema a verificar:** Serviços educacionais podem estar dispersos para famílias, alunos e servidores.
- **Recorte de MVP:** Jornada fictícia de um único serviço (ex.: localizar instruções de matrícula), com acessibilidade e informações verificáveis.
- **Demo de 2 minutos:** Escolher perfil → achar requisitos/documentos → simular encaminhamento para canal oficial.
- **Dados necessários:** Informações públicas de um serviço específico e perfis fictícios.
- **Quem ouvir:** Secretaria de Educação, Escola de Governo, famílias, ConnectX.
- **Pergunta decisiva:** “Quais plataformas já atendem escola e capacitação? Em qual etapa comprovadamente há barreira?”
- **O que já existe / anti-clone:** Escola de Governo já usa plataforma de ensino online; não é prova de mesma solução escolar.
- **Risco principal:** Plataforma 'única' envolve privacidade de crianças, cadastro, sistemas legados e adoção institucional.
- **Fonte para checagem:** https://portal.londrina.pr.gov.br/escola-de-governo.

### 05.3 — Modernização de RH e previdência (Inclusão digital e serviços)
**Nota:** 3.15/5 — A/D/Demo/V/Adoção = 4/3/3/2/3. **Gate técnico/de domínio: não escolher a versão ampla.**

- **Problema a verificar:** Servidores podem enfrentar fluxos de RH e previdência fragmentados.
- **Recorte de MVP:** Checklist explicativo de um processo administrativo fictício de RH com prazos/etapas e revisão humana.
- **Demo de 2 minutos:** Selecionar solicitação sintética → listar documentos e etapas → registrar pendência/encaminhamento.
- **Dados necessários:** Fluxo de exemplo sem dados salariais, de saúde ou de beneficiários.
- **Quem ouvir:** Secretaria Municipal de RH, CAAPSML, servidor.
- **Pergunta decisiva:** “O novo ponto digital já cobre quais fluxos? Qual processo de previdência ainda gera retrabalho?”
- **O que já existe / anti-clone:** Prefeitura anunciou teste de ponto digital em 12/11/2026; não confundir com previdência.
- **Risco principal:** Dados pessoais e previdenciários sensíveis; integração/complexidade legal grande; título parcialmente encoberto na foto.
- **Fonte para checagem:** https://blog.londrina.pr.gov.br/?p=247090.


## Fontes públicas verificadas para orientar os sinais
- [CMTU, 24/08/2026 — 800 toneladas/mês de material reaproveitado e contaminação como problema declarado por cooperativas](https://cmtu.londrina.pr.gov.br/index.php/ult-noticias/2337-coleta-seletiva-trata-800-toneladas-de-reciclaveis-por-mes-em-londrina.html). **Não confundir toneladas com dados de coleta por lote.**
- [Portal da Prefeitura — legislação](https://portal.londrina.pr.gov.br/index.php/legislacao) e [Diário da CML](https://www.cml.pr.gov.br/assinatura/assinado/2025/04/DOC-2025-04-01-1.pdf) — acervos já existem; verificar lacuna com servidores da Câmara.
- [Governança Pública — planilha/BI e planejamento 2026](https://portal.londrina.pr.gov.br/governanca-publica), [Dados Abertos](https://portal.londrina.pr.gov.br/index.php/dados-abertos), [IPPUL/SIPLAM](https://ippul.londrina.pr.gov.br/index.php/monitoramento.html).
- [SIGLON geosserviços](https://portal.londrina.pr.gov.br/downloads-siglon), [Cidade Resiliente](https://portal.londrina.pr.gov.br/cidade-resiliente).
- [Escola de Governo — LMS existente](https://portal.londrina.pr.gov.br/escola-de-governo) e [Prefeitura — ponto digital em piloto 12/11/2026](https://blog.londrina.pr.gov.br/?p=247090).
- [Hackathon oficial 2026 (site)](https://www.londrinainteligente.com.br/hackathon-2026); **para a taxonomia dos desafios, preferir a foto presencial**.

**Regra de segurança:** nenhum número sintético pode ser apresentado como resultado da Prefeitura. Evitar dados pessoais, reconhecimento facial, parecer jurídico automatizado, projetos de segurança física e qualquer aprovação de direitos por IA. Revisão humana para casos de impacto público.
