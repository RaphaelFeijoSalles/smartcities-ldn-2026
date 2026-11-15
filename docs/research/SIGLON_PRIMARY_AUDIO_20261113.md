# Áudio 4 — SIGLON: qualidade, origem e atualização de geodados, turismo e integração

**Data:** 13/11/2026. **Origem:** áudio `13-11-2026 21.32.m4a` enviado pela equipe; conteúdo analisado sem publicar a voz no GitHub. **Status:** testemunho direto de palestrante que se apresenta como geógrafo e gerente do SIGLON. Não atribuir nome/cargo formal sem outra fonte.
**Precisão:** transcrição automática contém variações “SIGRON/Sigelom”; o sistema correto confirmado no portal municipal é **SIGLON — Sistema de Informação Geográfica de Londrina**.

## 1. Diagnóstico específico do palestrante
1. **Integração territorial:** SIGLON já reúne e cruza dados alfanuméricos e espaciais de secretarias para mapas e decisões. A Prefeitura busca autorizações entre gestores de bases. **Não propor novo SIG ou copiar suas funções.**
2. **Governança de origem e autoridade:** o palestrante estima **12–13 bases de endereços** municipais e questiona qual deveria ser a referência; **número é relato verbal, não contagem auditada**.
3. **Entrada e mudança organizacional:** alguns servidores ainda coletam em papel/planilhas; uma solução viável precisa se encaixar no trabalho real, ser de baixa fricção e não depender de uma reforma de todos os bancos.
4. **SINISA:** preenchimento de questionário intersetorial, validações/devolutivas de inconsistências e dificuldade de obter os dados tratados em formato útil para o próprio município. O palestrante afirma participar diretamente da alimentação. Precisamos verificar regras, permissões e os serviços existentes antes de construir integração.
5. **SINTER (federal):** cruzamento de informações imobiliárias; relato de convênio que permitiria acesso municipal. **Não significa API pública nem autorização para usar dados cadastrais**.
6. **Monitoramento urbano:** exemplos incluem contagem de tráfego e saber localização/horário do caminhão do lixo. O palestrante disse que *não há esse monitoramento* no caso ilustrado, mas é necessário confirmar escopo e operação; hardware/dados são bloqueadores do MVP.
7. **Turismo digital:** pousadas, eventos, gastronomia e pesque-pagues poderiam **alimentar colaborativamente** dados locais para evitar que servidores “cacem” informações ou que cadastros se percam. Ele sugere centralizar/publicar pelo SIGLON. É problema operacional bem mais concreto que apenas criar app de roteiro.
8. **Inventário arbóreo:** levantamentos de diferentes organizações não necessariamente formam cadastro contínuo; atualizar condições e localizar árvores relevantes apoiaria gestão durante vendavais. Não fazer diagnóstico fitossanitário automático.
9. **Projetos e financiamento:** sem dados e preparação de projeto, recursos/PPPs podem não sair do papel. Relato ilustrativo, não promessa de disponibilidade financeira.

