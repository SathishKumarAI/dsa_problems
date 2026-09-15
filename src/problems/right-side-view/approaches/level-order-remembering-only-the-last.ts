// right-side-view — approach 2 — Level order, remembering only the last
//
// Converted from docs/deep/right-side-view_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "level-order-remembering-only-the-last",
  title: "Level order, remembering only the last",
  idea: `*The rows are thrown away immediately, so do not build them.* Walk breadth-first, and within each
round keep overwriting a single \`last\`. When the round ends, \`last\` holds the visible node.`,
  intuition: `> **Intuition.** You do not need the photograph, only the right-hand edge of it. Watch the row go
> past and remember the most recent face; when the row ends, the face you remember is the one at the
> edge.

The level boundary comes from the same length snapshot that level-order traversal uses:
\`for _ in range(len(queue))\` consumes exactly one level, because everything pushed during the round
belongs to the next one.`,
  worked: `| Round | Queue at start | Popped in order | \`last\` at round end |
|---|---|---|---|
| 1 | \`[1]\` | \`1\` | \`1\` |
| 2 | \`[2, 3]\` | \`2\`, then \`3\` | \`3\` |
| 3 | \`[5, 4]\` | \`5\`, then \`4\` | \`4\` |`,
  code: `def view_bfs_last(root: Optional[TreeNode]) -> list[int]:
    """One round per level; the last node of the round is the visible one."""
    out: list[int] = []
    queue: deque[TreeNode] = deque([root] if root else [])
    while queue:
        last = None
        for _ in range(len(queue)):      # the snapshot: exactly this level
            node = queue.popleft()
            last = node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(last)
    return out`,
  mistake: `> **Watch out.** Taking the queue's last element *before* draining it — \`queue[-1].val\` — and then
> processing the round. That happens to be right, but only because the queue at the top of a round
> holds exactly one level; write it after any push and it is reading a node from the next level. The
> version above is immune because it observes what it actually pops.`,
  cost: `- **Time — \`O(n)\`.**
- **Space — \`O(w)\`, the widest level.** Measured on a perfect tree of \`32 767\` nodes, the queue peaks
  at **\`16 384\`** — half the tree held in memory to produce fifteen numbers.

**When it is right:** when explaining. This is the version whose correctness is obvious, and the one
to write first in an interview before the follow-up about memory arrives.

---`,
}
