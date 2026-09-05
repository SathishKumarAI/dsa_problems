# Worklog

Newest first. One dated entry per working session: what shipped, with commits/PRs and the
evidence. The visualizer's own history (PRs #1–#45, 2026-09-02 → 09-03) is preserved verbatim in
[`../legacy/visualizer/docs/WORKLOG.md`](../legacy/visualizer/docs/WORKLOG.md).

## 2026-09-05 — B7: merge sort stops teleporting

Branch `feat/bars-write-pulse`.

A swap moves two bars past each other and FLIP shows the motion. A merge-sort **write** replaces a
value in a slot: nothing moves, so FLIP had nothing to animate and the bar blinked to a new height.
The frame builder was also collapsing `set` into the `swap` mark, so the two were indistinguishable.

`ArrayFrame.marks` gains `"write"`; the builder maps `set` to it; `BarsView` paints it mauve and
runs a `scaleY(0.72 → 1.06 → 1)` pulse for 260 ms from `origin-bottom`, skipped when the motion
preference is `off` and zeroed by `prefers-reduced-motion`. Discarded bars fade to 40 % instead of
greying, so "eliminated" reads as absence rather than as another colour. The legend gained the row.

Evidence: `npm run check` 42/42. Browser, `#/algorithms?algo=merge` stepped 40 times: 16 frames
carried a pulsing bar, computed `animation-name: write-pulse`, `animation-duration: 0.26s`, and the
stats line read `16 compares · 16 writes`.

## 2026-09-05 — B6: Single Number gets its "prove it" act, and the reveal it never had

Branch `feat/single-number-challenge`.

**What.** `SINGLE_NUMBER_CHALLENGE`: six cases chosen to break a first draft — `[7]` (n = 1),
`[0, 4, 4]` (the answer is 0, which a truthiness test calls "nothing found"), `[1, 1, 2, 2, 9]`
(loner last), `[-3, 5, 5]` (negatives) — an XOR reference, four review items (one loop, constant
space, no truthiness test on the result, say the property out loud) and a 2 001-element second
set. The journey also gained the **recap** act it never had, so it ends on a named reveal like the
other two: memory (map) vs order (sort) vs a property of the values (XOR), and where that instinct
goes next (missing number, two loners).

**The harness had to learn a second answer shape.** It compared "two indices" and nothing else;
Single Number returns one value. `Challenge.answers?: "pair" | "value"` now selects the comparison,
`ChallengeCase.expected` widened to `number[] | number`, and the results list prints the expected
value accordingly.

**And it had a real bug (G5).** Running the XOR reference in the browser failed *all six* cases
with `Cannot convert a Symbol value to a string`. The counting and tracing proxies test the
property key with a regex, and `for (const x of nums)` reads `Symbol.iterator`. It has been there
since the challenge shipped and it hit Two Sum too — any `for..of` solution. `isIndex()` now guards
both traps, and the UI test writes a `for..of` solution on purpose so it cannot come back.

**Evidence.** `npm run check` 42/42. `npm run test:ui` **21/21** (was 20; two runs, both green
after replacing a fixed sleep with polling in the deep-link tests — that sleep flaked once).
Browser: the reference solution goes 6/6 green with `+25 XP` and the act gate opens.

## 2026-09-05 — B8: the catalogue keeps the journey's secret

Branch `feat/disclosure-mask`.

**The leak.** The pedagogy rests on *no unearned name*, and the tests enforced it inside a journey
— but the sidebar said **Two Pointers** in plain sight while Two Sum act 3 was busy building that
exact idea without naming it. The legacy repo had an uncommitted branch for the same bug.

**The decision.** Masking the whole catalogue would wreck it for someone who never opened a
journey; leaving it alone breaks the one rule. So the mask follows an **active promise**: a
pattern is hidden only while a journey that `reveals` it is *started and unfinished*. Never
started, nothing promised, nothing hidden. Finished, you earned the name. And one click — "show
names anyway", stored in `spoilers` — turns masking off forever, because the PRD's drill-runner
persona should not have to play along.

