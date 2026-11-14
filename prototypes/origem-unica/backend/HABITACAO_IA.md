# Análise de evidências de Habitação

O piloto atende somente Londrina/PR. A seção aparece junto às evidências de Habitação após a carga dos dois snapshots. Esta branch parte da `main` com a PR de filtros #39 já integrada. Nenhuma configuração de produção faz parte desta PR.

## Rodar a demonstração

1. No backend, instale as dependências existentes e rode `ORIGEM_UNICA_AI_MODE=demo uvicorn app.main:app --port 8000 --no-access-log`.
2. Na raiz, rode `python3 -m http.server 4173`.
3. Abra `http://localhost:4173/tools/origem-unica/?api=http://localhost:8000/` e espere os snapshots SNHIS e MCMV carregarem.
4. Na seção **Análise de evidências de Londrina**, deixe o código em branco e clique em **Analisar evidências com IA**.
5. Confira o rótulo **Demonstração determinística · sem chamada de IA**, os fatos citados, as datas e os links da fonte.

O endpoint `POST /api/habitacao/municipios/4113700/analise` lê apenas o cache validado dos serviços existentes. Aqueça os dois caches no mesmo processo pelo fluxo de Habitação. Sem algum snapshot, o endpoint retorna HTTP 503 e o painel original continua disponível. O modo `demo` usa fatos oficiais carregados e um plano determinístico. `off` desativa o endpoint de análise.

## Habilitação restrita do modo online

Depois de autorização do responsável, em ambiente de validação, configure os segredos **no servidor**:

| Variável | Configuração |
|---|---|
| `ORIGEM_UNICA_AI_MODE` | `live`. Sem a variável, o modo é `demo`. |
| `OPENAI_API_KEY` | Chave de projeto OpenAI autorizada. |
| `ORIGEM_UNICA_AI_MODEL` | Padrão `gpt-6.1-terra`. Revise compatibilidade e custo antes de alterar. |
| `ORIGEM_UNICA_AI_ACCESS_TOKEN` | Código separado e aleatório de no mínimo 32 caracteres. Compartilhe somente com o apresentador autorizado. O formulário usa esse código como Bearer e o remove do campo após iniciar a consulta. |
| `ORIGEM_UNICA_AI_BUDGET_DB` | Caminho absoluto para um arquivo SQLite em diretório privado, existente e gravável. Conserve o arquivo entre reinícios e compartilhe a mesma base entre workers do host. |

Sirva por HTTPS e mantenha somente as origens de frontend autorizadas na configuração CORS. Para o piloto, use um host e um worker. O orçamento SQLite coordena processos com acesso ao mesmo arquivo. Réplicas com discos distintos não compartilham a cota. Mantenha logs de acesso do endpoint desativados ou anonimizados na hospedagem. A instrumentação do recurso registra somente métricas de resultado, duração e tokens. A chave OpenAI nunca é usada no navegador.

## Controles e custo

- O modelo recebe município e código, situação SNHIS, os quatro instrumentos, referências e URLs oficiais, e quantidade de linhas MCMV. A projeção descarta registros individuais, identificadores de operação e unidades. A requisição não aceita texto de usuário, não habilita ferramentas e usa `store: false` na Responses API.
- O modelo escolhe e ordena identificadores permitidos. O servidor valida formato, valores, duplicatas e cobertura das fontes e só então renderiza o texto factual dos snapshots. Erros, recusas, respostas incompletas e referências fora da lista falham sem substituir o resultado por uma simulação.
- Há limite de 12 s por chamada OpenAI, 6 KiB para a requisição serializada e 512 tokens de saída. O modo pago exige código de acesso e reserva uma tentativa antes da chamada. Limite global de oito tentativas por dia UTC e intervalo de 30 s. Sem retries automáticos. Com caminho do banco ausente ou banco inacessível ou inválido, a chamada paga fica bloqueada. O modo demo tem intervalo de dois segundos por processo e não aciona a OpenAI.
- O [preço Standard do GPT-6.1 Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra) consultado em 14/11/2026 é US$ 1 por milhão de tokens de entrada e US$ 5 por milhão de saída. Cenário de 1.500 tokens de entrada e 512 de saída custa **cerca de US$ 0,0041 por análise**, ou US$ 0,0325 para oito tentativas com esse consumo. O valor depende da medição efetiva, do modelo configurado e da modalidade de preço.
- A saída orienta conferência humana. A situação oficial permanece nos endpoints de origem e o total MCMV continua representando linhas da fonte.

## Verificação

```bash
cd prototypes/origem-unica/backend
python -m pytest -q
```

Os testes cobrem o endpoint FastAPI, o transporte simulado da Responses API, recusa, saída incompleta, referências inválidas, autenticação, cota concorrente, timeout e ausência de dados. O modo online precisa de uma chamada de validação com chave autorizada antes de merge ou publicação. Não use chave falsa para alegar evidência de integração online.
