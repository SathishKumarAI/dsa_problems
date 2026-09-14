// largest-rectangle — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/largest-rectangle_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step here chases is *name the unknown so that it becomes a question you already
know how to answer*. Stated as given, the problem is a search over pairs of edges, and there are
quadratically many pairs — but a rectangle under a histogram is capped by the **shortest bar it
spans**, so every maximal rectangle has its height equal to some bar exactly. Fix each bar as the
height and the two-dimensional search collapses into \`n\` one-dimensional ones: how far does this bar
extend before something shorter stops it? That is a next-smaller-element question asked on both
sides, and the moment it has that name the ladder is forced. Answer it by walking outward from every
bar and you have the brute force — correct, quadratic, and wasteful in a precise way, since the
neighbours bar 4 crosses are the neighbours bar 3 has just crossed. Try to settle many bars at once
and you get divide & conquer: the shortest bar in a range caps every rectangle that spans it, so one
glance settles all of those, and the two sides recurse — elegant, \`O(n log n)\` when the minimum lands
mid-array, and quietly \`O(n²)\` on sorted input, which is exactly the input the constraints invite.
The fix is to stop searching for boundaries and let them announce themselves: sweep once, keeping on
a stack the bars whose rectangles are unfinished, in non-decreasing height order, and when a shorter
bar arrives it *is* the right boundary of everything it undercuts, while the bar left beneath each
popped one *is* its left boundary. Both next-smaller questions are answered by the same pop, from
opposite sides, and the width falls out of two indices with no second pass. The inner \`while\` makes
the page look quadratic and is not, for the reason that carries this entire pattern: each index enters
the stack once and leaves once, so the total pop count is bounded by \`n\` no matter how lumpily the
pops distribute — an expensive iteration is paid for by the cheap ones that filled the stack. What
remains is the detail that most implementations get wrong, and it follows straight from the
mechanism: a bar is measured only when something shorter arrives, so whatever is still on the stack
when the input ends was never measured at all. Append a zero-height sentinel — legal only because
heights are non-negative — and the stack drains, every leftover priced on the way out. That is the
difference between this problem and \`daily-warmer\`, where the leftovers already hold their correct
answer of \`0\` and need no flush; and once both are in hand, the family is yours — next greater, next
smaller, previous greater, stock span, and maximal rectangle in a matrix, which is this routine run
once per row.

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
      "Brute force spread",
      "`O(n²)`",
      "`O(1)`",
      "Transcribes \"fix a bar as the height\" literally; every bar re-walks its neighbour's ground",
      "Making the reframing concrete, and as the oracle the fast versions are stress-tested against"
    ],
    [
      "Divide & conquer",
      "`O(n log n)` avg, `O(n²)` worst",
      "`O(log n)` avg, `O(n)` worst",
      "One glance at the minimum settles every spanning rectangle, but the recursion's shape is at the data's mercy",
      "Teaching the \"split at the extreme\" move; genuinely `O(n)` only if paired with an `O(1)` range-minimum structure"
    ],
    [
      "Monotonic stack",
      "`O(n)`",
      "`O(n)`",
      "Both boundaries fall out of one pop, at the cost of `O(n)` storage and a sentinel you must not forget",
      "Always — and as the inner loop of maximal-rectangle-in-a-matrix"
    ]
  ]
}
