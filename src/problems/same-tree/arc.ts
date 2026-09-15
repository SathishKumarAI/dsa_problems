// same-tree — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/same-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The problem is only hard in one direction: two trees that differ in shape can be identical in every
flattened reading of them, so every solution is really an answer to "where does the structure live?"
Serialising is the instinct — turn an awkward comparison into a trivial one — and it works exactly as
well as its dictation is faithful, which means the empty children must be spoken aloud; omit them and
\`[1,2]\` reads the same as \`[1,null,2]\`, and on a tree of repeated values the reading carries no
information at all. Recording the holes fixes correctness but not the shape of the work: two full
walks and two strings are built before the first disagreement is allowed to matter, which is pure
waste when the roots already differ. Walking the two trees in lockstep removes the intermediate
entirely — the recursion's own structure mirrors the property being tested, so nothing is flattened
and nothing can be lost, and the first mismatch ends it: measured, one comparison against two hundred
and fifty-four on a pair of trees that disagree at the root. The last rung changes nothing about the
algorithm and one thing about the framing: the item travelling through the container is a **pair** of
nodes, and making that explicit is what turns this function into the answer for symmetric-tree, where
the same walk runs with the pairs crossed over.`

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
      "Serialise and compare",
      "`O(n)`, always both whole trees",
      "`O(n)`",
      "One comparison, but the shape has to be encoded by hand",
      "The serialisation is reused — hashing, caching, one-against-many"
    ],
    [
      "Lockstep recursion",
      "`O(n)`, often far less",
      "`O(h)`",
      "Nothing is flattened, so nothing can be lost",
      "Default answer"
    ],
    [
      "Iterative pairs",
      "`O(n)`",
      "`O(h)` / `O(w)`",
      "Same walk, container written by hand",
      "No recursion available; or to make the pair explicit"
    ]
  ]
}
