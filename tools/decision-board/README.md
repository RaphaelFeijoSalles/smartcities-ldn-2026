# Decision Lab — landing page comparadora do Smart Cities

**Status:** ferramenta interna de apoio à escolha, NÃO produto concorrente, decisão oficial ou votação com backend.

## Abrir em 30 segundos
Execute na **raiz** do repositório:

```bash
python3 -m http.server 4173
```

Acesse: **http://localhost:4173/tools/decision-board/**

No Windows: `py -m http.server 4173`. Encerrar: Ctrl+C. Não abra `index.html` como `file://`: os dados JSON exigem servidor HTTP local.

## Funcionalidades
- Página **responsiva** (celular, notebook e projetor); filtros por setor, desafio e busca.
- **15 propostas**, 15 desafios e cinco depoimentos, com referências, principais bloqueios e um MVP recortado por ideia.
- Ranking calculado de **notas provisórias do assistente**, não da banca, com seis critérios ponderados, fontes e justificativas.
- Notas **editáveis** por candidato; comparar até três lado a lado; exportar `.md` e `.json` para a [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2).
- Ajustes mantidos **somente no navegador (localStorage)**; sem sincronização com outras máquinas ou publicação automática no GitHub.
- Zero npm, framework, chave, API externa, banco, login, cobrança ou custo de IA para rodar a página.

## Arquitetura para manter com uma chamada de IA

```text
data/decision/
  smartcities-decision-v1.json        ← setores, desafios, ideias, evidências
  smartcities-assessments-v1.json     ← avaliações e justificativas separadas
tools/decision-board/
  index.html                          ← marcação estática
  style.css                           ← visual responsivo
  model.mjs                           ← pontuação, filtros e exportações puros
  app.mjs                             ← interface e estado local
  model.test.mjs                      ← testes
```

Novos áudios, links e ideias: atualizar **os JSONs**, não duplicar dados em JS e HTML. Se mudar a rubrica, atualizar pesos no catálogo, motivos no arquivo de avaliações e testes. Preservar os IDs conhecidos para não quebrar comparações. **Uma única execução do agente pode fazer toda manutenção**; isso não significa ter um agente online ou sistema automático de IA dentro da LP.

### Prompt único para Codex/Claude/outro agente

```text
Você é mantenedor do Decision Lab Smart Cities 2026. Leia README.md,
AGENTS.md, docs/decision/README.md,
docs/decision/03_EVIDENCIAS_E_FONTES.md,
data/decision/smartcities-decision-v1.json,
data/decision/smartcities-assessments-v1.json,
tools/decision-board/README.md e os demais arquivos desta pasta.

TAREFA: [INSERIR NOVO ÁUDIO, LINK, PROPOSTA OU AJUSTE].

Faça uma atualização pequena e completa, numa branch e PR isolada.
Comece pelos JSONs como fonte canônica. Não invente fatos, validações
de usuário, autorização de API, compra, edital, permissão de mídia
nem resultados de teste. Identifique testemunho, fonte oficial e
hipótese como categorias diferentes. Respeite IDs, fontes e os gates.
Não duplique ideias ou reabra tarefas já concluídas. Altere a UI
apenas se os dados atuais não bastarem. Preserve o visual responsivo
e a exportação para a Issue #2. Não faça merge/deploy/gastos.

Rode:
node --test tools/decision-board/model.test.mjs
node --check tools/decision-board/app.mjs
git diff --check

Informe PR, evidência, arquivos alterados, testes (PASS/FAIL/NOT RUN),
bloqueios e UMA próxima decisão humana. Não declare PASS sem rodar.
```

## Como testar a experiência
1. Em largura de celular, a página não deve apresentar scroll horizontal.
2. Filtro `Inteligência legislativa / 02.1` mostra LexBase.
3. Editar a nota altera a colocação e o quadro de comparação.
4. Selecionar até três; a quarta deve ser recusada sem apagar as anteriores.
5. Exportar `.md` e verificar que contém fontes e ressalvas.
6. Recarregar: alterações locais persistem; `Restaurar notas` preserva anotações.
7. Abrir o [catálogo público SIGLON](https://geo.londrina.pr.gov.br/portal/apps/sites/#/aplicativospublicossiglon); conferir conteúdo e licença manualmente.

## Testar a lógica sem abrir navegador
```bash
node --test tools/decision-board/model.test.mjs
node --check tools/decision-board/app.mjs
```

**Limites:** a página não desenvolve MVP, não valida usuário, não faz revisão jurídica, não disponibiliza dados restritos e não seleciona a ideia automaticamente. O regulamento integral e os direitos de IA/código anterior seguem a conferir. Após consenso, registrar decisão na Issue #2 e atribuir três tarefas isoladas por área.
