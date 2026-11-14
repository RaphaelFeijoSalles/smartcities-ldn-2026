# Plano de decisão e trabalho AI-First — SEM decidir por antecipação

## Restrições conhecidas
- **13–15/11/2026:** janela do hackathon. O site divulga **3min pitch + 2min demo**. Confirmar horários/retificações diretamente com a organização.
- Regra P0: **um problema → um usuário → um caso feliz completo → um critério de teste**.
- **Nenhum gasto, merge, deploy público ou integração externa real** sem autorização. Nada de dados pessoais de CML/COHAB, crianças, saúde, trabalhadores, telemetria municipal ou pagamento.
- **Leitura integral do regulamento de IA/código anterior e direitos de autoria ainda pendente**: a PR não substitui isso.

## O que precisa ser respondido HOJE (poucas perguntas, de alto impacto)
1. **Qual processo REAL foi descrito por um operador e qual sistema já existe?** Se não houver operador, trata-se de hipótese, não de necessidade validada.
2. **Que pessoa conseguimos ouvir agora?** Miguel conduz a entrevista comercial e registra função, data, ressalvas, barreiras de adoção, sem dados pessoais desnecessários.
3. **Que fonte de dados é legalmente utilizável?** Preferir fixture sintética/3 documentos com licença.
4. **Qual ação muda em dois minutos?** A demo deve mostrar antes/depois e a revisão humana.
5. **Qual fronteira de escopo?** Backend, banco, login, IA multimodal, pagamentos, sensores e hardware ficam fora, salvo necessidade demonstrada.
6. **Quem faz o quê?** Raphael: contrato/integração; Miguel: validação/mercado/pitch; demais: UI, lógica isolada e QA; nomes reais definidos na Issue.

## Gates de eliminação antes de ranquear na próxima etapa
- **G0 — Legalidade/segurança:** dependência de dados restritos, violação de direitos, falsas decisões jurídicas ou médicas → descartar versão perigosa; criar versão sintética/assistida ou eliminar.
- **G1 — Domínio:** problema não cabe num desafio anunciado ou edital proíbe reaproveitamento → não escolher até confirmar.
- **G2 — Evidência de dor:** ninguém confirma usuário/sistema/etapa problemática → manter só como hipótese, entrevistar; não marcar PASS.
- **G3 — Demo:** não tem fluxo de ponta a ponta realizável até a banca → reduzir ou eliminar.
- **G4 — Diferenciação:** apenas clone de Londrina ON/SIGLON/portal legislativo/Tourizzy → redefinir valor antes de construir.

## Rubrica recomendada para comparação VISUAL seguinte (não foi aplicada ainda)
Dê a **cada produto-candidato**, não ao nome genérico do desafio, notas de 1–5 nos critérios:
- **Evidência de dor e chance de validar com operador — 25%**.
- **Alinhamento ao desafio oficial e utilidade pública — 20%**.
- **Capacidade de entregar P0 funcionando no prazo — 20%**.
- **Clareza/demonstração em 2 minutos — 15%**.
- **Diferenciação verificável vs software existente — 10%**.
- **Potencial comercial/de continuidade sem promessas — 10%**.

A nota **é julgamento da equipe**, não resultado da banca nem probabilidade estatística de ganhar. **Não preenchê-la automaticamente a partir dos rankings anteriores**, que foram feitos antes dos áudios. Marcar campo desconhecido como `UNKNOWN`, não atribuir zero silenciosamente. Exibir incerteza/gates do lado das notas.

## Plano de 20 minutos quando todos estiverem juntos
- **0–4 min:** cada pessoa lê [matriz de setores](02_DESAFIOS_E_SETORES.md) e escolhe duas dores.
- **4–9 min:** checar com mentor **problema, ferramenta atual, dado permitido e quem decide**.
- **9–13 min:** estimar **um P0 de 2 minutos** para até 4 ideias.
- **13–17 min:** avaliar G0–G4 e rubrica visual; guardar uma alternativa.
- **17–20 min:** atribuir **3 Issues**: (1) contrato/dado + lógica; (2) UI/fluxo; (3) validação, demo e pitch. Não editar hot files simultaneamente.

## Divisão operacional AI-First
- **Arquitetura/integração (Raphael):** schema e paths, CI, revisão, integração da demo e proteção da main.
- **Produto/comercial (Miguel):** problema/entrevistas, usuário e comprador, concorrente, valor do piloto, pitch. Sem inventar economia ou apoio institucional.
- **Frontend/experiência (owner a definir):** única jornada navegável com dados sintéticos rotulados.
- **Dados/lógica (owner a definir):** import/export e validação determinística; IA somente se acrescentar valor e houver teste/fallback.
- **Testes/demo (owner a definir):** smoke de 2 minutos, falhas, legenda/acessibilidade, funcionamento offline.
- Git: **1 Issue → 1 branch → 1 PR pequena**. Cada IA lê `AGENTS.md`; não push direto em main, não force push, não merge sem autorização, não chamar NOT RUN de PASS.

## Saída obrigatória da reunião
```text
ID do desafio:
Problema em uma frase:
Quem sofre e operador/decisor:
Declaração/fonte com data:
Sistema atual e o que falta:
P0 em 2 minutos: entrada -> transformação -> saída:
Dados (SINTÉTICOS ou autorizados):
Maior risco e plano B:
Miguel: hipótese comercial + 1 entrevista:
Raphael: contrato / stack mínima:
3 owners + Issues:
Ideia reserva e motivo:
```

## Próxima etapa — comparar visualmente
Usar `data/decision/smartcities-decision-v1.json` como única entrada da **LP comparadora**: filtros por setor/desafio, evidência dos áudios, scorecard editável, gates e link de fontes. **LP não escolhe sozinha.** Nenhum valor salvo no navegador equivale a comentário ou decisão no GitHub; exportar Markdown/JSON para Issue #2.
