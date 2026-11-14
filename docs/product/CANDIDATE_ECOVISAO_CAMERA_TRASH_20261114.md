# Candidata do colega — EcoVisão: detecção de acúmulos de resíduos em vídeo + GPS e inspeção

**Data:** 14/11/2026 · **Status:** proposta trazida por **um colega da equipe**, NÃO selecionada, NÃO implementada e modelos NÃO testados por esta pesquisa.  
**Desafio principal:** **03.2 Gestão integrada de resíduos**; interseções **04.1 Central de monitoramento urbano** e **03.1/03.3**, somente se o organizador aceitar.  
**Origem:** resumo escrito do colega enviado pela equipe nesta conversa, com dois links de compartilhamento:
- https://chatgpt.com/share/6af84ef5-f7cc-83ea-8177-e9bd362217bd
- https://claude.ai/share/0a042462-f77f-4490-ac1d-e755da760074

**Rastreabilidade:** as duas conversas são referências fornecidas pelo colega, **não foram auditadas como fontes primárias adicionais** nesta documentação. As afirmações específicas foram conferidas nos repositórios GitHub, na medida indicada abaixo. Não publicar imagens privadas dos cidadãos nem upload de vídeos de terceiros neste repositório.

## Ideia, sem confundir reconhecimento de lixo com prova de descarte
> **Primeira etapa:** câmera em veículo de coleta (no hackathon, VÍDEO GRAVADO e autorizado) → detector de possíveis **montes de resíduos** → evento deduplicado e associado a coordenadas GPS **sincronizadas ou simuladas e declaradas** → mapa/dashboard com evidências → **validação humana** e encaminhamento a setor competente.

**Etapa 2 SOMENTE como futuro:** câmeras fixas nos pontos com maior reincidência, com base legal, autorização e análise de necessidade/privacidade. **Sem reconhecimento facial.** Um monte de lixo visível não prova automaticamente descarte irregular, autoria, infração nem obrigação de fiscalização; pode ser material aguardando coleta regular ou destino autorizado.

## Verificação pública extremamente relevante — legislação de Londrina
**Lei Municipal nº 14.293, de 29/10/2026, publicada no Jornal Oficial nº 5917 de 13/11/2026, página 1**: prevê instalação **gradativa** de câmeras de monitoramento em **fundos de vale** para coibir descarte irregular. O art. 3º cita a priorização de locais com incidência histórica, áreas com risco ambiental e infraestrutura prévia. O art. 4º prevê integração das imagens ao sistema municipal com **acesso restrito aos órgãos competentes**. A lei também trata de consequências para **infrações comprovadas**, que este aplicativo **não pode impor/atribuir automaticamente**.

**Fonte primária:** https://portal.londrina.pr.gov.br/images/stories/jornalOficial/Jornal-5917-Assinado.pdf

**Implicação:** existe uma política concreta que torna a proposta especialmente relevante, mas **a lei não autoriza nossa equipe a gravar caminhões ou vias indiscriminadamente nem a disponibilizar imagens brutas num painel público**. Os dispositivos sobre câmera fixa em fundos de vale tampouco provam que a Prefeitura já implantou infraestrutura. Exigir interpretação jurídica/operacional por autoridade competente antes de piloto real.

## MVP declarado pelo colega — manter seis entregas explícitas
| # | Feature | P0 / critério de aceitação honesto |
|---|---|---|
| 1 | Detectar lixo em vídeo gravado | Analisar **vídeo autorizado** com pipeline licenciado e testado; se isso não acontecer no prazo, registrar detector como **NOT RUN** e usar fixtures sintéticas |
| 2 | Salvar ocorrência com imagem, horário e confiança | Gerar evento JSON com quadro de referência, timestamp do vídeo e score **do modelo**; não tratar score como probabilidade calibrada |
| 3 | Associar GPS | Corrigir diferença entre **tempo do frame** e **tempo do trajeto GPS**; quando simulado, selo **GPS SINTÉTICO**, sem afirmar registro de caminhão real |
| 4 | Mapa interativo | Pin para cada **evento único**, sem duplicação de vários frames do mesmo acúmulo |
| 5 | Dashboard | Total de ocorrências **candidatas**, revisadas/descartadas, volume por bairro apenas se houver divisão espacial confiável |
| 6 | Clique e detalhes | Imagem **sem faces/placas identificáveis** e informações completas da revisão, com permissões adequadas |

