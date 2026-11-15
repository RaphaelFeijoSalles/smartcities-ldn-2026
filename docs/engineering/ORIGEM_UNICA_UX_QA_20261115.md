# Origem Única — verificação de experiência

Habitação exibe o retrato oficial com data e fonte. O número de registros MCMV conta linhas da fonte. Saúde declara a origem da resposta e mantém a revisão na sessão. Logradouros apresenta vínculos para conferência com dados sintéticos.

## Reproduzir os testes de interface

Use Node 22+, Playwright e Chromium. Instale as ferramentas em um diretório temporário para manter o checkout e as dependências do projeto intactos.

```bash
npm install --prefix /tmp/origem-unica-playwright playwright
node /tmp/origem-unica-playwright/node_modules/playwright/cli.js install chromium
export UX_PLAYWRIGHT=/tmp/origem-unica-playwright/node_modules/playwright/index.mjs
curl --fail --silent --show-error 'https://origem-unica-api.onrender.com/api/habitacao/municipios/4113700' -o /tmp/origem-snhis.json
curl --fail --silent --show-error 'https://origem-unica-api.onrender.com/api/habitacao/empreendimentos?municipio=411370' -o /tmp/origem-mcmv.json
export UX_SNHIS=/tmp/origem-snhis.json UX_MCMV=/tmp/origem-mcmv.json
node tests/origem-unica/ux-browser.mjs
```

O teste usa os arquivos do checkout, intercepta as respostas de Habitação e testa 1366×768, 375×812 e 320×720. A fonte tipográfica externa usa fallback para manter a execução reproduzível. O script registra a largura do documento e captura o panorama em `/tmp/origem-unica-ux`. Para outro Chromium, use `UX_CHROMIUM` e, se necessário, `UX_CHROMIUM_ARGS` com um array JSON. Para salvar em outro local, use `UX_SCREENSHOTS`.

Os valores esperados desta rodada são Londrina CONFIRMADO, 3/3 e 42 linhas. Se os snapshots oficiais mudarem, confira as novas referências antes de atualizar a expectativa do smoke.

Os outros cenários usam os checkouts das respectivas PRs. Execute o mesmo script com `UX_SUITE=saude UX_ROOT=/caminho/do/checkout` ou `UX_SUITE=logradouros UX_ROOT=/caminho/do/checkout`. Saúde usa a fixture sintética de contrato, testa pesquisa, teclado, seleção, revisão, CSV e quatro respostas de atualização, incluindo 503. Logradouros usa dados embutidos e testa a pesquisa, candidatos, CSV de pendências e estado vazio.

## Demonstração rápida

1. Habitação: confira o snapshot, selecione Conselho Gestor e mostre a fonte e a data. Aplique um filtro e confira que o panorama permanece disponível.
2. Saúde × CNES: abra Conciliação, pesquise um registro, inspecione os campos sinalizados, escolha uma ação explícita e exporte a seleção. Confira o rótulo de proveniência.
3. Logradouros: pesquise `102 sao`, compare os nomes vinculados pelo CODLOG e exporte as pendências da seleção sintética.

O smoke cobre interações, layout e foco com Chromium. Validação com leitores de tela e outros motores de navegador requer uma rodada própria. As interfaces de importação aguardam um contrato publicado para o frontend.
