import {UNKNOWN,REQUIREMENTS,normalizeHousing,selectHousing,defaultHousingFilters,housingView,explainRequirement,safeUrl} from "./habitacao-model.mjs";
import {HOUSING_DEMO} from "./habitacao-demo.mjs";
import {fetchOfficialHousing} from "./habitacao-official.mjs";
const $=id=>document.getElementById(id);
const ENTERPRISE_PREVIEW_LIMIT=10;
const filterKeys=Object.keys(defaultHousingFilters("4113700"));
const placeholder=()=>({code:"4113700",name:"Londrina",uf:"PR",snhis:{status:UNKNOWN,source:null,url:null,referenceDate:null,freshness:"unverified"},requirements:Object.fromEntries(REQUIREMENTS.map(x=>[x.id,{status:UNKNOWN,source:null,url:null,referenceDate:null,fetchedAt:null,freshness:"unverified",dataOrigin:null}])),enterprises:[],updatedAt:null,placeholder:true});
const state={data:{mode:null,generatedAt:null,municipalities:[placeholder()]},kind:"loading",demo:false,realData:null,realKind:"loading",selectedRequirement:"fundo",checked:new Set(),showAllEnterprises:false,focusRequirement:null,filters:defaultHousingFilters("4113700")};
const statusClass=status=>status==="CONFIRMADO"?"confirmed":status==="PENDENTE"?"pending":"";
const formatDate=value=>value?new Date(value).toLocaleDateString("pt-BR",{timeZone:"UTC"}):"Não informada";
const asText=(tag,text,className)=>{const node=document.createElement(tag);node.textContent=text??"—";if(className)node.className=className;return node};
function link(href,label){const a=asText("a",label);a.href=safeUrl(href)||"#fontes";if(safeUrl(href)){a.target="_blank";a.rel="noopener noreferrer"}return a}
function option(value,label){const o=document.createElement("option");o.value=value;o.textContent=label;return o}
function apiEndpoint(){const params=new URLSearchParams(location.search);const selected=params.get("api")||window.ORIGEM_UNICA_API_BASE||"https://origem-unica-api.onrender.com/";const base=new URL(selected,location.href);const local=["localhost","127.0.0.1"].includes(base.hostname);if((base.protocol!=="https:"&&!(local&&base.protocol==="http:"))||base.username||base.password)throw new Error("URL habitacional inválida");return base.origin+"/";}
function setOptions(){const municipalities=state.data.municipalities;$("municipality").replaceChildren(...municipalities.map(m=>option(m.code,m.name+(m.uf?" · "+m.uf:""))));if(!municipalities.some(m=>m.code===state.filters.municipality))state.filters.municipality=municipalities[0]?.code||"4113700";$("municipality").value=state.filters.municipality;
 const selectedMunicipality=municipalities.find(m=>m.code===state.filters.municipality);const sources=new Set([selectedMunicipality?.snhis?.source,...REQUIREMENTS.map(r=>selectedMunicipality?.requirements[r.id]?.source),...(selectedMunicipality?.enterprises||[]).map(e=>e.source)].filter(Boolean));$("source").replaceChildren(option("all","Todas as fontes"),...[...sources].sort().map(x=>option(x,x)));if(state.filters.source!=="all"&&!sources.has(state.filters.source))state.filters.source="all";$("source").value=state.filters.source;
 const enterprises=selectedMunicipality?.enterprises||[];$("enterprise").replaceChildren(option("all","Todos os empreendimentos"),...enterprises.map(e=>option(e.id||e.name,e.name)));if(state.filters.enterprise!=="all"&&!enterprises.some(e=>(e.id||e.name)===state.filters.enterprise))state.filters.enterprise="all";$("enterprise").value=state.filters.enterprise;
}
function renderState(){const messages={loading:"Carregando fontes…",success:"Snapshot oficial",partial:"Parcialmente disponível",unavailable:"API indisponível", "no-data":"Sem dados municipais"};const notices={loading:"Consultando o backend habitacional. Até receber evidência, a situação de Londrina permanece não verificada.",success:"Registros carregados. Confira fonte e data antes de usar qualquer status em decisão administrativa.",partial:"Parte das evidências está ausente ou sem status verificável. Os campos restantes permanecem NÃO VERIFICADOS.",unavailable:"A API habitacional não respondeu. Nenhuma situação municipal foi presumida; use a consulta oficial do SNHIS.","no-data":"A API não trouxe municípios compatíveis. Sem registro não significa município irregular."};$("sync-pill").className="sync-pill "+state.kind;$("sync-pill").textContent=state.demo?"EXEMPLO SINTÉTICO · MOCK":messages[state.kind]+(state.data.mode&&state.kind!=="success"?" · "+state.data.mode:"");$("notice").className="notice "+(state.kind==="unavailable"?"unavailable":"");$("notice").textContent=state.demo?"Cenário 100% fictício em Município Exemplo. Situação, documentos, empreendimento e 42 unidades são inventados para demonstrar filtros e conferência. Londrina não foi classificada.":notices[state.kind]+(state.data.mode==="MOCK"?" Modo MOCK: confira a proveniência de cada item; fontes reais e sintéticas podem coexistir.":"");$("demo-toggle").textContent=state.demo?"Voltar à consulta de Londrina":"Explorar exemplo sintético"}
function renderSummary(selected){const m=selected.municipality,s=selected.snhis;$("municipality-name").textContent=(m?.name||"Londrina").toLocaleUpperCase("pt-BR");$("status-value").textContent=(s?.dataOrigin?.startsWith("MOCK:")?"SIMULADO · ":"")+(s?.status||UNKNOWN);$("status-detail").textContent=s?.dataOrigin?.startsWith("MOCK:")?"Situação fictícia do exemplo; não indica a regularidade de nenhum município real.":s?.status==="CONFIRMADO"?"Situação informada pela fonte declarada. Confirme no sistema oficial.":s?.status==="PENDENTE"?"Pendência informada pela fonte declarada. Solicite análise oficial.":"Sem comprovação carregada para classificar este município.";
 $("status-origin").textContent=s?.url?"Snapshot oficial · "+(s.source||"não identificada")+" · referência "+formatDate(s.referenceDate)+(s.dataOrigin?.startsWith("MOCK")?" · SINTÉTICO":""):s?.dataOrigin?.startsWith("MOCK:")?"Origem: "+s.dataOrigin:"Origem da situação: não disponível";
 const verified=selected.requirements.filter(x=>x.status!==UNKNOWN).length;$("requirements-count").textContent=m?verified+" / "+selected.requirements.length+(state.data.mode==="MOCK"?" · MOCK":""):"—";
 const total=selected.enterprises.length;$("enterprise-count").textContent=total?String(total)+(state.data.mode==="MOCK"?" · MOCK":""):"—";$("enterprise-detail").textContent=total?(state.demo?"Registros fictícios do exemplo.":"Registros da fonte para o município."):"Sem dados oficiais compatíveis carregados.";
 const units=selected.enterprises.map(x=>x.units);$("units-count").textContent=total&&units.every(Number.isInteger)?"Unidades habitacionais: "+units.reduce((a,b)=>a+b,0):"Unidades habitacionais: não informado";
}
function renderRequirements(selected){const root=$("requirement-cards"),restoreFocus=state.focusRequirement;state.focusRequirement=null;root.replaceChildren();for(const item of selected.requirements){const card=document.createElement("button");card.type="button";card.className="requirement-card"+(state.selectedRequirement===item.id?" selected":"");card.setAttribute("aria-pressed",String(state.selectedRequirement===item.id));card.setAttribute("aria-controls","evidence");const head=asText("div",null,"requirement-card-head");head.textContent="";head.append(asText("span",String(REQUIREMENTS.findIndex(r=>r.id===item.id)+1).padStart(2,"0"),"number"),asText("span",(item.dataOrigin?.startsWith("MOCK")?"SIMULADO · ":"")+item.status,"status-tag "+statusClass(item.status)));card.append(head,asText("h3",item.name),asText("p",item.why));const end=asText("div",null,"card-end");end.textContent="";end.append(asText("span",item.source||"Fonte municipal não informada"),asText("span","Ver evidências ↗"));card.append(end);card.addEventListener("click",()=>{state.selectedRequirement=item.id;state.focusRequirement=item.id;render()});root.append(card);if(restoreFocus===item.id)card.focus({preventScroll:true})}if(!selected.requirements.length)root.append(asText("p","Nenhum requisito corresponde aos filtros. Isso não altera a situação oficial do município.","empty"))}
function renderEvidence(selected){const item=selected.requirements.find(x=>x.id===state.selectedRequirement);const root=$("evidence");root.replaceChildren();root.append(asText("span","PAINEL DE EVIDÊNCIAS","section-kicker"));if(!item){root.append(asText("h3","Nenhum requisito selecionado"),asText("p","Ajuste os filtros para examinar a evidência."));return}
 root.append(asText("h3",item.name),asText("p",item.why));const dl=document.createElement("dl");for(const [key,value] of [["Status consultado",(item.dataOrigin?.startsWith("MOCK")?"SIMULADO · ":"")+item.status],["Fonte da situação",item.source||"Não informada"],["Data de referência",formatDate(item.referenceDate)],["Atualidade",{updated:"Atualizado",stale:"Desatualizado",unverified:"Não verificado"}[item.freshness]],["Responsável institucional",item.owner],["Proveniência",item.dataOrigin||(item.url&&(item.referenceDate||item.fetchedAt)?"Snapshot oficial":"Sem evidência disponível")]])dl.append(asText("dt",key),asText("dd",value));root.append(dl,asText("p",explainRequirement(item),"explanation"));const links=asText("div",null);links.textContent="";links.append(link(item.official,"Por que é exigido? Fonte oficial ↗"));if(item.url)links.append(document.createTextNode(" · "),link(item.url,"Abrir evidência declarada ↗"));root.append(links);
 const checklist=asText("div",null,"checklist");checklist.textContent="";checklist.append(asText("strong","Checklist de conferência (somente nesta página)"));for(const [index,labelText] of ["Abrir o registro oficial do município no SNHIS","Conferir documento, data e identificação do instrumento","Confirmar o resultado com a área municipal e, se necessário, com a CEFUS/CAIXA"].entries()){const label=document.createElement("label"),input=document.createElement("input");input.type="checkbox";const key=item.id+":"+index;input.checked=state.checked.has(key);input.addEventListener("change",()=>input.checked?state.checked.add(key):state.checked.delete(key));label.append(input,document.createTextNode(labelText));checklist.append(label)}root.append(checklist);
}
function renderNext(selected){const statuses=selected.requirements.map(x=>x.status);const list=$("next-steps");list.replaceChildren();const steps=[];if(state.demo)steps.push("Este é um fluxo fictício. Abra a consulta oficial para verificar um município real.");else if(!selected.snhis||selected.snhis.status===UNKNOWN)steps.push("Consultar a regularidade do município no sistema oficial do SNHIS; o painel não tem confirmação.");if(statuses.includes(UNKNOWN))steps.push("Obter fonte, data e documento dos instrumentos ainda não verificados.");if(!state.demo&&(statuses.includes("PENDENTE")||selected.snhis?.status==="PENDENTE"))steps.push("Confirmar a pendência oficial e a documentação necessária com a CEFUS/CAIXA.");steps.push("Registrar a conferência humana; não alterar cadastro ou concluir regularidade com base apenas neste painel.");for(const value of steps)list.append(asText("li",value))}
function renderEnterprises(selected, filtered) {
 const rows=$("enterprise-rows"), total=selected.enterprises.length;
 const visible=state.showAllEnterprises?selected.enterprises:selected.enterprises.slice(0,ENTERPRISE_PREVIEW_LIMIT);
 const toggle=$("toggle-enterprises");
 toggle.hidden=total<=ENTERPRISE_PREVIEW_LIMIT;
 toggle.setAttribute("aria-expanded",String(!toggle.hidden&&state.showAllEnterprises));
 toggle.textContent=state.showAllEnterprises?"Mostrar menos registros":"Mostrar todos os registros";
 $("enterprise-results").textContent=total?
  (visible.length===total?String(total):"Mostrando "+visible.length+" de "+total)+" "+
  (total===1?"registro":"registros")+(state.demo?" do exemplo sintético.":filtered?" da fonte na seleção.":" da fonte."): "";
 $("enterprise-empty").textContent=filtered?"Nenhum registro MCMV corresponde aos filtros selecionados.":"Nenhum registro MCMV foi carregado para este município.";
 rows.replaceChildren();
 for(const item of visible){const tr=document.createElement("tr");for(const value of [item.name,selected.municipality.name+(selected.municipality.uf?" · "+selected.municipality.uf:""),item.units??"Não informado",item.status||"Não informado"]){tr.append(asText("td",value))}const source=asText("td",null);source.textContent="";source.append(item.url?link(item.url,(item.source||"Fonte declarada")+" ↗"):asText("span",item.source||"Cenário sintético"),asText("span"," · "+formatDate(item.referenceDate)+(item.dataOrigin?.startsWith("MOCK")?" · SINTÉTICO / MOCK":""),"subtle"));tr.append(source);rows.append(tr)}$("enterprise-table-wrap").hidden=!selected.enterprises.length;$("enterprise-empty").hidden=!!selected.enterprises.length}
