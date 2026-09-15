// product-except-self — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The banned operation is the whole teaching device: division is the obvious way to remove one factor
from a product, and taking it away forces you to look for the *structure* of the problem instead of
reaching for the shortcut. Brute force sees \`n\` unrelated questions and answers each with a full pass,
which is not only quadratic but blind — it never notices that the answer for position 5 and the answer
for position 6 differ by exactly two factors. The first instinct on noticing the shared work is to
compute the shared thing once: one grand total, then remove one factor per position, which is
genuinely linear and genuinely the right instinct, right up until a zero appears and the inverse
operation you were relying on stops existing — at which point the approach needs a three-branch
zero-counting patch and the elegance is gone. What the zero exposes is that "remove a factor" was
never the right frame. The right frame is *never put the factor in*: everything except position \`i\` is
everything to its left times everything to its right, two completely independent questions, each of
which is a running product that a single sweep computes for every position at once. Build both as
arrays and the problem is solved in linear time with no division anywhere — and then you notice that
each of those arrays is written once and read exactly once, which is the signature of storage that
does not need to exist. The output array is already being allocated, so let it carry the prefix
products on the way out, and let one scalar carry the suffix product on the way back, folding into
each slot as it passes. What is left is two passes, one extra integer, and a zero that behaves like
any other number because nothing is ever undone — only accumulated. The corner case to rehearse out
loud is exactly the one the division shortcut could not survive, and the pattern worth carrying away
is prefix-forward-then-fold-suffix-backward, which shows up far more often than this one problem.

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
      "`O(n²)`",
      "`O(1)`",
      "No reuse at all — every answer recomputes factors its neighbours already computed",
      "`n` is tiny; as the test-suite oracle"
    ],
    [
      "Divide the total",
      "`O(n)`",
      "`O(1)`",
      "Linear and short, but needs an inverse that fails at zero and a three-branch patch to be correct",
      "Division is allowed and zeros are impossible by construction"
    ],
    [
      "Two prefix arrays",
      "`O(n)`",
      "`O(n)`",
      "Buys total clarity with `2n` numbers that are each read exactly once",
      "Readability matters more than memory; as the step before compressing it"
    ],
    [
      "**Prefix + folded suffix**",
      "**`O(n)`**",
      "**`O(1)`** extra",
      "**Reuses the output as scratch space; the order of write-then-fold is the whole correctness argument**",
      "**The default answer for this problem**"
    ]
  ]
}
