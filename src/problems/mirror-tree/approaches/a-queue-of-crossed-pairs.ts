// mirror-tree — approach 4 — The same crossed pairs, iteratively
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
  rung: "a-queue-of-crossed-pairs",
  title: "The same crossed pairs, iteratively",
  idea: `*Nothing about the pair walk needs the call stack* — it needs a container of pairs. A queue gives the
same verdict level by level; a stack gives it depth first. Every pair must match, so the order they
are checked in cannot change the answer.`,
  intuition: `> **Intuition.** The to-do list is a list of **appointments**: "compare these two, crossed". Any order
> works because the verdict is a conjunction over all of them — the only thing order changes is which
> mismatch you happen to find first.`,
  worked: `Example 1, queue of crossed pairs:

| Step | Queue | Dequeued | Pushed |
|---|---|---|---|
| 1 | \`[(2, 2)]\` | \`(2, 2)\` — match | \`(3, 3)\`, \`(4, 4)\` |
| 2 | \`[(3,3), (4,4)]\` | \`(3, 3)\` — match | four empty pairs |
| 3 | … | \`(4, 4)\` — match | four empty pairs |
| 4 | eight \`(∅, ∅)\` | each skipped | — |
| — | empty | — | \`True\` |`,
  code: `def is_symmetric_iterative(root: Optional[TreeNode]) -> bool:
    """Approach 3 with the pairs in a queue instead of on the call stack."""
    if root is None:
        return True
    queue: deque[tuple[Optional[TreeNode], Optional[TreeNode]]] = deque([(root.left, root.right)])
    while queue:
        a, b = queue.popleft()
        if a is None and b is None:
            continue
        if a is None or b is None or a.val != b.val:
            return False
        queue.append((a.left, b.right))       # the crossing, again
        queue.append((a.right, b.left))
    return True`,
  mistake: `> **Watch out.** Pushing the four children as four separate items rather than two pairs, then popping
> them two at a time. It works whenever the queue happens to stay aligned and desynchronises the first
> time a pair contains a \`None\` that gets skipped — comparing partners that were never partners. The
> pair is the unit in the container for the same reason it is the unit in the recursion.`,
  cost: `- **Time — \`O(n)\`.**
- **Space — \`O(w)\`** with a queue, \`O(h)\` with a stack.

**When it is right:** when recursion is unavailable, or when a queue is already in hand.

---`,
}
