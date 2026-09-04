# Design: merge `dsa_visualizer` into `dsa_problems` — one product

Date: 2026-09-04 · Status: approved by default (autonomous session; the user
asked for the merge and was not available for the approval gate — every
assumption is listed in §8 so it can be overturned cheaply).

## 1. Goal

One repository, one app. The pattern-organised practice site (React + Vite +
shadcn) absorbs the vanilla-JS learning-journey visualizer. Two problems get
the full journey treatment first — **Two Sum** and **Single Number** — with
the stage graphics rebuilt, the engine rewritten as typed, DOM-free modules,
and a small HTTP API in front of the same engine so the content can be served
to any client. Everything else from the visualizer stays reachable under
`legacy/visualizer/` (history imported via subtree merge) until ported.

## 2. Non-goals (this increment)

- Porting the pattern page, structure explorers, challenge mode, tour, SRS,
  stall analytics, export/import. All tracked in `docs/BACKLOG.md`.
- A persistent backend. The API is stateless; progress stays in localStorage.
- Running learner code on the server. The code challenge runs in a browser
  Worker exactly as before.

## 3. Architecture

```
src/
  engine/        pure TS, DOM-free, node-testable (node --test)
    types.ts       Frame / Act / Journey / StageModel contracts
    random.ts      randInt, shuffled, distinct
    hashmap.ts     bucket layout model (no HTML) — the "iceberg"
    algorithms.ts  sorts, binary search, BFS/DFS/Dijkstra generators
    journeys/      two-sum.ts, single-number.ts (content + generators + view fns)
    index.ts       JOURNEYS registry
  api/
    routes.ts      route(method, path, body) -> {status, body}. The whole API.
    client.ts      typed client; HTTP in dev (Vite middleware) or in-process
  features/
    journey/       React: page, useJourney hook, stage views, controls, chart
    algorithms/    React: sorting/search/graph visualizer
  lib/store.ts     localStorage-backed useSyncExternalStore (all progress keys)
  lib/route.ts     hash router (no dependency)
server/
  index.ts         node:http server on routes.ts  (node server/index.ts)
  vite-api.ts      Vite dev middleware on the same routes.ts
docs/              PRD, FEATURES, BACKLOG, ROADMAP, ARCHITECTURE, API, AUTHORING, WORKLOG, RESEARCH
legacy/visualizer/ the imported original — reference only, excluded from build/lint
```

**Imports point downward:** features → engine/api → lib. `engine/` never
imports React or touches `document`.

### 3.1 The frame contract (unchanged in spirit)

An act's `run(data, ctx)` is a generator yielding plain JSON-safe objects. The
engine reads `note` (required), `line`, `hold`, `predict`, `answer`,
`noChips`; everything else is the act's private state, interpreted by its own
`view(frame, data) -> StageModel`.

### 3.2 The view model (new)

The old `render()` wrote HTML strings into the DOM. The new `view()` returns
**data**: `{ chips: ChipModel[] | null, panel: PanelModel }`, where
`PanelModel` is a discriminated union (`none | story | sum | need | hash |
sorted | bits | recap | challenge`). React components draw it. This is what
makes the content node-testable and the API able to ship frames over the wire.

### 3.3 The API

| Method | Path | Body → Response |
|---|---|---|
| GET | `/api/problems` | → problem summaries incl. `journey` slug when one exists |
| GET | `/api/problems/:id` | → the full problem |
| GET | `/api/journeys` | → `[{slug, title, acts}]` |
| GET | `/api/journeys/:slug` | → journey meta (acts without functions, presets, sample) |
| POST | `/api/journeys/:slug/preset` | `{preset}` → `{data, info}` |
| POST | `/api/journeys/:slug/classify` | `{data}` → `{ok, warning?}` |
| POST | `/api/journeys/:slug/run` | `{act, data, trace?}` → `{frames}` |
| POST | `/api/journeys/:slug/chart` | `{data, upto}` → `[{act, steps}]` |

`routes.ts` is a pure function so the same table serves the Vite middleware,
the standalone server and the in-process client.

### 3.4 State

`lib/store.ts` owns every localStorage key. Keys: `solved`, `unlocked:<slug>`,
`quizzes:<slug>`, `xp`, `activity-days`, `scorecard:<slug>`. `unlocked:` is
only ever advanced by the explicit "I get it" click.

### 3.5 UI

Journey page = stage (left, the data + narration + approach panel + timeline +
controls) and a side column (insight, tools, code with tabs and line
highlight, takeaways, steps chart, legend, resources). Act stepper on top;
locked acts are one anonymous "?" node. Same Catppuccin Mocha tokens the app
already uses; chips carry a shape channel per role; every re-render FLIPs.

## 4. Pedagogy invariants carried over

1. No unearned act name, pattern name or complexity is ever visible.
2. Insight before name; the pattern is named in the recap.
3. Every frame has a `note`. Code tabs match pseudocode line-for-line.
4. Predict pauses playback before the frame renders; scrubbing skips it.
5. Quiz gates the unlock button; wrong answers explain and allow retry.

Enforced by `src/engine/journeys.test.ts` (schema, drain, line counts,
disclosure lint) — the old `validate.js` + `lint_disclosure.js` as one test.

## 5. Testing

- `npm test` → `node --test` over `src/**/*.test.ts` (engine, api, store).
- `npm run build` → `tsc -b && vite build`.
- Browser verification via Chrome devtools MCP: both journeys play end to end,
  unlock round-trips, API calls visible in the network tab.

## 6. Increments (branches)

This session ships on one branch, `feat/merge-visualizer`, as a sequence of
conventional commits (baseline → legacy import → engine → api → ui → docs).
Future items in `docs/BACKLOG.md` are one branch each.

## 7. Risks

- FLIP under React: rects are measured at the previous commit, so a window
  resize between frames yields one wrong morph. Accepted.
- HTTP mode round-trips frames per act switch; a 20-element brute-force act is
  ~200 frames, under 50 KB. Fine.

## 8. Assumptions made without the user

- "Two problems" = Two Sum and Single Number (the two journeys that exist).
- "API calls" = an HTTP API over the same engine, not a persistent backend.
- The old visualizer folder `../dsa_visualizer` is left untouched; archiving
  it is the user's call (its `feat/disclosure-lint` branch has uncommitted
  work; its intent — masked catalog entries — is ported).
- Sorting/graph visualizer is ported in a reduced form (bars + graph, play,
  step, scrub, speed, size); settings gear, tour, focus tiers are backlog.
