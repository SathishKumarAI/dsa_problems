# The problem page — the playbook

How to take any of the other **152 problems** to the shape `contains-duplicate` is in. Written
after the pilot shipped, from the pilot, so every rule here has already been paid for once.

**This doc owns the RECIPE.** Three others own things it deliberately does not repeat:

| For | Read |
|---|---|
| Why the pilot's asks were answered the way they were, and what is still open | `PROBLEM-PAGE.md` |
| Which type step, colour role, measure, radius or duration to use | `DESIGN.md` |
| The field shapes, in the language the compiler checks | `src/data/types.ts` |

The short version: **the code is done, the content is not.** Nothing below asks you to write a
component. Every band already renders, already has its gate, and already degrades to nothing when
its field is absent — which is why 152 pages render today and look thin rather than broken.

---

## 1. The anatomy — what the page is, band by band

Top to bottom, as `problem-detail.tsx` renders it. The **Feeds it** column is the only column you
act on: it names the field to author.

| # | Band | `id` | Feeds it | Absent ⇒ |
|---|---|---|---|---|
| 0 | Orient bar (title, difficulty, target, `costWhy`, solved) | — | `difficulty`, `complexity`, `costWhy` | the "why?" fold disappears; the bar stays |
| 1 | **The problem** — statement, examples, constraints | `the-problem` | `statement`, `examples`, `constraints`, `unlocks` | constraints render as a plain list: no cards, no figures |
| 2 | **Before you solve it** | `before-you-solve-it` | `checks` | band omitted entirely |
| 3 | Hints | `hints` | `hints` | — (100% coverage) |
| 4 | Walkthrough **or** the embedded journey | `walkthrough` | `walkthrough` \| a journey | neither: band omitted |
| 5 | **Reading the calculations** | `reading-the-calculations` | `costWhy` + per-rung `costWhy` | band omitted |
| 6 | **Approaches** — the ladder | `approaches` | `approach`, `alternatives[]`, `whyNow`, `arc` | renders, but every rung is a bare bound |
| 7 | Similar problems | — | derived from `pattern` | — |
| 8 | **Taking it with you** — the folded document | `explanation` | `src/problems/<id>/doc.ts` or `docs/deep/<id>_explained.md` | band omitted |
| 9 | Read further | — | `reading` + the pattern's own list | falls back to the pattern's list alone |
| R | The contents rail (≥ `xl`) | — | the bands above, in page order | — |

Two structural facts that are easy to forget and expensive to rediscover:

- **There is no second route.** `#/learn/<id>` redirects. Everything a reader needs is on this page,
  which is what makes "nothing may be said twice" enforceable rather than aspirational.
- **The rail lists the same array the page renders** (`partsOf`), so it can never offer a section
  that is not there.

---

## 2. Where the corpus actually stands

Measured 2026-09-16 across all 153 problems, not estimated. **A table of numbers in a document is a
claim about a moment**, so it is a reading you can re-take rather than a figure to believe:

```
npm run page-coverage           # this table
npm run page-coverage -- --thin # the ids that carry none of the five — cut a batch from it
```


| Field | Problems carrying it | |
|---|---|---|
| `examples` | 153 | 100% |
| `hints` | 153 | 100% |
| `arc` | 153 | 100% |
| `walkthrough` | 60 | 39% |
| keyed `alternatives` | 13 | 8% |
| `unlocks` | **1** | 1% |
| `unlocks` with a figure | **1** | 1% |
| `checks` | **1** | 1% |
| `reading` | **1** | 1% |
| `costWhy` (page target) | **1** | 1% |
| `costWhy` on every rung | **1** | 1% |
| `whyNow` on **every** alternative | **0** | 0% |

`--thin` says it in one line today: **152 of 153 problems carry none of the five.**

So the work is five fields, and the pilot is the only page that has them. `arc` sitting at 100%
already is the single biggest saving: the hardest paragraph on the page is written for every problem.

**Where the raw material is.** 82 problems have a teaching document (`src/problems/<id>/doc.ts`, or
`docs/deep/<id>_explained.md` for the unconverted). Two of the five fields are already written
inside them:

| Field | Already written in | For how many |
|---|---|---|
| `unlocks` | the document's own constraints table | 82 |
| `costWhy` × rung | each approach's *Complexity and when to use this* | 82 |

Copying is not cheating here — it is the point. The document is folded into the page (§4 of
`PROBLEM-PAGE.md`), so a fact lifted into a field is REMOVED from the fold, not duplicated.

---

## 3. The recipe — the order to author in

The order matters. Each step's output is the next step's input, and doing them out of order means
writing the same sentence twice.

