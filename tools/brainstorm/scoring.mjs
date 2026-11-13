// Funções puras — notas são OPINIÕES da equipe, não dados oficiais.
export const CRITERIA = Object.freeze([
  { key: "challenge", label: "Aderência ao desafio", weight: 30 },
  { key: "pain", label: "Dor / validação", weight: 25 },
  { key: "demo", label: "Demo compreensível", weight: 20 },
  { key: "feasibility", label: "Viabilidade no prazo", weight: 15 },
  { key: "adoption", label: "Adoção comercial", weight: 10 },
]);

export function scoreIdea(ratings = {}) {
  let answered = 0;
  let total = 0;
  for (const criterion of CRITERIA) {
    const value = ratings[criterion.key];
    if (Number.isInteger(value) && value >= 1 && value <= 5) {
      answered += 1;
      total += value * criterion.weight / 100;
    }
  }
  return {
    score: Number(total.toFixed(2)),
    answered,
    complete: answered === CRITERIA.length,
  };
}

export function rankIdeas(ideas = []) {
  return ideas.map(idea => ({ ...idea, evaluation: scoreIdea(idea.ratings) }))
    .filter(idea => idea.evaluation.complete)
    .sort((a, b) => b.evaluation.score - a.evaluation.score);
}
