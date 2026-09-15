// missing-number — approach 1 — Sort and scan
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort-and-scan",
  title: "Sort and scan",
  idea: `*The answer is decided by which candidate is absent — how do I find an absence?* Put the values in
order. A sorted array of distinct values drawn from 0..n *should* read 0, 1, 2, 3, … with the value at
each index equal to the index itself. The first index where that breaks is the missing number, and if
it never breaks, the hole is at the very end. This is the baseline that uses nothing but
comparability.`,
  intuition: `Think of n+1 numbered seats in a row and n people who were each assigned a seat by number, with one
person absent. Sorting is asking everyone to line up in seat order. Then you walk the line counting
0, 1, 2 — and the first person whose badge does not match your count is standing where the absentee
should be. The count tells you who is missing. If you get all the way to the end of the line without
a mismatch, the absentee was the last seat, n.`,
  worked: `Input: \`nums = [3, 0, 1]\` — the same input traced through every approach in this document. n = 3, so
the candidates are 0, 1, 2, 3.

Sorted, that is \`[0, 1, 3]\`.

| i | \`ordered[i]\` | Matches i? |
|---|---|---|
| 0 | 0 | yes |
| 1 | 1 | yes |
| 2 | **3** | **no → answer 2** |

Three steps plus the sort. Had the input been \`[0, 1]\`, every index would match and the loop would
fall off the end, returning \`len(ordered)\` = 2 — which is the case that catches people who forget the
final \`return\`.`,
  code: `def missing_number_sort_and_scan(nums: list[int]) -> int:
    ordered = sorted(nums)  # a COPY — nums.sort() would rearrange the caller's array
    for i, x in enumerate(ordered):
        if x != i:
            return i
    return len(ordered)  # every slot matched, so the gap is n itself`,
  mistake: `Omitting the final \`return len(ordered)\`. Every index matched means the missing number is n, which is
past the end of the array and therefore never visited by the loop. In Python a function that falls off
the end returns \`None\`, so \`[0, 1]\` returns \`None\` instead of 2 — and \`None\` will not raise until it
is used somewhere far away. The statement's second example exists to catch precisely this: *the gap is
past the end of the array, and nothing inside the data points at it — only the promise about the range
does.*`,
  cost: `**Time O(n log n), space O(n).** The time is entirely the sort; the scan afterwards is one linear pass.
The space is the sorted copy (sorting in place would drop it, at the cost of permuting the caller's
array).

This is the right choice when the input arrives already sorted — then it is an O(n) answer requiring no
insight at all — or when the values are not integers in a known range, so nothing below this line
applies. In an interview it is the honest first thing to say, and its real job is to set up the
question that starts the climb: *why am I ordering these values when the question only asks which one
is absent?*

---`,
}
