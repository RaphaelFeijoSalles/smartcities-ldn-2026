# Candidata 04.3 — histórias geolocalizadas em vídeo com marketplace de criadores, check-in e IA

**Status:** hipótese em avaliação, **NÃO** escolhida pela equipe.  
**Data:** 13/11/2026.  
**Origem:** ideia trazida pelo mantenedor: viajantes compram vídeos de criadores locais sobre lugares; autores são remunerados; assinatura/“check-in” tipo Wellhub; plano Pro com IA que responde curiosidades e perguntas sobre fotos.  
**Ligação oficial:** contexto 04, desafio **04.3 Turismo digital**, conforme foto da apresentação presencial no ChatGPT. [Catálogo dos 15](../research/CHALLENGES_OFFICIAL_2026.md) existe na PR #8, ainda não mesclada quando este documento foi criado.

## Veredito provisório
- **Conceito de negócio:** 4,1/5 — tem usuário, fornecedor de conteúdo e hipóteses de monetização claras, mas precisa de distribuição, conteúdo e diferenciação.
- **Hackathon em escopo completo:** 3,6/5 — marketplace + split + assinaturas + geolocalização + vídeo + IA visão excedem o fim de semana.
- **MVP recortado (1 roteiro cultural com 3 paradas, vídeos autorizados, acesso simulado e bônus de check-in):** viabilidade significativamente melhor, **a confirmar com a equipe**, sem score oficial.

**Limite crítico:** o modelo básico de “venda de roteiro em vídeo geolocalizado de autores locais” já existe. **Não afirmar ineditismo.** O diferencial proposto precisa ser **curadoria local + remuneração justa + storytelling de qualidade + integração com instituições + experiências baseadas no lugar**, comprovado por entrevista ou piloto.

## Concorrência — verificação feita em 13/11/2026
| Produto | Recursos já oferecidos | Implicação para nós |
|---|---|---|
| **Tourizzy** | Criadores enviam vídeos, marcam paradas com GPS, definem preço, turistas compram e assistem a cada parada; recursos de conquistas/idiomas | **Concorrente direto e muito próximo**; vídeo + GPS + marketplace não são diferencial |
| **VoiceMap** | Tours autoguiados GPS, preço por tour, publicação de autores, participação do criador (50% de receita após processamento, conforme documentação) | Autor ganhando por conteúdo já é modelo estabelecido |
| **Questo** | Storytelling local, experiências em locais, venda de roteiros, participação de criadores (divulga até 75% de royalty) | Gamificação/roteiro/creator monetization já existem |
| **SmartGuide** | Guia digital com áudio/texto/mapa, chat IA, planejamento e AR opcional para instituições de turismo | IA conversacional não é diferencial isolado |
| **HeyGuide** | Histórias por GPS, conversa por voz e recurso anunciado de foto/identificação de lugar | **Foto + perguntas + geolocalização também já estão sendo explorados** |
| **Tour Londrina (local)** | Passe pago de vouchers para estabelecimentos, resgate por QR Code, 170 estabelecimentos anunciados | Demonstra oferta local de passe validado, mas não prova demanda por vídeos históricos |

Fontes: 
- https://play.google.com/store/apps/details?id=com.toureasy.tourizzy
- https://docs.voicemap.me/tour-publishers/publishing-agreement/
- https://questoapp.com/creator-room
- https://www.smartguide.app/faq
- https://heyguide.fortunsolabs.com/
- https://www.tourlondrina.com.br/

**Importante:** não foram obtidos dados de usuários pagantes ou faturamento comparáveis. Existência de concorrente não valida nossa demanda local.

