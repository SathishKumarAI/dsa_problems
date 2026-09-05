# Product requirements — dsa.patterns

Status: living document · Owner: Sathish Kumar · Last revised: 2026-09-04

## 1. One paragraph

`dsa.patterns` is a single-page learning product for engineers preparing for algorithm
interviews. It teaches the way Brilliant and Khan Academy teach — *learn by doing, one earned
insight at a time* — and animates the way 3Blue1Brown's Manim animates — *states morph, they
don't teleport*. Every other DSA site tells you the answer and then shows you why it works. This
one withholds the name until you have felt the weakness it fixes. The product is the result of
merging two repositories: a pattern-organised practice site (31 problems, SQL drills, stats
flashcards) and a vanilla-JS visualizer with two deeply built "learning journeys" plus a
sorting/search/graph visualizer. Three journeys exist today (Two Sum, Single Number, Triplets
Summing to Zero); the rest of the 31 problems are queued one at a time in `PROBLEMS.md`.

## 2. Users

| Persona | Situation | What they need from us |
|---|---|---|
| **The re-learner** (primary) | Mid-level engineer, interview in 2–6 weeks, has *seen* Two Sum but cannot re-derive it cold | A path that makes the hash-map insight *theirs* — not a solution to memorise |
| **The first-timer** | Bootcamp graduate or career switcher; "O(n²)" is a phrase, not a feeling | The chart bar that explodes at n = 20; the need before the data |
| **The drill-runner** | Senior engineer brushing up; wants 30 problems and terse solutions | The practice set: hints → walkthrough → worked Python, no ceremony |
| **The author** (internal) | Whoever adds the next journey (a person, or Claude with `AUTHORING.md`) | A content schema whose invariants are tested, so a new journey cannot spoil itself |

## 3. Goals and non-goals

**Goals (this release)**

1. One repository, one app, one navigation. The two former repos are not distinguishable to a user.
2. Problems built to **completion** as journeys, one at a time: **Two Sum** (7 acts),
   **Single Number** (5), **Triplets Summing to Zero** (5). "Completion" = read the problem like
   a book (restate, formalize, bring three inputs) → story → approaches earned one at a time →
   corner cases explained where they bite → quiz gates → predict mode → code challenge with the
   learner's own code driving the animation (where the harness fits) → the reveal. The queue and
   the per-problem definition of done live in `PROBLEMS.md`.
3. Stage graphics that a designer would not call dated: a colourblind-safe chip grammar, a hash
   map drawn as buckets and chains, bit rows for XOR, bars that morph, a single-hue steps chart.
4. A small HTTP API in front of the same engine, so content and frames can be served to any
   client, and so the engine stays DOM-free by construction.
5. Code laid out so the next journey is one content file, and so a change means opening one
   small file (see the change → file table in the root README).
5b. A shell that gets out of the way: each panel scrolls on its own, either rail closes to a thin
   strip (and peeks back on hover), and settings / shortcuts / "how to use" are one click or one
   key away.
6. Documentation that lets the next session start from fact: this PRD, a feature audit, a backlog,
   a roadmap, an architecture map, an API contract, an authoring guide, a worklog.

**Non-goals (this release)**

- Accounts, sync, or any server-side persistence. Progress is localStorage. (Roadmap Q2.)
- Running learner code on the server. The code challenge runs in a browser Worker.
- Porting the visualizer's pattern page, structure explorers, timed challenge, first-visit tour,
  spaced repetition, stall analytics. All tracked in `BACKLOG.md`; the original source stays
  reachable under `legacy/visualizer/`. (The settings dialog, export/import and focus rails
  shipped 2026-09-04 — B3, B4, B5, B26.)
- Breadth over depth. One problem is in flight at a time and it ships complete; a "tab bar of
  approaches" is not a journey.
- An automated UI test (B2). Every UI claim in this repo is a browser run recorded in the worklog
  until that lands.
- Light theme. The app is Catppuccin Mocha, forced dark, until the palette work in the roadmap.

## 4. The pedagogy — requirements that are invariants

These are product requirements with tests behind them (`src/engine/journeys.test.ts`). A change
that fails them is a product regression, not a style nit.

| # | Requirement | Enforced by |
|---|---|---|
| P1 | **No unearned name.** No act, subtitle, tool, hint, quiz, preset banner, corner case or chart row names an act the learner has not unlocked — **and the catalogue does not name a pattern a started journey is still building** (`lib/disclosure.ts`, opt-out per learner). | disclosure test; edge-case lint; API `chart` filters by `upto`; stepper renders one anonymous "?" node; UI test asserts the mask |
| P2 | **Insight before name.** Each act opens with the weakness it fixes; the canonical name is revealed in the recap act. | content review + `AUTHORING.md` checklist |
| P3 | **Earned, not clicked through.** Unlocking = finish the act + pass its quiz + an explicit "I get it" click. `unlocked:<slug>` is written nowhere else. | `use-journey.ts` is the only writer |
| P4 | **Every frame narrates.** A frame without a `note` fails the build. | schema test |
| P5 | **Code tabs stay in sync.** Python/Java/C++ match the pseudocode line-for-line so line highlight is correct in any tab. | line-count test |
| P6 | **Predict before render.** Playback pauses *before* a predict frame draws; scrubbing skips predictions (review is not learning). | player guard |
| P7 | **Broken promises are allowed in.** Presets that break the problem's contract (two singles, no solution) are shown with a warning, because watching XOR lie is the lesson. | `classify` + warning banner |
| P8 | **Motion is continuous.** Re-renders FLIP keyed elements; `prefers-reduced-motion` and the motion preference can turn it off. | `use-flip.ts` |
| P9 | **Corner cases are taught twice.** Every journey ships ≥ 3 corner cases in technique-neutral prose (read on act 1, loadable with one click) and each is *explained in play* by at least one approach on its own preset. | edge-case test; `frame.corner` |
| P10 | **Every approach exists in three languages.** A journeyed problem carries Python, Java and C++ for every approach, line-for-line against the pseudocode. | line-count test; `data/problems.test.ts` |

