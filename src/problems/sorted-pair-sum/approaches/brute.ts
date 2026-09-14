// sorted-pair-sum — approach 1 — Brute force
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Brute force",
  idea: `*How do I know whether a partner exists for \`nums[i]\`?* Look at every element after it and check.
*And how do I find the answer?* Do that for every \`i\`, and stop at the first pair that hits the
target. This is the baseline: it uses nothing about the input except that it is a list of numbers.`,
  intuition: `Picture a nested pair of fingers. The outer finger parks on an element; the inner finger walks
the entire remaining tail, testing each one. When the tail runs out, the outer finger advances
one step and the inner finger restarts just after it. You are enumerating every unordered pair
exactly once — 1 pair of work for the last element, 2 for the one before, and so on — which is
why the total is about n²/2 checks. The shape to notice is that the inner walk *starts over* each
time: nothing learned on one outer step is carried into the next. Every later approach is a way
of not throwing that knowledge away.`,
  worked: `Input: \`nums = [1, 3, 6, 9]\`, \`target = 12\`.

| Step | i (value) | j (value) | \`nums[i] + nums[j]\` | Verdict |
|---|---|---|---|---|
| 1 | 0 (1) | 1 (3) | 4 | too small, keep scanning |
| 2 | 0 (1) | 2 (6) | 7 | too small |
| 3 | 0 (1) | 3 (9) | 10 | too small; tail exhausted, advance i |
| 4 | 1 (3) | 2 (6) | 9 | too small |
| 5 | 1 (3) | 3 (9) | **12** | hit — return \`[1, 3]\` |

Five sum checks for a four-element list. Note that step 3 already told us something useful —
\`1 + 9\`, the largest sum available to index 0, still fell short — but this approach makes no use
of it and starts over at step 4.`,
  code: `def sorted_pair_sum_brute_force(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
  mistake: `Writing \`for j in range(len(nums))\` instead of \`range(i + 1, len(nums))\`. Now \`j\` can equal \`i\`,
and an element gets paired with itself: with \`target = 8\` and a \`4\` in the list, the code happily
returns \`[2, 2]\`, which reuses one element and is explicitly forbidden. Starting \`j\` at \`i + 1\`
fixes it and halves the work at the same time, because it also stops you from checking the pair
\`(a, b)\` and then \`(b, a)\`.`,
  cost: `**Time O(n²), space O(1).** The cost is the nested walk: for each of n outer positions the inner
loop scans up to n elements, and nothing is remembered between outer steps. Space is constant
because only two indices are ever held.

Use it when n is genuinely tiny, when you need an obviously-correct reference to cross-check a
clever solution against (that is exactly what it does in the stress test at the bottom of this
file), or as the first thing you say out loud in an interview before improving it.

---`,
}