## Chance local: Londrina em 13/11/2026
A Prefeitura noticiou **hoje** que o **Mapa Turístico de Londrina** foi renovado e foi lançado um **vídeo turístico institucional**, com participação de Governança do Turismo, Visite Londrina Convention Bureau, Hub do Turismo e Unifil. A CODEL anunciou o **CAT Inteligente** do Parque Arthur Thomas para meados de 2027 (previsto, não entregue). Isso abre uma **hipótese de canal de distribuição, cooperação ou curadoria**, não patrocínio/aprovação do nosso produto.

Fonte: https://blog.londrina.pr.gov.br/?p=247150 (13/11/2026).

Em setembro de 2026, houve **visita mediada real a três museus do Centro**: Museu Histórico → Museu de Arte → Museu do Café. Um recorte de três paradas para a demo tem precedente como roteiro cultural, embora precise de conteúdo próprio e licenças. Fonte: https://blog.londrina.pr.gov.br/?p=243622 (25/09/2026).

### Público e comprador
- Usuário: turista de evento/negócios, estudante, morador que quer redescobrir a cidade, família ou visitante de museu.
- Criador: historiador, artista, guia cadastrado quando prestar serviço profissional regulamentado, produtor audiovisual local.
- Possíveis compradores/canais **hipotéticos**: turista pessoa física, hotel, museu, roteiro institucional, organizadores de eventos, Convention Bureau/DTI; sem alegar compra ou parceria.

## Modelo de negócio — não tentar os três no hackathon
**A) Pay-per-route, começar aqui.** Prévia gratuita; comprador adquire **um roteiro temático** com 3–5 vídeos, e não necessariamente cada vídeo curto. Autores recebem royalties com contrato e regras de uso. Na demo: compra e repasse **simulados**, zero cobrança real.

**B) Passe 48h/7 dias com check-ins, depois validar.** Passe de curta duração faz mais sentido para turista ocasional do que assinatura mensal recorrente. Acesso a conteúdos participantes, bônus culturais por visita e contagem de check-ins; pagamento ao criador deve levar em conta fraude/abuso, não só GPS do celular. O modelo Wellhub real é B2B2C e paga parceiros por visitas validadas, **não simplesmente por proximidade**. Fonte: https://wellhub.com/pt-br/partners/.

**C) Plano Pro com IA, fase futura.** IA contextual com base em fontes e conteúdos licenciados; curiosidades, perguntas e foto do monumento. Limitador de uso / custo por interação; fonte visível e aviso de incerteza. **Não gerar fatos históricos inventados.** Foto pode identificar errado, incluir rostos e dados pessoais; pedir consentimento e evitar armazenar mídia sem necessidade.

**D) B2B2C institucional, hipótese separada.** Roteiros licenciados a hotéis, museus, eventos e pontos de informação para chegar a usuários sem custo de aquisição tão alto.

**Hipóteses de preço para entrevistar, não validação:** roteiro avulso R$14,90–29,90; passe temporário R$19,90–39,90; IA adicional condicionada a custo efetivo e utilidade. Validar elasticidade antes de escolher.

## MVP do hackathon — máximo 2 minutos de demo
**Escolher um roteiro:** “Centro Cultural de Londrina” — três paradas inspiradas na visita mediada de setembro:
1. Museu Histórico: Rua Benjamin Constant, 900.
2. Museu de Arte: Rua Sergipe, 640.
3. Museu do Café / Sesc Cadeião: Rua Sergipe, 52.

**Usar 2 ou 3 vídeos produzidos pela equipe, autorizados ou com licença válida.** Nunca baixar conteúdo de outra pessoa sem licença. Dados de visita, pagamento, check-in e comissões todos rotulados **SINTÉTICOS**.

Demo:
1. (0–25s) Mapa/lista com três paradas + cartão do criador com vídeo de prévia.
2. (25–45s) Clicar “desbloquear roteiro” (CHECKOUT FICTÍCIO); liberar player.
3. (45–75s) Simular chegada em uma parada no **modo demonstração** (sem GPS falsificado); liberar conteúdo bônus/check-in.
4. (75–105s) Ver vídeo curto real e curiosidade com fonte; botão “perguntar ao lugar”.
5. (105–120s) Exibir extrato simulado do criador e pergunta sobre valor para visitante, com indicador “simulação”.

