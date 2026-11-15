import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const page=await readFile(new URL("../../tools/origem-unica/logradouros.html",import.meta.url),"utf8");

test("o laboratório de logradouros mantém navegação e atalho para o conteúdo",()=>{
  for(const href of ['href="./"','href="./saude.html"','href="./logradouros.html"']) assert.ok(page.includes(href));
  assert.match(page,/aria-label="Casos de uso"/);
  assert.match(page,/href="#logradouro-main"/);
  assert.match(page,/id="logradouro-main"/);
});

test("mudanças na lista de candidatos são anunciáveis e a demo segue identificada",()=>{
  assert.match(page,/<div id="matches" role="region" aria-live="polite" aria-label="Candidatos a vínculo da seleção"><\/div>/);
  assert.match(page,/id="street-status" class="filter-status" role="status"/);
  assert.match(page,/dados sintéticos/i);
  assert.match(page,/não alteram o cadastro oficial/i);
});
