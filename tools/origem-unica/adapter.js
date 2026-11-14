/* Small boundary between GET /api/records and the existing comparison UI. */
"use strict";
(function (root) {
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const first = (...values) => values.find(value => value !== undefined && value !== null && value !== "");
  const text = value => value === undefined || value === null ? "" : String(value);
  const sourceName = (entry, fallback) => text(first(entry.system, entry.source_name, entry.source, entry.label, entry.name, entry.id, fallback));
  const address = value => typeof value === "object" && value !== null
    ? [first(value.street, value.logradouro, value.rua), first(value.number, value.numero, value.número), first(value.neighborhood, value.bairro), first(value.city, value.cidade)].filter(Boolean).join(", ")
    : text(value);

  function sourceEntries(item) {
    const value = first(item.sources, item.records, item.source_records);
    if (Array.isArray(value)) {
      const entries = value.map((entry, index) => {
      const wrapped = object(entry);
      return { label: sourceName(wrapped, `Fonte ${index + 1}`), record: object(first(wrapped.record, wrapped.data, wrapped.fields, wrapped)) };
      });
      return text(item.comparison_status).toUpperCase() === "ONLY_IN_B" && entries.length === 1 ? [null, entries[0]] : entries;
    }
    if (value && typeof value === "object") return Object.entries(value).map(([label, record]) => ({ label, record: object(first(record?.record, record?.data, record)) }));
    return [
      { label: "Fonte A", record: object(first(item.a, item.source_a, item.left, item.siglon)) },
      { label: "Fonte B", record: object(first(item.b, item.source_b, item.right, item.cnes)) }
    ];
  }

  function normalizeSource(entry, catalogue) {
    if (!entry || !Object.keys(entry.record).length) return null;
    const value = entry.record;
    const metadata = object(catalogue[entry.label]);
    const label = text(first(value.system, value.source_name, metadata.name, metadata.label, value.source, entry.label));
    const provenance = value.provenance;
    return {
      source: label,
      name: text(first(value.name, value.nome, value.establishment_name, value.nome_fantasia)),
      address: address(first(value.address, value.endereco, value.full_address, value.logradouro)),
      phone: text(first(value.phone, value.telefone, value.contact)),
      updated: text(first(value.updated_at, value.updated, value.collected_at, value.fetched_at, metadata.updated_at)),
      ref: text(first(value.ref, value.record_id, value.source_id, value.id, value.cnes)),
      provenance: text(first(typeof provenance === "object" ? first(provenance?.url, provenance?.source, provenance?.name, provenance?.id) : provenance, value.origin, value.url, metadata.url, metadata.endpoint, label))
    };
  }

  function normalizeConflicts(conflicts) {
    if (!Array.isArray(conflicts)) return [];
    return conflicts.map(value => typeof value === "string" ? value : text(first(value?.field, value?.field_name, value?.name, value?.type))).filter(Boolean);
  }

  function normalizeStatus(value, fields, hasPair, score) {
    const status = text(value).toLowerCase();
    if (!hasPair || /missing|unmatched|sem.par|ausente|only/.test(status)) return "missing";
    if (/possible|candidate|poss[ií]vel|uncertain/.test(status)) return "possible";
    if (/conflict|diverg|disagree/.test(status) || fields.length) return "conflict";
    if (/match|equal|same|correspond|conciliado/.test(status)) return "match";
    return score !== null && score < 0.85 ? "possible" : "match";
  }

  function normalizePayload(payload) {
    if (!payload || !Array.isArray(payload.items)) throw new Error("Resposta sem items[]");
    const catalogue = Array.isArray(payload.sources)
      ? Object.fromEntries(payload.sources.flatMap((source, index) => {
        const item = object(source);
        return [sourceName(item, `Fonte ${index + 1}`), text(item.id)].filter(Boolean).map(key => [key, item]);
      }))
      : object(payload.sources);
    const items = payload.items.map((raw, index) => {
      const item = object(raw);
      const entries = sourceEntries(item);
      const a = normalizeSource(entries[0], catalogue);
      const b = normalizeSource(entries[1], catalogue);
      const number = Number(item.score);
      const score = item.score === null || item.score === undefined || item.score === "" || !Number.isFinite(number) ? null : Math.max(0, Math.min(1, number > 1 ? number / 100 : number));
      const fields = normalizeConflicts(item.conflicts);
      const kind = normalizeStatus(item.comparison_status, fields, Boolean(a && b), score);
      return {
        id: text(first(item.id, item.record_id, item.pair_id, `API-${index + 1}`)),
        name: text(first(item.name, item.establishment_name, a?.name, b?.name, `Registro ${index + 1}`)),
        kind, score, fields, status: kind === "match" ? "matched" : "pending", a, b,
        origin: "API",
        comparisonStatus: text(item.comparison_status)
      };
    });
    if (items.some(item => !item.a && !item.b)) throw new Error("Registro sem dados de fonte");
    return { items, sources: catalogue, mode: text(payload.mode).toUpperCase() || "UNSPECIFIED" };
  }

  const adapter = { normalizePayload };
  if (typeof module !== "undefined" && module.exports) module.exports = adapter;
  if (root) root.OrigemAdapter = adapter;
})(typeof window !== "undefined" ? window : null);
