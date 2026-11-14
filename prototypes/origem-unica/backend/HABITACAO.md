# Habitação — handoff backend

Responsável: trilha backend João/Codex; integrador Raphael. Missão recebida em 14/11/2026; relacionada à Issue #5 (engenharia), sem Issue específica de habitação atribuída. Branch `feat/origem-unica-habitacao-data`, baseada na main remota `ea3a25a`. Ownership somente `prototypes/origem-unica/backend/**`.

## Execução

Além de `pip install -r requirements.txt`, instalar `pip install 'xlrd>=2.0.1,<3'` para ler o XLS oficial. A inclusão no requirements está aguardando alinhamento do integrador (hot file); sem xlrd o endpoint mantém snapshot válido ou retorna UNVERIFIED, sem quebrar saúde.

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
curl http://127.0.0.1:8000/api/habitacao/municipios/4113700
curl 'http://127.0.0.1:8000/api/habitacao/empreendimentos?municipio=411370'
python -m pytest -q
```

Contrato SNHIS completo de resposta real: `HABITACAO_CONTRACT.json`. O código de seis dígitos também é aceito para SNHIS por correspondência única ao código de sete dígitos presente na fonte. MCMV exige seis dígitos, como publicado no arquivo; não inventa dígito verificador.

## Fontes verificadas em 14/11/2026

[Portal oficial](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/programa-minha-casa-minha-vida/bases-de-dados-do-programa-minha-casa-minha-vida): página informa atualização em 03/11/2026 e periodicidade mínima trimestral. Isso não é a data de referência de cada registro. Links são descobertos pelo texto no portal; não existe endpoint REST presumido.

- SNHIS: XLS binário Excel, aba `FNHIS Semanal MCID`, 19 colunas, 5.596 linhas de entes. Arquivo `FNHIS_QUINZENAL_MCID_2026_10_20.xls`. Referência observada: 20/10/2026. Identificador real `COIBGE` numérico de sete dígitos. Linhas estaduais são excluídas da consulta municipal. Consulta de Londrina confirmada: `4113700`, `Regular` na referência da fonte, não certificação atual.
- [Dicionário SNHIS](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/programa-minha-casa-minha-vida/minha-casa-minha-vida-fnhis-sub-50-1/arquivos-fnhis-sub-50/copy_of_Dicionarios_SNH_2025_10_09.pdf): descreve dez campos, incluindo `CÓDIGO IBGE` e `SITUAÇÃO DOCUMENTAÇÃO`. O XLS usa `COIBGE`, não contém situação agregada da documentação e inclui campos adicionais. Não inferimos documentação completa nem regularidade a partir dos quatro requisitos. `SITUAÇÃO MUNICÍPIO` é a situação declarada. Pendência documental pode coexistir com município regular.
- MCMV subsidiado: ZIP `mcmv_subsidiado_202606302.zip`, CSV `mcmv_subsidiado_20260630.csv`, UTF-8, separador `;`, referência 30/06/2026. `cod_ibge` aparece como `411.370`. Importação real de 26.111 linhas, 42 para Londrina. Esses números contam linhas, não empreendimentos únicos. Há operações repetidas, inclusive com valores distintos: preservar linhas e sinalizar `operacao_repetida_na_fonte`, sem somar unidades. Operação ausente permanece null.
- [Dicionário MCMV](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/arquivos-1/Dicionarios_SNH_2025_10_09.pdf): versão 2.4, de 09/10/2025. Só conjunto subsidiado de empreendimentos foi consultado, não contratos individuais FGTS/FS.

Grau: downloads e esquemas CONFIRMADOS por execução; atualização atual além da referência e certificação administrativa NÃO VERIFICADAS. `last_modified` permanece null quando o servidor não informa. SHA-256 refere-se ao arquivo original baixado; o snapshot armazena somente campos permitidos, não CNPJ, nomes de pessoas ou contratos individuais.

## Cache e falhas

Cache persistente por fonte, troca atômica após parsing/validação, TTL de uma hora e timeout de 20 segundos por requisição. Primeira consulta precisa baixar portal e arquivo. Limite de arquivo 20 MB; ZIP é lido em memória, nunca extraído em paths fornecidos pelo arquivo. Não segue redirecionamentos para fontes desconhecidas.

Paths padrão: `~/.cache/origem-unica/snhis.json` e `mcmv.json`; configurar `ORIGEM_UNICA_SNHIS_CACHE` / `ORIGEM_UNICA_MCMV_CACHE` para volume persistente. Cache é público, sem dados pessoais; não versionado. Em falha, conserva último snapshot oficial válido, informa `atualizacao_indisponivel` e data original. Sem snapshot, retorna `UNVERIFIED`. Município ausente/desconhecido tem situação `UNKNOWN` e nível `UNVERIFIED`; nunca irregular por ausência. Campos desconhecidos não são preenchidos artificialmente.

Não há fallback sintético automático para habitação. `ORIGEM_UNICA_MOCK` existente pertence somente a SIGLON/CNES. Inputs sintéticos dos testes estão explicitamente marcados SINTÉTICOS / MOCK. Fixture SNHIS é um recorte real oficial de Londrina com proveniência, não simulação. Testes de falha alteram dados apenas em diretórios temporários.

## Limitações e revisão

Sem frontend, login, banco, alteração de CI ou atualização em cadastros oficiais. Não houve merge/deploy. Cache em disco pressupõe filesystem confiável; SHA da fonte é evidência de download, não assinatura digital do cache. Mudanças de formato/link falham de forma fechada e exigem revisão. Testes não certificam regularidade jurídica atual.

Publicação: BLOCKED — GitHub CLI sem login, Git sem credencial disponível e ferramentas de UI sem VS Code/navegador conectado. Texto da PR em `HABITACAO_PR.md`. Fazer push/abrir PR quando a sessão estiver autenticada; não mesclar automaticamente.
