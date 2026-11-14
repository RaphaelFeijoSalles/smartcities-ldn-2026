import test from "node:test";
import assert from "node:assert/strict";
import {adaptOfficialHousing,fetchOfficialHousing} from "./habitacao-official.mjs";
const gov="https://www.gov.br/cidades/pt-br/arquivo-oficial.xls";
const snhis={mode:"SNAPSHOT",municipio:{codigo_ibge:"4113700",nome:"Londrina",uf:"PR"},situacao_snhis:"REGULAR",nivel_verificacao:"OFFICIAL_SNAPSHOT",data_referencia:"2026-10-20",fonte:{url:gov,downloaded_at:"2026-11-14T19:00:00Z"},requisitos:[{requisito:"Lei do Fundo Local de Habitação de Interesse Social",situacao_fonte:"REGULAR"},{requisito:"Lei do Conselho Gestor do Fundo Local",situacao_fonte:"REGULAR"},{requisito:"Plano Local de Habitação de Interesse Social",situacao_fonte:"PENDENTE"}]};
const mcmv={mode:"SNAPSHOT",nivel_verificacao:"OFFICIAL_SNAPSHOT",fonte:{url:"https://www.gov.br/cidades/arquivo-mcmv.zip",downloaded_at:"2026-11-14T19:00:00Z"},items:[{cod_operacao:"A",txt_nome_empreendimento:"Exemplo A",txt_situacao_empreendimento:"EM OBRA",data_referencia:"2026-06-30",qtd_uh:42,operacao_repetida_na_fonte:true},{cod_operacao:"A",txt_nome_empreendimento:"Exemplo A",data_referencia:"2026-06-30",qtd_uh:42,operacao_repetida_na_fonte:true}]};
test("official SNHIS status requires snapshot proof and keeps IBGE code",()=>{const d=adaptOfficialHousing(snhis,mcmv);assert.equal(d.municipalities[0].code,"4113700");assert.equal(d.municipalities[0].snhis.status,"CONFIRMADO");assert.equal(d.municipalities[0].snhis.referenceDate,"2026-10-20");assert.equal(d.municipalities[0].requirements.plhis.status,"PENDENTE")});
test("MCMV repeated operations are not summed as units",()=>{const d=adaptOfficialHousing(snhis,mcmv);assert.equal(d.municipalities[0].enterprises.length,2);assert.ok(d.municipalities[0].enterprises.every(e=>e.units===null))});
test("unverified municipal evidence never becomes regularity",()=>{const d=adaptOfficialHousing({...snhis,nivel_verificacao:"UNVERIFIED"},{});assert.equal(d.municipalities[0].snhis.status,"NÃO VERIFICADO");assert.equal(d.municipalities[0].requirements.fundo.status,"NÃO VERIFICADO")});
test("two official backend URLs and partial failures",async()=>{const calls=[];const mock=async url=>{calls.push(url);return url.includes("empreendimentos")?{ok:false,status:503}:{ok:true,json:async()=>snhis}};const result=await fetchOfficialHousing("https://origem-unica-api.onrender.com/",mock);assert.equal(calls.length,2);assert.ok(calls.some(x=>x.includes("/api/habitacao/municipios/4113700")));assert.ok(calls.some(x=>x.includes("?municipio=411370")));assert.equal(result.partial,true);assert.equal(result.data.municipalities[0].snhis.status,"CONFIRMADO")});

test("Fundo e Conselho mantêm evidências independentes sem sobrescrita",()=>{
 const d=adaptOfficialHousing(snhis,mcmv);
 assert.equal(d.municipalities[0].requirements.fundo.status,"CONFIRMADO");
 assert.equal(d.municipalities[0].requirements.conselho.status,"CONFIRMADO");
 assert.equal(d.municipalities[0].requirements.plhis.status,"PENDENTE");
});

test("real SNHIS source values Regular classify all three instruments",()=>{
 const official={...snhis,requisitos:snhis.requisitos.map(r=>({...r,situacao_fonte:"Regular"}))};
 const d=adaptOfficialHousing(official,mcmv);
 for(const id of ["fundo","conselho","plhis"])assert.equal(d.municipalities[0].requirements[id].status,"CONFIRMADO");
 assert.equal(d.municipalities[0].snhis.status,"CONFIRMADO");
});

test("unknown instrument values remain unverified",()=>{
 const official={...snhis,requisitos:snhis.requisitos.map(r=>({...r,situacao_fonte:"Sem registro"}))};
 const d=adaptOfficialHousing(official,mcmv);
 for(const id of ["fundo","conselho","plhis"])assert.equal(d.municipalities[0].requirements[id].status,"NÃO VERIFICADO");
});
