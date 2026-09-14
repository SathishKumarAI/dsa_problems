// inorder-walk — approach 2 — One list, handed down.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "one-list-handed-down",
  title: "One list, handed down",
  idea: `*The copying exists only because each call builds its own container.* Make one list and pass it
down; every node appends to it once. The traversal is identical — only the bookkeeping changes.`,
  intuition: `> **Intuition.** One sheet of paper carried through the whole walk instead of a fresh sheet at each
> desk that gets transcribed into the next one. The order still comes from the order of the three
> statements: go left, write, go right.`,
  worked: `| Visit order | Node | \`out\` after |
|---|---|---|
| 1 | \`1\` (no left subtree) | \`[1]\` |
| 2 | \`3\` (left child of \`2\`) | \`[1, 3]\` |
| 3 | \`2\` | \`[1, 3, 2]\` |`,
  code: `def inorder_handed_down(root: Optional[TreeNode]) -> list[int]:
    """One list, appended to once per node. The call stack holds the rest."""
    out: list[int] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        walk(node.left)
        out.append(node.val)      # the ONLY line that must sit between the two walks
        walk(node.right)

    walk(root)
    return out`,
  codeNote: `Move that middle line above the first \`walk\` and you have **pre**order; below the second, **post**
order. Three traversals, one line's difference — which is the thing to remember from this rung.`,
  mistake: `> **Watch out.** Returning \`out\` from the inner \`walk\` and expecting the outer call to collect it.
> \`walk\` returns \`None\`; the list is shared state, not a return value. The version that mixes the
> two — appending *and* returning — usually still works and teaches the wrong model of what is
> happening.`,
  cost: `- **Time — \`O(n)\`.** One append per node.
- **Space — \`O(h)\`** of call frames, plus the output.

**When it is right:** by default, and in an interview, right up until someone says "without
recursion" or the tree gets deep.

---`,
}
