// same-tree — approach 2 — Walk both trees in lockstep
//
// Converted from docs/deep/same-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "compare",
  title: "Walk both trees in lockstep",
  idea: `*The strings exist only to be compared once, and building them prevents an early exit.* Compare the
two trees directly, node against node, and stop at the first disagreement. Nothing is flattened, so
nothing about the shape can be lost.`,
  intuition: `> **Intuition.** Two fingers, one on each tree, always at the same address. At each stop ask three
> questions in order: *are we both off the end?* (identical here), *is exactly one of us off the end?*
> (different shape, done), *do our values match?* Then move both fingers left, and both fingers right.

> **Why it works.** The recursion has the same shape as the thing it checks, which is why it needs no
> extra machinery: "the trees are the same" **is** "the roots match and the left subtrees are the same
> and the right subtrees are the same". Structure is never discarded because the walk never leaves the
> trees.`,
  worked: `The mirrored pair again, in lockstep:

| Call | \`p\` | \`q\` | Test | Result |
|---|---|---|---|---|
| 1 | \`1\` | \`1\` | both present, values equal | descend |
| 2 (left) | \`2\` | \`None\` | **exactly one is empty** | \`False\` — stop |
| — | — | — | the right subtrees are never visited | — |

Two comparisons total. The serialised approach needed the whole of both trees first.`,
  code: `def is_same_lockstep(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """Three cases, in this order: both empty, one empty, values differ."""
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    if p.val != q.val:
        return False
    return is_same_lockstep(p.left, q.left) and is_same_lockstep(p.right, q.right)`,
  codeNote: `The order of those three tests is not a style choice — see below.`,
  mistake: `> **Watch out.** Testing the values first: \`if p.val != q.val: return False\` before the \`None\` checks.
> It raises \`AttributeError: 'NoneType' object has no attribute 'val'\` the moment one tree runs out
> before the other — measured, on \`[1, 2]\` against \`[1]\`. The misconception is that the three cases
> are independent tests in any order; they are not. **The structure checks are what make the value
> check legal.**

> **Watch out.** Comparing the nodes rather than their values — \`if p != q\`. Two distinct node objects
> are never equal under the default identity comparison, so this reports every pair of trees as
> different, including a tree against a copy of itself. It passes only when the same object is handed
> in twice.`,
  cost: `- **Time — \`O(n)\` worst case, and as little as one comparison.** Measured on two 63-node trees that
  differ only at the root: lockstep touches **\`1\`** node, the serialised version touches **\`254\`**.
- **Space — \`O(h)\`** of call frames, nothing else.

**When it is right:** by default. It is the shortest, it short-circuits, and it cannot lose the shape.

---`,
}
