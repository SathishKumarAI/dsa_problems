# Worklog

Newest first. One dated entry per working session: what shipped, with commits/PRs and the
evidence. The visualizer's own history (PRs #1–#45, 2026-09-02 → 09-03) is preserved verbatim in
[`../legacy/visualizer/docs/WORKLOG.md`](../legacy/visualizer/docs/WORKLOG.md).

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
