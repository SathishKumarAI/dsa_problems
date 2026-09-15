// remove-element — approach 2 — Filter into a copy
//
// Converted from docs/deep/remove-element_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "filter-into-a-copy",
  title: "Filter into a copy",
  idea: `*Shifting the tail on every match re-copies values that were already in the right place. Can each
value be touched exactly once?* Yes, if you stop trying to close holes and start collecting
survivors instead. Walk the array once, and every time you meet something that is not \`val\`, append
it to a fresh list. The holes never exist, so they never need closing. This fixes the previous
rung's exact weakness — the repeated re-shifting of a tail that was already settled.`,
  intuition: `Copying a shopping list onto a clean sheet, leaving off the items you have decided not to buy. You
read each line once and you write each kept line once, and you never go back. The comparison with
the previous approach is stark: deleting in place is a story about *holes*, and this is a story
about *survivors*. Thinking in survivors is what makes the cost linear — and it is the idea the
remaining three rungs all keep, changing only where the survivors are put.`,
  worked: `Input: \`nums = [0, 1, 2, 2, 3, 0, 4, 2]\`, \`val = 2\`.

| Step | Reading | Is it \`val\`? | \`kept\` after |
|---|---|---|---|
| 1 | \`0\` | no | \`[0]\` |
| 2 | \`1\` | no | \`[0, 1]\` |
| 3 | \`2\` | yes → skip | \`[0, 1]\` |
| 4 | \`2\` | yes → skip | \`[0, 1]\` |
| 5 | \`3\` | no | \`[0, 1, 3]\` |
| 6 | \`0\` | no | \`[0, 1, 3, 0]\` |
| 7 | \`4\` | no | \`[0, 1, 3, 0, 4]\` |
| 8 | \`2\` | yes → skip | \`[0, 1, 3, 0, 4]\` |

Answer \`[0, 1, 3, 0, 4]\`, \`k = 5\`. Eight reads, five writes, and the original array is completely
untouched — which is exactly what the problem told you not to do.`,
  code: `def remove_element_filter_copy(nums: list[int], val: int) -> list[int]:
    kept: list[int] = []
    for x in nums:
        if x != val:
            kept.append(x)
    return kept`,
  mistake: `Doing this in place instead — iterating the array while calling \`remove()\` or \`del\` on it:

\`\`\`python
for x in nums:          # BROKEN
    if x == val:
        nums.remove(x)
\`\`\`

This is the same "the container moved underneath the cursor" bug as the previous approach, now
hidden inside a library call. \`remove\` shifts everything after the deleted element left by one, but
the \`for\` loop's internal index still advances, so every second element of an adjacent run is
skipped. \`[2, 2, 2]\` comes back as \`[2]\`. It is worth recognising because it looks like the
*clean* version — a library method instead of a hand-written shift — and it is wrong for a reason
the library call conceals. (It is also quadratic, since \`remove\` shifts.)`,
  cost: `**Time O(n), space O(n).** Each value is read once and written at most once, so the time is a
single pass. The space is the new list, which in the worst case — \`val\` never appears — is exactly
as long as the input.

Use it whenever you were not told to work in place: the caller needs the original intact, the input
is a stream or an immutable sequence, or you are writing production code where \`[x for x in nums if
x != val]\` says what it means and the allocation is irrelevant. Its other job is as an oracle for
checking the in-place versions, which is exactly its role in the script at the bottom of this file.
Here it is one rung short only because the problem explicitly forbids the second array.

---`,
}
