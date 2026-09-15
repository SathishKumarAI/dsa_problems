// tree-diameter — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/tree-diameter_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The problem looks like a search over pairs of nodes and is not, because every path has exactly one
highest node: fix that node and the best path bending there is forced — deepest reach left, plus
deepest reach right — so \`O(n²)\` paths collapse into \`n\` candidate bends, and the rest of the ladder
is bookkeeping. Taking that literally, you measure both depths at every node, which is correct and
quadratic, because measuring a depth means walking a subtree and every deep subtree gets re-walked
once per ancestor above it — \`160 400\` measurements on a spine of \`400\` where one pass needs none.
The depths never change, so cache them: one bottom-up pass fills a table and a second sweep finds the
best bend, which is linear but holds a number for every node in order to return a single integer, and
reads in two ideas rather than one. The last step notices that the two passes want the same moment —
a node learns both children's reaches exactly when its recursive call returns, which is precisely when
it could both update a running best and report upward. The reason one walk can serve both is that the
two jobs need *different* numbers from the same pair: the parent can only use one arm, so it hears
\`1 + max(left, right)\`, while a path that ends here uses both, so \`left + right\` goes to the answer —
and keeping those two apart, rather than any cleverness about trees, is what the problem is testing.
What remains is \`O(n)\` time and \`O(h)\` space with no table at all; and since \`10^4\` nodes are allowed
with no balance promised, the final rung gives back the one resource the elegant version was
borrowing without asking, by moving the same walk onto a stack that does not run out at a thousand.`

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
      "Depth from every node",
      "`O(n²)`",
      "`O(h)`",
      "Re-walks every deep subtree once per ancestor",
      "Tiny inputs; stating the reframing out loud"
    ],
    [
      "Cached depth table",
      "`O(n)`",
      "`O(n)`",
      "Buys the time with a table read once",
      "The depths are wanted for something else too"
    ],
    [
      "One pass, reach + running best",
      "`O(n)`",
      "`O(h)`",
      "One walk does two jobs with two different numbers",
      "Default — this is the answer"
    ],
    [
      "Iterative post-order",
      "`O(n)`",
      "`O(h)`",
      "Same walk, frames you control",
      "The tree may be deeper than the frame limit"
    ]
  ]
}
