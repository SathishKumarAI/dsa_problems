// reverse-list — approach 1 — Copy to an array, rebuild
//
// Converted from docs/deep/reverse-list_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "copy",
  title: "Copy to an array, rebuild",
  idea: `*What is the most direct thing that could possibly work?* Read every value into a Python list, then
build a fresh chain by pushing those values onto the front of a growing list one at a time — pushing
front-to-back onto the front is itself a reversal. *Why is that not the answer?* Because it allocates
\`n\` brand-new nodes and returns a different list from the one you were given, which is precisely what
"in place" forbids.`,
  intuition: `> **Intuition.** The linked list is an awkward container and the array is a comfortable one, so the
> move is: escape to the comfortable container, do the easy thing there, come back. Except the "easy
> thing" is not even \`vals.reverse()\` — it is noticing that a chain built by repeatedly **prepending**
> comes out backwards for free, because the first value you prepend ends up deepest. You paid \`O(n)\`
> memory to buy an indexable structure and then never indexed into it.

That last part is the tell that this rung is wasteful: it takes a detour and then does not use what the
detour bought.`,
  worked: `Input: \`1 → 2 → 3 → 4 → ∅\`.

**Pass 1 — drain the values:**

| Step | \`head\` points at | \`vals\` after |
|---|---|---|
| start | node 1 | \`[]\` |
| 1 | node 2 | \`[1]\` |
| 2 | node 3 | \`[1, 2]\` |
| 3 | node 4 | \`[1, 2, 3]\` |
| 4 | \`None\` | \`[1, 2, 3, 4]\` |

**Pass 2 — prepend each value onto a new chain:**

| Step | value \`v\` | new node created | \`new_head\` chain afterwards |
|---|---|---|---|
| start | — | — | \`∅\` |
| 1 | 1 | \`ListNode(1, ∅)\` | \`1 → ∅\` |
| 2 | 2 | \`ListNode(2, →1)\` | \`2 → 1 → ∅\` |
| 3 | 3 | \`ListNode(3, →2)\` | \`3 → 2 → 1 → ∅\` |
| 4 | 4 | \`ListNode(4, →3)\` | \`4 → 3 → 2 → 1 → ∅\` |

Return \`new_head\`, the node holding 4. All four original nodes still exist, untouched and still
pointing forwards — **eight** nodes now live where four did.`,
  code: `def reverse_list_copy_to_array(head: ListNode | None) -> ListNode | None:
    vals: list[int] = []
    while head is not None:
        vals.append(head.val)
        head = head.next
    new_head: ListNode | None = None
    for v in vals:
        new_head = ListNode(v, new_head)  # prepending in original order reverses it
    return new_head`,
  mistake: `> **Watch out.** The misconception is that the reversal has to appear *somewhere you can see it*, so
> the loop should read \`reversed(vals)\`. The reversal is already there, hidden in the **prepend** —
> and two reversals are no reversal at all.

Writing \`for v in reversed(vals)\` because "we want it reversed" returns **\`[1, 2, 3, 4]\`** on the
worked example: a faithful copy of the *original* order, allocated fresh. Nothing raises, because both
the iteration and the construction are individually correct. If you find yourself reaching for
\`reversed()\` here, you have not noticed that prepending is already a reversal.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\`. Time is one walk to drain plus one loop to rebuild — two linear
passes. Space is the \`vals\` array of \`n\` integers **plus** \`n\` freshly allocated nodes.

Use it when the nodes are not yours to modify — a shared or immutable structure another part of the
program is still reading, or a list you hold a const pointer to. Building a reversed copy is then the
only correct move, and the allocation is the price of not mutating someone else's data. For this
problem as stated it is the honest baseline: write it in thirty seconds, then say why you are not
shipping it.

---`,
}
