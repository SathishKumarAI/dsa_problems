// remove-list-elements — approach 5 — A dummy node makes the head an ordinary node
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
  rung: "dummy",
  title: "A dummy node makes the head an ordinary node",
  idea: `*Both remaining problems are the head's: it needs its own loop because it has no predecessor.* So
give it one. Allocate one throwaway node pointing at the head, stand \`prev\` on it, and every node in
the list — head included — is now somebody's \`next\`. *What does it fix?* The head loop disappears,
the predicate is written once, and the answer is read off \`dummy.next\`, which is correct whether
nothing was removed, the front was removed, or the entire list was.`,
  intuition: `> **Intuition.** You cannot cut the knot in front of the first bead because there is no knot there —
> so tie the string to a **peg**. Now the first bead is knotted to the peg exactly as every other
> bead is knotted to its predecessor, the scissors always have somewhere to stand, and at the end you
> do not ask whether the front changed: you ask the peg what it is holding.

This is the shared punchline of three problems in this pattern. *remove-nth-from-end* needs it
because the node to delete may be the head. *swap-pairs* needs it because the first pair changes the
head. This one needs it because the head may match — and so may its replacement. **The head is the
only node with nothing in front of it; invent something and the special case stops existing.**

> **Why it works.** Two invariants, and they are the two traps, resolved. *(1)* \`prev\` is always a
> real node, never \`None\`, so \`prev.next\` is always a legal place to write — which is what makes the
> head an ordinary case. *(2)* Everything from \`dummy.next\` through \`prev\` is final and
> match-free; \`prev.next\` is unjudged. Unlinking keeps \`prev\` final and leaves a fresh unjudged node
> at \`prev.next\`, so \`prev\` must not move; keeping means \`prev.next\` is judged and final, so \`prev\`
> may move onto it. The loop terminates because every iteration either shortens the list or advances
> \`prev\`, and both are bounded by \`n\`.`,
  worked: `\`n0(7) → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\`, \`val = 7\`, with \`dummy → n0\` prepended and
\`prev = dummy\`. Measured, iteration by iteration:

| Iteration | \`prev\` | \`prev.next\` | verdict | action | list from \`dummy\` |
|---|---|---|---|---|---|
| start | \`dummy\` | \`n0\` (7) | — | — | \`dummy → n0(7) → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\` |
| 1 | \`dummy\` | \`n0\` (7) | match | unlink, **stay** | \`dummy → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\` |
| 2 | \`dummy\` | \`n1\` (1) | keep | advance to \`n1\` | \`dummy → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\` |
| 3 | \`n1\` | \`n2\` (7) | match | unlink, **stay** | \`dummy → n1(1) → n3(7) → n4(2) → n5(7)\` |
| 4 | \`n1\` | \`n3\` (7) | match | unlink, **stay** | \`dummy → n1(1) → n4(2) → n5(7)\` |
| 5 | \`n1\` | \`n4\` (2) | keep | advance to \`n4\` | \`dummy → n1(1) → n4(2) → n5(7)\` |
| 6 | \`n4\` | \`n5\` (7) | match | unlink, **stay** | \`dummy → n1(1) → n4(2)\` |

\`prev.next\` is \`None\` → the loop ends. Return \`dummy.next\` = \`n1\`. Result \`[1, 2]\`, in **six
iterations for six nodes** — one per node, exactly.

Now read iteration 1 against Approach 4's head-strip table. Same work, same result, but here it is
*the same code path* as iterations 3, 4 and 6. The head loop did not get handled; it stopped
existing. And the second statement example makes the point even harder — on \`[7,7,7,7]\` with
\`val = 7\`, iterations 1 to 4 all read \`prev = dummy\`, each unlinking the new front, and \`dummy.next\`
ends as \`None\`. **Returning the empty list requires no branch**, because the answer was never \`head\`
in the first place.`,
  code: `def remove_list_elements_dummy(head: ListNode | None, val: int) -> ListNode | None:
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None:
        if prev.next.val == val:
            prev.next = prev.next.next  # do NOT advance: the node that slid in may match
        else:
            prev = prev.next
    return dummy.next`,
  codeNote: `Six lines, one loop, one copy of the predicate, no head case, no empty-list case. Apply the
modularity test: to change **what counts as a match**, there is exactly one expression to edit —
\`prev.next.val == val\` — and nothing else in the function moves. Approach 4 has two.`,
  mistake: `> **Watch out.** Two misconceptions, and both are about what the answer *is*. The first: \`head\` is
> not the list, it is a variable pointing at one node, and after a removal at the front that node is
> no longer in the list — but it still points into it, so returning it **resurrects the node you just
> deleted**. The second is the don't-advance rule again, which here fails differently: with a dummy,
> advancing unconditionally walks \`prev\` onto \`None\`.

Returning \`head\` instead of \`dummy.next\`:

\`\`\`python
    return head    # WRONG — say dummy.next
\`\`\`

Measured on the worked example this returns **\`[7, 1, 2]\`**: \`dummy.next\` was correctly set to \`n1\`,
but \`n0.next\` was never touched, so walking from \`n0\` finds the cleaned list with the deleted head
stuck on the front. Measured on \`[7, 7, 7, 7]\` with \`val = 7\` it returns **\`[7, 7, 7, 7]\`** — the
original list, wholly unchanged, because \`n0\`, \`n1\` and \`n2\` all still point forwards even though
\`dummy.next\` is \`None\`. A function that reports success and changes nothing is the failure mode this
one token prevents.

Advancing unconditionally:

\`\`\`python
    while prev.next is not None:
        if prev.next.val == val:
            prev.next = prev.next.next
        prev = prev.next          # WRONG — no \`else\`
\`\`\`

Measured on the worked example this raises **\`AttributeError: 'NoneType' object has no attribute
'next'\`**. Iteration 6 unlinks the trailing \`n5\`, making \`prev.next\` \`None\`, and then advances \`prev\`
onto that \`None\` — and the loop test dereferences it. So the missing \`else\` shows up here as a crash
rather than as Approach 4's silent \`[1, 7, 2]\`, which is the one mercy of the dummy version: the same
bug fails loudly.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Time is one pass and exactly one iteration per node — each
iteration either deletes a node or advances \`prev\`, and each of those can happen at most \`n\` times.
Space is one extra node plus one pointer, allocated once regardless of length. In C++ make it a stack
local (\`ListNode dummy(0, head);\`) and it costs nothing to allocate and nothing to free.

**This is the one to write.** It is not asymptotically better than Approach 4 — both are \`O(n)\` time
and \`O(1)\` space — and that is the point worth understanding: the last rung on this ladder is not a
performance win, it is a **surface-area win.** One loop instead of two, one predicate instead of two,
no head case, no empty case, no branch on the return. Every one of those deleted things was a place a
bug could live, and the measured bugs above show three of them actually doing so.

---`,
}
