# Problem pipeline — every problem in the app, built the journey way, one at a time

`BACKLOG.md` says what to build in the product; this file says **which problem is next** and what
"done" means for a problem. One problem per branch (`feat/journey-<slug>`), one PR, squash-merged.
Never two problems in flight. Check the row off in the commit that ships it.

## Definition of done for one problem

A problem is done when every box is ticked **and the evidence is in the PR**:

- [ ] **Read it like the book** (Khamies §3.1): statement restated in plain words, formalized as
      input → output, the promises named, three inputs brought — smallest legal, medium, corner.
- [ ] **`edgeCases`** (≥ 3) with technique-neutral prose, each tagged by a frame on its preset
      (`journeys.test.ts` enforces).
- [ ] **Approaches worst → best**, each an act earned by the previous one's weakness: story →
      brute → … → optimal → *Code It* (where the harness fits) → reveal. Insight before name.
- [ ] **Code in three languages per approach**: `pseudo`, `python`, `java`, `cpp`, line-for-line
      (the highlight follows one `line` index). The practice-set page shows the same code.
- [ ] **Predict** at the learning moment (once per direction), **quiz** on every act, **hints**
      nudge → concept → line.
- [ ] **Animation** from existing panel kinds where possible; a new kind only if the row says so,
      and then it is added to `engine/types.ts`, `panels.tsx`, `AUTHORING.md` in the same PR.
- [ ] **Recap** table with a *built from* column; links to the pattern page and the next journey.
- [ ] Practice-set `Problem` entry aligned: same id, hints that do not spoil act 0, `alternatives`
      = the journey's approaches (B1 renders the walkthrough from the engine).
- [ ] `npm run check` 0, `npm run test:ui` 0 (add the journey's slug to the route list — it is
      derived from `JOURNEYS`, so this is automatic), browser-verified deep links for every act,
      `FEATURES.md` §4.8 row, `WORKLOG.md` entry.

## Sources on disk (`../python-data-structures/docs/pdf/`)

| Book / file | Use it for | Where it maps |
|---|---|---|
| Khamies, *How to Solve Algorithm Problems* (2023) | the reading discipline (§3.1: understand · formalize · reread · bring inputs · brute · analyse · optimise · analyse); 2Sum §3.2.1, 3Sum §3.2.2, KSum §3.2.3; Two Pointers §5.1, BFS §5.2, DFS §5.3; linked-list cycle §6.1, nth-from-end §6.2, swap pairs §6.3, validate BST §6.4, same tree §6.5, symmetric tree §6.6 | story acts, `edgeCases.think`, recap prose |
| Xu & Gunawardane, *Coding Interview Patterns* (2024) | one chapter per pattern: two pointers, hash maps & sets, linked lists, fast & slow pointers, sliding windows, binary search, stacks, heaps, intervals, prefix sums, trees, tries, graphs, backtracking, DP, greedy, sort & search, bit manipulation | the act arc per pattern (brute → the pattern), the pattern pages (B11) |
| *TOP 50 DSA* | cross-check the problem list; candidates not yet in the app | new `Problem` entries |
| *LeetCode Q&A Python* | reference solutions to compare against, never to copy | `python` code tabs |
| *126+ SQL questions*, *Top Advanced SQL Interview Questions*, *sql_interview questions*, *sen_sql* | the SQL drills track (today 8 drills in `data/sql.ts`) | new drills, an "explain the plan" step player |
| *Statistics Flashcards* | the Data-science track | `data/flashcards.ts` |
| *hand written* | the user's own notes — read before authoring a pattern | story acts |

Page numbers for Xu & Gunawardane are not yet confirmed (book not opened this session); confirm
when authoring the first journey that cites it.

## The order, and why

Ordered by **how much of the stage already exists**: chips, sorted chips, sum equation, k-term
equation + found list (`terms`), hash map, bit rows, bars (visualizer) and the code challenge
harness are built. A row that needs a new panel
kind says so; those come after the rows that do not, so each new kind arrives with a problem that
proves it.

Legend: ✓ done · ▶ next · ☐ queued. *Code* column = languages present on the practice-set page
today (the journey acts carry all four when the journey ships).

