# The problem page — the pilot, and everything still owed

> **Pilot problem: `contains-duplicate`** (`#/p/arrays-hashing/contains-duplicate`).
> Every mechanism here is generic — none of it is keyed to one problem id — but only
> `contains-duplicate` has the CONTENT authored, so only it shows the full page. That is
> deliberate: the shape gets approved on one problem before 152 records are edited.
>
> Measured on the built app in headless Chrome, 2026-09-15. Numbers in this document are
> readings, not estimates. Where something is unfixed it says so and says why.

---

## 1. The thirteen asks, and where each one stands

| # | Ask | State | Where |
|---|---|---|---|
| 1 | The search bar overlaps the content | **shipped** | `App.tsx` |
| 2 | Build it up / solve it / learn it, all in one place | **shipped** (mode bar already did two of three; the third is item 8) | `problem-detail.tsx` |
| 3 | Problem content in heading format, not a flat column | **shipped** | `problem-statement.tsx` |
| 4 | GeeksforGeeks link for the problem | **shipped** | `Problem.reading`, `problem-detail.tsx` |
| 5 | Constraints have no animation and no highlight | **shipped** | `problem-statement.tsx` |
| 6 | Hints / inputs / outputs need a real UI and motion | **half shipped** — inputs and outputs are watchable; hints are still an accordion | `example-viewer.tsx` |
| 7 | Cannot see the inputs changing at runtime | **half shipped** — the example walks; the CODE still does not trace | `example-viewer.tsx` |
| 8 | The long explanation is a second read and feels duplicated | **staged, slice 2** — the fix is structural, see §4 | — |
| 9 | At least three references, plus similar-pattern links at the end | **shipped** — 5 sources, 2 of them about this problem, plus 13 sibling problems | `similar-problems.tsx` |
| 10 | Explain WHY and HOW the complexities are calculated | **shipped** | `Solution.costWhy`, `Problem.costWhy` |
| 11 | Make the reader think before solving | **shipped** | `pre-solve-check.tsx` |
| 12 | "Next walkthrough" | **needs a decision** — see §3, Q1 |
| 13 | Check the page for other issues and write them down | **this document**, §5 | — |

---

## 2. What shipped, with the measurement

### 2.1 The search control covered the page (ask 1)

It was `fixed top-3 right-4`. A fixed element is out of flow, so nothing reserved its
corner and it painted over whatever the page put there. Measured on the pilot page, the
overlap with the **`solved` checkbox**:

| Viewport | Overlap before | After |
|---|---|---|
| 1440 | none (the column is narrow enough) | none |
| 1280 | 25 × 5 px | none |
| 1100 | 69 × 24 px | none |
| 1024 | 69 × 24 px | none |
| 900 | 69 × 24 px | none |

At 1100 and below the checkbox was under the button and could not be clicked at all.
`ContentsRail` had already met this button and worked around it with a `top-16` — one
symptom patched, the cause left in place.

The fix is the shell's, not the page's: the phone's sticky bar now runs at **every** width
and carries the search control alone above `md`. A bar in flow cannot overlap anything.
The panel pages (journey, visualizer) keep the keyboard-only palette exactly as before.

After: the control reports `position: static` at 1440, 1100 and 900, and intersects
nothing in `main` but its own label.

### 2.2 The problem is three headed sections (asks 3, 5, 6, 7)

The heading outline of the page, read out of the built DOM:

```
H1  Any Repeat in the Array?
H2  the problem
H3    What it asks
H3    What you are promised        4 bounds · 4 say what they buy
H3    Examples                     2 cases
H2  before you solve it            answerable from the statement alone
H2  hints                          3, each one further in
H2  walkthrough
H2  approaches                     3 ways in, each answering the one before it
H2  the same move, elsewhere       13 more in Arrays & Hashing
H2  The long explanation
```

Before, everything between `H2 the problem` and `H2 hints` was one undifferentiated
column — a paragraph, an all-caps label, a bullet list and two mono boxes, nothing
addressable and nothing linkable.

**Constraints.** They were grey bullets in the muted role — the quietest text on a page
where half of them are the reason an approach is possible at all. Now each is a row that
lights on hover, revealed in a 45 ms stagger on the existing `--duration-reveal` token
(no new motion, no second curve — the R6 audit still passes), and where the record says
what a bound BUYS, that sentence sits under it. All four of this problem's bounds carry
one, lifted from its own teaching document, where they were two thousand words further
down the page.