**Atenção:** no JSON do colega, coordenadas **-25.4284, -49.2733 apontam para a região de Curitiba, não Londrina**. Jamais usá-las como prova ou ponto de descarte em Londrina. Manter todas as localizações sintéticas explicitamente rotuladas.

## Fluxo P0 em 2 minutos
1. **0–25s:** selecionar um vídeo curto autorizado e exibir imagem de referência; marcar “vídeo de demonstração”.
2. **25–50s:** mostrar uma inferência real **se comprovadamente executada** ou uma fixture **declarada como simulada**; explicar que a imagem contém uma sugestão, não infração confirmada.
3. **50–85s:** agrupar frames do mesmo objeto em um único evento; exibir hora, confiança, status “pendente de revisão” e GPS simulado.
4. **85–110s:** abrir mapa e filtro de ocorrências, selecionar um ponto, confirmar ou rejeitar candidato como operador humano.
5. **110–120s:** exibir métrica simples: quantos eventos passaram pela revisão e o próximo encaminhamento (simulado).

**Qualidade na apresentação:** incluir um falso positivo proposital para mostrar como a revisão humana impede avisos indevidos. Não usar uma taxa de acerto inventada.

## Repositórios de ML sugeridos — auditoria de documentação, NÃO benchmark executado

### Principal: [Roshians/litter-detection](https://github.com/Roshians/litter-detection)
**Lido no GitHub em 14/11/2026:** README, `detect_trash.py`, `requirements.txt`; **não encontrado `LICENSE` na raiz**. README descreve:
- YOLOv8n ajustado com uma classe **trash**, pesos `models/trash_best.pt`, e YOLOv8 COCO para vetar carros/pessoas etc.
- `python detect_trash.py --input video.mp4 --output ./results/`, com `{name}_annotated.mp4` e `{name}_report.json` contendo timestamps e caixas.
- Agrupamento temporal de frames em eventos, filtros geométricos rígidos de câmera de **celular em scooter na Índia**.
- Teste apresentado pelo autor inclui **falso positivo em pedra**, e os dados não provam desempenho em ruas brasileiras.
- O script possui **tentativa de `pip install ultralytics` durante importação quando a lib falta**; avaliar segurança/reprodutibilidade antes de executar em ambiente do projeto.
- Executa YOLO local, com `ultralytics>=8.2.0` e `opencv-python>=4.9.0` sem versões travadas.

**Estado real:** `REPOSITORY_INSPECTED / MODEL_NOT_RUN / BRAZIL_VIDEO_NOT_TESTED / LICENSE_UNCLEAR`. Não reproduzir números de performance do autor como validação da equipe.

### Alternativa: [AbdullahWali007/Trash-Detection](https://github.com/AbdullahWali007/Trash-Detection)
**Lido no GitHub em 14/11/2026:** README, `detect_image.py`; **não encontrado `LICENSE` na raiz**. YOLO11m com 18 classes TACO, `best.pt` na raiz; script incluído é orientado a **imagem** e a documentação demonstra vídeo por API do Ultralytics. É maior e tende a demandar mais CPU; detecta **objetos individuais**, não necessariamente **pilhas de lixo**. Não confundir rótulos com infrações de descarte.

**Estado real:** `REPOSITORY_INSPECTED / MODEL_NOT_RUN / DOMAIN_PERFORMANCE_UNKNOWN / LICENSE_UNCLEAR`.

### Bloqueio de licença — importante
**Citar o repositório não substitui licença.** A falta de `LICENSE` nos repos significa que não há concessão explícita de direitos para copiar/redistribuir código e pesos em nosso produto. Consultar autores/licenças ou escolher **pipeline e pesos com licenças compatíveis** antes de integrar ou publicar. A biblioteca/modelos **Ultralytics YOLO** têm termos próprios **AGPL-3.0 ou Enterprise**, que precisam ser avaliados para SaaS/comercial e distribuição, mesmo se outro repositório permitir uso:
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- https://www.ultralytics.com/license

