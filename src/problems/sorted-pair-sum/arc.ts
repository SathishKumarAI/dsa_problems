// sorted-pair-sum — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The single principle this problem chases is *stop re-deriving what you already know*. Brute force
knows nothing between outer steps: it asks "does a partner for \`nums[i]\` exist?" by re-reading the
tail from scratch, n times over, which is the quadratic wall. The hash map fixes precisely that by
writing down every value it walks past, so the existence question costs one lookup instead of n —
but look at what it is remembering: a dictionary whose entire job is to tell you *which values are
present*, in an array whose *ordering already tells you that*. Sortedness means the position of an
element is a statement about its magnitude, and the map is paying O(n) memory to store a fact the
input handed over for free. The converging pointers cash that in. Standing at the two extremes,
the sum you can see is simultaneously the largest sum available to the left index and the smallest
available to the right one, so a single comparison against the target *proves* one of the two
endpoints can never be part of an answer, and it is retired forever — no memory required, one pass,
constant space. The payoff is not just a better score on this problem: it is the recognition
template. Sorted sequence plus a quantity that moves monotonically as each end moves means
converging pointers apply and the exchange argument will go through — which is exactly the
precondition that three-sum satisfies after a sort, that container-with-most-water satisfies
without one (its monotonicity comes from geometry, not order), and that every k-sum built on top
of these two inherits.

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
      "Brute force",
      "O(n²)",
      "O(1)",
      "Zero cleverness, zero memory, quadratic time",
      "n is tiny, or you need a trustworthy reference to cross-check a faster solution"
    ],
    [
      "Hash map",
      "O(n)",
      "O(n)",
      "Buys the existence check with memory; ignores ordering entirely",
      "The array is **not** sorted, or you may not reorder it, or the answer needs original indices"
    ],
    [
      "Two converging pointers",
      "O(n)",
      "O(1)",
      "Reads magnitude off position instead of storing it; requires sortedness",
      "The array is sorted and the quantity is monotone in each pointer — the intended answer here"
    ]
  ]
}