**What that is in code.** `Journey.reveals?: string[]` (pattern ids); `src/lib/disclosure.ts` is
the only module that answers "may they see this name yet?"; four call sites ask it. The hook reads
one key per journey, which is more keys than a hook may subscribe to in a loop, so `store.ts`
gained `useStoreVersion()` — a single counter bumped on every write.

**Two gates, one bug.** A content test asserts every `reveals` id exists **and** that a journey
masks the pattern its own problem sits under (leaving that out is exactly how this leaks). The UI
test walks the three states — not started, midway, finished — plus the opt-out. It failed on the
first run: the sidebar footer's where-you-are line still read `DSA · pattern · Two Pointers`
(G4). Fixed in the same PR.

**Evidence.** `npm run check` 42/42 (was 41). `npm run test:ui` 20/20 (was 18). Live at
`unlocked=3`: sidebar rows read `?|· · ·` for both masked patterns, `h1` is `· · ·`; at 1 and 7
the names are back.

## 2026-09-05 — the stack lands on master, and the UI gets a gate (B2)

### The merge, and how it went wrong

Merging nine stacked PRs bottom-up with `--squash --delete-branch` broke the stack: deleting a base
branch closes the PR stacked on it. #2, #4, #6 and #8 were closed with conflicts; #3, #5, #7 and #9
merged into their **base branch**, not `master`. Only #1 reached `master`.

Nothing was lost — the whole chain survived on `feat/journey-three-sum`. Recovery was a rebase of
the eight commits onto `master` (`git rebase --onto master 02807f9`), verified content-identical
to the reviewed tip (`git diff` between pre- and post-rebase tips: empty), then one merge commit
via PR #10 so the eight stayed separate.

**The rule that follows:** never `--delete-branch` while another PR is stacked on it. Merge a stack
from the tip, or retarget every base first.

### B2 — the UI smoke test

`npm run test:ui`: `vite preview` on an OS-assigned port + the system Chrome headless, driven over
CDP with node's built-in WebSocket. No new dependency, no jsdom. 18 checks in ~28 s:

| Group | Checks |
|---|---|
| Routes | home · pattern list · problem page · visualizer · SQL · flashcards · one per journey (derived from `JOURNEYS`, so a new journey is covered automatically) · unknown route falls back home — each asserting real text **and** an empty console |
| The earn loop | fresh ledger → step the story act → answer the quiz → reveal → `unlocked=2`, `quizzes=["story"]`, `xp=15`, act switched to `brute` |
| Deep links | honoured on load · followed on an in-app hash change · **ignored when the act is locked** (the disclosure rule, now enforced in a browser) |
| Corner cases | the story act lists ≥ 3, and "load this input" changes the preset |
| Shell | `f` closes both rails and reopens them · `?` opens the shortcuts dialog · a settings change survives a reload |
| Phone | 390 px: `scrollWidth == clientWidth` |

**It found a bug on its first run (G1).** A deep link pasted while the same journey was already
open changed the hash and nothing else: `?act=` was read only in a `useState` initializer, and a
hash change remounts nothing. Fixed with a render-time adjust in `use-journey.ts`, guarded by
`unlocked` so a link into a locked act is still ignored, plus regression tests for both halves.

Two things the driver had to get right, both recorded in `browser.mjs`: `child.kill()` on Windows
leaves the node grandchild holding the port (kill the tree), and a `location.reload()` *inside* a
CDP evaluate destroys the execution context so the call never resolves (clear storage on one load,
navigate on the next).

**Not covered, said out loud** (in `ARCHITECTURE.md` §10): autoplay timing, the 45 s hint timer,
the Worker code challenge, the adaptive offer, hover-peek, and anything about colour or spacing.

## 2026-09-04 (later) — docs refresh: the maps catch up with the code

