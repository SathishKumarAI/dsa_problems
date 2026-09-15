// sorted-squares — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/sorted-squares_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step of this problem chases is *find out what the transformation left behind
before paying to rebuild it*. Squaring a sorted array looks like it destroys the ordering, and the
first approach takes that at face value: square everything, sort from scratch, pay n log n. But
squaring does not scramble the array — it folds it. The negatives reverse, the non-negatives carry
on unchanged, and what comes out the other side is not a random permutation but a *valley*: two
sorted runs meeting at zero. Say that out loud and the second approach writes itself, because
merging two sorted runs is the most standard linear operation there is, and the log factor was only
ever the price of not having looked. The third approach is what happens when you ask one more
question of the same structure — not "how do I merge the two runs?" but "where can I stand so the
two runs are already separated for me?" The answer is the two ends, and it comes with a
constraint attached: the ends are the extremes of magnitude, so they hand you the *largest*
remaining square for free and can say nothing whatsoever about the smallest, which is hiding near
zero somewhere in the middle. That single asymmetry decides the entire shape of the code — you must
emit largest-first, which means filling the output from the back, which in turn eliminates the split
scan and both drain loops because the two pointers now start at opposite ends and converge rather
than starting adjacent and diverging. The general lesson is worth more than the trick, and it
generalises in two directions at once. First: when a transformation appears to break sortedness,
characterise exactly *how* it breaks it, because a merge of sorted runs is linear while a fresh sort
is not, and the difference between the two is one sentence of analysis. Second: filling an output
backwards, from the end you can compute confidently, is a technique in its own right — it is what
makes \`merge-sorted-array\` work in place, where the spare room happens to sit at the end and writing
forwards would clobber values still waiting to be read.

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
      "Square, then sort",
      "O(n log n)",
      "O(n)",
      "One line, obviously correct, and the only version that does not depend on the input actually being sorted — but pays a log factor to rediscover structure it already had",
      "n is small, the input's sortedness is not guaranteed, or you need a trustworthy oracle to cross-check a faster version against"
    ],
    [
      "Split at zero, merge two runs",
      "O(n)",
      "O(n)",
      "Makes the \"two sorted runs\" insight explicit in the code, at the cost of a split scan and two drain loops that are easy to forget",
      "You want the reasoning visible, or the merge has to be reused somewhere less symmetric"
    ],
    [
      "Two pointers from the ends, filling backwards",
      "O(n)",
      "O(n) for the output",
      "Shortest and fastest: no scan, no drains, exactly n steps — but requires seeing why the fill must run backwards",
      "The default answer, and the one whose backwards-fill technique transfers to `merge-sorted-array`"
    ]
  ]
}
