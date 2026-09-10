import test from "node:test";
import assert from "node:assert/strict";
import "../site/js/examples.js";
import "../site/js/metrics.js";

const { examples, models } = globalThis.MedicalExamples;

test("snapshot records two equal-size artifacts with SHA-256 provenance", () => {
  for (const name of ["medical", "general"]) {
    assert.equal(models[name].vocabularySize, 16000);
    assert.match(models[name].sha256, /^[a-f0-9]{64}$/u);
  }
});

test("every exported example has matching pieces, IDs, and exact reconstruction", () => {
  assert.equal(examples.length, 5);
  for (const example of examples) {
    for (const name of ["medical", "general"]) {
      assert.equal(example[name].decoded, example.text);
      assert.equal(example[name].tokens.length, example[name].ids.length);
      assert.ok(example[name].ids.every(identifier => Number.isInteger(identifier) && identifier >= 0 && identifier < models[name].vocabularySize));
    }
  }
});

test("illustrative counts agree with the article, including the general-domain tradeoff", () => {
  assert.deepEqual(examples.map(example => [example.medical.ids.length, example.general.ids.length]), [[12, 15], [9, 16], [10, 19], [19, 21], [18, 12]]);
  assert.equal(MedicalNotes.summarize([{ text: examples[1].text, ids: examples[1].medical.ids }]).fertility, 9 / 7);
});