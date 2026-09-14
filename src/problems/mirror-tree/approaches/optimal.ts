// mirror-tree — approach 3 — One recursion over crossed pairs
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
  rung: "optimal",
  title: "One recursion over crossed pairs",
  idea: `*The mirror copy exists only so that something can be compared against something.* But the comparison
was always available: the tree's own left subtree against its own right subtree, walked with the
children **crossed**. No copy, no rows, no flattening.`,
  intuition: `> **Intuition.** Two fingers, starting on the root's two children, moving outward together. At each
> step the left finger goes left exactly when the right finger goes right. If the two fingers always
> find the same value, and always run out of tree at the same moment, the tree is symmetric.

> **Why it works.** Change the unit and the problem changes shape. Asked of a node, symmetry has no
> answer; asked of a **pair**, it has a recursive one: \`(a, b)\` mirror when both are absent, or both
> are present with equal values and \`(a.left, b.right)\` and \`(a.right, b.left)\` both mirror. The
> awkward case — one child present, one absent — stops being a special case and becomes the second
> base case, which is the sign that the unit is finally right.`,
  worked: `Example 2, \`[1, 2, 2, null, 3, null, 3]\`. Pairs, in order:

| Step | \`a\` | \`b\` | Test | Next |
|---|---|---|---|---|
| 1 | \`2\` (left of root) | \`2\` (right of root) | both present, \`2 == 2\` | cross: \`(a.left, b.right)\` then \`(a.right, b.left)\` |
| 2 | \`a.left\` = \`None\` | \`b.right\` = \`3\` | **exactly one absent** | \`False\` — stop |

Two pairs examined, and the answer comes from a hole meeting a node — not from any value.`,
  code: `def is_symmetric_pairs(root: Optional[TreeNode]) -> bool:
    """The unit is a PAIR, and the recursion crosses it."""

    def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)

    return root is None or mirror(root.left, root.right)`,
  codeNote: `Three lines of body, and every one of them is a case from the statement.`,
  mistake: `> **Watch out.** Forgetting the crossing — writing \`mirror(a.left, b.left) and mirror(a.right,
> b.right)\`. That is \`same-tree\` applied to the two halves, and it answers a different question: *are
> the two subtrees identical*, not *are they reflections*. It is wrong in both directions, measured:
> **\`False\`** on example 1 where the answer is \`True\`, and **\`True\`** on example 2 where the answer is
> \`False\`. A test suite with only symmetric trees made of identical halves would never separate the
> two.`,
  cost: `- **Time — \`O(n)\`,** each node in at most one pair, and it short-circuits at the first mismatch.
- **Space — \`O(h)\`.** The recursion holds only the ancestors of the pair being examined — the height,
  not the width, which is the concrete saving over approach 1 on a wide tree.

**When it is right:** always. This is the answer.

---`,
}
