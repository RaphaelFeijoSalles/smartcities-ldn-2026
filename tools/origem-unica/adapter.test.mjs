import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { normalizePayload } = createRequire(import.meta.url)("./adapter.js");

test("adapts the agreed items/sources/status/score/conflicts response", () => {
  const result = normalizePayload({
    sources: [{ id: "siglon", name: "SIGLON", url: "https://example.test/siglon" }, { id: "cnes", name: "CNES" }],
    items: [{
      id: "PAIR-7", comparison_status: "conflict", score: 91,
      conflicts: [{ field: "address" }, "phone"],
      sources: {
        siglon: { id: "S-7", name: "UBS Teste", address: { street: "Rua A", number: 7 }, phone: "111", updated_at: "2026-11-14" },
        cnes: { record: { id: "C-7", name: "UBS Teste", address: "Rua A, 8", phone: "222" } }
      }
    }]
  });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].kind, "conflict");
  assert.equal(result.items[0].score, 0.91);
  assert.deepEqual(result.items[0].fields, ["address", "phone"]);
  assert.equal(result.items[0].a.source, "SIGLON");
  assert.equal(result.items[0].a.address, "Rua A, 7");
  assert.equal(result.items[0].a.provenance, "https://example.test/siglon");
  assert.equal(result.items[0].b.ref, "C-7");
});

test("accepts source arrays, missing pairs and absent scores", () => {
  const result = normalizePayload({ items: [
    { id: "ONE", comparison_status: "missing", score: null, conflicts: [], sources: [{ source: "A", record: { name: "UBS A" } }] },
    { id: "TWO", comparison_status: "possible_match", score: 0.72, conflicts: [], a: { name: "UBS B" }, b: { name: "UBS C" } }
  ], sources: [] });
  assert.equal(result.items[0].kind, "missing");
  assert.equal(result.items[0].score, null);
  assert.equal(result.items[0].b, null);
  assert.equal(result.items[1].kind, "possible");
  assert.equal(result.items[1].score, 0.72);
});

test("maps the QA contract statuses, source systems and synthetic mode", () => {
  const result = normalizePayload({ mode: "MOCK", items: [
    { id: "P", name: "Possível", comparison_status: "POSSIBLE_MATCH", score: 0.72,
      sources: [{ system: "SIGLON", source_id: "S-1", name: "A", fetched_at: null }, { system: "CNES", source_id: "C-1", name: "B", fetched_at: null }],
      conflicts: [{ field: "address", values: { SIGLON: "Rua 1", CNES: "Rua 2" } }] },
    { id: "B", name: "Só B", comparison_status: "ONLY_IN_B", score: null,
      sources: [{ system: "CNES", source_id: "C-2", name: "Só B", fetched_at: null }], conflicts: [] }
  ] });
  assert.equal(result.mode, "MOCK");
  assert.equal(result.items[0].kind, "possible");
  assert.equal(result.items[0].a.source, "SIGLON");
  assert.equal(result.items[0].b.source, "CNES");
  assert.equal(result.items[1].kind, "missing");
  assert.equal(result.items[1].a, null);
  assert.equal(result.items[1].b.ref, "C-2");
});

test("rejects an unusable response so the UI can switch to MOCK", () => {
  assert.throws(() => normalizePayload({ records: [] }), /items/);
  assert.throws(() => normalizePayload({ items: [{ id: "empty", sources: [] }] }), /sem dados de fonte/);
});