### Wave 1 — arrays, two pointers, windows (existing panel kinds)

| # | Problem (id) | Pattern | Diff. | Approaches (worst → best) | Code today | Panel kinds | Book | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Two Sum (`pair-sum` → journey `two-sum`) | arrays & hashing | easy | brute · sort + two pointers · two-pass hash · one-pass hash | py · java · cpp | chips, sorted, sum, hash | Khamies §3.2.1 | ✓ |
| 2 | Single Number (`single-number`) | arrays & hashing | easy | brute · hash counts · sort & scan · XOR | py · java · cpp | chips, hash, sorted, bits | Xu ch. bit manipulation | ✓ |
| 3 | Triplets Summing to Zero (`three-sum-zero` → journey `three-sum`) | two pointers | medium | brute O(n³) · anchor + hash · anchor + two pointers (skip duplicates) | py · java · cpp | chips, sorted, **terms** (new: k-term equation + found list) | Khamies §3.2.2 | ✓ |
| 4 | Pair Sum in Sorted Array (`sorted-pair-sum` → journey `sorted-pair-sum`) | two pointers | easy | brute · hash · two pointers (sorted input, no sort) | py · java · cpp | chips, sum, hash | Khamies §5.1 | ✓ |
| 5 | Widest Container (`container-water` → journey `container-water`) | two pointers | medium | brute · two pointers moving the shorter wall | py · java · cpp | **bars** (new kind: columns + water filled to the shorter wall) | Xu two pointers | ✓ |
| 6 | Single Buy/Sell Profit (`best-trade`) | sliding window | easy | brute · running minimum | py | bars (exists now) + a running-min line | Xu sliding windows | ▶ |
| 7 | Longest Substring Without Repeats (`longest-unique-substring`) | sliding window | medium | brute · window + set · last-seen jump | py | **window** (span over chips) + hash | Xu sliding windows | ☐ |
| 8 | Smallest Covering Window (`min-cover-substring`) | sliding window | hard | brute · window + need counts | py | window + hash (`fmt: times`) | Xu sliding windows | ☐ |
| 9 | Longest Consecutive Sequence (`longest-consecutive-run`) | arrays & hashing | medium | sort · hash set, start only at run heads | py | sorted, hash | Xu hash maps & sets | ☐ |

### Wave 2 — stack, binary search, heaps (one new kind each)

| # | Problem (id) | Pattern | Diff. | Approaches | Code today | Panel kinds | Book | Status |
|---|---|---|---|---|---|---|---|---|
| 10 | Balanced Brackets (`balanced-brackets`) | stack | easy | repeated replace · stack | py | **stack** (vertical chips) | Xu stacks | ☐ |
| 11 | Days Until Warmer (`daily-warmer`) | stack | medium | brute · backward scan · monotonic stack | py | bars + stack | Xu stacks | ☐ |
| 12 | Largest Rectangle in Histogram (`largest-rectangle`) | stack | hard | brute · divide & conquer · monotonic stack | py | bars + stack + shaded rectangle | Xu stacks | ☐ |
| 13 | Find a Target in Sorted Array (`classic-binary-search`) | binary search | easy | linear · recursive · iterative halving | py | chips with lo/mid/hi (visualizer has it) | Khamies §2.2.1 | ☐ |
| 14 | Minimum in Rotated Sorted Array (`rotated-minimum`) | binary search | medium | linear · find the drop · binary search on the rotation | py | chips lo/mid/hi | Xu binary search | ☐ |
| 15 | Slowest Sufficient Eating Speed (`koko-bananas`) | binary search | medium | try every speed · binary search on the answer | py | bars + a speed dial | Xu binary search | ☐ |
| 16 | Kth Largest in a Stream (`kth-largest-stream`) | heaps | easy | sort per add · bisect insert · min-heap of k | py | **heap** (tree of chips, sift animation) | Xu heaps | ☐ |
| 17 | K Closest Points to Origin (`k-closest-points`) | heaps | medium | sort all · quickselect · max-heap of k | py | heap + a scatter of points | Xu heaps | ☐ |
| 18 | Top K Frequent Elements (`top-k-frequent`) | arrays & hashing | medium | sort by count · heap · bucket sort by count | py | hash (`times`) + heap + buckets | Xu heaps | ☐ |
| 19 | Task Scheduling With Cooldown (`task-cooldown`) | heaps | medium | simulate with heap + cooldown queue · math formula | py | heap + timeline strip | Xu heaps / greedy | ☐ |

