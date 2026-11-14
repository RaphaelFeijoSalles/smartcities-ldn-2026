// Modelo puro, desacoplado do navegador. Fonte de conteúdo: data/decision/*.json.
// Não é modelo preditivo nem cálculo de probabilidade de vencer um hackathon.
export const CRITERIA = Object.freeze([
  {key:"evidence",label:"Evidência da dor",short:"Evidência"},
  {key:"challengeFit",label:"Aderência ao desafio",short:"Aderência"},
  {key:"feasibility",label:"Entrega em tempo",short:"Execução"},
  {key:"demo",label:"Demonstração",short:"Demo"},
  {key:"differentiation",label:"Diferenciação",short:"Diferencial"},
  {key:"commercial",label:"Continuidade comercial",short:"Negócio"}
]);

export function scoreRatings(ratings, weights) {
  if (!weights || Object.values(weights).reduce((s,v)=>s+v,0)!==100) return {score:null,complete:false,answered:0};
  let total=0,answered=0;
  for (const {key} of CRITERIA) {
    const val=ratings?.[key];
    if (Number.isInteger(val) && val>=1 && val<=5) {
      total+=val*weights[key]/100;
      answered++;
    }
  }
  return {score:answered===CRITERIA.length?Number(total.toFixed(2)):null,answered,complete:answered===CRITERIA.length};
}
export function ratingsFor(id, baseline, overrides={}) {
  const base=baseline.items.find(x=>x.id===id)?.ratings ?? {};
  return {...base,...(overrides[id]??{})};
}
export function rankedConcepts(catalog,baseline,overrides={}) {
  const weights=catalog.scoring.weights;
  return catalog.concepts.map((concept,index)=>({
    ...concept,
    rating:scoreRatings(ratingsFor(concept.id,baseline,overrides),weights),
    baseline:baseline.items.find(x=>x.id===concept.id),
    originalIndex:index
  })).sort((a,b)=>(b.rating.score??-1)-(a.rating.score??-1)||a.originalIndex-b.originalIndex)
    .map((x,index)=>({...x,rank:x.rating.complete?index+1:null}));
}
export function filterConcepts(items,{sectorId="",challengeId="",query=""}={}) {
  const q=String(query).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  return items.filter(x=>{
    if (sectorId&&x.sectorId!==sectorId) return false;
    if (challengeId&&!x.challengeIds.includes(challengeId)) return false;
    if (!q) return true;
    const hay=[x.name,x.problem,x.audience,x.mvp,x.incumbent,x.unknown,...x.challengeIds].join(" ")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    return hay.includes(q);
  });
}
export function validateDecisionData(catalog,baseline) {
  const errors=[];
  if (!catalog||!baseline) return ["Arquivos de dados ausentes"];
  const sectorIds=new Set((catalog.sectors??[]).map(x=>x.id));
  const challengeIds=new Set((catalog.challenges??[]).map(x=>x.id));
  const evidenceIds=new Set((catalog.evidence??[]).map(x=>x.id));
  const conceptIds=new Set((catalog.concepts??[]).map(x=>x.id));
  const assessments=new Set((baseline.items??[]).map(x=>x.id));
  if (sectorIds.size!==catalog.sectors?.length||challengeIds.size!==catalog.challenges?.length||conceptIds.size!==catalog.concepts?.length) errors.push("IDs duplicados");
  if (Object.values(catalog.scoring?.weights??{}).reduce((s,n)=>s+n,0)!==100) errors.push("Pesos não somam 100%");
  for(const concept of catalog.concepts??[]) {
    if(!sectorIds.has(concept.sectorId)) errors.push("Setor inválido: "+concept.id);
    if(!assessments.has(concept.id)) errors.push("Sem avaliação inicial: "+concept.id);
    for (const id of concept.challengeIds??[]) if(!challengeIds.has(id)) errors.push("Desafio inválido: "+id);
    for (const id of concept.evidenceRefs??[]) if(!evidenceIds.has(id)) errors.push("Evidência inválida: "+id);
  }
  for(const a of baseline.items??[]) {
    if(!conceptIds.has(a.id)) errors.push("Avaliação sem conceito: "+a.id);
    if(!scoreRatings(a.ratings,catalog.scoring.weights).complete) errors.push("Avaliação incompleta: "+a.id);
  }
  return errors;
}
function safeCell(value){return String(value??"").replace(/\|/g,"/").replace(/\r?\n/g," ").trim();}
export function decisionMarkdown({catalog,baseline,overrides={},selectedIds=[],notes={}}) {
  const all=rankedConcepts(catalog,baseline,overrides);
  const selected=selectedIds.length?all.filter(x=>selectedIds.includes(x.id)):all.slice(0,3);
  const lines=[
    "# Smart Cities Londrina — shortlist para discussão",
    "",
    "**Status:** comparação da equipe, NÃO decisão oficial, contrato ou confirmação de usuário.",
    "**Gerado em:** "+new Date().toISOString(),
    "**Origem:** data/decision/*.json e ajustes locais no navegador; valores sintéticos não representam fatos municipais.",
    "",
    "| Posição provisória | Ideia | Desafio | Nota (0–5) | Principal validação |",
    "|---:|---|---|---:|---|"
  ];
  for(const item of selected){
    lines.push("| "+(item.rank??"—")+" | "+safeCell(item.name)+" | "+item.challengeIds.join(", ")+" | "+(item.rating.score?.toFixed(2)??"PENDENTE")+" | "+safeCell(item.unknown)+" |");
  }
  lines.push("","## Discussão e decisão","");
  for(const [label,key] of [["Problema/justificativa","context"],["Ideia escolhida (confirmar na reunião)","chosen"],["Responsável / próximos passos","owner"]]){
    lines.push("### "+label,"",String(notes[key]??"").trim()||"PENDENTE","");
  }
  lines.push("## Gates ainda pendentes","","- Conferir edital integral (IA, código anterior, dados e propriedade intelectual).",
    "- Validar com usuário/operador e mapear alternativa existente.",
    "- Executar teste real do fluxo de 2 minutos e verificar dados/autorizações.",
    "- Registrar decisão e owners na Issue #2: https://github.com/RaphaelFeijoSalles/smartcities-ldn-2026/issues/2","","## Fontes");
  const evIds=new Set(selected.flatMap(c=>c.evidenceRefs));
  for(const e of catalog.evidence.filter(e=>evIds.has(e.id))) lines.push("- "+e.id+": "+e.title+(e.url?" — "+e.url:" — depoimento no chat; não publicado"));
  return lines.join("\n")+"\n";
}
