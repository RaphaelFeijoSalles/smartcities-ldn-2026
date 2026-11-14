/* Small boundary between GET /api/records and the existing comparison UI. */
"use strict";
(function (root) {
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const first = (...values) => values.find(value => value !== undefined && value !== null && value !== "");
  const text = value => value === undefined || value === null ? "" : String(value);
  const sourceName = (entry, fallback) => text(first(entry.system, entry.source_name, entry.source, entry.label, entry.name, entry.id, fallback));
  const systemName = entry => text(first(entry.system, entry.source_name, entry.source, entry.label));
  const address = value => typeof value === "object" && value !== null
    ? [first(value.street, value.logradouro, value.rua), first(value.number, value.numero, value.número), first(value.neighborhood, value.bairro), first(value.city, value.cidade)].filter(Boolean).join(", ")
    : text(value);

  function sourceEntries(item) {
    const value = first(item.sources, item.records, item.source_records);
    if (Array.isArray(value)) {
      const entries = value.map((entry, index) => {
        const wrapped = object(entry);
        return { label: systemName(wrapped), record: object(first(wrapped.record, wrapped.data, wrapped.fields, wrapped)) };
      });
      return text(item.comparison_status).toUpperCase() === "ONLY_IN_B" && entries.length === 1 ? [null, entries[0]] : entries;
    }
    if (value && typeof value === "object") return Object.entries(value).map(([label, record]) => ({ label, record: object(first(record?.record, record?.data, record)) }));
    return [
      { label: "", record: object(first(item.a, item.source_a, item.left, item.siglon)) },
      { label: "", record: object(first(item.b, item.source_b, item.right, item.cnes)) }
    ];
  }

  function normalizeSource(entry, catalogue) {
    if (!entry || !Object.keys(entry.record).length) return null;
    const value = entry.record;
    const metadata = object(catalogue[entry.label]);
    const label = text(first(value.system, value.source_name, value.source, metadata.name, metadata.label, entry.label));
    const ref = first(value.source_id, value.ref, value.record_id, value.id, value.cnes);
    const name = first(value.name, value.nome, value.establishment_name, value.nome_fantasia);
    if (!label || ref === undefined || !text(name).trim() || !("fetched_at" in value)) throw new Error("Fonte sem system, source_id, name ou fetched_at");
    const provenance = value.provenance;
    return {
      source: label,
      name: text(name),
      address: address(first(value.address, value.endereco, value.full_address, value.logradouro)),
      phone: text(first(value.phone, value.telefone, value.contact)),
      updated: text(first(value.updated_at, value.updated, value.collected_at, metadata.updated_at)),
      fetchedAt: value.fetched_at,
      ref: text(ref),
      dataOrigin: text(value.data_origin),
      provenance: text(first(value.data_origin, typeof provenance === "object" ? first(provenance?.url, provenance?.source, provenance?.name, provenance?.id) : provenance, value.origin, value.url, metadata.url, metadata.endpoint)),
      raw: { ...value }
    };
  }

  function normalizeConflicts(conflicts) {
    if (!Array.isArray(conflicts)) throw new Error("Registro sem conflicts[]");
    const fields = conflicts.map(value => typeof value === "string" ? value : text(first(value?.field, value?.field_name, value?.name, value?.type)));
    if (fields.some(field => !field.trim())) throw new Error("Conflito sem field");
    return fields;
  }

  function normalizeStatus(value) {
    const status = text(value).toLowerCase();
    if (/missing|unmatched|sem.par|ausente|only/.test(status)) return "missing";
    if (/possible|candidate|poss[ií]vel|uncertain/.test(status)) return "possible";
    if (/conflict|diverg|disagree/.test(status)) return "conflict";
    if (/match|equal|same|correspond|conciliado/.test(status)) return "match";
    throw new Error("comparison_status desconhecido");
  }

  function normalizePayload(payload) {
    if (!payload || !Array.isArray(payload.items)) throw new Error("Resposta sem items[]");
    const mode = text(payload.mode).toUpperCase();
    if (!["LIVE", "SNAPSHOT", "MOCK", "DEMO_SYNTHETIC"].includes(mode)) throw new Error("Resposta sem mode válido");
    const catalogue = Array.isArray(payload.sources)
      ? Object.fromEntries(payload.sources.flatMap((source, index) => {
        const item = object(source);
        return [sourceName(item, `Fonte ${index + 1}`), text(item.id)].filter(Boolean).map(key => [key, item]);
      }))
      : object(payload.sources);
    const items = payload.items.map(raw => {
      const item = object(raw);
      if (!text(item.id).trim() || !text(item.name).trim()) throw new Error("Registro sem id ou name");
      const entries = sourceEntries(item);
      const a = normalizeSource(entries[0], catalogue);
      const b = normalizeSource(entries[1], catalogue);
      const score = item.score;
      if (score !== null && (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 1)) throw new Error("score fora de 0–1 ou null");
      const fields = normalizeConflicts(item.conflicts);
      const kind = normalizeStatus(item.comparison_status);
      if (kind === "missing" ? Boolean(a) === Boolean(b) : !a || !b) throw new Error("sources incompatíveis com comparison_status");
      for (const source of [a, b].filter(Boolean)) {
        if (["LIVE", "SNAPSHOT"].includes(mode) && (!source.fetchedAt || !Number.isFinite(Date.parse(source.fetchedAt)))) throw new Error("Fonte real sem fetched_at válido");
      }
      return {
        id: text(item.id),
        name: text(item.name),
        kind, score, fields, status: kind === "match" ? "matched" : "pending", a, b,
        origin: "API",
        comparisonStatus: text(item.comparison_status),
        raw: { ...item }
      };
    });
    return { items, sources: catalogue, mode };
  }

  const adapter = { normalizePayload };
  if (typeof module !== "undefined" && module.exports) module.exports = adapter;
  if (root) root.OrigemAdapter = adapter;
})(typeof window !== "undefined" ? window : null);
