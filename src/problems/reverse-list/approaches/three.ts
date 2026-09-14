// reverse-list — approach 3 — Three pointers, iterative and in place
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
  rung: "three",
  title: "Three pointers, iterative and in place",
  idea: `*Recursion's only real job was to remember the node behind the current one — can a variable do that
instead of a stack frame?* Yes, and that collapses the whole thing into a loop: hold the node behind
you (\`prev\`), the node you are on (\`curr\`), and — because you are about to destroy the forward arrow —
a saved copy of the node ahead (\`nxt\`). *What does it fix?* Recursion's \`O(n)\` stack: the same rewiring
happens with exactly three variables alive at any moment, no matter how long the list.`,
  intuition: `> **Intuition.** You are walking the chain re-tying a rope behind you. At each node you do three things
> in a fixed order: **remember where you were going, point backwards, step forward.** The order *is*
> the algorithm — you must save \`curr.next\` before you overwrite it, because overwriting it is how you
> point backwards, and once it is gone the rest of the list is unreachable.

> **Why it works.** One loop invariant, true before and after every iteration: **\`prev\` heads a fully
> reversed prefix, \`curr\` heads the still-untouched suffix in its original order, and the two halves
> are not connected to each other.** It holds at the start — \`prev\` is \`None\`, an empty reversed
> prefix, and \`curr\` is the whole list. Each iteration moves exactly one node across the boundary and
> restores it, which is why \`nxt\` has to exist at all: \`curr.next = prev\` is the move, and it destroys
> the only reference to the suffix, so you save it on the line before. When the loop ends \`curr\` is
> \`None\` — the suffix is empty, so the reversed prefix is the whole list — and \`prev\` is sitting on the
> last node visited, the original tail, which is the new head. The initial \`None\` in \`prev\` does
> double duty: it becomes the original head's \`next\`, exactly what the new tail needs, and it is the
> answer returned for an empty list without a single \`if\`.`,
  worked: `Input: \`1 → 2 → 3 → 4 → ∅\`. State is shown *after* each full iteration.

| Iteration | \`nxt\` saved | \`curr.next\` set to | \`prev\` | \`curr\` | reversed part so far | untouched part |
|---|---|---|---|---|---|---|
| start | — | — | \`∅\` | node 1 | \`∅\` | \`1 → 2 → 3 → 4 → ∅\` |
| 1 | node 2 | \`∅\` | node 1 | node 2 | \`1 → ∅\` | \`2 → 3 → 4 → ∅\` |
| 2 | node 3 | node 1 | node 2 | node 3 | \`2 → 1 → ∅\` | \`3 → 4 → ∅\` |
| 3 | node 4 | node 2 | node 3 | node 4 | \`3 → 2 → 1 → ∅\` | \`4 → ∅\` |
| 4 | \`None\` | node 3 | node 4 | \`None\` | \`4 → 3 → 2 → 1 → ∅\` | — |

The loop test \`while curr\` now fails. Return \`prev\` = node 4. Read the last two columns as the
invariant: they never overlap, and every row moves exactly one node from right to left.`,
  code: `def reverse_list_three_pointer(head: ListNode | None) -> ListNode | None:
    prev: ListNode | None = None  # also becomes the original head's new next — the terminator
    curr = head
    while curr is not None:
        nxt = curr.next   # must be saved BEFORE the next line destroys it
        curr.next = prev
        prev, curr = curr, nxt
    return prev  # curr fell off the end; prev is the last node visited = the new head`,
  mistake: `> **Watch out.** The misconception is that \`nxt = curr.next\` **reads** something durable, so its
> position among the three lines is a matter of taste. \`curr.next\` is the only reference to the rest of
> the list, and \`curr.next = prev\` is what overwrites it — so the two lines are ordered by *necessity*,
> not style.

Writing \`curr.next = prev\` before saving \`nxt\`:

\`\`\`python
while curr is not None:
    curr.next = prev       # WRONG — the rest of the list just became unreachable
    nxt = curr.next        # this now reads prev, not the node ahead
    prev, curr = curr, nxt
\`\`\`

\`nxt\` now reads back the \`prev\` that was just written, so after the first iteration \`curr\` becomes
\`None\` and the loop exits. On the worked example this returns **\`[1]\`** — nodes 2, 3 and 4 still exist
but nothing points at them. No exception, no crash, just a list of length 1, which is why this bug
survives a quick eyeball review. The discipline it teaches generalises past this problem: in any
pointer rewiring, save what you are about to overwrite on the line before you overwrite it.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Time is one visit per node doing three constant-time assignments.
Space is genuinely constant: \`prev\`, \`curr\` and \`nxt\` are the only extra storage, and there are three
of them whether the list holds 4 nodes or 5000.

**This is the one to ship.** It satisfies the in-place requirement, survives the 5000-node upper bound
that the recursion cannot, and handles the empty list without a special case. There is no scenario in
this problem where another approach beats it — the others exist to explain why this one is shaped the
way it is.

---`,
}
