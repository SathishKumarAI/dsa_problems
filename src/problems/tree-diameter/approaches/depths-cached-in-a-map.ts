// tree-diameter — approach 2 — Cache the depths, then look for the bend
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
  rung: "depths-cached-in-a-map",
  title: "Cache the depths, then look for the bend",
  idea: `*Every depth is computed many times and never changes.* Compute them all once, bottom-up, into a
table; then sweep the table looking for the best bend. Two passes, no repeated measurement.`,
  intuition: `> **Intuition.** Survey the whole building once and write every wing's height on a floor plan. Then
> look at the plan — not the building — to find the best bend. The two questions are now cleanly
> separated: *how deep is each subtree* and *where is the best bend*.

This is the natural fix, and it is genuinely linear. What it costs is a table with an entry per node
— \`10^4\` numbers held to produce a single integer — and a second pass that reads what the first pass
already knew.`,
  worked: `Pass one fills the table (depth in edges):

| Node | \`5\` | \`6\` | \`7\` | \`3\` | \`4\` | \`2\` | \`1\` |
|---|---|---|---|---|---|---|---|
| depth | \`0\` | \`0\` | \`0\` | \`1\` | \`1\` | \`2\` | \`3\` |

Pass two reads it: at node \`2\`, left child \`3\` contributes \`1 + 1 = 2\` and right child \`4\`
contributes \`1 + 1 = 2\`, total **\`4\`**. No subtree was walked twice.`,
  code: `def diameter_cached(root: Optional[TreeNode]) -> int:
    """Fill a depth table bottom-up, then sweep it for the best bend."""
    table: dict[TreeNode, int] = {}

    def fill(node: Optional[TreeNode]) -> int:
        if node is None:
            return -1
        table[node] = 1 + max(fill(node.left), fill(node.right))
        return table[node]

    fill(root)
    best = 0
    for node in table:
        left = table[node.left] + 1 if node.left else 0
        right = table[node.right] + 1 if node.right else 0
        best = max(best, left + right)
    return best`,
  mistake: `> **Watch out.** Writing \`table[node.left] + 1\` without the \`if node.left\` guard. A missing child is
> not in the table at all, so this raises \`KeyError\` rather than returning a wrong answer — which is
> the good outcome. The tempting repair is to seed \`table[None] = -1\`; that works, but it puts a
> \`None\` key in a table of nodes, and every later reader has to know why.`,
  cost: `- **Time — \`O(n)\`**, two passes.
- **Space — \`O(n)\`** for the table, plus \`O(h)\` for the recursion.

**When it is right:** when something *else* also needs the depths — printing them, ranking subtrees,
answering repeated queries. If the diameter is all you want, the table is a structure built to be
read once and thrown away, which the next approach removes.

---`,
}
