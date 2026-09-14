// remove-duplicates-sorted — approach 2 — Reader and writer, in place
//
// Converted from docs/deep/remove-duplicates-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "readwrite",
  title: "Reader and writer, in place",
  idea: `*The copy is already linear and already uses the adjacency trick — so what is actually wrong with
it?* Only the paper. It allocates a second array to hold values that already exist in the first
one. *Can the survivors go back into the array they came from?* Yes, and safely: the survivors are
always a prefix of what has been read, so the slot you want to write to is always one the reader
has already passed. Keep a second index marking where the next survivor belongs, and the fresh
list disappears — fixing the distinct copy's one weakness, its O(n) memory.`,
  intuition: `A reader and a writer walking the same row of boxes, the writer always at or behind the reader.
The reader visits every box in turn. The writer stands on the first free slot of the answer — the
place the next survivor will go. When the reader finds a value different from the last thing the
writer laid down, that value is new, so it is copied back to the writer's slot and the writer
steps forward one. When the value is a repeat, the reader moves on alone and the gap between them
widens. **That gap is exactly the number of duplicates dropped so far**, and because the writer can
never overtake the reader, every box the writer overwrites is one the reader has already finished
with.`,
  worked: `Input: \`nums = [1, 1, 2, 2, 3]\`. The writer starts at index 1, because index 0 is a survivor by
definition — the first element of a sorted array has nothing before it to be a duplicate of.

| Step | \`read\` (value) | \`write\` | Compare with \`nums[write-1]\` | Action | Array after | Gap (dropped) |
|---|---|---|---|---|---|---|
| start | — | 1 | — | index 0 is a survivor for free | \`[1, 1, 2, 2, 3]\` | 0 |
| 1 | 1 (\`1\`) | 1 | \`1\` vs \`nums[0] = 1\` | same → skip | \`[1, 1, 2, 2, 3]\` | 1 |
| 2 | 2 (\`2\`) | 1 | \`2\` vs \`nums[0] = 1\` | new → \`nums[1] = 2\`, write → 2 | \`[1, 2, 2, 2, 3]\` | 1 |
| 3 | 3 (\`2\`) | 2 | \`2\` vs \`nums[1] = 2\` | same → skip | \`[1, 2, 2, 2, 3]\` | 2 |
| 4 | 4 (\`3\`) | 2 | \`3\` vs \`nums[1] = 2\` | new → \`nums[2] = 3\`, write → 3 | \`[1, 2, 3, 2, 3]\` | 2 |

The walk ends with \`write = 3\`, so the answer is the first three cells: \`[1, 2, 3]\`.

Look hard at the final array, \`[1, 2, 3, 2, 3]\`. The tail \`2, 3\` is leftover rubbish from the
original input. **That is allowed.** The problem promises nothing about what lies beyond position
\`k\`, which is why the tests at the bottom of this file compare only the first \`k\` entries — a test
that compared the whole array would be asserting a promise the problem never made.`,
  code: `def remove_duplicates_sorted_reader_writer(nums: list[int]) -> list[int]:
    if not nums:
        return []
    write = 1  # index 0 is always a survivor, so the first free slot is 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:  # differs from the last survivor WRITTEN
            nums[write] = nums[read]
            write += 1
    return nums[:write]`,
  mistake: `Comparing against the input's previous element instead of the output's last survivor — writing
\`if nums[read] != nums[read - 1]\`. On this problem it happens to give the right answer, because
sortedness makes "different from my left neighbour" and "different from the last thing I kept"
coincide, and that coincidence is a large part of why this problem is rated easy. It is still a
trap, because the habit does not survive the very next variant. Allow each value to appear
**twice**, and the correct test becomes \`nums[read] != nums[write - 2]\` — a statement about the
output's tail, which has no equivalent phrased in terms of the input's neighbourhood. Write the
condition in terms of what you have kept and the two-copies variant is a one-character change;
write it in terms of the neighbour and you have to rediscover the whole loop.

The cheaper sibling of that bug: starting \`write\` at 0. The very first comparison then reads
\`nums[-1]\`, which in Python is the *last* element of the array rather than an error, so the code
runs silently and compares the first element against the largest one. Start the writer at 1 and
the first element is banked before the loop begins.`,
  cost: `**Time O(n), space O(1).** Each index is read exactly once and written at most once, so the cost
is one pass with one comparison per element — no nested scan, no re-reading. The space is two
integer indices; nothing is allocated regardless of how big the input is or how many duplicates it
holds.

This is the intended answer and there is no rung above it: you cannot beat one pass, and you
cannot beat constant space. Reach for it whenever the input is sorted (or you sorted it yourself)
and the task is to collapse runs of equal values. The same skeleton with a different \`if\` solves
"keep at most two of each", "remove every element equal to \`val\`", "move the zeroes to the end",
and every other in-place compaction, which is why it is worth learning as a shape rather than as a
snippet.

---`,
}
