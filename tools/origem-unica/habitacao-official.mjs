/* Adaptador de contrato: API oficial SNHIS/MCMV -> modelo do painel.
 * Não infere regularidade nem remove operações repetidas. */
import {normalizeHousing} from "./habitacao-model.mjs";

export function adaptOfficialHousing(snhis, mcmv) {
  const municipality=snhis?.municipio || {};
  const source=snhis?.fonte || {};
  const msource=mcmv?.fonte || {};
  const sourceUrl=source.url || null;
  const municipalCode=municipality.codigo_ibge || municipality.codigo_solicitado || "4113700";
  const referenceDate=snhis?.data_referencia || null;
  const evidence=(status, label)=>({
    status:String(status ?? "").trim().toUpperCase()==="REGULAR"?"REGULAR":String(status ?? "").trim().toUpperCase()==="PENDENTE"?"PENDENTE":"UNKNOWN",
    source_name:label, source_url:sourceUrl,
    reference_date:referenceDate, fetched_at:source.downloaded_at || null,
    freshness:"UNVERIFIED"
  });
  const req={};
  for(const r of snhis?.requisitos || []){
    const name=(r.requisito || "").toLowerCase();
    const key=name.includes("conselho")?"conselho":name.includes("plano local")?"plhis":name.includes("fundo local")?"fundo":null;
    if(key)req[key]=evidence(r.situacao_fonte,"SNHIS · Ministério das Cidades");
  }
  const enterprises=(mcmv?.items || []).map((r,index)=>({
    id:r.cod_operacao ? String(r.cod_operacao)+"-"+index : null,
    name:r.txt_nome_empreendimento || null,
    units:null, // Operações repetidas: não agregar unidades sem conciliação.
    status:r.txt_situacao_empreendimento || null,
    source_name:"MCMV · Ministério das Cidades",
    source_url:msource.url || null,
    reference_date:r.data_referencia || null,
    fetched_at:msource.downloaded_at || null,
    data_origin:null
  }));
  const officialSnhis=snhis?.nivel_verificacao==="OFFICIAL_SNAPSHOT";
  const officialMcmv=mcmv?.nivel_verificacao==="OFFICIAL_SNAPSHOT";
  return normalizeHousing({
    mode:"SNAPSHOT", generated_at:source.downloaded_at || msource.downloaded_at || null,
    municipalities:[{
      ibge_code:String(municipalCode),
      name:municipality.nome || "Londrina", uf:municipality.uf || "PR",
      snhis:evidence(officialSnhis?snhis?.situacao_snhis:"UNKNOWN","SNHIS · Ministério das Cidades"),
      requirements:officialSnhis?req:{},
      enterprises:officialMcmv?enterprises:[]
    }]
  });
}

export async function fetchOfficialHousing(base, fetchImpl=fetch, signal){
  const root=new URL(base.endsWith("/")?base:base+"/");
  const municipalityUrl=new URL("api/habitacao/municipios/4113700",root);
  const projectsUrl=new URL("api/habitacao/empreendimentos?municipio=411370",root);
  const fetchJson=async url=>{
    const response=await fetchImpl(url.href,{signal,headers:{Accept:"application/json"}});
    if(!response.ok)throw new Error("HTTP "+response.status+" em "+url.pathname);
    return response.json();
  };
  const [snhis,mcmv]=await Promise.allSettled([fetchJson(municipalityUrl),fetchJson(projectsUrl)]);
  if(snhis.status!=="fulfilled"&&mcmv.status!=="fulfilled")throw new Error("SNHIS e MCMV indisponíveis");
  const empty={};
  const data=adaptOfficialHousing(snhis.status==="fulfilled"?snhis.value:empty,mcmv.status==="fulfilled"?mcmv.value:empty);
  return {data,partial:snhis.status!=="fulfilled"||mcmv.status!=="fulfilled"||
    snhis.value?.nivel_verificacao!=="OFFICIAL_SNAPSHOT"||
    mcmv.value?.nivel_verificacao!=="OFFICIAL_SNAPSHOT"};
}
