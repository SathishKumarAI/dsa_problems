// trap-rain-water — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/trap-rain-water_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `Picture a city skyline drawn on graph paper: a row of solid columns, each one square wide, each as
tall as the number at its position. Now let it rain. Water lands everywhere, runs off the peaks, and
settles in the dips between taller columns. Count the squares of water left standing. Unlike the
container problem, the columns here are **solid** — they take up space, water rests *on top of*
them, and the bars in between two walls are part of the landscape rather than empty air.

**The core question is: for each column, how high does the water stand above it?** The naive
approach is slow because it answers that question independently for every column, and answering it
once requires scanning the whole array in both directions — so n columns each cost n work.

The single most useful reframing is this: **stop thinking about pools and think about columns.**
A pool is an irregular shape with a left wall, a right wall and a floor, and reasoning about pools
means finding boundaries and handling nested cases. A column is one number. The water standing on
column \`i\` is

\`\`\`
water(i) = min( tallest bar at or before i , tallest bar at or after i ) − height[i]
\`\`\`

and it is never negative. Water is held in by the taller wall on each side, but it can only rise to
the height of the *lower* of those two walls, because above that level it spills out over the low
side. Sum \`water(i)\` over every column and you are done. Every approach below is a different way of
computing those two maxima cheaply.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`1 <= height.length <= 2 * 10^4\` | n² is 4 × 10⁸ — borderline-to-failing, so the per-column rescan must go. The bound also means the array is never empty, so \`n = 1\` is a real case you must handle (it traps nothing). |
| \`0 <= height[i] <= 10^5\` | Heights are bounded and non-negative, so \`0\` is a legal bar and the total fits comfortably in a 64-bit integer. Non-negativity matters: it means a running maximum can be seeded at \`0\` rather than at negative infinity, which is what makes the two-pointer version's \`left_max = right_max = 0\` initialisation correct. |
| water needs a taller bar on **both** sides; the two ends never hold any | This is the \`min(left, right)\` in the formula, and it is also the reason no clamp to zero is needed once you define both maxima as *inclusive* of column \`i\` itself — a column that is its own prefix maximum gets \`min(…) = height[i]\` and contributes exactly 0. |
| a strictly increasing or strictly decreasing map traps nothing, whatever its size | A useful sanity check and a useful intuition: water needs a dip, and a monotone landscape has none. Check your implementation against \`[1,2,3,4,5]\` before anything else. |

Note what this problem does **not** give you: the array is not sorted, and sorting it would be
meaningless — the whole question is about which bar stands where, so rearranging them destroys the
problem. As with container-with-most-water, the two-pointer solution here earns its correctness from
a structural argument about maxima, not from ordering. Sortedness is doing no work in this document
at all, and that is worth noticing, because it is the standard misconception about when two pointers
apply.

---`
