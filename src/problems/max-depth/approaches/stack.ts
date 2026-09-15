// max-depth — approach 3 — One explicit stack of `(node, depth)` pairs
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
  rung: "stack",
  title: "One explicit stack of `(node, depth)` pairs",
  idea: `*BFS holds a whole level to count levels — and on a wide tree a level is half the tree. Can we hold
less?* Swap the queue for a stack, and the walk stops going wide and starts going **deep**: instead
of a whole level, memory now holds one root-to-leaf path plus the siblings waiting beside it. Each
node carries its own depth, so nothing has to be inferred from position.`,
  intuition: `> **Intuition.** Approach 2 asks "which ring am I in?" and needs the whole ring present to answer.
> This one gives every node a **luggage tag** with its depth written on it at the moment it is
> pushed. A node's depth is then a fact it carries, not a property of when it is visited — so the
> order of visits stops mattering entirely, and you are free to go depth-first and hold far less.

Once depth is on the tag, the loop body is trivial: pop, compare against the best seen, push both
children with \`depth + 1\`. There is no "level" concept left to get wrong.`,
  worked: `Stack shown left-to-right with the **top on the right** (the next pop).

| Step | Stack | Popped | \`best\` | Pushed |
|---|---|---|---|---|
| 1 | \`[(3,1)]\` | \`(3,1)\` | \`1\` | \`(9,2)\`, \`(20,2)\` |
| 2 | \`[(9,2), (20,2)]\` | \`(20,2)\` | \`2\` | \`(15,3)\`, \`(7,3)\` |
| 3 | \`[(9,2), (15,3), (7,3)]\` | \`(7,3)\` | **\`3\`** | — |
| 4 | \`[(9,2), (15,3)]\` | \`(15,3)\` | \`3\` | — |
| 5 | \`[(9,2)]\` | \`(9,2)\` | \`3\` | — |
| 6 | \`[]\` | — | \`3\` | answer **\`3\`** |

Row 3 is the point of the whole approach: the stack holds three entries at its peak and never more,
on a tree where BFS also held two. The gap widens with the tree.`,
  code: `def max_depth_stack(root: Optional[TreeNode]) -> int:
    """One root-to-leaf path in memory instead of one whole level."""
    best = 0
    stack: list[tuple[TreeNode, int]] = [(root, 1)] if root else []
    while stack:
        node, depth = stack.pop()
        if depth > best:
            best = depth
        if node.left:
            stack.append((node.left, depth + 1))
        if node.right:
            stack.append((node.right, depth + 1))
    return best`,
  codeNote: `The \`if root else []\` is the empty-tree base case, and it is doing real work: \`[(None, 1)]\` would put
a \`None\` on the stack and crash on \`node.left\` at the first pop. \`best = 0\` then falls straight out
of the empty loop, which is the answer the statement asks for.`,
  mistake: `> **Watch out.** Pushing the root as \`(root, 0)\`. This is the node-versus-edge confusion wearing a
> disguise: depth \`0\` for the root means you are counting **edges**, and the answer comes back one
> short — **\`2\`** on the example instead of \`3\`. The tell is that it is right on an empty tree and
> wrong on every other input, so a test suite that starts with the empty case looks green for a
> moment.

The reason to distrust yourself here: \`0\` genuinely *is* the right initial depth in the many tree
problems that measure height in edges. The mistake is not ignorance, it is a correct habit from a
neighbouring problem.`,
  cost: `- **Time — \`O(n)\`.** One push and one pop per node.
- **Space — \`O(h)\`.** At any moment the stack holds, for each level of the path you are on, at most
  one sibling still waiting — so it is bounded by the height, not the width. Measured on that same
  perfect tree of \`32 767\` nodes: the stack peaks at **\`15\`** where the BFS queue peaked at
  \`16 384\`. The app's data files quote \`O(n)\` for this rung, which is the same bound at its worst:
  on a tree degenerated into a spine, \`h = n\`.

**When it is right:** almost any time you would write the recursion but cannot — deep trees,
languages with small stacks, or an environment where a stack overflow is a crash rather than an
exception. It is the recursion with the frames made visible.

| Shape | BFS queue peak | DFS stack peak |
|---|---|---|
| perfect tree, \`1 023\` nodes, height \`10\` | \`512\` | \`10\` |
| perfect tree, \`32 767\` nodes, height \`15\` | \`16 384\` | \`15\` |
| left spine, \`1 000\` nodes | \`1\` | \`1\` |

Every number in that table was printed by the script at the foot of this document. Note the last
row: on a spine there are **no siblings to hold**, so both containers hold one node — and yet the
recursion below needs a thousand frames on the very same input. The explicit stack and the call
stack are not the same size.

---`,
}
