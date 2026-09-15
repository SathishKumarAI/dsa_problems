// remove-list-elements — approach 2 — Rebuild from the survivors
//
// Converted from docs/deep/remove-list-elements_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "rebuild",
  title: "Rebuild from the survivors",
  idea: `*Restarting re-walks cleared ground — so make one pass and never look back.* Collect the values that
survive into an array, then build a brand-new list out of them. *What does it fix?* The quadratic
collapses to linear, and there is no unlinking to reason about at all. *What does it cost?* Up to \`n\`
brand-new nodes, and the caller's nodes are abandoned.`,
  intuition: `> **Intuition.** Instead of untying knots on the string you were handed, you read the surviving bead
> colours onto a notepad and thread a whole new string. Every difficulty about predecessors, heads
> and adjacency vanishes, because you are not editing anything — you are copying. The tell that this
> is the wrong tool is the return value: the caller passed you a list and got a **different** list
> back, with the same contents. Anything that held a pointer to a surviving node now holds a pointer
> into an orphaned structure.

The reversal detail is the one line worth staring at: \`for v in reversed(kept)\` builds the list back
to front by **prepending**, so the final order comes out forwards. Prepending is itself a reversal,
so iterating the survivors *backwards* is what produces the *forwards* answer.`,
  worked: `\`n0(7) → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\`, \`val = 7\`.

**Pass 1 — collect survivors:**

| node | value | kept? | \`kept\` after |
|---|---|---|---|
| \`n0\` | 7 | no | \`[]\` |
| \`n1\` | 1 | yes | \`[1]\` |
| \`n2\` | 7 | no | \`[1]\` |
| \`n3\` | 7 | no | \`[1]\` |
| \`n4\` | 2 | yes | \`[1, 2]\` |
| \`n5\` | 7 | no | \`[1, 2]\` |

**Pass 2 — prepend in reverse order:**

| step | value | node created | chain so far |
|---|---|---|---|
| start | — | — | \`∅\` |
| 1 | 2 | \`ListNode(2, ∅)\` | \`2 → ∅\` |
| 2 | 1 | \`ListNode(1, →2)\` | \`1 → 2 → ∅\` |

Return the new head. Correct values — and **none of \`n0\`…\`n5\` appears in the result.** Six nodes were
handed in, two fresh ones come back, and all six originals are still wired exactly as they arrived.`,
  code: `def remove_list_elements_rebuild(head: ListNode | None, val: int) -> ListNode | None:
    kept: list[int] = []
    node = head
    while node is not None:
        if node.val != val:
            kept.append(node.val)
        node = node.next
    new_head: ListNode | None = None
    for v in reversed(kept):  # build backwards so the order comes out forwards
        new_head = ListNode(v, new_head)
    return new_head`,
  mistake: `> **Watch out.** The misconception is that the order you iterate is the order you build. It is the
> **opposite**, because prepending buries what came before — so walking the survivors forwards while
> prepending produces the list backwards. The same trap exists in \`reverse-list\`'s copy-to-array rung
> with the signs flipped, which is worth noticing: there, \`reversed()\` was the bug; here, omitting it
> is.

\`\`\`python
    for v in kept:            # WRONG — prepending forwards reverses the list
        new_head = ListNode(v, new_head)
\`\`\`

Measured on the worked example this returns **\`[2, 1]\`** instead of \`[1, 2]\`. It is right for every
list with fewer than two survivors — including \`[7,7,7,7]\` and every single-survivor case — so a
small test suite passes it. The fix is either \`reversed(kept)\` with prepending, or keeping a tail
pointer and appending; choose one and know which reversal you are relying on.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\`. Time is one pass to collect and one to build. Space is the \`kept\`
array plus up to \`n\` new nodes — so it is the most expensive rung here in real memory, worse than the
quadratic one.

Use it when the input **must not be mutated**: a shared list another part of the program is reading,
an immutable structure, a list you hold a const pointer to. Building a filtered copy is then the only
correct move. It is also the natural shape in a functional language or when the result wants to be a
different container entirely. For this problem as stated it is disqualified by nothing except taste
and memory — which is exactly why it is worth being explicit that the remaining rungs keep the
caller's nodes.

---`,
}