## 5. Functional requirements

### 5.1 Journey page (the flagship)

- Act stepper showing unlocked acts by name and number, the current act highlighted, finished acts
  ticked, and one dashed "? · n more · locked" node while anything is locked.
- Stage: the input array as chips (index under each), the approach panel (sum equation, hash map
  iceberg, sorted view, bit rows, recap table, or the code editor), narration line, timeline
  scrubber with `pos/last`, transport (play/pause, back, forward, restart), speed slider.
- Data controls: preset select, "new" (regenerate from preset), custom input text, extra scalar
  params (target), apply. Invalid custom input shows an inline error and keeps the old data.
- Warning banner (red) when the input breaks the contract; info banner (blue) for a preset's note.
- Reading column: insight + idea, "what this approach is built from", code panel with tabs,
  takeaways, steps chart (unlocked algorithm acts only), legend, resources. On act 1 it also
  carries "how to read this problem" (reread · formalize · bring inputs) and "bring three inputs"
  — every corner case with a button that loads it.
- Interruptions under the narration: predict card, quiz card, hint ladder, reveal button, adaptive
  difficulty offer, and the corner-case callout on any frame tagged `corner`.
- Layout: on wide screens the stage and the reading column scroll independently; either rail
  closes from a button at its foot (or `f`) and peeks open on hover.
- Code challenge (Two Sum act 6): editor, Run tests, Watch my code on this input, per-case results
  with edge tags, scorecard (correctness, array touches vs reference, best-ever), self-review
  (auto-checked where a regex honestly can), Set 2 at n = 400 with the touch-count bars.
- XP badge (+5 quiz, +10 unlock, +25 first green challenge), restart journey, deep links
  `#/journey/<slug>?act=&step=`, keyboard: space, ←, →, r.

### 5.2 Algorithm visualizer

- Picker: 6 sorts, binary search, BFS/DFS/Dijkstra. Size 4–60, shape (random / nearly sorted /
  reversed / few unique), target for search, node count 4–14 for graphs, "new array / graph".
- Bars keyed by value+occurrence so swaps FLIP; graph as SVG with visited / frontier / current /
  active-edge states and Dijkstra distance labels; pseudocode line highlight; compares/writes.
- Same transport and keyboard as the journey.

### 5.3 Practice set (carried over)

- 10 patterns × 3 problems (+ Single Number = 31), each with statement, examples, three
  progressive hints, a static walkthrough, approach, complexity, worked code and alternatives.
  Code is Python, plus Java and C++ wherever the problem has a journey (a language strip shares
  the journey's `codeTab` preference).
- Solved checkbox per problem; counts in sidebar and home. Problems with a journey show a CTA.
- SQL drills, stats flashcards: unchanged.

### 5.4 API

See `API.md`. Stateless; every endpoint is a pure function of its input; the same table serves
the Vite dev middleware, the standalone Node server and the in-process client used by static builds.

## 6. Non-functional requirements

| Area | Requirement | How we know |
|---|---|---|
| Correctness | Every approach returns the contract's answer on the trap inputs (equal values, duplicates, extremes, n = 1, loner largest) | `journeys.test.ts` correctness suite |
| Performance | Frames are precomputed; a 20-element brute-force act (≈200 frames) loads in one API call under 50 KB; step-back and scrub are array indexing | design; measured ~10 ms local |
| Accessibility | Every state has a non-colour channel (marker / icon / fade); `:focus-visible` rings on every control; narration is `aria-live="polite"`; reduced motion honoured | chip grammar, `index.css` |
| Responsiveness | 390 px viewport has no horizontal scroll; bucket table scrolls inside its own box | verified via CDP screenshot |
| Privacy | No network call carries learner data anywhere but the local API; nothing leaves the browser | there is no analytics endpoint |
| Quality gate | `npm run check` (tsc, eslint, node tests) exits 0 on every commit | CI-less today; run locally — 41 tests |
| Payload | A content page must not download the stage | `React.lazy` on the journey and visualizer; index ~400 kB + shared ~204 kB, journey chunk ~44 kB |

## 7. Success metrics (local, no tracking)

- A first-time learner reaches Two Sum's recap in one sitting (self-reported).
- The code challenge passes on the first or second run for learners who finished acts 1–5.
- "Restart journey" is used — relearning is the point.

## 8. Open questions

0. **Sidebar sections.** Requested split: Python / DSA / SQL. Shipped DSA / DSA · patterns / SQL /
   Data science; a Python section has no content yet — options in `PROBLEMS.md` §Open questions.

1. Should the practice set's static walkthroughs be generated from the journey engine for the
   two flagship problems, retiring the hand-written frames? (Leaning yes — one source of truth.)
2. Server-side challenge execution would let a CLI or a phone client take the challenge. It also
   means running untrusted code; `node:vm` is not a sandbox. Deferred until a client needs it.
3. Light theme: the tokens exist (`:root` block); the chip grammar has not been checked for AA on
   Latte. Roadmap.
