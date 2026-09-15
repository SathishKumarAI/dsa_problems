// trap-rain-water — approach 3 — Two converging pointers (optimal)
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
  rung: "ends",
  title: "Two converging pointers (optimal)",
  idea: `*The previous rung stores both horizons in full, but the water level at a column is \`min\` of the
two — so you only ever need the **smaller** one. Can you always know which side is smaller without
having computed both?* Yes. Stand a pointer at each end. Whichever pointer is on the shorter bar has
the guarantee it needs: a taller bar exists on the far side, so its own running maximum is already
the binding constraint. This fixes the prefix/suffix rung's weakness — the 2n integers of storage —
by keeping only two running maxima in two variables.`,
  intuition: `Two surveyors walking toward each other, each carrying one number: the tallest bar seen so far on
their own side. At each step they compare the bars they are standing on, and **the one standing on
the shorter bar takes the next step**. That surveyor can settle their column immediately, because
the other surveyor is standing on something taller, which proves a sufficiently tall wall exists
somewhere on the far side — so the far side is not what is limiting the water here; their own
running maximum is. Settle the column, step inward, repeat. The picture to hold is that you never
need both horizons at once, only the lower one, and the shorter bar tells you for free which one
that is.`,
  worked: `Input: \`height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]\`, the same input again.

| Step | i (\`h[i]\`) | j (\`h[j]\`) | Side taken | \`left_max\` | \`right_max\` | Water added | Total |
|---|---|---|---|---|---|---|---|
| 1 | 0 (0) | 11 (1) | left (0 < 1) | 0 | 0 | 0 − 0 = 0 | 0 |
| 2 | 1 (1) | 11 (1) | right (1 < 1 false) | 0 | 1 | 1 − 1 = 0 | 0 |
| 3 | 1 (1) | 10 (2) | left (1 < 2) | 1 | 1 | 1 − 1 = 0 | 0 |
| 4 | 2 (0) | 10 (2) | left (0 < 2) | 1 | 1 | 1 − 0 = **1** | 1 |
| 5 | 3 (2) | 10 (2) | right (2 < 2 false) | 1 | 2 | 2 − 2 = 0 | 1 |
| 6 | 3 (2) | 9 (1) | right (2 < 1 false) | 1 | 2 | 2 − 1 = **1** | 2 |
| 7 | 3 (2) | 8 (2) | right (2 < 2 false) | 1 | 2 | 2 − 2 = 0 | 2 |
| 8 | 3 (2) | 7 (3) | left (2 < 3) | 2 | 2 | 2 − 2 = 0 | 2 |
| 9 | 4 (1) | 7 (3) | left (1 < 3) | 2 | 2 | 2 − 1 = **1** | 3 |
| 10 | 5 (0) | 7 (3) | left (0 < 3) | 2 | 2 | 2 − 0 = **2** | 5 |
| 11 | 6 (1) | 7 (3) | left (1 < 3) | 2 | 2 | 2 − 1 = **1** | 6 |

After step 11 the pointers meet at index 7 and the loop stops. Total **6** — and every column's
contribution matches the brute-force table exactly, column 2 giving 1, column 5 giving 2, and so on,
though they were settled in a completely different order. Eleven iterations, two arrays fewer.

Note the running maxima at each moment are *not* the true left and right maxima of the whole array —
at step 4, \`left_max\` is 1 while the array's overall maximum is 3. That is fine and it is the point:
\`left_max\` is the true maximum of everything the left pointer has *walked past*, which is exactly
what limits column 2, and the argument below is what guarantees the other side never limits it more.`,
  code: `def trap_rain_water_two_pointers(height: list[int]) -> int:
    i, j = 0, len(height) - 1
    left_max = right_max = 0          # 0 is a safe seed only because heights are non-negative
    total = 0
    while i < j:
        if height[i] < height[j]:
            # a taller bar stands at j, so the right side is not the binding wall here
            left_max = max(left_max, height[i])
            total += left_max - height[i]
            i += 1
        else:
            right_max = max(right_max, height[j])
            total += right_max - height[j]
            j -= 1
    return total`,
  mistake: `**Adding the water before updating the running maximum.** Writing
\`total += left_max - height[i]\` and only then \`left_max = max(left_max, height[i])\` looks like a
harmless reordering, but when \`height[i]\` is taller than everything seen so far the subtraction goes
negative and quietly steals water from the total. On the statement's example that returns 2 instead
of 6. Update the maximum first; then the term is guaranteed non-negative, because \`left_max\` is now
at least \`height[i]\` by construction — which is also why no \`max(0, …)\` clamp is needed anywhere in
this function.

The other classic is comparing the wrong things: \`if left_max < right_max\` instead of
\`if height[i] < height[j]\`. That variant happens to also be correct (it is the other standard
formulation of this algorithm), which makes it a dangerous thing to half-remember — mix the two, as
in \`if height[i] < right_max\`, and you get code that passes small tests and fails on inputs where the
two conditions diverge. Commit to one formulation and keep its argument attached to it.`,
  cost: `**Time O(n), space O(1).** Each iteration settles exactly one column and moves exactly one pointer
inward, so the loop runs at most n − 1 times; the only storage is two indices, two running maxima
and a total. Compared with the previous rung this is one pass instead of three and two variables
instead of 2n integers.

This is the answer to ship when space is constrained or when the interviewer says "now do it in
constant space" — which, on this problem, they will. Keep the prefix/suffix version in your pocket
anyway: it is the safer thing to write first if you are unsure, and it is the version you can extend
when the question turns two-dimensional.`,
  notes: [
    { title: "the exchange argument — why settling a column early is safe", body: `This is the crux, and it is the part most write-ups replace with "and then it works". The algorithm
commits to a final answer for column \`i\` while knowing the true maximum of only *one* side. That
needs justification.

**The claim.** When \`height[i] < height[j]\`, the water on column \`i\` is exactly
\`left_max − height[i]\`, where \`left_max = max(height[0..i])\` — the right side can be ignored
entirely.

**Why.** By definition, \`water(i) = min(L, R) − height[i]\` where \`L = max(height[0..i])\` and
\`R = max(height[i..n−1])\`. The code's \`left_max\` after its update *is* \`L\`, so the claim reduces to
showing \`L <= R\`, which makes \`min(L, R) = L\`. Two cases:

1. **Column \`i\` is itself the tallest so far**, i.e. \`L = height[i]\`. Then, since \`j > i\` and
   \`height[j] > height[i]\`, we have \`R >= height[j] > height[i] = L\`. So \`L < R\`, and the water is
   \`L − height[i] = 0\` — correct, a column that is its own prefix maximum holds nothing from the
   left.

2. **Something earlier is taller**, i.e. \`L = height[p]\` for some \`p < i\`. Here is the key
   observation: the left pointer only ever advanced past position \`p\` *because* at that moment
   \`height[p] < height[j_p]\` for whatever index \`j_p\` the right pointer held. The right pointer only
   ever moves leftward, so \`j_p >= j > i\`, meaning that taller bar at \`j_p\` is **still to the right
   of \`i\`**. Therefore \`R >= height[j_p] > height[p] = L\`. Again \`L < R\`.

In both cases \`L <= R\`, so \`min(L, R) = L\` and the column can be settled on the left maximum alone.
The mirror argument covers the other branch: when \`height[j] <= height[i]\`, the right pointer is on
the shorter (or equal) bar, the same reasoning gives \`R <= L\`, and column \`j\` is settled on
\`right_max\` alone.

**What this buys, and why it is an "exchange" argument.** The thing being discarded is not a
candidate answer — it is the *obligation to look at the other side*. Every step trades a full
right-scan for a single comparison, justified by the fact that the taller bar you can currently see
is proof that a tall-enough wall exists over there, whatever its exact height. You never learn the
true \`R\` for the columns you settle from the left, and you never need to.

**Termination and completeness.** Each iteration settles one column and retires that pointer's
position permanently, so the loop runs exactly \`n − 1\` times at most and every column except the
final meeting point is settled exactly once. The column at the meeting point is the tallest bar in
the array (or tied for it) and holds no water, which is why the strict \`i < j\` loses nothing. And no
column is settled twice, so nothing is double-counted.

---` },
  ],
}
