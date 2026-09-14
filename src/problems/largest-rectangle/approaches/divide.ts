// largest-rectangle — approach 2 — Divide and conquer at the shortest bar
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
  rung: "divide",
  title: "Divide and conquer at the shortest bar",
  idea: `*The brute force re-measures the same neighbours from every bar — can one observation settle many
bars at once?* Yes. Find the shortest bar in the range. Any rectangle either avoids it entirely,
lying wholly to its left or wholly to its right, or it spans it — and if it spans it, its height can
be at most that minimum, so the best spanning rectangle is \`minimum × full width\`. Three cases, two of
them recursive. This fixes brute force's weakness — **every bar paying for its own outward walk** — by
making the work follow the recursion instead of the bar pairs.`,
  intuition: `> **Intuition.** The shortest bar is a **fence post** across the channel. Any rectangle you draw
> either steps over that post — in which case the post caps its height, and the widest such rectangle
> is obviously the one spanning the whole range — or it stays strictly on one side of it, which is a
> smaller copy of the same puzzle. Solve the two smaller puzzles the same way and take the best of
> the three answers.

The appeal is that one glance at the minimum settles every rectangle that crosses it, however many
there are. The catch is that it settles *nothing* about the two sides, so the recursion's shape
depends entirely on where the minimum happens to fall.`,
  worked: `\`heights = [2, 1, 5, 6, 2, 3]\`. The state here is the **call stack**, not a data stack — which is
itself worth noticing, because it is the same last-in-first-out structure showing up as recursion
instead of as an array. Indentation is depth; each row shows the range, its minimum, and the spanning
candidate.

| Call | Range | Min at (height) | Spanning candidate | Returns |
|---|---|---|---|---|
| \`solve(0,5)\` | \`[2,1,5,6,2,3]\` | 1 (\`h=1\`) | \`1 × 6 = 6\` | **10** |
| \`solve(0,0)\` | \`[2]\` | 0 (\`h=2\`) | \`2 × 1 = 2\` | 2 |
| \`solve(2,5)\` | \`[5,6,2,3]\` | 4 (\`h=2\`) | \`2 × 4 = 8\` | 10 |
| \`solve(2,3)\` | \`[5,6]\` | 2 (\`h=5\`) | \`5 × 2 = 10\` | **10** |
| \`solve(3,3)\` | \`[6]\` | 3 (\`h=6\`) | \`6 × 1 = 6\` | 6 |
| \`solve(5,5)\` | \`[3]\` | 5 (\`h=3\`) | \`3 × 1 = 3\` | 3 |

Unwinding: \`solve(2,3)\` returns \`max(10, 0, 6) = 10\`; \`solve(2,5)\` returns \`max(8, 10, 3) = 10\`; the
root returns \`max(6, 2, 10) = 10\`. Answer **10**.

Notice that the winning rectangle appeared as a *spanning* candidate at \`solve(2,3)\` — the range
\`[5, 6]\` whose minimum is \`5\`. That is the same rectangle the brute force found at bar 2, arrived at
from the opposite direction: instead of asking how far bar 2 spreads, this asked what the minimum of
an already-chosen range is.`,
  code: `def largest_rectangle_divide_and_conquer(heights: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if lo > hi:
            return 0
        m = min(range(lo, hi + 1), key=heights.__getitem__)
        spanning = heights[m] * (hi - lo + 1)  # the only rectangle that may cross the minimum
        return max(spanning, solve(lo, m - 1), solve(m + 1, hi))

    return solve(0, len(heights) - 1)`,
  mistake: `Recursing on \`solve(lo, m)\` and \`solve(m + 1, hi)\` — that is, letting the minimum bar stay inside the
left half instead of excluding it.

> **Watch out.** The misconception is treating this like a **binary search split**, where the two
> halves must cover everything so nothing gets missed. Here the middle element has already been fully
> accounted for by the \`spanning\` candidate, so including it again is not thoroughness, it is
> non-termination: when the minimum is the first element, \`m == lo\`, and \`solve(lo, m)\` is the call
> you are already inside.

Running that variant on this document's worked example raises \`RecursionError\` rather than returning a
wrong number. The three cases must **partition** the range — strictly left of the minimum, the
minimum itself, strictly right of it — and \`m - 1\` is what makes the left piece strict.`,
  cost: `**Time \`O(n log n)\` typical, \`O(n²)\` worst case; space \`O(log n)\` typical, \`O(n)\` worst.** The cost is
the linear scan for the minimum at every node of the recursion: when the minimum lands near the middle
the range halves each time, giving \`log n\` levels of \`O(n)\` work. When the input is sorted the minimum
is always at one end, one side is empty, the recursion is \`n\` deep, and the scans sum to \`n²/2\` — with
a call stack \`n\` frames deep to match.

It is worth understanding and not worth shipping here, because a later rung beats it on every axis.
Its real value is transferable: "split at the extreme element, handle the three cases" is the same
move behind Cartesian trees and range-minimum problems, and with an \`O(1)\` range-minimum structure the
scan disappears and this becomes genuinely \`O(n)\`. Mention it, price its worst case against the stated
\`10^5\`, and move on.

---`,
}
