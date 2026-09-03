# DSA Visualizer — Sorting

VisuAlgo-style sorting visualizer. Vanilla HTML/CSS/JS, no dependencies, no build.
Open `index.html` or `python -m http.server`.

| Change | File |
|---|---|
| Anything visual — colours, spacing, layout | `style.css` |
| Add/fix a sort algorithm or its pseudocode | `js/algorithms.js` |
| Bar rendering, playback, timeline scrub, stats | `js/visualizer.js` |
| Buttons, sliders, keyboard shortcuts, array generators, startup | `js/main.js` |
| Page structure, control labels, legend | `index.html` |
| Correctness check (`node js/test_sorts.js`) | `js/test_sorts.js` |

Algorithms: bubble, selection, insertion, merge, quick, heap sorts + binary search.
Each is a generator yielding steps (`compare` / `swap` / `set` / `pivot` / `sorted` /
`discard`) — the visualizer knows nothing about algorithm internals, so adding an
algorithm is one entry in `ALGORITHMS` plus one tab button in `index.html`.
An algorithm with `kind: "search"` gets a sorted copy of the array and the target value.

Playback is a precomputed frame timeline (generator drained up front), which is what
powers step-back, the scrub slider and the step counter. Keys: space play/pause,
arrows step, r reset.