## 2. Verificação externa, 13/11/2026
- [SIGLON — o que é](https://portal.londrina.pr.gov.br/o-que-e-siglon): portal geográfico criado por decreto em 2012, com localização e atualização de dados intersetoriais; **já implementa centralização espacial**.
- [SIGLON — downloads](https://portal.londrina.pr.gov.br/downloads-siglon): atualizado em **05/11/2026**, oferece mapas/camadas SHP, KMZ e DWG e geosserviços públicos para SIG/ArcGIS/QGIS. Inclui patrimônio cultural e equipamentos culturais, hidrografia e outros temas.
- [Prefeitura — novo portal SIGLON 2024](https://blog.londrina.pr.gov.br/?p=177627): mapas de coleta seletiva, equipamentos municipais e aplicativos já existentes.
- [Preservação cultural de Londrina](https://portal.londrina.pr.gov.br/preservacao-culural/instrumentos-preservacao-cultura): inventário municipal cultural disponibilizado no SIGLON. **Não reinventar cadastro de monumentos/patrimônio sem diferencial.**
- [Autorização do SIGLON divulgada no OSM Wiki](https://wiki.openstreetmap.org/wiki/File:Autorizacao_SIGLON.pdf): referência histórica de permissão para uso público de downloads com crédito à Prefeitura; **verificar licenciamento/condições da camada específica** e não tratar outras bases ou geosserviços como liberados para qualquer uso.
- [Endpoint público informado pelo portal](https://geo.londrina.pr.gov.br/server/rest/services/Portal_Publico): consulta a camadas públicas; **não há conexão, download automático ou teste de API realizado aqui**.

## 3. Reavaliação de ideias dos 15 desafios (qualitativa, não nota oficial)

| Desafio | O que o áudio acrescenta | Hipótese mais específica | Risco anti-clone |
|---|---|---|---|
| **01.1 Integração de dados** | 12–13 bases de endereços citadas, diferença entre titular do dado e consumidor | **Origem Única:** conciliador de divergências de duas bases de endereço **sintéticas**, mostrando autoridade, atualização e solicitação de revisão | SIGLON já cruza bases e possui governança; identificar lacuna operacional real |
| **01.2 Governança de dados** | Mapear origem/autorizações e responsáveis pela atualização | **Catálogo Vivo:** dono do dado, evidências, histórico e política de publicação sem alterar banco original | Duplicação de catálogo/fluxo municipal; confirmar com gerente |
| **04.3 Turismo digital** | Prefeitura tem dificuldade de coletar e atualizar informações de estabelecimentos e eventos | **Turismo Colaborativo:** formulário leve de prestador + validação editorial + camada/ponto turístico + histórico de atualização | SIGLON já possui patrimônio cultural e outros pontos; precisa integração sem substituir |
| **03.3 Infraestrutura verde e hídrica / 03.1 Clima** | Inventário arbóreo parcial, múltiplos coletores e baixa continuidade | **Árvore Viva:** atualização com fonte, responsável e evidência de inspeção; destaque de registros vencidos | Não produzir laudos, previsão de queda nem rankings de risco sem especialista |
| **04.1 Monitoramento urbano / 03.2 Resíduos** | Exemplos de trânsito e localização de coleta | **Rota Transparente (somente simulação):** posição/etapa alimentada por operador → aviso, sem rastreamento real | Falta GPS/fonte e autorização; no fim de semana, mostrar apenas simulação |

## 4. Cruzamento com a ideia do marketplace turístico (PR #9)
**Hipótese de produto composto, NÃO decidida:** unir o **cadastro colaborativo de pontos/serviços turísticos** de interesse institucional, com o **conteúdo autoral/vídeos pagos** da equipe.

```text
Prestador / organizador do evento
 → atualiza local, serviços, horários e material autorizado
 → moderação/validação humana + versão/data/fonte
 → geodados/publicação (quando autorizados), de preferência integráveis ao SIGLON
 → turista descobre rota/experiência com conteúdo local
 → criador opcional oferece vídeo/roteiro pago (fase comercial)
```

**O que separar:** cadastro público estruturado e manutenção editorial podem ser um P0 institucional; cobrança, royalties, check-ins, reconhecimento por foto e IA generativa são produtos/fases separadas. **Não usar dados públicos como se fossem propriedade exclusiva de criadores.**

**Demo mínima de 2 min:** criar 1 ponto turístico fictício como prestador → publicar após validação editorial → mostrar no mapa com fonte e atualização → incorporar uma breve prévia de vídeo autoral. Sem pagamentos, sem GPS, sem upload remoto ou APIs restritas.

**Pergunta decisiva ao gerente do SIGLON/área de turismo:** “Qual é o processo atual de receber, validar e atualizar dados de prestadores turísticos? O que impede publicar e reaproveitar esses cadastros no SIGLON?”

## 5. Oportunidade operacional transversal
**Princípio extraído do áudio:** o operador precisa de facilidade de alimentação, não apenas de um painel de consumo. Isso sugere interfaces com:
- formulário mínimo ou importação CSV;
- registro do **responsável por cada campo**;
- fonte, último contato e data de atualização;
- fila de pendências, revisão humana, log de alterações e exportação;
- adaptação gradual à rotina existente e interoperabilidade por dados, não substituição completa dos bancos.

## 6. Perguntas para mentores hoje
1. Quem é o **dono oficial** de uma base de endereços, ativos ou pontos turísticos?
2. Qual etapa da autorização/publicação do dado causa espera ou retrabalho?
3. Existe exportação/geo-serviço público para esse dado com licença e formato conhecidos?
4. Como receber atualizações de pequenos prestadores sem sobrecarregar servidores?
5. Que amostra **autorizada ou sintética** comprovaria a dor em dois minutos?
6. Que indicador operacional importa: tempo para atualização, percentual de cadastros com fonte ou registros desatualizados?

## 7. Cuidados para apresentação
- **Não** atribuir os 12–13 bancos como inventário auditado.
- **Não** concluir que SINISA e SINTER têm livre acesso por API: há permissões e governança específicas.
- Dados de imóveis, pessoais, cadastros de saúde e educação não são aptos à demo.
- **Não** usar dados SIGLON para viabilidade técnica de obra. O próprio portal alerta essa restrição.
- Não alegar interesse comercial, autorização de integração ou parceria do SIGLON/Prefeitura a partir da fala do evento.
- Sem mudanças no MVP ou nas Issues de implementação antes da equipe escolher.

**Referências cruzadas:** [PR #8 — 15 desafios](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/8); [PR #9 — turismo criadores](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/9); [PR #12 — clima/SINISA](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/12); [Issue #2 — decisão](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2).
