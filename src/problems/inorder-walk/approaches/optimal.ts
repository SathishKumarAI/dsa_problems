// inorder-walk — approach 3 — An explicit stack.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "An explicit stack",
  idea: `*The call stack is holding exactly one thing: the ancestors you walked past and still owe a visit.*
Hold them yourself. The walk becomes a loop, the memory becomes a list you can bound, and the
\`1 000\`-frame ceiling disappears.`,
  intuition: `> **Intuition.** Go down the left-hand wall, dropping a marker at every node you pass. When the
> wall runs out, pick up the last marker — that node is next in order — and step once to its right,
> then start walking down the left-hand wall again from there.

> **Why it works.** The invariant is: *the stack holds exactly the nodes on the path from the root
> to the cursor whose left subtrees are done and which have not yet been recorded.* Pushing while
> descending left establishes it; popping records the deepest such node, which is by definition the
> next one in order; stepping right re-enters the same rule one subtree over.`,
  worked: `The six steps in "How to trace it by hand" above are this approach, and they were printed by the
script rather than written out by hand.`,
  code: `def inorder_stack(root: Optional[TreeNode]) -> list[int]:
    """Recursion with the lid off: the stack IS what the frames were holding."""
    out: list[int] = []
    stack: list[TreeNode] = []
    node = root
    while stack or node:              # something owed, OR somewhere to go
        while node:                   # inorder owes the leftmost node first
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right             # one step right, then descend left again
    return out`,
  mistake: `> **Watch out.** Writing the loop as \`while stack:\`. At the start the stack is empty and the cursor
> is the root, so the body never runs and **every tree returns \`[]\`**. Both halves of
> \`while stack or node\` are load-bearing: the stack holds what is owed, the cursor holds where there
> is still somewhere to go, and neither alone describes "unfinished".

> **Watch out.** Forgetting \`node = node.right\` after the pop — setting the cursor to \`None\`
> instead. The walk then never enters any right subtree, and on \`[1, null, 2, 3]\` it returns \`[1]\`.`,
  cost: `- **Time — \`O(n)\`,** each node pushed once and popped once.
- **Space — \`O(h)\`.** Measured peak depth: **\`10\`** on a balanced tree of \`1 023\` nodes, **\`500\`**
  on a spine of \`500\`. The stack holds a path, not a level.

**When it is right:** whenever the tree may be deep, and whenever the question says "iteratively".
On a \`10 000\`-node spine — legal here — the two recursive rungs raise \`RecursionError\` and this one
returns all \`10 000\` values. It is also the rung that can **stop early**, which matters for "the
k-th smallest" and for any caller that wants the first few values.

---`,
}
