# Candidata — LexBase: estruturação e revisão de legislação histórica da CML

**Data:** 14/11/2026 · **Status:** PROPOSTA NÃO ESCOLHIDA, sem MVP implementado.  
**Desafio presencial:** **02.1 — Estruturação do acervo normativo da Câmara Municipal de Londrina**. Extensões possíveis: 02.2 (consulta humanizada) e 02.3 (possíveis conflitos jurídicos).  
**Origem e autoria da proposta:** hipótese elaborada a partir do segundo depoimento presencial e da pesquisa do Smart Cities; não atribuir endosso ou contratação à CML.  
**Precedente documental:** [PR #11 — depoimento e causa-raiz](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/11). Esta ficha de **produto** complementa aquele relatório de **evidência**, sem duplicá-lo.

## Tese de produto em uma frase
**Um motor de conversão e revisão auditável que transforma leis em formatos históricos diferentes em registros estruturados e pesquisáveis, preservando texto original, versões e vínculos entre normas, para que outras soluções de IA não comecem por um acervo impreciso.**

## Problema e prova — separar fato de hipótese
- **PRIMARY_EVENT_AUDIO (relato do palestrante):** aproximadamente **14.300 leis** e cerca de **16 mil atos/dispositivos**, sob formatos diversos (papel, microfilme, PDF e HTML); tentativa de chat jurídico com IA iniciada em 2024 não avançou por falta de estruturação adequada. Números e detalhes contratuais são **declaração oral, não auditoria**.
- **OFFICIAL_PUBLIC_SOURCE:** [Prefeitura direciona a consultas de legislação consolidada, compilada e versionada](https://portal.londrina.pr.gov.br/index.php/legislacao). A solução **não** deve reproduzir funções já atendidas por portais.
- **TECHNICAL_REFERENCE:** [Projeto LexML](https://projeto.lexml.gov.br/) e documentação XML para identificação e estruturação normativa. **Compatibilidade real com LexML** é futuro a testar contra esquemas oficiais, não alegação atual.
- **HYPOTHESIS:** padronização com revisão de trechos, qualidade de extração e rastreabilidade pode atender a lacuna real que impediu a POC anterior.
- **UNCONFIRMED:** quais normas e mídias estão fora do sistema atual; acesso a arquivos físicos/escaneados; integração com sistema legado; comprador, orçamento ou aceitação.

**Posição anterior na LP:** **C03 LexBase, 4,70/5 (1º entre 15 candidatos, avaliação subjetiva)**. Não confundir ranking interno com avaliação oficial da banca ou pedido de contratação.

## Funcionalidades — definir o que cabe no hackathon
| Prioridade | Função | Aceitação objetiva |
|---|---|---|
| **P0** | Ingestão controlada de três documentos (HTML/texto, PDF textual, PDF imagem de demonstração autorizada/sintética) | Cada arquivo tem ID, origem, licença/status e método de extração |
| **P0** | Extração e normalização para esquema interno | Número, ano, tipo de ato, origem, artigos e texto fiel, com campos “pendente de revisão” |
| **P0** | Revisão humana lado a lado | Documento original → texto extraído; alterar/confirmar campos; rejeitar erro; não sobrescrever a fonte |
| **P0** | Busca textual e rastreabilidade | Resultado abre documento, trecho exato, versão, fonte e status de verificação |
| **P1** | Vínculos normativos explícitos | Referências do tipo “altera a Lei X” viram sugestão de relação; sem declarar vigência/revogação automaticamente |
| **P2** | Perguntas por IA com citações | Usar somente corpus aprovado e responder “não sei” quando faltar evidência |
| **P3** | Exportar LexML compatível e operar acervo em escala | Requer validar especificação, repositório, jurídico, infraestrutura e licenças |

**Não** prometer digitalizar 16 mil normas em 48 horas. **Não** fazer parecer jurídico ou afirmar que texto extraído é versão oficialmente consolidada.

## Demo demonstrável em 2 minutos
1. **0–20 s:** “Este conteúdo existe em formatos diferentes e uma pergunta por IA falha se a base não for confiável.”
2. **20–50 s:** carregar três arquivos de **demonstração**, cada um com fonte explícita; escolher um PDF textual e comparar o texto original com o parse.
3. **50–85 s:** detectar artigo/cabeçalho e um campo pendente; o usuário confirma um trecho na tela lado a lado.
4. **85–110 s:** buscar uma palavra e abrir o artigo com link ao documento e selo “revisado” ou “somente demo”.
5. **110–120 s:** mostrar uma relação explícita entre normas e o limite: **análise jurídica depende de profissional**.

**Plano de fallback:** três fixtures com texto já extraído e uma simulação honesta de importação para não depender de OCR pesado ou API externa. Marcar “extração previamente preparada / demo”, nunca dizer “extração automática ao vivo” quando não tiver sido executada.

## Contrato mínimo de dados — exemplo totalmente fictício
```json
{
  "id": "DEMO-LEI-001",
  "source_url": null,
  "source_license": "SYNTHETIC",
  "original_format": "pdf_image_synthetic",
  "act": {"type": "lei", "number": "001", "year": 1990, "authority": "CML_EXAMPLE"},
  "extraction": {"method": "pre_extracted_demo", "status": "REVIEW_REQUIRED"},
  "articles": [{"id": "art-1", "text": "Texto fictício para demonstrar extração fiel.", "verified": false}],
  "relations": [],
  "version_status": "UNVERIFIED",
  "updated_at": "2026-11-14T09:00:00-03:00"
}
```
**Regras:** IDs determinísticos, texto original imutável, mudanças auditadas em campo próprio; `verified` somente após aprovação real. `confidence` não substitui validação humana.

## Arquitetura AI-First pequena, evolutiva
- **P0:** React/TypeScript responsivo; módulos `import`, `normalize`, `review`, `search`; fixtures versionadas em JSON; testes determinísticos com 3 normas e uma consulta. Backend/conta não são pré-requisitos.
- **P1:** API de importação em Java/Spring Boot ou FastAPI (não fixar sem necessidade), tarefas assíncronas de OCR e logs.
- **P2:** Supabase/Postgres para documentos/metadados/revisões, índice de busca; frontend Vercel, API Render quando fizer sentido.
- **P3:** conectores de acervo e padrões normativos, permissões e fluxo jurídico formal.

**Separar fonte de IA:** IA sugere campos ou vínculos; validação determinística e funcionário aprovam antes de publicar. A UI e o pipeline devem continuar funcionais sem modelo externo.

## Divisão recomendada para o fim de semana
- **Raphael — arquitetura e integração:** esquema de documento, contrato JSON, PRs pequenas e CI.
- **Pessoa A — extração/normalização:** duas entradas de formatos distintos e testes.
- **Pessoa B — UI/UX:** revisão lado a lado + busca responsiva.
- **Pessoa C — QA/demo:** caso falso/ausente, evidências, fluxo offline de 2 minutos.
- **Miguel — comercial/validação:** pergunta ao representante da Câmara, alternativa atual, hipótese de adoção e pitch. Não inventar entrevista ou venda.

**Fluxo Git:** 1 Issue → 1 branch → 1 PR revisada; definir os contratos antes de trabalho paralelo. Sem merge, deploy, gasto ou código no estágio de pesquisa.

## Riscos e gates
| Gate | Estado | Como destravar |
|---|---|---|
| Cliente/necessidade em relato | **EVIDÊNCIA DE EVENTO, não validação de usuário do MVP** | Confirmar com operador o documento e a tarefa que realmente falha |
| Licença, origem e uso de documentos | **UNKNOWN** | Receber três exemplos autorizados ou usar amostras sintéticas |
| Diferença frente a portal existente | **UNKNOWN** | Demonstrar melhoria comprovável no fluxo de extração/revisão |
| OCR pesado e microfilme | **FORA DO P0** | Usar PDF imagem preparado e registrar o método real de obtenção |
| Interpretação legal e vigência | **GATE HUMANO** | Nunca declarar conflito/revogação sem especialista |
| Regra do hackathon para IA/código prévio | **UNKNOWN** | Confirmar com organizador e registrar na Issue #1 |

## Fonte pública atual útil para demonstrar ingestão
[Jornal Oficial de Londrina nº 5917, de 13/11/2026, página 1](https://portal.londrina.pr.gov.br/images/stories/jornalOficial/Jornal-5917-Assinado.pdf), contém a **Lei nº 14.293/2026** sobre monitoramento do descarte irregular de resíduos. Pode servir como **exemplo de documento público**, desde que a equipe confira uso e origem. O documento também cria uma conexão contextual com a proposta **EcoVisão**, mas as duas ideias continuam concorrentes independentes.

## Pergunta decisiva à Câmara
> “Se entregarmos três formatos normativos transformados em uma base pesquisável com conferência visual, isso resolveria o bloqueio da prova de conceito anterior? Que documentos e critérios de qualidade poderíamos usar de forma autorizada?”

### Referências do projeto
[Issue #2 — brainstorm](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2) · [Pesquisa primária LexBase PR #11](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/11) · [Padrão LexML](https://projeto.lexml.gov.br/).

**Decisão:** NÃO ESCOLHIDA. Esta ficha existe para comparar execução/mercado com as demais candidatas, como na [PR #15 — HidroRastro](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/pull/15).
