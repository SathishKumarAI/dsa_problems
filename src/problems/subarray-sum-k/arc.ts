// subarray-sum-k — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/subarray-sum-k_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung chases is *stop asking about ranges and start asking about points*. The
brute force takes the question literally: a subarray is a stretch, so it walks each stretch and adds
it up, and the cost of that literalism is n²/2 additions with everything learned on one start thrown
away before the next. The prefix table is the arithmetic that dissolves the range — the sum from \`i\`
to \`j\` is \`P[j] - P[i]\`, so a stretch is no longer a thing you traverse but a *difference between two
readings* — yet on its own it only makes each of the n² pairs cheaper, and the pairs are still all
there. The sliding window is the reflex this shape of question triggers, and it is a genuinely good
technique that this particular problem disqualifies, because a window is an argument about
monotonicity ("too big, therefore shrink") and a negative number destroys the monotonicity; that
failure is worth as much as a success, because it teaches you to check the sign of the inputs before
reaching for two pointers, and it is also the trapdoor back to \`O(1)\` space the moment a problem
promises non-negative values. The breakthrough is to take the prefix identity seriously one step
further: rearranged, \`P[j] - P[i] = k\` says \`P[i] = P[j] - k\`, which is not a statement about a
stretch at all but a *membership question about a number you have already computed* — and membership
questions are what hash maps answer in one step. Counting occurrences rather than storing positions
is the last piece, because several earlier boundaries can carry the same reading and each one is a
separate answer; that is why a single lookup in the worked example contributed two subarrays at once.
What you are left with is one pass, one running integer and a tally book — and a template that
reappears every time a problem asks about contiguous stretches with a fixed sum, a fixed remainder or
a fixed XOR: derive the running quantity, rearrange the condition into "has this value been seen",
and write down the empty prefix before you begin.

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
      "Sum every subarray",
      "`O(n²)`",
      "`O(1)`",
      "Literal, obviously correct, no memory, no reuse",
      "`n` is tiny, or you need a trustworthy oracle to cross-check a fast version against"
    ],
    [
      "Prefix sums, pairwise",
      "`O(n²)`",
      "`O(n)`",
      "Makes each pair cheap but still visits every pair",
      "You need arbitrary range sums answered repeatedly on a fixed array"
    ],
    [
      "Sliding window",
      "`O(n)`",
      "`O(1)`",
      "Constant space, but only sound when the sum is monotone in each edge",
      "**Every value is non-negative** — otherwise it is not slow, it is wrong"
    ],
    [
      "**Prefix sums + counting map**",
      "**`O(n)`**",
      "**`O(n)`**",
      "**Buys the pair search with memory; indifferent to sign**",
      "**The general case, and the intended answer here**"
    ]
  ]
}
