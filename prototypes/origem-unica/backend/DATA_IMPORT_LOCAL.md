# Área local de importação pública

A issue [#49](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/49) integra a interface local à API principal. O [contrato do importador](DATA_IMPORT.md) descreve os formatos, os mapeamentos e os resultados.

## Executar

No diretório `prototypes/origem-unica/backend`, com as dependências de `requirements.txt` instaladas:

```bash
ORIGEM_UNICA_DATA_IMPORT_LOCAL=1 \
ORIGEM_UNICA_DATA_IMPORT_TOKEN="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" \
ORIGEM_UNICA_MOCK=1 \
python -m uvicorn app.main:app --host 127.0.0.1 --port 8011 --workers 1 --no-proxy-headers --no-access-log
```

Abra [a área local](http://127.0.0.1:8011/data-import). Execute em uma máquina confiável, em loopback e com um único worker. Deixe `ORIGEM_UNICA_DATA_IMPORT_LOCAL` desabilitada no Render e em outros serviços acessíveis pela rede. A funcionalidade não tem login de usuário. O navegador usa a mesma origem e o servidor injeta o token no roteador do importador. Não adicione a rota a proxies, túneis ou páginas públicas.

## Conferir e exportar

1. Escolha a natureza e informe o mesmo escopo de identificador para as duas tabelas.
2. Preencha os metadados e confirme que as tabelas são públicas e livres de dados pessoais. A confirmação é obrigatória. O importador também rejeita cabeçalhos sensíveis reconhecidos. A conferência prévia do conteúdo cabe ao operador.
3. Gere o perfil da fonte A ou compare duas fontes. Se houver cabeçalhos conflitantes, informe o nome exato da coluna em cada fonte. A comparação exige pelo menos um campo comum além do identificador. Use fontes sintéticas exclusivamente com outras fontes sintéticas.
4. Consulte as ocorrências, confira as linhas nos arquivos originais e selecione decisões. Cada recibo aceita até 256 decisões. Exporte o JSON antes de sair ou trocar os parâmetros. O recibo documenta decisões declaradas, sem identificar o operador, editar registros ou atribuir validade oficial à fonte.

A área aceita CSV UTF-8 e XLS de uma planilha, com até 1 MiB, 5.000 linhas e 64 colunas por arquivo. A API mantém seu limite de corpo e restringe os envios a 10 segundos. O processo admite uma requisição de importação por vez e até 12 tentativas por minuto. O fluxo não usa IA, armazenamento persistente da aplicação ou acesso à URL declarada da fonte. A classificação oficial declarada continua sem verificação oficial.

## Reproduzir as evidências

Execute os testes HTTP no diretório do backend:

```bash
python -m pytest -q tests/test_data_import_local.py
```

Para o smoke de navegador, mantenha o servidor local ativo e execute na raiz do repositório, com Playwright e Chromium disponíveis:

```bash
node tests/origem-unica/data-import-browser.mjs
```

`UX_PLAYWRIGHT` pode apontar para o arquivo de entrada de uma instalação local do Playwright. Use `IMPORT_CHROMIUM` para indicar outro executável Chromium e `IMPORT_SCREENSHOTS` para escolher o diretório das capturas. O smoke usa apenas arquivos fictícios, faz requisições HTTP ao servidor da aplicação e valida o JSON exportado nos dois tamanhos de tela.
