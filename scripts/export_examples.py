"""Export real medtok encodings for the static blog; no training or network access."""

from __future__ import annotations

import argparse
import hashlib
import json
from importlib.metadata import version
from pathlib import Path

from tokenizers import Tokenizer

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = {
    "medical": "artifacts/medical-bpe-pubmed/tokenizer.json",
    "general": "artifacts/general-bpe/tokenizer.json",
}


def export_examples(source: Path) -> dict:
    examples = json.loads((ROOT / "data" / "examples.json").read_text(encoding="utf-8"))
    snapshot = {"library": "tokenizers", "version": version("tokenizers"), "models": {}, "examples": examples}
    for name, relative in ARTIFACTS.items():
        artifact = source / relative
        tokenizer = Tokenizer.from_file(str(artifact))
        snapshot["models"][name] = {
            "path": relative,
            "sha256": hashlib.sha256(artifact.read_bytes()).hexdigest(),
            "vocabularySize": tokenizer.get_vocab_size(),
        }
        for example in examples:
            encoded = tokenizer.encode(example["text"], add_special_tokens=False)
            decoded = tokenizer.decode(encoded.ids, skip_special_tokens=False)
            if decoded != example["text"]:
                raise ValueError(f"Round-trip mismatch: {name}, {example['label']}")
            example[name] = {"tokens": encoded.tokens, "ids": encoded.ids, "decoded": decoded}
    return snapshot


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Path to medtok (currently tokenization-explainer)")
    args = parser.parse_args()
    snapshot = export_examples(args.source.resolve())
    output = ROOT / "site" / "js" / "examples.js"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("globalThis.MedicalExamples = " + json.dumps(snapshot, ensure_ascii=True, indent=2) + ";\n", encoding="utf-8")
    print(f"Exported {len(snapshot['examples'])} round-trip-checked examples to {output}")
    for name, model in snapshot["models"].items():
        print(f"{name}: vocab={model['vocabularySize']}, sha256={model['sha256']}")


if __name__ == "__main__":
    main()