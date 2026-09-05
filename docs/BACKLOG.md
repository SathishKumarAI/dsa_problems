# Backlog — what to build next, and why that order

One item = one `type/scope-slug` branch = one PR, squash-merged; check the item off **in the
same commit** as the work and add a row to `FEATURES.md`. Pick the top unchecked P0.

Legacy item numbers (`legacy/visualizer/docs/BACKLOG.md` #1–#52) are referenced where an item is
a port; the original implementation is the reference, not the spec — the React port may do less.

## P0 — parity that protects the pedagogy

| # | Item | Why | Size | Ref |
|---|---|---|---|---|
| B1 | ☐ **Unify the flagship walkthroughs** — the practice-set pages for Pair With Target Sum and Single Number render their Walkthrough tab from the journey engine (`api.run` on the sample) instead of the hand-written `walkthrough` frames. | Two sources of truth for the same problem drift; the journey is the richer one. | S | PRD open question 1 |
| B2 | ☑ **UI smoke test** — `npm run test:ui`: `vite preview` + the system Chrome over CDP, no new dependencies. 18 checks: every route renders with a clean console, the earn loop writes the ledger, deep links (honoured, followed in-app, ignored when locked), corner-case loading, `f` / `?`, settings persistence, 390 px. Shipped 2026-09-05 (`test/ui-smoke`); it caught a real deep-link bug on its first run. Not yet in CI (no CI exists). | Every UI branch was verified by hand over CDP; that does not scale. | M | legacy #21 |
| B3 | ☑ **Settings dialog** — speed, motion dial, code tab, reading column, reset prefs, copy/import progress JSON, erase progress. Shipped 2026-09-04 (`feat/shell-panels-help`). Still open: theme toggle (with B14), reduce-motion override. | The motion dial had no UI; export/import is the cross-device story until there is a backend. | M | legacy #5, #22, #45 |
| B4 | ☑ **Collapsible rails** — sidebar and reading column each close from a button at their foot into a thin rail that keeps the button; both states persist. Shipped 2026-09-04 (`feat/journey-focus-rails`). The `f` / `Esc` cycling half moved to B26. | The stage is the product; a learner mid-act should be able to remove everything else without losing play/speed. | S | legacy #41 |
| B5 | ☑ **`?` shortcuts dialog** from `lib/shortcuts.ts` (by scope). Shipped 2026-09-04. | The visualizer page listed keys as text; the journey page listed none. | S | legacy #13, #42 |
| B6 | ☐ **Single Number code challenge** — `singleNumber(nums)` with cases (n = 1, loner largest, duplicates), reference = XOR, review items (no map, one loop, `^`). Challenge harness already supports `target`-less functions. | Two Sum has the "prove it" act; Single Number ends on XOR without asking the learner to write it. | S | — |
| B7 | ☐ **Merge-sort write pulse + discard fade** in `BarsView` — `set` steps scale-pulse, `discard` fades instead of greying. | The bars FLIP on swaps; merge sort's writes still teleport. | S | legacy #44 |
| B8 | ☑ **Catalogue masking** — a pattern name is hidden only while a journey that reveals it is *started and unfinished* (`Journey.reveals` → `lib/disclosure.ts`); sidebar rows, the home grid, the pattern page heading and the where-you-are line all obey it, and one click ("show names anyway", stored in `spoilers`) turns it off for good. Shipped 2026-09-05 (`feat/disclosure-mask`). | The one rule the pedagogy rests on had a known leak in the shell. | S | legacy #52 |

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
| B22 | ☑ **Code splitting** — see F1. Shipped 2026-09-04 (`perf/code-splitting`). | Vite warned above 500 kB. | S | build output |
| B23 | ☐ **Server-side challenge check** (`POST /api/challenge/:slug/check`) in a real sandbox (isolated-vm or a worker with resource limits) — only if a non-browser client appears. | `node:vm` is not a sandbox; don't ship it as one. | L | PRD open question 2 |
| B24 | ☐ **Sync backend** — smallest possible store keyed by a login-less token, syncing the same JSON as B3's export. Only after export/import friction is proven. | Real backend only when the need is real. | L | legacy #23 |
| B26 | ☑ **Focus key** — `f` closes both rails / reopens both (`Esc` is left to dialogs). Shipped 2026-09-04 with hover-peek on closed rails. | Mouse-free focus for a keyboard-driven page. | S | legacy #41 |
| B25 | ☐ **Retire `legacy/visualizer/`** once B3–B5, B9–B11, B13, B15–B17, B20 have shipped or been explicitly dropped. | It is reference material, not product; delete it when nothing left in it is un-ported. | S | — |

## Bugs found by the gates

| # | Bug | Found by | State |
|---|---|---|---|
| G4 | The sidebar footer's where-you-are line named the masked pattern (`DSA · pattern · Two Pointers`) while the mask hid it everywhere else. | B8's masking test | ☑ fixed in the same PR |
| G1 | A deep link pasted while the same journey was already open changed the hash but not the act — `?act=` was read only in a `useState` initializer, and nothing remounts on a hash change. | B2's deep-link test | ☑ fixed 2026-09-05 (render-time adjust in `use-journey.ts`, guarded by `unlocked`; regression test added) |
| G2 | `target = -s[k]` produced `-0` on the all-zeros preset, so `[0, -0, 0]` was not equal to `[0, 0, 0]`. | three-sum correctness test | ☑ fixed 2026-09-04 |
| G3 | Two rows holding the same amount drew twice in the hash view (React duplicate key). | browser run | ☑ fixed 2026-09-04 |

## Animations and front-end proposals — for review (2026-09-04)

Not committed to; ordered by my judgement of value ÷ size. P0 rows are ones I would ship without
asking. The problem pipeline itself lives in `PROBLEMS.md` and is not repeated here.

| # | Proposal | Why | Size | Tier |
|---|---|---|---|---|
| F1 | ☑ **Code splitting** — `React.lazy` for the journey and visualizer features (B22). Shipped 2026-09-04: 673.77 kB in one chunk → 400 kB index + 204 kB shared engine/data + lazy 44 / 21 / 9 kB. Follow-up: the sidebar imports `JOURNEYS` from the engine, so the engine chunk is still eager — a slug/title/acts registry would make it lazy too. | Content pages should not download the engine. Mechanical. | S | **P0** |
| F2 | ☑ **Three-language code on the practice set** — `Code {python, java?, cpp?}` on `Problem` and `Solution`, language strip on the problem page sharing the `codeTab` pref; Java + C++ for every approach of Two Sum, Single Number, Triplets Summing to Zero; `data/problems.test.ts` requires all three languages once a problem has a journey. Shipped 2026-09-04 (`feat/practice-code-tabs`). | The explicit ask: full code in Python 3, Java, C++ per approach. Unblocks the pipeline's DoD. | S · content per problem | **P0** |
| F3 | ☐ **Window / stack / bars panel kinds** — `window` (a span over chips + the set beside it), `stack` (vertical chips, push/pop FLIP), `bars` (heights, port from the visualizer with a shaded area). | Wave 1–2 of `PROBLEMS.md` needs exactly these three; one PR each, arriving with the problem that proves it. | M each | **P0** with the problem |
| F4 | ☐ **Corner cases met** — a teal dot on a stepper node once that act has shown a corner-case callout; header counter "cases met 3/4"; +3 XP the first time each case is seen. | The gamified loop the ask describes: the learner *collects* the edge cases instead of reading them. Data already exists (`frame.corner`). | S | P1 |
| F5 | ☐ **Hold indicator on Play** — a thin ring on the Play button that fills while a `hold` frame waits. | Autoplay looks frozen on narrative frames (`hold: 3` = 6 s at default speed); users press Play twice. | S | P1 |
| F6 | ☐ **Live cost meter** — the steps chart grows as you step (bar for the current act fills to the current frame; the others show their totals as ghosts). | Makes "cost" visible during play, not only after. Chart data is already there per act. | S | P1 |
| F7 | ☐ **Tap-to-peek on touch** — tap a closed rail to peek, tap outside to close (hover-peek is mouse-only). | Tablets get the focus mode too. | S | P1 |
| F8 | ☐ **Hash-map resize animation** — when `resized` flips, the bucket grid FLIPs from n to 2n columns with the rehash as one morph. | The doubling is the one moment the "iceberg" view exists for and it currently snaps. | M | P1 |
| F9 | ☐ **Chip trail in cinematic motion** — a fading ghost at the previous position during a FLIP move. | Cinematic mode is currently just slower. | S | P2 |
| F10 | ☐ **Structural panel kinds** — `list` (nodes + arrows), `tree`, `grid`, `dp strip`, `heap`. | Waves 2–3 of the pipeline. Each arrives with its first problem. | M–L each | P1 with the problem |
| F11 | ☐ **Practice-set StepPlayer → journey chips** (part of B1) — the static walkthrough draws with `ChipRow` and the same grammar. | Two chip grammars on one site. | S | P1 |
| F12 | ☐ **Narration typewriter** (off in `calm`/`off` motion) — the note reveals word by word within the frame's hold. | Reading pace matches the hold; cheap delight. | S | P2 |

## Shipped this round (2026-09-04)

- ☑ B4 collapsible rails + a bigger type scale on the journey page (stage 717 → 1280 px at 1440 wide).
- ☑ Third journey: Triplets Summing to Zero (`docs/PROBLEMS.md` #3) with the new `terms` panel kind.
- ☑ F2 three-language code on the practice set (type, tabs, test; 9 approaches × Java + C++).
- ☑ F1 / B22 code splitting: 673.77 kB single chunk → 400 kB index (127 kB gzip) + 204 kB shared engine/data (67 kB gzip) + lazy journey 44 kB, FLIP 21 kB, visualizer 9 kB.
- ☑ Shell: independent scroll panels on the journey page, hover-peek on closed rails, `f` focus key, settings dialog (B3), `?` shortcuts dialog (B5), help dialog, sidebar regrouped DSA / DSA · patterns / SQL / Data science with a where-you-are footer line.
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
