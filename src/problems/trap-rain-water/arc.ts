// trap-rain-water — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/trap-rain-water_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle this problem chases is *find the one number that decides the answer, then find the
cheapest way to know it*. The first move is not an optimisation at all but a reframing: stop trying
to identify pools, with their walls and floors and nested shapes, and ask instead what a single
column holds — which is \`min(tallest to the left, tallest to the right) − its own height\`, never
negative. Write that down and the entire ladder is forced. Compute the two maxima honestly for every
column and you have the brute force, quadratic because each column repeats almost exactly the scans
its neighbour just finished. Notice that "tallest so far" is a *running* quantity — each value is one
comparison away from the previous one — and the repeated scanning collapses into two linear passes
that fill a prefix-maxima array and a suffix-maxima array, giving linear time at the cost of 2n
integers and three traversals. Then look again at the formula and notice what it actually asks for:
not both maxima, but the **smaller** of them. That is the whole of the final step. You do not need to
know the exact height of the taller side, only that it is taller — and the two end pointers hand you
that fact for free, because whichever pointer stands on the shorter bar is looking across at proof
that a taller wall exists on the far side, which means its own running maximum is the binding
constraint and its column can be settled on the spot. So the two arrays shrink to two variables and
the three passes to one. That last argument — *the shorter wall is the one that decides, and the
shorter wall is therefore the one you can safely advance* — is what makes the final version correct
rather than merely shorter, and it is the same greedy shape as container-with-most-water wearing
different clothes: identify which endpoint is the bottleneck, prove that advancing it discards
nothing you need, and sweep. Keep the prefix/suffix rung even so. It is easier to derive when the
pressure is on, it needs no cleverness to justify, and it is the one that survives the jump to the
two-dimensional version of this problem, where the boundary is a ring rather than two ends and the
tool becomes a priority queue.

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
      "Brute force per column",
      "O(n²)",
      "O(1)",
      "Transcribes the column formula exactly; recomputes both maxima n times",
      "Explaining the formula, and as the oracle a fast version is stress-tested against"
    ],
    [
      "Prefix and suffix maxima",
      "O(n)",
      "O(n)",
      "Buys linear time with 2n integers; needs no correctness argument beyond \"running maximum\"",
      "Linear time is required but space is not constrained; the version to derive under pressure; the one that extends to the 2-D grid variant"
    ],
    [
      "Two converging pointers",
      "O(n)",
      "O(1)",
      "Keeps only the smaller horizon, and proves the larger one is irrelevant — fastest and smallest, but must be justified",
      "Constant space is required; the expected final answer in an interview"
    ]
  ]
}
