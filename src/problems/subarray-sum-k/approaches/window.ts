// subarray-sum-k — approach 3 — The sliding window (the instinct that fails here)
//
// Converted from docs/deep/subarray-sum-k_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "window",
  title: "The sliding window (the instinct that fails here)",
  idea: `*Both approaches so far are quadratic because they consider every pair of endpoints — can the two
endpoints move in one coordinated sweep instead?* That is the sliding window: extend the right edge
to take in more, pull the left edge in when the total gets too big, and never move either edge
backwards. It fixes the pairwise rung's n² search in one pass and constant space. It is also **wrong
on this problem**, and understanding exactly why is worth more than the approach itself.`,
  intuition: `> **Intuition.** A window works when the running total behaves like a dial with a direction:
> pushing the right edge out can only turn it up, pulling the left edge in can only turn it down.
> Under that guarantee, "the total is too big" tells you which edge to move, each edge only ever
> moves forward, and the sweep costs \`O(n)\`. Now drop a negative number into the row. Pulling the
> left edge past a \`−1\` *raises* the total instead of lowering it, the dial loses its direction,
> and an edge you already moved forward may have been hiding an answer you can never get back to.
> The technique has not become slower — it has stopped being correct.

> **Why it works.** And, for this rung, where it stops working. The invariant a window needs is **monotonicity in each
> edge**: \`sum(left..right)\` is non-decreasing in \`right\` and non-increasing in \`left\`. That is
> what licenses the deduction "too big, therefore shrink", because it guarantees the only way back
> under the limit is forward. Every value being non-negative is precisely what makes the invariant
> hold. One negative value falsifies it, and with the invariant goes the deduction, the correctness,
> and the approach.

The version below is the careful form of the window, which handles zeros properly by counting
subarrays with sum **at most** \`k\`, then subtracting those with sum at most \`k - 1\`. Even in that
careful form, the non-negativity assumption is load-bearing.`,
  worked: `\`nums = [1, -1, 0]\`, \`k = 0\`. The true answer is 3; the window returns **0**.

First \`at_most(0)\` — subarrays whose sum is 0 or less:

| Step | \`right\` (value) | \`running\` after adding | Shrink? | \`left\` after | windows counted (\`right - left + 1\`) | \`total\` |
|---|---|---|---|---|---|---|
| 1 | 0 (\`1\`) | 1 | 1 > 0 → drop \`nums[0]\`, running → 0, left → 1 | 1 | 0 − 1 + 1 = **0** | 0 |
| 2 | 1 (\`-1\`) | −1 | no | 1 | 1 − 1 + 1 = 1 | 1 |
| 3 | 2 (\`0\`) | −1 | no | 1 | 2 − 1 + 1 = 2 | 3 |

\`at_most(0) = 3\`. Running the same walk for \`at_most(-1)\` gives 3 as well, so the window's answer is
3 − 3 = **0**.

The damage is visible at step 1. The window saw a total of 1, concluded "too big, shrink", and
retired index 0 permanently — but index 0 is the start of *two* of the three real answers, and it
was only "too big" because the \`−1\` that would have fixed it had not been read yet. A positive array
cannot do that to you; this one can.`,
  code: `def _at_most(nums: list[int], limit: int) -> int:
    """Subarrays with sum <= limit. Only valid when every value is non-negative."""
    left = 0
    running = 0
    total = 0
    for right, x in enumerate(nums):
        running += x
        while running > limit and left <= right:
            running -= nums[left]
            left += 1
        total += right - left + 1  # every window ending at right and starting >= left
    return total


def subarray_sum_k_sliding_window(nums: list[int], k: int) -> int:
    """WRONG on inputs containing negatives — see the section on this approach."""
    return _at_most(nums, k) - _at_most(nums, k - 1)`,
  mistake: `> **Watch out.** Beyond reaching for the window at all, the misconception is that a right endpoint
> has at most **one** matching left endpoint — so "shrink while the sum exceeds \`k\`, and tick the
> counter when the sum equals \`k\`" must be enough. It counts one subarray per right endpoint, and
> that is already wrong the moment **zeros** appear, with no negatives involved anywhere.

On \`nums = [0, 0, 0]\`, \`k = 0\` that simpler version reports **3** when the answer is **6**, because
three different windows end at the last position and all of them sum to zero. The
\`at_most(k) - at_most(k - 1)\` formulation is what fixes it: \`right - left + 1\` counts *every* valid
window ending at \`right\`, not just one. Two separate assumptions hide in the naive version — "no
negatives" and "no zeros" — and only the first survives the fix.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Each edge crosses the array once and never goes back, so the two
calls to \`_at_most\` are two linear sweeps and the state is three integers. On paper that beats the
optimal answer below, which spends \`O(n)\` memory.

Use it when — and only when — **every value is non-negative**. Remove that and the approach does not
degrade, it breaks, as the trace above shows. When it does apply it is excellent and it generalises
far past this question: longest window with a bounded sum, count of windows under a threshold,
at-most-k-distinct-characters, the whole "shrink to restore the invariant" family. Recognising which
world you are in is the actual skill; the code is the easy part.

---`,
}
