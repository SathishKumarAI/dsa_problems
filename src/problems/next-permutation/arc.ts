// next-permutation — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/next-permutation_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The whole ladder is chasing one principle: **the successor must be minimal twice over — minimal in
where it changes, and minimal in everything after that change — and both minimalities can be read
straight off the array instead of searched for.** Enumeration knows nothing and pays n! to find out,
which is the honest price of treating "the next arrangement" as a lookup in a list you have to build.
The first real idea is that almost none of those arrangements were ever candidates: a successor is
one swap plus a tightened tail, so n²/2 candidates suffice, and the candidate table is worth staring
at because the rule for the next rung is *visible in its failures* — every candidate that first
changed something inside the descending stretch \`[5, 4, 2]\` came out smaller than the input, because a
descending run is already the largest arrangement of its values and nothing in it can grow. Name that,
and the search collapses to a single scan: the pivot is the rightmost place where the array stops
descending, the only position that can change. Its replacement follows immediately — the smallest
tail value that still exceeds it, because growing by more than you must is by definition not the
*next* arrangement. And then the last question, what happens to the tail, is where the remaining cost
lives: the tail must become the smallest arrangement of what it holds, which sounds like a sort and
costs \`O(n log n)\` if you treat it as one, but the tail was descending before the swap and the swap
preserved that — it put a smaller value exactly where a larger one had been — so "make it smallest"
is a reversal, not a sort, and that single observation is where linear time comes from. Copying the
tail out backwards achieves the same order but rents an array to do it, and the final step notices
that the source and destination are the same memory, so two indices walking toward each other finish
the job in place. The reward for getting there honestly is that the ugliest case stops being a case at
all: a fully descending input has no pivot, so the tail is the entire array, so the reversal you
already wrote wraps it to sorted order — and the correct implementation is the one with *fewer*
branches than the buggy one.

---`

export const comparison: Comparison = {
  "head": [
    "Approach",
    "Time",
    "Space",
    "Core trade-off",
    "Best used when"
  ],
  "rows": [
    [
      "List every arrangement in order",
      "`O(n! · n log(n!))`",
      "`O(n! · n)`",
      "Assumes nothing, so it must build everything",
      "n under ~8, as the oracle that defines \"correct\"; when you genuinely need the k-th arrangement"
    ],
    [
      "Try every swap, then sort the tail",
      "`O(n³ log n)`",
      "`O(n)`",
      "Searches the right candidate set without knowing which candidate wins",
      "Cross-checking at sizes the enumeration cannot reach; *discovering* the greedy rule from data"
    ],
    [
      "Find the pivot, then sort the tail",
      "`O(n log n)`",
      "`O(n)`",
      "Knows where to change but re-derives an order it already had",
      "Clarity under pressure, where the memory bound is not being graded"
    ],
    [
      "Pivot, swap, rebuild the tail backwards",
      "`O(n)`",
      "`O(n)`",
      "Linear time, but rents an array to achieve it",
      "The result must land in a new array anyway, so the copy is the output"
    ],
    [
      "**Pivot, swap, reverse the tail in place**",
      "**`O(n)`**",
      "**`O(1)`**",
      "**Nothing left to trade: every fact it needs was already an invariant**",
      "**The default. What `std::next_permutation` does**"
    ]
  ]
}
