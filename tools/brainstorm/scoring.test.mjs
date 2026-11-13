import test from "node:test";
import assert from "node:assert/strict";
import { CRITERIA, scoreIdea, rankIdeas } from "./scoring.mjs";

test("pesos somam 100% e campos são únicos", () => {
  assert.equal(CRITERIA.reduce((sum, criterion) => sum + criterion.weight, 0), 100);
  assert.equal(new Set(CRITERIA.map(c => c.key)).size, CRITERIA.length);
});

test("sem avaliação permanece incompleta, nunca vira zero validado", () => {
  assert.deepEqual(scoreIdea({}), { score: 0, answered: 0, complete: false });
  assert.deepEqual(rankIdeas([{ name: "não avaliada", ratings: {} }]), []);
});

test("todas notas 5 resultam em 5", () => {
  assert.deepEqual(scoreIdea(Object.fromEntries(CRITERIA.map(c => [c.key, 5]))),
    { score: 5, answered: 5, complete: true });
});

test("ponderação respeita critérios", () => {
  assert.deepEqual(scoreIdea({
    challenge: 5, pain: 4, demo: 3, feasibility: 2, adoption: 1,
  }), { score: 3.5, answered: 5, complete: true });
});

test("notas inválidas não completam o scorecard", () => {
  const result = scoreIdea({ challenge: 0, pain: 6, demo: "5", feasibility: NaN, adoption: 4 });
  assert.equal(result.answered, 1);
  assert.equal(result.complete, false);
});

test("ranking ignora avaliações incompletas e ordena as concluídas", () => {
  const make = (name, n) => ({ name, ratings: Object.fromEntries(CRITERIA.map(c => [c.key, n])) });
  const ranking = rankIdeas([make("baixa", 2), { name: "sem notas", ratings: {} }, make("alta", 5)]);
  assert.deepEqual(ranking.map(i => i.name), ["alta", "baixa"]);
});
