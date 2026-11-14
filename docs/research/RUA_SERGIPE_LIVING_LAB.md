# Rua Sergipe como laboratório vivo — não começar instalando sensores

**Consulta:** 13/11/2026. **Tese:** usar a Rua Sergipe como recorte de problema e demonstração digital de uma decisão pública, **sem alegar acesso aos sensores reais** ou parceria com a Prefeitura.

## Linha do tempo documentada
| Quando | Evidência | O que isso significa para o produto |
|---|---|---|
| Jan/2021 | Acordo Prefeitura/ABDI/PTI para Rua Inteligente; proposta de iluminação controlável, semáforos inteligentes, câmeras, conectividade, apoio CODEL/CTD/CMTU/ACIL/Sebrae | **A rua já é um espaço-piloto; não propor hardware que existe sem conhecer o estado dele** |
| Abr/2021 | CMTU acompanha semáforos em cruzamentos da Sergipe com Rio de Janeiro e São Paulo, com ajuste previsto ao fluxo | Avaliar dados e operação atual com CMTU, não presumir que API é pública |
| Set/2026 | Prefeitura/CMTU/Sema/Londrina Iluminação começam revitalização, 13 quadras, paisagismo, mobiliário, sinalização e iluminação, com ACIL/Núcleo Rua Sergipe | Evidência recente de necessidade de **coordenação entre atores e manutenção** |
| Set/2026 | ACIL promove o Dia da Sergipe com lojistas e serviços públicos | Canal potencial para validar a experiência de comerciantes e pedestres |

Fontes: [CODEL — Rua Inteligente 2021](https://codel.londrina.pr.gov.br/index.php/alt/406-projeto-rua-inteligente-trara-inovacao-e-tecnologia-a-rua-sergipe.html), [CMTU — semáforos 2021](https://cmtu.londrina.pr.gov.br/index.php/ult-noticias/1934-cmtu-acompanha-instalacao-de-semaforos-do-projeto-cidades-inteligentes-na-rua-sergipe.html), [Prefeitura — revitalização 03/09/2026](https://blog.londrina.pr.gov.br/?p=241864), [ACIL — Dia da Sergipe 2026](https://acil.com.br/noticias/dia-da-sergipe-celebra-a-cidadania-e-o-comercio-neste-sabado-19/).

## Usuários distintos
- Comerciante: quer acesso, fluidez, manutenção e comunicação sobre intervenções.
- Pedestre/pessoa com deficiência: quer trajetos acessíveis, travessias e clareza de obstáculos, não apenas câmeras.
- CMTU/gestor urbano: quer evidências operacionais, responsáveis, prioridades e acompanhamento.
- ACIL/Núcleo: coordena comerciantes e aproxima feedback de órgãos.
- CTD/CODEL: podem discutir interoperabilidade e canal de piloto, sujeito a autorização.

## 4 propostas de software (todas HIPÓTESES)
### S1 — Sergipe em Dia: fila intersetorial de manutenção urbana
**Demo:** quadra fictícia → registro sintético de problema → responsável sugerido com regra explícita → prioridade revisada por humano → histórico/evidência da solução → indicador de prazo fictício.  
**Diferença contra Londrina ON:** ferramenta **interna de coordenação** entre secretarias/fornecedores; confirmar se isso já existe.  
**Pergunta:** existe gargalo de encaminhamento e atualização de status ou é tudo coberto no sistema atual?

### S2 — Caminho Acessível: manutenção de acessibilidade de travessias
**Demo:** inventário fictício de rampas e pontos de travessia → checklist orientativo → urgência segundo risco sinalizado pelo avaliador → plano de reparo.  
**Cuidado:** não afirmar inspeção real, não emitir laudo técnico nem identificar pessoas.

### S3 — SerraFlux: operação de carga e descarga
**Demo:** demandas simuladas de lojistas → janelas de carga e descarga → conflitos de espaço exibidos → proposta de negociação entre comércio/CMTU.  
**Cuidado:** não criar política de trânsito automaticamente nem presumir que acesso logístico é a maior dor em 2026.

### S4 — Rua Transparente: acompanhamento de intervenções
**Demo:** ação de revitalização → prazo/autor/etapa sintéticos → comprovante de execução fictício → linguagem simples para comércio e cidadão.  
**Risco:** já pode haver transparência no portal; precisa provar valor de comunicação e integração.

## Não fazer
- Conectar-se a câmeras, placas, reconhecimento facial, semáforos ou Wi-Fi real.
- Publicar localização/identidade de pessoas ou imagens do espaço sem avaliar riscos de privacidade.
- Dizer que a Rua Sergipe está em determinada condição **agora** só por uma notícia histórica.
- Exibir números de melhoria de fluxo, segurança, vendas ou acessibilidade sem medição.

## Pergunta de campo/mentor
**“Qual problema na Rua Sergipe gera mais trabalho entre solicitação, triagem, execução e comprovação, apesar dos sistemas existentes?”**  
Se ninguém conseguir confirmar um gargalo, **descartar a ideia Sergipe** mesmo que seja uma localização interessante para o pitch.
