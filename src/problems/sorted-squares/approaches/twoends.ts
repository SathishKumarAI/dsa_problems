// sorted-squares — approach 3 — Two pointers from the ends, filling backwards (optimal)
//
// Converted from docs/deep/sorted-squares_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "twoends",
  title: "Two pointers from the ends, filling backwards (optimal)",
  idea: `*The merge works, but it needs a scan to locate the split, two pointers that start adjacent, and
four loops to handle both runs and both drains. Is there a place to stand where the two runs are
already separated?* Yes — the two ends. The most negative value sits at the left end and the largest
positive at the right end, so **the largest square is always at one end or the other**, never in the
middle. Compare the two ends, take the bigger, write it into the last unfilled slot of the output,
and move that pointer inward. This fixes the merge version's fiddliness: no split to find, no drain
loops, and the two pointers start as far apart as possible and finish when they meet.`,
  intuition: `Two fingers on the ends of the input and one finger on the *back* of the output, all three walking
inward or backward together. Because magnitude grows toward both ends, the two values under your
input fingers are the two largest-magnitude candidates still in play — one of them is certainly the
biggest square remaining, and a single comparison says which. That one gets written to the last
empty output slot; its finger steps inward; the output finger steps back. Every step places exactly
one value and consumes exactly one input, so after n steps the output is full and both input fingers
have met.

The reason this fills *backwards* rather than forwards is worth holding onto, because it is the
whole design decision: the ends give you the **largest** square cheaply and say nothing about the
smallest. The smallest square lives near zero, somewhere in the middle, and its position is not
known without a scan. So you can produce the output largest-first or not at all — and
largest-first, written into an array from the back, is the same thing as sorted ascending.`,
  worked: `Input: \`nums = [-4, -1, 0, 3, 10]\` — the same array once more. Start with \`out = [0, 0, 0, 0, 0]\`,
\`i = 0\`, \`j = 4\`, and the write cursor \`at = 4\`.

| \`at\` | \`i\` (value, square) | \`j\` (value, square) | Bigger | Written | Move | \`out\` after |
|---|---|---|---|---|---|---|
| 4 | 0 (\`-4\`, 16) | 4 (\`10\`, 100) | right | \`100\` | \`j → 3\` | \`[0, 0, 0, 0, 100]\` |
| 3 | 0 (\`-4\`, 16) | 3 (\`3\`, 9) | left | \`16\` | \`i → 1\` | \`[0, 0, 0, 16, 100]\` |
| 2 | 1 (\`-1\`, 1) | 3 (\`3\`, 9) | right | \`9\` | \`j → 2\` | \`[0, 0, 9, 16, 100]\` |
| 1 | 1 (\`-1\`, 1) | 2 (\`0\`, 0) | left | \`1\` | \`i → 2\` | \`[0, 1, 9, 16, 100]\` |
| 0 | 2 (\`0\`, 0) | 2 (\`0\`, 0) | tie → right | \`0\` | \`j → 1\` | \`[0, 1, 9, 16, 100]\` |

Five steps for five elements, no scan, no drain, two comparisons' worth of bookkeeping. The last row
is the one to look at: \`i\` and \`j\` have converged on the same index 2, and both "candidates" are the
same element. The tie-break sends the pointer that is not needed again inward, the loop has already
run n times and stops, and the element is emitted exactly once. This is why the loop is driven by
the *output* position (\`for at in range(n - 1, -1, -1)\`) rather than by \`while i <= j\`: counting the
output slots makes it structurally impossible to emit an element twice or skip one, regardless of
how the pointers meet.

Compare the three approaches on this input: approach 1 did 5 squarings plus a sort; approach 2 did a
2-step split scan, 4 merge steps and 1 drain; approach 3 did 5 steps flat with nothing before or
after.`,
  code: `def sorted_squares_two_pointers(nums: list[int]) -> list[int]:
    out = [0] * len(nums)
    i, j = 0, len(nums) - 1
    for at in range(len(nums) - 1, -1, -1):  # fill from the BACK: the ends hold the largest
        left = nums[i] * nums[i]
        right = nums[j] * nums[j]
        if left > right:
            out[at] = left
            i += 1
        else:
            out[at] = right
            j -= 1
    return out`,
  mistake: `Filling the output from the **front** — taking the *smaller* of the two ends and writing it at
position 0, 1, 2 and so on. It is the instinctive direction, and it is wrong, because the smallest
square is not at either end. On \`[-4, -1, 0, 3, 10]\` the first comparison is \`16\` against \`100\`, the
smaller is \`16\`, and \`16\` goes to \`out[0]\` — but the true smallest square is \`0\`, sitting in the
middle of the array where neither pointer can see it. The output comes out as
\`[16, 1, 0, 9, 100]\`: the input's squares in a shuffled order, not sorted at all. **The ends are
where the extremes of magnitude live, so the ends can tell you the maximum and never the minimum** —
and that fact alone dictates the fill direction.

The other bug worth naming is comparing the *values* rather than their squares — \`if nums[i] >
nums[j]\`. Since the array is sorted, \`nums[i] <= nums[j]\` is true at every step, so the branch never
fires, the code always takes the right-hand end, and it degenerates into copying the input's squares
in reverse. On \`[-10, 3]\` it returns \`[100, 9]\` — descending, and wrong. The comparison must be
between magnitudes, and squaring both sides is the simplest way to get there.`,
  cost: `**Time O(n), space O(n).** The loop runs exactly n times — once per output slot — with a constant
amount of work inside, so there is no scan, no log factor and no drain. The space is the output
array, which the problem demands; the only extra storage is three integers. If the caller allowed
the answer to overwrite the input, even that O(n) would not be needed for auxiliary purposes — it
is output, not working memory, which is a distinction worth being able to state.

This is the version to write. It is the shortest of the three, it is the fastest, and its shape is
the one that transfers: *when a transformation breaks sortedness, ask what structure it leaves
behind, and fill from whichever end you can answer cheaply.* Filling an array from the back to avoid
shifting is the same move that makes \`merge-sorted-array\` work in place — there, the free space is
at the end of the first array, so merging backwards is what lets you write without ever overwriting
an element you still need to read.

---`,
}
