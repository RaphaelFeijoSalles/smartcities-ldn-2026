# AGENTS.md — contrato comum de IA e colaboração

**Válido para Codex, Claude Code e qualquer agente que edite este repositório.** Estado: discovery. Nenhuma ideia/stack foi aprovada ainda.

## Leitura obrigatória
1. `README.md`
2. `docs/team/CONTINUITY.md`
3. `docs/team/WORKFLOW.md`
4. Issue atribuída e os documentos específicos (produto, engenharia ou negócios).
5. `docs/product/BRAINSTORM.md` enquanto a ideia estiver em aberto.

## Como operar
- Antes de editar: identificar problema, responsável, branch, paths autorizados, critério de aceite e como verificar.
- Uma tarefa por branch; criar a partir de `main` atualizada. Nunca editar `main` diretamente.
- Só alterar arquivos no ownership combinado. Contratos de API, roteamento central, dependências, lockfiles, CI e arquitetura são **hot files**: pedir alinhamento ao integrador.
- Preferir uma entrega pequena, testável e utilizável a planejamento ou infraestrutura sem código.
- Nunca sobrescrever trabalho alheio ou usar `git reset --hard`, `git push --force`, `git clean -fd` como atalho.
- Ler antes de escrever; revisar `git diff` antes de commit; testes reais com comando/resultado explícitos.
- Nada de secrets, dados pessoais de terceiros, chaves, credenciais ou integrações reais sem permissão.
- Dados de demonstração precisam estar rotulados **SINTÉTICOS**; números públicos devem trazer fonte e data.
- Pesquisa de mercado, leis, dados da Prefeitura e regras do hackathon: citar fonte, data e grau de confirmação; não inventar números.
- Não realizar merge, deploy público, publicação comercial, compra ou gastos sem autorização do integrador.
- Se bloqueado: registrar `BLOCKED` + causa. Nunca converter ausência de teste em `PASS`.
- **Documentação = intenção; código/teste = evidência de funcionamento.**

## Checklist obrigatório da PR
Problema; Issue; arquivos alterados; testes executados (comando e resultado); screenshots/demo se visual; hipóteses; limitações; riscos; mudanças fora de escopo evitadas.

## Modo de emergência
Se estiver perto do pitch, **corrija apenas o fluxo de demonstração** e evite reformas de arquitetura. Se a integração falhar, mantenha um fallback local com dados sintéticos e ensaie-o.

## Status e responsabilidades
Até a decisão do brainstorm, **não implemente PulsoGov como escolha definitiva**, nem gere backend/login/banco por inércia. Use o comando/prompt de `docs/team/AI_PROMPTS.md` e a Issue atual.
