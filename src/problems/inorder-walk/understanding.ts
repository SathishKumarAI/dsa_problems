// inorder-walk — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Visit every node of a binary tree in one specific order: **everything in my left subtree, then me,
then everything in my right subtree.** Return the values in that order.

\`\`\`
    1                inorder: 1, 3, 2
     \\
      2              1 has no left subtree, so it goes first.
     /               Then its right subtree — whose own left child, 3,
    3                comes before 2.
\`\`\`

\`root = [1, null, 2, 3]\` answers \`[1, 3, 2]\`.

Two things the statement is careful about, and both are load-bearing:

- **This is a binary tree, not a search tree.** Inorder is defined by *shape* — left, node, right —
  not by value. The answer comes out sorted only when the tree happens to be a BST, which is why
  the third example is sorted and proves nothing.
- **The tree may be a single chain.** With \`10^4\` nodes allowed, recursion depth is not a footnote;
  it is the reason two of the four approaches below fail on a legal input.

**The core question:** *where do you keep the work you have not finished yet?* Inorder means you
must walk past a node, go all the way down its left side, and then come back to it. Something has
to remember that node while you are away. Every approach here is a different answer to **where that
memory lives** — and that is the ladder.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`0 <= number of nodes <= 10^4`",
        "what": "An empty tree answers `[]`. And `10^4` with no balance promised means a spine that far exceeds CPython's `1 000` frames — measured at the foot of this page"
    },
    {
        "constraint": "`-100 <= node.val <= 100`",
        "what": "Values are carried, never compared. Duplicates are fine and change nothing"
    },
    {
        "constraint": "**a binary tree, NOT a search tree**",
        "what": "The answer is sorted only by coincidence. Never reach for a property of BSTs here"
    },
    {
        "constraint": "every node appears exactly once",
        "what": "The output length is the node count — a cheap self-check while tracing"
    },
    {
        "constraint": "the tree may be a single chain",
        "what": "Why the recursion is not automatically the right answer"
    }
]
