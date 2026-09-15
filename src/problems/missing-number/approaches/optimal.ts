// missing-number — approach 5 — XOR the indices against the values
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "XOR the indices against the values",
  idea: `*The running total is correct but it builds a number around n²/2 before subtracting anything, so a
fixed-width integer can overflow long before the answer comes out. Is there an invariant that cancels
just as cleanly but never grows?* Yes: XOR. Because \`x ^ x = 0\` and \`x ^ 0 = x\`, any value that
appears an even number of times vanishes from a running XOR, and the operation does not care about
order. Fold every index 0..n and every value together, and every present number appears exactly twice
— once as an index, once as a value — and cancels. The missing number appears only as an index, so it
is what survives. This fixes the sum's weakness: no intermediate value ever exceeds n.`,
  intuition: `Imagine pairing everything up. Write down the n+1 candidate numbers 0, 1, …, n (these come from the
indices, plus n itself which no index reaches). Then write down the n values the array actually holds.
Every candidate that is present now appears on both lists, so it has a partner. The one missing
candidate is on the first list with nobody to pair with. XOR is a machine that silently discards
anything with a partner and keeps anything without one — you do not have to find the partners, sort
the lists, or even know which numbers are involved. Pour everything in and the unpaired one falls out.

The seed value matters and is easy to get wrong: the loop visits indices 0 through n−1, but the
candidate range goes up to n. So \`n\` itself must be XOR'd in by hand at the start, because no index
ever supplies it.`,
  worked: `Input: \`nums = [3, 0, 1]\`, n = 3. The accumulator starts at 3 — the candidate the loop never visits.

| Step | XOR'd in | Arithmetic | \`acc\` after |
|---|---|---|---|
| seed | n = 3 | — | 3 |
| i = 0, value 3 | 0 and 3 | 3 ^ 0 ^ 3 | 0 |
| i = 1, value 0 | 1 and 0 | 0 ^ 1 ^ 0 | 1 |
| i = 2, value 1 | 2 and 1 | 1 ^ 2 ^ 1 | **2** |

Answer 2. Trace what cancelled: the 3 from the seed met the value 3 at step 1; the 0 from index 0 met
the value 0 at step 2; the 1 from index 1 met the value 1 at step 3. Only index 2 was left without a
partner, because no value 2 ever arrived. One pass, one integer of state that never exceeds n, and the
array is never touched.`,
  code: `def missing_number_xor(nums: list[int]) -> int:
    acc = len(nums)  # index n is in the range 0..n but the loop never visits it
    for i, x in enumerate(nums):
        acc ^= i ^ x
    return acc`,
  mistake: `Seeding the accumulator with \`0\` instead of \`len(nums)\`. The loop supplies indices 0 through n−1 and
every value, so the candidate n is never introduced — and if n is the missing number, nothing detects
its absence, while if n *is* present, its value XORs in unpaired and corrupts the result. On \`[0, 1]\`
(n = 2, answer 2) the badly seeded version computes \`0 ^ 0 ^ 0 ^ 1 ^ 1 = 0\` and returns 0, which is
present. The statement's second example is written to catch exactly this: *the gap is past the end of
the array, and nothing inside the data points at it.*

The second mistake is reaching for \`+\` or \`-\` where the code says \`^\`, out of muscle memory. \`acc +=
i + x\` is not the sum solution and is not anything; it happens to produce the right answer on some
inputs by coincidence, which makes it worse than a clean failure.`,
  cost: `**Time O(n), space O(1).** One pass with two XOR operations per element and a single accumulator. Every
intermediate value is bounded by the largest number involved — never more than n, since XOR of numbers
below 2^k stays below 2^k — so there is no overflow at any n, in any fixed-width type wide enough to
hold n itself.

This is the right choice for the follow-up as asked: linear time, constant space, the input untouched,
and no arithmetic that can overflow. It is also the version that generalises to the harder relatives
of this problem — "every value appears twice except one", "two values appear once" — where XOR's
cancelling property does work a sum cannot. The one thing it does *not* do is survive a second missing
value: one accumulator holds one unknown, and with two holes you get their XOR rather than either of
them. If that is the question, go back to the flag table.

---`,
}