**Examples.** Each example whose input parses gets cells and a transport: step or play,
a `focus` mark walks the values, everything behind it settles, and the output reveals
with the answer pulse at the end. Measured: two clicks of ▶ moves the mark from nothing
to `1 [2] 3 1`, caption `value 2 of 4`.

The parser (`lib/example-shape.ts`) **refuses** rather than guesses — a nested list, a
tree, prose, an unclosed bracket all fall back to the mono block the section used to
print. 11 unit tests, and the refusals are the half that matters: a wrong diagram is
worse than no diagram.

The cursor is a READER, not a solution. It does not run the algorithm — that is the
walkthrough band below, generated per problem from the journey's own frames.

### 2.3 Where the bounds come from (ask 10)

Every rung on the ladder now carries a `how that was counted` disclosure, and the orient
bar's target carries a `why?`. Three of three rungs on the pilot page have one. They are
arguments, not labels:

> **O(n log n) time · O(1) space — how that was counted.** Two costs, and naming them
> apart is this rung's lesson. RESTRUCTURING — the sort — is O(n log n) and dominates.
> SEARCHING — the single adjacency sweep after it — is only O(n), so improving the sweep
> buys nothing and the only way forward is to stop sorting. The O(1) space assumes an
> in-place sort; the Python here copies with `sorted()`, which is O(n).

Binding them turned up a real hole: on a journeyed problem the ladder's rungs come from
the ACTS, and an act has no field for ladder metadata. The alternative of the same name
is where it lives — which needs an explicit `key:`, and keying the two alternatives on
this problem made the repo's own gate fail the build, correctly: *"alternatives carry
keys, so `from: 0, from: 1` is a stale positional index"*. The journey's acts name their
code by key now. That gate exists because an index-based `from` once showed one
approach's code under another's name.

### 2.4 Think before you solve (ask 11)

Three questions between the problem and the hints, because the first thing the page used
to offer a reader who had finished reading was a way out of thinking. Every answer is in
the statement or the bounds above it, so nothing here can spoil an approach. Nothing is
scored, stored or gated — in particular it never writes an `unlocked:` key, because
progressive disclosure is a promise about approach NAMES and this must not touch it.

The reason shows on a right answer too. A reader who guessed correctly and cannot say why
is exactly the reader it is for.

### 2.5 Reading, and where the move goes next (asks 4, 9)

- **This problem's own sources** now sit above the pattern's: the GeeksforGeeks write-up
  of the same ladder in four languages, and the NeetCode video. Both were checked with a
  real HTTP request before they were written down — four earlier GeeksforGeeks slugs
  returned 404 and were dropped rather than guessed at. The page reads
  `2 on this problem · 5 sources`.
- **The same move, elsewhere**: the 13 other Arrays & Hashing problems, easiest first,
  solved ones struck through, and a link to the whole pattern. The page used to end at the
  explanation, so the only way onward from a finished problem was the sidebar.

Why both lists and not one: references hang off a PATTERN on purpose (`data/types.ts`
argues it) — the good sources are about the technique. That argument holds for a chapter
on hashing and does not hold for a second site's write-up of THIS problem, which would be
the wrong link on every other problem in the pattern.

### 2.6 The gates

| Gate | Result |
|---|---|
| `npm run check` | **804 / 804**, 0 fail (789 before; 15 new tests) |
| `npm run test:ui` | **178 / 178**, 0 fail, real Chrome |
| `npm run build` | clean |
| console on the pilot page | **no errors** |

Two of those 178 failed on the first run, both mine, both caught by gates that already
existed: the new constraints markup dropped the `aria-label="constraints"` hook an R2
check reads, and the example transport rendered at 28 px against the 44 px touch floor.
Both fixed; neither would have been noticed by reading the diff.

---

## 3. Open questions — I need a decision on these

**Q1 — "next walkthrough" (ask 12).** Three readings and I will not guess: (a) a
prev/next control that moves between the page's own sections; (b) a "next problem" link
at the foot, which `the same move, elsewhere` partly is already; (c) the walkthrough
should step to the NEXT approach's walkthrough rather than only the earned one. Say which.

**Q2 — how much of the explanation folds in.** §4 is the plan; it deletes the "Learn this
problem" button as a separate act. Confirm that is what you want before I do it to 82
documents.

---

## 4. Slice 2 — the structural one (asks 6, 7, 8)

This is the item worth the most and the only one that cannot be done page-side.

