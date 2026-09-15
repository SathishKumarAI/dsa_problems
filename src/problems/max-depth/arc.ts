// max-depth — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/max-depth_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every approach here computes the same number, and the whole ladder is the progressive removal of
things that were never needed to compute it. The literal reading builds every root-to-leaf path and
then reads only their lengths, so it pays \`O(n · h)\` to store content it discards — the first
subtraction is to stop keeping the paths and keep only a count, which turns the problem from
"enumerate and measure" into "count the levels", and BFS does that with a queue and a snapshot of its
length. But counting levels forces you to hold an entire level at once, and a level can be half the
tree, so the second subtraction attaches the depth to each node as a tag rather than inferring it
from position — and the moment depth travels *with* the node, the traversal order stops mattering and
a stack can replace the queue, trading the tree's width for its height. What remains is bookkeeping
that the language was already doing: a stack of nodes and their depths, pushed and popped around a
recursive descent, *is* a call stack. Removing that hand-written container leaves the three lines
that simply state the definition — a node is one more than its deeper subtree, a missing node is
zero — and the arc ends where it should, with the shortest program being the one that says what the
answer means. The sting in the tail is that the last subtraction gives something back: the explicit
stack is a container you control and can grow to \`10 000\`, while the call stack is the interpreter's
and caps at \`1 000\`, which is why the most elegant rung is the only one that fails on an input the
constraints explicitly permit.`

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
      "Enumerate every path",
      "`O(n · h)`",
      "`O(n · h)`",
      "Keeps everything, reads almost none of it",
      "The paths themselves are the answer"
    ],
    [
      "BFS, count levels",
      "`O(n)`",
      "`O(w)` — up to `n/2`",
      "Holds a whole level to know a level ended",
      "The question is about levels; or recursion is unsafe"
    ],
    [
      "Explicit `(node, depth)` stack",
      "`O(n)`",
      "`O(h)`",
      "Hand-rolls what the call stack does",
      "Deep trees, small stacks, no recursion available"
    ],
    [
      "Recursion",
      "`O(n)`",
      "`O(h)` frames",
      "Shortest and clearest; capped by the interpreter",
      "Default choice — with the depth caveat said out loud"
    ]
  ]
}
