// tree-diameter — approach 3 — One pass that returns a reach and folds a best
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
  rung: "optimal",
  title: "One pass that returns a reach and folds a best",
  idea: `*The table exists only because the depth pass and the bend pass are separate.* They need not be: at
the moment a node learns both children's reaches — which is exactly when the recursion returns — it
can update the running best **and** hand its own reach upward. One walk, one integer of state, no
table.`,
  intuition: `> **Intuition.** Each node does two different jobs with the same two numbers. To its parent it
> reports *how far down I reach* — a single number, because a path continuing upward can only use one
> of my two sides. To the global best it reports *how long a path bends here* — both sides, joined.
> Reporting one thing and recording the other is the entire trick.

> **Why it works.** Every path bends at exactly one node, and at that node the path is
> \`leftReach + rightReach\`. Since the walk visits every node, every possible bend is offered to
> \`best\` exactly once — so the maximum over all bends is the maximum over all paths. Nothing is
> missed, and nothing is counted as a path that is not one.`,
  worked: `Post-order on the second tree. \`reach\` is what the call returns; \`best\` is the running maximum.

| Call returns | left reach | right reach | bend here | \`best\` after | returns |
|---|---|---|---|---|---|
| \`5\` | \`0\` | \`0\` | \`0\` | \`0\` | \`1\` |
| \`6\` | \`0\` | \`0\` | \`0\` | \`0\` | \`1\` |
| \`3\` | \`1\` | \`1\` | \`2\` | \`2\` | \`2\` |
| \`7\` | \`0\` | \`0\` | \`0\` | \`2\` | \`1\` |
| \`4\` | \`0\` | \`1\` | \`1\` | \`2\` | \`2\` |
| \`2\` | \`2\` | \`2\` | **\`4\`** | **\`4\`** | \`3\` |
| \`1\` | \`3\` | \`0\` | \`3\` | \`4\` | \`4\` |

Row \`2\` is the answer being found, and row \`1\` is the root being offered its own bend of \`3\` and
losing. The returned value and the recorded value differ at every row — that is the thing to see.`,
  code: `def diameter_one_pass(root: Optional[TreeNode]) -> int:
    """Return the reach to the parent; fold the bend into a running best on the way up."""
    best = 0

    def reach(node: Optional[TreeNode]) -> int:
        """Nodes on the longest downward path from \`node\` — 0 for an empty child."""
        nonlocal best
        if node is None:
            return 0
        left = reach(node.left)
        right = reach(node.right)
        best = max(best, left + right)        # the bend: both sides, in edges
        return 1 + max(left, right)           # to the parent: one side only

    reach(root)
    return best`,
  codeNote: `Note the units shift: here \`reach\` counts **nodes** below (\`0\` for empty), which makes
\`left + right\` come out in **edges** with no correction at all. That is not a coincidence to
memorise — it is worth deriving once and then trusting the two examples.`,
  mistake: `> **Watch out.** Returning the answer instead of the reach — writing \`return reach(root)\` and taking
> that as the diameter, or returning \`left + right\` upward. A node's reach and the best bend are two
> different quantities, and the function returns one while recording the other. Conflating them
> returns the tree's **height**: on the statement's first example that is **\`3\`**, which is the right
> answer, so the bug looks fine. On example 2 it returns **\`2\`** where the answer is \`1\`, and on
> example 3, **\`4\`** where the answer is \`3\`.

> **Watch out.** Counting nodes instead of edges — \`best = max(best, left + right + 1)\`. Returns
> **\`4\`** on example 1 and **\`1\`** for a single node, where the answers are \`3\` and \`0\`. The
> statement says edges; a path of \`k\` nodes has \`k - 1\` edges, and the \`+1\` is the classic
> fencepost.

> **In an interview.** Say the two jobs out loud as you write the return: "upward I can only report
> one side, because a path through my parent can only use one of my arms; the two sides together are
> a path that ends here, so that one goes to the answer." That single sentence is the whole solution
> and pre-empts the follow-up.`,
  cost: `- **Time — \`O(n)\`**, one visit per node, and \`depth()\` is never called — measured, the counter stays
  at \`0\`.
- **Space — \`O(h)\`** of call frames and one integer.

**When it is right:** always, and the shape generalises directly. The maximum path sum is this
function with \`max(0, …)\` clamping negative arms; the longest univalue path is this function with an
equality test before extending. Learn the shape, not the answer.

---`,
}
