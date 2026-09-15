// same-tree — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/same-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Two trees are the same when they have the **same values in the same positions**. Both halves of that
matter, and the second half is the one that gets lost: two trees can hold exactly the same multiset of
values, in exactly the same order under a traversal, and still be different trees.

\`\`\`
    p = [1, 2]        q = [1, null, 2]

        1                 1
       /                   \\
      2                     2
\`\`\`

Same values. Same pre-order reading: \`1, 2\`. Different trees, answer **\`false\`**.

**The core question:** *how do you compare shape, not just contents?* Every wrong answer to this
problem is a comparison that quietly discards structure — and the tell is always the same: something
was flattened.

> **Intuition.** A tree is values **plus** the holes between them. Any comparison that records only
> the values compares a shadow. Either record the holes too, or never flatten in the first place.

### The constraints, and what each one unlocks

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= nodes in each tree <= 100`",
    "what": "Small. Recursion depth is a non-issue here — unusually for a tree problem, the iterative rung below is about generality, not about surviving the input"
  },
  {
    "constraint": "`-10^4 <= node.val <= 10^4`",
    "what": "Values are wide, so a delimiter matters if you serialise: `1,23` and `12,3` must not collide"
  },
  {
    "constraint": "**structure counts as much as values**",
    "what": "The whole problem. It is why the serialisation must record empty children"
  },
  {
    "constraint": "two empty trees are identical; one empty and one not are not",
    "what": "Two of the three base cases, handed to you by the statement"
  }
]
