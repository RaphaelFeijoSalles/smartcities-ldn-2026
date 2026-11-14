# EcoVisão — seleção de detectores pré-treinados e vídeos de avaliação (14/11/2026)

**Status:** revisão documental; **nenhum modelo foi executado** e **nenhum vídeo foi baixado para o GitHub**. O ranking é recomendação para teste, não benchmark. Proposta do colega: [PR #17](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/17).

## Definição correta do problema
Câmera em movimento no caminhão/veículo detecta **possíveis montes/acúmulos de resíduos** em vídeo. Deve produzir **evento único**, frame e horário, confiança do classificador não calibrada, GPS sincronizado ou simulado, status de revisão humana e link de imagem permitida. Não inferir quem descartou nem autuar automaticamente.

## Ranking de utilidade prática — opinião, NÃO avaliação executada

| # | Candidato e fonte | Pesos disponíveis / uso pretendido | Licença encontrada | Evidência documental | Risco ou bloqueio |
|---:|---|---|---|---|---|
| **1** | [LitterCam v3 YOLOv9-C](https://huggingface.co/aryanshh/littercamv3) | `best.pt`, `best.onnx`; 10 classes de lixo de beira de estrada, CCTV/dashcam | Model card Apache-2.0. **Licença Ultralytics/runtime separada.** | Pesos disponíveis; sem benchmark de validação comparável na card | Objetos individuais, não necessariamente um monte; avaliar export ONNX |
| **2** | [Roshians/litter-detection](https://github.com/Roshians/litter-detection) | `models/trash_best.pt`, YOLOv8n + filtro COCO + agrupamento temporal | **Sem LICENSE na raiz**, usar somente mediante permissão/clareza jurídica | README documenta detecção de montes em scooter/Índia e um falso positivo pedra | Heurísticas de ângulo/caixas rígidas; sem teste brasileiro |
| **3** | [gicait/pLitter](https://github.com/gicait/pLitter) | Release `v0.0.0-street`, pesos YOLOv5l, exemplos para rua/acostamento | **Sem LICENSE na raiz**; confirmar licença de pesos/dados | AP50 **0,77** em seu dataset de ruas (não comparável entre projetos) | YOLOv5l mais pesado; licença sem confirmação |
| **4** | [CatSat YOLO11 litter materials](https://huggingface.co/CatSat/yolov11-litter-materials) | `best.pt` (20,5 MB), segmentação em 5 materiais | Card/model MIT; runtime Ultralytics tem termos separados | mAP50 BOX **0,291**, MASK **0,272** no TACO; card relata falsos positivos | Material individual não é foco principal da EcoVisão |
| **5** | [AbdullahWali007/Trash-Detection](https://github.com/AbdullahWali007/Trash-Detection) | YOLO11m com 18 categorias e script de imagens | **Sem LICENSE na raiz** | README descreve modelo; nenhuma inferência local | Modelo maior, não especializado em montes, direitos incertos |
| **6** | [BaraaAlsaker/littering-detection](https://github.com/BaraaAlsaker/littering-detection) | YOLO11m + ByteTrack + regras temporais; pesos nas Releases | AGPL-3.0 | Detecta *ato de jogar lixo* com câmera fixa | Não corresponde à câmera móvel e poderia incentivar rastreamento de pessoas |

**Não considerar o resultado do modelo como confirmação de descarte irregular.** Um saco aguardando coleta ou lixo dentro de lixeira não deve virar infração.

### Outros candidatos técnicos
- [javjerez/Real-time-waste-detection](https://github.com/javjerez/Real-time-waste-detection): relata YOLO26m, mAP50 0,561, mAP50-95 0,411, 21,5 FPS em seu experimento. Bom estudo de métodos e class mapping, **não é evidência de detecção de montes em câmera de caminhão**, licença raiz não confirmada.
- [LitterCam v2X](https://huggingface.co/aryanshh/littercamv2X) e [v9C](https://huggingface.co/aryanshh/littercam-yolov9c) são variações da mesma linha: não contar como modelos independentes de famílias diferentes.
- [CivicSense](https://github.com/muhammad-fiaz/civicsense): protótipo com detecção de pessoas/atos e GPL-3.0. Não recomendar para EcoVisão de acúmulos.

### Checagem jurídica obrigatória
Citar a fonte não cria licença de código/pesos. [GitHub — sobre licenciamento](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository). [Ultralytics — licença](https://www.ultralytics.com/license). O modelo/artefato pode ser MIT/Apache, mas o executor e pesos de base podem ter obrigações distintas. **Não incorporar pesos ou código sem permissões claras**.

## Vídeos concretos para o teste (links que abrem a fonte)
| Prioridade | Cena | Tempo | Link | Licença conhecida/observação |
|---|---|---|---|---|
| **V1 positivo** | Rua com lixo espalhado e pouco trânsito | **16 s** | [Pexels 33214867](https://www.pexels.com/video/urban-street-with-litter-and-sparse-traffic-33214867/) | Pexels Free. Ideal para anotar a rua, mas não é percurso comprovado em câmera móvel |
| **V2 positivo** | Entulho/madeira em calçada de São Paulo | **9,6 s** | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Madeira_jogada_na_cal%C3%A7ada.webm) | CC BY 3.0, Daniel Fraga, **licença do upload ainda exige review**; atribuir e usar com cautela |
| **V3 difícil** | Lixeira transbordando em rua de Hong Kong | **14 s** | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:180301_06_A_CityRoam_03.webm) | CC BY 3.0, Videvo, crédito e link de licença |
| **V4 negativo** | Trabalhadores recolhendo lixo na rua | Curta duração | [Pexels 13258686](https://www.pexels.com/video/people-throwing-trash-to-dustcart-13258686/) | Conteúdo de coleta autorizada deve **não** ser rotulado automaticamente como irregular |
| **V5 negativo** | Pessoas atravessando rua | **15 s** | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:People_waiting_to_cross_the_street.webm) | CC BY-SA 3.0; útil para falso positivo em objetos/pessoas |

**Limitação relevante:** estes links são vídeos de rua, resíduos ou controles. **Não foi confirmado que V1–V5 tenham POV contínuo de uma pessoa caminhando e passando por um monte de lixo.** Para testar transferência ao cenário proposto, gravar 1–2 vídeos próprios/autorizados de ~1 min com câmera móvel, sem rostos/placas identificáveis; registrar consentimento quando aplicável.

## Matriz de teste honesta (antes de escolher o vencedor)
1. Download manual dos vídeos pelos links originais; **não commitar vídeo de terceiro** no projeto sem verificar licença e necessidade.
2. Criar anotação manual de **evento**, não só caixa (início/fim, tipo: pile / regular_collection / empty / ambiguous).
3. Rodar no mesmo hardware e configuração **dois candidatos licenciados** primeiro: LitterCam v3 e CatSat; processar os mesmos frames e comparar latência/uso de RAM.
4. Pedir licença ou usar apenas análise isolada autorizada antes de usar Roshians/pLitter em produto/publicação. Não divulgar resultado gerado por uso indevido.
5. Medir TP, FP, FN **por evento único**; `precision = TP/(TP+FP)`, `recall = TP/(TP+FN)`; latência em s/vídeo, ocorrência por minuto, duplicações, falhas em negativos, estabilidade de boxes e necessidade de revisão humana.
6. Definir sucesso somente com resultado observado; **não publicar mAP/accuracy de conjuntos distintos como comparação direta**.
7. Se nenhum modelo detectar montes de forma confiável, manter pipeline com fixtures **rotuladas como simulação** e documentar gap de domínio no pitch.

### Recomendação técnica para colegas
- **Não fazer A depender de B:** FastAPI / schema de ocorrência / mapa podem usar fixtures e contrato estável enquanto ocorre benchmark.
- Primeiro vídeo local com frame/tempo/privacidade; GPS mock explícito; JSON por ocorrência (evento), não por frame.
- A fronteira mais segura é `DetectorAdapter.detect(video) -> CandidateEvents[]`; trocar modelos sem reescrever a API.
- Se a licença/uso da Ultralytics for incompatível com comercialização futura, avaliar ONNX Runtime com pesos e exportações cuja licença tenha sido esclarecida.

## Estado da validação
- **Modelos:** códigos, READMEs, model cards e licenças raiz inspecionados; **inferência não executada**.
- **Vídeos:** páginas públicas encontradas e duração/uso descritos; **arquivos não baixados nem avaliados frame a frame**.
- **Licença:** dois candidatos de partida com licença declarada de pesos (LitterCam v3, CatSat), mas cadeia de licença do runtime a confirmar.
- **Decisão:** ranking técnico de triagem; não altera ranking geral da LP nem substitui validação com CMTU/SEMA.
