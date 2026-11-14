import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateRecords } from "../../scripts/origem-unica/contract-gate.mjs";

const fixture = JSON.parse(readFileSync(new URL("./records-contract.fixture.json", import.meta.url), "utf8"));
const copy = () => structuredClone(fixture);
const errorsFor = change => { const data = copy(); change(data); return validateRecords(data); };
const hasError = (errors, term) => errors.some(x => x.includes(term));

test("QA-01 positive: fixture has conflict, matching, ambiguity, only A, only B", () => {
  assert.deepEqual(validateRecords(fixture), []);
  assert.equal(fixture.items.length, 5);
  assert.deepEqual(new Set(fixture.items.map(x => x.comparison_status)),new Set([
    "MATCH","CONFLICT","POSSIBLE_MATCH","ONLY_IN_A","ONLY_IN_B"
  ]));
});

test("QA-02 reject missing provenance mode (LIVE vs MOCK)", () => {
  assert.ok(hasError(errorsFor(x => delete x.mode), "mode"));
});

test("QA-03 reject duplicate canonical IDs", () => {
  assert.ok(hasError(errorsFor(x => { x.items[1].id = x.items[0].id; }), "duplicate canonical"));
});

test("QA-04 reject same source record reused in multiple canonical entities", () => {
  assert.ok(hasError(errorsFor(x => { x.items[1].sources[0].source_id = x.items[0].sources[0].source_id; }), "source record reused"));
});

test("QA-05 reject declared conflict without field and attributed values", () => {
  const errors = errorsFor(x => { x.items[0].conflicts = []; });
  assert.ok(hasError(errors, "field discrepancy"));
});

test("QA-06 a possible match must preserve two source records", () => {
  const errors = errorsFor(x => { x.items[2].sources = x.items[2].sources.slice(0,1); });
  assert.ok(hasError(errors, "requires >=2"));
});

test("QA-07 unmatched record cannot invent a second source", () => {
  const errors = errorsFor(x => { x.items[3].sources.push(x.items[4].sources[0]); });
  assert.ok(hasError(errors, "exactly one source"));
});

test("QA-08 nullable similarity is valid only when explicitly null, not absent", () => {
  assert.equal(fixture.items[3].score, null);
  assert.ok(hasError(errorsFor(x => { delete x.items[3].score; }), "missing; null is valid"));
});

test("QA-09 scores must be heuristics in [0,1]", () => {
  assert.ok(hasError(errorsFor(x => { x.items[0].score = 87; }), "heuristic"));
});

test("QA-10 LIVE and SNAPSHOT require a real fetch timestamp", () => {
  const errors = errorsFor(x => { x.mode = "LIVE"; });
  assert.ok(hasError(errors, "ISO fetch timestamp"));
});

test("QA-11 support missing phone as null without inventing a number", () => {
  assert.equal(fixture.items[2].sources[0].phone, null);
  assert.deepEqual(validateRecords(fixture), []);
});

test("QA-12 reject malformed geographic coordinates", () => {
  const errors = errorsFor(x => {
    x.items[0].sources[0].latitude = 1234;
    x.items[0].sources[0].longitude = -51.16;
  });
  assert.ok(hasError(errors, "invalid WGS84 latitude"));
});

test("QA-13 reject sources without stable identifiers", () => {
  const errors = errorsFor(x => { x.items[0].sources[0].source_id = ""; });
  assert.ok(hasError(errors, "source record ID"));
});

test("QA-14 accept LIVE records with ISO timestamps and original provenance", () => {
  const live = copy(); live.mode = "LIVE";
  for (const item of live.items) for (const source of item.sources) source.fetched_at = "2026-11-14T17:00:00-03:00";
  assert.deepEqual(validateRecords(live), []);
});
