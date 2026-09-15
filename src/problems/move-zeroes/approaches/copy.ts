// move-zeroes — approach 1 — Filter into a copy
//
// Converted from docs/deep/move-zeroes_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "copy",
  title: "Filter into a copy",
  idea: `*What does the answer actually look like?* It is the non-zero values, in their original order,
followed by enough zeroes to fill out the length. *So can I just build that?* Yes — walk the input
once collecting everything non-zero, append zeroes until the new list is as long as the old one,
and then copy it back over the original so the caller sees it. This is the baseline: it describes
the answer directly and builds it in the most literal way possible.`,
  intuition: `Think of copying a shopping list onto a fresh card, skipping every crossed-out line, and then
ruling blank lines at the bottom so the new card is the same length as the old one. Finally you
trace the new card back onto the old one, line for line, because the person who gave you the list
is holding *that* card and will not look at yours. Each stage is obvious on its own and none of
them requires you to think about index arithmetic. The cost is equally obvious from the picture:
you needed a second card, and you wrote every kept item twice.`,
  worked: `Input: \`nums = [0, 1, 0, 3, 12]\` — the statement's own example, and the same input traced through
every approach in this document.

**Stage one — collect the non-zeroes:**

| Reading index | Value | Kept? | \`kept\` after this step |
|---|---|---|---|
| 0 | 0 | no | \`[]\` |
| 1 | 1 | yes | \`[1]\` |
| 2 | 0 | no | \`[1]\` |
| 3 | 3 | yes | \`[1, 3]\` |
| 4 | 12 | yes | \`[1, 3, 12]\` |

**Stage two — pad to the original length:**

\`\`\`
kept = [1, 3, 12]         len 3, needs to be 5
kept = [1, 3, 12, 0]      len 4
kept = [1, 3, 12, 0, 0]   len 5 — done
\`\`\`

**Stage three — copy back into the caller's array:**

| Write | Array state |
|---|---|
| start | \`[0, 1, 0, 3, 12]\` |
| \`nums[0] = 1\` | \`[1, 1, 0, 3, 12]\` |
| \`nums[1] = 3\` | \`[1, 3, 0, 3, 12]\` |
| \`nums[2] = 12\` | \`[1, 3, 12, 3, 12]\` |
| \`nums[3] = 0\` | \`[1, 3, 12, 0, 12]\` |
| \`nums[4] = 0\` | \`[1, 3, 12, 0, 0]\` |

Five reads, a five-element list allocated, and five more writes — plus the three writes that built
\`kept\` in the first place. Thirteen operations and one extra array for a five-element input.`,
  code: `def move_zeroes_filter_into_copy(nums: list[int]) -> list[int]:
    kept = [x for x in nums if x != 0]
    while len(kept) < len(nums):
        kept.append(0)
    for i in range(len(nums)):
        nums[i] = kept[i]  # copy back, because the caller owns the original list
    return nums`,
  mistake: `Returning \`kept\` instead of copying it back — \`return [x for x in nums if x != 0] + [0] * nums.count(0)\`.
The sequence it produces is exactly right, and the function still fails the problem, because the
caller is holding \`nums\` and will see it completely unchanged. This is the in-place requirement
biting: a correct answer delivered to the wrong address. In Python the mistake is especially easy
to make because \`nums = kept\` inside the function *looks* like it assigns the result — it only
rebinds the local name and leaves the caller's list untouched. The fix is the explicit element-wise
write loop, or \`nums[:] = kept\`, both of which write through to the object the caller holds.`,
  cost: `**Time O(n), space O(n).** The time is three linear passes — filter, pad, copy back — so roughly
2n writes and n reads. The space is the \`kept\` list, which in the worst case (no zeroes at all)
holds every element of the input.

Use it when the array is small, when clarity is worth more than a second allocation, or when you
genuinely want the filtered values as their own list for some other purpose. It is also the natural
oracle for checking a cleverer version — "keep the non-zeroes in order, pad with zeroes" is a
restatement of the problem, so it is almost impossible to get wrong, which is precisely why the test
script at the bottom of this file uses that formula as its reference.

---`,
}
