import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('./analise-evidencias.mjs', import.meta.url), 'utf8');
function harness(response) {
  const node = () => ({hidden: true, textContent: '', children: [], append(...xs) {this.children.push(...xs);},
    replaceChildren(...xs) {this.children = xs;}});
  const nodes = Object.fromEntries(['analysis-form', 'analysis-access', 'analysis-status', 'analysis-result'].map(id => [id, node()]));
  const button = node();
  let submit;
  nodes['analysis-form'].querySelector = () => button;
  nodes['analysis-form'].addEventListener = (_, fn) => {submit = fn;};
  nodes['analysis-access'].value = 'synthetic-access';
  const calls = [];
  vm.runInNewContext(source, {
    document: {getElementById: id => nodes[id], createElement: node, createDocumentFragment: node},
    URL, URLSearchParams, AbortSignal, location: {search: '?api=http://localhost:8000/'}, window: {},
    fetch: async (...args) => {calls.push(args); return response;},
  });
  return {nodes, calls, button, submit: () => submit({preventDefault() {}})};
}
for (const mode of ['DEMO', 'AI']) {
  test(`success identifies ${mode} and clears access`, async () => {
    const h = harness({ok: true, json: async () => ({mode, evidence: [], summary: [], limitations: [], next_steps: []})});
    await h.submit();
    assert.match(h.nodes['analysis-status'].textContent, mode === 'AI' ? /assistência por IA/ : /sem chamada de IA/);
    assert.equal(h.nodes['analysis-access'].value, '');
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0][1].headers.Authorization, 'Bearer synthetic-access');
    assert.equal(h.button.disabled, false);
    assert.equal(h.nodes['analysis-result'].hidden, false);
  });
}
test('provider limit stays an error without automatic retry or demo fallback', async () => {
  const h = harness({ok: false, json: async () => ({detail: 'O provedor de IA atingiu um limite de uso ou cota.'})});
  await h.submit();
  assert.match(h.nodes['analysis-status'].textContent, /provedor/);
  assert.equal(h.nodes['analysis-result'].hidden, true);
  assert.equal(h.calls.length, 1);
  assert.equal(h.nodes['analysis-access'].value, '');
  assert.equal(h.button.disabled, false);
});
