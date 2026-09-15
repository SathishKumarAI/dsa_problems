// next-permutation — approach 4 — Pivot, swap, rebuild the tail backwards
//
// Converted from docs/deep/next-permutation_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "pivot-swap-rebuild-the-tail-backwards",
  title: "Pivot, swap, rebuild the tail backwards",
  idea: `*Is the tail really unsorted, or do I already know its order?* Already know it. Before the swap the
tail was descending; the swap put a *smaller* value into the slot of a larger one, and the slot it
chose was the last one still above the pivot, so the tail is descending afterwards too. A descending
run read from the end is an ascending run — so copy it out backwards instead of sorting it.

This fixes the previous rung's weakness — **it pays \`O(n log n)\` to discover an order it was already
guaranteed.**`,
  intuition: `> **Intuition.** The tail's descending order is not an accident to be re-established; it is an invariant that survives
> every step. It holds when you find the pivot (that is the definition of the pivot). It still holds
> after the swap, because you traded the pivot's value with the rightmost value that beats it, and
> sliding a smaller number into that exact position keeps the run non-increasing. So the tail is
> already sorted — just backwards. Reading it from the end into a fresh list gives you the ascending
> version at the cost of one linear pass, no comparisons at all. The remaining flaw is the fresh list:
> the problem asked for constant extra room and this borrows \`O(n)\` of it.`,
  worked: `\`nums = [1, 3, 5, 4, 2]\`. Pivot found exactly as before at index 1, holding 3.

**Find the replacement from the right end** this time — no sorting, so the tail is still descending
and the *last* value above the pivot is the smallest one above it:

| \`at\` | value | \`<= 3\`? | action |
|---|---|---|---|
| 4 | 2 | yes | too small, step left |
| 3 | 4 | no | stop — 4 it is |

**Swap indices 1 and 3:** \`[1, 4, 5, 3, 2]\`. Check the invariant: the tail \`[5, 3, 2]\` is still
descending, as promised.

**Read the tail backwards** into a scratch list:

| read index | value | scratch list so far |
|---|---|---|
| 4 | 2 | \`[2]\` |
| 3 | 3 | \`[2, 3]\` |
| 2 | 5 | \`[2, 3, 5]\` |

**Write it back** over indices 2…4: \`[1, 4, 2, 3, 5]\`. Same answer, and not a single comparison was
made in the tail step.`,
  code: `def next_permutation_pivot_rebuild_tail(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = find_pivot(nums)
    if pivot >= 0:
        at = n - 1
        while nums[at] <= nums[pivot]:  # from the RIGHT, so the first hit is the smallest one above
            at -= 1
        nums[pivot], nums[at] = nums[at], nums[pivot]
    tail = []
    for i in range(n - 1, pivot, -1):  # stops AT pivot, exclusive - the pivot is not part of the tail
        tail.append(nums[i])
    nums[pivot + 1:] = tail
    return nums`,
  codeNote: `\`find_pivot\` is the shared scan introduced in Approach 3 — the observation all three
pivot-based rungs are built on.`,
  mistake: `> **Watch out.** Writing the read-back loop as \`range(n - 1, pivot - 1, -1)\` and pasting the result over
> \`nums[pivot:]\`. Off by exactly one slot, and it drags the pivot itself into the reversal — which
> undoes the swap you just made and reverses a four-element stretch where three were meant to move. On
> the worked example it returns **\`[1, 2, 3, 5, 4]\`** instead of **\`[1, 4, 2, 3, 5]\`**: a valid
> rearrangement of the same values, comfortably *smaller* than the input, and therefore not a successor
> at all. The \`-1\` is the right instinct in the wrong place: \`range\` stops *before* its second argument,
> so \`range(n - 1, pivot, -1)\` already ends at \`pivot + 1\`, which is the first slot of the tail.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Three linear passes and no sorting: one to find the pivot, one to find the
replacement, one to read the tail out and write it back. The space is the scratch list, which in the
worst case — a fully descending input, where the tail is the whole array — is as long as the input.
That \`O(n)\` is the last thing standing between this and the required bound.

Use it when the tail has to land somewhere else anyway: if you are producing a *new* array rather
than editing one, the copy is not overhead, it is the output, and this reads more plainly than an
in-place reversal. For this problem, it exists to make the final rung's saving obvious — the copy is
buying nothing, because the destination and the source are the same array.

---`,
}