### Wave 3 — linked lists, trees, graphs, DP (structural kinds)

| # | Problem (id) | Pattern | Diff. | Approaches | Code today | Panel kinds | Book | Status |
|---|---|---|---|---|---|---|---|---|
| 20 | Reverse a Linked List (`reverse-list`) | linked list | easy | copy to array · recursive · three pointers | py | **list** (nodes + arrows that flip) | Xu linked lists | ☐ |
| 21 | Detect a Cycle (`cycle-detect`) | linked list | easy | visited set · fast & slow pointers | py | list (loop drawn) | Khamies §6.1, Xu fast & slow | ☐ |
| 22 | Merge Two Sorted Lists (`merge-two-sorted`) | linked list | easy | collect & sort · recursive · two-pointer splice | py | list × 2 | Xu linked lists | ☐ |
| 23 | Maximum Depth of Binary Tree (`max-depth`) | trees | easy | iterative BFS · iterative DFS · recursive | py | **tree** | Xu trees | ☐ |
| 24 | Validate a BST (`validate-bst`) | trees | medium | in-order traversal · bounds recursion | py | tree + bounds label | Khamies §6.4 | ☐ |
| 25 | Level Order Traversal (`level-order`) | trees | medium | DFS with depth · BFS by level | py | tree + queue strip | Khamies §5.2 | ☐ |
| 26 | Count the Islands (`island-count`) | graphs | medium | BFS flood fill · union-find · DFS flood fill | py | **grid** | Khamies §5.3 | ☐ |
| 27 | Rotting Spread (`rotting-fruit`) | graphs | medium | simulate whole grid · multi-source BFS | py | grid + queue | Xu graphs | ☐ |
| 28 | Course Ordering (`course-order`) | graphs | medium | DFS post-order · Kahn's BFS | py | graph (visualizer has it) + queue | Xu graphs | ☐ |
| 29 | Ways to Climb Stairs (`stair-ways`) | dp | easy | naive recursion · memo · rolling two variables | py | **dp strip** (1-D table) + call tree | Xu DP | ☐ |
| 30 | Non-Adjacent Maximum Take (`house-robber`) | dp | medium | recursion + memo · full table · two variables | py | dp strip | Xu DP | ☐ |
| 31 | Fewest Coins for Amount (`coin-change-min`) | dp | medium | greedy (broken) · BFS over amounts · bottom-up table | py | dp strip + BFS layers | Xu DP | ☐ |

### SQL track (drills, not journeys — separate DoD)

| # | Item | Source | Status |
|---|---|---|---|
| S1 | Regroup the 8 existing drills by concept (joins · aggregation · window functions · CTEs · gaps & islands) | `data/sql.ts` | ☐ |
| S2 | 12 new drills from *126+ SQL questions*: one per concept, worst → best rewrite (subquery → join → window) | PDF | ☐ |
| S3 | "Explain the plan" step player: the query's row set after each clause (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY) — the SQL analogue of the stage | new `PanelModel` kind `table` | ☐ |
| S4 | Advanced set from *Top Advanced SQL* (recursive CTEs, LAG/LEAD, percentiles) | PDF | ☐ |

## Cross-cutting item — code in three languages on the practice set

Shipped 2026-09-04 (`feat/practice-code-tabs`): `Code {python, java?, cpp?}` on `Problem` and
`Solution`; language strip on the problem page (`SolutionBlock`), pref-shared with the journey's
`codeTab`; `data/problems.test.ts` requires Java + C++ on every approach once the problem has a
journey. Backfilled: Two Sum, Single Number, Triplets Summing to Zero (9 approaches). The rest
land with their problem's PR, in pipeline order.

## P1 — the reference card (requested 2026-09-05)

**The ask, in the learner's words:** the problem page should read the way a problem page reads on
LeetCode — statement, then constraints, then hints — and then show **the solutions**: the naive one
first, then each better one, in Python 3 (Java and C++ where they add something), with the reasoning
for *why* you would move from one to the next. **No editor here.** The learner writes and submits
code on LeetCode; this app is for understanding, revisiting and drilling the reasoning.

