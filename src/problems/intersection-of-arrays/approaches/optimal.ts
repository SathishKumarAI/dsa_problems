// intersection-of-arrays — approach 5 — Count the smaller side, stream the larger.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Count the smaller side, stream the larger",
  idea: `*This code always builds its table from \`nums2\`. What if \`nums2\` is the big one?* Ten values on the
left and a billion on the right still costs a billion map entries to produce a ten-element answer.
But \`min(a, b)\` is symmetric — swapping which array is which cannot change the answer — so you are
free to tally whichever array is **shorter** and stream the other past it. This fixes the previous
rung's weakness: memory tied to an arbitrary argument position rather than to the actual shape of the
data. It is the same algorithm, one line richer, with its space bound changed from O(m) to
O(min(n, m)).`,
  intuition: `The shop again, except now you get to decide which side is the ledger. The ledger has to be held in
memory in full; the other side only ever walks past you one item at a time and is never revisited. So
you put the *small* thing in the ledger and let the *big* thing stream. That is not a micro-optimisation
— it is the difference between a program that runs and one that does not, when the large side is a
file on disk, a network cursor, or a database result set that cannot be materialised.

This is precisely what the famous follow-up asks: *what if \`nums2\` is enormous and can only be read
once?* The answer is this rung, and the sentence that earns the point is **"the memory has to be
bounded by the smaller input, because the larger one is only ever streamed."**`,
  worked: `Input: \`nums1 = [4, 9, 5]\`, \`nums2 = [9, 4, 9, 8, 4]\`. \`nums1\` has 3 elements and \`nums2\` has 5, so
**\`nums1\` becomes the ledger** — the opposite of Approach 4's choice on the same input.

Pass 1 builds the ledger from the shorter array: \`{4: 1, 9: 1, 5: 1}\`.

Pass 2 streams the longer array past it:

| Streamed value | Stock before | Action | Ledger after | Answer |
|---|---|---|---|---|
| 9 | 1 | take, decrement | \`{4: 1, 9: 0, 5: 1}\` | \`[9]\` |
| 4 | 1 | take, decrement | \`{4: 0, 9: 0, 5: 1}\` | \`[9, 4]\` |
| 9 | **0** | out of stock — the left side only ever had one 9 | unchanged | \`[9, 4]\` |
| 8 | absent | the ledger has never heard of it | unchanged | \`[9, 4]\` |
| 4 | **0** | out of stock | unchanged | \`[9, 4]\` |

Sorted for a canonical result: \`[4, 9]\`. The ledger never grew past three entries — the number of
distinct values in the *smaller* array — no matter how long the streamed side was. Rows three and five
are \`min(1, 2) = 1\` enforcing itself by exhaustion, with no comparison of counts anywhere in the code.
Neither input array was modified; \`nums2\` was read exactly once, front to back, which is what makes it
streamable.`,
  code: `def intersection_of_arrays_count_the_smaller_side(nums1: list[int], nums2: list[int]) -> list[int]:
    small, large = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
    stock: dict[int, int] = {}
    for x in small:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in large:
        if stock.get(x, 0) > 0:
            stock[x] -= 1
            out.append(x)
    out.sort()
    return out`,
  mistake: `Assuming the swap changes the answer and trying to "correct" for it — reversing the output, or
special-casing which array the results came from. It does not need correcting: the answer is a
multiset of *values*, not of positions, and \`min(count₁, count₂)\` is symmetric in its two arguments,
so which side is tallied is genuinely arbitrary. The worked example above demonstrates it: Approach 4
collected \`[4, 9]\` walking \`nums1\`, this one collected \`[9, 4]\` streaming \`nums2\`, and both sort to
the same answer.

The mistake that actually costs marks is a subtler one about the follow-up. If the large side truly
cannot fit in memory, then \`out.sort()\` at the end is a lie — the *answer* is bounded by the smaller
array's size, so it is fine here, but only because \`min\` caps the answer at \`len(small)\`. Saying that
out loud (*"the output is bounded by the smaller array too, so collecting it is safe"*) is what shows
you have thought the streaming case through rather than recited it.`,
  cost: `**Time O(n + m + k log k), space O(min(n, m))** — the map holds one entry per distinct value of the
shorter array, and the answer itself is bounded by that array's length. Time is one pass over each
array plus the canonical-order sort; the streamed side is read exactly once and never revisited.

This is the default to reach for. It is the same code as Approach 4 with one extra line, it is never
worse, and it is dramatically better whenever the inputs are lopsided — which real data usually is.
The single case where something else wins is when both arrays arrive already sorted, in which case the
two-cursor merge does the job in O(n + m) time with O(1) extra space and no hashing at all.

---`,
}
