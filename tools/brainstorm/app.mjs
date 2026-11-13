import { CRITERIA, scoreIdea, rankIdeas } from "./scoring.mjs";

const STORAGE_KEY = "smartcities-ldn-2026-brainstorm-v1";
const seed = () => ({
  ideas: [
    { id: "pulsogov", name: "PulsoGov", value: "Priorização de demandas com justificativa", ratings: {} },
    { id: "contratoclaro", name: "ContratoClaro", value: "Transparência de gastos com fontes", ratings: {} },
    { id: "destravavog", name: "DestravaGov", value: "Menos retrabalho em processos administrativos", ratings: {} },
  ],
  notes: { problem: "", audience: "", demo: "", risk: "" },
});

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.ideas) && saved.ideas.length <= 30 && saved.notes && typeof saved.notes === "object") {
      return saved;
    }
  } catch { /* browser storage indisponível: modo de sessão */ }
  return seed();
}
let state = load();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { document.getElementById("status").textContent = "Armazenamento local indisponível: exporte a decisão antes de sair."; }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderCriteria() {
  const target = document.getElementById("criteria");
  target.replaceChildren();
  for (const criterion of CRITERIA) {
    const chip = el("div", "criterion");
    chip.append(el("strong", "", criterion.label), el("span", "", criterion.weight + "%"));
    target.append(chip);
  }
}

function field(labelText, value, update, multiline = false) {
  const label = el("label", "small-field");
  label.append(el("span", "", labelText));
  const control = document.createElement(multiline ? "textarea" : "input");
  if (!multiline) control.type = "text";
  if (multiline) control.rows = 2;
  control.value = value || "";
  control.addEventListener("change", () => { update(control.value); save(); renderIdeas(); });
  label.append(control);
  return label;
}

function renderIdeas() {
  const target = document.getElementById("ideas");
  target.replaceChildren();
  state.ideas.forEach((idea, index) => {
    const result = scoreIdea(idea.ratings || {});
    const card = el("article", "idea");
    const top = el("div", "idea-head");
    const number = el("span", "tag", "HIPÓTESE " + String(index + 1).padStart(2, "0"));
    const score = el("strong", "score", result.complete ? result.score.toFixed(2) + " / 5" : result.answered + "/5 critérios");
    top.append(number, score);
    card.append(top);
    card.append(field("Nome da hipótese", idea.name, value => { idea.name = value; }));
    card.append(field("Proposta em uma frase", idea.value, value => { idea.value = value; }, true));
    const grid = el("div", "ratings");
    CRITERIA.forEach(criterion => {
      const label = el("label", "rating");
      label.append(el("span", "", criterion.label));
      const select = el("select");
      select.setAttribute("aria-label", criterion.label + " — " + idea.name);
      const options = [{ value: "", text: "Sem nota" }, ...[1,2,3,4,5].map(n => ({ value: String(n), text: String(n) }))];
      options.forEach(option => {
        const node = document.createElement("option");
        node.value = option.value; node.textContent = option.text;
        select.append(node);
      });
      select.value = idea.ratings?.[criterion.key] ? String(idea.ratings[criterion.key]) : "";
      select.addEventListener("change", () => {
        if (!idea.ratings) idea.ratings = {};
        if (select.value) idea.ratings[criterion.key] = Number(select.value);
        else delete idea.ratings[criterion.key];
        save(); renderIdeas(); renderRanking();
      });
      label.append(select); grid.append(label);
    });
    card.append(grid);
    if (state.ideas.length > 1) {
      const remove = el("button", "tiny ghost", "Excluir hipótese");
      remove.type = "button";
      remove.setAttribute("aria-label", "Excluir " + idea.name);
      remove.addEventListener("click", () => {
        state.ideas = state.ideas.filter(other => other.id !== idea.id);
        save(); renderIdeas(); renderRanking();
      });
      card.append(remove);
    }
    target.append(card);
  });
}

function renderRanking() {
  const ranking = rankIdeas(state.ideas);
  const summary = document.getElementById("summary");
  const result = document.getElementById("ranking");
  if (!ranking.length) {
    summary.textContent = "Sem avaliações completas";
    result.textContent = "Preencha todos os cinco critérios de pelo menos uma hipótese. Nota não substitui entrevista ou desafio oficial.";
    return;
  }
  const lead = ranking[0];
  summary.textContent = ranking.length + " hipótese(s) pontuada(s)";
  result.textContent = "Maior pontuação provisória: " + lead.name + " (" + lead.evaluation.score.toFixed(2) + "/5). Verifique riscos e evidências antes de decidir.";
}

function exportMarkdown() {
  const lines = [
    "# Decisão do brainstorm — Smart Cities Londrina 2026",
    "",
    "Data de exportação: " + new Date().toLocaleString("pt-BR"),
    "**Status:** hipótese da equipe, não aprovação oficial nem produto implementado.",
    "",
    "## Notas (opiniões do grupo; escala 1–5)",
    "",
    "| Ideia | Score ponderado | Critérios preenchidos | Proposta |",
    "|---|---:|---:|---|",
  ];
  for (const idea of state.ideas) {
    const result = scoreIdea(idea.ratings || {});
    const clean = value => String(value || "").replaceAll("|", "/").replaceAll("\n", " ");
    lines.push("| " + clean(idea.name) + " | " + (result.complete ? result.score.toFixed(2) : "PENDENTE") + " | " + result.answered + "/5 | " + clean(idea.value) + " |");
  }
  const names = { problem: "Problema", audience: "Usuário e comprador", demo: "Demo de 90 segundos", risk: "Hipótese crítica" };
  for (const [key, title] of Object.entries(names)) {
    lines.push("", "## " + title, "", String(state.notes[key] || "").trim() || "**A DEFINIR**");
  }
  lines.push("", "## Próximo passo", "", "Conferir edital e anexar à Issue #2. Atualizar PROJECT_DOSSIER.md e CONTINUITY.md após validação da equipe.", "");
  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "smartcities-brainstorm-decisao.md";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  document.getElementById("status").textContent = "Arquivo exportado. Ele ainda precisa ser enviado à Issue #2 ou commitado.";
}

document.getElementById("add").addEventListener("click", () => {
  state.ideas.push({
    id: "idea-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    name: "Nova hipótese",
    value: "",
    ratings: {},
  });
  save(); renderIdeas(); renderRanking();
});
document.getElementById("download").addEventListener("click", exportMarkdown);
document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("Apagar as notas e anotações salvas neste navegador?")) return;
  state = seed(); save(); renderIdeas(); renderRanking(); renderNotes();
});
function renderNotes() {
  for (const key of ["problem","audience","demo","risk"]) {
    const input = document.getElementById(key);
    input.value = state.notes?.[key] || "";
    input.oninput = () => {
      state.notes[key] = input.value;
      save();
    };
  }
}
renderCriteria();
renderIdeas();
renderRanking();
renderNotes();
