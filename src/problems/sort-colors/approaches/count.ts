// sort-colors — approach 1 — Count, then rewrite
//
// Converted from docs/deep/sort-colors_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "count",
  title: "Count, then rewrite",
  idea: `*I know the array holds only three distinct values, and I know the order they should appear in. Do
I actually need to compare anything?* No. Count how many zeroes there are, how many ones and how
many twos. Then walk the array from the front, writing that many zeroes, then that many ones, then
that many twos. No comparison sort, no ordering to discover — the answer is fully determined by
three numbers.`,
  intuition: `Imagine sorting a pile of red, white and blue poker chips by *not* sorting them at all: you count
the pile, note "eleven red, six white, nine blue", sweep the whole pile off the table, and then lay
out eleven red chips, six white, nine blue from a fresh supply. The result is correct and the
method is almost embarrassingly simple. The thing to notice — and it is the reason this approach is
not the end of the story — is that **you did not move the original chips; you replaced them.** With
plain integers those are indistinguishable. With anything that carries a payload, they are not.`,
  worked: `Input: \`nums = [2, 0, 2, 1, 1, 0]\` — the statement's own example, and the same input traced through
both approaches in this document.

**Pass one — count:**

| Reading index | Value | \`counts\` after this step |
|---|---|---|
| 0 | 2 | \`[0, 0, 1]\` |
| 1 | 0 | \`[1, 0, 1]\` |
| 2 | 2 | \`[1, 0, 2]\` |
| 3 | 1 | \`[1, 1, 2]\` |
| 4 | 1 | \`[1, 2, 2]\` |
| 5 | 0 | \`[2, 2, 2]\` |

**Pass two — rewrite from the front, using \`at\` as the write cursor:**

| Write | Value written | \`at\` after | Array state |
|---|---|---|---|
| — | — | 0 | \`[2, 0, 2, 1, 1, 0]\` |
| \`nums[0] = 0\` | 0 | 1 | \`[0, 0, 2, 1, 1, 0]\` |
| \`nums[1] = 0\` | 0 | 2 | \`[0, 0, 2, 1, 1, 0]\` |
| \`nums[2] = 1\` | 1 | 3 | \`[0, 0, 1, 1, 1, 0]\` |
| \`nums[3] = 1\` | 1 | 4 | \`[0, 0, 1, 1, 1, 0]\` |
| \`nums[4] = 2\` | 2 | 5 | \`[0, 0, 1, 1, 2, 0]\` |
| \`nums[5] = 2\` | 2 | 6 | \`[0, 0, 1, 1, 2, 2]\` |

Twelve array accesses in total: six reads and six writes. Note the second and fourth rows, where
the array does not visibly change — the value being written happens to equal the value already
there, and the code has no idea. Every slot is overwritten unconditionally.`,
  code: `def sort_colors_count_then_rewrite(nums: list[int]) -> list[int]:
    counts = [0, 0, 0]
    for x in nums:
        counts[x] += 1  # the value IS the index: no branching, no comparison
    at = 0
    for value in range(3):
        for _ in range(counts[value]):
            nums[at] = value  # writes a fresh value, does not move the original element
            at += 1
    return nums`,
  mistake: `Building and returning a new list instead of writing back — \`return [0] * counts[0] + [1] * counts[1] + [2] * counts[2]\`.
It produces exactly the right sequence and it fails the problem, because the caller is holding the
original array and will see it unchanged. This is the in-place requirement biting: the answer is
correct but delivered to the wrong address. The fix is the explicit \`nums[at] = value\` write loop,
which puts the result where the caller is looking.

The second, subtler version of the same misunderstanding: a counting rewrite is only valid when the
elements are *interchangeable*. If the array held objects that happen to have a colour field —
\`Ball(colour=0, id="a7")\` — then writing \`nums[at] = 0\` would destroy \`id="a7"\` and replace it with
a bare zero. Counting sorts the *values*; it does not sort the *elements*. Nothing in this
problem's statement exposes the difference, which is exactly why it is easy to carry the habit into
a problem where it matters.`,
  cost: `**Time O(n), space O(1).** Two linear passes: one read pass to count, one write pass to fill, so
2n array accesses. The space is three counters, and — crucially — three is a constant *because the
alphabet is fixed at three values*. Generalised to k distinct values it is O(k), which is still
O(1) whenever k is bounded, and this is the shape of counting sort in general.

Use it when the elements are genuinely interchangeable (plain numbers, enum tags, bytes), when two
passes over the data are free, or when you want something you can write correctly in thirty seconds
and be certain about. It is also the right *starting* answer in an interview: it is linear, it beats
the library sort, and it sets up the question "can you do it in one pass?" which is what the
interviewer is waiting for.

---`,
}