**The duplication is real and it is not a rendering problem.** The page shows the ladder
(each rung: name, cost, summary, code). The teaching document then repeats each of those
rungs with `The idea`, `How to think about it`, `Worked example`, `Code`, `Common
mistake`, `Complexity and when to use this`. Two accounts of the same three approaches,
one under the other, and the reader is asked to read both. The count on the pilot page:
the closed page is **6.6 screens**; open, the explanation adds most of a further twenty.

**The fix: a rung carries its own document sections.** The per-approach content moves
INTO each rung of the ladder, collapsed — idea, worked example, common mistake, the cost
argument — and the "long explanation" at the foot keeps only what is NOT per-approach:
Understanding, the failure-mode table, Reading the calculations, the arc, the comparison
table, interview priority, the runnable script. Nothing is said twice, and the reader
never leaves the rung they are on.

The data for this already exists. 49 of 82 documents are typed as
`src/problems/<id>/approaches/<rung>.ts` — one file per rung, with exactly those fields.
`contains-duplicate` is not one of them yet: it is still
`docs/deep/contains-duplicate_explained.md`, and converting it needs **B79 first** (its
document teaches five approaches, its record has three; the two extras need Java and C++
before the record can carry them — 4 blocks, gated by `verify:code` and `verify:run`).

**Also in slice 2, the honest half of asks 6 and 7:**

- **Hints** are still a plain accordion. They should be a ladder with the same
  disclosure vocabulary as everything else — you take one, and the page shows what it
  cost you.
- **The code does not trace.** The Run button runs Python in the browser (Pyodide) and
  prints output. It does not show `seen` filling up, or the loop variable moving. That is
  the real answer to "I cannot see the inputs changing at runtime" — the example viewer
  is the input moving, not the algorithm. The journey already traces; the problem page's
  code block does not.

---

## 5. Other issues on this page, found while measuring

| # | Finding | Evidence | Severity |
|---|---|---|---|
| **P1** | `problem-detail.tsx` is **843 lines** against the repo's own 500-line ceiling, and it owns the orient bar, the mode bar, the ladder, the comparator route, the reading list and the contents rail. Every change to this page reopens all of it. | `wc -l` | medium — it is the file every item in §4 has to edit |
| **P2** | A path that is not a route still serves the app: `/spiral-matrix-ii.md#/p/arrays-hashing/contains-duplicate` renders the problem page normally. The SPA fallback answers 200 for any path, so a mistyped or stale URL looks like it worked. A reader who bookmarks that link keeps a URL that will break the day the file exists. | the URL in the request | low, but it is how this session's URL was formed |
| **P3** | The page is now **6.6 screens closed**, up from 4.0. Three sections were added and none were removed; slice 2 removes the duplicate twenty. Until then the page is longer than it was. | `scrollHeight / innerHeight` | medium — stated so the next measurement is honest |
| **P4** | `docs.txt` is untracked in the repo root — an empty file, not gitignored and not referenced by anything. | `git status` | low — delete it or ignore it, but not silently |
| **P5** | `FEATURES.md` still lists the **Command palette** as `backlog #B12`. B12 shipped; the palette is on the page and the search control is the thing §2.1 just moved. A features table that is wrong about what exists is worse than no table. | `docs/FEATURES.md:32` | low |
| **P6** | The hint accordion allows one hint open at a time (`multiple={false}`), so reading hint 3 closes hint 2 — a progressive ladder you cannot see the rungs of at once. | `problem-detail.tsx` | low |
| **P7** | `Problem.reading`, `unlocks`, `checks` and `costWhy` exist on **1 of 153** problems. The gates check coherence, not presence, on purpose — a gate demanding them would fail 152 problems the day it landed. The ratchet is a future decision, not this branch's. | `problems.test.ts` | informational |

---

## 6. What a second problem costs, once this shape is approved

Per problem, all of it authoring and none of it code:

| Field | What it takes |
|---|---|
| `unlocks` | already written in the teaching document's own constraints table — copy, for the 82 that have one |
| `costWhy` × rungs | already written in each approach's `Complexity and when to use this` — copy |
| `checks` | new writing, ~15 minutes for three, and the only part that needs judgement |
| `reading` | two verified links; **check every URL with a real request** — four of the first six 404'd |
| keys on alternatives | one line each, and it may force the journey to name its acts by key in the same commit (the gate will say so) |

So the expensive half of the pilot is already sitting in `docs/deep/` for 82 problems, and
slice 2 is what makes it reachable without being read twice.
