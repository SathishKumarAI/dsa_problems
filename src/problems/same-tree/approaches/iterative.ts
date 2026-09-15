// same-tree — approach 3 — The same lockstep walk, iteratively
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
  rung: "iterative",
  title: "The same lockstep walk, iteratively",
  idea: `*The recursion carries pairs of nodes on the call stack; carry them on a stack of your own instead.*
The unit that moves through the container is not a node but a **pair** — and once that is clear, the
loop is four lines.`,
  intuition: `> **Intuition.** The recursion's "compare these two subtrees next" is exactly a to-do list of node
> pairs. Write the list down and the recursion disappears, unchanged in every other respect.

With at most \`100\` nodes, this is not needed to survive the input — say so rather than pretending.
It earns its place for two other reasons: it makes the *pair* explicit, which is the idea the next
problem (symmetric-tree) is built on, and it is the version you want when the same walk has to run
somewhere recursion is unavailable.`,
  worked: `On identical trees \`[1, 2, 3]\`, with the top of the stack on the right:

| Step | Stack of pairs | Popped | Action |
|---|---|---|---|
| 1 | \`[(1,1)]\` | \`(1,1)\` | values match → push \`(2,2)\`, \`(3,3)\` |
| 2 | \`[(2,2), (3,3)]\` | \`(3,3)\` | match → push two empty pairs |
| 3 | \`[(2,2), (∅,∅), (∅,∅)]\` | \`(∅,∅)\` | both empty → skip |
| … | … | … | stack empties with no mismatch → \`True\` |`,
  code: `def is_same_iterative(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """The unit on the stack is a PAIR of nodes, not a node."""
    stack: list[tuple[Optional[TreeNode], Optional[TreeNode]]] = [(p, q)]
    while stack:
        a, b = stack.pop()
        if a is None and b is None:
            continue
        if a is None or b is None or a.val != b.val:
            return False
        stack.append((a.left, b.left))
        stack.append((a.right, b.right))
    return True`,
  codeNote: `Swap the stack for a \`deque\` and \`pop()\` for \`popleft()\` and it compares level by level instead; the
answer is identical, because *every* pair must match, so the order they are checked in cannot change
the verdict. Both are in the script below and both are cross-checked.`,
  mistake: `> **Watch out.** Pushing the two *nodes* instead of the two *pairs* — \`stack.append(a.left)\` and
> \`stack.append(b.left)\` into one flat stack. It appears to work on symmetric-looking inputs and then
> silently compares the wrong partners as soon as the shapes differ. The unit is the pair; flattening
> it is the same error as flattening the tree, one level down.`,
  cost: `- **Time — \`O(n)\`,** with the same short-circuit as approach 2.
- **Space — \`O(h)\`** for the stack (\`O(w)\` for the queue variant).

**When it is right:** when recursion is unavailable, or when you want the pair-wise framing explicit
because the next question is about symmetry rather than equality.

---`,
}
