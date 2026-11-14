import {
  CRITERIA, rankedConcepts, filterConcepts, ratingsFor,
  validateDecisionData, decisionMarkdown
} from "./model.mjs";

const DATA = "../../data/decision/";
const STORAGE_KEY = "smartcities-decision-lab-v1";
let catalog, baseline;
let state = {selectedIds:[],overrides:{},notes:{context:"",chosen:"",owner:""},query:"",sectorId:"",challengeId:"",expandedId:""};

const $ = id => document.getElementById(id);
function create(tag, className="", text) {
  const node=document.createElement(tag);
  if(className) node.className=className;
  if(text!==undefined) node.textContent=String(text);
  return node;
}
function appendText(parent,tag,text,cls="") { const n=create(tag,cls,text);parent.append(n);return n; }
function scoreText(value) { return Number.isFinite(value)?value.toFixed(2).replace(".",","):"PENDENTE"; }
function notice(message) { $("export-message").textContent=message; }
function save() {
  try {
    localStorage.setItem(STORAGE_KEY,JSON.stringify({
      selectedIds:state.selectedIds,overrides:state.overrides,notes:state.notes
    }));
  } catch { notice("Armazenamento indisponível: exporte os dados antes de fechar a página."); }
}
function loadSaved() {
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)??"null");
    if(!saved||typeof saved!=="object") return;
    const validIds=new Set(catalog.concepts.map(c=>c.id));
    if(Array.isArray(saved.selectedIds)) state.selectedIds=[...new Set(saved.selectedIds.filter(id=>validIds.has(id)))].slice(0,3);
    if(saved.overrides&&typeof saved.overrides==="object"&&!Array.isArray(saved.overrides)) {
      for(const [id,ratings] of Object.entries(saved.overrides)) {
        if(!validIds.has(id)||!ratings||typeof ratings!=="object") continue;
        const sanitized={};
        for(const {key} of CRITERIA) if(Number.isInteger(ratings[key])&&ratings[key]>=1&&ratings[key]<=5) sanitized[key]=ratings[key];
        if(Object.keys(sanitized).length) state.overrides[id]=sanitized;
      }
    }
    if(saved.notes&&typeof saved.notes==="object") {
      for(const key of ["context","chosen","owner"]) if(typeof saved.notes[key]==="string") state.notes[key]=saved.notes[key].slice(0,6000);
    }
  } catch { /* Storage may be blocked or corrupted. Defaults stay safe. */ }
}
function ranked(){return rankedConcepts(catalog,baseline,state.overrides);}
function sectorFor(id){return catalog.sectors.find(s=>s.id===id);}
function referencesFor(item){const refs=new Set(item.evidenceRefs);return catalog.evidence.filter(e=>refs.has(e.id));}
function renderOverview() {
  $("stat-concepts").textContent=catalog.concepts.length;
  $("stat-challenges").textContent=catalog.challenges.length;
  $("stat-sectors").textContent=catalog.sectors.length;
  $("stat-evidence").textContent=catalog.evidence.length;
  const weights=$("weights");weights.replaceChildren();
  CRITERIA.forEach(({key,short})=>{
    const chip=create("span","weight");
    chip.append(create("span","",short),create("b","",catalog.scoring.weights[key]+"%"));
    weights.append(chip);
  });
}
function progress(score) {
  const bar=create("div","score-track");
  const fill=create("div","score-fill");
  fill.style.width=(score===null?0:Math.max(0,Math.min(100,score/5*100)))+"%";
  bar.append(fill);return bar;
}
function renderLeaders() {
  const target=$("leaders");target.replaceChildren();
  ranked().filter(c=>c.rating.complete).slice(0,3).forEach((item,index)=>{
    const a=create("a","leader");
    a.href="#card-"+item.id;
    a.style.textDecoration="none";
    const head=create("div","leader-top");
    head.append(create("span","rank-label","POSIÇÃO "+String(index+1).padStart(2,"0")));
    const sc=create("span","score-large",scoreText(item.rating.score)+" ");
    sc.append(create("span","","/5"));head.append(sc);
    a.append(head,create("h3","",item.name),create("span","context",sectorFor(item.sectorId)?.name??"Setor"));
    a.append(progress(item.rating.score),create("p","mini-p",item.baseline?.rationale??item.problem));
    target.append(a);
  });
}
function renderFilterOptions() {
  const sectors=$("sector-filter");sectors.replaceChildren(new Option("Todos os setores",""));
  catalog.sectors.forEach(s=>sectors.add(new Option(s.name,s.id)));
  sectors.value=state.sectorId;
  updateChallenges();
}
function updateChallenges() {
  const select=$("challenge-filter");
  select.replaceChildren(new Option("Todos os desafios",""));
  catalog.challenges.filter(c=>!state.sectorId||c.sectorId===state.sectorId).forEach(c=>
    select.add(new Option(c.id+" · "+c.title,c.id)));
  if(![...select.options].some(x=>x.value===state.challengeId))state.challengeId="";
  select.value=state.challengeId;
}
function sourceChip(evidence) {
  const node=evidence.url?create("a","source",evidence.id+" · "+evidence.title):create("span","source",evidence.id+" · áudio/evento");
  if(evidence.url) {node.href=evidence.url;node.target="_blank";node.rel="noopener noreferrer";}
  node.title=evidence.limitations??evidence.location??"";
  return node;
}
function renderCards() {
  const all=ranked();
  const visible=filterConcepts(all,{sectorId:state.sectorId,challengeId:state.challengeId,query:state.query});
  const target=$("cards");target.replaceChildren();
  $("result-count").textContent=visible.length+" de "+all.length+" propostas";
  if(!visible.length) {
    target.append(create("div","idea-card","Não encontrei ideias com esses filtros. Experimente outro termo ou setor."));
    return;
  }
  visible.forEach(item=>{
    const card=create("article","idea-card"+(state.selectedIds.includes(item.id)?" is-selected":""));
    card.id="card-"+item.id;
    const head=create("div","card-top"),left=create("div","card-top-left");
    left.append(create("span","index-tag","#"+(item.rank??"—")),create("span","id-tag",item.id));
    const score=create("span","score-compact",scoreText(item.rating.score)+" ");
    score.append(create("span","","/ 5"));head.append(left,score);
    card.append(head,create("p","card-context",sectorFor(item.sectorId)?.name+" · desafios "+item.challengeIds.join(" / ")));
    card.append(create("h3","",item.name),create("p","problem",item.problem),progress(item.rating.score));
    const story=create("div","card-story");
    story.append(create("strong","","MVP 2 min"),create("span","",item.mvp));card.append(story);
    const question=create("div","card-story");
    question.append(create("strong","","Validar"),create("span","",item.unknown));card.append(question);
    card.append(create("div","risk","Pendente: "+item.blockers.join(" · ")));
    const actions=create("div","card-buttons");
    const selected=state.selectedIds.includes(item.id);
    const toggle=create("button","btn "+(selected?"":"btn-positive"),selected?"✓ Na comparação":"+ Comparar");
    toggle.type="button";toggle.setAttribute("aria-pressed",String(selected));
    toggle.addEventListener("click",()=>{
      if(selected) state.selectedIds=state.selectedIds.filter(x=>x!==item.id);
      else if(state.selectedIds.length>=3) { notice("A shortlist comporta até 3 ideias. Retire uma antes de adicionar outra.");return; }
      else state.selectedIds.push(item.id);
      save();renderCards();renderSelection();
    });
    const expanding=state.expandedId===item.id;
    const detailBtn=create("button","btn",expanding?"Fechar evidências":"Ver evidências e notas");
    detailBtn.type="button";detailBtn.setAttribute("aria-expanded",String(expanding));
    detailBtn.addEventListener("click",()=>{state.expandedId=expanding?"":item.id;renderCards();});
    actions.append(toggle,detailBtn);card.append(actions);
    const detail=create("div","card-details");detail.hidden=!expanding;
    appendText(detail,"h4","Por que recebeu esta nota?");
    appendText(detail,"p",item.baseline?.rationale??"Ainda sem justificativa");
    appendText(detail,"h4","Fontes e limitações");
    const sourceList=create("div","sources");
    referencesFor(item).forEach(e=>sourceList.append(sourceChip(e)));
    detail.append(sourceList);
    appendText(detail,"p","Alternativas existentes: "+item.incumbent);
    appendText(detail,"p","Principal próximo teste: "+(item.baseline?.nextValidation??item.unknown));
    appendText(detail,"h4","Ajustar avaliação (1 a 5)");
    const ratings=create("div","rating-grid"),current=ratingsFor(item.id,baseline,state.overrides);
    for(const {key,label} of CRITERIA){
      const labelNode=create("label");
      labelNode.append(create("span","",label+" · "+catalog.scoring.weights[key]+"%"));
      const select=create("select");
      select.setAttribute("aria-label",label+" de "+item.name);
      for(const n of [1,2,3,4,5])select.add(new Option(String(n),String(n)));
      select.value=String(current[key]??1);
      select.addEventListener("change",()=>{
        if(!state.overrides[item.id])state.overrides[item.id]={};
        state.overrides[item.id][key]=Number(select.value);
        save();renderLeaders();renderCards();renderSelection();
      });
      labelNode.append(select);ratings.append(labelNode);
    }
    detail.append(ratings);
    appendText(detail,"p","Todos os gates técnicos e a validação de usuário seguem pendentes. Nota elevada não equivale a aprovação da ideia.","small muted");
    card.append(detail);target.append(card);
  });
}
function renderSelection() {
  const panel=$("selected-cards"),table=$("compare-table");
  panel.replaceChildren();table.replaceChildren();
  const all=ranked(),selected=state.selectedIds.map(id=>all.find(x=>x.id===id)).filter(Boolean);
  if(!selected.length) {
    panel.append(create("p","small muted","Nenhuma ideia selecionada. Toque em “Comparar” nas propostas para colocar até três lado a lado."));
    return;
  }
  selected.forEach(item=>{
    const row=create("div","selected-item");
    const info=create("div"); info.append(create("b","",item.name),create("small","",item.id+" · "+scoreText(item.rating.score)+"/5"));
    const remove=create("button","","×");remove.type="button";remove.title="Remover "+item.name;remove.setAttribute("aria-label",remove.title);
    remove.addEventListener("click",()=>{state.selectedIds=state.selectedIds.filter(id=>id!==item.id);save();renderCards();renderSelection();});
    row.append(info,remove);panel.append(row);
  });
  const t=create("table"),thead=create("thead"),hrow=create("tr");hrow.append(create("th","","Critério"));
  selected.forEach(c=>hrow.append(create("th","",c.id)));thead.append(hrow);t.append(thead);
  const tbody=create("tbody");
  for(const {key,short} of CRITERIA){
    const tr=create("tr");tr.append(create("td","",short));
    selected.forEach(c=>tr.append(create("td","",String(ratingsFor(c.id,baseline,state.overrides)[key]??"—"))));tbody.append(tr);
  }
  const final=create("tr");final.append(create("th","","Total /5"));
  selected.forEach(c=>final.append(create("td","",scoreText(c.rating.score))));tbody.append(final);
  t.append(tbody);table.append(t);
}
function download(filename,content,mime) {
  const url=URL.createObjectURL(new Blob([content],{type:mime}));
  const link=create("a");link.href=url;link.download=filename;document.body.append(link);
  link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function wireEvents() {
  $("search").addEventListener("input",e=>{state.query=e.target.value;renderCards();});
  $("sector-filter").addEventListener("change",e=>{state.sectorId=e.target.value;state.challengeId="";updateChallenges();renderCards();});
  $("challenge-filter").addEventListener("change",e=>{state.challengeId=e.target.value;renderCards();});
  $("clear-selection").addEventListener("click",()=>{state.selectedIds=[];save();renderCards();renderSelection();});
  for(const key of ["context","chosen","owner"]){
    const input=$("note-"+key);
    input.value=state.notes[key]??"";
    input.addEventListener("input",()=>{state.notes[key]=input.value;save();});
  }
  $("export-md").addEventListener("click",()=>{
    const md=decisionMarkdown({catalog,baseline,overrides:state.overrides,selectedIds:state.selectedIds,notes:state.notes});
    download("smartcities-decisao-shortlist.md",md,"text/markdown;charset=utf-8");
    notice("Markdown exportado. Envie para a Issue #2; nenhum dado foi publicado automaticamente.");
  });
  $("export-json").addEventListener("click",()=>{
    const selected=new Set(state.selectedIds);
    const data={schemaVersion:"1",exportedAt:new Date().toISOString(),status:"USER_LOCAL_PROVISIONAL",catalogVersion:catalog.version,baselineVersion:baseline.version,selectedIds:state.selectedIds,notes:state.notes,
      scores:ranked().map(item=>({id:item.id,rank:item.rank,score:item.rating.score,ratings:ratingsFor(item.id,baseline,state.overrides),selected:selected.has(item.id)}))};
    download("smartcities-avaliacao-local.json",JSON.stringify(data,null,2)+"\n","application/json;charset=utf-8");
    notice("Avaliações exportadas. O JSON contém sua shortlist e notas; não é decisão de banca.");
  });
  $("reset-ratings").addEventListener("click",()=>{
    if(!confirm("Restaurar as avaliações provisórias originais? A shortlist e as anotações serão preservadas."))return;
    state.overrides={};state.expandedId="";save();renderLeaders();renderCards();renderSelection();
    notice("Notas iniciais restauradas; sua shortlist e anotações foram mantidas.");
  });
}
async function start() {
  try {
    const files=await Promise.all(["smartcities-decision-v1.json","smartcities-assessments-v1.json"].map(async name=>{
      const response=await fetch(DATA+name,{cache:"no-store"});
      if(!response.ok)throw Error(name+" retornou HTTP "+response.status);
      return response.json();
    }));
    [catalog,baseline]=files;
    const problems=validateDecisionData(catalog,baseline);
    if(problems.length)throw Error("Dados inconsistentes: "+problems.join("; "));
    loadSaved();renderOverview();renderFilterOptions();wireEvents();renderLeaders();renderCards();renderSelection();
  }catch(error){
    const message="Não foi possível carregar o catálogo. Inicie um servidor na RAIZ do repositório com 'python3 -m http.server 4173' e abra http://localhost:4173/tools/decision-board/. Detalhe: "+(error?.message??String(error));
    $("load-error").textContent=message;$("load-error").classList.remove("hidden");
    $("result-count").textContent="Falha no carregamento";
  }
}
start();
