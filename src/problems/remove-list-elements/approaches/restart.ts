// remove-list-elements — approach 1 — Restart the scan after every removal
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
  rung: "restart",
  title: "Restart the scan after every removal",
  idea: `*What is the most obviously-correct thing that could work?* Strip any matching nodes off the front,
then scan from the head; the first match you find, unlink it and **start the whole scan over**. Stop
when a full scan finds nothing. *Why is that not the answer?* Because nothing behind you can ever
change, so every restart re-checks nodes it has already cleared.`,
  intuition: `> **Intuition.** This is the instinct of somebody who does not yet trust their own loop. "I removed
> something, so the list is different, so my assumptions might be stale — safest to start again."
> The reasoning is emotionally sound and factually wrong, and naming *why* it is wrong is the whole
> value of this rung: **a deleted node cannot come back.** The part of the list you have already
> walked is finished forever. The only thing a removal can invalidate is what lies immediately
> *ahead*, which is a one-node concern, not a whole-scan concern.

Notice that this rung already needs the head loop — \`while head is not None and head.val == val\` —
because the inner scan can only ever edit \`node.next\`, never \`head\` itself. That head loop reappears
in Approach 4 and is deleted in Approach 5.`,
  worked: `\`n0(7) → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\`, \`val = 7\`.

**Head strip:** \`n0\` matches → \`head\` becomes \`n1\`. List: \`[1, 7, 7, 2, 7]\`.

**Then the restarting scans, measured:**

| Pass | walks | finds | list afterwards |
|---|---|---|---|
| 1 | \`n1\` | \`n1.next = n2\` matches → unlink, \`break\` | \`[1, 7, 2, 7]\` |
| 2 | \`n1\` | \`n1.next = n3\` matches → unlink, \`break\` | \`[1, 2, 7]\` |
| 3 | \`n1\`, \`n4\` | \`n4.next = n5\` matches → unlink, \`break\` | \`[1, 2]\` |
| 4 | \`n1\`, \`n4\` | nothing; \`changed\` stays \`False\` | \`[1, 2]\` |

Result \`[1, 2]\`. **1 head strip, 4 passes, 5 inner steps** — measured. Pass 4 exists only to prove
there is nothing left to do, and passes 2 and 3 re-walk \`n1\`, which was cleared in pass 1.`,
  code: `def remove_list_elements_restart_scan(head: ListNode | None, val: int) -> ListNode | None:
    while head is not None and head.val == val:  # the head needs its own loop
        head = head.next
    changed = True
    while changed:
        changed = False
        node = head
        while node is not None and node.next is not None:
            if node.next.val == val:
                node.next = node.next.next
                changed = True
                break  # start the whole scan again
            node = node.next
    return head`,
  mistake: `> **Watch out.** The misconception is that "the loop edits \`node.next\`, and every node is somebody's
> \`next\`" — so the head must be covered. It is not: the head is the one node that is nobody's \`next\`.
> Drop the head loop and **the head becomes the one node this algorithm can never delete**, no matter
> how many times it restarts.

\`\`\`python
def remove_list_elements_restart_scan(head, val):
    changed = True          # WRONG — no head strip
    while changed:
        ...
    return head
\`\`\`

Measured on the worked example this returns **\`[7, 1, 2]\`** — every other match is gone and the head
survives. Measured on the statement's \`[7, 7, 7, 7]\` with \`val = 7\` it returns **\`[7]\`**: it strips
the three nodes that have predecessors and leaves the one that does not. That second case is exactly
why the statement includes it, and the data file's note says so outright.`,
  cost: `**Time** \`O(n²)\` worst case, **space** \`O(1)\`. The quadratic comes from the restart: each removal
costs a fresh walk from the head, so \`k\` removals cost \`O(k·n)\`. Space is two pointers and a boolean.

The data file describes the worst case as "a list of nothing but matches", and **that is not right** —
measured, \`[7] * 40\` with \`val = 7\` costs **0 inner steps**, because the head-strip loop removes
everything before the scan starts. The real worst shape is survivors first and matches at the end,
where every pass walks the whole surviving prefix before finding anything:

| Input, \`val = 7\` | passes | inner steps |
|---|---|---|
| \`[1]*20 + [7]*20\` (n=40) | 21 | **419** |
| \`[7,1]*20\` (n=40) | 20 | 209 |
| \`[1]*30 + [7]*30\` (n=60) | 31 | **929** |
| \`[7]*40\` (n=40) | 1 | **0** |

Roughly \`n²/4\` on the bad shape, and at the constraint's ceiling of \`10^4\` that is about 25 million
inner steps — survivable in a compiled language, not in Python. The worst case is *analytic*; the
table above is measured at reduced \`n\`, which is also how the stress suite runs it.

Never ship it. Use it as the oracle you can verify by reading, which is its job at the foot of this
document, and use it in an interview as the sentence that earns the next rung: *"restarting is safe
but redundant, because a deleted node cannot come back."*

---`,
}
