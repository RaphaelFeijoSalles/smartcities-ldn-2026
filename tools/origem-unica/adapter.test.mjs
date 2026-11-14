import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const { normalizePayload } = createRequire(import.meta.url)("./adapter.js");
const fixture = JSON.parse(readFileSync(new URL("../../tests/origem-unica/records-contract.fixture.json", import.meta.url), "utf8"));

test("preserves the QA fixture's mode, statuses, sources and original attributes", () => {
  const result = normalizePayload(fixture);
  assert.equal(result.mode, "MOCK");
  assert.deepEqual(result.items.map(item => item.kind), ["conflict", "match", "possible", "missing", "missing"]);
  assert.equal(result.items[0].a.source, "SIGLON");
  assert.equal(result.items[0].a.ref, "SIG-001");
  assert.equal(result.items[0].a.fetchedAt, null);
  assert.equal(result.items[0].a.raw.latitude, null);
  assert.equal(result.items[0].a.raw.source_id, "SIG-001");
  assert.equal(result.items[4].a, null);
  assert.equal(result.items[4].b.source, "CNES");
  assert.equal(result.items[4].b.ref, "CNES-MOCK-005");
});

test("transforms source maps without filling absent attributes", () => {
  const result = normalizePayload({
    mode: "MOCK",
    sources: [{ id: "siglon", name: "SIGLON", url: "https://example.test/siglon" }],
    items: [{
      id: "PAIR-7", name: "UBS Teste", comparison_status: "CONFLICT", score: 0.91,
      conflicts: [{ field: "address" }],
      sources: {
        siglon: { source_id: "S-7", name: "UBS Teste", address: { street: "Rua A", number: 7 }, phone: null, fetched_at: null },
        cnes: { record: { system: "CNES", source_id: "C-7", name: "UBS Teste", address: "Rua A, 8", fetched_at: null } }
      }
    }]
  });
  assert.equal(result.items[0].score, 0.91);
  assert.equal(result.items[0].a.address, "Rua A, 7");
  assert.equal(result.items[0].a.phone, "");
  assert.equal(result.items[0].a.raw.phone, null);
  assert.equal(result.items[0].a.provenance, "https://example.test/siglon");
  assert.equal(result.items[0].b.provenance, "");
});

test("accepts LIVE only with declared fetch timestamps", () => {
  const live = structuredClone(fixture);
  live.mode = "LIVE";
  for (const item of live.items) for (const source of item.sources) source.fetched_at = "2026-11-14T17:00:00-03:00";
  const result = normalizePayload(live);
  assert.equal(result.mode, "LIVE");
  assert.equal(result.items[0].a.fetchedAt, "2026-11-14T17:00:00-03:00");
});

test("rejects missing or invalid contract fields instead of inventing them", () => {
  const changed = edit => { const value = structuredClone(fixture); edit(value); return value; };
  assert.throws(() => normalizePayload({ records: [] }), /items/);
  assert.throws(() => normalizePayload(changed(value => delete value.mode)), /mode/);
  assert.throws(() => normalizePayload(changed(value => delete value.items[0].id)), /id ou name/);
  assert.throws(() => normalizePayload(changed(value => delete value.items[0].sources[0].source_id)), /source_id/);
  assert.throws(() => normalizePayload(changed(value => delete value.items[0].sources[0].fetched_at)), /fetched_at/);
  assert.throws(() => normalizePayload(changed(value => { value.items[0].score = 87; })), /score/);
  assert.throws(() => normalizePayload(changed(value => { value.mode = "LIVE"; })), /fetched_at/);
});
