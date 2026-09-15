# Roadmap — where this goes

`BACKLOG.md` says *what next*. This file says *why the next year looks the way it does*, so a
session six weeks from now — or a new collaborator on day one — can tell a good idea from a good
idea at the wrong time.

Last revised **2026-09-13**. Revise this file when the thesis changes, not when a task ships.

---

## The thesis, twice revised

**It was:** *depth before breadth.* Build two journeys all the way down, prove the machinery, then
breadth becomes a content problem rather than an engineering one. **That bet settled.** The
machinery proved out, `engine/derive.ts` turned a journey into a content file, and the count went
from 2 journeys to **93** across **127 problems**.

**It became:** *one page per problem.* Scattering a problem across a journey, a problem page, a
pattern page and three markdown files meant a learner assembled the explanation themselves.
`docs/learn/<id>.md` now merges the generated half (statement, constraints, hints, every rung in
three languages, the arc) with the authored half, and the app reads it at `#/learn/<id>`. **That
bet settled too.** There is one page, and it is the single source of truth per problem.

**It is now: *nothing is true here until it has been run.***

This is the thesis the next year is organised around, and it came from a reader, not from a plan.
Someone said they could not follow the two-pass hash map's arithmetic. They were right twice — the
page never said where the bucket count came from, and the first element does **not** land in the
first bucket. Fixing that one page exposed a class of gap, and counting the class found it in 122
documents.

Then writing the fixes started finding things nobody had asked about:

| Found while writing about | What measuring showed |
|---|---|
| `balanced-tree` | A rung labelled `O(n²)` measured **strictly linear** — 100/200/400/800 `height()` entries on spines of 50/100/200/400. It short-circuited before it could be quadratic. The label rendered on the problem page. (`G6`, fixed) |
| `tree-diameter` | An example whose note claimed it caught the through-the-root wrong solution — which that solution got **right**. All three examples passed it. (`G7`, fixed) |
| `top-k-frequent` | The rung the ladder calls **optimal** is the **slowest** real rung on its page: 13.2 ms against 5.0 ms for the rung below it, because one line allocates `n + 1` list objects. (`G11`, open) |
| `contains-duplicate` | `len(set(nums))` beats the "optimal" early-exit rung by **60%** on the worst case |
| `valid-anagram` | The `O(1)`-space rung is **3× slower** than `Counter`, and on 50,000 identical characters the **sort** wins by 8× |
| `product-except-self` | `O(n)` counts *multiplications*; break the 32-bit promise and the same code goes quadratic — 0.1 → 9.0 ms as `n` goes 500 → 4,000 |

Six documents, five surprises, three of them saying the same thing: **the ladder ranks algorithms,
the clock ranks implementations, and they come apart.** No page in this repo said that before it
was measured. That is the product now — not "here is the optimal solution", but "here is what it
actually costs, and here is the script that says so."

---

## Now — what exists, counted

| | |
|---|---|
| Problems | **127**, across 10 patterns |
| Journeys (animated, act-by-act, earned unlocks) | **93**; the other 34 ship a static walkthrough |
| Teaching documents (`docs/deep/`) | **82**; **45** problems have none |
| Documents carrying all three required sections | **10 of 127** |
| Rungs whose summary does not argue | **0** — closed 2026-09-13 |
| Gates | **7**, all green |
| Node tests | **780** |

Every problem carries an approach ladder in Python, Java and C++, an arc naming the single idea the
ladder applies, and a generated page at `docs/learn/<id>.md`.

---

## Next — Q4 2026: make the content survive being run

**Goal:** every page a learner can reach states what it costs, and proves it.

The queue is `docs/LEARN-PLAN.md`; the counter is `docs/LEARN-GAPS.md`; the ratchet is
`scripts/learn-gaps.test.mjs`, which fails when a number grows.

