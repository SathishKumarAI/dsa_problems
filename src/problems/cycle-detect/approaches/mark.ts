// cycle-detect — approach 4 — Value-marking — trading the list's data for speed.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "mark",
  title: "Value-marking — trading the list's data for speed",
  idea: `*Floyd is already optimal, so what would it take to detect a cycle in a single pass with no
comparisons at all?* Stamp each node as you leave it with a value no legal node could hold; arriving
at a stamped node means you have been there. *What does it fix, and what does it cost?* It fixes
nothing about complexity — it is \`O(n)\` time and \`O(1)\` space, the same as Floyd — but it stops after
one pass over each node instead of Floyd's up-to-two, at the price of **destroying every value in the
list.**

**The assumption this requires, stated plainly: the value range is bounded (\`-10^5 … 10^5\`), so
\`100001\` is impossible legitimate data; and you are permitted to mutate the nodes you were handed.**
If either half of that fails — an unbounded value type, or a list someone else is still reading — this
approach is not merely suboptimal, it is incorrect.`,
  intuition: `> **Intuition.** Back to the corridor and the chalk — except now the mark goes on the **door**
> rather than in a notebook you carry. The information is identical, one mark per door, and the
> notebook disappears because the doors were already there. That is why the space drops to \`O(1)\`:
> the storage was allocated before you arrived, and you are only overwriting what was painted on it.

This is a real technique with a real name (in-place marking), and it appears constantly in array
problems where the values happen to be usable as indices or the sign bit is free. The reason it is the
last rung and not the first is that it is the only approach here that leaves the input worse than it
found it, and that is usually disqualifying.`,
  worked: `Input: \`1 → 2 → 3 → 4 → (back to N2)\`. Sentinel \`MARK = 100001\`.

| Step | at node | its \`val\` on arrival | already marked? | \`val\` after stamping | list contents now |
|---|---|---|---|---|---|
| 1 | \`N1\` | 1 | no | \`100001\` | \`[M, 2, 3, 4]\` |
| 2 | \`N2\` | 2 | no | \`100001\` | \`[M, M, 3, 4]\` |
| 3 | \`N3\` | 3 | no | \`100001\` | \`[M, M, M, 4]\` |
| 4 | \`N4\` | 4 | no | \`100001\` | \`[M, M, M, M]\` |
| 5 | \`N2\` | \`100001\` | **yes** | — | **return True** |

Five node visits, one per node plus the repeat — fewer pointer moves than Floyd's three-and-six on the
same input. And the list now holds \`[100001, 100001, 100001, 100001]\`: the answer is right and the
data is gone.`,
  code: `MARK = 100_001  # outside the legal value range -10**5 .. 10**5, so no real node holds it


def cycle_detect_value_marking(head: ListNode | None) -> bool:
    node = head
    while node is not None:
        if node.val == MARK:  # only a node WE stamped can hold this
            return True
        node.val = MARK  # destructive: the original value is gone for good
        node = node.next
    return False`,
  mistake: `> **Watch out.** The misconception is that a sentinel needs to be **unlikely**. It needs to be
> **impossible**, and that is not a difference of degree: an unlikely sentinel is a bug lying in wait
> for the one input that happens to contain it.

Picking a sentinel inside the legal range — \`0\`, or \`-1\`, or \`100000\`. The instant a real node holds
that value the function reports a cycle on a perfectly straight list, and it will do so for exactly
one input in your test set, on a Tuesday. The sentinel has to be *derived* from the stated constraint
(\`|val| <= 10^5\`, so \`100001\` is free), never guessed at.

The second mistake is shipping this at all without saying it mutates. A function named \`has_cycle\`
that silently erases the list is the kind of thing that passes review and then corrupts data in
production, because nothing in the signature warns anyone.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Each node is visited at most twice — once to stamp, once to
detect — and the only extra storage is one pointer. Same asymptotics as Floyd with a smaller
constant: roughly \`n + 1\` node visits against Floyd's up-to-\`3n\` pointer dereferences.

Use it when the list is genuinely yours to destroy and the constant factor matters — a one-shot
validity check on a structure you are about to free anyway, or an embedded context where you are
counting dereferences. In an interview, mention it as an aside to show you noticed the value range,
then immediately note that Floyd gets the same bounds without touching the data, which is why Floyd
is the answer.

---`,
}
