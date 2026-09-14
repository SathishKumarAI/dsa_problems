// remove-element — approach 1 — Delete and shift
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
  rung: "delete-and-shift",
  title: "Delete and shift",
  idea: `*How do I remove a value from an array?* The way you would remove a row from a spreadsheet: find
it, then slide everything below it up one to close the gap, and note that the list is now one
shorter. *And to remove all of them?* Repeat until the scan finds no more. This is the direct
translation of "delete" into array operations, and it is the version almost everyone writes first.`,
  intuition: `A row of numbered boxes and a rule that there must be no empty box in the middle. Every time you
empty one, you have to walk the entire rest of the row shuffling each item back one place. Two
things make it expensive, and one of them is subtle. The obvious cost is the shuffle. The subtle
one is that after a shuffle the scanning finger must **not** move on, because a brand-new value
has just slid into the box it is standing on — and that value might itself be a match. Every
implementation of this approach that advances the index unconditionally is broken on adjacent
duplicates, which is why the statement's second example puts two \`2\`s side by side.`,
  worked: `Input: \`nums = [0, 1, 2, 2, 3, 0, 4, 2]\`, \`val = 2\`. Every approach in this document traces this
same input. \`n\` is the live length, which shrinks as values are deleted.

| Step | \`i\` | \`nums[i]\` | Action | Array after | \`n\` after |
|---|---|---|---|---|---|
| 1 | 0 | \`0\` | keep, \`i → 1\` | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 8 |
| 2 | 1 | \`1\` | keep, \`i → 2\` | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 8 |
| 3 | 2 | \`2\` | match — shift 5 values left, \`i\` **stays** | \`[0, 1, 2, 3, 0, 4, 2, 2]\` | 7 |
| 4 | 2 | \`2\` | match again (the second \`2\` slid in) — shift 4 | \`[0, 1, 3, 0, 4, 2, 2, 2]\` | 6 |
| 5 | 2 | \`3\` | keep, \`i → 3\` | \`[0, 1, 3, 0, 4, 2, 2, 2]\` | 6 |
| 6 | 3 | \`0\` | keep, \`i → 4\` | unchanged | 6 |
| 7 | 4 | \`4\` | keep, \`i → 5\` | unchanged | 6 |
| 8 | 5 | \`2\` | match, nothing to its right — shift 0 | unchanged | 5 |

\`i\` has reached \`n = 5\`, so the answer is the first five cells: \`[0, 1, 3, 0, 4]\`. Nine values were
moved to place five survivors, and steps 3 and 4 show the shifted tail being re-shifted.`,
  code: `def remove_element_delete_and_shift(nums: list[int], val: int) -> list[int]:
    n = len(nums)  # the LIVE length, which shrinks with every removal
    i = 0
    while i < n:
        if nums[i] == val:
            for j in range(i, n - 1):
                nums[j] = nums[j + 1]
            n -= 1  # note i does NOT advance: a new value slid into this slot
        else:
            i += 1
    return nums[:n]`,
  mistake: `Advancing \`i\` after a deletion — writing the loop as a plain \`for i in range(len(nums))\`, or
adding an \`i += 1\` that runs in both branches. After the shift, the value now sitting at index \`i\`
is the one that used to be at \`i + 1\` and has never been examined. Skip past it and every *second*
element of a run of matches survives: \`[0, 1, 2, 2, 3, 0, 4, 2]\` comes back as \`[0, 1, 2, 3, 0, 4]\`
with a stray \`2\` still in it. The statement's second example was chosen to catch exactly this, and
a single-\`2\` test case will never find it. The rule is general: **when you delete from a container
while iterating it, the cursor must stay put**, because the container moved underneath it.`,
  cost: `**Time O(n²), space O(1).** Each removal shifts up to the whole remaining tail, and there can be up
to \`n\` removals, so an array of nothing but \`val\` performs about n²/2 moves to produce an empty
answer. Space is two integers — all the motion happens inside the array.

There is one real situation for it: when the container genuinely does not support the reader/writer
trick, for example a linked structure where you must splice, or an array where something else holds
live indices into the tail and they must stay meaningful after each removal. Otherwise its job here
is to be the baseline you name, cost, and improve. It is also the version worth keeping as a
sanity check, because the wrongness of the "advance anyway" variant is invisible on most inputs.

---`,
}
