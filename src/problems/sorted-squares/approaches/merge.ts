// sorted-squares — approach 2 — Split at zero, merge two runs
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
  rung: "merge",
  title: "Split at zero, merge two runs",
  idea: `*The intermediate sequence \`[16, 1, 0, 9, 100]\` was not random — it was a descending run followed by
an ascending run. Do I need a general sort to fix that?* No. Two sorted sequences can be merged in
linear time; that is the merge step of merge sort and it costs one comparison per output element.
So find where the negatives end, treat the negative part (read right to left) and the non-negative
part (read left to right) as two ascending sequences of squares, and merge them front to back. This
fixes the sort's exact weakness: it stops paying a log factor to discover an order the input
structure already dictates.`,
  intuition: `Two queues, both already in order, and a single output line. One queue is the negatives read
*backwards* — starting from the one closest to zero, whose square is smallest, and walking left
toward the most negative, whose square is largest. The other queue is the non-negatives read
forwards, which is already smallest-square-first. At each step you look at the front of both queues
and take the smaller. When one queue empties, everything remaining in the other is already in order,
so you pour it out unchanged. That final pour is not an afterthought — it is where roughly half the
output usually comes from, and forgetting it is the classic bug.`,
  worked: `Input: \`nums = [-4, -1, 0, 3, 10]\`.

**Find the split.** Walk forward while values are negative: \`nums[0] = -4\` is negative, \`nums[1] =
-1\` is negative, \`nums[2] = 0\` is not. So \`split = 2\`. The negatives occupy indices \`[0, 1]\` and the
non-negatives occupy indices \`[2, 3, 4]\`.

Set \`i = split - 1 = 1\` (walking leftward through the negatives) and \`j = split = 2\` (walking
rightward through the non-negatives).

**Merge:**

| Step | \`i\` (value, square) | \`j\` (value, square) | Take | Move | \`out\` after |
|---|---|---|---|---|---|
| 1 | 1 (\`-1\`, 1) | 2 (\`0\`, 0) | right, \`0\` | \`j → 3\` | \`[0]\` |
| 2 | 1 (\`-1\`, 1) | 3 (\`3\`, 9) | left, \`1\` | \`i → 0\` | \`[0, 1]\` |
| 3 | 0 (\`-4\`, 16) | 3 (\`3\`, 9) | right, \`9\` | \`j → 4\` | \`[0, 1, 9]\` |
| 4 | 0 (\`-4\`, 16) | 4 (\`10\`, 100) | left, \`16\` | \`i → -1\` | \`[0, 1, 9, 16]\` |
| — | exhausted (\`i < 0\`) | 4 (\`10\`, 100) | drain the right run | \`j → 5\` | \`[0, 1, 9, 16, 100]\` |

Five output slots, five comparisons or drains, one pass over the input. Compare with approach 1,
which needed the same five squarings and then a sort on top.

Two details the trace makes concrete. First, the merge loop ran only four times and the fifth
element arrived via the drain — if you write the merge loop and stop there, you lose that \`100\`
entirely. Second, step 1 took from the right on a tie-free comparison (\`1\` vs \`0\`), but had the
input been \`[-3, 3]\` the two fronts would have been \`9\` and \`9\`; the code takes the left on a tie
(\`left <= right\`), and taking the right instead would be equally correct here — what would *not* be
correct is a comparison that advances neither pointer, which is how a tie turns into an infinite
loop.`,
  code: `def sorted_squares_split_and_merge(nums: list[int]) -> list[int]:
    n = len(nums)
    split = 0
    while split < n and nums[split] < 0:  # first index holding a non-negative value
        split += 1
    i, j = split - 1, split  # i walks the negatives leftward, j the non-negatives rightward
    out: list[int] = []
    while i >= 0 and j < n:
        left, right = nums[i] * nums[i], nums[j] * nums[j]
        if left <= right:
            out.append(left)
            i -= 1
        else:
            out.append(right)
            j += 1
    while i >= 0:  # one run is exhausted; drain the other
        out.append(nums[i] * nums[i])
        i -= 1
    while j < n:
        out.append(nums[j] * nums[j])
        j += 1
    return out`,
  mistake: `Omitting the drain loops, or writing only one of them. The merge loop stops as soon as *either*
pointer runs out, and at that moment the other run still holds everything that has not been emitted
— which on an all-negative or all-non-negative input is the entire array. On \`[-3, -2, -1]\` the
split is 3, so \`j\` starts at 3 and \`j < n\` is false immediately: the merge loop never executes even
once, and without the left-hand drain the function returns \`[]\`. On \`[0, 2, 7, 9]\` the split is 0,
\`i\` starts at −1, and the mirror happens.

Both edge cases are legal inputs, both are listed among the statement's own examples or constraints,
and both produce an empty or truncated array rather than a wrong-looking one — which is the useful
signal. **A merge is not finished when the loop ends; it is finished when both runs are empty.**

The second mistake in this family is computing the split with \`<=\` instead of \`<\`
(\`while nums[split] <= 0\`). Zeroes then land in the *negative* run, which still works — \`0 * 0 = 0\`
sorts fine from either side — right up until an input like \`[0, 0, 1]\`, where the negative run is
read right-to-left and the zeroes come out in an order that is still \`[0, 0]\` and therefore still
correct. It is a bug that never bites, which makes it worse than one that does: it teaches you that
the split boundary does not matter, and in the in-place variants of this problem it very much does.`,
  cost: `**Time O(n), space O(n).** Every iteration of the merge or a drain emits exactly one output element
and consumes exactly one input element, so the total step count is exactly n plus the linear scan
that locates the split. Space is the output array, which the problem requires; nothing else is
allocated.

Use it when the two-run structure is the thing you want to make visible in the code — this version
says "the input is two sorted sequences, merge them" in a way the next one does not — or when the
same merge has to be reused for something less symmetric. It is also the honest stepping stone: it
is the approach you arrive at by *reasoning* about what squaring does to a sorted array, whereas the
final version is the one you arrive at by then noticing a simplification.

---`,
}
