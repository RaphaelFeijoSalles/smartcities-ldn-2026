const form = document.getElementById("analysis-form");
const access = document.getElementById("analysis-access");
const status = document.getElementById("analysis-status");
const result = document.getElementById("analysis-result");
const button = form.querySelector("button");

function analysisEndpoint() {
  const override = new URLSearchParams(location.search).get("api");
  const base = new URL(override || window.ORIGEM_UNICA_API_BASE || "https://origem-unica-api.onrender.com/");
  const local = ["localhost", "127.0.0.1"].includes(base.hostname);
  if ((override && !local) || (base.protocol !== "https:" && !(local && base.protocol === "http:")) ||
      base.username || base.password) {
    throw new Error("Origem de análise inválida.");
  }
  return new URL("/api/habitacao/municipios/4113700/analise", base);
}

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function references(ids, index) {
  const fragment = document.createDocumentFragment();
  for (const id of ids) {
    const ref = element("a", "[" + index.get(id) + "]");
    ref.href = "#fato-" + id;
    fragment.append(" ", ref);
  }
  return fragment;
}

function showAnalysis(data) {
  if (!["AI", "DEMO"].includes(data.mode)) throw new Error("Modo de análise inválido.");
  const fragment = document.createDocumentFragment();
  const index = new Map(data.evidence.map(({id}, i) => [id, i + 1]));
  fragment.append(element("h2", data.mode === "AI" ?
    "Assistência automatizada por IA" : "Demonstração determinística · sem chamada de IA"));

  for (const [label, items] of [["Resumo", data.summary], ["Limitações", data.limitations], ["Próximos passos", data.next_steps]]) {
    const list = document.createElement("ul");
    for (const item of items) {
      const row = element("li", item.text);
      row.append(references(item.fact_ids, index));
      list.append(row);
    }
    fragment.append(element("h3", label), list);
  }

  const evidence = document.createElement("ol");
  for (const fact of data.evidence) {
    const url = new URL(fact.url);
    if (url.protocol !== "https:" || url.hostname !== "www.gov.br" || url.username || url.password) {
      throw new Error("Fonte de evidência inválida.");
    }
    const row = element("li", fact.label + " · " + fact.value + " · " +
      fact.dates.map(date => date.split("-").reverse().join("/")).join(", ") + " · ");
    row.id = "fato-" + fact.id;
    const source = element("a", "Abrir fonte oficial");
    source.href = url.href;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    row.append(source);
    evidence.append(row);
  }
  fragment.append(element("h3", "Evidências citadas"), evidence);
  result.replaceChildren(fragment);
  result.hidden = false;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  result.hidden = true;
  status.textContent = "Consultando análise…";
  button.disabled = true;
  const token = access.value.trim();
  access.value = "";
  try {
    const response = await fetch(analysisEndpoint(), {
      method: "POST",
      headers: token ? {Authorization: "Bearer " + token} : {},
      signal: AbortSignal.timeout(18000),
      redirect: "error",
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(typeof body?.detail === "string" ? body.detail : "Análise indisponível.");
    }
    const data = await response.json();
    showAnalysis(data);
    status.textContent = data.mode === "AI" ? "Análise carregada · assistência por IA." :
      "Análise carregada · demonstração sem chamada de IA.";
  } catch (error) {
    status.textContent = error.name === "TimeoutError" ? "A análise excedeu o tempo limite." :
      (error instanceof TypeError ? "Análise indisponível. Consulte o painel de Habitação." : error.message);
  } finally {
    button.disabled = false;
  }
});
