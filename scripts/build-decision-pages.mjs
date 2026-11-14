#!/usr/bin/env node
/**
 * Builds the static GitHub Pages artifact for the DECISION LAB only.
 * Source app: tools/decision-board/  (never the future hackathon product).
 *
 * Why keep the app under tools/decision-board in the site?
 * Its existing ../../data and ../../docs paths then resolve correctly on
 * project Pages (/<repository>/tools/decision-board/) and custom domains.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dest = join(root, ".pages-site");
const allowedSourceDirs = ["tools/decision-board", "data/decision", "docs"];

function checkNoLinks(directory) {
  for (const ent of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, ent.name);
    if (lstatSync(file).isSymbolicLink()) throw new Error("Symlink not permitted in Pages artifact: " + relative(root, file));
    if (ent.isDirectory()) checkNoLinks(file);
  }
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

for (const source of allowedSourceDirs) {
  const abs = join(root, source);
  if (!existsSync(abs)) throw new Error("Missing source folder: " + source);
  checkNoLinks(abs);
  cpSync(abs, join(dest, source), { recursive: true });
}

// GitHub Pages serves /<repository>/; preserve existing paths by sending the
// visitor to /<repository>/tools/decision-board/ with a RELATIVE redirect.
const landing = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=./tools/decision-board/">
  <title>Smart Cities 2026 — Decision Lab</title>
</head>
<body>
  <p>Acesse o <a href="./tools/decision-board/">Decision Lab — Smart Cities Londrina 2026</a>.</p>
</body>
</html>
`;
writeFileSync(join(dest, "index.html"), landing, "utf8");
writeFileSync(join(dest, ".nojekyll"), "", "utf8");

const requiredFiles = [
  "index.html", ".nojekyll",
  "tools/decision-board/index.html",
  "tools/decision-board/app.mjs",
  "tools/decision-board/model.mjs",
  "tools/decision-board/style.css",
  "data/decision/smartcities-decision-v1.json",
  "data/decision/smartcities-assessments-v1.json",
  "docs/decision/README.md",
  "docs/decision/07_SIGLON_APLICATIVOS.md"
];
for (const file of requiredFiles) {
  if (!existsSync(join(dest, file))) throw new Error("Missing Pages output: " + file);
}
const mainHtml = readFileSync(join(dest, "tools/decision-board/index.html"), "utf8");
const app = readFileSync(join(dest, "tools/decision-board/app.mjs"), "utf8");
if (!mainHtml.includes('src="./app.mjs"') || !mainHtml.includes('href="./style.css"'))
  throw new Error("Decision Lab does not reference expected assets");
if (!app.includes('const DATA = "../../data/decision/"'))
  throw new Error("Decision Lab data path changed; update the Pages packaging / test");

// Validate the relative paths as they will resolve on a project Pages URL.
const projectRoot = new URL("https://example.github.io/smartcities-ldn-2026/");
const page = new URL("./tools/decision-board/", projectRoot);
const appData = new URL("../../data/decision/smartcities-decision-v1.json", page);
const appDocs = new URL("../../docs/decision/README.md", page);
if (appData.pathname !== "/smartcities-ldn-2026/data/decision/smartcities-decision-v1.json" ||
    appDocs.pathname !== "/smartcities-ldn-2026/docs/decision/README.md") {
  throw new Error("GitHub Project Pages path resolution failed");
}
const catalog = JSON.parse(readFileSync(join(dest, "data/decision/smartcities-decision-v1.json"), "utf8"));
const baseline = JSON.parse(readFileSync(join(dest, "data/decision/smartcities-assessments-v1.json"), "utf8"));
if (!Array.isArray(catalog.concepts) || catalog.concepts.length === 0 ||
    !Array.isArray(baseline.items) || baseline.items.length !== catalog.concepts.length)
  throw new Error("Catalog and assessments are missing or have different numbers of concepts");

// Never ship a repository checkout, backend sources or credentials to Pages.
for (const file of [".git", ".github", ".env", "package.json", "scripts"]) {
  if (existsSync(join(dest, file))) throw new Error("Unexpected publish target: " + file);
}
console.log("Pages artifact validated:", relative(root, dest));
console.log("Project-site link: /smartcities-ldn-2026/tools/decision-board/");
console.log("Catalog: " + catalog.concepts.length + " ideas; " + catalog.challenges.length + " challenges.");
