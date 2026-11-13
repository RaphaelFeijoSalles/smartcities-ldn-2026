# Contratos de dados/API — placeholder intencional

**Não existem endpoints implementados nem domínio escolhido.**

Quando a ideia for aprovada:
1. Modelar 1 cenário de demonstração em JSON **sintético**, com entrada e saída.
2. Definir tipos/validação e significado de cada campo em linguagem comum.
3. Separar cálculo/regra determinística de apresentação e sugestões de IA.
4. Versionar o contrato e entregar 2 casos: sucesso e falha.
5. Só criar API servidor se houver necessidade de persistência, autorização ou execução que o navegador não consiga atender.

**Owner inicial:** Raphael, com revisão da pessoa que construir a interface.

Regra: o agente do frontend não inventa campo no contrato para "fazer a tela funcionar". Perguntar ao integrador quando houver conflito.
