# Origem Única — protótipo 100% mock para discussão

**Estado:** proposta candidata, **NÃO escolhida como produto**, sem backend, login, telemetria ou integração municipal. Todos os nomes, telefones, endereços, métricas e IDs dos estabelecimentos no app são **fictícios**.

## Abrir no computador
Na raiz do clone:

```bash
python3 -m http.server 4173
```

Abra **http://localhost:4173/tools/origem-unica/**. É possível também abrir o `index.html` diretamente, porque o app usa apenas arquivos estáticos locais.

Depois que esta PR for revisada e mesclada à `main`, a aplicação ficará no GitHub Pages (se ativado):  
**https://raphaelfeijosalles.github.io/smartcities-ldn-2026/tools/origem-unica/**  
O endereço é *previsto*, não uma afirmação de que já está publicado.

## O que a equipe consegue testar
1. **Visão geral:** números e gráfico com 6 registros inventados e 4 candidatos a revisão.
2. **Fontes:** SIGLON Saúde / ArcGIS REST e CNES / API nacional **como referências**, sem fazer chamadas.
3. **Conciliação:** busca, filtros, dados lado a lado, campos conflitantes, similaridade fictícia, revisão humana simulada e reabertura.
4. **Auditoria:** histórico da sessão com cada decisão; exportar CSV.
5. **Valor público:** cenário do paciente, servidor, comprador B2G, pitch, hipóteses de negócio e canvas resumido.
6. **Reiniciar demo:** volta aos 6 registros do exemplo.

O navegador guarda revisões em **localStorage** neste dispositivo, sem sincronizar ou enviar para serviço algum. Exportar CSV para compartilhar discussão; não usar o relatório para atualização de cadastro real.

## Perguntas para o brainstorm
- A dor real é **conciliar endereços**, **cadastros de UBS**, **informação de contato** ou **definir fonte responsável**?
- Se a correspondência entre dois registros for apenas provável, quem deve confirmar?
- A Prefeitura já tem ferramenta que faz esse trabalho? Se sim, o que ainda é manual?
- Quem é operador (CTD, SIGLON, secretaria de Saúde) e quem autorizaria um piloto?
- Quanto tempo uma pendência demora para ser resolvida atualmente? Qual o custo do retrabalho?
- O modelo de negócio é conector por secretaria, serviço gerenciado de qualidade de dados ou licenciamento?
- Dados públicos bastam para um piloto? Quais cadastros internos são proibidos para uso?

## O que é fonte oficial e o que é inventado
**Fontes públicas conhecidas (não consumidas neste mock):**
- [SIGLON — Unidades de Saúde](https://geo.londrina.pr.gov.br/server/rest/services/Publico/SaudeUnidadesBasicasAbrangenciaPublico/MapServer/0)
- [Ministério da Saúde — Dados Abertos/CNES](https://apidadosabertos.saude.gov.br/)

**Tudo o que aparece como estabelecimento, pontuação e resultado neste protótipo é exemplo inventado.** A coincidência ou divergência real entre essas fontes **não foi testada aqui**. A compatibilidade de campos, SRC e limites deve ser confirmada ao construir importadores reais.

## Decisão de arquitetura
- Três arquivos: `index.html`, `styles.css`, `app.js`, sem npm ou framework.
- O fluxo de conciliação não altera fontes oficiais. Quando houver dados reais, o matching deverá usar IDs, normalização, comparação e revisão humana auditável. Uma pontuação de similaridade não prova que uma fonte é verdadeira.
- **LexML** serve para normas e legislação, não como padrão direto de UBS/endereços. Origem Única inspira-se em proveniência e identificadores, mas usa um esquema específico do domínio administrativo.
- Não incluir dados pessoais, autenticação improvisada, chaves de API ou credenciais.
- O app concorrente escolhido futuramente poderá usar frontend Vercel, backend Render e banco Supabase; isso não é necessário no mock.

## Critérios mínimos para revisar a PR
- [ ] Abrir nos celulares e em um desktop sem rolagem horizontal relevante.
- [ ] Filtrar `Com conflito`, selecionar registro e registrar revisão, ver contador mudar.
- [ ] Reabrir registro; verificar trilha de auditoria.
- [ ] Exportar CSV e verificar cabeçalhos e conteúdo.
- [ ] Reiniciar demo; verificar contadores, lista e log.
- [ ] Nenhuma chamada aos endpoints reais, nenhuma informação pessoal ou dado municipal supostamente validado.

**A ação da equipe após ver este protótipo:** comentar na [Issue #2](https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2) quais funcionalidades têm valor real e se Origem Única deve competir com EcoVisão/LexBase. Não alterar escolha nem mesclar o produto por inferência.