### What this changes

| Today | After |
|---|---|
| Statement, three hints, walkthrough, "Approach & Solution" tabs (optimal + alternatives) | Statement, **constraints**, examples, hints, then an **approach ladder** — worst to best, each with the weakness that forces the next |
| Code shown per tab, no argument between them | Every rung answers: what it costs, what breaks it, what the next rung fixes |
| A journeyed problem also embeds the engine stage | Unchanged — the stage stays; the ladder sits under it |
| No editor (never had one) | Still none, deliberately. A **"solve on LeetCode ↗"** button is the call to action |

### The shape of one rung

```
name            "Brute force" · "Sort + two pointers" · "One-pass hash"
cost            time · space, and the n where it stops being fine
idea            two or three sentences, plain words
why now         the weakness in the PREVIOUS rung that this one removes
code            Python 3 (always) · Java · C++ (where the language changes the shape)
watch out       the corner case that breaks a first draft of THIS approach
```

The ladder is the same content the journey already owns (`Act.insight`, `Act.idea`, `Act.code`,
`edgeCases`), so for a journeyed problem it should be **generated from the journey**, not written
twice — the B1 rule. For the other 28, it is authored in `data/problems/*.ts`.

### Constraints: a new field

`Problem` gains `constraints: string[]` (`1 <= nums.length <= 10^4`, `-10^9 <= nums[i] <= 10^9`,
"exactly one valid answer exists"). They are what turn a corner case from trivia into a decision, so
the corner-case list should cite the constraint it comes from.

### Sourcing, and the line we do not cross

The request mentioned scraping LeetCode, GeeksforGeeks, Stack Overflow and similar.

- **We do not copy problem statements, editorials or explanations from those sites.** They are
  copyrighted. Every statement in this repo is an original write-up of a classic, public-knowledge
  problem, and that continues.
- **What we do instead:** state the problem in our own words, link out to the original
  (`resources` already does this), and write our own explanations. Standard algorithms and their
  textbook implementations are public knowledge; a site's particular prose is not.
- **Research sources** for the reasoning: the books already on disk (`Sources on disk` above), plus
  the language's own documentation. Where a specific site's framing genuinely shaped a rung, cite it
  by link rather than reproducing it.

If the intent is a personal offline copy of LeetCode's own text, that is a different thing from this
repo and should stay out of it.

### Definition of done — shipped 2026-09-05 (PRs #32, #33, #34)

- [x] `constraints: string[]` on `Problem`, rendered under the statement; corner cases cite one
      (`EdgeCase.constraint`).
- [x] `Rung` in `src/lib/ladder.ts`; the ladder rendered worst → best with the "why now" line
      between rungs.
- [x] Journeyed problems generate their ladder from the journey's acts (no second copy).
- [x] Python 3 on every rung; Java and C++ where they differ structurally.
- [x] "Solve on LeetCode ↗" as the page's primary action, from `Problem.leetcode`; no editor added.
- [x] Ladder respects the ledger the way the walkthrough does: a started, unfinished journey shows
      only rungs already earned, with a link back.
- [x] `npm run check` (46) + `npm run test:ui` (39), a FEATURES row, and content tests: every rung
      has a cost, Python, an idea, and a "why now" (except the first); every LeetCode slug is unique.

### The open question, answered

Does the ladder belong on the problem page or as a fifth tab? **Neither, in the end**: it replaced
"Approach & Solution" (backlog Q1, option a), so the tab strip is Hints / Walkthrough / Approaches
and the page did not grow a fourth place to look for the same code.

## Open questions

Moved to [`BACKLOG.md`](BACKLOG.md) §Open questions so there is one list, not three. The ones that
touch this file are **Q1** (does the approach ladder replace the "Approach & Solution" tab),
**Q2** (does Python get a sidebar section) and **Q3** (do corner cases become a shared library).

One is answered: *does a journeyed problem still need its own walkthrough?* **No** — B1 shipped on
2026-09-05, the page renders the engine's frames, and a test fails if a problem has both.
