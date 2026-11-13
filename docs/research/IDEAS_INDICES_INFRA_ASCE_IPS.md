# Ideação — do diagnóstico à ação (INFRA-BR, ASCE e IPS)

**Atualizado:** 13/11/2026. **As seis ideias são novas HIPÓTESES**, não uma alteração do backlog, seleção do MVP ou patrocínio do Confea.

## 6 conceitos (não modelos matemáticos oficiais)

| ID | Ideia | Vinculação aos 15 desafios | Demo de 2 minutos com dados SINTÉTICOS | Risco de mercado |
|---|---|---|---|---|
| **D1 Dados que Viram Decisão** | Ficha de indicador confiável que sugere pergunta/ação e mostra responsáveis | 01.1 integração / 01.3 monitoramento | Importar 2 indicadores de formatos distintos → detectar período e unidade incompatíveis → escolher ação de coleta/correção | Já há BI e planilhas públicas; diferencial precisa ser *workflow*, não gráfico |
| **D2 InfraCheck Londrina** | Mini-report-card de manutenção, inspirado **nos critérios ASCE**, sem copiar a nota da instituição | 04.1 central de monitoramento / 03.3 infraestrutura verde | Inspecionar 3 ativos fictícios → pontuar capacidade, condição, manutenção, risco com pesos explicados → priorizar ordem de vistoria | Risco de laudo técnico falso; requer profissional para validar critérios |
| **D3 Ciclo Circular** | Painel operacional de rejeitos e recuperação de resíduos, usando indicadores INFRA-BR como referência | 03.2 gestão integrada de resíduos | Cooperativa fictícia registra lote → taxa calculada → maior motivo de rejeito → campanha/inspeção | Necessidade de dado por cooperativa, autorização e rotina de coleta real |
| **D4 Impacto Visível** | Unir indicadores de execução/infraestrutura e resultados socioambientais, distinguindo medição de hipótese | 01.3 indicadores / 04.2 financiamento | Projeto fictício recebe entrega e mostra indicador de resultado/limite + pendência de evidência | Correlação pode ser confundida com causalidade ou impacto de projeto |
| **D5 Acesso Justo** | Mapa de oportunidade para serviços/conectividade, com dados municipais adequados | 05.1 internet pública / 05.2 educação | Compara 3 regiões fictícias, mostra qualidade do dado, carências e decisão humana de investigação | IPS municipal não dá mapa por bairro; precisa de dado local ou simulação claramente indicada |
| **D6 Resiliência em Campo** | Inspeção e acompanhamento de drenagem e infraestrutura verde, com checklist preventivo | 03.1 clima / 03.3 hídrica | Três pontos fictícios → risco/situação → ordem de vistoria e histórico | Sem inventário técnico, não oferecer alerta climático ou risco real |

## Ranqueamento para CONVERSAR (opinião, não score oficial)
**Método subjetivo:** aderência 30%, evidência operacional pública 25%, demo em 2 min 20%, execução no fim de semana 15%, hipótese de adoção 10%.

| Posição inicial | Conceito | Nota / 5 | Principal pergunta para validar |
|---:|---|---:|---|
| 1 | **D3 Ciclo Circular** | **4,8** | CMTU/cooperativas registram rejeitos por lote hoje? |
| 2 | **D1 Dados que Viram Decisão** | **4,5** | Qual integração de dados realmente falta na Prefeitura? |
| 3 | **D2 InfraCheck Londrina** | **4,1** | CEAL/CREA/CTD validariam um checklist de vistoria sem laudo automático? |
| 4 | D6 Resiliência em Campo | 4,0 | Qual inventário e responsável pela drenagem já existem? |
| 5 | D4 Impacto Visível | 3,8 | Há indicadores de resultado e baseline no mesmo território? |
| 6 | D5 Acesso Justo | 3,6 | Existem dados de acesso com recorte menor que o município? |

**Estas notas representam julgamento preliminar, não medição.** A primeira entrevista com o órgão pode reordenar as seis.

## Recomendação: não construir outro índice
**Melhor ângulo para hackathon:** a ferramenta recebe um diagnóstico/fonte existente e ajuda alguém a decidir e comprovar a próxima ação.

### P0 sugerido para qualquer ideia
1. entrada de 3–10 registros fictícios rotulados;
2. cálculo determinístico + fonte/limite do indicador;
3. situação/anomalia priorizada com regra explícita;
4. responsável + ação + evidência do resultado em tela;
5. exportação de relatório curto para pitch.

### Antídoto para dashboard genérico
Em vez de "paraná tirou 49,30 em mobilidade, construímos mapa", dizer: "um inspetor encontra um registro defasado, decide visitar um ponto, registra evidência e melhora qualidade do dado". Não usar nota estadual como diagnóstico de bairro.

## Testes rápidos para a frente comercial (Miguel)
- Quem **insere** os dados e como é feito hoje?
- Quem **recebe** a recomendação e quem tem autoridade para decidir?
- Quem **paga** por menor retrabalho ou confiabilidade? Que sistema já compra/usa?
- Qual é uma redução verificável de esforço em demonstração, sem afirmar impacto público real?
- A instituição poderia testar como **complemento** sem substituição integral de ERP/portal?

Referências: [guia comparativo dos índices](INFRA_BR_ASCE_IPS_2026.md), [desafios presenciais](CHALLENGES_OFFICIAL_2026.md) (na PR #8 quando elaborado), [CMTU/reciclagem](https://cmtu.londrina.pr.gov.br/index.php/ult-noticias/2337-coleta-seletiva-trata-800-toneladas-de-reciclaveis-por-mes-em-londrina.html).
