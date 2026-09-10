import test from "node:test";
import assert from "node:assert/strict";
import "../site/js/metrics.js";

const { summarize, embeddingCost } = globalThis.MedicalNotes;

test("fertility is the ratio of totals, not the mean of document ratios", () => {
  const result = summarize([
    { text: "metformin", ids: [1, 2, 3] },
    { text: "blood pressure is stable", ids: [4, 5, 6, 7] },
  ]);
  assert.equal(result.fertility, 7 / 5);
  assert.equal(result.tokens, 7);
  assert.equal(result.words, 5);
});

test("character counts follow Python Unicode code points, not UTF-16 units", () => {
  const result = summarize([{ text: "A\u{1F9EC}", ids: [1, 2, 3] }]);
  assert.equal(result.characters, 2);
  assert.equal(result.tokensPer100Characters, 150);
});

test("empty sample sets have finite display values", () => {
  assert.deepEqual(summarize([]), {
    tokens: 0, words: 0, characters: 0, fertility: 0, tokensPer100Characters: 0,
  });
});

test("embedding estimate counts one matrix in MiB", () => {
  assert.deepEqual(embeddingCost(16000, 2048), { parameters: 32768000, mebibytes: 62.5 });
  assert.equal(embeddingCost(32000, 2048).mebibytes, 125);
});