# Origem Única — revisão independente e integração rápida

**Status:** pacote QA independente, **não é prova de que João e Raphael já integraram suas PRs**. Revisão de 14/11/2026. Não alterar o backend de João nem o frontend de Raphael nesta branch.

## 1. Integração sem conflito

| Dono | Branch/escopo informado | Não tocar |
|---|---|---|
| João — Codex | `feat/origem-unica-backend` · `prototypes/origem-unica/backend/**` | `tools/origem-unica/**`, workflow de Pages |
| Raphael — Codex | `feat/origem-unica-frontend-integration` · `tools/origem-unica/**` | `prototypes/origem-unica/backend/**` |
| Reviewer independente | `qa/origem-unica-integration-contract-20261114` · `scripts/origem-unica/**`, `tests/origem-unica/**`, docs + workflow QA | Código dos dois agentes |
| Tiago | Campos/camadas SIGLON, screenshots, validação geográfica | PRs dos outros |
| Matheus | Teste manual, casos de uso, apresentação | Dados oficiais e código dos outros |

**Antes de mesclar:** conferir `git diff origin/main...HEAD --name-only` de cada branch. Se backend e frontend tocarem o mesmo arquivo, parar integração, decidir ownership e corrigir via PR separada; não forçar push nem sobrescrever alterações.

## 2. Contrato mínimo de `GET /api/records`

```json
{
  "mode": "MOCK",
  "items": [
    {
      "id": "OU-001",
      "name": "UBS fictícia",
      "comparison_status": "CONFLICT",
      "score": 0.87,
      "sources": [
        {
          "system": "SIGLON",
          "source_id": "SIG-001",
          "name": "UBS fictícia",
          "address": "R. Exemplo 150",
          "phone": null,
          "fetched_at": null
        },
        {
          "system": "CNES",
          "source_id": "CNES-MOCK-001",
          "name": "Unidade Básica Exemplo",
          "address": "Rua Exemplo 105",
          "phone": null,
          "fetched_at": null
        }
      ],
      "conflicts": [{"field": "address", "values": {"SIGLON": "R. Exemplo 150", "CNES": "Rua Exemplo 105"}}]
    }
  ]
}
```

**Condições:** `mode` declara origem `MOCK`, `SNAPSHOT` ou `LIVE` (também `DEMO_SYNTHETIC` em fixtures existentes); os nomes/endereços acima são falsos. `fetched_at` **precisa ter horário ISO para LIVE/SNAPSHOT**, e pode ser nulo para MOCK. Em casos `ONLY_IN_A` ou `ONLY_IN_B`, `score=null` é válido. Sem inventar campos ausentes ou comparar sistemas de coordenadas incompatíveis.

**Status aceitos:** `MATCH`, `POSSIBLE_MATCH`, `CONFLICT`, `ONLY_IN_A`, `ONLY_IN_B`.

**O fluxo de revisão permanece local/simulado** até existir autorização, backend persistente e autenticação adequada.

## 3. Rodar gates (um bloco, na raiz do repositório)

```bash
node --test tests/origem-unica/contract-gate.test.mjs &&
node scripts/origem-unica/contract-gate.mjs --fixture tests/origem-unica/records-contract.fixture.json &&
node --check tools/origem-unica/app.js
```

**Quando João tiver iniciado o backend local:**
```bash
node scripts/origem-unica/contract-gate.mjs --url http://127.0.0.1:8000/api/records
```

O verificador de API é **somente leitura** e aceita **somente localhost**. Se a API não estiver disponível, resultado é `UNKNOWN/BLOCKED`, não PASS. Não depende de npm.

## 4. Matriz de casos de teste

| ID | Caso | Esperado |
|---|---|---|
| T01 | Mesmo ID em nome com abreviação | `MATCH` com ambas fontes preservadas |
| T02 | Endereço com número diferente | `CONFLICT` e valores A/B exibidos |
| T03 | Nome parcialmente semelhante sem ID confiável | `POSSIBLE_MATCH`, não correção automática |
| T04 | Unidade só no SIGLON | `ONLY_IN_A`, `score=null` |
| T05 | Unidade só no CNES | `ONLY_IN_B`, `score=null` |
| T06 | Telefone ou endereço ausente | `null`/não informado; não inventar campo |
| T07 | Mesma fonte reaproveitada em dois registros | `FAIL` por ambiguidade |
| T08 | API indisponível | Fallback `MOCK` explícito, sem dados apresentados como atuais |
| T09 | API com dados LIVE e `fetched_at` ausente | `FAIL` de proveniência |
| T10 | Frontend em celular/tablet | Comparação legível e ações acessíveis sem corte de texto |
| T11 | Revisar divergência, reabrir, exportar | Decisão e CSV coerentes com o status |
| T12 | CSV baixado | Nunca atribuir status de validade oficial a decisão fictícia |
| T13 | API traz score 87 ao invés de 0.87 | `FAIL`; score heurístico deve estar entre 0 e 1 |
| T14 | Latitude inválida ou CRS não transformado | `FAIL` ou revisão pendente, nunca pin inventado |

Os testes automatizados cobrem **forma e invariantes** do JSON; eles não validam por si só o acerto do algoritmo de matching, a semântica real de cada base ou a experiência no navegador. João precisa adicionar casos de verdade-terreno aos seus próprios testes.

## 5. Ordem de integração recomendada

1. Publicar as PRs dos dois agentes; comparar arquivos modificados e head SHAs.
2. **Integrar primeiro esta PR QA (após CI verde e revisão)**, pois remove o bloqueio indevido de `fetch()` do workflow antigo.
3. Backend de João: verificar `pytest`, consultar `/api/records` em localhost e rodar checker `--url`. Se o retorno não respeitar o contrato, corrigir no backend em nova revisão; o front pode ter adapter de transformação explícito, nunca dados inventados.
4. Frontend de Raphael: verificar HTTP local, modo LIVE/SNAPSHOT/MOCK, falha de rede, revisão local, exportação, responsividade.
5. Fazer smoke final com ambos no mesmo computador. **CI verde sem smoke no navegador = UNKNOWN para demo**, não pronto.
6. Aprovar/mesclar apenas o que foi testado, respeitando a escolha registrada na Issue #2 e as regras do hackathon da Issue #1.

## 6. Mensagem curta do revisor para PRs

`PASS/FAIL/UNKNOWN | Arquivos sobrepostos: ... | Contrato --url: ... | Backend pytest: ... | Frontend mobile: ... | Fonte real ou mock: ... | Bloqueadores: ... | SHA revisado: ...`

**Não afirme precisão de matching, economia de tempo ou correções reais sem evidência.** Nunca fazer alterações nos cadastros oficiais.