Branch `docs/refresh-after-shell-work`. Docs only.

Five branches shipped in one day and `ARCHITECTURE.md` had not been touched since the merge, so it
described a shell, a frame contract and a panel union that no longer existed. Refreshed:

| File | What was stale |
|---|---|
| `ARCHITECTURE.md` | no shell section (sidebar, dialogs, global keys, hover-peek, scroll panels); frame contract missing `corner`; `PanelModel` missing `terms`; state section missing `prefs` merge semantics, export/import and the `sidebar_state` cookie; invariants missing the corner-case and three-language rules; layer diagram missing `lib/dialogs.ts`, `lib/shortcuts.ts` and the lazy chunks |
| `PRD.md` | "two journeys" everywhere; non-goals still listed the settings gear, export/import and focus tiers as unbuilt; no P9 (corner cases) or P10 (three languages); §5.1 missing the act-1 cards, the callout and the layout; no payload requirement |
| `API.md` | `GET /api/journeys` sample listed two journeys; problem payload did not mention `java` / `cpp` |
| `FEATURES.md` | `prefs` row named two fields of four; no export/import or cookie note; test counts from before the new gates |
| `RESEARCH.md` | no entry for the books on disk — Khamies §3.1 is where the corner-case work came from |
| `README.md` | `src/lib` and `src/components` one-liners predate `dialogs.ts` / `shortcuts.ts` / the shell |

**Evidence.** A claim-checker script (scratchpad, not in the repo) reads the repo and asserts the
docs agree: journeys and act counts in `API.md` and `FEATURES.md` vs `JOURNEYS`, every
`PanelModel` kind documented in `AUTHORING.md` **and** `ARCHITECTURE.md`, every `K` key and every
`Prefs` field named in `FEATURES.md`, the stated test count vs `npm test`, and every relative
link. Result: journeys `two-sum` 7 acts / `single-number` 5 / `three-sum` 5, 10 panel kinds, 7
store keys, 4 prefs, 41 tests, 26 links, 0 broken — no mismatches.

## 2026-09-04 (later) — third journey: Triplets Summing to Zero

Branch `feat/journey-three-sum`, stacked on `feat/practice-code-tabs`. `docs/PROBLEMS.md` #3.

