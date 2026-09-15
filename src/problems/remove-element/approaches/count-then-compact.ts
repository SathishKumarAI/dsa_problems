// remove-element — approach 3 — Count, then compact
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
  rung: "count-then-compact",
  title: "Count, then compact",
  idea: `*The filtered copy is linear but it allocates a whole second array to hold values that already
exist in the first one. Can the survivors be packed into the array they came from?* Yes — and the
first instinct is that you need to know how many there will be before you start, so make one pass
to count the survivors and a second to slide them to the front. The count gives you the length to
return, the compaction pass puts the values where the length says they are, and nothing is
allocated.`,
  intuition: `Two trips down the row of boxes. The first trip is pure arithmetic: tally how many boxes hold
something other than \`val\`, touching nothing. The second trip does the work: read every box in
turn, and each time you find a survivor, copy it into the next free slot at the front of the row.
The safety of that second trip is the point worth understanding — the destination slot is always at
or behind the box being read, because you can never have kept more values than you have read, so
you are only ever stamping on boxes you have already finished with.`,
  worked: `Input: \`nums = [0, 1, 2, 2, 3, 0, 4, 2]\`, \`val = 2\`.

**Pass 1 (count):** reads \`0, 1, 2, 2, 3, 0, 4, 2\`; five of those are not \`2\`, so \`keep = 5\`.
Nothing is written.

**Pass 2 (compact):** \`read\` visits every index, \`write\` marks the next free slot at the front.

| Step | \`read\` (value) | \`write\` before | Action | Array after | Gap |
|---|---|---|---|---|---|
| 1 | 0 (\`0\`) | 0 | survivor → \`nums[0] = 0\`, write → 1 | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 0 |
| 2 | 1 (\`1\`) | 1 | survivor → \`nums[1] = 1\`, write → 2 | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 0 |
| 3 | 2 (\`2\`) | 2 | match → skip | unchanged | 1 |
| 4 | 3 (\`2\`) | 2 | match → skip | unchanged | 2 |
| 5 | 4 (\`3\`) | 2 | survivor → \`nums[2] = 3\`, write → 3 | \`[0, 1, 3, 2, 3, 0, 4, 2]\` | 2 |
| 6 | 5 (\`0\`) | 3 | survivor → \`nums[3] = 0\`, write → 4 | \`[0, 1, 3, 0, 3, 0, 4, 2]\` | 2 |
| 7 | 6 (\`4\`) | 4 | survivor → \`nums[4] = 4\`, write → 5 | \`[0, 1, 3, 0, 4, 0, 4, 2]\` | 2 |
| 8 | 7 (\`2\`) | 5 | match → skip | unchanged | 3 |

Return \`nums[:keep]\` = \`nums[:5]\` = \`[0, 1, 3, 0, 4]\`. Thirteen reads to place five survivors —
eight in the counting pass, five more re-read in the compaction pass — and note the array's tail is
now \`[0, 4, 2]\`, leftover rubbish that the problem explicitly does not care about.`,
  code: `def remove_element_count_then_compact(nums: list[int], val: int) -> list[int]:
    keep = 0
    for x in nums:
        if x != val:
            keep += 1
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return nums[:keep]`,
  mistake: `Letting the two passes drift apart — writing the count as \`if x != val\` and the compaction test as
\`if nums[read] is not val\`, or counting matches (\`if x == val: drop += 1\`) and then returning
\`len(nums) - drop\` while the compaction loop uses a subtly different condition. The bug class is
the same in every costume: **the same predicate is now written in two places, and nothing forces
them to agree.** When they disagree the returned length no longer matches the number of values
actually packed at the front, so the caller reads either too few survivors or one slot of garbage
past the end — and the array itself looks perfectly reasonable, so the failure surfaces far from
its cause. (\`is not val\` is the nastiest instance in Python: it compares identity, works for small
integers because of interning, and fails for larger ones.)`,
  cost: `**Time O(n), space O(1).** Two linear passes — \`2n\` reads and up to \`n\` writes — with no
allocation. Asymptotically identical to the next rung; measurably slower by a constant factor, and
one extra place to be wrong.

It earns its place in exactly one situation: when the destination is not the source. If you must
know the output size *before* you can allocate or reserve the destination — writing into a
fixed-size buffer, a database column, a network frame with a length header — then the counting pass
is not redundant, it is the header. Here, where the destination is the array you are already
reading, it is a pass that buys nothing.

---`,
}
