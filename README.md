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
| Settings gear (theme, default speed, reduce motion), sidebar resize, focus mode | `js/ui-prefs.js` |
| Page structure, control labels, legend | `index.html` |
| Content catalog (titles, act counts) for landing hero + roadmap | `js/catalog.js` |
| Correctness check (`node js/test_sorts.js`) | `js/test_sorts.js` |
| Journey playback engine, journey bar, chart, wiring (shared) | `problems/journey.js` |
| Journey page styles — chips, narration, chart (shared) | `problems/journey.css` |
| Problem list page | `problems/index.html` |
| Single Number acts, generators, narrative, presets | `problems/single-number-approaches.js` + `single-number.html` |
| Two Sum acts, generators, narrative, presets | `problems/two-sum-approaches.js` + `two-sum.html` |
| Correctness checks (`node problems/test_single_number.js`, `test_two_sum.js`) | `problems/test_*.js` |
| Two-pointers pattern page (shape → converge → chase → build) | `patterns/two-pointers.js` + `two-pointers.html` + `test_two_pointers.js` |
| Structure explorers (need → mechanics → application) | `structures/<ds>.js` + `<ds>.html` + `test_structures.js` |
| Content-schema check (`node problems/validate.js`) | `problems/validate.js` |
| DOM smoke tests (`npm test` runs everything; needs `npm i` once) | `problems/test_dom.js` |

Problem pages are learning journeys: a layman story act, then approaches in
naive→optimal order, each introduced by the insight that fixes the previous
one's weakness. Approaches unlock progressively — the learner finishes an act,
clicks "I get it", and only then sees the next approach's name (progress in
localStorage, key `unlocked:<pathname>`); locked acts render as a "?" node and
the steps chart never includes them. Edge-case presets include contract-breaking inputs on purpose —
watching XOR lie on two singles teaches why the problem's promise matters.

Adding a problem = one content file (`problems/<slug>-approaches.js` defining
APPROACHES / ACT_ORDER / RESOURCES / PAGE plus a PROBLEM aggregate at the end)
+ one html file loading it before `journey.js`, + a card in `problems/index.html`
and a `test_<slug>.js`. `node problems/validate.js` checks the whole shape —
required fields, quiz/predict schemas, generators draining on PROBLEM.sample,
and that every code tab matches pseudocode line-for-line (highlight sync).

Algorithms: bubble, selection, insertion, merge, quick, heap sorts + binary
search + graph traversals (BFS, DFS, Dijkstra — `kind: "graph"`, drawn as an
SVG node/edge view; generators yield `visit`/`frontier`/`edge`/`relax` steps).
Each is a generator yielding steps (`compare` / `swap` / `set` / `pivot` / `sorted` /
`discard`) — the visualizer knows nothing about algorithm internals, so adding an
algorithm is one entry in `ALGORITHMS` plus one tab button in `index.html`.
An algorithm with `kind: "search"` gets a sorted copy of the array and the target value.

Playback is a precomputed frame timeline (generator drained up front), which is what
powers step-back, the scrub slider and the step counter. Keys: space play/pause,
arrows step, r reset.