```
1. read the teaching document           →  you now know the ladder and the bounds
2. key the alternatives                 →  the gate may demand journey acts change too
3. unlocks   (copy from the doc)        →  the bounds, and what each buys
4. figures   (author, 0–4 per problem)  →  the bounds, drawn
5. costWhy   (copy from the doc)        →  page target + one per rung
6. checks    (NEW WRITING — the judgement)
7. reading   (2–3 links, every URL hit for real)
8. run the gates, in the order in §6
```

### Cost per problem, measured on the pilot

| Step | Time | Why |
|---|---|---|
| keying alternatives | 2 min | one line each — but see the trap in §7 |
| `unlocks` | 10 min | transcription, with judgement about what to leave in the fold |
| figures | 15 min | the only step needing a decision per bound |
| `costWhy` | 10 min | transcription |
| `checks` | **20 min** | the only genuinely new writing, and the only part worth reviewing |
| `reading` | 10 min | dominated by verifying URLs |
| gates | 5 min + run time | |

**≈ 70 minutes for a problem that already has a teaching document.** For the 71 that do not, the
document comes first and this playbook is the second half of that job, not a substitute for it.

---

## 4. The five fields, in detail

### 4.1 `unlocks` — a bound, and what it buys

```ts
unlocks?: { constraint: string; what: string; figure?: ConstraintFigure }[]
```

**The idea.** A constraint is noise until it rules something out. `1 <= nums.length <= 10^5` says
nothing to a reader; *"this is the bound that rules brute force out"* is the same fact turned into a
decision.

**`constraint` must match a string in `constraints` EXACTLY.** `problems.test.ts` fails otherwise —
deliberately, because an unlock that drifts from its constraint is a card explaining a bound the page
does not state.

**What good looks like** (pilot, verbatim):

> `1 <= nums.length <= 10^5`
> — A hundred thousand elements makes O(n²) about 5·10⁹ comparisons. This is the bound that rules
> brute force out — it demands O(n log n) or better.

> `-10^9 <= nums[i] <= 10^9`
> — Values may be negative and span four billion possibilities, so an array with one slot per value
> is not allocatable. The lookup structure has to take arbitrary integer keys, which is a hash set's
> job.

**What bad looks like.** *"The array can have up to 100,000 elements."* That restates the constraint
in English and buys nothing. If the `what` does not name a decision — an approach ruled in, ruled
out, or a base case — it is not an unlock and should be left out.

**How many.** The pilot has four. Two to four is the range; a bound that buys nothing gets no card.

### 4.2 `figure` — the bound, drawn

Three kinds, and they are deliberately few. Each is a **shape the corpus's constraints actually
take**, not a chart type.

| Kind | Use when the bound is | Pilot example |
|---|---|---|
| `quantities` | two or more amounts that must be **compared** — the work at the ceiling | `every pair 5·10⁹` vs `sort then sweep 1.7·10⁶` vs `one pass 10⁵` |
| `span` | a **range**, with the handful of values you will really see marked on it | `−10⁹ … 10⁹`, seven marks — the picture of sparsity |
| `cells` | a literal array, small enough to **count** — the base cases | `["?", "7"]`, captioned *"index −1 is the one an off-by-one reads"* |

**AUTHORED, never inferred.** `10^5` is a length and `10^9` is a value; a figure that guessed which
would eventually draw a confident lie. That is a comment in `types.ts`, and it is the rule.

**Bars are on a LOG scale** (`lib/figure-scale.ts`). Linear, `10^5` against `5·10^9` renders at
0.002% — an invisible sliver saying "nothing here" when the point is "this is the affordable one".
Bars are coloured **by rank on the ordered ramp**, never by a categorical role; see §5.

`tone` (`bad` / `good` / `plain`) is a hint about the ARGUMENT, not a colour instruction.

### 4.3 `costWhy` — how the bound was counted

```ts
costWhy?: string           // on Problem: the page's target
costWhy?: string           // on Solution: one per rung
```

**The idea.** `O(n)` is a label; being able to reproduce the count is a skill. A reader who cannot
re-derive it cannot transfer it to the next problem, which is the entire product thesis.

**What good looks like** — note that it names **two** costs and says which dominates:

> **Sort first.** Two costs, and naming them apart is this rung's lesson. RESTRUCTURING — the sort —
> is O(n log n) and dominates. SEARCHING — the single adjacency sweep after it — is only O(n), so
> improving the sweep buys nothing and the only way forward is to stop sorting. The O(1) space
> assumes an in-place sort; the Python here copies with `sorted()`, which is O(n).

Three things that paragraph does, and all three are the standard:

1. **counts** rather than naming — *"n − 1 comparisons, then n − 2, … which sums to about n²/2"*;
2. **names the honest caveat** — *"O(1) expected, not worst case; adversarially chosen keys can
   collide"*, *"the Python here copies with `sorted()`"*;
3. **says what improving the wrong half buys**, which is what makes it an argument for the next rung
   rather than a footnote.

Write one per rung **and** one for the page target. The page's own is the optimal rung's, said for a
reader who has not climbed yet.

### 4.4 `checks` — read before you solve

```ts
interface Check { ask: string; options: string[]; answer: number; because: string }
```

**The idea, and why this is the expensive field.** The ladder starts at *"brute force compares every
pair"*. A reader who has not yet noticed the question is **whether** a repeat exists rather than
**which** value repeats reads all three rungs without that landing. These are questions about the
**statement**, asked before the first approach, and **never about the solution**.

The pilot's three, and the job each one does — this is the template:

| # | Asks | Job |
|---|---|---|
| 1 | *"What is the question actually asking you to produce?"* | the **task**: existence, not identity — which is what licenses the early exit |
| 2 | *"`nums = [7]`. What comes back?"* | the **base case**, as an input rather than as trivia |
| 3 | *"Values run −10⁹…10⁹. What does that bound rule OUT?"* | a **constraint**, converted into a decision |

That triple — *task, base case, bound* — transfers to essentially every problem. Start there.

**`because` is the whole value.** It is shown once answered, right **or** wrong, and it must cite what
the statement or the constraints already told you:

> The statement asks for true if any value appears at least twice — existence, not identity. That is
> what lets an approach stop reading the moment it finds one: nothing later in the array can change
> the answer.

**Distractors must be plausible.** *"it is undefined; the input is too small"* is a real belief a
reader holds. An option nobody would pick teaches nothing and makes the check a formality.

### 4.5 `reading` — sources for THIS problem

```ts
interface Reference { title: string; href: string; kind: "reference"|"docs"|"course"; note: string }
```

**The split, and it is load-bearing.** The **pattern** owns sources about the TECHNIQUE — there is an
authoritative page on hash tables. A **problem** owns only sources that would be wrong on any other
problem in the pattern: the editorial, a second site's write-up of this instance, a video of it.
Attaching technique links per problem would mean 153 rows of the same three links.

**`note` says what the source is FOR.** A bare link is a chore, not a reading. `problems.test.ts`
enforces `https` only, no placeholder hrefs, and a note on every row.

> **Check if array contains duplicates — GeeksforGeeks.** The same three rungs this page climbs,
> written out in C++, Java, Python and JavaScript — useful as a second voice on the same ladder, and
> for the languages this page does not carry.

> **Duplicate Integer — NeetCode.** A video walkthrough of the same problem. Watch it after you have
> tried the checks above, not before — it states the set approach in the first minute.

**Hit every URL with a real request.** Four of the first six candidates 404'd. GeeksforGeeks in
particular moved its DSA pages under a `/dsa/` path, and the old URLs are still everywhere.

**Nothing in this repo copies text from a source.** The README's claim that all the material here is
an original write-up is load-bearing, and a references list is how you honour a source without
borrowing from it.

---

## 5. The rules a page may not break

Learned in the pilot, each one after breaking it. Full reasoning in `DESIGN.md`; this is the list you
check a new page against.

| Rule | The failure it prevents |
|---|---|
| **Nothing is said twice — by MEANING, not by string** | the page carried two arcs saying the same thing in different words; a string comparison finds neither |
| **Colour means DATA; chrome gets `--edge`** | a hovered row drawn in `--chart-1` says "focus" where nothing is focused |
| **Ordered quantities take the ramp, never a categorical hue** | five role colours say "five kinds"; a ladder is a climb |
| **Prose takes `max-w-measure`** — never an `em` cap, never on a padded box | `max-w-[35em]` rendered eight different widths in one column |
| **One measure per FLOW, not per block** | a per-block cap is applied after nesting, so a callout inside a fold ends up wider than the column |
| **Every in-page anchor needs `preventDefault()` + `scrollIntoView`** | a bare `#id` href is a ROUTE change in a hash-routed app — the page you were reading is gone |
| **44px touch floor below `lg`** | the transport buttons shipped at 28px |
| **`aria-label="constraints"` on the constraints region** | load-bearing for the R2 gate; dropping it fails silently |
| **A journeyed problem's ladder is CAPPED** | naming an unearned approach is the one thing the product promises it never does |

---

## 6. The gates, in run order

Run them in this order; each is cheap relative to the one after it.

