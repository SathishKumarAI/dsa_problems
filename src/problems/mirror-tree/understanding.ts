// mirror-tree — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/mirror-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Fold the tree down its centre line. If the two halves land exactly on each other — same values, same
shape — the tree is symmetric.

\`\`\`
        1
       / \\
      2   2          fold here
     / \\ / \\
    3  4 4  3        the outer 3s meet, the inner 4s meet  ->  symmetric
\`\`\`

The trap lives one level down from the obvious. Symmetry is **not** a property of a node. Ask "is this
node symmetric?" and there is nothing to answer — a node has no partner to be compared against. The
question only makes sense for a **pair** of nodes, one from each side, and until you make that switch
every attempt turns into a check on a flattened list of values that keeps needing exceptions.

**The core question:** *what is the unit being compared?* Get that wrong and the shape escapes; get it
right and the base cases fall out for free.

> **Intuition.** Two subtrees mirror each other when their roots match and their children match
> **crossed over**: \`a\`'s left against \`b\`'s right, \`a\`'s right against \`b\`'s left. That crossing is
> the entire problem. Everything else is bookkeeping.

### The constraints, and what each one unlocks

Three trees run through this document — the statement's own examples:

| Input | Answer | Why |
|---|---|---|
| \`[1, 2, 2, 3, 4, 4, 3]\` | \`true\` | every pair matches across the centre |
| \`[1, 2, 2, null, 3, null, 3]\` | \`false\` | both \`2\`s carry a **right** child; a mirror needs one on each side |
| \`[1, 1, 1, 1, null, 1]\` | \`false\` | every value is \`1\`, so values alone can prove nothing — only the shape differs |

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= number of nodes <= 1000`",
    "what": "An empty tree is symmetric, and so is a single node — both are base cases, not errors"
  },
  {
    "constraint": "`-100 <= node value <= 100`",
    "what": "A small alphabet, which **guarantees repeats**. That is what makes any values-only test unsafe"
  },
  {
    "constraint": "symmetry is about **shape as well as values**",
    "what": "Two nodes match only if both are present or both absent. \"Both absent\" is a match, not a skip"
  },
  {
    "constraint": "values may repeat",
    "what": "The statement's third example, `[1, 1, 1, 1, null, 1]`, exists purely to kill the tempting shortcut"
  }
]