**Não commitar pesos, vídeo ou código de terceiros** nesta PR. **Não implantar publicamente** inferência baseada em pesos sem licença validada.

## Arquitetura modular proposta, sem engessamento
```text
vídeo local autorizado + metadados (ou fixture)
       │
       ▼
DetectorAdapter (model licensed / MOCK_EXPLICIT)
       │
       ▼
DeduplicateEvents (tempo + posição/mesmo acúmulo)
       │
       ▼
GPSJoin (timestamp sincronizado ou SIMULATED)
       │
       ▼
OccurrenceRepository (SQLite local)
       │
       ▼
FastAPI POST/GET ocorrencias  ──►  React + Leaflet/OSM
                                   ├─ Mapa
                                   ├─ Dashboard
                                   └─ Revisar/descartar evento
```

- **P0:** React + Leaflet com dados de amostra, FastAPI e SQLite (se equipe precisar de API colaborativa); ou apenas JSON local se 48h exigirem. O app precisa ser demonstrável sem depender de GPU, mapa online ou câmera real.
- **P1:** conectar `DetectorAdapter` com modelo legalmente utilizável, teste de vídeo e comparação contra anotação manual; atualizar eventos e exibir nível de confiança com limitações.
- **P2:** GPS real fornecido com autorização de prestador/operador + armazenamento privado e política de retenção, georreferenciamento e deduplicação entre passagens.
- **P3:** Postgres/PostGIS e integração institucional, câmeras em caminhões ou fixas somente com avaliação legal, contratos e governança.

### Contrato JSON recomendado (exemplo 100% sintético)
```json
{
  "id": "demo-001",
  "tipo": "possivel_acumulo_residuos",
  "video_timestamp_seconds": 38.5,
  "captured_at": null,
  "latitude": null,
  "longitude": null,
  "location_source": "DEMO_SYNTHETIC_PENDING",
  "confidence": 0.91,
  "confidence_is_calibrated": false,
  "image": "demo_ocorrencia_001.jpg",
  "image_rights": "CREATED_BY_TEAM",
  "privacy_review": "PENDING",
  "review_status": "PENDING_HUMAN_REVIEW",
  "source": "SYNTHETIC_FIXTURE"
}
```
**Não confundir:** confiança do modelo com certeza do evento; timestamp relativo ao vídeo com horário do relógio; pin fictício com local de infração; ocorrência com crime comprovado.

## Recomendo A ou B ao colega?
**B primeiro como contrato de integração** (API/fixture/mapa), pois independe de câmera real e dos dois modelos sem licença clara; **A em paralelo como prova crítica**, desde que vídeos sejam próprios/autorizados e o modelo/pesos possam ser usados legalmente. Se não houver licença ou teste efetivo, a apresentação deve dizer **“pipeline de visão computacional proposto, ainda não validado em vídeo”**, não “detecção já funcionando”.

**Separar tarefas de modo AI-First sem quebrar Git:**
- Pessoa A: `schema + FastAPI/SQLite + testes de POST/GET`.
- Pessoa B: `React/Leaflet, mapa, painel, modal da ocorrência`.
- Colega proponente: `dataset autorizado + investigação de licença + benchmark do modelo`.
- QA/integração: `fixtures / casos de falso positivo / métricas / integração`.
- Miguel: `validação com CMTU/SEMA, operação, aceitação e caminho comercial`.
- Raphael: `contratos, isolamento de PRs, integração e demo`.

**No estágio desta PR: NENHUMA TAREFA EXECUTADA**, nenhuma inferência realizada e nenhuma API/frontend criada.

