// cycle-detect — approach 1 — Nested walk — re-scan from the head at every step.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Nested walk — re-scan from the head at every step",
  idea: `*If I cannot store where I have been, can I just look it up again each time?* Yes: when you reach the
node at position \`i\`, walk a second pointer from the head through positions \`0 … i-1\` and check
whether any of them is that same node. *Why is that not the answer?* Because you re-walk the prefix
once per node, which is a quadratic number of comparisons — correct, constant-space, and far too slow
at 10^4 nodes.`,
  intuition: `> **Intuition.** Walking a corridor of numbered doors with no pen and no paper. At every door you
> ask "have I been here before?", and with nothing written down the only way to answer is to run back
> to the entrance and re-walk every door you have already opened, checking each one against the door
> you are standing at. You are trading **memory** for **recomputation** — and it is worth seeing
> precisely because the optimal solution makes exactly the same trade, paying with one extra pointer
> instead of one extra full traversal per door.

The subtle part is why this terminates at all when there *is* a cycle. The outer pointer never stops
on its own — it goes round the loop forever. But the moment it lands on a node it has already
occupied, that node also sits at some earlier index, so the inner scan finds it and the function
returns. The outer loop therefore runs at most \`tail + loop + 1\` times, never forever.`,
  worked: `Input: \`1 → 2 → 3 → 4 → (back to node 2)\`. Call the nodes \`N1 N2 N3 N4\`; \`N4.next\` is \`N2\`.
(This same list is traced in every approach below.)

| \`index\` | outer \`node\` | inner scan visits | found a match? |
|---|---|---|---|
| 0 | \`N1\` | *(nothing — range(0) is empty)* | no |
| 1 | \`N2\` | \`N1\` | no |
| 2 | \`N3\` | \`N1\`, \`N2\` | no |
| 3 | \`N4\` | \`N1\`, \`N2\`, \`N3\` | no |
| 4 | \`N2\` *(the loop closed)* | \`N1\`, then \`N2\` — **match** | **yes → return True** |

Total inner comparisons: 0 + 1 + 2 + 3 + 2 = 8, for a 4-node list. On a list of 10^4 nodes the same
sum is about 5 × 10^7.`,
  code: `def cycle_detect_nested_walk(head: ListNode | None) -> bool:
    node = head
    index = 0
    while node is not None:
        probe = head
        for _ in range(index):  # re-scan only the nodes strictly before this one
            if probe is node:   # \`is\`, not \`==\`: identity, not value
                return True
            probe = probe.next
        node = node.next
        index += 1
    return False`,
  mistake: `> **Watch out.** The misconception is that two nodes "being the same" is a question about their
> **contents**. It is a question about their **address**. A cycle says you are standing on a node you
> already stood on, not on a node that happens to read the same.

Writing \`if probe.val == node.val\` instead of \`if probe is node\`. The function now reports a cycle
for any list holding a duplicate value: on \`1 → 2 → 1 → ∅\`, a list that plainly ends, the buggy
version returns **\`True\`** — run, not assumed. Nothing in the problem forbids repeated values, and
the \`-10^5 <= val <= 10^5\` range with up to 10^4 nodes makes duplicates likely rather than exotic.

In Python the distinction is \`is\` versus \`==\`; in Java it is \`==\` versus \`.equals\`; in C++ it is
comparing pointers versus comparing what they point at. Every language has this trap in a slightly
different spelling.`,
  cost: `**Time** \`O(n²)\`, **space** \`O(1)\`. The time comes from the inner scan running once per outer node
with an ever-growing prefix — the sum \`0 + 1 + 2 + … + n\` is \`n²/2\`. Space is two pointers and an
integer.

Use it essentially never for this problem. It earns its place in one situation: you are debugging a
data structure by hand, you need an obviously-correct oracle to check a clever implementation against,
and \`n\` is tiny. It is the version you trust when you do not yet trust anything else.

---`,
}
