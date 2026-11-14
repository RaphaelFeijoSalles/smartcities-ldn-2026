/**
 * Origem Única — read-only contract checker.
 * Use: node scripts/origem-unica/contract-gate.mjs --fixture tests/origem-unica/records-contract.fixture.json
 *      node scripts/origem-unica/contract-gate.mjs --url http://127.0.0.1:8000/api/records
 * No external dependencies. The --url mode only performs a GET.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const statuses = new Set(["MATCH", "POSSIBLE_MATCH", "CONFLICT", "ONLY_IN_A", "ONLY_IN_B"]);
const modes = new Set(["LIVE", "SNAPSHOT", "MOCK", "DEMO_SYNTHETIC"]);
const text = x => typeof x === "string" && x.trim().length > 0;
const isObject = x => x !== null && typeof x === "object" && !Array.isArray(x);

export function validateRecords(payload) {
  const errors = [];
  const fail = (path, msg) => errors.push(path + ": " + msg);
  if (!isObject(payload)) return ["response: expected JSON object"];
  if (!modes.has(payload.mode)) fail("mode", "must be LIVE, SNAPSHOT, MOCK or DEMO_SYNTHETIC; never omit provenance");
  if (!Array.isArray(payload.items)) return [...errors, "items: expected array"];
  const ids = new Set();
  const sourceIds = new Set();
  for (let i = 0; i < payload.items.length; i++) {
    const item = payload.items[i], p = "items[" + i + "]";
    if (!isObject(item)) { fail(p, "expected object"); continue; }
    if (!text(item.id)) fail(p + ".id", "stable nonempty string required");
    else if (ids.has(item.id)) fail(p + ".id", "duplicate canonical item ID");
    else ids.add(item.id);
    if (!text(item.name)) fail(p + ".name", "display name required");
    if (!statuses.has(item.comparison_status)) fail(p + ".comparison_status", "unknown matching status");
    if (item.score !== null && (typeof item.score !== "number" || !Number.isFinite(item.score) || item.score < 0 || item.score > 1))
      fail(p + ".score", "must be null or a numeric heuristic between 0 and 1");
    if (item.score === undefined) fail(p + ".score", "missing; null is valid for unmatched records");
    if (!Array.isArray(item.sources) || item.sources.length === 0) {
      fail(p + ".sources", "at least one source required");
    } else {
      if (["MATCH", "POSSIBLE_MATCH", "CONFLICT"].includes(item.comparison_status) && item.sources.length < 2)
        fail(p + ".sources", "cross-source classification requires >=2 sources");
      if (["ONLY_IN_A", "ONLY_IN_B"].includes(item.comparison_status) && item.sources.length !== 1)
        fail(p + ".sources", "unmatched record must have exactly one source");
      const systems = new Set();
      for (let j = 0; j < item.sources.length; j++) {
        const src = item.sources[j], sp = p + ".sources[" + j + "]";
        if (!isObject(src)) { fail(sp, "expected object"); continue; }
        if (!text(src.system)) fail(sp + ".system", "nonempty source system required");
        else if (systems.has(src.system)) fail(sp + ".system", "same source system repeated within item");
        else systems.add(src.system);
        const sid = src.source_id;
        if (!(text(sid) || Number.isInteger(sid) && sid >= 0))
          fail(sp + ".source_id", "source record ID required");
        else if (text(src.system)) {
          const key = src.system + ":" + String(sid);
          if (sourceIds.has(key)) fail(sp + ".source_id", "source record reused in multiple canonical records");
          else sourceIds.add(key);
        }
        if (!text(src.name)) fail(sp + ".name", "original source name required");
        if (!Object.hasOwn(src, "fetched_at")) fail(sp + ".fetched_at", "required for freshness/provenance, null only in MOCK");
        else if (src.fetched_at === null) {
          if (payload.mode === "LIVE" || payload.mode === "SNAPSHOT")
            fail(sp + ".fetched_at", "real records need an ISO fetch timestamp");
        } else if (!text(src.fetched_at) || !Number.isFinite(Date.parse(src.fetched_at)))
          fail(sp + ".fetched_at", "must be ISO date/time or null in MOCK");
        for (const field of ["address", "phone"]) {
          if (src[field] !== undefined && src[field] !== null && typeof src[field] !== "string")
            fail(sp + "." + field, "must be string or null, not fabricated numeric values");
        }
        if ((src.latitude === null) !== (src.longitude === null) &&
            src.latitude !== undefined && src.longitude !== undefined)
          fail(sp + ".coordinates", "latitude/longitude must both be present or both null");
        if (src.latitude != null && (typeof src.latitude !== "number" || Math.abs(src.latitude) > 90))
          fail(sp + ".latitude", "invalid WGS84 latitude");
        if (src.longitude != null && (typeof src.longitude !== "number" || Math.abs(src.longitude) > 180))
          fail(sp + ".longitude", "invalid WGS84 longitude");
      }
    }
    if (!Array.isArray(item.conflicts)) fail(p + ".conflicts", "must be array (empty is valid)");
    else {
      if (item.comparison_status === "CONFLICT" && item.conflicts.length === 0)
        fail(p + ".conflicts", "CONFLICT classification needs at least one field discrepancy");
      for (let j = 0; j < item.conflicts.length; j++) {
        const conflict = item.conflicts[j], cp = p + ".conflicts[" + j + "]";
        if (!isObject(conflict)) { fail(cp, "expected object"); continue; }
        if (!text(conflict.field)) fail(cp + ".field", "field required");
        if (!isObject(conflict.values) || Object.keys(conflict.values).length < 2)
          fail(cp + ".values", "must show at least two attributed values");
      }
    }
  }
  return errors;
}

async function cli(args) {
  if (args.includes("--help")) {
    console.log("Usage: node scripts/origem-unica/contract-gate.mjs --fixture <json> | --url <http://localhost:8000/api/records>");
    return;
  }
  let data, from;
  const f = args.indexOf("--fixture"), u = args.indexOf("--url");
  if ((f >= 0) === (u >= 0)) throw new Error("Supply exactly one of --fixture or --url");
  if (f >= 0) {
    if (!args[f + 1]) throw new Error("Fixture filename required");
    from = args[f + 1];
    data = JSON.parse(await readFile(resolve(from), "utf8"));
  } else {
    from = args[u + 1];
    const url = new URL(from);
    if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname))
      throw new Error("--url accepts localhost only: do not send demo data to a remote server");
    if (!url.pathname.endsWith("/api/records")) throw new Error("Use the read-only /api/records endpoint");
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("API returned HTTP " + response.status);
    data = await response.json();
  }
  const errors = validateRecords(data);
  if (errors.length) {
    console.error("FAIL Origem Única contract [" + from + "]\n" + errors.map(x => " - " + x).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("PASS Origem Única contract [" + from + "]: " + data.items.length + " items; mode=" + data.mode);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  cli(process.argv.slice(2)).catch(error => { console.error("FAIL contract gate:", error.message); process.exitCode = 1; });
}
