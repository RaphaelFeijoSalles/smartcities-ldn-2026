import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  CRITERIA, scoreRatings, ratingsFor, rankedConcepts, filterConcepts,
  validateDecisionData, decisionMarkdown
} from "./model.mjs";

const root=new URL("../../data/decision/",import.meta.url);
const catalog=JSON.parse(readFileSync(new URL("smartcities-decision-v1.json",root),"utf8"));
const baseline=JSON.parse(readFileSync(new URL("smartcities-assessments-v1.json",root),"utf8"));

test("15 desafios, 5 setores, 15 ideias e fontes coerentes",()=>{
  assert.equal(catalog.sectors.length,5);
  assert.equal(catalog.challenges.length,15);
  assert.equal(catalog.concepts.length,15);
  assert.equal(catalog.evidence.length,21);
  assert.deepEqual(validateDecisionData(catalog,baseline),[]);
  assert.equal(CRITERIA.length,6);
});
test("origens dos depoimentos e link público SIGLON preservados",()=>{
  for(const id of ["A1","A2","A3","A4","A5"])assert(catalog.evidence.some(e=>e.id===id));
  const siglon=catalog.evidence.find(e=>e.id==="R14");
  assert(siglon.url.includes("aplicativospublicossiglon"));
  assert.match(siglon.limitations,/carregamento dinâmico|dinâmico/i);
});
test("pesos somam 100 e limite da escala preservado",()=>{
  assert.equal(Object.values(catalog.scoring.weights).reduce((a,b)=>a+b,0),100);
  assert.equal(scoreRatings(Object.fromEntries(CRITERIA.map(c=>[c.key,5])),catalog.scoring.weights).score,5);
  assert.equal(scoreRatings(Object.fromEntries(CRITERIA.map(c=>[c.key,1])),catalog.scoring.weights).score,1);
  assert.equal(scoreRatings({},catalog.scoring.weights).complete,false);
  assert.equal(scoreRatings({evidence:9},catalog.scoring.weights).score,null);
  assert.equal(scoreRatings({evidence:1},{evidence:60,challengeFit:60}).score,null);
});
test("top 3 provisório é consistente, sem se apresentar como banca",()=>{
  const r=rankedConcepts(catalog,baseline);
  assert.deepEqual(r.slice(0,3).map(x=>[x.id,x.rating.score]),[
    ["C03",4.7],["C01",4.6],["C11",4.55]
  ]);
  assert(r.every(x=>x.rating.complete));
  assert.equal(baseline.status,"PROVISIONAL_NOT_OFFICIAL_NOT_USER_VALIDATED");
  assert(baseline.items.every(x=>x.gates.validated_user_pain==="UNKNOWN"));
});
test("ajuste local altera ordenação sem editar dados fonte",()=>{
  const override={C03:{...ratingsFor("C03",baseline),evidence:1,challengeFit:1,feasibility:1,demo:1,differentiation:1,commercial:1}};
  const original=rankedConcepts(catalog,baseline)[0].id;
  const changed=rankedConcepts(catalog,baseline,override);
  assert.equal(original,"C03");
  assert.notEqual(changed[0].id,"C03");
  assert.equal(changed.find(c=>c.id==="C03").rating.score,1);
  assert.equal(ratingsFor("C03",baseline).evidence,5);
});
test("filtro por acentos, setor e desafio não retorna falsos positivos",()=>{
  const r=rankedConcepts(catalog,baseline);
  assert(filterConcepts(r,{query:"normativo"}).some(x=>x.id==="C03"));
  assert(filterConcepts(r,{sectorId:"S4"}).every(x=>x.sectorId==="S4"));
  assert(filterConcepts(r,{challengeId:"04.3"}).every(x=>x.challengeIds.includes("04.3")));
  assert(filterConcepts(r,{query:"rejeitos"}).some(x=>x.id==="C05"));
  assert.deepEqual(filterConcepts(r,{sectorId:"S1",challengeId:"04.3"}),[]);
});
test("exportação com 2 selecionados é legível e inclui fontes, gates e notas",()=>{
  const md=decisionMarkdown({
    catalog,baseline,selectedIds:["C03","C11"],
    notes:{context:"Dois processos reais",chosen:"C03",owner:"Integração: responsável técnico"}
  });
  assert.match(md,/LexBase/);
  assert.match(md,/Turismo Colaborativo/);
  assert.doesNotMatch(md,/EcoLote/);
  assert.match(md,/4\.70|4\.70/);
  assert.match(md,/Gates ainda pendentes/);
  assert.match(md,/Issue #2/);
  assert.match(md,/Dois processos reais/);
});
test("sem shortlist exporta top 3 e sinaliza decisão provisória",()=>{
  const md=decisionMarkdown({catalog,baseline});
  assert.match(md,/LexBase/);
  assert.match(md,/Reconcilia Dados/);
  assert.match(md,/Turismo Colaborativo/);
  assert.doesNotMatch(md,/EcoLote/);
  assert.match(md,/NÃO decisão oficial/);
});
