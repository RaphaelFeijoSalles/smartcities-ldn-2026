# Arquitetura — decisão incremental e reversível

**Status:** ainda NÃO aprovada. Não gerar aplicações automaticamente antes da escolha da ideia.

## Caminho default proposto, caso seja uma solução web com dados demonstrativos
```text
Navegador
  → React + TypeScript + Vite
  → serviços tipados (interfaces próprias)
  → fixtures JSON sintéticas e lógica determinística testável
  → UI de decisão / relatório / demo
```

**Por quê?** Poucas dependências, inicialização rápida, sem exigir segredo, banco ou servidor para mostrar um fluxo completo. Escolher Next.js ou API/Java Spring Boot apenas se houver necessidade verificável.

## Se (e só se) o desafio exigir backend
```text
apps/web → contrato HTTP mínimo → apps/api (Spring Boot ou outro stack aprovado)
                                      → storage simples, se necessário
```
- Publicar contratos JSON/exemplos antes de dividir tarefas.
- Fixtures compartilhadas devem seguir os mesmos tipos/contratos.
- API pode ser substituída por adapter de demo para não travar a apresentação.
- Nada de autenticação real ou dados pessoais sem necessidade e autorização.

## Divisão sem conflitos
- `apps/web/src/features/<feature>/`: owner da feature (após criação).
- `apps/web/src/components/`: componentes isolados; evitar tocar ao mesmo tempo no mesmo arquivo.
- `contracts/`: integrador é dono dos contratos compartilhados.
- `apps/api/`: backend isolado se autorizado.
- `docs/business/`: Miguel coordena.
- `docs/research/`: contribuição distribuída com fonte e data.

## Checkpoints
1. Primeira rota navegável / aplicação abre localmente.
2. Fluxo de demo de 90 segundos com fixtures.
3. Dados e lógica/algoritmos próprios testados.
4. Refinamento e ensaio com fallback offline.

## Política de IA no produto
IA pode auxiliar desenvolvimento e explicar resultados. Se houver decisões administrativas, classificações, riscos ou cálculos, a demo deve explicar regras/limites, permitir revisão humana e não atribuir precisão ou autoridade inexistentes à IA.
