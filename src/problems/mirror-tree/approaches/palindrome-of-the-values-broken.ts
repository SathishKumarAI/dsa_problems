// mirror-tree — approach 1 — Check each level, as a palindrome
//
// Converted from docs/deep/mirror-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "palindrome-of-the-values-broken",
  title: "Check each level, as a palindrome",
  idea: `*If the tree is symmetric, every level read left to right is the same as read right to left.* So walk
the tree level by level and test each level for being a palindrome. This is true, and it is only
usable if you keep the **holes**.`,
  intuition: `> **Intuition.** Lay each generation out in a row, including a blank card wherever a child is missing.
> A symmetric tree makes every row read the same forwards and backwards. Drop the blanks and the rows
> slide together — which is exactly how a lopsided tree starts looking symmetric.

Keeping the holes means the next level is built from **every** slot in the current one, including the
empty ones, each contributing two empty slots of its own. The row doubles every level and is mostly
blank near the bottom, which is this approach's real cost.`,
  worked: `Example 2, \`[1, 2, 2, null, 3, null, 3]\`, with \`·\` for a hole:

| Level | Row, holes kept | Palindrome? |
|---|---|---|
| 1 | \`1\` | yes |
| 2 | \`2, 2\` | yes |
| 3 | \`·, 3, ·, 3\` | **no** — reversed it is \`3, ·, 3, ·\` |

The mismatch is entirely in the holes. Every value on that level is a \`3\`.`,
  code: `def is_symmetric_levels(root: Optional[TreeNode]) -> bool:
    """Every level, holes included, must read the same both ways."""
    if root is None:
        return True
    level: list[Optional[TreeNode]] = [root]
    while any(node is not None for node in level):
        values = [None if node is None else node.val for node in level]
        if values != values[::-1]:
            return False
        nxt: list[Optional[TreeNode]] = []
        for node in level:
            nxt.append(node.left if node else None)
            nxt.append(node.right if node else None)
        level = nxt
    return True`,
  codeNote: `The loop condition is \`any(node is not None …)\` rather than \`while level:\` — the row never becomes
empty, it becomes all holes.`,
  mistake: `> **Watch out.** Dropping the holes: building the next row from the children that exist. Run on all
> three of the statement's examples, this returns **\`True\`, \`True\`, \`True\`** — it is wrong on two of
> the three, including the example written specifically to catch it. The misconception is that a level
> is a list of nodes. A level is a list of **slots**, and the empty ones carry as much information as
> the full ones.

> **Watch out.** Testing the in-order traversal for a palindrome. It is wrong on the all-ones example
> — measured, it returns **\`True\`** where the answer is \`False\` — and it is *right* on the other two,
> which is what makes it dangerous. Any values-only test is provably blind here: when every value is
> \`1\`, every reading of any tree is a palindrome, so the test cannot distinguish trees it must
> distinguish.`,
  cost: `- **Time — \`O(n)\` nodes visited, but the rows themselves are \`O(2^h)\` slots.** On a sparse deep tree
  that is far more work than the tree has nodes.
- **Space — the width of a row**, which with holes kept is \`2^(level)\` rather than the count of real
  nodes.

**When it is right:** when you want to *see* the levels — printing them, checking a level-indexed
property. As a symmetry test it is the honest first idea and the worst of the four.

---`,
}
