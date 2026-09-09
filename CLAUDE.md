# CLAUDE.md — dsa_problems (dsa.patterns)

One Vite + React + TS app: practice set + learning journeys + algorithm visualizer, over a
DOM-free engine with an HTTP API. Node 24 runs `server/` and the tests unbundled.

## Where to look

| Question | File |
|---|---|
| What to build next, and why | `docs/BACKLOG.md` (top unchecked P0) |
| Which **problem** is next, and what "done" means for one | `docs/PROBLEMS.md` |
| What exists on screen, every button, its status | `docs/FEATURES.md` |
| What IS this box, who owns it, how data flows | `docs/ARCHITECTURE.md` |
| Change → file | `README.md` |
| How to add a journey without spoiling it | `docs/AUTHORING.md` |
| The API contract | `docs/API.md` |
| Where the last session stopped | `STATUS.md` |
| Measured UI/UX findings and the fix list | `docs/UX-AUDIT.md` (U1–U14 chrome, V1–V10 content, P1–P4 panels) |
| Whether a panel still fits its biggest input | `test/panel-audit.test.mjs` — runs inside `npm run test:ui`, one test per panel kind, and still prints the table |
| Which type step / spacing / radius / width / colour role to use | `docs/DESIGN.md` |
| How the animations work, and how to build one in Python / for an LLM | `docs/VISUALIZING.md` |
| Which model wrote what, and what it cost in tokens | `docs/MODELS.md` |
| What shipped when | `docs/WORKLOG.md` |
| Why an item exists | `docs/RESEARCH.md`, `docs/PRD.md` |

## The pedagogy (do not regress this)

- **Progressive disclosure is the product.** No unearned act or pattern name anywhere a learner
  can see: not in the stepper, banners, chart, hints, quiz, URL. Locked acts are one "?" node.
  `unlocked:<slug>` is written only by the reveal click in `use-journey.ts` (and restart).
- **Insight before name.** An act opens with the previous act's weakness; names arrive in the recap.
- **Corner cases are content, taught twice.** `journey.edgeCases` (technique-neutral prose, read on
  the story act) + frames tagged `corner: key` (explained in play). The test requires every case to
  be tagged on its own preset.
- **The content test is the gate.** `src/engine/journeys.test.ts` enforces schema, drain, notes,
  line-for-line code tabs and the disclosure rule. Don't weaken it; extend it.
- **Every corner case must be TAGGED by a frame on its own preset**, and every tag must name a
  declared edge. Six of the eight journeys written on 2026-09-09 failed one of those two on the
  first run; the gate caught all six.

## Working agreements

- Branch per change (`type/scope-slug`), conventional commits, check the backlog item off and
  add a `FEATURES.md` row **in the same commit**.
- `npm run check` (tsc, eslint, node tests) must exit 0, and `npm run test:ui` (real Chrome) for
  anything on screen. Touching a Java or C++ block also owes `npm run verify:code` (it compiles)
  and `npm run verify:run` (it agrees with the Python). All four are necessary, none is
  sufficient: drive the page for timing, the Worker challenge, hover and anything about colour.
- Engine stays DOM-free and JSON-safe; `.ts` extensions on relative imports in `engine/`/`api/`.
- Every localStorage key goes through `src/lib/store.ts`; palette only in `src/index.css`.
- **Reach for the role, not the size**: `text-body` for a sentence, `text-meta` for a label, never a
  raw `text-[13px]`. Prose is capped at `35em` — `ch` is the "0" glyph, not a character, so `68ch`
  renders ~90. The six steps and the rest of the system are in `docs/DESIGN.md`.
- `legacy/visualizer/` is read-only reference (excluded from tsc/eslint/prettier). Port from it;
  never import from it. Delete it when B25 says so.

## Traps

- **`localStorage` written while a page is mounted is undone** — the store caches per key. Write it
  on another route, then navigate for real (that is what `test/ui-smoke.test.mjs` does).
- **Applying a preset restarts the act**, so a script that picks the act first measures the story act.
- **A backslash in a template literal sent to the page is consumed twice** (`/^\d\d/` arrives as
  `/^dd/`). Use a character class.
- `-x` on a zero is `-0` and fails `deepEqual`; write `0 - x` when a value can be zero (three-sum hash act).

- **React Compiler lint rules** (`react-hooks` v7): no sync `setState` in effects, no ref reads in
  render, no mutating frames. Use render-time adjusts (`if (x !== prev) { setPrev(x); … }`) or
  derive. `use-player.ts` and `controls.tsx` show the pattern.
- `git add` warns LF→CRLF on Windows — harmless. But a JS template literal normalises CRLF to LF
  in its VALUE, so a string imported from `src/data/**` is never found verbatim in the file on
  disk; normalise before matching.
- Windows refuses to launch a freshly compiled `.exe` about 5 % of the time (`spawnSync …
  UNKNOWN`). Not a code problem — `verify:run` counts those apart from real disagreements.
- The chrome-devtools MCP profile can be held by another session; a private headless Chrome on
  `--remote-debugging-port=9333` driven over CDP works (see `docs/WORKLOG.md` 2026-09-04).
- `innerText` reflects `text-transform: uppercase` — match case-insensitively in browser checks.
- `params` passed to `DataControls` must be signature-stable; it is compared by JSON, not identity.
- Dijkstra's `Infinity` becomes `null` over JSON; `GraphView` handles both.
