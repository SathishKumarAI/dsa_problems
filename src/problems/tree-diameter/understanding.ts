// tree-diameter — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/tree-diameter_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Take any two nodes in a binary tree. There is exactly one route between them, and it goes up from one
node, turns around somewhere, and comes down to the other. The **diameter** is the length of the
longest such route, counted in **edges**.

Two things in that sentence do the damage. First, "any two nodes" — the path is not required to touch
the root, and the longest one often does not. Second, "in edges" — a single node has diameter \`0\`,
not \`1\`, and every \`+1\` in your code is a chance to get that wrong.

**The core question:** *how do you search over paths without enumerating paths?* There are \`O(n²)\`
pairs of nodes; you cannot try them. The unlock is a change of subject:

> **Intuition.** Every path bends at exactly **one** highest node. Fix that node, and the best path
> bending there is forced — go as deep as you can on the left, as deep as you can on the right, and
> join them. So "the longest path in the tree" becomes "the best bend at any node", and a question
> about \`O(n²)\` paths becomes a question about \`n\` nodes.

Once you have that, the rest of the ladder is only about not measuring the same depth twice.

### The constraints, and what each one unlocks

Two trees run through this document. The statement's first example:

\`\`\`
        1
       / \\
      2   3         the path 4 - 2 - 1 - 3 is three edges
     / \\
    4   5           it bends at the ROOT, which is why this example proves nothing about bending
\`\`\`

and the one that separates the right answers from the plausible ones:

\`\`\`
        1
       /
      2             the best path is 5 - 3 - 2 - 4 - 7: four edges, bending at node 2
     / \\
    3   4           through the root it is only three
   / \\   \\
  5   6   7
\`\`\`

\`root = [1, 2, null, 3, 4, 5, 6, 7]\`, answer **\`4\`**.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= number of nodes <= 10^4`",
    "what": "The tree is never empty, so there is always an answer; `0` for a single node"
  },
  {
    "constraint": "`-100 <= node.val <= 100`",
    "what": "Values never enter the answer — this is pure shape"
  },
  {
    "constraint": "the answer is counted in **edges**",
    "what": "A one-node tree is `0`, a two-node tree is `1`. The `+1`s in every approach below trace back to this"
  },
  {
    "constraint": "the path may live **entirely inside one subtree**",
    "what": "The reason \"measure through the root\" is wrong. It is wrong on trees smaller than you expect"
  },
  {
    "constraint": "the tree can be a chain",
    "what": "With `10^4` nodes allowed, recursion depth is part of the problem, not a footnote"
  }
]
