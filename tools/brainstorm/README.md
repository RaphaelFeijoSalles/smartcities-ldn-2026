# Quadro local de brainstorm (ferramenta interna, NÃO o MVP)

**Propósito:** comparar ideias hoje, coletar a decisão do grupo e ganhar tempo. Não prende a equipe a PulsoGov, ContratoClaro ou DestravaGov. Sem internet, API, banco, credenciais ou dependências npm.

## Usar em 30 segundos
Na **raiz** do repositório:
```bash
python3 -m http.server 4173
```
Acesse: http://localhost:4173/tools/brainstorm/

Windows, se necessário: `py -m http.server 4173`. Pare com Ctrl+C.

**Faça a reunião:** ajuste os nomes/propostas, dê notas 1–5 segundo os critérios, preencha as quatro respostas finais e clique **Exportar decisão em Markdown**.

**Importante:** o navegador salva só localmente (localStorage); notas **não sincronizam** entre computadores. Escolha um facilitador, projete ou compartilhe uma tela, e coloque o Markdown exportado na [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2). Não contém entrevista real nem dado oficial.

## Testar o cálculo
```bash
node --test tools/brainstorm/scoring.test.mjs
```
Node.js 20+ recomendado (nenhuma instalação npm).

## Reutilização
- O algoritmo de pesos está isolado em `scoring.mjs`.
- A UI não tem dependências e pode ser descartada após a decisão.
- O MVP concorrente nascerá em `apps/web/` apenas após a Issue #2 ser concluída.
- Pesos são **propostos**, não os critérios oficiais do evento. Se a organização divulgar pesos, atualize com decisão explícita antes de reavaliar.

## Limites
Sem colaboração em tempo real, sem salvar na nuvem, sem recomendar a ideia automaticamente. Comparação é auxiliar à decisão humana, às entrevistas e ao desafio oficial.
