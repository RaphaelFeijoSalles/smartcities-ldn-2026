import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const source=await readFile(new URL("../../tools/origem-unica/habitacao.mjs",import.meta.url),"utf8");

test("a seleção de instrumento preserva o foco e expõe o painel controlado",()=>{
  assert.match(source,/focusRequirement:null/);
  assert.match(source,/const root=\$("requirement-cards"\),restoreFocus=state\.focusRequirement/);
  assert.match(source,/card\.setAttribute\("aria-controls","evidence"\)/);
  assert.match(source,/state\.focusRequirement=item\.id;render\(\)/);
  assert.match(source,/if\(restoreFocus===item\.id\)card\.focus\(\{preventScroll:true\}\)/);
});
