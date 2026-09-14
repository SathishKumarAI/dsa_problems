// reverse-list — approach 2 — Recursion
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
  rung: "recurse",
  title: "Recursion",
  idea: `*The array version allocated a whole second list — can we rewire the nodes that are already there?*
Yes: assume a helper can reverse everything after the head, then all that remains is hooking the head
onto the back of that reversed remainder. *What does it fix, and what does it still cost?* It fixes the
allocation — no new nodes, the originals rewired in place — but it replaces the array with a stack of
\`n\` calls, so the memory moved rather than disappeared.`,
  intuition: `> **Intuition.** You are last in a queue and you want the queue turned around. Rather than do it
> yourself, you tap the person in front and say "turn everyone ahead of you around, then tell me who
> ended up at the front." When they hand that back, the queue ahead of you is reversed and the person
> you tapped is now standing at its *back* — so you walk around and stand behind them, and the
> name you were handed is still the front of the whole queue. That is the entire function: one tap,
> one step, pass the name along unchanged.

Concretely, \`head.next\` is the node you handed to the recursion, and after the call it is the reversed
chain's **final** node — because you never changed \`head\`'s own arrow. So hooking \`head\` on is one
assignment, \`head.next.next = head\`, followed by \`head.next = None\` because \`head\` is now the tail and
a tail points at nothing. The trick to holding this in your head is that double \`.next\`.`,
  worked: `Input: \`1 → 2 → 3 → 4 → ∅\`.

**Winding down** (nothing is rewired yet; each call just goes deeper):

| Call | \`head\` | action |
|---|---|---|
| \`reverse(1)\` | node 1 | not the base case, call \`reverse(2)\` |
| \`reverse(2)\` | node 2 | not the base case, call \`reverse(3)\` |
| \`reverse(3)\` | node 3 | not the base case, call \`reverse(4)\` |
| \`reverse(4)\` | node 4 | \`head.next is None\` → **base case**, return node 4 |

**Unwinding** (now every frame does its one assignment):

| Returning into | \`new_head\` | \`head.next\` is | \`head.next.next = head\` makes | \`head.next = None\` leaves | chain now |
|---|---|---|---|---|---|
| \`reverse(3)\` | node 4 | node 4 | \`4 → 3\` | \`3 → ∅\` | \`4 → 3 → ∅\`, and \`1 → 2 → 3\` still ahead of it |
| \`reverse(2)\` | node 4 | node 3 | \`3 → 2\` | \`2 → ∅\` | \`4 → 3 → 2 → ∅\` |
| \`reverse(1)\` | node 4 | node 2 | \`2 → 1\` | \`1 → ∅\` | \`4 → 3 → 2 → 1 → ∅\` |

Final return: node 4. Four stack frames were live at the deepest point, and \`new_head\` never changed
once set.`,
  code: `def reverse_list_recursive(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head  # empty list, or the last node — already reversed
    new_head = reverse_list_recursive(head.next)
    head.next.next = head  # head.next is the TAIL of the reversed remainder
    head.next = None       # head becomes the new tail; without this the last two nodes loop
    return new_head        # unchanged all the way up: the deepest node`,
  mistake: `> **Watch out.** The misconception is that \`head.next = None\` is **cleanup** — tidying a pointer that
> is about to be overwritten anyway. It is not cleanup, it is the *second half of one edit*:
> \`head.next.next = head\` adds an arrow without removing the one pointing the other way, and a pair of
> nodes pointing at each other is a cycle, not a list.

Forgetting it leaves every other line looking right and the function still returning the correct head.
But after \`head.next.next = head\`, node 1 still points at node 2 *and* node 2 now points at node 1.
Walking the result on the worked example yields:

\`\`\`
4, 3, 2, 1, 2, 1, 2, 1, …        forever
\`\`\`

Nothing raises — it hangs the first thing that tries to walk the result, which is usually your own test
helper, and it looks like an infinite loop somewhere else entirely. Under this document's guarded
\`to_list\` it surfaces as \`RuntimeError: cycle detected while reading the list back\`, which is the whole
reason that step limit is in the harness.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\` on the call stack. Time is one frame per node, each doing constant
work. The space is not an array you can see — it is the interpreter's **stack**, one frame per node,
all live at once at the deepest point. That is why \`0 <= list length <= 5000\` disqualifies it: 5000
frames blows Python's default 1000-frame limit outright.

Use it when the list is guaranteed short and the recursive form is genuinely clearer to the reader, or
in a language with tail-call elimination *after* restructuring it to exploit that — as written it is
not tail-recursive, because the work happens after the call. In an interview, write it to show you can,
then say the sentence about stack depth before anyone asks.

---`,
}
