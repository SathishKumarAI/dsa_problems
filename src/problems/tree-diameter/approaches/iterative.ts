// tree-diameter — approach 4 — The same pass, without the call stack
//
// Converted from docs/deep/tree-diameter_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "iterative",
  title: "The same pass, without the call stack",
  idea: `*\`10^4\` nodes are permitted and nothing promises balance,* so a legal input is a chain \`10 000\` deep
— and CPython stops at \`1 000\` frames. The fix is not a different algorithm; it is the same
post-order walk carrying its own stack.`,
  intuition: `> **Intuition.** The recursion's only real trick is visiting each node **twice** — once to schedule
> its children, once when both have answered. A \`ready\` flag makes that second visit explicit. Reaches
> are kept in a map and popped as they are consumed, so the map holds the frontier, not the tree.`,
  worked: `Same tree; the stack with the top on the right, \`*\` marking "children done, combine now".

| Step | Stack | Action | \`best\` |
|---|---|---|---|
| 1 | \`[1]\` | expand \`1\` → \`1*\`, \`2\` | \`0\` |
| 2 | \`[1*, 2]\` | expand \`2\` → \`2*\`, \`3\`, \`4\` | \`0\` |
| 3 | \`[1*, 2*, 3, 4]\` | expand \`4\` → \`4*\`, \`7\`; then \`7*\` returns \`1\` | \`0\` |
| 4 | \`[1*, 2*, 3, 4*]\` | \`4*\` combines \`0, 1\` → bend \`1\`, returns \`2\` | \`1\` |
| 5 | \`[1*, 2*, 3]\` | expand \`3\`, resolve \`5*\`, \`6*\`, then \`3*\` | \`2\` |
| 6 | \`[1*, 2*]\` | \`2*\` combines \`2, 2\` → bend **\`4\`**, returns \`3\` | **\`4\`** |
| 7 | \`[1*]\` | \`1*\` combines \`3, 0\` → bend \`3\` | \`4\` |`,
  code: `def diameter_iterative(root: Optional[TreeNode]) -> int:
    """Approach 3 with an explicit stack — survives a tree taller than the frame limit."""
    best = 0
    reach: dict[TreeNode, int] = {}
    stack: list[tuple[TreeNode, bool]] = [(root, False)] if root else []
    while stack:
        node, ready = stack.pop()
        if ready:
            left = reach.pop(node.left, 0)    # popped: a reach is read once, by the parent
            right = reach.pop(node.right, 0)
            best = max(best, left + right)
            reach[node] = 1 + max(left, right)
        else:
            stack.append((node, True))        # revisit after both children
            if node.left:
                stack.append((node.left, False))
            if node.right:
                stack.append((node.right, False))
    return best`,
  mistake: `> **Watch out.** Leaving the reaches in the map instead of popping them. The answer stays correct and
> the memory quietly becomes \`O(n)\` — the very cost approach 2 was abandoned for. The misconception is
> that a map is bookkeeping rather than a data structure with a size; here, \`pop\` is what makes the
> difference between holding the frontier and holding the tree.`,
  cost: `- **Time — \`O(n)\`**; each node pushed and popped twice.
- **Space — \`O(h)\`.**

**When it is right:** when the input can be deep. On a \`10 000\`-node chain — legal under this
problem's constraints — the three recursive approaches raise \`RecursionError: maximum recursion depth
exceeded\` and this one returns **\`9 999\`**.

---`,
}
