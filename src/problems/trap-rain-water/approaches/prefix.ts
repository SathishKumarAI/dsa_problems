// trap-rain-water — approach 2 — Precomputed prefix and suffix maxima
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
  rung: "prefix",
  title: "Precomputed prefix and suffix maxima",
  idea: `*The per-column version recomputes the same two maxima from scratch n times — can each one be
computed once and looked up?* Yes: the tallest bar at or before \`i\` is just the tallest at or before
\`i−1\` compared against \`height[i]\`, so one forward pass fills an entire array of prefix maxima, and
one backward pass fills the suffix maxima. This fixes the brute force's exact weakness — the
repeated scanning — by spending memory to remember it.`,
  intuition: `Two horizons drawn along the skyline. The left horizon is a staircase that only ever goes up as you
walk rightward: at each column it records the highest thing you have seen so far. The right horizon
is the same staircase walked from the other end. Draw both, and the water level at any column is
simply the lower of the two staircases there, with the column's own height subtracted. The insight
is that a running maximum is *incremental* — each step is one comparison against the previous
answer — so both horizons cost one pass each. Three passes total, and no scan ever restarts.`,
  worked: `Input: \`height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]\`, the same input as above.

Forward pass builds \`left\`, each entry \`max(previous entry, height[i])\`:

| i | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| \`height\` | 0 | 1 | 0 | 2 | 1 | 0 | 1 | 3 | 2 | 1 | 2 | 1 |
| \`left\` | 0 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 | 3 |
| \`right\` | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 2 | 1 |
| \`min\` | 0 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 2 | 2 | 2 | 1 |
| water | 0 | 0 | **1** | 0 | **1** | **2** | **1** | 0 | 0 | **1** | 0 | 0 |

Total **6**, identical to the brute force column by column — as it must be, since it computes the
same two numbers by a cheaper route. Notice the \`left\` staircase never descends and the \`right\`
staircase never ascends; that monotonicity is the whole reason a single pass suffices, and it is
also the seed of the next approach.`,
  code: `def trap_rain_water_prefix_suffix(height: list[int]) -> int:
    n = len(height)
    if n == 0:
        return 0
    left = [0] * n
    right = [0] * n
    left[0] = height[0]              # seeding with the bar itself, not 0, keeps it inclusive
    for i in range(1, n):
        left[i] = max(left[i - 1], height[i])
    right[n - 1] = height[n - 1]     # the matching seed at the other end — easy to forget
    for i in range(n - 2, -1, -1):
        right[i] = max(right[i + 1], height[i])
    return sum(min(left[i], right[i]) - height[i] for i in range(n))`,
  mistake: `Forgetting to seed \`right[n - 1] = height[n - 1]\` and letting it stay at the zero the array was
allocated with. The backward pass then propagates a right-horizon that is short by however tall the
last bar is, and every column to its left gets a water level that is too low or, worse, negative.
On the statement's example it returns 5 instead of 6; on \`[4, 2, 3]\` it returns −3; on
\`[5, 0, 0, 0, 5]\` it returns −5. Negative totals are the tell: any time this problem's answer comes
out below zero, a maximum array is unseeded or a max is being taken over the wrong range.

The related slip is direction. The suffix loop must run from \`n - 2\` **down** to \`0\` and read
\`right[i + 1]\`; writing the same loop forward and reading \`right[i - 1]\` compiles, runs, and
computes a second copy of the prefix maxima under a different name, so \`min(left[i], right[i])\`
becomes \`left[i]\` and the answer is wildly too large.`,
  cost: `**Time O(n), space O(n).** Three linear passes — forward for \`left\`, backward for \`right\`, and one
more to sum — and two extra arrays of n integers each, which is where the space goes.

This is a genuinely good answer and worth keeping in your head even though the next rung beats it on
space. Two reasons. First, it is far easier to *derive* under pressure: write the column formula,
notice each maximum is a running one, and the code writes itself, with no correctness argument
needed beyond "a prefix maximum is a prefix maximum". Second, it is the version that generalises —
the two-dimensional variant of this problem (water trapped on a height *grid*) has no two-pointer
analogue at all and is solved with a priority queue processing the boundary inward, which is much
closer in spirit to precomputed horizons than to converging pointers. If an interviewer asks for
linear time and does not mention space, this answer is complete.

---`,
}
