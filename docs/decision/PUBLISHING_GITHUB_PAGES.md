# Publicar o Decision Lab com GitHub Pages — guia de ativação

**Status:** workflow entregue em branch de PR; **não publicado até o merge + ativação do Pages**. O site é somente o **painel de brainstorm**, não o produto concorrente.

## Link previsto após deploy
- Entrada para colegas: **https://raphaelfeijosalles.github.io/smartcities-ldn-2026/**
- Endereço interno preservado: **https://raphaelfeijosalles.github.io/smartcities-ldn-2026/tools/decision-board/**
- A entrada principal redireciona por um `index.html` com URL **relativa** (funciona também em domínio personalizado e forks, respeitado o caminho de projeto). Só compartilhe o endereço após verificar a implantação no GitHub.

## O que você faz uma única vez
1. Acesse [Settings → Pages](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/settings/pages) (precisa permissão de administração).
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Revise e **mescle a [PR #8](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/8)** na `main`. Essa PR tem o painel, os JSONs, os testes e o workflow; a `main` ainda não tem o painel.
4. Abra [Actions → Publish Decision Lab (GitHub Pages)](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/actions/workflows/publish-decision-lab-pages.yml). O push em `main` deve iniciar automaticamente; alternativamente clique em **Run workflow** e selecione `main`.
5. Verifique que os jobs **Validate and package** e **Publish Decision Lab** ficaram verdes. O link público deverá aparecer no job de deploy e em Settings → Pages.
6. Abra o endereço em um celular e no desktop. Teste filtros, comparação, evidências, exportação e que dados carregam (sem erro ou tela vazia). **Só depois envie ao grupo.**

**Caso a página dê 404/404 de JSON:** confirmar se o workflow foi executado na `main` e se Source está em **GitHub Actions**. O caminho correto é o endereço com o nome do repositório. Não escolher a opção de publicação por pasta `/docs` da branch.

**Caso o job de deploy falhe:** examinar logs da execução. Se necessário, configurar o environment `github-pages` com a regra de implantação apenas pela `main` em Settings → Environments. Não habilitar segredos nem tokens de serviço.

## O que foi criado
- [`.github/workflows/publish-decision-lab-pages.yml`](../../.github/workflows/publish-decision-lab-pages.yml): valida PRs e publica ao receber push em `main` (ou execução manual nela). Utiliza `checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`.
- [`scripts/build-decision-pages.mjs`](../../scripts/build-decision-pages.mjs): cria uma pasta temporária `.pages-site/` com **somente** `tools/decision-board`, `data/decision`, `docs`, `.nojekyll` e `index.html` de redirecionamento. As rotas existentes `../../data/decision/` e `../../docs/` continuam funcionando.
- [`tools/decision-board/model.test.mjs`](../../tools/decision-board/model.test.mjs): testes determinísticos para pontuação, filtros, estrutura e exportação.
- [`tools/decision-board/README.md`](../../tools/decision-board/README.md): comando local e prompt único para atualização por IA.
- `.gitignore`: ignora saída temporária `.pages-site/`.

## Atualização automática, sem manutenção engessada
**Uma chamada de IA** pode atualizar o arquivo de evidências e/ou avaliações e abrir uma PR. Quando a equipe revisar e fizer merge na `main`, o workflow valida e publica automaticamente. A interface é estática; **não precisa de Render/Supabase/Vercel para o painel**.

Os gatilhos do workflow observam `tools/decision-board/**`, `data/decision/**`, `docs/**`, o script de build e o próprio workflow. Cada nova versão publicada não exige ações manuais adicionais.

O painel suporta ajustar notas **localmente** e exportar arquivo, mas as edições de um colega **não aparecem no navegador de outro**. Para consolidar a decisão, postar o Markdown na [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2).

## Limites de segurança
- Páginas GitHub Pages são públicas por padrão: não publicar dados pessoais, tokens, arquivos de áudio dos palestrantes ou credenciais.
- Somente o painel e a pesquisa pública são empacotados. Nenhum servidor municipal é acessado; não há pagamentos ou login.
- O **produto real escolhido no hackathon** deve ficar independente, com frontend futuro em **Vercel**, backend em **Render** (se necessário) e autenticação/banco em **Supabase**, somente quando sua arquitetura e as regras de negócio justificarem.
- O GitHub Pages aqui **não** hospeda backend, cron jobs de aplicativo nem dados privados. Nada dessas plataformas foi provisionado nesta PR.

## Teste local do artefato que vai ao Pages

Na raiz do repositório:
```bash
node --test tools/decision-board/model.test.mjs
node scripts/build-decision-pages.mjs
python3 -m http.server 4173 --directory .pages-site
```

Abrir **http://localhost:4173/** e confirmar o redirecionamento para `/tools/decision-board/`. Apagar `.pages-site/` quando quiser; é descartável e ignorada pelo Git.
