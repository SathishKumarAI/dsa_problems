// missing-number — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung chases is *stop re-deriving what the constraints already handed you* — and
this problem is where that principle splits into two genuinely different families. Sorting, the flag
table and the in-place placement all belong to the first family: they **find** the hole by imposing
structure until the absence becomes visible. Sorting pays n log n for an ordering the answer never
reads; the flag table drops the ordering and indexes straight into a row of n+1 pigeonholes, which is
linear but allocates a second array; the in-place rung notices that this second row is nearly the
input itself — the values 0..n are already legal indexes — and collapses the two into one by sending
each value home, buying constant space at the cost of permuting the caller's array irreversibly. That
collapse is the same move that solves \`find-all-duplicates\` and \`first-missing-positive\`, and it is
worth practising for its own sake. But here it is a trap, because the second family exists: since the
values are **distinct** and exactly one is gone, the array is a complete set with a single hole, and
any invariant of the complete set will name the hole without searching for it at all. Sum does it —
n(n+1)/2 minus what you actually have — and XOR does it better, because the sum builds a number around
n²/2 that a 32-bit accumulator cannot hold while XOR never exceeds n and cancels every paired value by
its own algebra. So the ladder ends by *not* mutating anything: the last two rungs are constant space,
single pass, and leave the input exactly as they found it, which strictly dominates the clever
in-place trick two rungs below. That is the lesson to carry beyond this problem. The instinct to turn
the array into its own lookup table is right and it is powerful, but it is a means, not a goal, and it
always costs the caller's data — so before you spend that, ask whether the constraints have handed you
something cheaper. Here they had: a promise of distinctness, which turns a search into a subtraction.

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
      "Sort and scan",
      "O(n log n)",
      "O(n)",
      "Buys a visible gap with ordering work the answer never reads",
      "The input is already sorted, or the values are not integers in a known range"
    ],
    [
      "Table of flags",
      "O(n)",
      "O(n)",
      "Linear time for a second array; input untouched",
      "Allocation is fine, and especially when *several* numbers may be missing"
    ],
    [
      "Place at own index",
      "O(n)",
      "O(1)",
      "Constant space bought by permuting the caller's array irreversibly",
      "You need constant space and no arithmetic invariant exists — practice for `first-missing-positive`"
    ],
    [
      "Subtract from the total",
      "O(n)",
      "O(1)",
      "Shortest code, no mutation — but the intermediate sum can overflow a 32-bit int",
      "You want the two-line answer, in a language where the total cannot overflow"
    ],
    [
      "XOR indices against values",
      "O(n)",
      "O(1)",
      "Same as the sum with no overflow, at the cost of one non-obvious identity",
      "The follow-up as asked: linear, constant space, input intact, any n"
    ]
  ]
}
