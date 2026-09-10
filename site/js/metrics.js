"use strict";

globalThis.MedicalNotes = Object.freeze({
  summarize(samples) {
    const totals = samples.reduce((result, sample) => {
      result.tokens += sample.ids.length;
      result.words += Math.max(1, sample.text.trim().split(/\s+/u).filter(Boolean).length);
      result.characters += Array.from(sample.text).length;
      return result;
    }, { tokens: 0, words: 0, characters: 0 });
    return {
      ...totals,
      fertility: totals.words ? totals.tokens / totals.words : 0,
      tokensPer100Characters: totals.characters ? 100 * totals.tokens / totals.characters : 0,
    };
  },
  embeddingCost(vocabularySize, hiddenSize, bytesPerParameter = 2) {
    return {
      parameters: vocabularySize * hiddenSize,
      mebibytes: vocabularySize * hiddenSize * bytesPerParameter / (1024 ** 2),
    };
  },
});