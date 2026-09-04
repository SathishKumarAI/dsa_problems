# CLAUDE.md — dsa_problems (dsa.patterns)

One Vite + React + TS app: practice set + learning journeys + algorithm visualizer, over a
DOM-free engine with an HTTP API. Node 24 runs `server/` and the tests unbundled.

## Where to look

| Question | File |
|---|---|
| What to build next, and why | `docs/BACKLOG.md` (top unchecked P0) |
| What exists on screen, every button, its status | `docs/FEATURES.md` |
| What IS this box, who owns it, how data flows | `docs/ARCHITECTURE.md` |
| Change → file | `README.md` |
| How to add a journey without spoiling it | `docs/AUTHORING.md` |
| The API contract | `docs/API.md` |
| Where the last session stopped | `STATUS.md` |
| What shipped when | `docs/WORKLOG.md` |
| Why an item exists | `docs/RESEARCH.md`, `docs/PRD.md` |

## The pedagogy (do not regress this)

- **Progressive disclosure is the product.** No unearned act or pattern name anywhere a learner
  can see: not in the stepper, banners, chart, hints, quiz, URL. Locked acts are one "?" node.
  `unlocked:<slug>` is written only by the reveal click in `use-journey.ts` (and restart).
- **Insight before name.** An act opens with the previous act's weakness; names arrive in the recap.
- **The content test is the gate.** `src/engine/journeys.test.ts` enforces schema, drain, notes,
  line-for-line code tabs and the disclosure rule. Don't weaken it; extend it.

## Working agreements

- Branch per change (`type/scope-slug`), conventional commits, check the backlog item off and
  add a `FEATURES.md` row **in the same commit**.
- `npm run check` (tsc, eslint, node tests) must exit 0. Then verify in a browser — node tests
  are necessary, not sufficient. Until B2 ships there is no UI test; drive the page.
- Engine stays DOM-free and JSON-safe; `.ts` extensions on relative imports in `engine/`/`api/`.
- Every localStorage key goes through `src/lib/store.ts`; palette only in `src/index.css`.
- `legacy/visualizer/` is read-only reference (excluded from tsc/eslint/prettier). Port from it;
  never import from it. Delete it when B25 says so.

## Traps

- **React Compiler lint rules** (`react-hooks` v7): no sync `setState` in effects, no ref reads in
  render, no mutating frames. Use render-time adjusts (`if (x !== prev) { setPrev(x); … }`) or
  derive. `use-player.ts` and `controls.tsx` show the pattern.
- `git add` warns LF→CRLF on Windows — harmless.
- The chrome-devtools MCP profile can be held by another session; a private headless Chrome on
  `--remote-debugging-port=9333` driven over CDP works (see `docs/WORKLOG.md` 2026-09-04).
- `innerText` reflects `text-transform: uppercase` — match case-insensitively in browser checks.
- `params` passed to `DataControls` must be signature-stable; it is compared by JSON, not identity.
- Dijkstra's `Infinity` becomes `null` over JSON; `GraphView` handles both.
