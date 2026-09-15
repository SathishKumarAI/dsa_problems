// mirror-tree — approach 2 — Build the mirror image and compare
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
  rung: "build-the-mirror-then-compare",
  title: "Build the mirror image and compare",
  idea: `*Symmetry is a statement about a tree and its mirror: the tree is symmetric exactly when it equals its
own reflection.* If you already have \`invert\` and \`same-tree\`, you have this for free — two solved
problems composed.`,
  intuition: `> **Intuition.** Hold the tree up to a mirror and ask whether the reflection is indistinguishable from
> the original. No new idea is required; the work is in not damaging the original while making the
> reflection.`,
  worked: `Example 1 and its mirror, side by side:

| | Tree | Mirror |
|---|---|---|
| root | \`1\` | \`1\` |
| level 2 | \`2, 2\` | \`2, 2\` |
| level 3 | \`3, 4, 4, 3\` | \`3, 4, 4, 3\` |

Identical, so \`true\`. On example 3 the mirror differs in shape at level 3, and the comparison catches
it because \`same-tree\` compares structure — which is the property this approach inherits, and the
whole reason it is correct.`,
  code: `def mirror_of(node: Optional[TreeNode]) -> Optional[TreeNode]:
    """A NEW tree, reflected. The original is untouched."""
    if node is None:
        return None
    return TreeNode(node.val, mirror_of(node.right), mirror_of(node.left))


def is_symmetric_by_mirroring(root: Optional[TreeNode]) -> bool:
    return same_tree(root, mirror_of(root))`,
  mistake: `> **Watch out.** Inverting **in place** and comparing the tree with itself. It is wrong twice over,
> and the run below prints both failures. First, it returns **\`True\`** for every input — including
> example 2, where the answer is \`False\` — because after an in-place inversion \`root\` and the
> "mirror" are the same object, and an object always equals itself. Second, it **destroys the
> caller's tree**: measured, \`[1, 2, 2, null, 3, null, 3]\` goes in and \`[1, 2, 2, 3, null, 3]\` comes
> back out.

The misconception is that inverting returns a new tree because it returns a value. It returns the
*same* tree, rearranged. A function that answers a question has no business modifying its input, and
the giveaway is that the caller's data changed.`,
  cost: `- **Time — \`O(n)\`,** one walk to build the mirror plus one to compare, and no early exit — the mirror
  is fully built before the comparison starts.
- **Space — \`O(n)\`** for the copy.

**When it is right:** when \`invert\` and \`same-tree\` already exist and clarity beats a constant factor,
or when the mirror itself is wanted afterwards.

---`,
}
