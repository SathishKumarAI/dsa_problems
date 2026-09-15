// merge-two-sorted — approach 2 — Recursion
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
  rung: "recurse",
  title: "Recursion",
  idea: `*Sorting rediscovered an order we were already given — how do we use it instead?* Compare only the two
front nodes: the smaller one is definitively the first node of the answer. *What does this fix?* The
wasted \`log\` factor and the allocation, both at once — every node keeps its identity and is simply
re-pointed. What it still costs is one stack frame per node.`,
  intuition: `> **Intuition.** Two queues at a ticket window, each already in height order, and one rule: whoever is
> shorter of the two people at the front goes through next. You never need to look down either queue,
> because anyone behind a front person is taller than them. Let that person through, and what is left
> is the same puzzle with two slightly shorter queues — so hand the rest of the job to someone
> else, and simply remember that the person you let through stands in front of whatever they produce.

> **Why it works.** The exchange argument: suppose the answer's first node were some node \`x\` other
> than the smaller of the two fronts, call that \`f\`. Then \`f\` sits later in the answer than \`x\`, so
> \`f.val >= x.val\`. But \`x\` lies in one of the two lists, at or behind that list's front, so
> \`x.val >= \` that front's value \`>= f.val\` — forcing \`x.val == f.val\`, and swapping \`x\` for \`f\`
> yields an equally sorted answer. So taking \`f\` greedily never loses, and with \`<=\` it is the
> **stable** choice. The base case pays the sortedness a second time: if one list is empty the *entire*
> other list is already the answer, returned in a single assignment rather than walked.

\`return a or b\` says "return whichever one is non-empty, or \`None\` if both are" — Python's \`or\` gives
back the first truthy operand, and a real node is always truthy.`,
  worked: `\`a = 1 → 3 → 5\`, \`b = 2 → 4\`.

**Winding down** — each row is one call; the comparison decides who owns the frame:

| Call | \`a\` front | \`b\` front | comparison | owner of this position | recurses on |
|---|---|---|---|---|---|
| 1 | 1 | 2 | \`1 <= 2\` | node 1 (from \`a\`) | \`merge(3→5, 2→4)\` |
| 2 | 3 | 2 | \`3 > 2\` | node 2 (from \`b\`) | \`merge(3→5, 4)\` |
| 3 | 3 | 4 | \`3 <= 4\` | node 3 (from \`a\`) | \`merge(5, 4)\` |
| 4 | 5 | 4 | \`5 > 4\` | node 4 (from \`b\`) | \`merge(5, ∅)\` |
| 5 | 5 | — | \`b\` is empty | **base case** | returns node 5 |

**Unwinding** — each frame now assigns its owner's \`next\` and returns its owner:

| Returning into | assignment made | returns | chain built so far |
|---|---|---|---|
| call 4 | \`node4.next = node5\` | node 4 | \`4 → 5\` |
| call 3 | \`node3.next = node4\` | node 3 | \`3 → 4 → 5\` |
| call 2 | \`node2.next = node3\` | node 2 | \`2 → 3 → 4 → 5\` |
| call 1 | \`node1.next = node2\` | node 1 | \`1 → 2 → 3 → 4 → 5\` |

Final return: node 1. Five frames live at the deepest point; **zero** nodes allocated.`,
  code: `def merge_two_sorted_recursive(
    a: ListNode | None, b: ListNode | None
) -> ListNode | None:
    if a is None or b is None:
        return a or b  # the survivor is already sorted — attach it whole
    if a.val <= b.val:  # <= keeps equal values in a-before-b order (stable)
        a.next = merge_two_sorted_recursive(a.next, b)
        return a
    b.next = merge_two_sorted_recursive(a, b.next)
    return b`,
  mistake: `> **Watch out.** The misconception is that the recursive call *returns the answer*, so returning it is
> the natural thing to do. It returns the answer to a **smaller** problem — everything after the
> winner. The winner itself is only in the result because this frame put it there.

Returning the recursive call instead of the node that won the comparison:

\`\`\`python
if a.val <= b.val:
    return merge_two_sorted_recursive(a.next, b)  # WRONG — node \`a\` vanished
\`\`\`

The \`a.next = ...\` assignment is what splices \`a\` into the chain, and \`return a\` is what tells the
caller which node now sits at this position. Drop either and every frame discards its own winner. On
the worked example this returns **\`[5]\`** instead of \`1 → 2 → 3 → 4 → 5\`: each of the five frames
throws away the node it just chose, and only the base case's survivor is left. The mental check —
this function's contract is "return the head of the merged result", and that head is the node that
just won the comparison, never the thing the recursion handed you.`,
  cost: `**Time** \`O(n + m)\`, **space** \`O(n + m)\` on the call stack. Each call consumes exactly one node from
one of the two lists and does constant work, so there is one call per node. The space is the **stack**:
every frame stays live until the deepest one returns, so peak depth equals the number of nodes merged.

Use it when the lists are short — and at \`length <= 50\` each they provably are here, so this is a
legitimate submission rather than a demo. Use it also as the explanatory version: it makes "the winner
owns the position" visible in a way the loop does not. Do not reach for this shape when the same logic
scales up — merging a \`10^5\`-node list, or merge-sorting a big one — because the depth grows with the
data and no runtime will warn you politely.

---`,
}
