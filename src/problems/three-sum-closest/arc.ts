// three-sum-closest — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/three-sum-closest_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step here chases is *turn an unordered search into a directed one, then stop as
soon as the direction has nothing left to tell you*. The problem opens as pure enumeration: form every
triple, score it against the target, keep the best — correct, \`O(n³)\`, and utterly memoryless, since
each committee is scored from scratch and nothing learned about one informs the next. Sorting is the
first purchase, and it buys **direction**: with the values in order the innermost sums climb
monotonically, so the first one to reach the target is the last one worth looking at for that pair,
and the two sums bracketing the target become the only candidates — a real constant-factor win,
though a target that sits above everything never trips the break, so the cubic worst case survives.
Noticing that the bracket is what matters, rather than the walk to it, gives the next rung for free:
with the first two values fixed the ideal third is arithmetic, \`target − nums[i] − nums[j]\`, and a
sorted tail can be *searched* rather than walked, so each pair costs \`log n\` instead of \`n\` and the
worst case finally drops to \`O(n² log n)\`. But every one of those searches starts from scratch and
discards everything the previous one learned about where the tail sits relative to the target, which
is the waste the final engine removes: fix only the first value, put a pointer at each end of the
rest, and let the **sign of the miss** choose which end moves — too low and the left hand must come
in because everything left of it is smaller, too high and the right hand must, and either way one
index retires permanently, so an entire inner scan finishes in linear time and the whole thing is
quadratic with three integers of state. The last line is the cheapest and the most characteristic:
distance zero is the global minimum of the objective, so a sum equal to the target can be returned on
the spot, which is provably correct rather than merely usually fine. Two habits are worth carrying
away, and they are the reason this variant punishes pattern-matching so effectively. First, for every
*optimisation* problem — as opposed to every *find-the-exact-thing* problem — ask two questions before
writing a loop: what is the update rule for "best so far", and can an exact answer short-circuit it?
Here the answers are "closest wins, with a pinned tie-break" and "yes, at distance zero", and the whole
solution is those two answers wrapped around a pointer sweep. Second, when a problem looks like one
you know, find the sentence that differs before reusing the code — here it is the stopping rule, and
porting 3Sum's duplicate-skipping loop into it adds machinery that can only introduce bugs, because
this answer is one integer and not a set.

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
      "Every triple",
      "`O(n³)`",
      "`O(1)`",
      "Needs no sort and no argument; scores every committee from scratch",
      "The reference a fast version is stress-tested against, or the input must not be reordered"
    ],
    [
      "Sort, then prune",
      "`O(n log n + n³)` worst case",
      "`O(1)`",
      "Buys a monotone inner loop, so the first sum reaching the target ends it — a constant-factor win, not a class change",
      "Showing where sorting starts paying; never shipped"
    ],
    [
      "Binary search the third",
      "`O(n² log n)`",
      "`O(1)`",
      "Computes the ideal third value and searches for it; restarts the search for every pair",
      "The inner structure is sorted but an outer pointer sweep is unavailable"
    ],
    [
      "Two pointers",
      "`O(n²)`",
      "`O(1)`",
      "One comparison retires one index for good, replacing the `log n` search with a single step",
      "Shipping, when no exact hit is expected"
    ],
    [
      "Two pointers + early exit",
      "`O(n²)` worst, often far less",
      "`O(1)`",
      "Adds one comparison per step to recognise distance `0` and stop",
      "The default answer — the exact-hit case is common and costs nothing to detect"
    ]
  ]
}
