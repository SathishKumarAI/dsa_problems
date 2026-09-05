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
| 4 | Pair Sum in Sorted Array (`sorted-pair-sum`) | two pointers | easy | brute · hash · two pointers (sorted input, no sort) | py | chips, sum | Khamies §5.1 | ▶ |
| 5 | Widest Container (`container-water`) | two pointers | medium | brute · two pointers moving the shorter wall | py | **bars** (port `BarsView` into a panel kind, with a shaded area) | Xu two pointers | ☐ |
| 6 | Single Buy/Sell Profit (`best-trade`) | sliding window | easy | brute · running minimum | py | bars + a running-min line | Xu sliding windows | ☐ |
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

## Open questions (discuss before wave 2)

1. **A "Python" sidebar section.** Requested; there is no Python-only content yet. Options: (a) the
   language tab is a preference, not a section — keep DSA / SQL / Data science; (b) a *Python*
   section holding language drills (comprehensions, generators, `collections`, `heapq`, `bisect`)
   authored as flashcards + a step player. Leaning (a) now, (b) once the DSA wave 1 is done.
2. **Journeys vs. practice-set pages.** When a journey exists, does the practice-set page still
   need its own walkthrough? Proposal: no — B1 renders the engine's frames there, and the page
   becomes the *reference card* (statement, corner cases, code in three languages).
3. **Which corner cases are universal?** "smallest legal input", "promise broken" recur. Should
   `edgeCases` allow a shared library with per-journey overrides? Not until three journeys repeat
   the same prose verbatim.
