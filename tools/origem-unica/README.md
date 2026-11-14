# Origem Única — frontend de conciliação

Protótipo estático integrado, sem framework. Consulta **somente** `GET /api/records`; revisão humana e auditoria são simulações locais. Nenhuma ação escreve em SIGLON, CNES ou outra base oficial.

## Posicionamento validado e recorte

Validação direta comunicada à equipe em 14/11/2026: Adilson, gerente do SIGLON, relatou manutenção repetida de endereços em aproximadamente 13 bancos de secretarias sem padronização. O SIGLON já usa endereços da Fazenda e está construindo uma base georreferenciada. A proposta é apoiar revisão rastreável e futura distribuição por API, aproveitando esse trabalho. **A demo continua restrita a SIGLON Saúde × CNES**; não conecta as 13 bases nem afirma ter encontrado divergências reais nelas.

## Executar

Na raiz do repositório:

```bash
python3 -m http.server 4173
```

Abra `http://localhost:4173/tools/origem-unica/`. O servidor estático não oferece `/api/records`; nesse caso a página exibe imediatamente o fallback **MOCK · DADOS SINTÉTICOS**. Os seis registros, nomes, endereços, telefones, IDs e scores do fallback são inventados.

Para integrar ao FastAPI do João, sirva o frontend e `GET /api/records` na mesma origem **ou** abra `http://localhost:4173/tools/origem-unica/?api=http://localhost:8000/`. A segunda opção requer que o FastAPI permita CORS para `http://localhost:4173`. O parâmetro `api` também aceita a URL completa terminada em `/api/records`. A página tenta a API na abertura e no botão **Atualizar da API**; após 75 segundos sem resposta, volta ao MOCK. Enquanto aguarda, os registros sintéticos já estão visíveis. Quando a API estiver disponível, o topo mostra **API** e o horário da última sincronização.

O GitHub Pages usa por padrão a URL HTTPS real `https://smartcities-ldn-2026.onrender.com/`. A variável pública do repositório `ORIGEM_UNICA_API_BASE` pode substituir essa origem no build; `?api=` continua disponível para testes. O `render.yaml` configura `ORIGEM_UNICA_CORS_ORIGINS` para `http://localhost:4173` e `https://raphaelfeijosalles.github.io`, além de preparar um serviço gratuito com MOCK explícito para a apresentação. Consulte `prototypes/origem-unica/backend/README.md` para execução local e modo de consulta às fontes públicas.

Para publicar, configure o serviço Render existente conforme `render.yaml`: raiz `prototypes/origem-unica/backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, runtime Python e plano `free`. O Blueprint deixa deploy automático desligado e inicia com `ORIGEM_UNICA_MOCK=1`, logo a página pública mostrará dados sintéticos identificados. Rode o workflow Pages em `main` após o backend responder em `/api/health`. Para demonstrar consulta às fontes públicas, altere `ORIGEM_UNICA_MOCK` para `0` no serviço e reinicie; a resposta só terá `mode=LIVE` quando SIGLON e CNES responderem. Em caso de falha de uma fonte, a resposta será `MOCK` com proveniência separada por registro.

## Contrato aceito

`GET /api/records` deve responder JSON com `mode` (`LIVE`, `SNAPSHOT`, `MOCK` ou `DEMO_SYNTHETIC`) e `items` (array). Cada item deve ter `id`, `name`, `sources`, `comparison_status`, `score` e `conflicts`. No contrato de QA, `sources` é um array de registros com `system`, `source_id`, `name` e `fetched_at`; `comparison_status` aceita `MATCH`, `POSSIBLE_MATCH`, `CONFLICT`, `ONLY_IN_A` e `ONLY_IN_B`. A UI também lê `data_origin` por fonte: se a API mistura uma fonte pública com fallback sintético sob `mode=MOCK`, mostra **FONTES MISTAS** e rotula cada fonte separadamente.

O adaptador em `adapter.js` também aceita pequenas variações: `sources` por item como objeto (`{"siglon": {...}, "cnes": {...}}`) ou array de objetos com `record`, além de `a`/`b` e `source_a`/`source_b` quando esses objetos declaram sistema, identificador, nome e coleta. `sources` no topo pode ser um catálogo opcional de nomes e URLs. `score` deve ser 0–1 ou `null`; `conflicts` aceita nomes de campos ou objetos com `field`. Uma fonte única em `ONLY_IN_B` aparece na coluna B. Atributos originais de cada fonte são preservados no adaptador, inclusive coordenadas quando presentes; campos ausentes aparecem como “Não informado”. Respostas sem campos obrigatórios ativam o fallback sintético, sem criar identificadores ou valores para completar a API.

Um item mínimo para smoke:

```json
{
  "mode": "MOCK",
  "items": [{
    "id": "PAIR-1",
    "name": "UBS Exemplo",
    "comparison_status": "conflict",
    "score": 0.91,
    "conflicts": [{"field": "address", "values": {"SIGLON": "Rua A, 1", "CNES": "Rua A, 2"}}],
    "sources": [
      {"system": "SIGLON", "source_id": "S-1", "name": "Exemplo", "address": "Rua A, 1", "fetched_at": null},
      {"system": "CNES", "source_id": "C-1", "name": "Exemplo", "address": "Rua A, 2", "fetched_at": null}
    ]
  }]
}
```

A interface mostra a proveniência **declarada pela API**, sem atestar que a fonte ou o registro seja oficial. O CSV exporta as linhas atualmente filtradas, incluindo modo, status de comparação, score, conflitos, identificadores e proveniência dos dois lados. A trilha de revisão é local; no modo API, as decisões ficam somente na sessão da página e são preservadas ao atualizar se os dados do par continuarem iguais. O botão **Reiniciar demo** apaga as revisões locais. Na comparação, escolha **Usar endereço da fonte só na prévia**, registre a revisão e abra **Ver prévia JSON do registro para API**. O JSON mostra os dois endereços candidatos, a decisão simulada e o endereço escolhido em `consolidated_address`. Esse modelo não é um endpoint e não publica um endereço como oficial.

## Verificar

```bash
node --check tools/origem-unica/adapter.js
node --check tools/origem-unica/app.js
node --test tools/origem-unica/adapter.test.mjs
node --test tests/origem-unica/contract-gate.test.mjs
node scripts/origem-unica/contract-gate.mjs --url http://127.0.0.1:8000/api/records
```

No navegador, conferir o indicador MOCK com API ausente; depois fornecer uma resposta de teste da API e conferir indicador API, lista, filtro **Com conflito**, comparação lado a lado, revisão, contadores, reabertura e CSV. Abrir a 375 px e em desktop para verificar ausência de rolagem horizontal da página.

## Limitações

O contrato foi adaptado pelos campos combinados; uma mudança no JSON do backend pode exigir ajustar apenas `adapter.js`. Dados reais, autenticação, permissões, escrita, auditoria imutável e validação das fontes não fazem parte deste protótipo. A tabela de exemplos na aba Fontes permanece **sintética** em ambos os modos.
