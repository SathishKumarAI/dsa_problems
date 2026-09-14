// right-side-view — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/right-side-view_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every rung answers the same question — *how do you know a node is the last on its level?* — and the
ladder is the story of answering it with less. Building each level answers it by construction: the row
exists, so its last element is visible by definition, and the price is every value in the tree held
to return one per level. Keeping only a running \`last\` within each breadth-first round drops the rows
but not the queue, and the queue is the tree's widest level — half the nodes, to produce one number
per level. Going depth-first replaces the width with the height, and the first depth-first version
answers the question by *painting over*: one slot per level, last writer wins, which is correct in a
left-to-right walk and wasteful because every node writes and all but one write per level is
discarded. The last step is not an optimisation of the writes but a change of order: visit the right
child first, and the visible node becomes the **first** one the walk meets at each new depth, which
is free to detect because the answer holds exactly one value per level, so \`len(out)\` is the first
depth never seen. That leaves \`h\` writes instead of \`n\` — twelve against four thousand and ninety-five
on a perfect tree — and the trick that survives the problem is the test itself, comparing the current
depth against the length of the answer so far, which is how a depth-first walk recognises anything it
is seeing for the first time.`

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
      "Collect every level",
      "`O(n)`",
      "`O(n)`",
      "Correct by construction; stores everything",
      "The levels are wanted anyway"
    ],
    [
      "BFS keeping `last`",
      "`O(n)`",
      "`O(w)`",
      "Obvious correctness, width-shaped memory",
      "Explaining it; the first version to write"
    ],
    [
      "DFS left to right, overwriting",
      "`O(n)`, `n` writes",
      "`O(h)`",
      "Height-shaped memory, wasted writes",
      "The step between the other two"
    ],
    [
      "DFS right child first",
      "`O(n)`, `h` writes",
      "`O(h)`",
      "Order does the work",
      "Default — and the reusable pattern"
    ]
  ]
}
