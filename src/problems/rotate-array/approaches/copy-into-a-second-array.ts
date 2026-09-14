// rotate-array — approach 2 — Copy into a second array
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "copy-into-a-second-array",
  title: "Copy into a second array",
  idea: `*If every value's final position is known in advance, why walk it there one slot at a time?* The
value at index \`i\` ends at \`(i + k) % n\` — that is the specification, written as a formula. Allocate
a second array, write each value straight into its destination, copy back.

This fixes Approach 1's weakness: **it rewrites all \`n\` values \`k\` times over**, dragging each value
through every slot between its start and its finish, when one expression names the finish directly.`,
  intuition: `> **Intuition.** Stop thinking about sliding and start thinking about **addressing**. A rotation is a
> fixed, known mapping from old position to new. Given a blank array of the same size you never have
> to worry about what is already in a destination slot, because nothing is — so values can be placed
> in any order, in one pass, with no interference. The modulo does one job: turning an address that
> ran off the right end into the equivalent address at the front. The price of that freedom is the
> blank array, which is exactly what the follow-up forbids.`,
  worked: `\`nums = [1, 2, 3, 4, 5, 6, 7]\`, \`k = 3\`, \`n = 7\`.

| \`i\` | \`nums[i]\` | destination \`(i + 3) % 7\` | \`moved\` after this write |
|---|---|---|---|
| 0 | \`1\` | \`3\` | \`[_, _, _, 1, _, _, _]\` |
| 1 | \`2\` | \`4\` | \`[_, _, _, 1, 2, _, _]\` |
| 2 | \`3\` | \`5\` | \`[_, _, _, 1, 2, 3, _]\` |
| 3 | \`4\` | \`6\` | \`[_, _, _, 1, 2, 3, 4]\` |
| 4 | \`5\` | \`0\` — wrapped | \`[5, _, _, 1, 2, 3, 4]\` |
| 5 | \`6\` | \`1\` | \`[5, 6, _, 1, 2, 3, 4]\` |
| 6 | \`7\` | \`2\` | \`[5, 6, 7, 1, 2, 3, 4]\` |

Then copy \`moved\` back over \`nums\`. Seven writes plus seven copies, and no value written twice.`,
  code: `def rotate_array_second_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    moved = [0] * n
    for i in range(n):
        moved[(i + k) % n] = nums[i]  # the computed index is a DESTINATION, so it goes left
    for i in range(n):
        nums[i] = moved[i]
    return nums`,
  mistake: `> **Watch out.** The misconception is that \`(i + k) % n\` is "the index the rotation pairs with \`i\`",
> which leaves it ambiguous whether it names a **source** or a **destination**. Both spellings are
> true statements about *some* rotation, so neither looks wrong in isolation. Decide once which it
> is, and say so in the code.

Putting the formula on the right — \`moved[i] = nums[(i + k) % n]\` — gives, measured on
\`[1, 2, 3, 4, 5, 6, 7]\` with \`k = 3\`:

\`\`\`
[4, 5, 6, 7, 1, 2, 3]
\`\`\`

That is a rotation **left** by 3. The tell is the first element: a right rotation by 3 must begin
with the value that was 3 from the end, which is \`5\`, not \`4\`. On a symmetric input such as
\`[1, 1, 2, 2, 1, 1]\` it can even produce the right answer by accident.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Time is two independent linear passes with constant work per slot and
no nesting. Space is the full-size scratch array — \`n\` extra integers, about 400 KB at the stated
limits — and that is the whole of the cost.

Use it when the input must not be mutated and you may return a new array: the copy-back pass then
disappears and this is the cleanest correct solution there is. Use it also when the permutation is
**arbitrary** rather than a rotation, because "write each value to its computed destination in a
blank array" works for any permutation, while both tricks below work only because a rotation has very
particular structure.

---`,
}
