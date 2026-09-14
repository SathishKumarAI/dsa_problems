# The learning plan — everything outstanding, in order

Written 2026-09-13. This is the working list: what is left, why it matters, and what "done" looks
like for each. `docs/BACKLOG.md` holds the product backlog; this holds the **content and
comprehension** work, which is now the bigger half.

Two generated files keep it honest, so nothing here is remembered rather than counted:

| File | What it counts | Regenerate with |
|---|---|---|
| [`LEARN-GAPS.md`](LEARN-GAPS.md) | per problem: which required sections are missing | `node scripts/learn-gaps.mjs` |
| [`learn/`](learn/) | the pages themselves | `npm run docs:learn` |

---

## The goal, stated once

**One page per problem that teaches it to four readers at once** — a first-year student who stalls
at the arithmetic, a working engineer choosing between approaches, a candidate rehearsing what to
say, and an architect asking what the data structure really costs. `docs/deep/TEMPLATE.md` holds
that table; every document is measured against it.

The generated half of each page is finished and cannot rot: statement, constraints, examples, hints,
the ladder in three languages, a runnable script. **The authored half is the work.**

---

## Where it stands, measured

Regenerate with `node scripts/learn-gaps.mjs`. Never trust the numbers in prose, these included.

| | Count |
|---|---|
| Problems | **127** |
| With a learn page | **127** — generated, so this stays true |
| With a teaching document | **82** |
| With "Reading the Calculations" | **10** |
| With "How to Get Fluent" | **10** |
| With an "Under the hood" callout | **10** |
| Adding approaches without disclosing it | **0** — closed 2026-09-13 |
| Rungs whose summary does not argue | **0** — B68, closed 2026-09-13 |

Those three tens were **ones** the day before. Both sections were added to the spec on 2026-09-13
after a reader said, of the two-pass hash, *"I cannot follow the calculations"* — and was right
twice, because the first element does **not** land in the first bucket and nothing on the page said
so.

**What retrofitting them keeps finding.** Five documents done in sidebar order, and three of the
five found the ladder's designated **optimal** rung losing to a rung below it on the clock. That is
now the point of the exercise as much as the prose is: the measurement decides what the section
says, so write the measurement first and the prose second.

| Done | What measuring showed |
|---|---|
| `top-k-frequent` | Optimal rung slowest on the page; the `n + 1` bucket wall is 5.8 of its 13.2 ms. **Filed G11** |
| `longest-consecutive-run` | The guard costs 320,400 → 1,600 probes on a long run, and **doubles** the work when no run exists |
| `contains-duplicate` | `len(set(nums))` beats the optimal rung by 60% on the worst case, loses by 33× on the best |
| `valid-anagram` | The `O(1)`-space rung is 3× slower than `Counter`; on 50,000 identical characters the sort wins by 8× |
| `product-except-self` | Optimal genuinely fastest (1.8×) — and `O(n)` counts *multiplications*, which go quadratic when the 32-bit promise breaks |

---

## The order of work, and why

### 1. ~~Disclose the 23 undisclosed additions~~ — **DONE 2026-09-13**

`node scripts/learn-gaps.mjs --strict` now exits 0. Keep it there: a document that teaches a rung
the data file lacks must say so in its heading. Note that this is a live constraint, not history —
when `G6` moved `balanced-tree`'s ladder rung from the short-circuit version to the every-node one,
the two `*(an addition)*` labels in that document had to **swap**, or the gate would have gone red.

### 2. "Reading the Calculations" for the remaining 117 — **the reported pain**

**In sidebar order.** Five done: `top-k-frequent`, `longest-consecutive-run`, `contains-duplicate`,
`valid-anagram`, `product-except-self`. Next up is `group-anagrams`, then `subarray-sum-k`,
`majority-element`, `longest-common-prefix`, and the rest of arrays-hashing.

**Write the measurement before the prose.** Extract the document's last Python fence (that is the
one `verify-deep.mjs` runs), measure against it, and let the numbers decide what the section says.
Then move the measurement code *into* the document's script so a reader reproduces rather than
trusts, and pin the prose to that run's actual output — timings move between runs, exact counts do
not.

