# dsa.patterns — learn the insight, then the name

[![gates](https://github.com/SathishKumarAI/dsa_problems/actions/workflows/gates.yml/badge.svg)](.github/workflows/gates.yml)
[![MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)
[![problems](https://img.shields.io/badge/problems-127-brightgreen.svg)](docs/PROBLEMS.md)
[![journeys](https://img.shields.io/badge/journeys-93-brightgreen.svg)](docs/AUTHORING.md)
[![tests](https://img.shields.io/badge/tests-780%20passing-brightgreen.svg)](#the-seven-gates)
[![contributions](https://img.shields.io/badge/contributions-wanted-orange.svg)](CONTRIBUTING.md)

One app: a pattern-organised interview practice set (**153 problems** across 19 patterns, SQL
drills, stats flashcards) plus **learning journeys** — problems built all the way down,
Brilliant/Khan style: the need first, approaches unlocked one at a time by the previous one's
weakness, predictions mid-playback, quiz gates, your own code driving the animation, and the
pattern named only at the reveal. **93 of the 127 problems have a journey**, drawn as a chip row,
a grid, a tree (heaps reuse it), a linked list, a DP table or a bar chart — whichever the problem
actually is. The other 34 carry a static walkthrough until their journeys are written. Plus a
sorting / search / graph visualizer whose bars morph instead of teleporting.

Every problem also carries an **approach ladder** — each way in, worst to best, in Python, Java and
C++ — where a rung says three things: what it does, what it costs, and **the promise it ignores**.
Sorting both lists in `merge-two-sorted` is not slow because `n log n` beats `n`; it is slow because
both inputs were *already sorted*. Plus an **arc**: one paragraph naming the single idea the whole
ladder applies. It all lands on **one page per problem** — `#/p/<pattern>/<id>`, and there is no
second route: the statement, the hints, the walkthrough, the ladder in three languages and the long
explanation in full are one document, in that order.

## The thing that makes this different

**Nothing is stated here that has not been run.** Every complexity claim, worked example and corner
case on a page is produced by a runnable script shipped *with* that page, and a gate executes all
82 of them on every change.

That is not ceremony. It keeps finding things that read perfectly:

| Found while writing about | What measuring showed |
|---|---|
| `balanced-tree` | A rung labelled `O(n²)` measured **strictly linear** — 100 / 200 / 400 / 800 `height()` entries on spines of 50 / 100 / 200 / 400. It short-circuited before it could be quadratic, and the label rendered on the problem page |
| `tree-diameter` | An example whose note claimed it caught the through-the-root wrong solution — which that solution got **right**. All three examples passed it, so a test suite built from them would have too |
| `top-k-frequent` | The rung the ladder calls **optimal** is the **slowest** real rung on its page: 13.2 ms against 5.0 ms for the rung below it, because one line allocates `n + 1` list objects most of which are never touched |
| `contains-duplicate` | `len(set(nums)) != len(nums)` beats the "optimal" early-exit rung by **60%** on the worst case — and loses to it by **33×** on the best |
| `valid-anagram` | The `O(1)`-space rung is **3× slower** than `Counter`; on 50,000 identical characters the **sort** wins by 8× |
| `product-except-self` | `O(n)` counts *multiplications* — break the 32-bit promise and the same code goes quadratic, 0.1 → 9.0 ms as `n` goes 500 → 4,000 |

Six documents, five surprises, three saying the same thing: **the ladder ranks algorithms, the
clock ranks implementations, and in Python they come apart.** No page said that before it was
measured. Instrument the bound; do not quote it.

## Contributing — help genuinely wanted

**[`CONTRIBUTING.md`](CONTRIBUTING.md) has the full guide.** The short version, ranked by how
self-contained the work is:

| What | Size | Counted in |
|---|---|---|
| Write a teaching document for one of the **45 problems that have none** | ~half a day | `docs/LEARN-GAPS.md` |
| Retrofit the three required sections onto one of the **72 documents missing them** | ~2–4 hours | `docs/LEARN-GAPS.md` |
| Write a journey for one of the **34 problems** still on a static walkthrough | ~1 day | `docs/AUTHORING.md` |
| **Find a claim that does not survive being run** | minutes | `docs/BACKLOG.md`, the `G` table |

That last row is the most valuable issue you can file, and it has its own
[issue template](.github/ISSUE_TEMPLATE/false-claim.yml). Pick any document, run its script, change
the input, and see whether the page still tells the truth. Two of the three defects above were
found exactly that way — while *writing about* the code, not while reading it.

Each document is fully independent, so this work parallelises perfectly. One rule is absolute:
**never copy text from LeetCode or anywhere else.** Everything here is written in our own words
from each problem's public definition, which is what makes it MIT-licensable at all.

Also: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). CI runs the fast gates on every PR
([`gates.yml`](.github/workflows/gates.yml)) — but it deliberately does **not** run the browser
suite or the Java/C++ toolchain, so a green tick means "nothing obviously broke", not verification.
The PR template asks for the rest.

## Running it

Vite + React 19 + TypeScript + Tailwind v4 + shadcn (base-nova). Catppuccin Mocha and Latte — dark,
light or system. Node 24 (runs the API and the tests without a build step).

```
npm i
npm run dev        # UI + API on one port   → http://localhost:5173/#/journey/two-sum
npm run check      # tsc -b · eslint · node --test   (must exit 0 before a commit)
npm run test:ui    # + a real browser: routes, the earn loop, rails, deep links (needs Chrome)
npm run build      # production build (static; the API runs in-process)
npm run api        # standalone API on :8787 — see docs/API.md
```

## The seven gates

None of them is sufficient on its own. That is the point of having seven.

| Command | What it proves |
|---|---|
| `npm run check` | `tsc -b`, `eslint`, **780** Node tests |
| `npm run test:ui` | Real Chrome — routes, the earn loop, rails, deep links, panel sizes |
| `npm run verify:code` | Every Java and C++ block **compiles** (778 blocks) |
| `npm run verify:run` | Those blocks **agree with the Python** (2,239 oracle runs, 4,478 translations compared) |
| `npm run verify:vectors` | The vectors are strong enough to catch a mutation |
| `node scripts/verify-deep.mjs` | All **82** teaching scripts run and their approaches agree |
| `node scripts/learn-gaps.mjs --strict` | No document adds approaches without disclosing it |
| `npm run verify:fences` | Every code block on a page **runs** the way the page runs it (338 clean, baseline 7) |

Compiling is not correctness — which is why `verify:code` and `verify:run` are separate gates.

**Docs** live in [`docs/`](docs/README.md) — start with the manifest there. Product:
[`PRD.md`](docs/PRD.md) · where it goes: [`ROADMAP.md`](docs/ROADMAP.md) · what's on screen:
[`FEATURES.md`](docs/FEATURES.md) · next: [`BACKLOG.md`](docs/BACKLOG.md) · what is missing,
counted: [`LEARN-GAPS.md`](docs/LEARN-GAPS.md) · the ordered queue:
[`LEARN-PLAN.md`](docs/LEARN-PLAN.md) · how it works: [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
the API: [`API.md`](docs/API.md) · adding a journey: [`AUTHORING.md`](docs/AUTHORING.md) ·
history: [`WORKLOG.md`](docs/WORKLOG.md) · where the last session stopped:
[`STATUS.md`](STATUS.md).

## Change → file

| Change | File |
|---|---|
| Theme colours, type scale, container widths (all tokens) | `src/index.css` (the decisions: `docs/DESIGN.md`) |
| Routes (`#/journey/…`, `#/algorithms`, `#/p/…`) | `src/lib/route.ts`, `src/App.tsx` |
| Add / edit a **journey** (acts, generators, presets, quiz, challenge) | `src/data/journeys/<slug>.ts` → register in `src/engine/index.ts`. **Five early journeys still live in `src/engine/journeys/`** (`two-sum`, `three-sum`, `single-number`, `sorted-pair-sum`, `container-water`); everything since is in `src/data/journeys/` — 90 files there against 5 — so look in `src/engine/index.ts` for the import path rather than guessing |
| Frame / act / journey / stage-model contracts (incl. `EdgeCase`, frame `corner`) | `src/engine/types.ts` |
| The hash-map bucket arithmetic | `src/engine/hashmap.ts` |
| Sort / search / graph algorithms + their precomputed timelines | `src/engine/algorithms.ts` |
| Content gate (schema, disclosure lint, drain, correctness) | `src/engine/journeys.test.ts` |
| Practice-set gate (ids, three languages) | `src/data/problems.test.ts` |
| Add / edit a **problem** (statement, constraints, ladder, three languages) | **49 of 127 live in `src/problems/<id>/`**, one file per section, with the pattern barrel importing from there — map: `src/problems/README.md`. The other 78 are still one file at `src/data/problems/<pattern>/<id>.ts` (map: `src/data/problems/README.md`); `scripts/split-record.mjs` moves one |
| Add / edit a **teaching document** (understanding, traps, one file per approach, arc, interview, the runnable script) | `src/problems/<id>/` — entered through `doc.ts`, converted from `docs/deep/<id>_explained.md` by `scripts/md-to-content.mjs`. Gate: `src/content/content.test.ts` |
| **The one page per problem** — `#/p/<pattern>/<id>`, and there is no second route. Statement, hints, walkthrough, the ladder in three languages, then the long explanation in full at the foot | `src/components/problem-detail.tsx` |
| The explanation's sections, and the order they come in | `src/lib/teaching-parts.ts` (data) → `src/components/teaching-doc.tsx` (markup). Which form a problem has, and fetching it: `src/lib/use-explanation.ts` |
| The Markdown half of the explanation, for problems not yet converted (`npm run docs:learn`) | `scripts/gen-learn.mjs` · output: `docs/learn/**` · drift gate: `scripts/gen-learn.test.mjs` |
| Draft code/content with a LOCAL model, and the gates that check it | `scripts/localsmith/` (why and limits: its `README.md`) |
| Which model is trusted with what, and the measured token cost | `docs/MODELS.md` |
| Compile every Java/C++ block (`npm run verify:code`) | `scripts/localsmith/verify.mjs` |
| Run them against the Python oracle (`npm run verify:run`) | `scripts/localsmith/run.mjs` · inputs: `vectors.mjs` · its own checks: `run.test.mjs` |
| Check the VECTORS are strong enough (`npm run verify:vectors`) | `scripts/localsmith/mutate.mjs` · `--suggest` finds a missing case |
| UI smoke test (routes, earn loop, rails, deep links) | `test/ui-smoke.test.mjs` · driver: `test/browser.mjs` |
| **HTTP API** — every endpoint | `src/api/routes.ts` (contract: `docs/API.md`) |
| API transport (HTTP vs in-process) | `src/api/client.ts` |
| Standalone API server / Vite `/api` middleware | `server/index.ts` / `server/vite-api.ts` |
| Read the long explanation in the app | It is a section of the problem page — `#explanation` on `#/p/<pattern>/<id>`. `#/learn/<id>` redirects there. Markdown → blocks: `src/lib/markdown.ts` · blocks → UI: `src/components/markdown.tsx` · which ids have one: `src/lib/learn-pages.ts` + `src/lib/content.ts` |
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
| A small number said as a SHAPE — difficulty ticks, the complexity growth mark | `src/components/ui/tick-meter.tsx` (the classifier: `src/lib/complexity.ts`, with its own test) |
| The parts a list ROW is built from — the hover nudge, the progress hairline | `src/components/ui/row.tsx` (the motion itself lives in `src/index.css` under `[data-affordance="nudge"]`) |
| Outbound reading per pattern (`read further`) | `src/data/patterns.ts` `references` → `ReadFurther` in `src/components/problem-list.tsx`; shape gated by `src/data/problems.test.ts` |
| Whether a problem has an AUTHORED `docs/deep/` document, not just a generated page | `src/lib/learn-pages.ts` (`hasDeepDoc`) |
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