| # | Command | Catches | In CI |
|---|---|---|---|
| 1 | `npm run check` | types, lint, 837 node tests — field shapes, the `constraint` match, reference shape, ladder order | ✅ |
| 2 | `npm run build` | the production bundle | ✅ |
| 3 | `npm run test:ui` | 178 real-Chrome checks — R1 ladder, R2 constraints, R6 motion, the panel audit | ❌ |
| 4 | `npm run verify:code` | Java and C++ compile | ✅ |
| 5 | `npm run verify:run` | they agree with the Python oracle | ❌ |
| 6 | `npm run verify-deep` | all 82 teaching scripts execute | ✅ |
| 7 | `npm run verify:vectors` | mutation-tests the cases | ❌ — and **currently RED** (G12) |
| 8 | `npm run learn-gaps --strict` | a problem with nothing to explain | ✅ |

**Two things about that table that cost a session each.**

- **CI runs six of the eight.** `vectors`, `run`, `fences` and `test:ui` are only ever as green as the
  last person who ran them locally said they were.
- **A pipe replaces the exit code with the last command's.** `npm run verify:vectors | tail -4`
  reports the success of `tail`. That is how a red gate with 22 survivors sat unnoticed on master.
  Read the gate's own summary line, or run it unpiped and echo `$?`.

Content-only work needs **1, 2, 3, 8**. Touching a Java or C++ block adds **4, 5**.

---

## 7. Traps that cost real time in the pilot

- **Keying the alternatives can break the journey.** The repo gate reads positional indices
  (`from: 0`), and adding keys makes those stale — they must become `from: "brute"` in the same
  commit. The gate says so, but only after you have keyed them.
- **`getBoundingClientRect` on an INLINE element spans every line it wraps across.** Measuring
  vertical gaps by subtracting rects "found" a 6200px hole on a 6898px page. Measure block boxes.
- **A contrast ratio is not distinguishability.** It measures luminance only, and called light-mode
  orange and blue identical at 1.22:1. Use OKLab distance for "can these be told apart".
- **Justification opens rivers in a narrow column.** `prose-set` at 337px (≈40ch) looked broken; it
  is right on the wide column and wrong inside a card.
- **A backtick inside a comment inside a template literal ends the string.** `ui-smoke.test.mjs`
  quietly ran 16 tests instead of 178. `node --check <file>` names it in one line.
- **A test that measures a COLOUR class breaks when the colour moves.** A UI gate selected the diff
  marker by `border-chart-1`; it reads `data-diff` now. Assert the fact, not the decoration.
- **A gate that NAMES a problem goes stale when a batch converts it.** Read the subject off disk.

---

## 8. The per-problem checklist

Copy this into the PR body.

```
## <problem-id>

Content
- [ ] alternatives keyed (and journey `from:` rewired if the gate asked)
- [ ] unlocks: 2–4, each `constraint` matching `constraints` EXACTLY
- [ ] each unlock's `what` names a DECISION, not a restatement
- [ ] figures authored where the bound has a shape (quantities / span / cells)
- [ ] costWhy on the page target
- [ ] costWhy on every rung — counts, caveat, and what the wrong half buys
- [ ] checks: 3 — task, base case, bound
- [ ] every `because` cites the statement or a constraint
- [ ] reading: 2–3, every URL fetched for real, every row has a `note`
- [ ] anything lifted into a field is GONE from the fold (nothing said twice)

Gates
- [ ] npm run check        ___/___ pass
- [ ] npm run build        clean
- [ ] npm run test:ui      ___/___ pass
- [ ] npm run learn-gaps --strict

Ledger
- [ ] FEATURES.md row added
- [ ] backlog item ticked in the same commit
```

---

## 9. What you do NOT pay per problem

Done once, in the pilot, and already applying to all 153:

- every band, its gate, and its absent-state
- the constraint cards, the stagger, the hover lift, the three figure kinds
- the example stepper, and `example-shape.ts` — which **refuses** nested lists, prose and unclosed
  brackets rather than guessing
- the pre-solve check UI, the cost fold, the comparator, the rail with its scroll-spy
- the embedded journey, fullscreen as the mode
- the notation splitter (`lib/notation.ts`) — 668 constraint lines, 170 notation, 498 English
- the document fold (`lib/doc-sections.ts`) — drops per-rung duplicates, the constraints table and
  the document's own arc
- the palette, the measure, the motion system, and the six gates in `palette.test.ts`

**The one code item still open:** B100 — the fold works for Markdown documents, not for the 49 typed
ones. Until it lands, a typed problem's §8 shows the whole document rather than the folded half.
