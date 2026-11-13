# Comece aqui — para quem nunca usou Git direito (5 minutos)

**Não precisa dominar terminal.** Para hoje, cada pessoa precisa abrir o projeto, ler sua tarefa e conseguir abrir uma PR.

## Pré-requisitos
- Conta GitHub com acesso ao repositório.
- [GitHub Desktop](https://desktop.github.com/) **ou** Git + GitHub CLI (`gh`) configurados.
- Editor (VS Code, por exemplo).
- IA de programação **opcional, mas recomendada**: Codex CLI, Claude Code ou agente disponível na sua máquina. Não há ferramenta única obrigatória; autenticação/custo da ferramenta são individuais, sem compartilhamento de tokens.

## Se você usa GitHub Desktop
1. Abra o repositório no navegador e escolha **Code → Open with GitHub Desktop**. Clone para uma pasta nova.
2. Abra `README.md`, `AGENTS.md` e `docs/team/CONTINUITY.md`.
3. Peça uma Issue ao responsável técnico. **Não comece no `main`**.
4. No Desktop: **Current Branch → New Branch**, nome `feat/HACK-<issue>-assunto` e base `main` atualizada.
5. Abra a pasta no VS Code. Faça sua parte (com ou sem IA) e confirme quais arquivos foram modificados.
6. Desktop: escreva um resumo, **Commit to <branch>** e **Publish branch**.
7. Clique **Create Pull Request** e preencha o template. Avise a equipe com o link.

## Para quem usa terminal
```bash
git clone https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026.git
cd smartcities-ldn-2026
git switch main
git pull --ff-only
git switch -c feat/HACK-123-descricao
# depois de concluir a Issue, com testes/evidência:
git status
git diff --check
git add <arquivos-da-sua-tarefa>
git commit -m "feat: resumo objetivo"
git push -u origin HEAD
# abra uma PR pelo link que o GitHub mostrar; ou pelo site
```

`<arquivos-da-sua-tarefa>` é uma indicação, não comando literal: substitua pelos caminhos autorizados. Evite `git add .` sem revisar as alterações.

## Primeira tarefa da IA (copie e cole)
```text
Estou num hackathon com equipe de níveis diferentes de Git.
Leia README.md, AGENTS.md, docs/team/CONTINUITY.md e docs/team/WORKFLOW.md.
Antes de alterar qualquer arquivo, explique qual é minha Issue, branch atual,
quais caminhos posso modificar e como validar. Se não houver Issue,
não codifique: diga o próximo passo em no máximo 5 linhas.
Nunca faça merge, deploy ou push direto para main.
```

**Se algo der errado:** não tente resolver com force push ou apagar arquivos. Mande ao integrador: print/erro, `git status`, branch e link da Issue.
