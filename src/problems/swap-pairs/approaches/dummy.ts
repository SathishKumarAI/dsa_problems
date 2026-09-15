// swap-pairs — approach 5 — A dummy node makes every pair an ordinary pair
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
  rung: "dummy",
  title: "A dummy node makes every pair an ordinary pair",
  idea: `*Both of Approach 4's branches trace to the same fact: the head has nothing in front of it. So put
something in front of it.* Allocate one throwaway node pointing at the head, keep \`prev\` on it, and
the first pair now has a predecessor exactly like every other pair. *What does it fix?* It deletes
the \`if prev is not None\`, deletes the captured \`new_head\`, deletes the up-front \`if head is None or
head.next is None\` — and the answer is whatever \`dummy.next\` happens to be at the end, which is
correct for the empty list, the one-node list and every list with pairs, all without a branch.`,
  intuition: `> **Intuition.** The train has no coupling at the front, so bolt on an empty locomotive. Now *every*
> pair is "the two carriages after something", the swap is the same three assignments every single
> time, and at the end you do not ask whether the front changed — you ask the locomotive what it is
> pulling. This is the same move that makes *remove-nth-from-end* and *remove-list-elements*
> single-branch loops, and it is the punchline all three problems share: **the head is the only node
> with nothing in front of it, so invent something.**

> **Why it works.** The loop test \`prev.next is not None and prev.next.next is not None\` asks
> exactly the right question — *are there two nodes ahead of \`prev\`?* — and asks it about \`prev\`,
> which is always a real node, never \`None\`. So it covers the empty list (\`dummy.next\` is \`None\`), the
> one-node list (\`dummy.next.next\` is \`None\`), and the odd tail, all with the same expression. The
> three assignments maintain one invariant: **everything before \`prev\` is finished and correctly
> linked, everything from \`prev.next\` onward is untouched original list.** \`prev = first\` re-establishes
> it, because \`first\` is the node now sitting at the back of the completed pair.`,
  worked: `\`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)\`, with \`dummy → n0\` prepended and \`prev = dummy\`. Each
iteration's three assignments in order, measured:

| Iteration | \`prev\` | \`first\` | \`second\` | third (\`second.next\`) | \`first.next ←\` | \`second.next ←\` | \`prev.next ←\` | \`prev\` after | chain from \`dummy\` |
|---|---|---|---|---|---|---|---|---|---|
| start | \`dummy\` | — | — | — | — | — | — | \`dummy\` | \`dummy → n0(1) → n1(2) → n2(3) → n3(4) → n4(5)\` |
| 1 | \`dummy\` | \`n0\` | \`n1\` | \`n2\` | \`n2\` | \`n0\` | \`n1\` | \`n0\` | \`dummy → n1(2) → n0(1) → n2(3) → n3(4) → n4(5)\` |
| 2 | \`n0\` | \`n2\` | \`n3\` | \`n4\` | \`n4\` | \`n2\` | \`n3\` | \`n2\` | \`dummy → n1(2) → n0(1) → n3(4) → n2(3) → n4(5)\` |

The test now fails: \`prev\` is \`n2\`, \`prev.next\` is \`n4\`, and \`prev.next.next\` is \`None\`. Return
\`dummy.next\` = \`n1\`.

Final measured chain: **\`n1(2) → n0(1) → n3(4) → n2(3) → n4(5) → ∅\`**. Compare the identity column
with Approach 1's: there the order stayed \`n0, n1, n2, n3, n4\` and only the values moved. Here the
nodes themselves are in a new order — the same order, node for node, that the array and the recursion
produced. That agreement across three structurally different implementations is what the harness
checks.

Note also what iteration 1 did *not* need: no \`if\`. \`prev.next = second\` ran on the first pair exactly
as it ran on the second, because \`prev\` was a real node holding a real link. That one assignment
is the whole justification for the extra node.`,
  code: `def swap_pairs_dummy(head: ListNode | None) -> ListNode | None:
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None and prev.next.next is not None:
        first = prev.next
        second = first.next
        first.next = second.next  # save the rest of the list before overwriting
        second.next = first
        prev.next = second
        prev = first  # \`first\` is now the BACK of the swapped pair
    return dummy.next`,
  codeNote: `Zero conditionals. Compare with Approach 4's three.`,
  mistake: `> **Watch out.** Two misconceptions live here, and both are about *reading a pointer you have already
> overwritten*. The assignments look like three independent facts to record; they are a sequence in
> which \`second.next\` is read once and written once, and the read must come first. Separately, the
> loop guard must ask about **two** nodes ahead, not one — a guard that tests only \`prev.next\`
> dereferences \`None\` the moment it meets an odd tail.

Getting the assignment order wrong:

\`\`\`python
        second.next = first       # WRONG — second.next was the third node; now it is \`first\`
        first.next = second.next  # so this reads \`first\`, making first point at ITSELF
        prev.next = second
\`\`\`

Measured on \`[1, 2, 3, 4, 5]\`: \`first.next\` becomes \`first\`, so \`n0\` points at itself. The function
**never terminates** — \`prev\` becomes \`n0\`, \`prev.next\` is \`n0\` and \`prev.next.next\` is \`n0\` forever,
so the \`while\` spins without a single further change. Capped at 20 iterations to observe it, the
chain reads \`n1(2) → n0(1) → n0(1) → …\` with \`n0.next is n0\` confirmed \`True\`. Not a crash, not a
wrong answer — a hang, which is the hardest failure to diagnose from a bug report.

And the guard:

\`\`\`python
    while prev.next is not None:   # WRONG — needs prev.next.next too
\`\`\`

Measured: on \`[1, 2, 3, 4]\` it returns the fully correct **\`[2, 1, 4, 3]\`**, and on \`[1, 2, 3, 4, 5]\`
it raises **\`AttributeError: 'NoneType' object has no attribute 'next'\`** — \`second\` is \`None\` at the
lone tail and \`second.next\` explodes. Right on every even input, crashing on every odd one. The
statement's second example exists to catch precisely this, which is why it carries a note about it.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Time is one pass with three pointer writes per pair — \`⌊n/2⌋\`
iterations, so about \`1.5n\` writes. Space is one extra node plus three pointers; the node is
allocated once and does not grow with \`n\`. In C++ make it a stack local (\`ListNode dummy(0, head);\`)
and it costs nothing to allocate and nothing to free.

**This is the one to write.** It satisfies the relinking requirement, handles 0, 1 and odd lengths
with one loop test, needs no captured answer, and — the reason that matters most under interview
pressure — it contains **no conditionals**, so there is no branch to get wrong. Every other rung on
this ladder is either the wrong answer, linear in space, or carries a head branch; this one is none
of those.

---`,
}