**What.** `src/engine/journeys/three-sum.ts` (LeetCode 15, Khamies §3.2.2): story (an auditor's
ledger — amounts that cancel in threes, reported by value, each once) → Brute Force (three loops +
a set of sorted triples; the predict fires the first time a repeat tries to enter) → Anchor + Hash
(sort, skip equal anchors, per-anchor pair search with a set — the reduction to Two Sum) → Anchor +
Two Pointers (order skips repeats and drives the squeeze; early stop when the anchor is positive) →
The Reveal (reduction / KSum, links to Two Sum and the two-pointers pattern). Four corner cases
(`tiny`, `dupes`, `zeros`, `none`), six presets (default = LeetCode's classic with the repeated −1),
quizzes and hints on every act, code in pseudo / Python / Java / C++ line-for-line. New panel kind
**`terms`** (k-term equation vs target, or `need` for an unknown term; the distinct answers found so
far with the newest ringed and a dropped repeat struck through; optional hash map) — added to
`types.ts`, `panels.tsx`, `AUTHORING.md`.

**What the gate caught before it shipped.** The new correctness test (three approaches agree on six
inputs) failed on `[0, 0, 0, 0]` for the hash act: `target = -s[k]` produced `-0`, so the triple
`[0, -0, 0]` was not equal to `[0, 0, 0]`. Fixed with `0 - s[k]`. The browser then showed React's
duplicate-key error in the hash view when two rows held the same amount; the per-anchor `seen` now
has set semantics (the second copy adds nothing).

**Evidence.** `npm run check`: tsc 0, eslint 0, `node --test` 41/41 (34 → 41: schema, tabs, drain,
edge cases, presets, disclosure, correctness for the new journey). CDP: story act renders 3 hint
triggers and 4 corner cards, note "−1 + −1 + 2 = 0 — one triple. There are 2 distinct triples…";
brute act on the classic → the "drop it" predict appears, answered → callout `dupes`, found list
`[-1, 0, 1]`, `[-1, -1, 2]` + the repeat struck through; hash act `step=7` → "need 2 — not seen",
hash map drawn, 0 errors after the fix; two-pointer `step=12` → 1 anchor (▲), 2 rings, 1 dimmed
finished anchor, equation "−1 + −1 + 2 = 0"; recap → 3 rows, links `#/journey/two-sum`,
`#/p/two-pointers`, chart 21 / 17 / 20 steps on the classic. Sidebar lists the journey with `1/5`.
Not eyeballed: `zeros` and `tiny` callouts in the two-pointer act (test-covered), `big` preset.

## 2026-09-04 (later) — three-language code on the practice set (F2)

Branch `feat/practice-code-tabs`, stacked on `perf/code-splitting`.

`Code {python, java?, cpp?}` on `Problem` and `Solution`; `SolutionBlock` shows a Python 3 / Java /
C++ strip sharing the journey's `codeTab` pref. Java and C++ written for every approach of Two Sum
(one-pass hash, brute, sort + two pointers), Single Number (XOR, hash counts, sort & scan) and
Triplets Summing to Zero (sort + two pointers, brute, hash per anchor) — 18 new blocks. New
`src/data/problems.test.ts`: ids unique, patterns valid, every block looks like a function, and a
journeyed problem must carry all three languages on every approach (31 → 34 tests).

Evidence: `npm run check` 34/34. CDP: `#/p/arrays-hashing/pair-sum` → Approach & Solution → tabs
`Python 3 · Java · C++`, Java click → first line `public int[] pairSum(int[] nums, int target) {`,
`prefs.codeTab=java`; `#/p/two-pointers/three-sum-zero` → Brute force → Java still selected. Not
compiled: the Java/C++ blocks were reviewed by eye, not run — a compile check is a follow-up if a
toolchain is added.

## 2026-09-04 (later) — code splitting (F1 / B22)

Branch `perf/code-splitting`, stacked on `docs/problem-pipeline`.

`App.tsx` lazy-loads `JourneyPage` and `AlgorithmsPage` behind one `Suspense` fallback.

| `vite build` | Before | After |
|---|---|---|
| chunks | `index` 673.77 kB (212.25 gzip) | `index` 400.23 kB (127.11 gzip) · `store` (engine + data, shared) 203.87 kB (66.70 gzip) · `journey-page` 43.52 kB · `use-flip` 20.90 kB · `algorithms-page` 9.46 kB · runtime 0.58 kB |
| initial JS on a content page | 673.77 kB | 604 kB (index + shared chunk) |

The shared chunk stays eager because `app-sidebar.tsx` imports `JOURNEYS` from `@/engine` for the
journey rows; a registry of slug / title / act count would let the engine load lazily too (noted on
F1). `npm run check` 31/31; CDP: `#/journey/two-sum`, `#/algorithms`, `#/` all render, 0 errors.

## 2026-09-04 (later) — the problem pipeline and the front-end proposals

Branch `docs/problem-pipeline`, stacked on `feat/shell-panels-help`. Docs only.

**Why.** The ask: a backlog of every problem in the app to be built "in this way", one at a time
with all approaches, code in Python 3 / Java / C++ per approach, the books on disk as sources, SQL
questions from the PDFs, and a reviewable list of animation and front-end changes.

**What.** `docs/PROBLEMS.md`: definition of done for one problem; the sources on disk and what each
is for; all 31 practice-set problems in three waves ordered by how much of the stage already exists
(wave 1 needs no new panel kind until Widest Container); the SQL track; the cross-cutting
three-language item; open questions (the Python section, journey vs. practice page, shared corner
cases). `BACKLOG.md` gains the F1–F12 proposals with tiers. ROADMAP, docs manifest, CLAUDE.md, PRD,
STATUS updated to point at it.

**Evidence.** Docs only — `npm run check` unchanged (31/31). Problem list generated from
`src/data/problems/*.ts` (31 ids, alternatives per problem), not typed by hand.

## 2026-09-04 (later) — panels, peek, settings, shortcuts, help

Branch `feat/shell-panels-help`, stacked on `feat/journey-edge-cases`.

**Why.** The ask: each panel scrolls on its own (sidebar / stage / reading column); closed rails
reveal themselves on hover and hide again; settings and keyboard shortcuts at the foot of the sidebar
with "where am I" details; an info icon at the top that explains how to use the app; the sidebar
split into subject sections.

**What.** Journey page on ≥ lg: inset is viewport-high, header + stepper fixed, stage and reading
column `overflow-y-auto`. `ui/sidebar.tsx` gains hover-peek (`data-peek`; the gap follows the real
state so content never shifts); the reading rail renders the same `ReadingBody` as a 26 rem overlay on
hover. New `lib/dialogs.ts` (which dialog is open), `lib/shortcuts.ts` (the key map, one source),
`components/global-keys.tsx` (`?`, `f`), `components/app-dialogs.tsx` (help, shortcuts, settings;
shadcn `dialog` added — the CLI wrote `from "cn"` and a stray `cn` dependency; both reverted).
`lib/store.ts` gains `exportProgress` / `importProgress` / `resetProgress` (prefs excluded). Sidebar:
DSA / DSA · patterns / SQL / Data science, help button in the header, footer = where-you-are +
settings + shortcuts + collapse. Closes B3 (minus theme), B5, B26.

**Evidence.** `npm run check`: tsc 0, eslint 0, node tests 31/31. CDP at 1440 × 1000:

| Check | Result |
|---|---|
| journey page scroll | `documentElement.scrollHeight` 1000 = viewport; stage `overflow-y: auto`; aside 818 px tall / 1063 scroll |
| sidebar groups / footer | `DSA`, `DSA · patterns`, `SQL`, `Data science`; footer `settings`, `keyboard shortcuts`, `collapse sidebar`; where = `DSA · journey · Two Sum` |
| sidebar peek | collapsed 48/48 (container/gap) → mouseover 256/48 with `data-peek=true` → mouseout 48/48 |
| reading peek | rail 44 px → overlay 416 px with the code tabs inside → gone on mouseout; stage stays 1072 px |
| `f` | 256 + 384 → 48 + 44 (`prefs.reading=false`) → back to 256 + 384 |
| `?` | dialog "Keyboard shortcuts", 9 rows |
| settings | motion select → `prefs.motion=cinematic`; copy fell back to the textarea (headless clipboard); import `{"unlocked:single-number":4,"xp":99}` → 2 keys, store updated |
| help | dialog "How to use dsa.patterns", 5 sections |

0 console errors in every run. Not verified: touch devices (peek is hover-only by design), the
erase-progress double click, Python section of the sidebar (there is no Python content yet — see
`docs/PROBLEMS.md`).

## 2026-09-04 (later) — corner cases as content, hints up front

Branch `feat/journey-edge-cases`, stacked on `feat/journey-focus-rails`.

**Why.** The ask: show hints and edge cases in the problem statement, and while solving, explain at
least once how each edge case affects the solution and how to think about it. Inspiration: Waleed
Khamies, *How to Solve Algorithm Problems* (2023) §3.1 — understand, formalize as input → output,
reread for hidden promises, bring three inputs (empty-case, medium-case, corner-case: duplicates,
negatives) before any code, brute force, analyse, optimise.

**What.** `Journey.edgeCases: EdgeCase[]` (`key, name, example, why, think, preset`) — 4 per
journey: Two Sum *tiny · duplicates · negatives · nosolution*; Single Number *single · last · zero ·
broken*. Frames gain `corner?: string`; every generator tags the frame where the case bites and its
note says what this approach did about it (13 tag sites in Two Sum, 8 in Single Number). Story acts
gain `hints` about *reading* the problem (reread · formalize · bring inputs), shown up front as an
accordion instead of the idle ladder. Story-act reading column gets the "bring three inputs" card
with a **load this input** button per case; the stage shows a teal callout under the narration while
a tagged frame is current. New presets `tiny`, `negatives` (Two Sum; `parse` now accepts −999…999)
and `zero` (Single Number). API meta exposes `edgeCases`.

**The gate grew.** New test per journey: ≥ 3 cases, unique keys, preset exists, **every case is
tagged by some act on its preset**, no frame tags an unknown key; the disclosure test now also lints
`edgeCases` prose against later act names. Tag coverage (`edges.ts` script, not in repo):

| Case | Preset | Tagged by |
|---|---|---|
| two-sum tiny | tiny | brute, twoptr, twopass, hash |
| two-sum duplicates | duplicates | brute, twoptr, hash (twopass hits the later copy first) |
| two-sum negatives | negatives | brute, twoptr, hash |
| two-sum nosolution | nosolution | story, brute, twoptr, twopass, hash |
| single-number single | single | brute, hash, sort, xor |
| single-number last | max | sort (the fallback line after the loop) |
| single-number zero | zero | brute, hash, sort, xor |
| single-number broken | twosingles | xor |

**Evidence.** `npm run check`: tsc 0, eslint 0, `node --test` 31/31 (29 → 31). Headless Chrome/CDP:
story act shows 3 accordion triggers (`reread`, `formalize`, `bring inputs`; first opens) and 4 corner
cards with `load this input`; clicking the second → preset `duplicates`, data `3, 1, 3, 8`, banner,
button `loaded ✓` with `aria-pressed`; brute act on `duplicates`, after the predict → callout
`data-edge=duplicates` with note "…j started at i + 1 so a slot never met itself"; Single Number sort
on `max` → callout `last` on the fallback frame; `GET /api/journeys/two-sum` lists 4 `edgeCases` and
8 presets; `POST parse` accepts `-3, 4, 3, 90` target 0. 0 console errors throughout. Not verified in
the browser: `negatives` and `tiny` callouts (covered by the test), the `zero` XOR bit rows.

## 2026-09-04 (later) — focus rails and a bigger stage

Branch `feat/journey-focus-rails`, stacked on `feat/merge-visualizer` (PR #1 still open).

**Why.** Reading a problem with the sidebar, the stage and the reading column all open left the
stage 717 px wide at 1440 and the chips at 44 px. The ask: close either rail from a button at its
foot, keep that button on the rail, and make the working area and its type bigger.

**What.** `AppSidebar` is `collapsible="icon"` with a footer toggle (icons + tooltips on every row,
wordmark → `d.`, state in shadcn's `sidebar_state` cookie). The journey reading column collapses
to a 2.75 rem rail with the same toggle at its foot (`prefs.reading`; `usePrefs` now merges over
`DEFAULT_PREFS` so a pref added later reads as its default). Journey page `max-w-7xl` →
`max-w-[110rem]`. Type scale: narration 16/18 px, reading column 15 px, chips 56 px with 20 px
digits, sum 24/36 px, code 13.5 px on 28 px lines, bit cells 36 px.

**Evidence.** `npm run check`: tsc 0, eslint 0, node tests 29/29 (unchanged from baseline). Headless
Chrome over CDP at 1440 × 1000, `#/journey/two-sum?act=hash&step=6`:

| State | stage width | right column | sidebar | console errors |
|---|---|---|---|---|
| both open (baseline) | 717 px | 384 px | 256 px | 0 |
| reading closed | 1072 px | 44 px rail | 256 px | 0 |
| both closed | 1280 px | 44 px rail | 48 px rail | 0 |

Toggles measured at the foot of each rail (left y = 960 of 1000; right sticky above the fold),
`dsa:prefs` gained `"reading":false`, cookie `sidebar_state=false`. 390 px: `scrollWidth = 390`,
the collapsed rail is a 38 px bar. Not verified: keyboard focus order across the new buttons.

## 2026-09-04 — the merge: one repo, one app, two journeys, an API, the docs

Branch `feat/merge-visualizer`, pushed to `SathishKumarAI/dsa_problems` (created this session); PR #1 against `master`.

| Commit | What |
|---|---|
| `feat(site)` baseline | The uncommitted Vite + React + shadcn practice site committed as-is so the merge diff is readable. |
| `chore(legacy)` | `dsa_visualizer` main subtree-merged under `legacy/visualizer/` — 47 commits of history preserved, folder excluded from build/lint. |
| `feat(engine)` | Journey engine ported to typed, DOM-free TypeScript; `view()` returns a `StageModel` instead of HTML; hash-map bucket model; sort/search/graph generators; the whole HTTP API as one pure `route()` mounted by Vite middleware, `node:http`, and in-process. Content gate as `node --test`. |
| `feat(ui)` | Journey page, algorithm visualizer, hash router, store. |
| `docs` | This documentation set + README, CLAUDE.md, STATUS.md. |

**Why the port instead of embedding the vanilla pages.** The visualizer was 8 200 lines of
string-concatenated HTML in a 1 200-line `journey.js`; the practice site was typed React with
shadcn. Embedding would have kept two shells, two theme systems and two progress stores. The
port cost a day and produced a content schema whose invariants are tests, and a view model that
any client can draw.

**Evidence.** `npm run check` → tsc 0, eslint 0, `node --test` 29/29. `vite build` 644 kB
(203 kB gzip). Headless Chrome over CDP (the MCP browser was held by another session; a private
Chrome on port 9333 was driven with a 60-line script):

| Check | Result |
|---|---|
| `#/journey/two-sum` story act | renders on an empty stage, `🎁 → 🛒 → ❓`, 0 console errors |
| `?act=hash&step=6` deep link | restores act + step; hash iceberg shows 3 keys / 8 buckets / load 0.38 / 1 collision |
| `?act=twoptr&step=4` | sorted view with `#n` subscripts, ▲ on L, ring on R, `2 + 44 = 46` |
| `single-number?act=xor&step=4` | bit rows, flipped bits ringed, chart with two bars |
| brute act stepped to the return | predict card appears **before** the return frame renders |
| fresh `unlocked=1`, story stepped to the end | quiz card; both answers right → reveal button → click → `unlocked=2`, `quizzes=["story"]`, `xp=15`, stepper shows 2 nodes, act switched to brute |
| challenge act, one-pass map typed, Run tests | 6/6 green, +25 XP, scorecard 30 touches vs 30 |
| challenge act, brute force typed, Watch my code | "traced 14 array accesses", stepping shows `access #5: your code read nums[0]`, 15 frames |
| recap act | 5-row table, two link cards |
| `#/algorithms?algo=quick` stepped 25× | bars with values, pivot green, 15 compares · 8 writes |
| `#/algorithms?algo=bfs` stepped 9× | SVG graph, visited green / frontier peach / current yellow |
| 390 px viewport | no horizontal scroll (`scrollWidth = 390`); bucket table scrolls in its own box |

**Not verified this session** (listed honestly): autoplay timing by eye, the 45 s hint timer, the
n = 400 second set, the adaptive-difficulty offer, reduced-motion on a device, `npm run api` under
load. All are code paths without a browser test — backlog B2.

**Decisions made without the user** (autonomous session): Two Sum + Single Number as "the two
problems"; API = stateless HTTP over the engine, not a persistent backend; `../dsa_visualizer`
left untouched (it has an uncommitted `feat/disclosure-lint` branch whose intent — masked
catalog entries — is recorded as B8); sorting visualizer ported in reduced form.
