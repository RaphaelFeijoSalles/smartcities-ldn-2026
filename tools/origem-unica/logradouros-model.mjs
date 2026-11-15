export const normalize = value => String(value ?? "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toUpperCase()
  .replace(/\bAV\b/g, "AVENIDA").replace(/\bR\b/g, "RUA")
  .replace(/[^A-Z0-9]+/g, " ").trim();

export const streetType = value => normalize(value);

export function suggestions(record) {
  const flags = [];
  if (!record.name) flags.push("SEM_NOME: verificar tipo de via");
  if (!record.codlog) flags.push("CODLOG_AUSENTE");
  if (!record.law) flags.push("LEI_NAO_INFORMADA");
  if (record.locality === "SEDE") flags.push("LOCALIDADE_SEDE: verificar semântica");
  return flags;
}

export function selectStreets(records, scenario, query) {
  const terms = normalize(query).split(" ").filter(Boolean);
  return records.filter(record => {
    if (scenario !== "all" && record.scenario !== scenario) return false;
    const fields = normalize([record.id, record.name, record.codlog, record.type, record.locality].join(" "));
    return terms.every(term => fields.includes(term));
  });
}

export function candidateGroups(records) {
  const byCode = new Map();
  const codesByName = new Map();
  const nameKey = record => {
    const name = normalize(record.name);
    return name ? name + " · " + streetType(record.type) : "";
  };
  const add = (key, record) => {
    if (!byCode.has(key)) byCode.set(key, []);
    byCode.get(key).push(record);
  };

  for (const record of records) {
    if (!record.codlog) continue;
    add("CODLOG " + record.codlog, record);
    const name = nameKey(record);
    if (!name) continue;
    if (!codesByName.has(name)) codesByName.set(name, new Set());
    codesByName.get(name).add(record.codlog);
  }
  for (const record of records) {
    const name = nameKey(record);
    if (record.codlog || !name) continue;
    const codes = codesByName.get(name);
    if (codes?.size === 1) add("CODLOG " + [...codes][0], record);
    if (!codes) add("NOME E TIPO " + name, record);
  }
  return [...byCode].filter(([, members]) => new Set(members.map(record => record.source)).size > 1);
}

export function streetsCsv(records) {
  const header = ["source_id", "source", "nome_original", "tipo", "localidade_original", "codlog", "lei", "nome_normalizado", "pendencias"];
  const rows = [header];
  for (const record of records) {
    const flags = suggestions(record);
    if (!flags.length) continue;
    rows.push([record.id, record.source, record.name, record.type, record.locality, record.codlog,
      record.law, normalize(record.name), flags.join("|")]);
  }
  return "\uFEFF" + rows.map(row => row.map(value => '"' + String(value ?? "").replaceAll('"', '""') + '"')
    .join(";")).join("\r\n") + "\r\n";
}
