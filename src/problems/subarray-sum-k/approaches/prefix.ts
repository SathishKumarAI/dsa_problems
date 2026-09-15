// subarray-sum-k — approach 2 — Prefix sums, compared pairwise
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
  rung: "prefix",
  title: "Prefix sums, compared pairwise",
  idea: `*The brute force re-adds the same leading tiles over and over — can the sum of any stretch be had
without adding it up?* Yes, by arithmetic: if \`P[j]\` is the total of everything before position \`j\`,
the stretch from \`i\` up to \`j\` sums to \`P[j] - P[i]\`. Build that table of running totals once and
every stretch becomes a single subtraction.

This fixes the brute force's repeated **arithmetic** — though not yet its repeated *looking*.`,
  intuition: `> **Intuition.** Think of milestone markers along a road, each stamped with the distance from the
> start. The distance between any two markers is the difference of their readings; you never
> re-walk the road, you subtract. Building the markers is one pass, and afterwards any stretch
> costs one subtraction instead of a walk. The catch is that you still have to consider every
> *pair* of markers, and there are about n²/2 of them — so this rung separates two costs the brute
> force had welded together, computing sums and searching over pairs, and it only pays off the
> first.

One indexing detail repays care: the table has **n + 1** entries, not \`n\`. \`P[0] = 0\` stands for the
empty stretch before the array begins. That phantom zero is not a formality — it is the same zero
the final approach has to seed its map with, and for the same reason.`,
  worked: `\`nums = [1, -1, 0]\`, \`k = 0\`. First the table of running totals, one boundary at a time:

| boundary | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| \`P\` | 0 | 1 | 0 | 0 |
| meaning | before the array | after \`1\` | after \`1, -1\` | after \`1, -1, 0\` |

Then every pair of boundaries \`i < j\`, where the pair names the stretch between them:

| Step | \`i\` | \`j\` | \`P[j] - P[i]\` | Stretch | Verdict |
|---|---|---|---|---|---|
| 1 | 0 | 1 | 1 − 0 = 1 | \`[1]\` | no |
| 2 | 0 | 2 | 0 − 0 = **0** | \`[1, -1]\` | hit, count = 1 |
| 3 | 0 | 3 | 0 − 0 = **0** | \`[1, -1, 0]\` | hit, count = 2 |
| 4 | 1 | 2 | 0 − 1 = −1 | \`[-1]\` | no |
| 5 | 1 | 3 | 0 − 1 = −1 | \`[-1, 0]\` | no |
| 6 | 2 | 3 | 0 − 0 = **0** | \`[0]\` | hit, count = 3 |

Six subtractions and one three-step build, against the brute force's six additions. Look at the \`P\`
row though: the value **0 appears three times**, at boundaries 0, 2 and 3. Every hit in the table
above is a pair of boundaries carrying the *same* reading — and that observation is the entire next
idea.`,
  code: `def subarray_sum_k_prefix_pairwise(nums: list[int], k: int) -> int:
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    total = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums) + 1):  # j is an END boundary, so it reaches n
            if prefix[j] - prefix[i] == k:
                total += 1
    return total`,
  mistake: `> **Watch out.** The misconception is that \`j\` is an **index**, so it must stop at \`len(nums) - 1\`
> like every other loop you have written. It is not an index, it is a **boundary**, and there are
> \`n + 1\` of them — the last one names "the end of the array" rather than an element.

Writing the inner loop as \`range(i + 1, len(nums))\` silently drops every subarray that ends on the
final element. On this example that loses both \`[1, -1, 0]\` and \`[0]\`, returning **1** instead of 3.
It is a nasty bug because it is invisible on inputs whose answers all sit in the middle, and because
the code still runs, still looks symmetric, and still returns a plausible number.`,
  cost: `**Time** \`O(n²)\`, **space** \`O(n)\`. The time is dominated by the double loop over boundary pairs —
the table itself is one linear pass. The space is the table, one integer per boundary. So this rung
trades memory for a smaller constant factor and buys no better asymptotic behaviour at all.

On its own it is rarely the answer you ship, and it earns its place for two other reasons. It is the
step at which the problem stops being about addition and starts being about **differences**, which
is the conceptual jump the optimal solution needs. And the prefix table is genuinely the right tool
when you must answer many arbitrary range-sum queries on a fixed array — build once in \`O(n)\`,
answer each query in \`O(1)\`.

---`,
}
