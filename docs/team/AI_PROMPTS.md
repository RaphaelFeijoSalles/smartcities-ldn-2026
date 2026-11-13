# Prompts prontos, sem criar cinco fluxos diferentes

## Prompts para desenvolvimento
```text
Leia README.md, AGENTS.md, docs/team/CONTINUITY.md e a Issue <NÚMERO>.
Informe branch atual, ownership e critérios de aceite antes de mudar código.
Implemente a menor solução que passe na definição de pronto.
Não altere hot files sem combinação. Rode testes reais, revise diff,
registre o que não conseguiu verificar e prepare o texto da PR.
Não faça merge/deploy/gastos/push direto na main.
```

## Prompt para revisão por outra IA
```text
Revise a PR <LINK> conforme AGENTS.md e a Issue original.
Procure quebra do fluxo demonstrável, alterações fora de escopo,
inconsistência entre contrato e telas, segurança, bugs, testes ausentes,
segredos e dados fictícios apresentados como reais. Relate PASS/FAIL/UNKNOWN
com evidências e ações pequenas. Não modifique arquivos nem faça merge.
```

## Prompt para Miguel (produto/mercado)
```text
Leia README.md, docs/research/SOURCES.md e docs/business/VALIDATION.md.
Para cada afirmação factual, indique fonte e data. Separe evidência,
hipótese e decisão. Entregue: problema em uma frase, usuário, comprador,
alternativa atual, diferencial, custo/benefício hipotético, cinco perguntas
de validação e narrativa da demo. Não invente entrevistas, economias ou
apoios de órgãos públicos. Não transforme hipótese em compromisso de produto.
```

## Prompt para estruturar ideia após brainstorm
```text
Leia todos os documentos relevantes. Converta as decisões confirmadas
em dossiê de produto, P0/P1/P2, jornada de demo em 90 segundos,
contrato de dados mínimo e cinco Issues independentes com ownership.
Declare dúvidas ainda abertas. Não implemente integrações desnecessárias.
```
