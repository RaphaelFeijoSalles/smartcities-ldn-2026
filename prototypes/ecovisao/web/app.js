"use strict";
// No third-party images or detections. All events are synthetic demonstration data.
const $=id=>document.getElementById(id);
let items=[], selectedId=null, map=null, markers=[];
const statusLabel={
  PENDING_REVIEW:"Pendente",
  CONFIRMED_FOR_INSPECTION:"Inspeção sugerida",
  REJECTED:"Descartada"
};
function el(tag,txt,cls=""){const n=document.createElement(tag);if(txt!==undefined)n.textContent=String(txt);if(cls)n.className=cls;return n;}
function showStatus(s){$("status").textContent=s;}
async function jsonFetch(url,options={}){
 const r=await fetch(url,options);
 if(!r.ok)throw Error("HTTP "+r.status+" ao consultar "+url);
 return r.json();
}
function renderMap(){
 if(!window.L){$("map-fallback").textContent="Mapa externo indisponível. A lista e as ações continuam acessíveis.";return;}
 if(!map){
   map=L.map("map").setView([-23.316,-51.17],12);
   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:18,attribution:"&copy; OpenStreetMap contributors"
   }).addTo(map);
   $("map-fallback").textContent="Pins sintéticos, apenas para demonstrar o fluxo.";
 }
 for(const marker of markers)marker.remove();
 markers=[];
 for(const item of items){
  const marker=L.circleMarker([item.latitude,item.longitude],{
    radius:9,weight:2,color:item.status==="REJECTED"?"#8b7272":"#125a49",
    fillColor:item.status==="PENDING_REVIEW"?"#e0ac54":"#4cb68c",fillOpacity:.9
  }).addTo(map);
  marker.bindTooltip("Ocorrência fictícia #"+item.id);
  marker.on("click",()=>{selectedId=item.id;renderList();renderDetail();});
  markers.push(marker);
 }
}
function renderList(){
 const root=$("occurrences");root.replaceChildren();
 $("count").textContent=items.length+" registros";
 items.forEach(item=>{
  const b=el("button",undefined,"occurrence"+(selectedId===item.id?" active":""));
  b.type="button";
  const left=el("span");
  left.append(el("b","#"+item.id+" · "+item.bairro));
  left.append(el("small",item.timestamp+" · Confiança de exemplo: "+Math.round(item.confianca*100)+"%"));
  const chip=el("span",statusLabel[item.status]||item.status,
    "chip "+(item.status==="PENDING_REVIEW"?"pending":item.status==="REJECTED"?"rejected":""));
  b.append(left,chip);b.addEventListener("click",()=>{selectedId=item.id;renderList();renderDetail();});
  root.append(b);
 });
}
function renderDetail(){
 const box=$("detail");box.replaceChildren();
 const item=items.find(x=>x.id===selectedId);
 if(!item){box.append(el("h3","Selecione uma ocorrência"),el("p","Nada aqui representa um descarte real."));return;}
 box.append(el("h3","Ocorrência demonstrativa #"+item.id));
 box.append(el("p","Origem: "+item.source_kind+" · GPS: "+item.location_source));
 box.append(el("p","Ponto ilustrativo: "+item.latitude.toFixed(4)+", "+item.longitude.toFixed(4)));
 box.append(el("p","Tipo: possível acúmulo de resíduos · Estado: "+(statusLabel[item.status]||item.status)));
 box.append(el("p","Imagem: não fornecida — fotografias jornalísticas não foram copiadas por falta de licença de reutilização."));
 if(item.review_note)box.append(el("p","Revisão anterior: "+item.review_note));
 if(item.status!=="PENDING_REVIEW")return;
 const actions=el("div",undefined,"actions");
 const accept=el("button","Sugerir inspeção");accept.type="button";
 const reject=el("button","Descartar sugestão","reject");reject.type="button";
 accept.addEventListener("click",()=>review(item.id,"CONFIRMED_FOR_INSPECTION"));
 reject.addEventListener("click",()=>review(item.id,"REJECTED"));
 actions.append(accept,reject);box.append(actions);
}
function renderBars(data){
 const root=$("bars");root.replaceChildren();
 const max=Math.max(1,...data.map(x=>x.total));
 for(const x of data){
  const row=el("div",undefined,"bar-row");
  const track=el("div",undefined,"track");
  const fill=el("div",undefined,"fill");fill.style.width=Math.round(x.total/max*100)+"%";
  track.append(fill);
  row.append(el("span",x.bairro),track,el("b",x.total));
  root.append(row);
 }
}
async function refresh(){
 try{
  const [events,metrics]=await Promise.all([jsonFetch("/api/ocorrencias"),jsonFetch("/api/metricas")]);
  items=events.items;
  $("total").textContent=metrics.total_candidates;
  $("pending").textContent=metrics.pending_review;
  $("confirmed").textContent=metrics.confirmed_for_inspection;
  $("rejected").textContent=metrics.rejected;
  if(!items.some(x=>x.id===selectedId))selectedId=items[0]?.id??null;
  renderList();renderDetail();renderMap();renderBars(metrics.by_bairro);
 }catch(error){showStatus("Erro de conexão com a API local: "+error.message);}
}
async function review(id,status){
 try{
  await jsonFetch("/api/ocorrencias/"+id+"/review",{
    method:"PATCH",headers:{"content-type":"application/json"},
    body:JSON.stringify({status,note:status==="REJECTED"?"Falso positivo — exemplo sintético":"Revisão humana de demonstração"})
  });
  showStatus("Registro fictício #"+id+" atualizado.");
  await refresh();
 }catch(e){showStatus("Falha na revisão: "+e.message);}
}
async function createDemo(){
 const button=$("create");button.disabled=true;
 try {
  const payload={
    bairro:"Setor fictício D",
    latitude:-23.3195,longitude:-51.1702,
    timestamp:new Date().toISOString(),confianca:0.79
  };
  const x=await jsonFetch("/api/ocorrencias",{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)
  });
  selectedId=x.id;showStatus("Evento "+x.id+" criado — GPS e confiança sintéticos.");await refresh();
 }catch(e){showStatus("Falha ao criar evento: "+e.message);}
 finally{button.disabled=false;}
}
$("create").addEventListener("click",createDemo);
window.addEventListener("load",refresh);