**Se a banca exigir IA real:** permitir uma pergunta textual com **conteúdo pré-curado** via recuperação simples; visão por foto só se houver tempo, segurança, dados/licença e fallback. **Não depender de LLM/API/checkout externo para demo.**

### Arquitetura mínima
- React + Vite + TypeScript no navegador; mapa por imagem/vetor local ou lib já aprovada, sem dependência de chave.
- Fixtures: `places`, `creators`, `videos`, `routes`, `access`, `checkins`; URLs do conteúdo e metadados/licenças.
- Serviços em interfaces: `ContentService`, `AccessService`, `CheckinService`, `TourGuideService`.
- Sem backend/autenticação/Stripe/split/armazenamento de fotos/lojas no P0.
- Separar **modo demo simulado** de GPS real e de acesso pago; nunca representar check-in simulado como real.

## Riscos a resolver ANTES de vender
1. **Oferta e demanda (marketplace de dois lados):** criadores precisam produzir conteúdo; turistas precisam querer pagar quando Google, YouTube e sites oficiais já oferecem informações gratuitas.
2. **Diferencial:** concorrente Tourizzy já tem vídeo/GPS/creator; é necessário escolher nicho ou parceria/canal local convincente.
3. **Economia unitária:** comissões, taxas de pagamento e loja, impostos, vídeos/streaming, antifraude, reembolsos, moderação, IA e aquisição podem consumir a margem. Comissão e preços não definidos.
4. **Direitos autorais e licenças:** vídeo, trilha, imagem, narração, nome do produtor, reprodução e uso para IA.
5. **Cadastur:** distinguir criador que publica vídeo de guia que vende/presta acompanhamento profissional; o governo exige registro para exercício profissional de Guia de Turismo. Fonte: https://www.gov.br/pt-br/servicos/cadastrar-se-como-guia-de-turismo.
6. **Localização e privacidade:** check-in por GPS pode ser impreciso/fraudado; permitir não usar localização e optar por QR quando houver parceiro físico real.
7. **Inclusão digital:** legenda, texto, áudio, modo offline, custo de dados e acessibilidade; vídeos longos podem atrapalhar caminhada ao ar livre.
8. **Risco de plataforma turística ampla:** início com UM percurso e criadores autorizados.

## Perguntas para Miguel/mentores
1. “Você pagaria por **vídeos avulsos** ou por **uma experiência/roteiro completo**? Quanto e por quê?”
2. “Você já assiste vídeos sobre lugares antes/durante a visita? O que o vídeo gratuito não resolve?”
3. “Um historiador/guia/museu produziria 3 vídeos com autorização para teste? Qual contrapartida exigiria?”
4. “A Governança de Turismo/Visite Londrina/hotel veria valor em distribuição desses roteiros ao visitante? O que já existe?”
5. “As pessoas fariam check-in por benefício real (bônus cultural/desconto) ou só pelo distintivo?”
6. “A IA com foto acrescenta valor suficiente para pagar? Você confiaria nela sem fontes?”

### Gate do brainstorm
**Só colocar esta hipótese na trilha de implementação se:**
- [ ] mentor confirma que o desafio **04.3 Turismo digital** aceita este recorte;
- [ ] há 1 criador ou instituição disponível para validar conteúdo, ou vídeos próprios autorizados;
- [ ] existe 1 diferença clara frente ao Tourizzy e ao conteúdo turístico gratuito;
- [ ] roteiro com 3 pontos é demonstrável em 2 min sem pagamentos reais;
- [ ] equipe confirma responsáveis por vídeo, frontend, integração, negócio e demo.

**Decisão e evidências:** ainda **PENDENTES**. Não selecionar o produto automaticamente por esta análise.
