// max-depth — approach 2 — Count levels with a queue
//
// Converted from docs/deep/max-depth_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "bfs",
  title: "Count levels with a queue",
  idea: `*The last approach kept data we immediately threw away — all that path content, to read only its
length. Can we count depth without ever recording a path?* Yes: depth is the **number of levels**, so
walk the tree level by level and count the levels. Nothing about any individual path is retained.`,
  intuition: `> **Intuition.** A ripple spreading out from the root. The first ring is \`{3}\`, the second is
> \`{9, 20}\`, the third is \`{15, 7}\` — and the answer is simply *how many rings there were*. You never
> ask how deep a node is; you only count how many times the ripple expanded before it stopped.

The mechanism that makes rings out of a flat queue is one line: **before draining, note how many
nodes are in the queue right now**, and pop exactly that many. Those are one level, by definition —
they were all put there by the previous level and nothing else has been added yet. The children they
push are the next ring, and they wait their turn.`,
  worked: `| Round | Queue at round start | \`depth\` after \`+= 1\` | Popped | Pushed |
|---|---|---|---|---|
| 1 | \`[3]\` | \`1\` | \`3\` | \`9\`, \`20\` |
| 2 | \`[9, 20]\` | \`2\` | \`9\`, \`20\` | \`15\`, \`7\` (from \`20\`; \`9\` has no children) |
| 3 | \`[15, 7]\` | \`3\` | \`15\`, \`7\` | nothing |
| — | \`[]\` | — | loop ends | answer **\`3\`** |

The short branch \`9\` does its job here: it pushes nothing, and the round still completes because the
round size was fixed before the draining started.`,
  code: `def max_depth_bfs(root: Optional[TreeNode]) -> int:
    """Depth is the number of levels, so count levels — a queue drained a level at a time."""
    if root is None:
        return 0
    depth = 0
    queue = deque([root])
    while queue:
        depth += 1
        for _ in range(len(queue)):           # len() snapshot: this level only
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return depth`,
  codeNote: `\`deque\` and not a list: \`list.pop(0)\` is \`O(n)\` because every remaining element shifts down one, which
would quietly turn this \`O(n)\` walk into an \`O(n²)\` one on a wide tree. \`popleft()\` is \`O(1)\`.`,
  mistake: `> **Watch out.** Dropping the inner loop and incrementing \`depth\` once per **node**. The code still
> runs, still terminates, still returns a number — it returns the node count. On the example that is
> **\`5\`**, not \`3\`. The misconception is that a queue "knows" about levels. It does not; a queue is a
> flat line. The level boundary exists only because you drew it with \`len(queue)\`.

The sibling error, in languages without a \`range(len(...))\` snapshot: reading the queue's size
*inside* the loop condition while pushing to it. The level then never ends, because you keep
extending the thing you are measuring.`,
  cost: `- **Time — \`O(n)\`.** Each node is enqueued once and dequeued once.
- **Space — \`O(w)\`, the widest level.** This is the honest cost, and on a perfect tree the widest
  level holds half the nodes. Measured, on a perfect tree of \`32 767\` nodes: the queue peaks at
  **\`16 384\`**. Half the tree, in memory, at once.

**When it is right:** when the question is about levels — level order, the right-side view, the
minimum depth (where BFS can stop at the first leaf and beat DFS outright). And when recursion is
unsafe: this approach has no call-stack cost at all, which is exactly the \`10 000\`-node spine problem
that breaks approach 4.

---`,
}