function renderSources(selected){const refs=[selected.snhis,...selected.requirements,...selected.enterprises].filter(x=>x?.url||x?.dataOrigin?.startsWith("MOCK:"));$("loaded-sources").textContent=refs.length?[...new Set(refs.map(x=>(x.source||x.url||"Sem fonte")+(x.dataOrigin?.startsWith("MOCK")?" (SINTÉTICO)":"")))].join(" · ")+(state.demo?" · exemplo local":" · proveniência declarada pela API"):"Nenhuma fonte municipal verificada foi carregada.";const dates=refs.map(x=>x.referenceDate||x.fetchedAt).filter(Boolean).sort();$("updated-at").textContent="Última referência declarada: "+formatDate(dates.at(-1)||state.data.generatedAt)}
function render() {
 setOptions();
 renderState();
 $("analysis-panel").hidden=state.demo||state.kind!=="success";
 const {panorama,results,filtered}=housingView(state.data,state.filters);
 $("clear-filters").disabled=!filtered;
 const hasResults=results.requirements.length>0||results.enterprises.length>0;
 $("filter-feedback").textContent=filtered?(hasResults?
  "Filtros aplicados à listagem e ao CSV. O panorama mantém os dados do município.":
  "Nenhum resultado corresponde aos filtros selecionados."):"";
 if (results.requirements.length && !results.requirements.some(item=>item.id===state.selectedRequirement)) {
  state.selectedRequirement=results.requirements[0].id;
 }
 renderSummary(panorama);
 renderRequirements(results);
 renderEvidence(results);
 renderNext(panorama);
 renderEnterprises(results,filtered);
 renderSources(panorama);
}
function applyReal(data,kind){state.realData=data;state.realKind=kind;if(!state.demo){state.data=data;state.kind=kind;render()}}
async function load(){if(!state.demo){state.kind="loading";render()}const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),75000);try{const {data,partial}=await fetchOfficialHousing(apiEndpoint(),fetch,controller.signal);const municipality=data.municipalities.find(x=>x.code==="4113700");const combined={...data,municipalities:[municipality||placeholder(),...data.municipalities.filter(x=>x.code!=="4113700")]};const all=data.municipalities.flatMap(x=>[x.snhis,...Object.values(x.requirements)]);applyReal(combined,!data.municipalities.length?"no-data":partial||all.some(x=>x.status===UNKNOWN)?"partial":"success")}catch(error){applyReal({mode:null,generatedAt:null,municipalities:[placeholder()]},"unavailable");if(!state.demo)$("notice").textContent+=" Detalhe técnico: "+(error.name==="AbortError"?"tempo esgotado":error.message)}finally{clearTimeout(timeout)}}
function resetFilters(municipality) {
 state.filters=defaultHousingFilters(municipality);
 state.selectedRequirement="fundo";
 state.showAllEnterprises=false;
 for(const key of ["situation","requirement","freshness"]) $(key).value=state.filters[key];
}
function toggleDemo() {
 state.demo=!state.demo;
 state.checked.clear();
 resetFilters(state.demo?"DEMO-001":"4113700");
 if(state.demo){
  state.data=normalizeHousing(HOUSING_DEMO);
  state.kind="partial";
 }else{
  state.data=state.realData||{mode:null,generatedAt:null,municipalities:[placeholder()]};
  state.kind=state.realKind;
 }
 render();
}
function exportCsv(){const selected=selectHousing(state.data,state.filters);const m=selected.municipality;const lines=[["tipo","municipio","codigo_ibge","instrumento_ou_empreendimento","status","unidades","fonte","data_referencia","url_fonte","origem_dado","modo_api"],...selected.requirements.map(x=>["SNHIS",m.name,m.code,x.name,x.status,"",x.source,x.referenceDate,x.url,x.dataOrigin,state.data.mode||"NÃO VERIFICADO"]),...selected.enterprises.map(x=>["MCMV",m.name,m.code,x.name,x.status||"NÃO INFORMADO",x.units,x.source,x.referenceDate,x.url,x.dataOrigin,state.data.mode||"NÃO VERIFICADO"])];const csv="\uFEFF"+lines.map(row=>row.map(v=>'"'+String(v??"").replaceAll('"','""')+'"').join(";")).join("\r\n")+"\r\n";const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="origem-unica-habitacao-"+(m?.code||"sem-dados")+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
for(const key of filterKeys) $(key).addEventListener("change",event=>{
 state.filters[key]=event.target.value;
 state.showAllEnterprises=false;
 if(key==="requirement"&&state.filters.requirement!=="all") state.selectedRequirement=state.filters.requirement;
 render();
});
$("clear-filters").addEventListener("click",()=>{resetFilters(state.filters.municipality);render()});
$("toggle-enterprises").addEventListener("click",()=>{state.showAllEnterprises=!state.showAllEnterprises;render()});
$("demo-toggle").addEventListener("click",toggleDemo);
$("export").addEventListener("click",exportCsv);
render();
load();
