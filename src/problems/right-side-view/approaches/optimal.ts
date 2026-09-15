// right-side-view — approach 4 — Depth-first, right child first
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
  rung: "optimal",
  title: "Depth-first, right child first",
  idea: `*All those overwrites exist because the walk meets the visible node early and then keeps going.* Turn
the order around: visit the **right** child before the left. Then the first node the walk ever reaches
at a new depth is the visible one, and nothing after it needs to be written at all.`,
  intuition: `> **Intuition.** Hug the right-hand wall on the way down. The first time you set foot on a new floor,
> you are standing at its right-hand edge — everything further right on that floor would have been
> reached before you got there.

> **Why it works.** The test for "a depth I have never seen" is free: the answer holds one value per
> level and is filled top-down, so **\`len(out)\` is the first unseen depth**. Arriving at a node whose
> depth equals \`len(out)\` means nothing on this level has been recorded yet, and because the walk is
> right-biased, nothing on this level to the right exists. That comparison — *current depth against
> the length of the answer so far* — is the reusable piece: it is how "the leftmost value in the last
> row" and "the first node at each level" are written too.`,
  worked: `| Visit | Node | Depth | \`len(out)\` | New depth? | \`out\` after |
|---|---|---|---|---|---|
| 1 | \`1\` | \`0\` | \`0\` | yes | \`[1]\` |
| 2 | \`3\` | \`1\` | \`1\` | yes | \`[1, 3]\` |
| 3 | \`4\` | \`2\` | \`2\` | yes | \`[1, 3, 4]\` |
| 4 | \`2\` | \`1\` | \`3\` | no | unchanged |
| 5 | \`5\` | \`2\` | \`3\` | no | unchanged |

Three writes, one per level, and visits 4 and 5 are pure traversal. On a perfect tree of \`4 095\`
nodes this approach makes **\`12\`** writes where approach 3 makes \`4 095\` — the height, not the node
count.`,
  code: `def view_dfs_right_first(root: Optional[TreeNode]) -> list[int]:
    """Right before left: the FIRST arrival at a new depth is the visible node."""
    out: list[int] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(out):            # never been this deep before
            out.append(node.val)
        walk(node.right, depth + 1)      # the order IS the algorithm
        walk(node.left, depth + 1)

    walk(root, 0)
    return out`,
  mistake: `> **Watch out.** Keeping the \`else: out[depth] = node.val\` branch from approach 3 while switching to
> right-first order. Now the **last** writer wins in a right-biased walk, which is the leftmost node —
> the left side view, wearing the right algorithm's clothes. Measured: **\`[1, 2, 5]\`** on example 1
> and **\`[1, 2, 4]\`** on example 2. Each half of the pairing is correct with the other half, and
> mixing them gives a wrong answer of exactly the right shape.

> **In an interview.** Say what makes the first arrival special before you write the recursion:
> "visiting right first means the first node I meet at a new depth is the rightmost on its level, and
> I can detect a new depth by comparing it to how many levels I have already recorded." That sentence
> is the solution; the code is transcription.`,
  cost: `- **Time — \`O(n)\`,** with \`h\` writes rather than \`n\`.
- **Space — \`O(h)\`.** On a perfect tree of \`32 767\` nodes this is **\`15\`** frames against the queue's
  \`16 384\` nodes. On a spine of \`500\` it inverts — \`500\` frames against a queue of \`1\` — so the honest
  statement is that one costs the width and the other the height, and the tree decides which is
  smaller.

**When it is right:** as the answer, and as a pattern. "First arrival at a new depth" generalises to
the leftmost view (left child first), the first node at each level, and the bottom-left value.

---`,
}
