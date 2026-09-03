# DSA Visualizer

VisuAlgo-style visualizer: sorting/searching on `index.html`, plus LeetCode
problem pages under `problems/` (one page per problem, each comparing all its
approaches step-by-step). Vanilla HTML/CSS/JS, no dependencies, no build.
Open `index.html` or `python -m http.server`.

| Change | File |
|---|---|
| Anything visual — colours, spacing, layout | `style.css` |
| Add/fix a sort algorithm or its pseudocode | `js/algorithms.js` |
| Bar rendering, playback, timeline scrub, stats | `js/visualizer.js` |
| Buttons, sliders, keyboard shortcuts, array generators, startup | `js/main.js` |
| Theme (dark/light), sidebar resize, focus mode | `js/ui-prefs.js` |
| Page structure, control labels, legend | `index.html` |
| Correctness check (`node js/test_sorts.js`) | `js/test_sorts.js` |
| Journey playback engine, journey bar, chart, wiring (shared) | `problems/journey.js` |
| Journey page styles — chips, narration, chart (shared) | `problems/journey.css` |
| Problem list page | `problems/index.html` |
| Single Number acts, generators, narrative, presets | `problems/single-number-approaches.js` + `single-number.html` |
| Two Sum acts, generators, narrative, presets | `problems/two-sum-approaches.js` + `two-sum.html` |
| Correctness checks (`node problems/test_single_number.js`, `test_two_sum.js`) | `problems/test_*.js` |

Problem pages are learning journeys: a layman story act, then approaches in
naive→optimal order, each introduced by the insight that fixes the previous
one's weakness. Edge-case presets include contract-breaking inputs on purpose —
watching XOR lie on two singles teaches why the problem's promise matters.

Adding a problem = one content file (`problems/<slug>-approaches.js` defining
APPROACHES / ACT_ORDER / RESOURCES / PAGE) + one html file loading it before
`journey.js`, + a card in `problems/index.html` and a `test_<slug>.js`.
Python snippets must match pseudocode line-for-line (highlight sync relies on it).

Algorithms: bubble, selection, insertion, merge, quick, heap sorts + binary search.
Each is a generator yielding steps (`compare` / `swap` / `set` / `pivot` / `sorted` /
`discard`) — the visualizer knows nothing about algorithm internals, so adding an
algorithm is one entry in `ALGORITHMS` plus one tab button in `index.html`.
An algorithm with `kind: "search"` gets a sorted copy of the array and the target value.

Playback is a precomputed frame timeline (generator drained up front), which is what
powers step-back, the scrub slider and the step counter. Keys: space play/pause,
arrows step, r reset.