## Como validar a detecção de verdade
- Escolher 1–2 vídeos **próprios/autorizados**, de 1–2 minutos, sem identificação de rostos, placas ou moradores e com cenários **positivos e negativos**.
- Anotar manualmente, antes da inferência, os trechos que **realmente contêm acúmulo** (referência humana) e os falsos candidatos (pedras, calçadas, sacos de coleta regular).
- Medir por **EVENTO ÚNICO**: verdadeiros positivos, falsos positivos, falsos negativos; latência/tempo de processamento; taxa de erro por clipe. Não usar mAP de imagem como se fosse precisão de ponto de descarte.
- Variar condições: chuva/sombra, movimento/trepidação do veículo, ângulo de câmera, sacos e objetos urbanos. Idealmente pelo menos alguns trechos negativos.
- Confirmar que associação GPS+hora corresponde ao frame; caso contrário, mapa deve mostrar **localização não verificada**.

## Privacidade, finalidade pública e segurança
- **LGPD e imagem:** avaliar finalidade, base legal, transparência, consentimento/permissões quando aplicáveis, retenção, controle de acesso e possibilidade de identificação incidental. Não basta “não usar reconhecimento facial”.
- **Fotos, pessoas e placas:** anonimizar/mascarar antes de qualquer exibição pública; acesso a brutos restrito e proporcional; não publicá-los no GitHub/Pages.
- **Sem autuação automática:** o classificador não identifica autores nem distingue com certeza descarte ilegal de coleta regular.
- **Sem câmeras fixas no P0:** lei local prevê implantação gradual em fundos de vale por órgão competente, não autorização privada para instalar/capturar.
- **Sem fiscalização de endereços privados:** o mapa é de possíveis **pontos de inspeção**, não de suspeitos/criminosos.
- **OSM/Leaflet:** respeitar atribuição, regras de tiles e uso de mapa; evitar depender de mapas online na demo crítica.

## Mercado e concorrência a validar
- **Problema operacional:** palestra de sustentabilidade relatou reincidência de descarte irregular após limpeza; cenário pertinente para CMTU/SEMA/órgãos de zeladoria.
- **Evidência legal:** Lei nº 14.293/2026 reforça a prioridade de fundos de vale e a necessidade de integração com sistema municipal, **mas não confirma compra de software nem acesso a câmeras**.
- **Contra substituição de sistemas:** verificar Londrina ON, sistemas de monitoramento da Prefeitura e se existem registros de descarte já georreferenciados. O diferencial candidato é **detecção por trajeto + agrupamento de eventos + revisão de imagens + fila de atuação**, não apenas pinos no mapa.
- **Compradores/operadores possíveis, não confirmados:** CMTU, SEMA, zeladoria/fiscalização e operador da frota. Quem autoriza uso da filmagem do caminhão pode ser distinto de quem atua sobre o descarte.

## Cinco perguntas para mentor/palestrante
1. **Qual órgão recebe hoje informação de descarte irregular e qual sistema registra o encaminhamento?**
2. **Um vídeo de coleta pode ser usado legalmente para gerar apontamentos de inspeção e em que condições?**
3. **Como separar material aguardando coleta de um despejo irregular e quem aprova a classificação?**
4. **Já existem câmeras/fotos e rotas georreferenciadas autorizadas, ou o projeto deve ficar em modo demonstração?**
5. **Qual seria a métrica de sucesso de piloto: precisão por ocorrência, redução de tempo de vistoria ou diminuição de reincidência?**

## Gatilhos para levar ao ranking/implementação
- [ ] Enquadramento do desafio 03.2 confirmado por mentor.
- [ ] Autorização/forma compatível para demonstrar imagens; pelo menos 1 vídeo próprio/anotado.
- [ ] Modelo licenciado ou avaliação alternativa tecnicamente viável.
- [ ] Teste de falsos positivos e negativos (se não houver, **NOT RUN**, não aprovado).
- [ ] Pipeline mínimo e demo em 2 min, com revisão humana e origem dos dados.
- [ ] Proponente e responsáveis pela API/UX/visão identificados pelo time.

**Status:** **HIPÓTESE DO COLEGA / PESQUISA E MERCADO / SEM DECISÃO.** Submeter à [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2) ao lado da [LexBase](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/11) e da [HidroRastro](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/15); não iniciar deploy ou copiar pesos.
