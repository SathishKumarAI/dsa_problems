# Backlog — what to build next, and why that order

One item = one `type/scope-slug` branch = one PR, squash-merged; check the item off **in the
same commit** as the work and add a row to `FEATURES.md`. Pick the top unchecked P0.

Legacy item numbers (`legacy/visualizer/docs/BACKLOG.md` #1–#52) are referenced where an item is
a port; the original implementation is the reference, not the spec — the React port may do less.

## P0 — parity that protects the pedagogy

| # | Item | Why | Size | Ref |
|---|---|---|---|---|
| B1 | ☐ **Unify the flagship walkthroughs** — the practice-set pages for Pair With Target Sum and Single Number render their Walkthrough tab from the journey engine (`api.run` on the sample) instead of the hand-written `walkthrough` frames. | Two sources of truth for the same problem drift; the journey is the richer one. | S | PRD open question 1 |
| B2 | ☐ **UI smoke test in CI** — a `node --test` that boots the app in jsdom (or a Playwright run) and checks: every route renders, zero console errors, quiz → reveal writes `unlocked=2`. | Every UI branch this session was verified by hand over CDP; that does not scale past two journeys. | M | legacy #21 |
| B3 | ☐ **Settings gear** — theme (needs B14), default speed, motion dial (calm/normal/cinematic/off — the pref already exists in `lib/store.ts`), reduce-motion override, restart journey, export/import progress JSON. | The motion dial has no UI; export/import is the cross-device story until there is a backend. | M | legacy #5, #22, #45 |
| B4 | ☑ **Collapsible rails** — sidebar and reading column each close from a button at their foot into a thin rail that keeps the button; both states persist. Shipped 2026-09-04 (`feat/journey-focus-rails`). The `f` / `Esc` cycling half moved to B26. | The stage is the product; a learner mid-act should be able to remove everything else without losing play/speed. | S | legacy #41 |
| B5 | ☐ **`?` shortcuts overlay** on every page, built from a route → shortcuts table. | The visualizer page lists keys as text; the journey page lists none. | S | legacy #13, #42 |
| B6 | ☐ **Single Number code challenge** — `singleNumber(nums)` with cases (n = 1, loner largest, duplicates), reference = XOR, review items (no map, one loop, `^`). Challenge harness already supports `target`-less functions. | Two Sum has the "prove it" act; Single Number ends on XOR without asking the learner to write it. | S | — |
| B7 | ☐ **Merge-sort write pulse + discard fade** in `BarsView` — `set` steps scale-pulse, `discard` fades instead of greying. | The bars FLIP on swaps; merge sort's writes still teleport. | S | legacy #44 |
| B8 | ☐ **Disclosure lint for the shell** — the sidebar/home may not name a pattern a locked act teaches ("Two Pointers" appears as a pattern name while Two Sum act 3 is locked). Decide: mask the pattern row until earned, or accept that the practice set is a separate surface. | The one rule the pedagogy rests on has a known leak in the new shell; the legacy repo's uncommitted `feat/disclosure-lint` branch solved the same leak with `catalogDisplay()`. | S | legacy #52 |

## P1 — the curriculum around the journeys

| # | Item | Why | Size | Ref |
|---|---|---|---|---|
| B9 | ☐ **Roadmap page** — patterns → problems DAG with lock/done/due states, replacing the flat home grid for the journey track. | A visible path is the difference between a toy and a curriculum. | M | legacy #9 |
| B10 | ☐ **Progress dashboard** — per-journey acts done, quizzes passed, day streak, XP, scorecard history, stalls (B16). | Brilliant-style reinforcement; the data is already in the store. | M | legacy #10 |
| B11 | ☐ **Two-pointers pattern page** — shape → converge → chase → build (capstone in the challenge harness), linked from Two Sum's recap. Port `legacy/visualizer/patterns/two-pointers.js` to `engine/journeys/pattern-two-pointers.ts` (kind `pattern`). | The recap link currently lands on the practice-set pattern list, not the earned shape. | L | legacy #1, #29 |
| B12 | ☐ **Command palette** (Ctrl/⌘+K) — jump to any page, act, pattern, problem. | Six destinations × 5–7 acts each beats a menu. | M | legacy #48 |
| B13 | ☐ **Structure explorers** — stack, queue (port), then hash map (new, reusing `HashMapView`: insert / lookup / delete, tombstones, bad hash vs good, open addressing beside chaining). | "Need before name" for the structures the journeys reach for. | L | legacy #33, #38 |
| B14 | ☐ **Light theme** — Catppuccin Latte tokens in `:root`, AA-check the chip grammar and the chart on it, a toggle in B3. | The `:root` block is currently neutral greys nobody sees. | M | legacy #2, #20 |
| B15 | ☐ **Spaced repetition** — finishing a journey schedules reviews (1/3/7/14/30 days); home surfaces "due" journeys. | Retention is the goal; one pass teaches, review keeps. | M | legacy #24 |
| B16 | ☐ **Stall analytics (local)** — seconds per act + quits; shown in B10. No network. | Tells the author which explanation is failing. | S | legacy #25 |
| B17 | ☐ **First-visit tour** — three spotlights: play, timeline, the "?" locked node. | Controls are keyboard-rich and invisible to newcomers. | S | legacy #12 |

## P2 — quality and reach

| # | Item | Why | Size | Ref |
|---|---|---|---|---|
| B18 | ☐ **Unit tests for `lib/store.ts`** — `streakOf` (today / yesterday / gap), `updateStored`, corrupt JSON fallback. | The store is the one module every feature trusts and it has no test. | S | — |
| B19 | ☐ **Undo toast on "restart journey"** (5 s) instead of a confirm dialog. | Restart is one click and irreversible today. | S | — |
| B20 | ☐ **Timed story challenge** ("The Vault", gated on the earned pattern). | Retrieval practice with stakes. | M | legacy #35 |
| B21 | ☐ **Per-moment OG preview** for shared `?act=&step=` links. | Sharing a moment is the only viral surface a no-backend site has. | L | legacy #51 |
| B22 | ☐ **Code splitting** — lazy-load the journey and visualizer features; the bundle is 644 kB (203 kB gzip) in one chunk. | Vite warns above 500 kB; content pages don't need the engine. | S | build output |
| B23 | ☐ **Server-side challenge check** (`POST /api/challenge/:slug/check`) in a real sandbox (isolated-vm or a worker with resource limits) — only if a non-browser client appears. | `node:vm` is not a sandbox; don't ship it as one. | L | PRD open question 2 |
| B24 | ☐ **Sync backend** — smallest possible store keyed by a login-less token, syncing the same JSON as B3's export. Only after export/import friction is proven. | Real backend only when the need is real. | L | legacy #23 |
| B26 | ☐ **Focus keys** — `f` cycles both rails open → both closed → back; `Esc` reopens. Never hide the controls. Builds on B4's two toggles. | Mouse-free focus for a keyboard-driven page (space / ← / → / r already work). | S | legacy #41 |
| B25 | ☐ **Retire `legacy/visualizer/`** once B3–B5, B9–B11, B13, B15–B17, B20 have shipped or been explicitly dropped. | It is reference material, not product; delete it when nothing left in it is un-ported. | S | — |

## Shipped this round (2026-09-04)

- ☑ B4 collapsible rails + a bigger type scale on the journey page (stage 717 → 1280 px at 1440 wide).
- ☑ Corner cases as content: `edgeCases` per journey (4 + 4), story-act cards (how to read · bring three inputs), in-play callout on `corner`-tagged frames, gated by a test that every case is explained on its preset. New presets `tiny`, `negatives` (Two Sum), `zero` (Single Number).

- ☑ Repo merge with history (`legacy/visualizer` subtree, 47 commits preserved).
- ☑ Engine port: typed, DOM-free, view models instead of HTML strings; content gate as tests.
- ☑ HTTP API (`API.md`) mounted three ways from one route table.
- ☑ Journey page in React with the full act arc for Two Sum and Single Number, including predict,
  quiz gates, hint ladder, XP, deep links, the code challenge with trace playback, scorecard,
  self-review, second set, adaptive difficulty.
- ☑ Hash map drawn as buckets + chains + load meter; bit rows; sorted view; recap table.
- ☑ Algorithm visualizer with FLIP bars and an SVG graph view.
- ☑ Docs set: PRD, FEATURES, BACKLOG, ROADMAP, ARCHITECTURE, API, AUTHORING, WORKLOG, RESEARCH.
