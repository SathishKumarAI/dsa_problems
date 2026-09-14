// trap-rain-water — approach 1 — Brute force, one column at a time
//
// Converted from docs/deep/trap-rain-water_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "percolumn",
  title: "Brute force, one column at a time",
  idea: `*How much water stands on column \`i\`?* It is capped by the shorter of the tallest bar to its left
and the tallest bar to its right, so find both by scanning, subtract the column's own height, and
add it up over every column. This is the column formula transcribed literally, with no attempt to
avoid repeated work.`,
  intuition: `Walk along the skyline and stop at each column in turn. Standing on that column, look all the way
left to find the tallest thing in that direction, then all the way right for the same. The water
above your head rises to the lower of those two horizons — any higher and it would pour over the
lower one — so the depth here is that horizon minus the ground you are standing on. Do this at every
column and add up the depths. The shape to notice is the waste: every column repeats almost exactly
the same two scans its neighbour just did, and the answers differ by at most one bar.`,
  worked: `Input: \`height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]\` — twelve columns.

| i | \`height[i]\` | tallest at or before i | tallest at or after i | \`min\` | water here |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 3 | 0 | 0 |
| 1 | 1 | 1 | 3 | 1 | 0 |
| 2 | 0 | 1 | 3 | 1 | **1** |
| 3 | 2 | 2 | 3 | 2 | 0 |
| 4 | 1 | 2 | 3 | 2 | **1** |
| 5 | 0 | 2 | 3 | 2 | **2** |
| 6 | 1 | 2 | 3 | 2 | **1** |
| 7 | 3 | 3 | 3 | 3 | 0 |
| 8 | 2 | 3 | 2 | 2 | 0 |
| 9 | 1 | 3 | 2 | 2 | **1** |
| 10 | 2 | 3 | 2 | 2 | 0 |
| 11 | 1 | 3 | 1 | 1 | 0 |

Total: 1 + 1 + 2 + 1 + 1 = **6**. Look at column 8: the tallest bar to its right is only 2, so even
though a 3 stands to its left, the water level is 2 — and the column is already 2 tall, so it holds
nothing. That is \`min\` doing its job. Column 9 is the mirror case that *does* hold water: level 2,
ground 1, depth 1.`,
  code: `def trap_rain_water_brute_force(height: list[int]) -> int:
    total = 0
    for i in range(len(height)):
        left = max(height[: i + 1])   # inclusive of i, so a peak gets min(...) == height[i]
        right = max(height[i:])       # inclusive of i as well
        total += min(left, right) - height[i]
    return total`,
  mistake: `Making the two scans **exclusive** of column \`i\` — \`max(height[:i])\` and \`max(height[i+1:])\` — and
then forgetting to clamp the result at zero. On a peak, the tallest bar strictly to one side is
shorter than the column itself, so \`min(left, right) - height[i]\` goes *negative* and silently
subtracts water that other columns correctly found. On the statement's example that returns 1
instead of 6; on \`[4, 2, 3]\` it returns −6 instead of 1. There are two correct repairs and they are
not the same code: either make both scans inclusive (as above, which makes the term exactly 0 at a
peak), or keep them exclusive and write \`total += max(0, min(left, right) - height[i])\`. Pick one
deliberately. The inclusive version is the one that generalises cleanly to the next two approaches,
which is why it is written that way here.`,
  cost: `**Time O(n²), space O(1).** Each of the n columns pays two scans of up to n elements to recompute
maxima that its neighbour has almost entirely already computed. Space is a running total and two
scalars — the slicing in the Python above allocates, but the Java and C++ equivalents use explicit
inner loops and are genuinely O(1).

Use it to establish the column formula out loud before optimising, and as the oracle that validates
the fast versions — which is what it does in the stress test at the bottom of this file. At
n = 2 × 10⁴ it is around 4 × 10⁸ operations, which is exactly the kind of "might squeak through in
C++, will certainly not in Python" that you should name and then discard.

---`,
}
