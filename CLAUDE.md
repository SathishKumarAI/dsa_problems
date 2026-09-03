# CLAUDE.md — dsa_visualizer

VisuAlgo-style DSA learning site. Vanilla HTML/CSS/JS, **no build, no deps** —
open `index.html` or `python -m http.server`. Keep it that way until the backlog
says otherwise.

## Where to look

| Question | File |
|---|---|
| What to build next, and why | `docs/BACKLOG.md` (pick top unchecked P0) |
| What already shipped, session history | `docs/WORKLOG.md` |
| Change → file map, how to add a problem/algorithm | `README.md` |
| Theme, settings gear, sidebar resize, focus mode | `js/ui-prefs.js` |
| Journey playback + progressive unlock engine | `problems/journey.js` |
| Problem content (acts, generators, narrative) | `problems/<slug>-approaches.js` |

## The pedagogy (do not regress this)

- **Progressive disclosure is the product.** Learners never see future approach
  names — no tab bars listing "brute → hash → XOR", no spoiling copy in
  subtitles or problem cards. Locked acts render as a "?" node; the steps chart
  excludes them. Unlock = finish act + explicit "I get it" click, persisted as
  `localStorage["unlocked:<pathname>"]`.
- **Insight before name.** Each approach is introduced by the weakness it fixes;
  the pattern's canonical name is revealed at the end (recap), not the start.
- **Strategy: depth before breadth.** Flagship = Two Sum + two-pointers pattern
  built to completion (BACKLOG items 1–8) before adding more problems.

## Working agreements (learned this repo)

- One backlog item = one `type/scope-slug` branch = one PR, squash-merged; check
  the item off in `docs/BACKLOG.md` **in the same commit** as the work.
- Verification = `node js/test_sorts.js` + `node problems/test_*.js` **plus** a
  live browser check of the actual behavior (Chrome devtools MCP; computed
  styles/localStorage round-trips, not code reading). UI has no automated tests
  yet — BACKLOG #21.
- Content files must stay node-eval'able (DOM-free); tests eval them without
  `journey.js`. Anything touching `location`/`document` in `journey.js` goes
  inside the `typeof document !== "undefined"` guard.
- Python snippets match pseudocode line-for-line — highlight sync depends on it.
- Every UI pref goes through `js/ui-prefs.js` + `:root` CSS vars; respect
  `reduce-motion` in any new animation.
- Palette: Catppuccin Mocha (dark) / Latte (light), vars in `style.css` only.

## Traps

- `git add` warns LF→CRLF on Windows — harmless, ignore.
- Settings gear + resize handle are **JS-injected**; don't hunt for their markup
  in the HTML files.
- The footer speed slider and the gear's default-speed slider two-way sync via
  dispatched `input` events; page scripts assign `oninput` before
  DOMContentLoaded, so the order works — don't move `ui-prefs.js` out of `<head>`.
