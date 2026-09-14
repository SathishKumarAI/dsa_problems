// merge-two-sorted — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/merge-two-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every step of this ladder chases one principle: **when both inputs are already sorted, the next element
of the answer is always one of the two front nodes — so the only question is how expensively you find
it and where you put it.** The collect-and-sort version answers by not asking: it pours both lists into
one bucket and runs a general-purpose sort, spending \`log(n+m)\` comparisons per element to reconstruct
an order it was handed intact, and allocating a fresh node per value in violation of the splice
requirement — its weakness is that it discards the single most valuable fact about the input. Recursion
is the first rung to use that fact: compare the two fronts, and the smaller is provably the head of the
answer, because everything behind it is larger and everything in the other list is at least as large as
that list's front, so a purely local comparison makes a globally correct choice and the rest of the
answer is the same problem on a shorter pair. That collapses \`n log n\` to \`n\` and reuses the original
nodes. But recursion keeps one stack frame alive per node just to remember where to attach the next
winner — \`O(n+m)\` memory spent on a single piece of information, the current end of the result. The
last step names that information and stores it in a variable, \`tail\`; once the end of the result is a
pointer you can hold, the recursion flattens into a loop. The dummy head then removes the only
remaining wrinkle, the "is this the first node?" branch, by guaranteeing there is always an end to
attach to; and the same sortedness that justified the local comparison pays off once more at the end,
where the surviving list is attached whole in a single assignment instead of being walked. The
progression is one fact — *sorted inputs make the front nodes sufficient* — trusted further at each
rung: first ignored, then used for the comparison, then used again to make the remainder free.

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
      "Collect and sort",
      "`O((n+m) log(n+m))`",
      "`O(n+m)`",
      "Ignores sortedness for a general tool; allocates new nodes",
      "The inputs are not actually sorted, or you are merging on a key the list order does not reflect"
    ],
    [
      "Recursive",
      "`O(n+m)`",
      "`O(n+m)` stack",
      "Optimal comparisons and splices in place, but one frame per node",
      "Lists are provably short (they are here, at 50 each) and you want the clearest possible code"
    ],
    [
      "**Dummy head + tail**",
      "**`O(n+m)`**",
      "**`O(1)`**",
      "**The dummy costs one throwaway node and removes every special case**",
      "**Always, for this problem — and as the subroutine inside merge-sort and merge-k-lists**"
    ]
  ]
}
