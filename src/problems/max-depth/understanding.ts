// max-depth — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/max-depth_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed the top node of a family tree that has branched and branched, and asked a single
question: **how many generations deep does it go at its deepest point?** Not how many people are in
it, not which branch is longest — just the count of levels from the top down to the furthest
descendant.

The statement defines depth as *the number of nodes on the longest root-to-leaf path*. Read that
twice, because it fixes two things people get wrong later: it counts **nodes, not edges** (a single
lonely node has depth \`1\`, not \`0\`), and it is about the **longest** path, so the answer is decided
by one branch and every other branch is irrelevant to the final number — though you cannot know
which branch wins without looking at all of them.

**The core question:** *what does a node need to know in order to state its own depth?* Nothing about
its parent, nothing about its siblings — only how deep its two subtrees go. That single observation
is the whole problem, and the reason the best solution is three lines long.

The naive reading suggests work: enumerate the paths, measure them, take the maximum. That is
correct, and it is the thing worth outgrowing, because building the paths costs far more than
answering the question does.

### The constraints, and what each one unlocks

> **Intuition.** Depth is defined in terms of itself. A node is one more than the deeper of its two
> subtrees; a missing node is zero. Everything below is either that sentence typed out, or that
> sentence with the bookkeeping done by hand.

Throughout this document, one input:

\`\`\`
        3          <- level 1
       / \\
      9   20       <- level 2
         /  \\
        15   7     <- level 3
\`\`\`

\`root = [3, 9, 20, null, null, 15, 7]\`, and the answer is \`3\`. The deepest path is \`3 -> 20 -> 15\`
(or \`3 -> 20 -> 7\`; both are length 3). Note that \`9\` is a leaf at level 2 — a **short** branch, and
it exists precisely to catch solutions that stop at the first leaf they meet.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= node count <= 10^4`",
    "what": "Zero is a legal input. **An empty tree is not an edge case you may skip** — it is in the constraint, and it is the base case the whole recursion is built on"
  },
  {
    "constraint": "`-100 <= node value <= 100`",
    "what": "Values are **irrelevant**. This is a pure shape question; a solution that reads `node.val` at all is doing something unnecessary"
  },
  {
    "constraint": "a binary tree (no cycle, one parent each)",
    "what": "Every node is reached exactly once with no `visited` set. A graph would need one; a tree pays nothing"
  },
  {
    "constraint": "an empty tree has depth `0`",
    "what": "The statement hands you the base case. `depth(None) = 0` is not a convention someone invented — it is in the problem"
  },
  {
    "constraint": "`10^4` nodes, with **no promise of balance**",
    "what": "The killer. A legal input is a tree shaped like a linked list, `10 000` nodes tall. Any solution whose memory is *height*-shaped must survive a height of `10 000` — and in CPython, one of them does not"
  }
]
