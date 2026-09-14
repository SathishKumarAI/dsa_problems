// right-side-view — approach 3 — Depth-first, left to right, overwriting
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
  rung: "depth-first-left-to-right-overwriting",
  title: "Depth-first, left to right, overwriting",
  idea: `*Breadth-first holds a level; depth-first holds only a path.* Walk depth-first carrying the depth,
and write each node into \`out[depth]\`. Later nodes on a level overwrite earlier ones, so whatever
survives is the last one visited — which, in a left-to-right walk, is the rightmost.`,
  intuition: `> **Intuition.** One slot per level, painted over every time someone new arrives on that level. The
> last painter wins, and in a left-to-right walk the last painter on a level is the node furthest
> right.

This is worth its own rung because it is the first version whose memory is the **height**, and
because its inefficiency points directly at the final approach: every node writes, and all but one
write per level is wasted.`,
  worked: `| Visit | Node | Depth | \`out\` after |
|---|---|---|---|
| 1 | \`1\` | \`0\` | \`[1]\` |
| 2 | \`2\` | \`1\` | \`[1, 2]\` |
| 3 | \`5\` | \`2\` | \`[1, 2, 5]\` |
| 4 | \`3\` | \`1\` | \`[1, 3, 5]\` — \`3\` paints over \`2\` |
| 5 | \`4\` | \`2\` | \`[1, 3, 4]\` — \`4\` paints over \`5\` |`,
  code: `def view_dfs_overwrite(root: Optional[TreeNode]) -> list[int]:
    """One slot per level, overwritten; the last writer on a level wins."""
    out: list[int] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(out):
            out.append(node.val)
        else:
            out[depth] = node.val        # a later node on this level wins
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return out`,
  mistake: `> **Watch out.** Writing only when the slot is new — \`if depth == len(out): out.append(...)\` with no
> \`else\`. That keeps the **first** node on each level, which in a left-to-right walk is the leftmost:
> **\`[1, 2, 5]\`** on example 1. The two halves of this approach — *left to right* and *overwrite* —
> only work together, and swapping either one alone inverts the answer.`,
  cost: `- **Time — \`O(n)\`.** Every node performs a write: measured, **\`1 023\`** writes on a perfect tree of
  \`1 023\` nodes, **\`4 095\`** on one of \`4 095\`.
- **Space — \`O(h)\`** of call frames.

**When it is right:** rarely, on its own — it is the step that shows the memory can be the height
rather than the width, and the next approach keeps that and drops the wasted writes.

---`,
}
