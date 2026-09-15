# Product requirements — Patternsmith

Status: living document · Owner: Sathish Kumar · Last revised: 2026-09-13

## 1. One paragraph

`Patternsmith` is a single-page learning product for engineers preparing for algorithm interviews.
It teaches the way Brilliant and Khan Academy teach — *learn by doing, one earned insight at a
time* — and animates the way 3Blue1Brown's Manim animates — *states morph, they don't teleport*.
Every other DSA site tells you the answer and then shows you why it works. This one withholds the
name until you have felt the weakness it fixes.

**And it does one thing no other site does: it proves its own claims.** Every complexity label,
worked example and corner case on a page is produced by a runnable script shipped with that page.
That requirement is not decoration — it has caught a rung labelled `O(n²)` that measured strictly
linear, a worked example whose note claimed it caught a wrong solution it did not catch, and a rung
called *optimal* that is the slowest one on its own page. All three read perfectly and died on a
measurement.

**Scale today:** **127 problems** across 10 patterns, **93** built as animated journeys, **82**
carrying an authored teaching document, every problem with an approach ladder in Python, Java and
C++ and the long explanation in full, all on one page. Seven gates, **780** Node tests.

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
- ~~An automated UI test~~ **shipped** — `npm run test:ui` drives real Chrome.
- ~~Light theme~~ **shipped** — Catppuccin Mocha and Latte, dark / light / system.
- **Scraped content.** Statements, constraints and examples are written in our own words from each
  problem's public definition, never copied. An offer to scrape a solutions site was declined on
  2026-09-13 and the site added as a link instead. This is what makes the content MIT-licensable.

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

## 4b. The evidence standard — requirements on what a page may claim

Added 2026-09-13, after a reader said they could not follow the two-pass hash map's arithmetic and
was right twice: the page never said where the bucket count came from, and the first element does
**not** land in the first bucket. Counting that class of gap found it in 122 of 127 documents.

These are requirements, with a counter (`docs/LEARN-GAPS.md`) and a ratchet
(`scripts/learn-gaps.test.mjs`) behind them.

| # | Requirement | Enforced by |
|---|---|---|
| E1 | **Nothing is stated that has not been run.** Every complexity claim, worked example and corner case on a page is produced by a script shipped with that page | `verify-deep.mjs` runs all 82 scripts and requires each to report `ALL APPROACHES AGREED` |
| E2 | **Every document owes four readers** — first-year student, working engineer, interview candidate, systems/ML architect. The first is the one every document had been skipping | `docs/deep/TEMPLATE.md` four-readers table; review |
| E3 | **Reading the Calculations** — a symbol table (*what you will see · what it computes · why it is written that way · what happens if it is wrong*), the one rearrangement, and a hand-trace whose rows the script prints | `learn-gaps.mjs`, ratchet |
| E4 | **How to Get Fluent** — drills with **done-conditions** you can check rather than feel, ending in the sentence that should survive a month | `learn-gaps.mjs`, ratchet |
| E5 | **`Under the hood` carries a measured number.** `O(1)` with nothing behind it is the sentence that fails the architect | `learn-gaps.mjs`, ratchet |
| E6 | **A rung's summary names the promise it ignores** — not just what it does and what it costs, but the fact the problem handed you that this rung throws away | thin-rung count, held at **0** since 2026-09-13 |
| E7 | **Exact counts are preferred to timings.** Probes, comparisons and allocations reproduce anywhere; a timing is one machine's, must say so, and the **shape** of the column is the claim | review; every document states it |
| E8 | **A document that adds approaches beyond the data file's ladder discloses it** in the heading | `learn-gaps.mjs --strict`, held at **0** |
| E9 | **Run the wrong solution against your own examples.** An example that does not distinguish the answers is decoration | `G7`; review |

**The ratchet is not a wall.** It fails when a count grows, and separately asserts the baseline is
not set *above* the tree — because a ratchet with slack passes while the content rots.

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

- **127 problems across 10 patterns**, each with statement, examples, three progressive hints, an
  approach ladder (every rung naming what it does, what it costs, and **the promise it ignores** —
  the fact the problem handed you that the rung throws away), complexity, and an arc naming the
  single idea the ladder applies. Every rung carries Python, Java **and** C++, line-for-line
  against the pseudocode. The 34 problems without a journey ship a static walkthrough instead, and
  a test forbids carrying both.
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
| Quality gate | Seven gates, each checking something the others cannot. `npm run check` (tsc, eslint, **780** node tests) on every commit; `test:ui` in real Chrome for anything rendered; `verify:code` compiles every Java and C++ block; `verify:run` checks they agree with the Python; `verify:vectors` checks the vectors catch a mutation; `verify-deep` runs all 82 teaching scripts; `learn-gaps --strict` catches undisclosed content drift | run locally; **none is sufficient alone** — that is why there are seven |
| Payload | A content page must not download the stage | `React.lazy` on the journey and visualizer; index ~400 kB + shared ~204 kB, journey chunk ~44 kB |

## 7. Success metrics (local, no tracking)

- A first-time learner reaches Two Sum's recap in one sitting (self-reported).
- The code challenge passes on the first or second run for learners who finished acts 1–5.
- "Restart journey" is used — relearning is the point.

## 8. Open questions

**They live in one place: [`BACKLOG.md`](BACKLOG.md) §Open questions (Q1–Q8)**, each with its
options and a recommendation. Two that were open here are now answered:

- ~~Should the practice set's static walkthroughs come from the journey engine?~~ **Yes** — shipped
  as B1 on 2026-09-05; a test now forbids a problem having both.
- ~~Is the sidebar split Python / DSA / SQL?~~ Shipped as DSA / DSA · patterns / SQL / Data science;
  whether Python earns a section of its own is **Q2**.
