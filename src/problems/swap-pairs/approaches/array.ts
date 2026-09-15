// swap-pairs — approach 2 — Collect the nodes in an array, swap, relink
//
// Converted from docs/deep/swap-pairs_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "array",
  title: "Collect the nodes in an array, swap, relink",
  idea: `*Fine — move the actual nodes. What makes that hard?* Only one thing: to rewire a pair you need to
name the node **after** it, and by the time you have rewritten a link you may have lost it. *So?*
Lay every node pointer out in an array, where every neighbour is addressable by index, swap them
pairwise there, then walk the array writing \`next\` from the new order. *What does it fix?* It really
relinks — the caller's nodes come back in a new order — and it needs \`O(n)\` memory to do it.`,
  intuition: `> **Intuition.** Shunt the carriages onto a siding where you can see the whole train at once and
> reach any carriage directly, do the swaps on the siding, then re-couple the whole train front to
> back in the new order. The reason this is wasteful is worth stating precisely: the array exists so
> the code can *name the node after the pair* — and the pair **already points at it**. You bought a
> second copy of the list's structure to look one step ahead, which the list does in one dereference.

Two details in the loop bounds carry the corner cases. \`range(0, len - 1, 2)\` stops before a lone
final node, so an odd tail is left alone with no \`if\`. And the second loop writes **every** node's
\`next\`, including setting the last one to \`None\` — which matters more than it looks.`,
  worked: `\`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)\`.

**Step 1 — collect:**

| Step | array |
|---|---|
| after the walk | \`[n0, n1, n2, n3, n4]\` |

**Step 2 — swap pairwise, \`i = 0, 2\` (\`range(0, 4, 2)\`):**

| \`i\` | swap | array afterwards |
|---|---|---|
| 0 | \`n0 ↔ n1\` | \`[n1, n0, n2, n3, n4]\` |
| 2 | \`n2 ↔ n3\` | \`[n1, n0, n3, n2, n4]\` |

\`i = 4\` is not reached — \`range\` stops at \`len - 1 = 4\` — so \`n4\` keeps its slot.

**Step 3 — rewrite every \`next\` from the array order:**

| \`i\` | node | \`next\` set to |
|---|---|---|
| 0 | \`n1\` | \`n0\` |
| 1 | \`n0\` | \`n3\` |
| 2 | \`n3\` | \`n2\` |
| 3 | \`n2\` | \`n4\` |
| 4 | \`n4\` | \`None\` ← the one that is easy to forget |

Return \`nodes[0]\` = \`n1\`. Chain: \`n1(2) → n0(1) → n3(4) → n2(3) → n4(5)\`. Correct, and the nodes are
the caller's own — identity audit: \`nodes moved\`.`,
  code: `def swap_pairs_node_array(head: ListNode | None) -> ListNode | None:
    nodes: list[ListNode] = []
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    for i in range(0, len(nodes) - 1, 2):  # \`- 1\` leaves an odd tail alone
        nodes[i], nodes[i + 1] = nodes[i + 1], nodes[i]
    for i, nd in enumerate(nodes):
        nd.next = nodes[i + 1] if i + 1 < len(nodes) else None
    return nodes[0] if nodes else None`,
  codeNote: `The \`if nodes else None\` is not defensive noise — \`nodes\` is empty for the legal input \`head = None\`,
and \`nodes[0]\` would raise \`IndexError\`.`,
  mistake: `> **Watch out.** The misconception is that "relink the array in order" means "point each node at the
> next one", so a loop over \`range(len - 1)\` looks complete. It is not: the **last** node's \`next\`
> still holds whatever it pointed at before the swap, and after an even-length swap that is a node
> now sitting *earlier* in the list. You have built a cycle.

\`\`\`python
    for i in range(len(nodes) - 1):   # WRONG — never clears the last node's next
        nodes[i].next = nodes[i + 1]
\`\`\`

Measured on \`[1, 2, 3, 4]\`: the read-back helper reports **\`RuntimeError: cycle detected while
reading the list back\`**. \`n2\` ends up last in the array, its old \`next\` was \`n3\`, and \`n3\` now sits
at index 2 pointing at \`n2\` — a two-node loop at the end of the list. Without the harness's step
limit the program hangs.

Now the part that makes it dangerous: measured on the **odd** worked example \`[1, 2, 3, 4, 5]\`, the
same buggy code returns the fully correct **\`[2, 1, 4, 3, 5]\`**. On an odd length the last array slot
holds the untouched tail, whose \`next\` was already \`None\`. So the bug is invisible on odd inputs and
hangs on even ones — the signature of a terminator assumption that holds for one parity.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\`. Time is three passes: collect, swap, rewrite. Space is \`n\`
pointers — real memory, though cheaper than \`n\` nodes.

Use it when the permutation you want is **not** a local one. This shape generalises immediately to
"reverse every k", "rotate by k", "interleave two halves" — anything where you want random access to
positions — and for those it is a genuinely reasonable answer. For swapping *adjacent* pairs it is
overkill, because adjacency means the node you need is one dereference away.

---`,
}
