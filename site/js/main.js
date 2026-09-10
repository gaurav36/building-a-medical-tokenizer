"use strict";

const numberFormat = new Intl.NumberFormat("en-US");
const snapshot = globalThis.MedicalExamples;
const sampleSelect = document.querySelector("#sample");

function renderSample() {
  const example = snapshot.examples[Number(sampleSelect.value)];
  document.querySelector("#sample-text").textContent = example.text;
  for (const name of ["medical", "general"]) {
    const output = document.querySelector(`#${name}-tokens`);
    output.replaceChildren();
    example[name].tokens.forEach((piece, index) => {
      const token = document.createElement("span");
      token.className = "token";
      token.append(document.createTextNode(piece));
      const identifier = document.createElement("span");
      identifier.className = "token-id";
      identifier.textContent = String(example[name].ids[index]);
      token.append(identifier);
      output.append(token);
    });
    document.querySelector(`#${name}-count`).textContent = `${example[name].ids.length} tokens`;
  }
  const medical = MedicalNotes.summarize([{ text: example.text, ids: example.medical.ids }]);
  const general = MedicalNotes.summarize([{ text: example.text, ids: example.general.ids }]);
  const difference = general.tokens - medical.tokens;
  const comparison = difference === 0 ? "Equal token counts." : `Medical BPE uses ${Math.abs(difference)} ${difference > 0 ? "fewer" : "more"} tokens (${(100 * Math.abs(difference) / general.tokens).toFixed(1)}% ${difference > 0 ? "fewer" : "more"} than general BPE).`;
  document.querySelector("#comparison").textContent = `${comparison} Fertility: ${medical.fertility.toFixed(2)} medical / ${general.fertility.toFixed(2)} general.`;
  const exact = example.medical.decoded === example.text && example.general.decoded === example.text;
  document.querySelector("#roundtrip").textContent = exact ? "ROUND TRIP / exact reconstruction for both tokenizers" : "ROUND TRIP / mismatch in exported data";
}

function renderBudget() {
  const vocabularySize = Number(document.querySelector("#vocab-size").value);
  const hiddenSize = Number(document.querySelector("#hidden-size").value);
  const cost = MedicalNotes.embeddingCost(vocabularySize, hiddenSize);
  document.querySelector("#vocab-label").textContent = numberFormat.format(vocabularySize);
  document.querySelector("#embedding-memory").textContent = `${cost.mebibytes.toFixed(1)} MiB`;
  document.querySelector("#embedding-parameters").textContent = `${numberFormat.format(cost.parameters)} parameters`;
}

sampleSelect.addEventListener("change", renderSample);
document.querySelector("#show-ids").addEventListener("change", (event) => {
  document.querySelector("#inspection-lab").classList.toggle("show-ids", event.target.checked);
});
document.querySelector("#vocab-size").addEventListener("input", renderBudget);
document.querySelector("#hidden-size").addEventListener("change", renderBudget);

const provenance = document.querySelector("#provenance");
const library = document.createElement("p");
library.textContent = `Exported with ${snapshot.library} ${snapshot.version}. Special-token insertion disabled.`;
provenance.append(library);
for (const [name, model] of Object.entries(snapshot.models)) {
  const description = document.createElement("p");
  description.textContent = `${name}: ${numberFormat.format(model.vocabularySize)} tokens`;
  const hash = document.createElement("code");
  hash.textContent = `${model.path}\nSHA-256 ${model.sha256}`;
  description.append(hash);
  provenance.append(description);
}

const source = globalThis.MedtokSource;
const sourceBase = source.repositoryUrl
  ? `${source.repositoryUrl.replace(/\/$/u, "")}/`
  : new URL(`../../${source.localDirectory}/`, document.baseURI).href;
for (const link of document.querySelectorAll("[data-source]")) {
  link.href = new URL(link.dataset.source, sourceBase).href;
}

const navLinks = [...document.querySelectorAll("nav a")];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href")));
let scheduled = false;
function markCurrentSection() {
  const threshold = matchMedia("(max-width: 760px)").matches ? 160 : 90;
  const active = sections.filter((section) => section.getBoundingClientRect().top <= threshold).at(-1) || sections[0];
  for (const link of navLinks) {
    if (link.hash === `#${active.id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  scheduled = false;
}
addEventListener("scroll", () => {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(markCurrentSection);
  }
}, { passive: true });
addEventListener("resize", markCurrentSection);
renderSample();
renderBudget();
markCurrentSection();