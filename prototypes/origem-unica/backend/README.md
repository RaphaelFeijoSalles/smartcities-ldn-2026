# Origem Única — backend de conciliação

Backend FastAPI somente leitura para comparar unidades de saúde públicas de Londrina entre SIGLON Saúde e CNES. Não altera as fontes oficiais, não usa dados pessoais e não transforma similaridade em certeza.

## Fontes e esquema inspecionado

Inspeção feita em 14/11/2026:

- SIGLON/ArcGIS, layer `Unidades de Saúde`: `OBJECTID_1`, `UBS`, `NOME`, `ENDEREÇO`, `TELEFONE` e geometria pontual. O adaptador solicita saída WGS84 (`outSR=4326`). Fonte: <https://geo.londrina.pr.gov.br/server/rest/services/Publico/SaudeUnidadesBasicasAbrangenciaPublico/MapServer/0>
- CNES/API Dados Abertos: `codigo_cnes`, `nome_fantasia`, campos de endereço, telefone, latitude e longitude. Usa município IBGE `411370`, status ativo e tipo `2` (`CENTRO DE SAUDE/UNIDADE BASICA`). Fonte e Swagger: <https://apidadosabertos.saude.gov.br/> e <https://apidadosabertos.saude.gov.br/static/swagger.json>
- CSV local: adaptador independente. `data/fallback_mock.csv` contém apenas dados **SINTÉTICOS / MOCK** e é usado separadamente por fonte se uma API falhar.

O modo da resposta é `LIVE` somente quando as duas fontes reais respondem. Se qualquer fonte falhar, é `MOCK`, conforme o contrato compartilhado de QA. Os registros da fonte acessível continuam reais e identificados por URL em `data_origin`; somente a fonte indisponível recebe fixture. Registros reais nunca são conciliados com registros sintéticos. `/api/sources/status` expõe contagem, horário, origem, status e erro — uma falha nunca é apresentada como dado real.

## Linux: instalação e execução

Requer Python 3.11+.

```bash
cd prototypes/origem-unica/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Abra <http://127.0.0.1:8000/docs>. O CORS permite por padrão somente `http://localhost:4173`. Para outro frontend, defina `ORIGEM_UNICA_CORS_ORIGINS` com origens exatas separadas por vírgula, por exemplo `https://raphaelfeijosalles.github.io`; curingas e origens HTTP públicas são rejeitados.

Endpoints:

- `GET /api/health`
- `GET /api/records`
- `GET /api/conflicts`
- `GET /api/sources/status`

O primeiro acesso consulta as fontes em paralelo e pode levar alguns segundos. As respostas ficam em cache por 60 segundos.

Para ensaiar sem internet e sem esperar por timeouts, pare o servidor anterior e execute:

```bash
ORIGEM_UNICA_MOCK=1 uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Esse modo usa apenas fixtures **SINTÉTICAS / MOCK**. Para voltar às fontes públicas, reinicie sem a variável.

Consulta rápida (em outro terminal):

```bash
curl --max-time 45 http://127.0.0.1:8000/api/records
curl --max-time 45 http://127.0.0.1:8000/api/sources/status
```

## Testes

```bash
cd prototypes/origem-unica/backend
source .venv/bin/activate
pytest -q
```

Os testes cobrem mapeamento dos esquemas reais observados, correspondência, conflito de endereço/coordenadas, ausência de informação, atribuição um-a-um sem duplicidade, fallback CSV e contrato HTTP/CORS.

## Regra de matching

O algoritmo é determinístico e um-a-um. Prioriza identificador no mesmo namespace quando disponível, nome normalizado exato, endereço e distância geográfica. Similaridade textual só produz candidato quando acompanhada por endereço ou proximidade; nomes parecidos isoladamente não viram correspondência. Divergências de endereço, telefone e coordenadas são preservadas em `conflicts`. O `score` é heurístico e a resposta traz aviso de revisão humana.

Classificações: `MATCH`, `POSSIBLE_MATCH`, `CONFLICT`, `ONLY_IN_A` (SIGLON) e `ONLY_IN_B` (CNES).

Cada item inclui os registros originais, os campos normalizados, a origem pública ou `MOCK`, horários de coleta, evidências e divergências. Valores ausentes permanecem `null`.
