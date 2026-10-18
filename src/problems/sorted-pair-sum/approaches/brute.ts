// sorted-pair-sum — approach 1 — Brute force
//
// Rewritten 2026-10-17 for reading: the shape of the reasoning as points, the
// mistake as bug / effect / fix. Same six parts docs/deep/README.md §3
// requires. `rung` binds this section to the problem's own ladder
// (solutions.ts), in both directions: a document may not teach an approach
// with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Brute force",
  idea: `*Does a partner exist for \`nums[i]\`?* Check every element after it. *Where is the answer?* Do
that for every \`i\` and stop at the first hit. The baseline: it uses nothing about the input except
that it is a list of numbers.`,
  intuition: `- Two fingers. The outer one parks on an element; the inner one walks the whole tail after it.
- When the tail runs out, the outer finger steps once and the inner one starts over.
- Every unordered pair is tested once: n − 1 checks, then n − 2, and so on — about n²/2 in total.
- **The thing to notice:** nothing learned on one outer step carries into the next. Every later
  approach is a way of keeping that knowledge.`,
  worked: `Input: \`nums = [1, 3, 6, 9]\`, \`target = 12\`.

| Step | i (value) | j (value) | \`nums[i] + nums[j]\` | Verdict |
|---|---|---|---|---|
| 1 | 0 (1) | 1 (3) | 4 | too small, keep scanning |
| 2 | 0 (1) | 2 (6) | 7 | too small |
| 3 | 0 (1) | 3 (9) | 10 | too small; tail exhausted, advance i |
| 4 | 1 (3) | 2 (6) | 9 | too small |
| 5 | 1 (3) | 3 (9) | **12** | hit — return \`[1, 3]\` |

Five checks for four elements. Step 3 already said something useful — \`1 + 9\`, the biggest sum
index 0 can make, fell short — and step 4 ignores it and starts over.`,
  code: `def sorted_pair_sum_brute_force(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
  mistake: `- **The bug:** \`for j in range(len(nums))\` instead of \`range(i + 1, len(nums))\`.
- **What it does:** \`j\` can equal \`i\`, so an element pairs with itself. \`target = 8\` with a \`4\` in
  the list returns \`[2, 2]\` — one element used twice, which the statement forbids.
- **The fix also halves the work:** starting \`j\` at \`i + 1\` stops you testing \`(a, b)\` and then
  \`(b, a)\`.`,
  cost: `**Time O(n²), space O(1).** n outer positions, up to n inner checks each, nothing remembered between
them; two indices held.

Reach for it when n is tiny, as the oracle a faster answer is checked against (its job in the script
below), or as the first thing you say in an interview before improving on it.`,
}
