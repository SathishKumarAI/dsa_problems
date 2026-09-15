// inorder-walk — approach 1 — Rebuild the answer at every node.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "rebuild-the-answer-at-every-node",
  title: "Rebuild the answer at every node",
  idea: `*Write the rule down as it is stated and let the return values carry everything.* \`inorder(left) +
[me] + inorder(right)\` is the definition, verbatim, and it needs no helper, no accumulator and no
cursor. It is also the most expensive thing on this page.`,
  intuition: `> **Intuition.** Every node builds a complete answer for its own subtree and hands it upward, where
> it is copied into a bigger one. The root's answer is built by copying the whole left half, then
> the whole right half — and the same copying happened one level down, and the level below that.

> **Under the hood.** \`a + b\` on two Python lists is not a link, it is a **copy**: CPython allocates
> a new list of \`len(a) + len(b)\` and memcpys both sides into it. So this rung does not build one
> list per node — it builds one and then copies it again at every ancestor, which is why a shape
> that visits \`n\` nodes does \`O(n²)\` work on a spine. Counted, a spine of \`200\` builds **401** lists;
> timed on spines of \`200 / 400 / 800\` it takes **95, 284 and 795 microseconds** against the explicit
> stack's **10, 19 and 37**. The stack doubles when \`n\` doubles. This does not.
>
> The general shape is worth more than this problem: in any language, an operation that *returns a
> new container* inside a recursion is paying for the whole container at every level. \`out.append\`
> is \`O(1)\` amortised because CPython over-allocates the list and only occasionally moves it;
> \`list_a + list_b\` has no such escape. The next rung changes one to the other and nothing else.`,
  worked: `On \`[1, null, 2, 3]\`:

| Call | Left returns | Its value | Right returns | Builds |
|---|---|---|---|---|
| \`inorder(3)\` | \`[]\` | \`3\` | \`[]\` | \`[3]\` |
| \`inorder(2)\` | \`[3]\` | \`2\` | \`[]\` | \`[3, 2]\` |
| \`inorder(1)\` | \`[]\` | \`1\` | \`[3, 2]\` | \`[1, 3, 2]\` |

Three real nodes, and six lists built — one per node plus one per empty child.`,
  code: `def inorder_rebuild(root: Optional[TreeNode]) -> list[int]:
    """The rule, verbatim. Every call returns a NEW list."""
    if root is None:
        return []
    return inorder_rebuild(root.left) + [root.val] + inorder_rebuild(root.right)`,
  mistake: `> **Watch out.** Reading this as \`O(n)\` because it visits each node once. It visits each node once
> and **copies** each value once per ancestor. Counted: a spine of \`200\` builds **401** lists, and
> the concatenations copy. Timed against the explicit stack on the same spines — \`95µs / 284µs /
> 795µs\` at \`n\` of \`200 / 400 / 800\`, against \`10µs / 19µs / 37µs\`. The stack doubles as \`n\`
> doubles; this does not.`,
  cost: `- **Time — \`O(n²)\` on a skewed tree**, from the copying, not the visiting.
- **Space — \`O(n²)\`** in lists allocated and discarded.

**When it is right:** when you are writing the definition down to check you believe it, or in a
language where \`++\` on lists is cheap and persistent. In Python it is a teaching rung.

---`,
}
