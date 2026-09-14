// right-side-view — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/right-side-view_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Stand to the right of the tree and look at it. Return what you can see: one value per level, top to
bottom — the **rightmost node on each level**, with everything behind it hidden.

Read "rightmost" carefully, because the whole problem is in that word:

\`\`\`
        1                        1
       / \\                      / \\
      2   3                    2   3          level 2: you see 3, and 5 is behind it
       \\    \\                  /
        5    4                4                level 3: the only node is 4 — and it is a
                                                LEFT child, of a LEFT child

  [1, 2, 3, null, 5, null, 4]   [1, 2, 3, 4]
       -> [1, 3, 4]                  -> [1, 3, 4]
\`\`\`

**Rightmost means last on its level, not "the right child."** The second tree is the statement's own
second example, and it exists to kill the solution everyone writes first — walking down \`root.right\`
until it runs out. Measured, that solution returns **\`[1, 3, 4]\`** on the first tree, which is
correct, and **\`[1, 3]\`** on the second, which is not.

**The core question:** *how does a walk know that a node is the last one on its level?* There are
exactly two answers, and they are the two halves of this ladder:

> **Intuition.** Either **build the level** and take its last element — obvious, and you pay by
> holding the level — or **choose an order** in which the visible node is the first one you meet at
> each new depth, and pay nothing at all.

### The constraints, and what each one unlocks

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= number of nodes <= 100`",
    "what": "An empty tree answers `[]`. Small: recursion depth is not a danger here, so this document does not pretend otherwise"
  },
  {
    "constraint": "`-100 <= node value <= 100`",
    "what": "Values are carried, never compared — and they repeat, so nothing may key on them"
  },
  {
    "constraint": "exactly one value per level",
    "what": "The answer's length is the tree's **height**. That is the invariant every approach below tests against"
  },
  {
    "constraint": "the rightmost node is **not always a right child**",
    "what": "The reason for example 2, and the reason the naive walk fails"
  },
  {
    "constraint": "an empty tree sees nothing",
    "what": "A base case, not an error"
  }
]
