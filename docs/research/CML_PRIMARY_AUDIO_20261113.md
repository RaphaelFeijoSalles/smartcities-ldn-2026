# Evidência primária — fala de representante da Câmara sobre acervo normativo

**Data:** 13/11/2026 — apresentação presencial Smart Cities 2026.
**Origem:** áudio encaminhado pela equipe no ChatGPT, identificado como `13-11-2026 21.14.m4a` (aprox. 5min54s); transcrição/trechos disponíveis na conversa. **O áudio não está versionado aqui** para evitar publicar a voz do palestrante sem autorização. Não inferir nome, cargo específico ou autorização para uso comercial.
**Status:** relato direto do stakeholder/palestrante; números e afirmações técnicas exigem confirmação documental antes de serem apresentados como dados oficiais.

## Resumo estruturado — problema em primeira mão

### Acervo heterogêneo por época
O palestrante explicou a mudança histórica dos suportes:
1. Normas antigas em **livros físicos e papel**; escritos manuscritos/datiloscritos em alguns períodos.
2. Documentação preservada em **microfilmes**.
3. Arquivos **PDF**, incluindo digitalizações.
4. Normas recentes digitadas e, desde aproximadamente **2007** (segundo lembrança do palestrante), em formato mais padronizado, incluindo **HTML**.

**Dimensão citada pelo palestrante:** cerca de **14.300 leis** e, contando decretos/outros instrumentos, aproximadamente **16 mil dispositivos normativos**. **Números do relato, não censo verificado**.

### Bloqueio identificado
A Câmara iniciou em **2024**, com parceria mencionada com o **Senai**, protótipo de IA que permitiria perguntar em linguagem natural sobre normas de Londrina. Segundo o palestrante, **não progrediu a produto funcional porque o acervo não estava estruturado de maneira suficiente**, apesar da evolução dos LLMs.

**Conclusão central da palestra:** o gargalo **não é construir um chatbot**, mas criar uma **base normativa confiável, unificada e rastreável**.

## Três entregáveis sugeridos pelo palestrante (dependentes)
1. **Estruturar e integrar o acervo.** Normalizar fontes heterogêneas em modelo unificado consultável, com metadados, versão, fonte, OCR de PDFs imagéticos e trilha de qualidade.
2. **Busca e consulta em linguagem natural.** Responder dúvidas de servidores, vereadores e cidadãos, sempre com origem e escopo claros, sem substituir parecer jurídico.
3. **Detecção de possíveis conflitos normativos.** Identificar relações, alterações e suspeitas de sobreposição entre normas, **encaminhando para revisão humana**; jamais declarar conflito jurídico definitivo automaticamente.

O palestrante citou o **padrão LexML** (XML) como referência para normas estruturadas. Fonte pública independente: [projeto LexML — documentação de vocabulários controlados](https://projeto.lexml.gov.br/documentacao/Parte-6-Vocabularios-Controlados.pdf/at_download/file).

## Escopo recomendável para um MVP de 2 minutos
**Prova de conceito do produto 1 como base e uma função visual mínima dos produtos 2/3.**

1. Selecionar **três documentos de demonstração** com origem e permissões claras: um texto HTML público, um PDF digital e um PDF de imagem **sintético ou autorizado**; não expor scans protegidos.
2. Extrair texto e metadados, identificar tipo/órgão/número/ano e origem; registrar **OCR manual ou ferramenta local somente quando necessário**.
3. Transformar para um **modelo estruturado inspirado em LexML**, sem afirmar conformidade integral com o padrão se não houver validação por esquema oficial.
4. Buscar expressão e recuperar trecho exato com documento, versão/fonte e grau de confiança.
5. Exibir relações por artigo, alteração ou remissão explicitamente presentes no texto; mostrar um **alerta de possível relação** que peça análise humana.

**Demo:** “3 formatos → 1 base consultável → 1 pergunta com citação → 1 relação de normas sinalizada”. Evitar RAG opaco ou classificação jurídica automática.

### Contrato inicial (exemplo de fixture sintética, não norma real)
```json
{
  "sourceId": "demo-ato-001",
  "sourceType": "pdf_scan_synthetic",
  "sourceUrl": null,
  "licenseStatus": "DEMO_SYNTHETIC",
  "municipality": "Londrina",
  "authority": "CML_EXAMPLE",
  "actType": "lei_exemplo",
  "number": "001",
  "year": 1990,
  "version": "SOURCE_UNVERIFIED",
  "extractionMethod": "manual_fixture",
  "textQuality": "REVIEW_REQUIRED",
  "articles": [
    { "articleId": "art-1", "text": "Texto inteiramente fictício para demonstrar transformação." }
  ],
  "relations": [],
  "validationStatus": "DEMO_ONLY"
}
```

## Workflow técnico AI-First após decisão da equipe
- **Worker A — ingestão:** adapter por formato / extração; trabalhar em caminhos isolados.
- **Worker B — normalização:** esquema, metadados, vínculos e validações determinísticas.
- **Worker C — experiência:** tela antes/depois, busca e fontes.
- **Worker D — QA:** conjunto de fixtures, testes da extração, referências e casos de falha.
- **Miguel — produto/pitch:** contato com CML/mentor, autorização de fontes, problema/alternativa, proposta de adoção.
- **Raphael — integração:** esquema compartilhado, ownership, revisão e montagem do fluxo.

**Sequência:** fazer 3 documentos funcionarem localmente → validar com usuário → expandir somente depois. Não prometer digitalizar 16 mil normas em um fim de semana.

## Concorrência e checagem de duplicação
A própria Prefeitura direciona a consultas de legislação **consolidada/compilada/versionada** e fontes da Câmara e do Jornal Oficial. Fonte: https://portal.londrina.pr.gov.br/index.php/legislacao. Portanto, a equipe deve perguntar:
- Qual parte do acervo **ainda não** está acessível ou suficientemente estruturada nesses portais?
- Câmara quer **integração interna**, disponibilização pública ou os dois?
- Há licença e acesso à ferramenta/protótipo iniciado em 2024?
- Que metadados são obrigatórios e qual autoridade valida vigência de norma?
- Qual conjunto pequeno, de fontes autorizadas, podemos usar no hackathon?

## Perguntas de alta prioridade à Câmara
1. Há uma **amostra de três documentos** em formatos diferentes autorizada para uso e apresentação?
2. Qual sistema/fornecedor mantém o acervo hoje e qual formato de exportação é possível?
3. O problema de pesquisa é histórico, de vinculação, vigência, acesso interno ou ausência de fonte?
4. Existe taxonomia/URN/identificador e esquema LexML já adotados?
5. Que comportamento o usuário consideraria prova de sucesso em dois minutos?
6. Qual pessoa validaria um resultado de extração e relações (sem concluir conflito legal)?

## Impacto na escolha
**Desafio presencial:** 02.1 Estruturação do acervo normativo da CML, com extensões 02.2 e 02.3. **A prioridade de validação aumenta**, porque agora temos relato de stakeholder, causa-raiz, tentativa passada e produto esperado. **Ainda não existe decisão de produto, autorização de dados nem avaliação de usuário do nosso protótipo.**

### Estado das evidências
- `PRIMARY_EVENT_AUDIO`: relato contextual acima, fornecido pelo usuário, sem arquivo no GitHub.
- `EXTERNAL_VERIFIED`: existência do padrão LexML e portais de consulta de normas.
- `HYPOTHESIS`: arquitetura e versão reduzida sugeridas para o hackathon.
- `UNCONFIRMED`: contagem exata de leis, formatos por período, projeto de 2024, parceiro, sistema interno, licença.
