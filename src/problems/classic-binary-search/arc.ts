// classic-binary-search — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/classic-binary-search_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung chases is **spend each comparison on as many candidates as it can possibly
eliminate**, and the whole ladder is the consequence of noticing that a sorted array lets one
comparison speak for half the elements you have not read. The linear scan declines that offer: it
asks "is this the one?" \`n\` times and each answer is worth exactly one element, which is why it is
\`O(n)\` on an input that is handing you \`O(log n)\` for free. Halving accepts the offer, and because
"now do the same on what is left" is literally the same problem on a shorter range, recursion is the
first natural spelling — correct, clear, and paying \`log n\` stack frames for two integers it could
have carried itself. Removing the recursion is pure profit and leaves the version worth memorising:
two bookmarks, \`while lo <= hi\`, probe the middle, move one bookmark *past* it. But the iterative
version quietly contains the decision that the rest of this pattern turns on — **what the range means
and when the loop is allowed to stop** — and there are two coherent answers, not one. The inclusive
contract treats the range as a set of live candidates, ends when that set is empty, and reports
success by returning from inside; it is perfect when the question is "is this exact value present".
The converging contract treats the range as a bracket around a boundary, ends when one index
survives, and asks its question once at the end; it is the only one of the two that can express
"the first index where some property starts holding", because that property may be invisible at any
single probe. The last rung here does nothing useful for *this* problem — Approach 3 beats it — but
it reveals that the buggy version of itself, the one that forgets the final equality check, is a
correct solution to a different and more general question: *where would this value go?* That is not a
coincidence and it is not a bug you should just patch. It is the next problem, and the two after it,
and the reason this easy problem is worth a long document: get the contract right here, in five
elements you can trace by hand, and the medium ones stop being about off-by-ones and start being
about what you are searching **for**.

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
      "Read every ticket",
      "`O(n)`",
      "`O(1)`",
      "Declines the sortedness entirely; one comparison buys one element",
      "It is the oracle in your test harness, or `n` is a handful"
    ],
    [
      "Recursive halving",
      "`O(log n)`",
      "`O(log n)` stack",
      "Cleanest expression of \"same problem, smaller range\", paid for in frames",
      "The subproblem is not a contiguous index range — trees, not arrays"
    ],
    [
      "**Iterative, inclusive `[lo, hi]`**",
      "**`O(log n)`**",
      "**`O(1)`**",
      "**Two integers carry everything; early `return` on a hit**",
      "**The default. The question is \"is this exact value here, and where\"**"
    ],
    [
      "Converging, one survivor",
      "`O(log n)`",
      "`O(1)`",
      "No early exit — always `⌈log₂n⌉` probes — but expresses boundaries, which the inclusive form cannot",
      "The question is \"where is the boundary\": the rest of this pattern"
    ]
  ]
}
