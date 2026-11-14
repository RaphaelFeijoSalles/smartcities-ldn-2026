# EcoVisão — primeiro fluxo de MVP (candidato, NÃO escolhido)

**Estado:** experimento isolado para não perder tempo enquanto a equipe decide. **Não usa visão computacional real**, não tem vídeo/câmera, não processa fotos da Folha e não se conecta à Prefeitura. O backend **rejeita fontes reais no P0**. A interface é responsiva e funciona com dados sintéticos.

## Executar no Linux (raiz do repositório)
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r prototypes/ecovisao/api/requirements-dev.txt
uvicorn prototypes.ecovisao.api.main:app --reload
```
Acesse **http://127.0.0.1:8000/**. Swagger/API em **http://127.0.0.1:8000/docs**.

Teste automatizado:
```bash
python -m pytest prototypes/ecovisao/api/test_api.py -q
```

## O que já faz
1. Inicia SQLite local e importa **3 ocorrências SINTÉTICAS** no primeiro uso.
2. Exibe contagens, eventos e **pins de GPS sintéticos** (Leaflet/OSM se houver internet; lista e revisão continuam disponíveis sem mapa).
3. Abre ocorrência, permite **revisão humana** (sugerir inspeção / descartar como falso positivo), recalcula métricas.
4. Cria uma nova ocorrência de demonstração por POST e lista por GET.
5. Expõe um **contrato estável**, para o detector que Miguel/João testarem no futuro.

**Atenção:** não há inferência em vídeo, imagens reais ou precisão validada. O valor `confianca` de fixtures NÃO representa modelo treinado.

## Contrato (para Tiago e João trabalharem sem conflito)
- `GET /health` → modo `DEMO_SYNTHETIC`, detector `NOT_RUN`.
- `GET /api/ocorrencias` → `{mode, items:[...]}`.
- `POST /api/ocorrencias` → JSON com `bairro, latitude, longitude, timestamp, confianca`, **somente fonte `DEMO_SYNTHETIC`**.
- `PATCH /api/ocorrencias/{id}/review` → `{status:"CONFIRMED_FOR_INSPECTION"|"REJECTED",note:"..."}`.
- `GET /api/metricas` → contadores de candidatos, pendentes, confirmados e descartados + totais por setor.
- `GET /docs` → contrato OpenAPI.

Exemplo:
```bash
curl -s http://127.0.0.1:8000/health
curl -s http://127.0.0.1:8000/api/ocorrencias
curl -s -X PATCH http://127.0.0.1:8000/api/ocorrencias/1/review \
  -H 'Content-Type: application/json' \
  -d '{"status":"REJECTED","note":"Falso positivo em demo"}'
```

## Integrações futuras (fora deste spike)
- `DetectorAdapter` para modelo de visão **licenciado e testado**, gerando um candidato **por evento**, não por frame.
- Sincronização de GPS real e imagem em acesso restrito, após autorização.
- Migração opcional para React/Vite, PostgreSQL/PostGIS, Vercel/Render/Supabase — **não é pré-requisito para demonstrar**.
- Evitar servir imagens de cidadãos no frontend sem regras de privacidade e direitos.

## Uso em equipe
- Raphael é owner do contrato/backend do spike.
- Tiago pode melhorar mapa e UX em branch separada após ler este contrato.
- Miguel → João continuam benchmark do detector em outra branch com vídeo licenciado, relatório `TP/FP/FN` e velocidade.
- Matheus prepara ground truth ambiental e negativos em documento/Issue (tablet).
- Miguel valida usuário/canal com CMTU/SEMA e pitch; envia handoff até 13h.

## Gates para mesclar código de MVP
- **Issue #2 precisa escolher a EcoVisão** ou declarar explicitamente esse spike parte da demo.
- **Issue #1 precisa confirmar regras de código prévio/IA/IP.**
- Testes de API PASS + inspeção manual mobile/desktop + revisão do integrador.
- Nenhuma inferência simulada pode ser anunciada como inferência real.

**Banco de demonstração:** `prototypes/ecovisao/api/demo.sqlite` (ignorado pelo Git). Para recomeçar, **desligue o servidor** e remova esse arquivo específico; não apague arquivos da equipe sem revisar. Não há dados pessoais por padrão.
