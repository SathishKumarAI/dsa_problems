// swap-pairs — approach 4 — A loop with a `prev` pointer, head special-cased
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
  rung: "prev",
  title: "A loop with a `prev` pointer, head special-cased",
  idea: `*Recursion opens a stack frame per pair to remember one thing — the node before the pair — so hold
that in a variable instead.* Walk with \`prev\` trailing the pair; after each swap, \`prev\` is the node
that is now at the *back* of the swapped pair. *What does it fix?* The \`O(n/2)\` stack becomes two
pointers. *What does it still cost?* Two branches, both caused by the head: you must capture the
answer before the first swap destroys it, and you must skip the \`prev\` relink on the first pair
because there is nothing behind it.`,
  intuition: `> **Intuition.** Three links change per swap: the pair's two, and one belonging to the node *in front
> of* the pair — it must be told that the pair's order changed. Every pair has such a node except the
> first, so the loop is uniform for pairs two onwards and lopsided for pair one. Notice too that
> \`new_head\` has to be grabbed on the way in: after the first swap, \`head\` is no longer the head and
> \`head.next\` no longer points where it did, so the answer is unrecoverable a line later.

The \`prev = node\` line is the one people stare at. After the swap, \`node\` — which was \`first\` — sits
**behind** \`second\`, so it is the node in front of the *next* pair. Then \`node = node.next\` steps
onto the next pair's first node. Both of those read strangely and both are right; walk them on the
table below rather than trusting the prose.`,
  worked: `\`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)\`. \`new_head = head.next = n1\` is captured first, before
anything moves.

| Iteration | \`node\` | \`second\` | \`node.next ←\` | \`second.next ←\` | \`prev\` relink | \`prev\` after | \`node\` after | chain from \`new_head\` |
|---|---|---|---|---|---|---|---|---|
| 1 | \`n0\` | \`n1\` | \`n2\` | \`n0\` | **skipped**, \`prev\` is \`None\` | \`n0\` | \`n2\` | \`n1(2) → n0(1) → n2(3) → n3(4) → n4(5)\` |
| 2 | \`n2\` | \`n3\` | \`n4\` | \`n2\` | \`n0.next = n3\` | \`n2\` | \`n4\` | \`n1(2) → n0(1) → n3(4) → n2(3) → n4(5)\` |

The guard \`node is not None and node.next is not None\` now fails: \`node\` is \`n4\` and \`n4.next\` is
\`None\`. Return \`new_head\` = \`n1\`. Measured chain matches the answer exactly, and the odd tail \`n4\`
was never touched.

Read the "\`prev\` relink" column: it is skipped exactly once, on the first pair, forever. That single
skipped assignment plus the captured \`new_head\` are the two branches Approach 5 deletes.`,
  code: `def swap_pairs_prev_pointer(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head
    new_head = head.next  # must be captured before the first swap destroys the link
    prev: ListNode | None = None
    node: ListNode | None = head
    while node is not None and node.next is not None:
        second = node.next
        node.next = second.next
        second.next = node
        if prev is not None:  # the first pair has nothing behind it
            prev.next = second
        prev = node
        node = node.next
    return new_head`,
  codeNote: `Three conditionals in nine lines — the \`if\` guard at the top, the \`if prev is not None\` inside, and
the two-part loop test — and **two of the three exist only because the head has no predecessor.**`,
  mistake: `> **Watch out.** The misconception is that \`head\` still means "the front of the list" after the loop
> runs. It does not. \`head\` is a local variable pointing at a particular node, and that node has just
> been demoted to second place. Returning it hands back a list that is missing its first element and
> — worse — is missing a different element depending on parity.

\`\`\`python
    while node is not None and node.next is not None:
        ...
    return head        # WRONG — head is now the SECOND node
\`\`\`

Measured on the worked example \`[1, 2, 3, 4, 5]\` this returns **\`[1, 4, 3, 5]\`** — one node short and
scrambled, because the walk starts from \`n0\`, which now points at \`n3\`. On the even input
\`[1, 2, 3, 4]\` it returns **\`[1, 4, 3]\`**. Neither raises. The reason \`new_head\` has to be captured
before the loop rather than derived after it is that there is no expression for "the second node I
was originally given" once the first swap has run.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Time is one pass, three pointer writes per pair. Space is
\`prev\`, \`node\`, \`second\` — three variables regardless of length.

Use it when you cannot allocate the extra node at all: a \`no_std\` embedded context, an arena with no
spare slot, a language where the fake node is genuinely awkward to construct. It is the correct
answer in that world, and it is why the rung exists rather than being skipped. Everywhere else,
prefer the next one — the two branches this version carries are both bug sites, and the next rung
buys them away for one throwaway node.

---`,
}
