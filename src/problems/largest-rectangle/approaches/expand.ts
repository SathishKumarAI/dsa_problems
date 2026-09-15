// largest-rectangle — approach 1 — Brute force: spread outward from every bar
//
// Converted from docs/deep/largest-rectangle_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "expand",
  title: "Brute force: spread outward from every bar",
  idea: `*How wide can a rectangle of this bar's exact height be?* Stand on each bar in turn and walk outward
in both directions for as long as the neighbours are **at least as tall** as you, since anything
shorter would poke a hole in the rectangle. Multiply the bar's height by the span you reached, and
keep the best.`,
  intuition: `> **Intuition.** Stand on a bar and hold a **plank** at exactly your own height, then push it sideways
> in both directions. It slides freely over bars taller than you — they are above the plank, so they
> do not obstruct it — and jams the moment it meets a bar shorter than you, because the plank would
> have nothing to rest on. Where it jams on each side is the rectangle's edge.

Do that from every bar and you have measured every candidate. The waste is that the plank from bar 4
re-crosses ground the plank from bar 3 has just finished crossing, learning the same thing twice.`,
  worked: `\`heights = [2, 1, 5, 6, 2, 3]\`. There is no stack in this approach — that absence is the point of the
rung, and the "state" column shows what little is carried: nothing between rows, only the current
spread.

| Bar \`i\` | \`heights[i]\` | Spreads left to | Spreads right to | Width | Area |
|---|---|---|---|---|---|
| 0 | 2 | 0 | 0 (bar 1 is \`1\`, shorter) | 1 | 2 |
| 1 | 1 | 0 | 5 (nothing is shorter) | 6 | 6 |
| 2 | 5 | 2 (bar 1 is \`1\`, shorter) | 3 (bar 4 is \`2\`, shorter) | 2 | **10** |
| 3 | 6 | 3 | 3 | 1 | 6 |
| 4 | 2 | 2 (bar 1 is \`1\`, shorter) | 5 | 4 | 8 |
| 5 | 3 | 5 | 5 | 1 | 3 |

Best area **10**, from bar 2. Read row 1 and row 2 together and the redundancy is visible: bar 1
walked across the entire array, bars 2 and 4 then re-walked overlapping parts of it, and every one of
those walks was asking the same question — *where does it get shorter?* — about the same bars.`,
  code: `def largest_rectangle_brute_force(heights: list[int]) -> int:
    best = 0
    n = len(heights)
    for i, h in enumerate(heights):
        left = i
        while left > 0 and heights[left - 1] >= h:  # >=, so equal bars do not stop the spread
            left -= 1
        right = i
        while right < n - 1 and heights[right + 1] >= h:
            right += 1
        best = max(best, h * (right - left + 1))
    return best`,
  mistake: `Writing the spread condition as \`>\` instead of \`>=\`, so an equally tall neighbour halts the walk.

> **Watch out.** The misconception is that a rectangle is **owned** by one particular bar, so equal
> neighbours must be somebody else's territory. They are not: a bar of the same height supports your
> plank perfectly well, and refusing to walk over it truncates the rectangle to a fragment. The rule
> is that only a **strictly shorter** bar stops the spread.

Run that variant on \`[2, 2, 2]\` and it returns \`2\` where the correct answer is \`6\` — every bar stops
immediately at its identical neighbour, so the three-wide rectangle is never even considered. And it
hides beautifully: on this document's worked example it returns \`10\`, the correct answer, because
that histogram has no adjacent equal bars. Put a plateau in your test data or you will not see this.`,
  cost: `**Time \`O(n²)\`, space \`O(1)\`.** The cost comes from the two walks at each bar: on a flat histogram
every bar spreads across the whole array, giving \`n\` walks of length \`n\`. Space is three scalars —
nothing is remembered from one bar to the next, which is precisely the inefficiency.

Use it to make the "fix a bar as the height" framing concrete — it *is* that sentence transcribed —
and as the oracle the fast versions are stress-tested against, which is its job at the foot of this
document. At the stated \`n = 10^5\` it is \`10^10\` operations on flat input; name that and move up.

---`,
}
