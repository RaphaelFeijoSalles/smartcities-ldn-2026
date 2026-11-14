/* Origem Única — standalone mock: NO API REQUESTS, NO REAL MUNICIPAL DATA. */
"use strict";
const STORE = "origem-unica-mock-v1";
const seed = [
 {id:"OU-001",name:"UBS Jardim Exemplo",kind:"conflict",score:0.91,fields:["Número","Telefone"],status:"pending",
  a:{name:"UBS Jardim Exemplo",address:"Rua das Flores, 150",phone:"(43) 3333-1111",updated:"10/11/2026",ref:"SIG-001"},
  b:{name:"Unid. Básica Jd. Exemplo",address:"R. das Flores, 105",phone:"(43) 3333-2222",updated:"12/11/2026",ref:"CNES-DEMO-01"}},
 {id:"OU-002",name:"UBS Parque Modelo",kind:"match",score:0.98,fields:[],status:"matched",
  a:{name:"UBS Parque Modelo",address:"Rua dos Ipês, 28",phone:"(43) 3333-3333",updated:"09/11/2026",ref:"SIG-002"},
  b:{name:"Unidade Básica Parque Modelo",address:"R. dos Ipês, 28",phone:"43 3333 3333",updated:"08/11/2026",ref:"CNES-DEMO-02"}},
 {id:"OU-003",name:"UBS Vale Ilustrativo",kind:"conflict",score:0.96,fields:["Telefone"],status:"pending",
  a:{name:"UBS Vale Ilustrativo",address:"Avenida do Lago, 44",phone:"(43) 3333-4444",updated:"11/11/2026",ref:"SIG-003"},
  b:{name:"UBS Vale Ilustrativo",address:"Av. do Lago, 44",phone:"(43) 3333-4455",updated:"06/11/2026",ref:"CNES-DEMO-03"}},
 {id:"OU-004",name:"UBS Centro Simulado",kind:"match",score:0.99,fields:[],status:"matched",
  a:{name:"UBS Centro Simulado",address:"Rua Central, 80",phone:"(43) 3333-5555",updated:"01/11/2026",ref:"SIG-004"},
  b:{name:"Unidade de Saúde Centro Simulado",address:"R. Central, 80",phone:"4333335555",updated:"02/11/2026",ref:"CNES-DEMO-04"}},
 {id:"OU-005",name:"UBS Horizonte Fictício",kind:"missing",score:null,fields:["Ausente na fonte B"],status:"pending",
  a:{name:"UBS Horizonte Fictício",address:"Rua Horizonte, 22",phone:"(43) 3333-6666",updated:"05/11/2026",ref:"SIG-005"},b:null},
 {id:"OU-006",name:"UBS Nova Amostra",kind:"possible",score:0.73,fields:["Nome","Número"],status:"pending",
  a:{name:"UBS Nova Amostra",address:"Rua da Serra, 14",phone:"(43) 3333-7777",updated:"04/11/2026",ref:"SIG-006"},
  b:{name:"Unidade Nova Serra",address:"Rua da Serra, 41",phone:"(43) 3333-7777",updated:"04/11/2026",ref:"CNES-DEMO-06"}}
];
const $=id=>document.getElementById(id);
const clone=o=>JSON.parse(JSON.stringify(o));
const labels={conflict:"Conflito",match:"Correspondência",missing:"Sem par",possible:"Possível duplicidade"};
const statusLabels={pending:"Pendente",reviewed:"Revisado",matched:"Normalizado"};
let state={items:clone(seed),logs:[{id:"audit-initial",at:null,message:"Seis registros sintéticos carregados para o cenário de UBS.",details:"Dados inventados. Nenhuma API foi consultada."}],selected:"OU-001",search:"",filter:"all",view:"overview"};
let timer=null;
try{
  const saved=JSON.parse(localStorage.getItem(STORE)||"null");
  if(saved&&Array.isArray(saved.items)&&saved.items.length===seed.length&&saved.items.every((r,i)=>r.id===seed[i].id)&&Array.isArray(saved.logs)){
    state.items=saved.items;state.logs=saved.logs.slice(-50);
    if(seed.some(x=>x.id===saved.selected))state.selected=saved.selected;
  }
}catch{}
const safeText=(tag,value,cls)=>{const n=document.createElement(tag);n.textContent=String(value??"—");if(cls)n.className=cls;return n;};
function persist(){try{localStorage.setItem(STORE,JSON.stringify({items:state.items,logs:state.logs,selected:state.selected}));}catch{}}
function audit(message,details){state.logs.unshift({id:"a-"+Date.now()+"-"+Math.random().toString(36).slice(2,5),at:new Date().toLocaleString("pt-BR"),message,details});state.logs=state.logs.slice(0,50);persist();renderAudit();}
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("visible");clearTimeout(timer);timer=setTimeout(()=>t.classList.remove("visible"),3500)}
function viewPage(name){if(!["overview","sources","matching","audit","impact"].includes(name))return;state.view=name;
 for(const el of document.querySelectorAll(".view"))el.classList.toggle("active",el.id==="view-"+name);
 for(const el of document.querySelectorAll("[data-view]")){const active=el.dataset.view===name;el.classList.toggle("active",active);if(active)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");}
 $("current-page").textContent={overview:"Visão geral",sources:"Fontes de dados",matching:"Conciliação",audit:"Auditoria",impact:"Valor público"}[name];
 window.scrollTo({top:0,behavior:"auto"});
}
function kindClass(item){return item.status==="reviewed"?"reviewed":item.kind==="conflict"?"warning":""}
function kindLabel(item){return item.status==="reviewed"?"Revisado":labels[item.kind]}
function stats(){
 $("stat-total").textContent=state.items.length;
 const pending=state.items.filter(x=>x.status==="pending").length;
 $("stat-pending").textContent=pending;
 $("stat-reviewed").textContent=state.items.filter(x=>x.status==="reviewed").length;
 $("nav-pending").textContent=pending;
 const counts=[["Conflitos de cadastro",state.items.filter(x=>x.kind==="conflict").length,""],["Possíveis duplicidades",state.items.filter(x=>x.kind==="possible").length,"amber"],["Sem par na outra fonte",state.items.filter(x=>x.kind==="missing").length,"blue"]];
 $("conflict-chart").replaceChildren();
 for(const [label,count,tint] of counts){
  const row=safeText("div",undefined,"chart-item");row.textContent="";
  const bar=safeText("div",undefined,"track");bar.textContent="";
  const fill=safeText("div",undefined,"fill "+tint);fill.textContent="";fill.style.width=Math.max(5,count/3*100)+"%";bar.append(fill);
  row.append(safeText("span",label),bar,safeText("b",count));$("conflict-chart").append(row);
 }
}
function filtered(){
 const q=state.search.toLocaleLowerCase("pt-BR");
 return state.items.filter(x=>{
   const text=[x.name,x.id,x.a?.address,x.b?.address].join(" ").toLocaleLowerCase("pt-BR");
   return(!q||text.includes(q))&&(state.filter==="all"||(state.filter==="pending"&&x.status==="pending")||(state.filter==="reviewed"&&x.status==="reviewed")||x.kind===state.filter);
 });
}
function renderRecords(){
 const rows=filtered(),root=$("records");root.replaceChildren();
 $("list-count").textContent=rows.length+" registro(s) de demonstração";
 if(!rows.length){root.append(safeText("p","Nenhum cadastro com estes filtros.","panel-note"));return;}
 for(const item of rows){
  const node=safeText("button",undefined,"record"+(state.selected===item.id?" active":""));node.textContent="";node.type="button";
  const left=safeText("span",undefined);left.textContent="";
  left.append(safeText("b",item.name),safeText("small",item.id+" · "+(item.score===null?"sem score":Math.round(item.score*100)+"% de similaridade demonstrativa")));
  node.append(left,safeText("span",kindLabel(item),"pill "+kindClass(item)));
  node.addEventListener("click",()=>{state.selected=item.id;persist();renderRecords();renderDetail();});
  root.append(node);
 }
}
function fieldCompare(item,side){
 const root=safeText("div",undefined,"compare-col");root.textContent="";
 const header=safeText("div",undefined,"compare-header");header.textContent="";header.append(safeText("b",side==="a"?"SIGLON":"CNES"),safeText("span",side==="a"?"MUNICIPAL · MOCK":"NACIONAL · MOCK"));root.append(header);
 const body=safeText("div",undefined,"compare-body");body.textContent="";
 const values=item[side];
 for(const [key,label] of [["name","Estabelecimento"],["address","Endereço"],["phone","Telefone"],["ref","Identificador"],["updated","Atualização fictícia"]]){
   const line=safeText("div",undefined,"compare-field"+(!values?" absent":(item.kind==="conflict"||item.kind==="possible")&&(["address","phone"].includes(key))?" conflict":""));line.textContent="";
   line.append(safeText("small",label),safeText("b",values?.[key]??"Registro não presente"));body.append(line);
 }
 root.append(body);return root;
}
function renderDetail(){
 const item=state.items.find(x=>x.id===state.selected),root=$("details");root.replaceChildren();if(!item){root.append(safeText("p","Selecione um registro."));return;}
 const title=safeText("div",undefined,"detail-title");title.textContent="";
 const left=safeText("div",undefined);left.textContent="";left.append(safeText("div","REGISTRO "+item.id,"section-kicker"),safeText("h2",item.name),safeText("p","Fontes fictícias · nenhuma base oficial foi alterada"));
 title.append(left,safeText("span",item.status==="reviewed"?"Revisado":statusLabels[item.status],"pill "+(item.status==="reviewed"?"reviewed":item.status==="pending"?"warning":"good")));root.append(title);
 const compare=safeText("div",undefined,"compare");compare.textContent="";compare.append(fieldCompare(item,"a"),fieldCompare(item,"b"));root.append(compare);
 const verdict=safeText("div",undefined,"verdict"+(item.status==="matched"||item.status==="reviewed"?" good":""));verdict.textContent="";
 const explanation=item.kind==="match"?"Os formatos foram normalizados e parecem representar o mesmo registro.":"Existem campos divergentes ou um cadastro sem par. Um humano precisa confirmar a correspondência e definir o encaminhamento.";
 verdict.append(safeText("b",item.status==="reviewed"?"Decisão de simulação registrada":item.kind==="match"?"Correspondência por normalização":item.kind==="missing"?"Registro sem par":"Conferência recomendada"),safeText("p",explanation));
 root.append(verdict);
 if(item.status==="matched"){root.append(safeText("p","Nenhuma revisão necessária no cenário fictício; não equivale a validação oficial.","review-note"));return;}
 if(item.status==="reviewed"){
  root.append(safeText("p","Decisão registrada: "+(item.decisionLabel||"Conferência")+". A origem permanece intacta.","review-note"));
  const reopen=safeText("button","↺ Reabrir para análise","button outline");reopen.type="button";reopen.addEventListener("click",()=>{item.status="pending";delete item.decisionLabel;audit("Pendência reaberta: "+item.id,"Revisão local reiniciada.");refresh();toast("Registro reaberto.");});root.append(reopen);return;
 }
 root.append(safeText("label","Escolha uma ação de revisão (simulada)","choice-label"));
 const select=document.createElement("select");select.className="choice-select";select.id="decision-"+item.id;
 for(const [value,label] of [["VERIFY_A","Conferir endereço/telefone da fonte municipal"],["VERIFY_B","Conferir endereço/telefone da fonte nacional"],["MATCH_LINK","Confirmar vínculo entre registros, sem corrigir fonte"],["NO_MATCH","Declarar que não são o mesmo estabelecimento"],["MANUAL","Encaminhar para conferência do órgão responsável"]])select.add(new Option(label,value));
 root.append(select);
 const actions=safeText("div",undefined,"review-actions");actions.textContent="";
 const approve=safeText("button","✓ Registrar decisão","button primary");approve.type="button";
 approve.addEventListener("click",()=>{item.status="reviewed";item.decisionLabel=select.options[select.selectedIndex].text;audit("Revisão simulada: "+item.id,item.decisionLabel+" · nenhum dado oficial foi alterado.");refresh();toast("Revisão local registrada.");});
 const pending=safeText("button","Manter pendente","button outline");pending.type="button";pending.addEventListener("click",()=>toast("Registro mantido para análise do responsável."));
 actions.append(approve,pending);root.append(actions);
 root.append(safeText("p","Uma correspondência sugerida não é uma correção oficial. Esta etapa representa somente uma decisão de teste.","review-note"));
}
function renderAudit(){
 const root=$("audit-list");root.replaceChildren();
 for(const entry of state.logs){
  const row=safeText("div",undefined,"audit-row");row.textContent="";
  row.append(safeText("div","✓","audit-ico"));
  const d=safeText("div",undefined);d.textContent="";
  d.append(safeText("b",entry.message),safeText("p",entry.details));if(entry.at)d.append(safeText("time",entry.at));row.append(d);root.append(row);
 }
}
function refresh(){stats();renderRecords();renderDetail();renderAudit()}
function download(filename,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const csvEsc=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
function exportCsv(){
 const head=["id","estabelecimento","tipo","score_demo","origem_a","endereco_a","telefone_a","origem_b","endereco_b","telefone_b","status","decisao_simulada"];
 const data=state.items.map(x=>[x.id,x.name,x.kind,x.score??"",x.a?.ref,x.a?.address,x.a?.phone,x.b?.ref,x.b?.address,x.b?.phone,x.status,x.decisionLabel??""]);
 const csv="\uFEFF"+[head,...data].map(line=>line.map(csvEsc).join(";")).join("\r\n")+"\r\n";
 download("origem-unica-conciliacao-MOCK.csv",csv,"text/csv;charset=utf-8");toast("CSV fictício exportado.");
}
function exportAudit(){
 const head=["horario","evento","detalhes"];
 const csv="\uFEFF"+[head,...state.logs.map(x=>[x.at??"SEED",x.message,x.details])].map(x=>x.map(csvEsc).join(";")).join("\r\n")+"\r\n";
 download("origem-unica-auditoria-MOCK.csv",csv,"text/csv;charset=utf-8");toast("Histórico local exportado.");
}
for(const n of document.querySelectorAll("[data-view]"))n.addEventListener("click",()=>viewPage(n.dataset.view));
for(const n of document.querySelectorAll("[data-go]"))n.addEventListener("click",()=>viewPage(n.dataset.go));
$("start-review").addEventListener("click",()=>viewPage("matching"));
$("search").addEventListener("input",e=>{state.search=e.target.value;renderRecords()});
$("filter").addEventListener("change",e=>{state.filter=e.target.value;renderRecords()});
$("export").addEventListener("click",exportCsv);$("audit-export").addEventListener("click",exportAudit);
$("sync").addEventListener("click",()=>{audit("Sincronização simulada","Duas fontes fictícias carregadas; nenhuma requisição de rede foi feita.");toast("Conectores demonstrativos sincronizados (mock).");});
$("reset").addEventListener("click",()=>{if(!confirm("Reiniciar o cenário fictício e apagar as revisões locais?"))return;state.items=clone(seed);state.logs=[{id:"audit-reset",at:new Date().toLocaleString("pt-BR"),message:"Cenário fictício reiniciado.",details:"Nenhuma fonte pública foi modificada."}];state.selected="OU-001";state.search="";state.filter="all";$("search").value="";$("filter").value="all";persist();refresh();viewPage("overview");toast("Simulação reiniciada.");});
refresh();viewPage("overview");
