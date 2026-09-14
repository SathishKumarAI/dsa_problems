// container-water — approach 1 — Brute force.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Brute force",
  idea: `*Which pair holds the most water?* Compute the area for every pair and keep the largest. There is no
insight here at all — it is the definition of the problem transcribed into two loops, and its whole
purpose is to establish the number that the fast answer must match and the cost the fast answer must
beat.`,
  intuition: `Every unordered pair of positions is one candidate container, so fix the left stick, try every stick
to its right, then move the left stick along. Picture drawing every possible rectangle on the
picture of the sticks and measuring each one. There are n(n−1)/2 of them. The shape to notice is
what is *not* happening: measuring the pair (1, 8) tells you a great deal — that the pair (1, 7) can
be no taller than the shorter of sticks 1 and 8 and is definitely narrower — but this approach throws
that away and measures (1, 7) from scratch anyway. The fast version is entirely built out of that
discarded inference.`,
  worked: `Input: \`heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]\`, nine sticks, so 36 pairs. A sample of them, with
the running best:

| Pair (i, j) | Heights | Width \`j − i\` | \`min\` height | Area | Best so far |
|---|---|---|---|---|---|
| (0, 1) | 1, 8 | 1 | 1 | 1 | 1 |
| (0, 8) | 1, 7 | 8 | 1 | 8 | 8 |
| (1, 2) | 8, 6 | 1 | 6 | 6 | 8 |
| (1, 6) | 8, 8 | 5 | 8 | 40 | 40 |
| (1, 8) | 8, 7 | 7 | 7 | **49** | **49** |
| (2, 8) | 6, 7 | 6 | 6 | 36 | 49 |
| (4, 8) | 5, 7 | 4 | 5 | 20 | 49 |
| (6, 8) | 8, 7 | 2 | 7 | 14 | 49 |

The winner is (1, 8): the stick of height 8 at position 1 and the stick of height 7 at position 8,
seven apart, holding 7 × 7 = 49. Note that (0, 8) is the widest container available and it is nearly
worthless, because the stick at position 0 has height 1 and caps the whole thing at 8. Width alone
does not win.`,
  code: `def container_water_brute_force(heights: list[int]) -> int:
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            best = max(best, (j - i) * min(heights[i], heights[j]))
    return best`,
  mistake: `Writing the area as \`(j - i) * max(heights[i], heights[j])\`, or as \`heights[i] * heights[j]\`, or as
\`(j - i + 1) * min(...)\`. All three are misreadings of the geometry, and all three pass on some
inputs. \`max\` is wrong because water above the shorter stick pours out. The product of the heights
is wrong because it is not a rectangle at all. The \`+1\` is the off-by-one from problems where you
count *cells* between two indices — here the container spans the *gap*, not the endpoints, so two
adjacent sticks give width 1, not 2. Cross-check against the statement's example, where all three
wrong formulas overshoot in recognisable ways: \`max\` gives 56, the \`+1\` also gives 56, and the
product of heights gives 64. Anything but 49 means you have transcribed the geometry, not the
problem.`,
  cost: `**Time O(n²), space O(1).** The cost is the full enumeration of pairs: n choices of left stick, up to
n of right, with a constant-time area computation and nothing carried between iterations. Space is
two indices and a running maximum.

Use it on tiny inputs, and — its real job — as the reference implementation that validates the
clever version, which is exactly what it does in the stress test at the bottom of this file. The
greedy answer below is one of those algorithms that *looks* wrong to a sceptical reader, so having a
brute-force oracle to agree with it on a few thousand random inputs is how you earn confidence in it.

---`,
}
