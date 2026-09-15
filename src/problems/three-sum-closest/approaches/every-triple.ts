// three-sum-closest — approach 1 — Every triple
//
// Converted from docs/deep/three-sum-closest_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "every-triple",
  title: "Every triple",
  idea: `*How do I know which triple is closest?* Form all of them and keep the best one seen. Three nested
loops, each starting one past the previous, so every combination of three distinct positions is
visited exactly once and none is visited twice.`,
  intuition: `> **Intuition.** A committee of three has to be chosen from a room, and you are scoring every possible
> committee. You pick a first member, then a second from everyone *after* them, then a third from
> everyone after *that* — starting each inner walk past the outer one is what stops you from
> re-scoring the same three people in a different order. You carry one slip of paper with the best
> score so far, and the reasoning has no memory beyond it: each committee is scored from scratch, and
> that lack of memory is the entire inefficiency.`,
  worked: `\`nums = [-1, 2, 1, -4]\` (unsorted), \`target = 1\`. \`best\` is seeded with the first triple:
\`nums[0] + nums[1] + nums[2] = -1 + 2 + 1 = 2\`.

| \`i\` (\`nums[i]\`) | \`j\` (\`nums[j]\`) | \`k\` (\`nums[k]\`) | \`s\` | \`\\|s − 1\\|\` | \`best\` before | verdict | \`best\` after |
|---|---|---|---|---|---|---|---|
| 0 (−1) | 1 (2) | 2 (1) | 2 | 1 | 2 | tie with itself | 2 |
| 0 (−1) | 1 (2) | 3 (−4) | −3 | 4 | 2 | worse | 2 |
| 0 (−1) | 2 (1) | 3 (−4) | −4 | 5 | 2 | worse | 2 |
| 1 (2) | 2 (1) | 3 (−4) | −1 | 2 | 2 | worse | 2 |

Result **2**. ✅ Four triples for \`n = 4\`; for \`n = 500\` there would be 20 708 500.`,
  code: `def three_sum_closest_every_triple(nums: list[int], target: int) -> int:
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):        # j starts past i, k past j: each triple exactly once
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
    return best`,
  codeNote: `\`seed_sum(nums)\` is \`nums[0] + nums[1] + nums[2]\` — legal because \`3 <= n\` is promised. \`better\` is
the shared tie-break helper from above.`,
  mistake: `> **Watch out.** Seeding \`best = 0\`. The misconception is that \`0\` is a neutral starting point. It is
> not a *sum* — it is a value no triple may have produced, and if it happens to sit nearer the target
> than anything reachable, the function returns a number that is not any triple's sum at all.

Measured on the worked example it returns \`0\` instead of \`2\`. On the statement's third example,
\`nums = [1,1,1,0]\`, \`target = -100\`, it also returns \`0\` where the answer is \`2\` — because \`0\` is
nearer \`-100\` than any real triple is. The seed must be a **reachable** sum; \`seed_sum\` guarantees
that, and the constraint \`3 <= n\` is what makes it safe.

(A sentinel like \`float("inf")\` also works, but it forces the tie-break comparison to cope with a
non-integer and makes the function return type a lie. Seeding with a real triple is cleaner.)`,
  cost: `**Time \`O(n³)\`** — three nested walks, \`n(n−1)(n−2)/6\` triples, three additions each; at \`n = 500\`
that is about \`2 × 10^7\` sums, slow but not fatal. **Space \`O(1)\`** — two loop counters and \`best\`.

Use it as the reference a fast version is stress-tested against, which is precisely its job in the
script below, and as the first thirty seconds of an interview answer. It is also the only rung that
needs no sorting, so it is the one to keep if the input must not be reordered and you cannot afford a
copy.

---`,
}
