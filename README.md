# dsa.patterns — learn the insight, then the name

One app: a pattern-organised interview practice set (**87 problems** across 10 patterns, SQL drills,
stats flashcards) plus **learning journeys** — problems built all the way down, Brilliant/Khan style:
the need first, approaches unlocked one at a time by the previous one's weakness, predictions
mid-playback, quiz gates, your own code driving the animation, and the pattern named only at the
reveal. **every one of the 87 problems has a journey**, drawn as a chip row, a grid, a tree (heaps reuse
it), a linked list, a DP table or a bar chart — whichever the problem actually is. Plus a sorting /
search / graph visualizer whose bars morph instead of teleporting.

Vite + React 19 + TypeScript + Tailwind v4 + shadcn (base-nova). Catppuccin Mocha and Latte — dark, light or system, switchable in settings.
Node 24 (runs the API and the tests without a build step).

```
npm i
npm run dev        # UI + API on one port   → http://localhost:5173/#/journey/two-sum
npm run check      # tsc -b · eslint · node --test   (must exit 0 before a commit)
npm run test:ui    # + a real browser: routes, the earn loop, rails, deep links (needs Chrome)
npm run build      # production build (static; the API runs in-process)
npm run api        # standalone API on :8787 — see docs/API.md
```

**Docs** live in [`docs/`](docs/README.md) — start with the manifest there. Product:
[`PRD.md`](docs/PRD.md) · what's on screen: [`FEATURES.md`](docs/FEATURES.md) · next:
[`BACKLOG.md`](docs/BACKLOG.md) · later: [`ROADMAP.md`](docs/ROADMAP.md) · how it works:
[`ARCHITECTURE.md`](docs/ARCHITECTURE.md) · the API: [`API.md`](docs/API.md) · adding a
journey: [`AUTHORING.md`](docs/AUTHORING.md) · history: [`WORKLOG.md`](docs/WORKLOG.md).

## Change → file

| Change | File |
|---|---|
| Theme colours, type scale, container widths (all tokens) | `src/index.css` (the decisions: `docs/DESIGN.md`) |
| Routes (`#/journey/…`, `#/algorithms`, `#/p/…`) | `src/lib/route.ts`, `src/App.tsx` |
| Add / edit a **journey** (acts, generators, presets, quiz, challenge) | `src/engine/journeys/<slug>.ts` → register in `src/engine/index.ts` |
| Frame / act / journey / stage-model contracts (incl. `EdgeCase`, frame `corner`) | `src/engine/types.ts` |
| The hash-map bucket arithmetic | `src/engine/hashmap.ts` |
| Sort / search / graph algorithms + their precomputed timelines | `src/engine/algorithms.ts` |
| Content gate (schema, disclosure lint, drain, correctness) | `src/engine/journeys.test.ts` |
| Practice-set gate (ids, three languages) | `src/data/problems.test.ts` |
| Add / edit a **problem** (statement, constraints, ladder, three languages) | `src/data/problems/<pattern>/<id>.ts` → its `index.ts` barrel (map: `src/data/problems/README.md`) |
| Draft code/content with a LOCAL model, and the gates that check it | `scripts/localsmith/` (why and limits: its `README.md`) |
| Which model is trusted with what, and the measured token cost | `docs/MODELS.md` |
| Compile every Java/C++ block (`npm run verify:code`) | `scripts/localsmith/verify.mjs` |
| Run them against the Python oracle (`npm run verify:run`) | `scripts/localsmith/run.mjs` · inputs: `vectors.mjs` · its own checks: `run.test.mjs` |
| Check the VECTORS are strong enough (`npm run verify:vectors`) | `scripts/localsmith/mutate.mjs` · `--suggest` finds a missing case |
| UI smoke test (routes, earn loop, rails, deep links) | `test/ui-smoke.test.mjs` · driver: `test/browser.mjs` |
| **HTTP API** — every endpoint | `src/api/routes.ts` (contract: `docs/API.md`) |
| API transport (HTTP vs in-process) | `src/api/client.ts` |
| Standalone API server / Vite `/api` middleware | `server/index.ts` / `server/vite-api.ts` |
| Journey page layout | `src/features/journey/journey-page.tsx` |
| Journey policy (unlock, quiz, predict, hints, XP, deep links, keys) | `src/features/journey/use-journey.ts` |
| Generic play / pause / seek over frames | `src/features/journey/use-player.ts` |
| Chip grammar (▲ ring ✓ fade) + legend | `src/features/journey/chip-row.tsx` |
| Approach panels (sum, need, sorted, bits, recap) + FLIP scopes | `src/features/journey/panels.tsx` |
| Hash map drawn as a hash map | `src/features/journey/hash-map-view.tsx` |
| Quiz / predict / hint cards · corner-case callout · story-act cards (how to read, bring three inputs) | `src/features/journey/cards.tsx` |
| Code tabs + line highlight | `src/features/journey/code-panel.tsx` |
| Steps chart | `src/features/journey/steps-chart.tsx` |
| Transport, speed, preset / custom input | `src/features/journey/controls.tsx` |
| Code challenge (Worker, scorecard, review, Set 2) | `src/features/journey/challenge-editor.tsx` |
| Act stepper (locked "?" node) | `src/features/journey/act-stepper.tsx` |
| FLIP morph | `src/features/journey/use-flip.ts` |
| Algorithm visualizer page / bars + graph drawing | `src/features/algorithms/algorithms-page.tsx` / `views.tsx` |
| Every localStorage key (progress, XP, prefs) · export / import / erase | `src/lib/store.ts` |
| Whether a pattern's name may be shown yet | `src/lib/disclosure.ts` (journeys declare `reveals`) |
| Help / shortcuts / settings dialogs | `src/components/app-dialogs.tsx` (open state: `src/lib/dialogs.ts`) |
| Keyboard map (`?` renders it) · app-wide keys `?` `f` | `src/lib/shortcuts.ts` · `src/components/global-keys.tsx` |
| Sidebar hover-peek | `src/components/ui/sidebar.tsx` (`data-peek`) |
| Sidebar / home / problem page / list | `src/components/app-sidebar.tsx` · `home-view.tsx` · `problem-detail.tsx` · `problem-list.tsx` |
| Practice-set content (problems, patterns, SQL, flashcards) | `src/data/…` |
| Static walkthrough player (practice set) | `src/components/step-player.tsx` |

Adding a journey: one content file + one registry line + a `Problem` with the same id; the
sidebar, home card, problem-page CTA, API and tests pick it up. Full guide: `docs/AUTHORING.md`.

## Layout

```
src/engine      pure TS, DOM-free — runs in node, in the browser, on the server
src/api         routes.ts (the API) · client.ts (transport)
src/features    journey/ · algorithms/  (React over the engine's view models)
src/components  shell (sidebar, dialogs, global keys) + practice-set views + shadcn ui/
src/data        practice-set content
src/lib         store · route · dialogs · shortcuts · utils
server/         API mounts (node:http, Vite middleware)
docs/           the manifest and the documents it names
legacy/visualizer   the original vanilla-JS visualizer, history preserved — reference only, not built
```

Imports point downward (features → api → engine → data/lib). `engine/` and `api/` use `.ts`
extensions on relative imports so Node can run them unbundled.

## History

Merged 2026-09-04 from two repos: this practice site and
[`SathishKumarAI/dsa_visualizer`](https://github.com/SathishKumarAI/dsa_visualizer) (45 PRs,
kept under `legacy/visualizer/` with full git history). All problem statements, explanations,
solutions, SQL questions and flashcards are original write-ups of classic, public-knowledge
interview material.
