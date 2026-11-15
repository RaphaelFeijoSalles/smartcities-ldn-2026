import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {validateAnalysis, analysisModeLabel, analysisFailure, analysisReport} from './analise-evidencias-model.mjs';
const fixture = JSON.parse(readFileSync(new URL('../../tests/origem-unica/analysis-synthetic.fixture.json', import.meta.url)));


const source = readFileSync(new URL('./analise-evidencias.mjs', import.meta.url), 'utf8').split('\n').slice(1).join('\n').replaceAll('import.meta.url', '"http://localhost/tools/origem-unica/analise-evidencias.mjs"');
function harness(response) {
  const node = () => ({setAttribute() {}, addEventListener() {}, hidden: true, textContent: '', children: [], append(...xs) {this.children.push(...xs);},
    replaceChildren(...xs) {this.children = xs;}});
  const nodes = Object.fromEntries(['analysis-form', 'analysis-access', 'analysis-status', 'analysis-result'].map(id => [id, node()]));
  const button = node();
  let submit;
  nodes['analysis-form'].querySelector = () => button;
  nodes['analysis-form'].addEventListener = (_, fn) => {submit = fn;};
  nodes['analysis-access'].value = 'synthetic-access';
  const calls = [];
  vm.runInNewContext(source, {
    document: {head: node(), getElementById: id => nodes[id], createElement: node, createDocumentFragment: node},
    validateAnalysis, analysisModeLabel, analysisFailure, analysisReport,
    URL, URLSearchParams, AbortSignal, location: {search: '?api=http://localhost:8000/'}, window: {},
    fetch: async (...args) => {calls.push(args); return response;},
  });
  return {nodes, calls, button, submit: () => submit({preventDefault() {}})};
}
for (const mode of ['DEMO', 'AI']) {
  test(`success identifies ${mode} and clears access`, async () => {
    const h = harness({ok: true, json: async () => ({...fixture, mode})});
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
  const h = harness({ok: false, status: 503, json: async () => ({detail: 'O provedor de IA atingiu um limite de uso ou cota. Consulte o responsável antes de tentar novamente.'})});
  await h.submit();
  assert.match(h.nodes['analysis-status'].textContent, /provedor/);
  assert.equal(h.nodes['analysis-result'].hidden, true);
  assert.equal(h.calls.length, 1);
  assert.equal(h.nodes['analysis-access'].value, '');
  assert.equal(h.button.disabled, false);
});

for (const [label, change] of [
  ['unknown evidence reference', d => {d.summary[0].fact_ids = ['invented'];}],
  ['duplicate evidence', d => {d.evidence[1] = d.evidence[0];}],
  ['unsafe link', d => {d.evidence[0].url = 'javascript:alert(1)';}],
  ['forged official host', d => {d.evidence[0].url = 'https://www.gov.br.evil.example/';}],
  ['missing reference date', d => {d.evidence[0].dates = [];}],
  ['invalid calendar date', d => {d.evidence[0].dates = ['2026-02-30'];}],
  ['wrong municipality', d => {d.municipality.ibge = '0000000';}],
  ['invented situation', d => {d.evidence[0].value = 'IRREGULAR';}],
  ['non-numeric row count', d => {d.evidence.find(f => f.id === 'mcmv').value = '42 empreendimentos';}],
]) {
  test(`rejects ${label} before rendering or exporting`, async () => {
    const data = structuredClone(fixture);
    change(data);
    assert.throws(() => validateAnalysis(data), /Resposta de análise inválida/);
    assert.throws(() => analysisReport(data));
    const h = harness({ok: true, json: async () => data});
    await h.submit();
    assert.equal(h.nodes['analysis-result'].hidden, true);
    assert.match(h.nodes['analysis-status'].textContent, /análise válida/);
  });
}
test('report preserves mode, values, dates, links and human review without credentials', () => {
  const report = analysisReport(fixture, '2026-11-15T03:00:00Z');
  assert.match(report, /sem chamada de IA/);
  assert.match(report, /SNHIS: REGULAR/);
  assert.match(report, /MCMV: 42/);
  assert.match(report, /2026-10-20/);
  assert.match(report, /2026-06-30/);
  assert.match(report, /conferência humana/);
  assert.match(report, /https:\/\/www.gov.br/);
  assert.doesNotMatch(report, /synthetic-access|API_KEY|Bearer/);
});
test('unexpected backend errors cannot display arbitrary payloads', async () => {
  const h = harness({ok: false, status: 503, json: async () => ({detail: 'synthetic-secret'})});
  await h.submit();
  assert.doesNotMatch(h.nodes['analysis-status'].textContent, /synthetic-secret/);
  assert.match(h.nodes['analysis-status'].textContent, /indisponível/);
});
