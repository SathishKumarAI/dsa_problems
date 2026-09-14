// three-sum-closest — approach 3 — Binary search for the third value
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
  rung: "binary-search-the-third",
  title: "Binary search for the third value",
  idea: `*The pruned loop still walks the tail one step at a time, and only stops early when the target sits
early in it — can the stopping point be found directly?* Yes. With the first two values fixed, the
ideal third is pure arithmetic: \`want = target - nums[i] - nums[j]\`. The tail is sorted, so binary
search for \`want\` and test only the two entries straddling it. This fixes the pruning rung's weakness:
**a target above everything makes the inner loop scan to the end, every time.**`,
  intuition: `> **Intuition.** A filing cabinet instead of a pile of index cards. With two values chosen, you know
> exactly what the third *should* be to hit the target dead on. That number is probably not in the
> cabinet — but the two files sitting either side of where it would go are the nearest things to it,
> and in a sorted cabinet you reach them by opening it halfway and discarding half, repeatedly.
> Everything further away in either direction is further from \`want\`, so nothing else needs looking
> at.`,
  worked: `Sorted: \`[-4, -1, 1, 2]\`, \`target = 1\`. \`best\` seeded at \`-4\`. The search finds \`lo\` = the first index
in the tail whose value is \`>= want\`; the candidates are \`lo - 1\` and \`lo\`, filtered to \`j < k < n\`.

| \`i\` (\`nums[i]\`) | \`j\` (\`nums[j]\`) | \`want\` | search lands at | candidates \`k\` | \`s\` | \`\\|s − 1\\|\` | \`best\` after |
|---|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | \`1 − (−4) − (−1) = 6\` | \`lo = 4\` (past the end) | \`[3]\` | −3 | 4 | **−3** |
| 0 (−4) | 2 (1) | \`1 − (−4) − 1 = 4\` | \`lo = 4\` | \`[3]\` | −1 | 2 | **−1** |
| 1 (−1) | 2 (1) | \`1 − (−1) − 1 = 1\` | \`lo = 3\` | \`[3]\` | 2 | 1 | **2** |

Result **2**. ✅

Two details worth reading off the table. In the first two rows \`want\` exceeds everything in the tail,
so the search runs off the end at \`lo = 4\`; only \`lo - 1 = 3\` survives the \`j < k < n\` filter, and it
is the right candidate — the largest available value, since \`want\` is above them all. In the third
row \`want = 1\` and \`nums[3] = 2\` is the first value \`>= 1\`, so \`lo = 3\`; \`lo - 1 = 2\` equals \`j\` and is
filtered out, correctly, because \`k\` must be a different position.`,
  code: `def three_sum_closest_binary_search(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            want = target - nums[i] - nums[j]      # the third value that would hit target exactly
            lo, hi = j + 1, n
            while lo < hi:                         # first index in the tail with nums[idx] >= want
                mid = (lo + hi) // 2
                if nums[mid] < want:
                    lo = mid + 1
                else:
                    hi = mid
            for k in (lo - 1, lo):                 # the two entries straddling want
                if j < k < n:                      # k must be a real position past j
                    s = nums[i] + nums[j] + nums[k]
                    best = better(s, best, target)
    return best`,
  mistake: `> **Watch out.** Testing only \`lo\` and not \`lo - 1\`. The misconception is that a binary search "finds
> the closest value". It does not — it finds the first value **at or above** \`want\`, which is one side
> of the bracket. The value just below it is often nearer, and when \`want\` exceeds the whole tail,
> \`lo\` runs off the end and testing only \`lo\` tests **nothing at all**.

Measured on \`nums = [-8,-6,-4,-2]\`, \`target = -13\`: it returns \`-12\` where the answer is \`-14\`. On
\`nums = [-5,-4,-3,-2]\`, \`target = 1000\` it returns \`-12\` where the answer is \`-9\`. (It happens to be
right on the worked example, which is exactly why this bug survives casual testing — always test it
against a target that lies outside the reachable range.)

The paired slip is the bounds check. \`k\` must satisfy \`j < k < n\`; dropping the \`k > j\` half lets the
search return \`k == j\` and forms a triple that uses one position twice.`,
  cost: `**Time \`O(n² log n)\`** — \`n²/2\` pairs, each paying a \`log n\` search over the tail, plus the sort.
**Space \`O(1)\`** beyond the sorted copy; the search uses three indices.

This is a genuine improvement — the worst case finally drops below cubic — and it is worth knowing for
a reason beyond this problem: it is the shape you reach for when the inner structure is sorted but the
outer loop is not amenable to a pointer sweep. Here it is not the destination, because it restarts
from scratch for every pair and throws away everything the previous search learned. That observation
is the last rung.

---`,
}
