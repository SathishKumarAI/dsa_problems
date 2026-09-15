// tree-diameter — approach 1 — Measure the depth from every node
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
  rung: "depth-measured-from-every-node",
  title: "Measure the depth from every node",
  idea: `*Take the reframing at face value.* The best bend at a node is \`depth(left) + depth(right)\` in edges;
try every node, keep the largest. It is correct, it is a direct transcription of the insight, and its
cost is the reason for everything after it.`,
  intuition: `> **Intuition.** Stand on each node in turn and drop two plumb lines, one into each subtree, asking
> how far down each reaches. The measurements are right. The waste is that dropping a plumb line
> means walking that entire subtree — and you walk the same deep subtrees again from every ancestor
> above them.

Define \`depth(None) = -1\` so that a leaf's depth is \`0\` edges and the arithmetic at a bend is just
\`(depth(left) + 1) + (depth(right) + 1)\` — one edge to step into each child.`,
  worked: `On the second tree, node by node:

| Bend at | Left reach (edges) | Right reach (edges) | Path through it |
|---|---|---|---|
| \`1\` | \`3\` (via \`2\`, \`3\`, \`5\`) | — (no right child) | \`3\` |
| **\`2\`** | \`2\` (via \`3\`, \`5\`) | \`2\` (via \`4\`, \`7\`) | **\`4\`** ← the answer |
| \`3\` | \`1\` | \`1\` | \`2\` |
| \`4\` | — | \`1\` | \`1\` |
| \`5\`, \`6\`, \`7\` | — | — | \`0\` |

The root loses. That is the whole point of this problem, and it is why the next section's "common
mistake" is the one people actually ship.`,
  code: `def diameter_every_node(root: Optional[TreeNode]) -> int:
    """The reframing, transcribed: try every node as the bend."""
    best = 0

    def walk(node: Optional[TreeNode]) -> None:
        nonlocal best
        if node is None:
            return
        best = max(best, (depth(node.left) + 1) + (depth(node.right) + 1))
        walk(node.left)
        walk(node.right)

    walk(root)
    return best`,
  mistake: `> **Watch out.** Measuring only through the **root** — \`depth(root.left) + depth(root.right) + 2\`.
> The misconception is that the longest path must pass through the top, and the reason it survives
> is that it is right on most small examples. It is right on both of the statement's first two —
> \`[1, 2, 3, 4, 5]\` and \`[1, 2]\` — because in each of them the longest path happens to have the root
> as an endpoint. The statement's **third** example is the one that kills it: on
> \`[1, 2, null, 3, 4, 5, 6, 7]\` it returns **\`3\`** where the answer is **\`4\`**, the path
> \`5 → 3 → 2 → 4 → 7\` bending at node \`2\`.

That third example only earns its place because it was checked. Until 2026-09-13 it was
\`[1, 2, null, 3, null, 4]\` — a left-leaning chain, carrying the note *"a solution that only measures
through the root gets this wrong"* — and the through-the-root formula returns \`3\` on it, which is the
right answer, because a chain's longest path ends at the root. All three provided examples passed the
wrong solution, so a test suite built from them would have passed it too. **Run the wrong solution on
your examples.** An example that does not distinguish the answers is decoration.`,
  cost: `- **Time — \`O(n²)\`.** Genuinely, not as a loose bound: unlike the balanced-tree check, this has no
  early exit — a maximum must consider every node. Measured \`depth()\` entries on a left spine:
  **\`2 550\`** at \`n = 50\`, **\`10 100\`** at \`100\`, **\`40 200\`** at \`200\`, **\`160 400\`** at \`400\`. Four
  times the work for twice the nodes.
- **Space — \`O(h)\`** for the recursion.

**When it is right:** when \`n\` is tiny, or as the first version you write out loud before improving
it. Its value is that it makes the reframing explicit.

---`,
}
