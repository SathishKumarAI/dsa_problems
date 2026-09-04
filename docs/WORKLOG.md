# Worklog

Newest first. One dated entry per working session: what shipped, with commits/PRs and the
evidence. The visualizer's own history (PRs #1–#45, 2026-09-02 → 09-03) is preserved verbatim in
[`../legacy/visualizer/docs/WORKLOG.md`](../legacy/visualizer/docs/WORKLOG.md).

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