1. **Retrofit the 72 documents** missing *Reading the Calculations*, *How to Get Fluent*, or an
   `Under the hood` callout with a measured number. In sidebar order, so the most-read problems
   land first. Roughly 2–4 hours each, and — on the evidence of the first six — about one in three
   turns up a defect.
2. **Write the 45 missing documents.** Ordered by pattern thinness: trees, heaps, graphs, dp.
3. **`docs/EDGE-CASES.md`, generated**, joining `journey.edgeCases` to the `> **Watch out.**`
   callouts. Every case must name the approach it breaks, what that approach returns, and be
   **run** rather than asserted.
4. **Close `G11`**, and audit the other "optimal" rungs the same way. Three of the six documents
   written so far found the designated optimal rung losing on the clock; that is a high enough
   hit rate to be worth a sweep rather than a fix.

**Exit criterion:** `docs/LEARN-GAPS.md` reports **0** documents missing a required section, and a
contributor can pick a problem at random, run its script, and reproduce every number on its page.

---

## Then — Q1 2027: breadth, on content that has been checked

**Goal:** no problem ships a lesser experience than its neighbours.

- **The 34 remaining journeys**, the largest slices first: arrays-hashing (9), two-pointers (7),
  trees (4). Each deletes that problem's static `walkthrough` in the same commit, which the
  practice-set gate enforces.
- **The LeetCode top 500 as the target set**, twenty problems per branch — the existing 127 are
  the spine, not the ceiling.
- **A progress surface.** 127 problems is well past the size where a list is navigation, and
  nothing currently surfaces where a learner left off.

**Exit criterion:** a learner can open any problem in the set and get the same four things —
journey, ladder, teaching document, runnable script.

---

## Later — 2027 H2: reach

- **Sharing.** Per-moment previews are the one viral surface a site with no backend has.
- **Spaced repetition**, local only. Retention is the metric the product exists for and the one
  it currently cannot see.
- **Sync**, but only after export/import has visibly annoyed a real person.
- **Server-side execution of the code challenge**, only once a client that is not a browser exists.

---

## What this roadmap deliberately does not contain

- **An LLM tutor.** The hint ladder is static on purpose: a hint that *can* be asked for is a hint
  that gets asked for. If this changes it changes as its own product decision with its own PRD, not
  as a backlog item.
- **A leaderboard.** XP is a private mirror, not a race.
- **Video.** Interaction beats video on retention (`RESEARCH.md`); the animation *is* the video.
- **Scraped content.** Problem statements, constraints and examples are written in our own words
  from each problem's public definition. An offer to scrape a solutions site was declined during
  the 2026-09-13 session and the site was added as a link instead. This is not negotiable, and it
  is the reason the content can be MIT-licensed at all.

---

## Risks, with the signal that says the risk is arriving

| Risk | Signal | Mitigation |
|---|---|---|
| The retrofit is too slow to finish | 72 documents at 2–4 hours each is 20+ working days for one person | This is the top ask in `CONTRIBUTING.md`; each document is fully independent, so it parallelises perfectly across contributors |
| The measurements rot as machines change | A contributor cannot reproduce a quoted timing | Exact counts (probes, comparisons, allocations) are preferred over timings, and every document says its timings are one machine's with the column *shape* as the claim |
| The ratchet grows slack and passes while content rots | Baseline sits above the actual count | `learn-gaps.test.mjs` already asserts the baseline is **not set above the tree** — keep that assertion |
| Two agents write the same branch | A commit that does not compile, or a ledger entry claiming an approval that never happened | **One writer per branch.** Both happened on 2026-09-13; `docs/AGENTS.md` carries the rules |
| The bundle grows with each panel kind | > 300 kB gzip | Code splitting; lazy-load features |
| Depth makes the pages too long to read | A learn page passes ~1,500 lines and the contents rail stops helping | Collapse the rail to approach level; the door matters more than the content, which the `pair-sum` measurement already showed (top of the deep dive moved 3,922 px → 178) |
