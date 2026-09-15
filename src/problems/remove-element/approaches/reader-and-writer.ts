// remove-element — approach 4 — Reader and writer
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
  rung: "reader-and-writer",
  title: "Reader and writer",
  idea: `*The counting pass exists only to learn the length of the answer — but the compaction loop already
knows it.* Every time the writer advances, that is one more survivor; when the reader runs out, the
writer's position **is** the count. So delete the first pass. One loop, one comparison per element,
and the length falls out of the cursor instead of being computed separately — which also removes
the second place the match test could be written differently by accident.`,
  intuition: `A reader and a writer walking the same row of boxes, the writer always at or behind the reader. The
reader visits every box exactly once. The writer stands on the slot where the next survivor belongs.
When the reader finds something that is not \`val\`, that value is copied to the writer's slot and the
writer steps forward; when the reader finds a match, it moves on alone and the gap widens. **The gap
between the two cursors is precisely the number of copies of \`val\` passed so far**, and the writer's
final position is precisely the length of the answer. Nothing else needs to be tracked, because the
writer was the counter all along.`,
  worked: `Input: \`nums = [0, 1, 2, 2, 3, 0, 4, 2]\`, \`val = 2\`. This is the compaction pass from the previous
approach with the counting pass deleted, so the trace of the array is identical — what changes is
that there is no \`keep\` variable and the return uses \`write\`.

| Step | \`read\` (value) | \`write\` before | Action | Array after | Gap (\`val\`s passed) |
|---|---|---|---|---|---|
| 1 | 0 (\`0\`) | 0 | survivor → \`nums[0] = 0\`, write → 1 | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 0 |
| 2 | 1 (\`1\`) | 1 | survivor → \`nums[1] = 1\`, write → 2 | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 0 |
| 3 | 2 (\`2\`) | 2 | match → skip | unchanged | 1 |
| 4 | 3 (\`2\`) | 2 | match → skip | unchanged | 2 |
| 5 | 4 (\`3\`) | 2 | survivor → \`nums[2] = 3\`, write → 3 | \`[0, 1, 3, 2, 3, 0, 4, 2]\` | 2 |
| 6 | 5 (\`0\`) | 3 | survivor → \`nums[3] = 0\`, write → 4 | \`[0, 1, 3, 0, 3, 0, 4, 2]\` | 2 |
| 7 | 6 (\`4\`) | 4 | survivor → \`nums[4] = 4\`, write → 5 | \`[0, 1, 3, 0, 4, 0, 4, 2]\` | 2 |
| 8 | 7 (\`2\`) | 5 | match → skip | unchanged | 3 |

The reader is spent and \`write = 5\`, so the answer is the first five cells, \`[0, 1, 3, 0, 4]\`. Eight
reads, five writes, one pass, nothing allocated. The array is now \`[0, 1, 3, 0, 4, 0, 4, 2]\` and the
tail \`[0, 4, 2]\` is meaningless — which is why the tests below compare only the first \`k\` entries.`,
  code: `def remove_element_reader_writer(nums: list[int], val: int) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return nums[:write]  # the writer's final position IS the answer's length`,
  mistake: `Advancing the writer outside the \`if\` — putting \`write += 1\` at the end of the loop body so it
runs on every iteration. Now the writer moves in lockstep with the reader, every value is copied
onto itself, nothing is ever removed, and the function returns the whole array unchanged. It is a
one-line slip that produces perfectly plausible output, and it passes any test whose input happens
to contain no copies of \`val\`. The writer must advance **only when something has actually been
placed** — that conditional advance is the entire mechanism, because it is what opens the gap.

The close relative: returning \`len(nums)\` or \`read\` instead of \`write\`. Both are "a number that
looks like a length", and both are the wrong one.`,
  cost: `**Time O(n), space O(1).** One pass, one comparison per element, at most one write per element, no
allocation. Every index is read exactly once and no index is ever revisited.

This is the answer, and it is the template for an entire family: remove-duplicates-from-sorted-array,
move-zeroes, partition-by-predicate, \`std::remove\` in the C++ standard library (which is literally
this loop and which, famously, does not actually shrink the container — it returns the new end, just
like this returns \`k\`). Learn the shape, not the snippet: *reader visits everything, writer advances
only on a keeper, writer's final position is the length.*

---`,
}
