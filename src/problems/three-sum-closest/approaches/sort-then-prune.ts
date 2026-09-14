// three-sum-closest — approach 2 — Sort, then prune the inner loop
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
  rung: "sort-then-prune",
  title: "Sort, then prune the inner loop",
  idea: `*The blind triple loop cannot tell a hopeless candidate from a promising one — can the data be
arranged so it can?* Sort the values. Then for a fixed first and second value, the innermost sums are
**monotonically increasing** in \`k\`, so the moment one reaches the target, every later \`k\` only
overshoots further and the scan can stop. This fixes brute force's weakness: **after seeing a sum far
above the target it still had to check the rest.**`,
  intuition: `> **Intuition.** You are turning a dial upward looking for a mark. Unsorted, the dial jumps about at
> random and you must try every position. Sorted, the dial only ever climbs — so the first time you
> pass the mark, you are done, because everything beyond is further past it. The last value below and
> the first value at-or-above are the only two that can be closest, and a monotone walk hands you both
> for free at the moment it stops.

This is also the first appearance of the theme that runs through the rest of the ladder: **sorting is
bought once and sold repeatedly.** Here it buys an early \`break\`. Later it buys a binary search, and
then it buys the pointer sweep.`,
  worked: `Sorted: \`[-4, -1, 1, 2]\`, \`target = 1\`. \`best\` is seeded with \`-4 + -1 + 1 = -4\`.

| \`i\` (\`nums[i]\`) | \`j\` (\`nums[j]\`) | \`k\` (\`nums[k]\`) | \`s\` | \`\\|s − 1\\|\` | \`best\` after | then |
|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 2 (1) | −4 | 5 | −4 | \`s < 1\`, continue |
| 0 (−4) | 1 (−1) | 3 (2) | −3 | 4 | **−3** | \`s < 1\`, inner loop ends |
| 0 (−4) | 2 (1) | 3 (2) | −1 | 2 | **−1** | \`s < 1\`, inner loop ends |
| 1 (−1) | 2 (1) | 3 (2) | 2 | 1 | **2** | \`s >= 1\` → **break** |

Result **2**. ✅

The last row is the pruning doing its work: \`s = 2\` reaches the target, \`best\` is updated *first*, and
only then does the loop break. On this tiny array there is nothing left to skip; on a long ascending
tail the break is what removes it.`,
  code: `def three_sum_closest_sort_then_prune(nums: list[int], target: int) -> int:
    nums = sorted(nums)                      # a copy: the caller's order is not ours to change
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
                if s >= target:              # sorted, so every later k only overshoots further
                    break
    return best`,
  mistake: `> **Watch out.** Putting the \`break\` **before** the \`best\` update. The misconception is that a sum at
> or above the target is out of contention. It is the opposite — it is one of the **two best
> candidates** for this pair, the first one on the high side, and the one below it is the other. Break
> before recording and you throw away the better half of the bracket every time.

Measured on the worked example it returns \`-1\` instead of \`2\` — the winning triple is exactly the sum
that trips the break. On \`nums = [0,5,5,6,9]\`, \`target = 14\`, it returns \`11\` where \`14\` is reachable
exactly. Record, then break; the order of those two lines is the whole rung.`,
  cost: `**Time \`O(n log n)\` for the sort plus \`O(n³)\` worst case** — the sort is dominated, and the pruning is
a constant-factor win, not a class change: a target above every reachable sum never trips the break,
so the inner loop still runs to the end every time. **Space \`O(1)\`** beyond the sorted copy.

Its value is pedagogical rather than practical: it is the rung where **sorting starts paying**, and
where you first see that the two sums bracketing the target are the only ones that matter for a fixed
pair. Say that sentence out loud and the next two rungs both fall out of it. Do not ship it — say what
it does not fix (the worst case is unchanged) and move up.

---`,
}
