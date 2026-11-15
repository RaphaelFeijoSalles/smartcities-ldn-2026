/* Origem Única — API read-only with an explicitly labelled synthetic fallback. */
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
for(const item of seed){
 item.origin="MOCK";
 for(const [key,label] of [["a","SIGLON (referência simulada)"],["b","CNES (referência simulada)"]])if(item[key]){
  item[key].source=label;item[key].provenance="MOCK · registro sintético local";
 }
}
const $=id=>document.getElementById(id);
const clone=o=>JSON.parse(JSON.stringify(o));
const labels={conflict:"Conflito",match:"Correspondência",missing:"Sem par",possible:"Possível vínculo"};
const statusLabels={pending:"Pendente",reviewed:"Revisado",matched:"Sugerido"};
let state={items:clone(seed),baseItems:clone(seed),sources:{},mode:"MOCK",dataMode:"MOCK",sync:"Aguardando API",logs:[{id:"audit-initial",at:null,message:"Seis registros sintéticos carregados para o cenário de UBS.",details:"Dados inventados; aguardando tentativa de conexão com a API."}],selected:"OU-001",search:"",filter:"all",view:"overview"};
let timer=null;
let lastSync=null;
const normalizeQuery=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();

function reviewSignature(item) {
 const snapshotSource=source=>{
  if(!source)return null;
  const {fetchedAt,raw,...values}=source;
  const {fetched_at,...original}=raw??{};
  return [values,original];
 };
 return JSON.stringify([snapshotSource(item.a),snapshotSource(item.b),item.kind,item.comparisonStatus,item.score,item.fields]);
}
try{
  const saved=JSON.parse(localStorage.getItem(STORE)||"null");
  if(saved&&Array.isArray(saved.items)&&saved.items.length===seed.length&&saved.items.every((r,i)=>r.id===seed[i].id)&&Array.isArray(saved.logs)){
    state.items=saved.items.map((item,index)=>({...seed[index],...item,a:item.a?{...seed[index].a,...item.a}:null,b:item.b?{...seed[index].b,...item.b}:null}));state.logs=saved.logs.slice(-50);
    if(seed.some(x=>x.id===saved.selected))state.selected=saved.selected;
  }
}catch{}
state.baseItems=clone(seed);
const safeText=(tag,value,cls)=>{const n=document.createElement(tag);n.textContent=String(value??"—");if(cls)n.className=cls;return n;};
function persist(){if(state.mode!=="MOCK")return;try{localStorage.setItem(STORE,JSON.stringify({items:state.items,logs:state.logs,selected:state.selected}));}catch{}}
function originType(value){
 if(state.mode==="MOCK"||/^MOCK:/i.test(value?.dataOrigin??""))return "MOCK";
 if(/^https?:\/\//i.test(value?.dataOrigin??""))return "FONTE PÚBLICA DECLARADA";
 return state.dataMode==="MOCK"?"MOCK · ORIGEM NÃO DETALHADA":"ORIGEM NÃO INFORMADA";
}
function hasMixedOrigins(){
 const sources=state.items.flatMap(item=>[item.a,item.b]).filter(Boolean);
 return sources.some(source=>/^MOCK:/i.test(source.dataOrigin??""))&&sources.some(source=>/^https?:\/\//i.test(source.dataOrigin??""));
}
function modeLabel(){
 if(state.mode==="MOCK")return "MOCK · DADOS SINTÉTICOS";
 if(["MOCK","DEMO_SYNTHETIC"].includes(state.dataMode))return hasMixedOrigins()?"API · MOCK · FONTES MISTAS":"API · MOCK · DADOS SINTÉTICOS";
 return "API · "+(state.dataMode==="UNSPECIFIED"?"MODO NÃO INFORMADO":state.dataMode)+" · origem declarada";
}
function renderSync(){
 const mode=$("data-mode");
 mode.textContent=modeLabel();
 mode.dataset.provenance=hasMixedOrigins()?"mixed":
  state.mode==="MOCK"||["MOCK","DEMO_SYNTHETIC"].includes(state.dataMode)?"mock":
   ["LIVE","SNAPSHOT"].includes(state.dataMode)?"declared":"unverified";
 const sync=$("sync-status");
 sync.textContent=state.sync;
 sync.parentElement.dataset.state=state.sync.includes("indisponível")?"warning":
  state.sync==="Consultando API…"?"loading":"ready";
 $("total-summary").textContent=state.mode==="MOCK"?"Dados sintéticos locais":hasMixedOrigins()?"Origens mistas declaradas":state.dataMode==="MOCK"||state.dataMode==="DEMO_SYNTHETIC"?"Dados sintéticos da API":"Dados recebidos da API";
 $("source-summary").textContent=state.mode==="MOCK"?"Fontes modeladas no cenário sintético":"Fontes declaradas pela API";
 $("overview-note").textContent=state.mode==="MOCK"?"Ocorrências do cenário sintético. Nenhuma inconsistência real foi identificada no SIGLON ou no CNES.":"Ocorrências retornadas pela API ("+state.dataMode+"). A proveniência é a declarada pelo serviço; nenhuma fonte foi validada por esta interface.";
 $("source-intro").textContent=state.mode==="MOCK"?"Recorte demonstrativo SIGLON Saúde × CNES com registros inventados. A dor relatada ao SIGLON envolve mais bancos, que não estão conectados aqui.":"Recorte SIGLON Saúde × CNES. Confira a origem declarada de cada fonte; os demais bancos citados na validação não estão conectados aqui.";
 $("source-notice").textContent="A sincronização consulta somente GET /api/records. As revisões ficam nesta página e não alteram bases oficiais.";
 $("content-footer").textContent="DEMONSTRAÇÃO CONCEITUAL · "+modeLabel()+" · Revisões somente locais; nenhuma base oficial é alterada.";
 $("sync").disabled=state.sync==="Consultando API…";
}
function apiUrl(){
 const base=new URLSearchParams(location.search).get("api")||window.ORIGEM_UNICA_API_BASE;
 if(!base)return "/api/records";
 const url=new URL(base,location.href);
 if(!["http:","https:"].includes(url.protocol))throw new Error("URL da API inválida");
 if(url.pathname.endsWith("/api/records"))return url.href;
 return new URL("api/records",url.href.endsWith("/")?url.href:url.href+"/").href;
}
async function syncRecords(){
 if($("sync").disabled)return;
 state.sync="Consultando API…";renderSync();
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),75000);
 try{
  const response=await fetch(apiUrl(),{signal:controller.signal,headers:{Accept:"application/json"}});
  if(!response.ok)throw new Error("HTTP "+response.status);
  const normalized=OrigemAdapter.normalizePayload(await response.json());
  const reviews=new Map(state.mode==="API"?state.items.filter(x=>x.status==="reviewed").map(x=>[x.id,{signature:reviewSignature(x),decisionLabel:x.decisionLabel,previewAddressSource:x.previewAddressSource}]):[]);
  state.baseItems=normalized.items;state.items=clone(normalized.items);state.sources=normalized.sources;
  for(const item of state.items){const saved=reviews.get(item.id);if(saved?.signature===reviewSignature(item)){item.status="reviewed";item.decisionLabel=saved.decisionLabel;item.previewAddressSource=saved.previewAddressSource}}
  state.mode="API";state.dataMode=normalized.mode;state.selected=state.items.some(x=>x.id===state.selected)?state.selected:state.items[0]?.id;
  lastSync=new Date().toLocaleTimeString("pt-BR");
  state.sync="API sincronizada às "+lastSync;
  audit("API consultada","GET /api/records · "+state.items.length+" registro(s) · modo "+state.dataMode+". Proveniência declarada pelo serviço.");
  toast("Dados da API carregados.");
 }catch(error){
  const reason=error.name==="AbortError"?"tempo esgotado":error instanceof TypeError?"falha de conexão":error.message;
  if(state.mode==="API"){
   state.sync="Atualização indisponível ("+reason+"). Mantendo dados da API carregados às "+lastSync+".";
   audit("Atualização indisponível","Dados anteriores da API e revisões preservados nesta página.");
   toast("Atualização indisponível. Dados e revisões preservados.");
  }else{
   state.sync="API indisponível ("+reason+") · fallback MOCK";
   audit("Fallback MOCK ativado","API indisponível. Cenário sintético local mantido.");
   toast("API indisponível. Exibindo dados MOCK.");
  }
 }finally{clearTimeout(timeout);renderSync();refresh()}
}
function audit(message,details){state.logs.unshift({id:"a-"+Date.now()+"-"+Math.random().toString(36).slice(2,5),at:new Date().toLocaleString("pt-BR"),message,details});state.logs=state.logs.slice(0,50);persist();renderAudit();}
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("visible");clearTimeout(timer);timer=setTimeout(()=>t.classList.remove("visible"),3500)}
function viewPage(name,moveFocus=true){if(!["overview","sources","matching","audit","impact"].includes(name))return;state.view=name;
 for(const el of document.querySelectorAll(".view"))el.classList.toggle("active",el.id==="view-"+name);
 for(const el of document.querySelectorAll("[data-view]")){const active=el.dataset.view===name;el.classList.toggle("active",active);if(active)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");}
 $("current-page").textContent={overview:"Visão geral",sources:"Fontes de dados",matching:"Conciliação",audit:"Auditoria",impact:"Valor público"}[name];
 window.scrollTo({top:0,behavior:"auto"});
 if(moveFocus)$("main").focus({preventScroll:true});
}
function kindClass(item){return item.status==="reviewed"?"reviewed":item.kind==="conflict"?"warning":""}
function kindLabel(item){return item.status==="reviewed"?"Revisado":labels[item.kind]}
function stats(){
 $("stat-total").textContent=state.items.length;
 const pending=state.items.filter(x=>x.status==="pending").length;
 $("stat-pending").textContent=pending;
 $("stat-reviewed").textContent=state.items.filter(x=>x.status==="reviewed").length;
 $("stat-sources").textContent=new Set(state.items.flatMap(x=>[x.a?.source,x.b?.source].filter(Boolean))).size;
 $("nav-pending").textContent=pending;
 const counts=[["Conflitos de cadastro",state.items.filter(x=>x.kind==="conflict").length,""],["Possíveis vínculos",state.items.filter(x=>x.kind==="possible").length,"amber"],["Sem par na outra fonte",state.items.filter(x=>x.kind==="missing").length,"blue"]];
 $("conflict-chart").replaceChildren();
 for(const [label,count,tint] of counts){
  const row=safeText("div",undefined,"chart-item");row.textContent="";
  const bar=safeText("div",undefined,"track");bar.textContent="";
  const fill=safeText("div",undefined,"fill "+tint);fill.textContent="";fill.style.width=(count?Math.max(5,count/Math.max(1,state.items.length)*100):0)+"%";bar.append(fill);
  row.append(safeText("span",label),bar,safeText("b",count));$("conflict-chart").append(row);
 }
}
function renderSources(){
 const root=$("source-grid");root.replaceChildren();
 const names=[...new Set(state.items.flatMap(item=>[item.a?.source,item.b?.source].filter(Boolean)))];
 if(!names.length){root.append(safeText("p","Nenhuma fonte declarada pela API.","panel-note"));return;}
 for(const name of names){
  const records=state.items.flatMap(item=>[item.a,item.b]).filter(value=>value?.source===name);
  const card=safeText("article",undefined,"source-card");card.textContent="";
  const top=safeText("div",undefined,"source-top");top.textContent="";
  const origin=originType(records[0]);
  top.append(safeText("span",name[0]??"?","source-icon"),safeText("span",origin,"pill "+(origin.startsWith("MOCK")?"warning":"good")));
  card.append(top,safeText("h2",name),safeText("p",state.mode==="MOCK"?"Referência de fonte no cenário sintético local.":"Nome e proveniência declarados pelo serviço de conciliação."));
  const summary=safeText("div",undefined,"source-stats");summary.textContent="";
  summary.append(safeText("span",records.length+" registro(s) exibido(s)"),safeText("b",state.mode));card.append(summary);
  const provenance=[...new Set(records.map(record=>record.provenance).filter(Boolean))];
  card.append(safeText("small","Proveniência: "+(provenance.slice(0,2).join(" · ")||"não informada"),"source-provenance"));
  root.append(card);
 }
}
function filtered(){
 const q=normalizeQuery(state.search);
 return state.items.filter(x=>{
   const text=[x.name,x.id,x.a?.address,x.b?.address,x.a?.source,x.b?.source,x.fields.join(" ")].join(" ");
   return(!q||normalizeQuery(text).includes(q))&&(state.filter==="all"||(state.filter==="pending"&&x.status==="pending")||(state.filter==="reviewed"&&x.status==="reviewed")||x.kind===state.filter);
 });
}
function renderRecords(){
 const rows=filtered(),root=$("records");root.replaceChildren();
 if(!rows.some(item=>item.id===state.selected))state.selected=rows[0]?.id??null;
 $("export").disabled=!rows.length;
 $("clear-review-filters").disabled=!state.search&&state.filter==="all";
 $("list-count").textContent=rows.length+" registro(s) · "+state.mode;
 if(!rows.length){root.append(safeText("p","Nenhum cadastro com estes filtros.","panel-note"));return;}
 for(const item of rows){
  const node=safeText("button",undefined,"record"+(state.selected===item.id?" active":""));node.textContent="";node.type="button";
  node.setAttribute("aria-pressed",String(state.selected===item.id));
  node.setAttribute("aria-controls","details");
  const left=safeText("span",undefined);left.textContent="";
  left.append(safeText("b",item.name),safeText("small",item.id+" · "+(item.score===null?"sem score":Math.round(item.score*100)+"% de score sugerido")+" · "+state.mode));
  node.append(left,safeText("span",kindLabel(item),"pill "+kindClass(item)));
  node.addEventListener("click",()=>{state.selected=item.id;persist();renderRecords();renderDetail();$("details").focus();});
  root.append(node);
 }
}
function fieldCompare(item,side){
 const root=safeText("div",undefined,"compare-col");root.textContent="";
 const header=safeText("div",undefined,"compare-header");header.textContent="";root.append(header);
 const values=item[side];
 header.replaceChildren(safeText("b",values?.source??(side==="a"?"Fonte A":"Fonte B")),safeText("span",values?originType(values):"SEM REGISTRO"));
 const body=safeText("div",undefined,"compare-body");body.textContent="";
 for(const [key,label] of [["name","Estabelecimento"],["address","Endereço"],["phone","Telefone"],["ref","Identificador"],["updated","Atualização"],["fetchedAt","Coleta"],["provenance","URL / proveniência declarada"]]){
   const conflictKeys={name:["name","nome","estabelecimento"],address:["address","endereco","logradouro","numero","número"],phone:["phone","telefone"],ref:["id","ref","identificador"]};
   const conflict=conflictKeys[key]?.some(candidate=>item.fields.some(field=>field.toLocaleLowerCase("pt-BR").includes(candidate)));
   const line=safeText("div",undefined,"compare-field"+(!values?" absent":conflict?" conflict":""));line.textContent="";
   line.append(safeText("small",label),safeText("b",values?(values[key]||"Não informado"):"Registro não presente"));body.append(line);
 }
 root.append(body);return root;
}
function appendApiPreview(root,item){
 const chosen=item.status==="reviewed"&&item.previewAddressSource?item[item.previewAddressSource]:null;
 const candidates=[item.a,item.b].filter(Boolean).map(source=>({
  system:source.source,
  source_id:source.ref,
  address:source.address||null,
  fetched_at:source.fetchedAt??null,
  data_origin:source.dataOrigin|| (state.mode==="MOCK"?"MOCK: cenário sintético local":null)
 }));
 const preview={
  preview_only:true,
  mode:state.dataMode,
  record:{
   id:item.id,name:item.name,
   comparison_status:item.comparisonStatus||({conflict:"CONFLICT",match:"MATCH",missing:"ONLY_IN_A",possible:"POSSIBLE_MATCH"}[item.kind]),
   score:item.score,
   conflicts:item.raw?.conflicts??item.fields,
   address_candidates:candidates,
   consolidated_address:chosen?.address||null,
   review_local:item.status==="reviewed"?{simulated:true,decision:item.decisionLabel??null,selected_source:chosen?{system:chosen.source,source_id:chosen.ref}:null}:null
  }
 };
 const details=safeText("details",undefined,"api-preview");details.textContent="";
 details.append(safeText("summary","Ver prévia JSON do registro para API"),safeText("p","Modelo local de uma resposta futura. Um endereço escolhido aparece somente nesta prévia simulada; nenhum endpoint de publicação ou escrita foi criado."),safeText("pre",JSON.stringify(preview,null,2)));
 root.append(details);
}
function renderDetail(){
 const item=state.items.find(x=>x.id===state.selected),root=$("details");root.replaceChildren();if(!item){root.append(safeText("p","Nenhum registro disponível para comparação nesta seleção."));return;}
 const title=safeText("div",undefined,"detail-title");title.textContent="";
 const left=safeText("div",undefined);left.textContent="";left.append(safeText("div",state.mode+" · REGISTRO "+item.id,"section-kicker"),safeText("h2",item.name),safeText("p",modeLabel()+" · nenhuma base oficial foi alterada"));
 title.append(left,safeText("span",item.status==="reviewed"?"Revisado":statusLabels[item.status],"pill "+(item.status==="reviewed"?"reviewed":item.status==="pending"?"warning":"good")));root.append(title);
 const compare=safeText("div",undefined,"compare");compare.textContent="";compare.append(fieldCompare(item,"a"),fieldCompare(item,"b"));root.append(compare);
 const verdict=safeText("div",undefined,"verdict"+(item.status==="matched"||item.status==="reviewed"?" good":""));verdict.textContent="";
 const explanation=item.kind==="match"?"Os formatos parecem representar o mesmo registro; isso não valida a origem.":"Existem campos divergentes ou um cadastro sem par. Um humano precisa confirmar a correspondência e definir o encaminhamento.";
 verdict.append(safeText("b",item.status==="reviewed"?"Decisão de simulação registrada":item.kind==="match"?"Correspondência sugerida":item.kind==="missing"?"Registro sem par":"Conferência recomendada"),safeText("p",explanation));
 if(item.fields.length){
  const fieldNames={address:"Endereço",phone:"Telefone",name:"Nome",coordinates:"Coordenadas"};
  verdict.append(safeText("p","Campos sinalizados: "+item.fields.map(field=>fieldNames[field]||field).join(", ")));
 }
 if(item.comparisonStatus)verdict.append(safeText("p","Estado informado pela API: "+item.comparisonStatus));
 root.append(verdict);
 if(item.status==="matched"){root.append(safeText("p","Correspondência sugerida; não equivale a validação oficial.","review-note"));appendApiPreview(root,item);return;}
 if(item.status==="reviewed"){
  root.append(safeText("p","Decisão registrada: "+(item.decisionLabel||"Conferência")+". A origem permanece intacta.","review-note"));
  const reopen=safeText("button","↺ Reabrir para análise","button outline");reopen.type="button";reopen.addEventListener("click",()=>{item.status="pending";delete item.decisionLabel;delete item.previewAddressSource;audit("Pendência reaberta: "+item.id,"Revisão local reiniciada.");refresh();if(state.selected===item.id)$("details").focus();else $("filter").focus();toast("Registro reaberto.");});root.append(reopen);appendApiPreview(root,item);return;
 }
 const label=safeText("label","Escolha uma ação de revisão (simulada)","choice-label");
 const select=document.createElement("select");select.className="choice-select";select.id="decision-"+item.id;
 label.htmlFor=select.id;
 const choices=[["","Selecione uma ação"]];
 if(item.a?.address)choices.push(["PREVIEW_A","Usar endereço da "+item.a.source+" só na prévia"]);
 if(item.b?.address)choices.push(["PREVIEW_B","Usar endereço da "+item.b.source+" só na prévia"]);
 choices.push(["VERIFY_A","Conferir dados da "+(item.a?.source??"fonte A")],["VERIFY_B","Conferir dados da "+(item.b?.source??"fonte B")],["MATCH_LINK","Confirmar vínculo entre registros, sem corrigir fonte"],["NO_MATCH","Declarar que não são o mesmo estabelecimento"],["MANUAL","Encaminhar para conferência do órgão responsável"]);
 for(const [value,label] of choices)select.add(new Option(label,value));
 root.append(label,select);
 const actions=safeText("div",undefined,"review-actions");actions.textContent="";
 const approve=safeText("button","✓ Registrar decisão","button primary");approve.type="button";approve.disabled=true;
 select.addEventListener("change",()=>{approve.disabled=!select.value;});
 approve.addEventListener("click",()=>{if(!select.value)return;item.status="reviewed";item.decisionLabel=select.options[select.selectedIndex].text;item.previewAddressSource=select.value==="PREVIEW_A"?"a":select.value==="PREVIEW_B"?"b":null;audit("Revisão simulada: "+item.id,item.decisionLabel+" · nenhum dado oficial foi alterado.");refresh();if(state.selected===item.id)$("details").focus();else $("filter").focus();toast("Revisão local registrada.");});
 const pending=safeText("button","Manter pendente","button outline");pending.type="button";pending.addEventListener("click",()=>toast("Registro mantido para análise do responsável."));
 actions.append(approve,pending);root.append(actions);
 root.append(safeText("p","Uma correspondência sugerida não é uma correção oficial. Esta etapa representa somente uma decisão de teste.","review-note"));
 appendApiPreview(root,item);
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
function refresh(){stats();renderSources();renderRecords();renderDetail();renderAudit()}
function download(filename,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const csvEsc=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
function exportCsv(){
 const head=["modo","id","estabelecimento","comparison_status","tipo","score","conflicts","fonte_a","id_a","endereco_a","telefone_a","atualizacao_a","coleta_a","proveniencia_a","fonte_b","id_b","endereco_b","telefone_b","atualizacao_b","coleta_b","proveniencia_b","status_local","decisao_simulada","endereco_previa_local"];
 const selected=filtered();if(!selected.length)return;
 const data=selected.map(x=>[state.dataMode,x.id,x.name,x.comparisonStatus??"",x.kind,x.score??"",x.fields.join(" | "),x.a?.source,x.a?.ref,x.a?.address,x.a?.phone,x.a?.updated,x.a?.fetchedAt,x.a?.provenance,x.b?.source,x.b?.ref,x.b?.address,x.b?.phone,x.b?.updated,x.b?.fetchedAt,x.b?.provenance,x.status,x.decisionLabel??"",x.previewAddressSource?x[x.previewAddressSource]?.address:""]);
 const csv="\uFEFF"+[head,...data].map(line=>line.map(csvEsc).join(";")).join("\r\n")+"\r\n";
 download("origem-unica-conciliacao-"+state.mode+(state.mode==="API"?"-"+state.dataMode:"")+".csv",csv,"text/csv;charset=utf-8");toast("CSV "+modeLabel()+" exportado.");
}
function exportAudit(){
 const head=["horario","evento","detalhes"];
 const csv="\uFEFF"+[head,...state.logs.map(x=>[x.at??"SEED",x.message,x.details])].map(x=>x.map(csvEsc).join(";")).join("\r\n")+"\r\n";
 download("origem-unica-auditoria-local.csv",csv,"text/csv;charset=utf-8");toast("Histórico local exportado.");
}
for(const n of document.querySelectorAll("[data-view]"))n.addEventListener("click",()=>viewPage(n.dataset.view));
for(const n of document.querySelectorAll("[data-go]"))n.addEventListener("click",()=>viewPage(n.dataset.go));
$("start-review").addEventListener("click",()=>viewPage("matching"));
$("search").addEventListener("input",e=>{state.search=e.target.value;renderRecords();renderDetail()});
$("filter").addEventListener("change",e=>{state.filter=e.target.value;renderRecords();renderDetail()});
$("clear-review-filters").addEventListener("click",()=>{
 state.search=$("search").value="";
 state.filter=$("filter").value="all";
 renderRecords();renderDetail();$("search").focus();
});
$("export").addEventListener("click",exportCsv);$("audit-export").addEventListener("click",exportAudit);
$("sync").addEventListener("click",syncRecords);
$("reset").addEventListener("click",()=>{if(!confirm("Apagar as revisões locais desta simulação?"))return;state.items=clone(state.baseItems);state.logs=[{id:"audit-reset",at:new Date().toLocaleString("pt-BR"),message:"Revisões locais reiniciadas.",details:"Nenhuma fonte oficial foi modificada."}];state.selected=state.items[0]?.id;state.search="";state.filter="all";$("search").value="";$("filter").value="all";persist();refresh();viewPage("overview");toast("Simulação reiniciada.");});
refresh();renderSync();viewPage("overview",false);syncRecords();
