# Building a Medical Tokenizer

### **Read the blog:** <https://gaurav36.github.io/building-a-medical-tokenizer/>

A static, long-form engineering blog about building a medical-domain tokenizer. It follows the numbered lessons, persistent contents navigation, visual explanations, and embedded labs of the sibling `tokenization-explanation` project.

The sidebar footer highlights [Tokenization Deep Dive](https://gaurav36.github.io/tokenization-explanation/) under "Start with tokenization basics" with larger, bold link text. Like the rest of the sidebar footer, this link is hidden in the compact mobile layout.

The practical implementation lives in `../tokenization-explainer`, referred to here as [**medtok**](https://github.com/gaurav36/med-tok), its planned name. This project does not rename or modify either sibling repository, duplicate the production trainer, or train a language model.

The author identifies [gaurav36/med-tok](https://github.com/gaurav36/med-tok) as the implementation repository used to build the custom medical tokenizer. The [Colab playbook](https://colab.research.google.com/drive/171axehMMfnunm1UVjT2EIi212YHbhOKo?usp=sharing) loads the published 6k artifact and includes a separate GPT-5 comparison cell using tiktoken. The [blog walkthrough](site/index.html#colab-playbook) explains the Python code, token-ID mapping, byte-level piece inspection, and round-trip decoding checks. GPT-5 output remains unverified until the cell is run in the linked Colab. These are not independently rerun or revision-pinned results; the Colab required sign-in and GitHub returned 404 when fetched for the initial update. Source links now use the author's GitHub repository independently of the local checkout layout; repository access is still required.

## Run Locally

The site uses plain HTML, CSS, and classic JavaScript. No build or `npm install` is required. You can either open the HTML directly or serve it on `localhost`.

### Open Without A Server

Open [site/index.html](site/index.html) in a browser. This option does not require Python or Node.js. Optional Google Fonts fall back to locally installed fonts when offline.

### Open On Localhost

Install Python 3 if it is not already available. In VS Code, open a terminal in the project root (`building-a-medical-tokenizer`, the folder containing this README), then run:

```sh
python --version
python -m http.server 8000 --bind 127.0.0.1 --directory site
```

On Windows, if `python` is not recognized but the Python launcher is installed, use `py -3` instead of `python`. On macOS or Linux, use `python3` if needed.

Keep the terminal running and open:

- Article: <http://localhost:8000/>
- Diagrams: <http://localhost:8000/diagrams/>

The server serves `site/` as its document root, matching GitHub Pages, so do not add `/site/` to these URLs. It binds only to this computer, not the local network. If `localhost` does not resolve, use <http://127.0.0.1:8000/>.

If port 8000 is already in use, choose another port:

```sh
python -m http.server 8001 --bind 127.0.0.1 --directory site
```

Then open <http://localhost:8001/>. Refresh the browser after editing HTML, CSS, or JavaScript; there is no automatic reload. Press **Ctrl+C** in the server terminal to stop it.

The labs run in the browser using bundled data; the server only delivers static files. External GitHub, Colab, and documentation links still require internet access and any applicable permissions.

The article and diagrams share the reference blog's light paper palette and cyan accents. Article navigation uses pill buttons with hover, focus, and active-section states; the fixed GitHub button opens this blog's repository. Mobile navigation scrolls horizontally, and reduced-motion preferences disable smooth scrolling and button motion. The inspection lab still displays saved encodings; styling does not add live tokenizer inference.

## Checks

With Node.js 20 or newer:

```sh
npm test
```

Training commands in the article run from the **implementation repository**, not from this folder. They require that repository's Python environment and `uv`; corpus downloads and uncached baseline tokenizers require internet access.

## Editorial Contract

- Explain the implementation, not just BPE theory: corpus preparation, splitting, byte-level training, evaluation, vocabulary budget, serialization, and model compatibility.
- Use measured tokenizer snapshots only when labeled with the artifact and corpus they came from. Tiny fallback examples are not held-out benchmark evidence.
- Fertility is total tokens divided by total whitespace-delimited words. Fewer tokens do not establish better clinical reasoning, accuracy, or model quality.
- A shuffled row split is not document deduplication. Check overlapping content before describing held-out results as leakage-free.
- Reserve held-out test data for final evaluation. Vocabulary selection needs a separate validation split.
- Use authored, synthetic examples only. Never add identifiable patient records or credentials to this project.

## Source Of Truth

Implementation inspected on 2026-09-08:

| Topic | Path inside [medtok](https://github.com/gaurav36/med-tok) |
| --- | --- |
| Corpus input, byte alphabet, BPE options | `scripts/train_medical_tokenizer.py` |
| Seeded train/test row split | `scripts/split_corpus.py` |
| Fertility and tokenizer comparisons | `scripts/compare_tokenizers.py` |
| Vocabulary-size experiment | `scripts/sweep_vocab_size.py` |
| Hugging Face wrapper | `scripts/wrap_medical_tokenizer.py` |

The article distinguishes source behavior from recommended production checks. Benchmark numbers in the implementation README are not reproduced as independently verified results.

The [32k run walkthrough](site/index.html#run-32k) transcribes an author-supplied `med-tok` comparator run and explains all six output tables, including the 4/20 single-token term rate. Its vocabulary size is author-reported; actual artifact sizes, hashes, baseline versions, and data separation were not independently verified. These results are separate from the unchanged 16k inspection-lab snapshots.

The [fertility knee walkthrough](site/index.html#fertility-knee) explains the 2% near-best heuristic and a subsequent author-supplied cached sweep. It distinguishes requested labels from reported actual sizes (the "16k" row has 32,000 entries), explains saturation and actual-size embedding costs, and flags the same-file training/evaluation command without assuming the reused artifacts' training history.

## Structure

```text
INSTRUCTOR.md                 Teaching sequence and caveats
data/examples.json            Five authored, synthetic probes
scripts/export_examples.py    Run the real sibling tokenizers; export snapshots
scripts/render_chart.ps1      Render the snapshot chart on Windows
site/index.html               Thirteen-section article with two embedded labs
site/css/main.css             Responsive reading layout and diagram styles
site/js/source.js             Implementation checkout / published source base
site/js/examples.js           Generated pieces, IDs, decode results, and hashes
site/js/metrics.js            Fertility and embedding-memory calculations
site/js/main.js               Sample selection, calculator, and active contents
site/assets/probe-counts.png  Chart generated from the saved encodings
site/diagrams/index.html      Pipeline, evaluation, and model-boundary diagrams
tests/                       Metric and snapshot checks
```

The practical notebooks stay in [medtok](https://github.com/gaurav36/med-tok); this companion does not duplicate them. The article links to `notebooks/04_custom_vs_general.ipynb` in that checkout.

## Regenerate The Inspection Lab

From the implementation repository, with both full trained artifacts present:

```sh
uv run python ../building-a-medical-tokenizer/scripts/export_examples.py --source .
```

The exporter needs the implementation environment's `tokenizers` package. It reads `artifacts/medical-bpe-pubmed/tokenizer.json` and `artifacts/general-bpe/tokenizer.json`, uses `add_special_tokens=False`, verifies exact reconstruction, and writes the blog's snapshot. It deliberately does not silently use the tiny fallback. The generated snapshot records library version, actual vocabulary sizes, and artifact SHA-256 hashes, not an unverified training-data history.

To regenerate the PNG on Windows, from this notes project in PowerShell:

```powershell
./scripts/render_chart.ps1
```

The renderer uses Node.js to read the snapshot and Windows System.Drawing to produce the image. The checked-in PNG can be viewed on any platform. After changing probes or artifacts, review the prose, image alt text, and count assertions as well as regenerating both files; then run `npm test`.

## GitHub Pages

The [Pages workflow](.github/workflows/pages.yml) runs `npm test` and publishes `site/` directly, like the sibling `tokenization-explanation` project. No backend or build step is required. CSS, scripts, charts, and diagram links are relative, so the same files work locally and under a GitHub Pages repository path. The synthetic input link opens the source file on GitHub; the lab uses the bundled snapshot and does not fetch that file at runtime.

1. Push this project to the `main` branch of `gaurav36/building-a-medical-tokenizer`.
2. In the repository's **Settings > Pages > Build and deployment**, select **GitHub Actions** as the source.
3. Run **Deploy GitHub Pages** from the Actions tab, or push another change to `main`.
4. After deployment succeeds, open <https://gaurav36.github.io/building-a-medical-tokenizer/>.

GitHub Pages derives the path from the repository name: `building-a-medical-tokenizer`. The workflow itself is independent of the repository name. Adding the workflow does not publish the site by itself; enable GitHub Pages with **GitHub Actions** as the source and wait for a successful deployment.

Implementation links, including no-JavaScript fallbacks, target `https://github.com/gaurav36/med-tok/blob/main`. That repository must be accessible to readers. To use a local implementation checkout instead, clear `repositoryUrl` in [site/js/source.js](site/js/source.js) and set `localDirectory` to its sibling folder name. This local override requires JavaScript and is not suitable for the public deployment.

## License

This project is licensed under the [MIT License](LICENSE).