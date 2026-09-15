// mirror-tree — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/mirror-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The whole lesson here is smaller than the problem and bigger than trees: **ask the question about the
right thing.** Symmetry is not a property a single node can have, so every approach that walks one
cursor ends up testing a shadow of the real question — collect the values and compare the list to its
reverse, and you are asking about a sequence, not a tree, which is why the statement ships an
all-ones example whose every reading is a palindrome no matter what shape it holds. Levels can be made
to work, but only by keeping the holes, and then the rows grow as \`2^h\` while the tree does not.
Composing two solved problems — build the mirror, compare with \`same-tree\` — is correct and honest,
and it pays a full copy for a question that was never about a second tree; it also invites the version
that inverts in place, which returns \`True\` for everything because a tree compared with itself always
matches, and hands the caller back a tree that has been quietly rearranged. The move that dissolves
all of it is changing the unit from a node to a **pair, crossed**: then the recursion is three lines,
the crossing that defines the problem is literally the two arguments of the call, and the case people
keep patching — one child present, one absent — is not a special case at all but the second base
case. When a check keeps needing exceptions, the unit is usually wrong; that is the thing to carry
out of this problem, and the reason the iterative version is worth writing once is that it makes the
unit impossible to miss.`

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
      "Levels as palindromes",
      "`O(n)` nodes, `O(2^h)` slots",
      "row width with holes",
      "Correct only if the holes are kept",
      "You want the levels themselves"
    ],
    [
      "Mirror copy + `same-tree`",
      "`O(n)`",
      "`O(n)`",
      "Two solved problems composed; pays a copy",
      "`invert` and `same-tree` already exist"
    ],
    [
      "Crossed pairs, recursive",
      "`O(n)`, short-circuits",
      "`O(h)`",
      "The unit matches the question",
      "Default — this is the answer"
    ],
    [
      "Crossed pairs, iterative",
      "`O(n)`",
      "`O(w)` or `O(h)`",
      "Same walk, container by hand",
      "No recursion; or to make the pair explicit"
    ]
  ]
}
