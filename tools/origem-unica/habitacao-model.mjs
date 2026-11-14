/* Origem Única Habitação: strict, read-only transformation of declared API evidence. */
export const UNKNOWN = "NÃO VERIFICADO";
export const REQUIREMENTS = [
  {id:"fundo", name:"Fundo Local de Habitação", short:"Fundo local", why:"Instrumento para implementar a política local de habitação de interesse social e receber recursos do FNHIS.", official:"https://www.gov.br/cidades/pt-br/assuntos/habitacao/adesao-ao-snhis", owner:"Município; documentação recebida e analisada pela CEFUS/CAIXA"},
  {id:"conselho", name:"Conselho Gestor do Fundo", short:"Conselho gestor", why:"Instância de gestão e participação prevista para o Fundo Local de Habitação de Interesse Social.", official:"https://www.gov.br/cidades/pt-br/assuntos/habitacao/adesao-ao-snhis", owner:"Município; documentação recebida e analisada pela CEFUS/CAIXA"},
  {id:"plhis", name:"Plano Local de Habitação de Interesse Social", short:"PLHIS", why:"Plano local com diretrizes, metas e ações para a política habitacional de interesse social.", official:"https://www.gov.br/cidades/pt-br/assuntos/habitacao/adesao-ao-snhis", owner:"Município; documentação recebida e analisada pela CEFUS/CAIXA"}
];
const object=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const clean=x=>typeof x==="string"&&x.trim()?x.trim():null;
const date=x=>clean(x)&&!Number.isNaN(Date.parse(x))?x:null;
export function safeUrl(value){try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}catch{return null}}
export function normalizeStatus(value){
 const text=clean(value)?.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
 if(["CONFIRMADO","REGULAR","ATENDIDO"].includes(text))return "CONFIRMADO";
 if(text==="PENDENTE")return "PENDENTE";
 return UNKNOWN;
}
export function normalizeFreshness(value){const s=clean(value)?.toUpperCase();return ["UPDATED","ATUALIZADO"].includes(s)?"updated":["STALE","DESATUALIZADO"].includes(s)?"stale":"unverified"}
const sourceLabel=raw=>clean(raw?.source?.name)||clean(raw?.source?.system)||clean(raw?.source_name)||clean(raw?.source)||null;
function normalizeEvidence(raw){
 const item=object(raw)?raw:{};
 const url=safeUrl(item.source_url||item.source?.url||item.url);
 const dataOrigin=clean(item.data_origin||item.source?.data_origin);
 const status=url||dataOrigin?.startsWith("MOCK:")?normalizeStatus(item.status):UNKNOWN;
 return {status,source:sourceLabel(item),url,referenceDate:date(item.reference_date||item.referenceDate),fetchedAt:date(item.fetched_at||item.fetchedAt),freshness:normalizeFreshness(item.freshness),dataOrigin,note:clean(item.note)};
}
function normalizeRequirements(raw){const collection=Array.isArray(raw)?Object.fromEntries(raw.filter(object).map(item=>[clean(item.type||item.id)?.toLowerCase(),item])):object(raw)?raw:{};
 return Object.fromEntries(REQUIREMENTS.map(meta=>[meta.id,normalizeEvidence(collection[meta.id])]))}
function normalizeEnterprise(raw){if(!object(raw))return null;const name=clean(raw.name||raw.enterprise_name);const url=safeUrl(raw.source_url||raw.source?.url);const dataOrigin=clean(raw.data_origin);if(!name||!(url||dataOrigin?.startsWith("MOCK:")))return null;
 const units=Number.isInteger(raw.units)&&raw.units>=0?raw.units:Number.isInteger(raw.housing_units)&&raw.housing_units>=0?raw.housing_units:null;
 return {id:clean(raw.id)||name,name,units,status:clean(raw.status),source:sourceLabel(raw),url,referenceDate:date(raw.reference_date),freshness:normalizeFreshness(raw.freshness),dataOrigin};
}
function normalizeMunicipality(raw){if(!object(raw))return null;const code=String(raw.ibge_code??raw.municipality_code??raw.code??"").trim();const name=clean(raw.name||raw.municipality||raw.municipality_name);if(!code||!name)return null;
 const snhis=normalizeEvidence(raw.snhis||raw.regularity);
 const enterprises=Array.isArray(raw.enterprises)?raw.enterprises.map(normalizeEnterprise).filter(Boolean):Array.isArray(raw.mcmv)?raw.mcmv.map(normalizeEnterprise).filter(Boolean):[];
 return {code,name,uf:clean(raw.uf),snhis,requirements:normalizeRequirements(raw.requirements),enterprises,updatedAt:date(raw.updated_at)};
}
export function normalizeHousing(payload){if(!object(payload))throw new Error("Resposta habitacional inválida");const mode=clean(payload.mode)?.toUpperCase();if(!["LIVE","SNAPSHOT","MOCK"].includes(mode))throw new Error("Modo de proveniência ausente");
 const rows=Array.isArray(payload.municipalities)?payload.municipalities:Array.isArray(payload.items)?payload.items:payload.municipality_code||payload.ibge_code?[payload]:null;
 if(!rows)throw new Error("Lista de municípios ausente");
 const municipalities=rows.map(normalizeMunicipality).filter(Boolean);const codes=municipalities.map(x=>x.code);if(new Set(codes).size!==codes.length)throw new Error("Município duplicado");
 return {mode,generatedAt:date(payload.generated_at),municipalities};
}
export function selectHousing(data,filters){
 const selected=data?.municipalities?.find(x=>x.code===filters.municipality)||null;
 if(!selected||filters.situation!=="all"&&selected.snhis.status!==filters.situation)return {municipality:null,snhis:null,requirements:[],enterprises:[]};
 const snhis=(filters.source==="all"||selected.snhis.source===filters.source)&&(filters.freshness==="all"||selected.snhis.freshness===filters.freshness)?selected.snhis:null;
 const requirements=REQUIREMENTS.map(meta=>({...meta,...selected.requirements[meta.id]})).filter(item=>(filters.requirement==="all"||item.id===filters.requirement)&&(filters.source==="all"||item.source===filters.source)&&(filters.freshness==="all"||item.freshness===filters.freshness));
 const enterprises=selected.enterprises.filter(item=>(filters.enterprise==="all"||item.id===filters.enterprise)&&(filters.source==="all"||item.source===filters.source)&&(filters.freshness==="all"||item.freshness===filters.freshness));
 return {municipality:selected,snhis,requirements,enterprises};
}
export function explainRequirement(item){
 if(item.dataOrigin?.startsWith("MOCK:"))return "Status fictício deste cenário de demonstração. Confira os documentos e a situação no sistema oficial antes de qualquer encaminhamento.";
 if(item.status==="CONFIRMADO")return "A fonte declarada informa atendimento deste instrumento. Confirme o documento e a data no sistema oficial antes de qualquer decisão.";
 if(item.status==="PENDENTE")return "A fonte declarada informa pendência. Consulte o registro oficial e confirme com a CEFUS/CAIXA quais documentos precisam de análise.";
 return "Não há evidência carregada para classificar este instrumento. Ausência de dado não significa pendência nem irregularidade.";
}
