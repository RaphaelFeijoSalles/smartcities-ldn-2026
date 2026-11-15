import {validateAnalysis, analysisModeLabel, analysisFailure, analysisReport} from "./analise-evidencias-model.mjs";

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = new URL("./analise-evidencias.css", import.meta.url).href;
document.head.append(stylesheet);

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
  validateAnalysis(data);
  const fragment = document.createDocumentFragment();
  const index = new Map(data.evidence.map(({id}, i) => [id, i + 1]));
  fragment.append(element("h3", analysisModeLabel(data.mode)),
    element("p", "Londrina/PR · " + data.evidence.length + " evidências de SNHIS e MCMV para conferência por analistas e gestores públicos."),
    element("p", "A análise organiza os fatos dos snapshots. Não certifica a situação atual nem executa decisão administrativa."));

  for (const [label, items] of [["Resumo", data.summary], ["Limitações", data.limitations], ["Próximos passos", data.next_steps]]) {
    const list = document.createElement("ul");
    for (const item of items) {
      const row = element("li", item.text);
      row.append(references(item.fact_ids, index));
      list.append(row);
    }
    fragment.append(element("h4", label), list);
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
    const source = element("a", (fact.id === "mcmv" ? "MCMV" : "SNHIS") + " · fonte oficial");
    source.setAttribute("aria-label", "Abrir fonte oficial: " + fact.label);
    source.href = url.href;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    row.append(source);
    evidence.append(row);
  }
  fragment.append(element("h4", "Evidências citadas"), evidence);
  const download = element("button", "Baixar relatório de conferência (.txt)");
  download.type = "button";
  download.className = "button outline";
  download.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([analysisReport(data)], {type: "text/plain;charset=utf-8"}));
    const anchor = element("a", "Baixar relatório");
    anchor.href = url;
    anchor.download = "origem-unica-londrina-conferencia.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  fragment.append(download);
  result.replaceChildren(fragment);
  result.hidden = false;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (button.disabled) return;
  result.hidden = true;
  status.textContent = "Consultando análise…";
  button.disabled = true;
  form.setAttribute("aria-busy", "true");
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
      status.textContent = analysisFailure(response.status, body?.detail);
      return;
    }
    const data = await response.json();
    showAnalysis(data);
    status.textContent = data.mode === "AI" ? "Análise carregada · assistência por IA." :
      "Análise carregada · demonstração sem chamada de IA.";
  } catch (error) {
    status.textContent = ["TimeoutError", "AbortError"].includes(error.name) ?
      "A análise excedeu o tempo limite. O painel oficial continua disponível." :
      "Não foi possível carregar uma análise válida. Consulte o painel de Habitação.";
  } finally {
    button.disabled = false;
    form.setAttribute("aria-busy", "false");
  }
});
