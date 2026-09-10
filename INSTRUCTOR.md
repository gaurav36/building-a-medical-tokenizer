# Teaching Medical Tokenization

## Learning Outcome

Learners should be able to describe and run a custom byte-level BPE training workflow, separate tokenizer efficiency from model quality, and report a reproducible comparison against a same-recipe general-domain control.

## Suggested Session: 60 Minutes

| Time | Article sections | Activity |
| --- | --- | --- |
| 0-10 min | 01-03 | Define the domain and identify leakage risks. |
| 10-25 min | 04-05 | Trace the tokenizer pipeline and inspect the trainer configuration. |
| 25-35 min | 06 | Compare cardiology, Unicode, and general-language snapshots. Reveal token IDs. |
| 35-45 min | 07-08 | Define fertility; vary vocabulary size and embedding dimension. |
| 45-55 min | 09-10 | Reload an artifact and explain the pretrained-model mismatch. |
| 55-60 min | 11-12 | Review the experiment checklist and locate the practical notebook. |

## Preparation

- Open `site/index.html`; the blog itself needs no Python environment or server.
- For live Python work, prepare the sibling medtok environment using its own `uv sync` workflow.
- Download corpora and train both artifacts ahead of time; do not promise a fixed training duration.
- Verify which tokenizer the practical notebook loads. The tiny fallback is not the PubMed-trained 16k artifact.
- Use only synthetic examples during a public demonstration.

## Questions To Ask

1. Why might a medical tokenizer lose on an ordinary travel sentence?
2. Why is matching vocabulary targets insufficient to eliminate all confounders?
3. What happens when the same abstract appears on two different rows across a split?
4. Why does choosing a vocabulary size on test data invalidate an untouched test claim?
5. Why do Unicode display pieces sometimes look unlike the input text?
6. Why does `resize_token_embeddings` not make a new vocabulary compatible with a pretrained model?

## Keep Claims Precise

The inspection lab displays saved encodings from local artifacts, not live browser inference. Its five authored probes are illustrative and do not establish held-out performance. The embedding lab calculates one FP16 matrix, not complete training memory. Source scripts implement the practical workflow; additional recommendations about validation and deduplication are explicitly separate from their current behavior.