This is the section that answers the actual complaint. Start where a learner starts: the problems
with journeys, in the order the sidebar lists them.

**Done when:** a reader can decode every expression in the document without leaving the page, and
the hand-trace recipe reproduces the worked example row for row.

### 3. "Under the hood" wherever a cost is taken on faith — **the architect's row**

Any document that says `O(1)` for a hash lookup, `O(log n)` for a sort-based rung, or "amortised"
anything owes a measured number. `pair-sum` is the worked example: a flat ~18ns dict lookup against
a list scan growing 2 960 → 30 345 → 302 750ns, and the same lookup degraded to linear by forcing
every key into one bucket.

**Done when:** no complexity claim in a document rests on the reader's trust alone.

### 4. "How to Get Fluent" everywhere — **reading is not practising**

Three to six drills per problem, each with a done-condition, ending in the one sentence that should
survive a month.

### 5. The 46 problems with no document at all

Ordered by pattern thinness: trees (1 left), heaps (9), graphs (11), dp (14), then the rest.
`docs/deep/PROMPT.md` is the brief; `docs/deep/TEMPLATE.md` is the skeleton.

### 6. A centralised edge-case list per problem — **not started**

Every input that breaks a plausible solution: empty, one element, all equal, negatives, the value at
the constraint's limit, the shape that defeats the naive approach. Two sources already exist and
are not joined up: `journey.edgeCases` (93 journeys) and the `> **Watch out.**` callouts (81
documents).

**Done when:** `docs/EDGE-CASES.md` is generated from both, every case names the approach it breaks
and what that approach returns on it, and the cases are **run** rather than asserted.

### 7. Carried over from earlier sessions

| Item | State |
|---|---|
| Ten teaching documents a killed agent was briefed on — add-two-numbers, odd-even-list, reorder-list, rotate-list, koko-bananas, ship-in-d-days, find-peak-element, k-closest-values, calculator-basic, simplify-path | not started — see `docs/AGENTS.md` |
| `inorder-walk` — the last trees document | not started |
| Statistics chapter 5, hypothesis testing | not started; `docs/statistics/` stops at chapter 4 |
| G6 — `balanced-tree`'s naive rung is labelled `O(n²)` and measures linear | filed, not fixed |
| G7 — all three `tree-diameter` examples pass the through-the-root wrong solution | filed, not fixed |
| The pattern name prints unconditionally on every generated page, which is the one string the app's disclosure system hides | filed here, not fixed. The learn page is a declared spoiler zone, so this may be correct as it stands — it needs a decision, not a patch |

### 8. Front-end work that follows from the above

- The bucket arithmetic is explained on insert and on lookup, and the starting table size now says
  why it is eight. **Done 2026-09-13.**
- Every other panel deserves the same question asked of it: *is there a number on this screen that
  the screen does not explain?* The steps chart, the load meter and the chip legend have not been
  checked.
- A learn page's contents rail is a flat list of every heading; on a 40-section document that is a
  wall. It should collapse to the approach level.

---

## How to work an item

1. `node scripts/learn-gaps.mjs` — take the next problem from the table.
2. Brief it with `docs/deep/PROMPT.md`, skeleton from `docs/deep/TEMPLATE.md`.
3. Write the script FIRST and run it. Every number the prose will quote comes from that run.
4. `node scripts/verify-deep.mjs --id <id>` · `node scripts/learn-gaps.mjs --strict`
5. `npm run docs:learn` — the merged page picks it up.
6. Commit with the measured numbers in the message. One problem per commit is fine; the commit is
   the only documentation that ships attached to the work.

## What not to do

- **Do not copy problem statements or solutions from anywhere.** Not LeetCode, not an aggregator,
  not a course. Everything here is written in our words and verified by running it; copied text
  would be both a licence problem and the end of that guarantee. Outside material belongs in
  `docs/RESOURCES.md` as a link.
- Do not write a document you have not run.
- Do not add an approach the data file lacks without labelling it.
- Do not quote a number you did not measure on this machine.
