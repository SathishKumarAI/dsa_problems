// merge-two-sorted — approach 3 — Dummy head and a tail pointer
//
// Converted from docs/deep/merge-two-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "dummy",
  title: "Dummy head and a tail pointer",
  idea: `*The recursion's only job per node was "attach the winner at the current end" — can a pointer track
that end instead of a stack frame?* Yes: keep a \`tail\` pointer at the last node of the answer so far
and attach each winner there. *What does it fix?* It removes the \`O(n+m)\` stack entirely — same
comparisons, same splices, same linear time, with two local pointers instead of a hundred frames.`,
  intuition: `> **Intuition.** A zipper. Two sorted chains lie side by side and you repeatedly pull whichever front
> tooth is smaller into the finished zip, then advance that side. The finished half grows from one
> end only, so all you ever need to know about it is where its bottom is — one pointer, \`tail\`,
> rather than a stack of frames each remembering the same thing.

> **Why it works.** The same exchange argument as the recursion, now maintained by a loop invariant:
> **everything already attached after the dummy is sorted, and every value still in \`a\` or \`b\` is at
> least as large as the last node attached.** The smaller of the two fronts is therefore the smallest
> node left anywhere, so a purely local comparison makes a globally correct choice, every time — the
> merge never needs to look past the two front nodes. The **dummy head** buys the other half: without
> it the first attachment is special (there is no tail yet), forcing
> \`if result is None: result = winner else: tail.next = winner\` — a branch that is true exactly once
> and checked every iteration. One throwaway node makes \`tail.next = winner\` correct from the first
> iteration onwards, and \`dummy.next\` is the real head at the end.

The loop ends when either list is exhausted, and \`tail.next = a or b\` then finishes the job in one
assignment rather than a loop. Whatever remains is a sorted chain whose every value is \`>=\` everything
already placed, so it attaches wholesale; if both are exhausted, \`a or b\` is \`None\`, which correctly
terminates the result.`,
  worked: `\`a = 1 → 3 → 5\`, \`b = 2 → 4\`. State shown *after* each iteration. \`D\` is the dummy.

| Iter | \`a\` front | \`b\` front | comparison | attached | \`tail\` now at | result chain (after D) | \`a\` remaining | \`b\` remaining |
|---|---|---|---|---|---|---|---|---|
| start | 1 | 2 | — | — | \`D\` | *(empty)* | \`1→3→5\` | \`2→4\` |
| 1 | 1 | 2 | \`1 <= 2\` | node 1 | node 1 | \`1\` | \`3→5\` | \`2→4\` |
| 2 | 3 | 2 | \`3 > 2\` | node 2 | node 2 | \`1→2\` | \`3→5\` | \`4\` |
| 3 | 3 | 4 | \`3 <= 4\` | node 3 | node 3 | \`1→2→3\` | \`5\` | \`4\` |
| 4 | 5 | 4 | \`5 > 4\` | node 4 | node 4 | \`1→2→3→4\` | \`5\` | \`∅\` |

\`b\` is now \`None\`, so the loop exits. \`tail.next = a or b\` attaches the remaining \`5 → ∅\` in one
assignment: \`1 → 2 → 3 → 4 → 5\`. Return \`dummy.next\` = node 1. Two pointers were live throughout,
regardless of list length.`,
  code: `def merge_two_sorted_dummy_head(
    a: ListNode | None, b: ListNode | None
) -> ListNode | None:
    dummy = tail = ListNode(0)  # throwaway node: makes the first attach need no special case
    while a is not None and b is not None:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next  # forgetting this line overwrites the result every iteration
    tail.next = a or b  # whatever survives is sorted and all larger — attach it whole
    return dummy.next   # the dummy itself is discarded`,
  mistake: `> **Watch out.** The misconception is that \`tail.next = winner\` *extends* the result, so advancing
> \`tail\` is tidying-up you can do later. The assignment does not extend anything — it **overwrites**
> whatever \`tail\` was pointing forward at. \`tail\` means "the last node of the answer so far", and an
> assignment that changes the answer without changing \`tail\` has made that claim false.

Forgetting \`tail = tail.next\`. The loop still runs the right number of times and picks the right
winners, but every winner is attached to the *same* node — the dummy — so each overwrites the last,
and the final \`tail.next = a or b\` overwrites even that. On the worked example this returns **\`[5]\`**:
a one-element list, no exception, no warning.

A close relative: exiting the loop and forgetting \`tail.next = a or b\` entirely. That truncates the
answer where the shorter list ran out — on the worked example it returns **\`[1, 2, 3, 4]\`**, silently
losing the 5. Worse, if \`tail.next\` still holds a stale pointer from the input list, the result can be
correct by accident on some inputs and wrong on others.`,
  cost: `**Time** \`O(n + m)\`, **space** \`O(1)\`. Every iteration permanently places exactly one node into the
result and advances past it, so the loop runs at most \`n + m\` times with constant work each; the final
remainder attach is one assignment regardless of how long the remainder is. Space is the dummy node
plus two pointers — constant, and the dummy is freed the moment you return.

**This is the one to ship.** It meets the splice requirement, it is optimal in both time and space, and
it is the exact subroutine that merge-sort on linked lists and merge-k-sorted-lists are built out of.
There is no input size at which another approach here is preferable.

---`,
}
