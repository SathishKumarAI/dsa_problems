// summary-ranges — approach 2 — Bucket by `value - index`
//
// Converted from docs/deep/summary-ranges_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "bucket-by-value-minus-index",
  title: "Bucket by `value - index`",
  idea: `*Can the runs be identified without walking the number line at all?* Yes — inside a consecutive run
\`nums[i] - i\` never changes, and it jumps at every gap. Use that difference as a key, bucket the
values under it, and each bucket is exactly one run.

This fixes Approach 1's weakness: **its work follows the numeric span rather than the array**, so two
numbers a billion apart cost a billion steps. Keying on \`value - index\` touches each element once, so
the cost finally follows the length of the input.`,
  intuition: `> **Intuition.** Imagine each number carrying a label saying how far ahead of its own index it sits.
> Walk along a consecutive stretch and that label never changes — you move forward one slot and the
> value moves forward one step, so the gap between them holds. Cross a hole in the sequence and the
> label jumps, because the value leapt further than the index did. Sorting the labels and reading off
> the groups gives the runs, without ever asking what lies *between* two values.`,
  worked: `\`nums = [0, 2, 3, 4, 6, 8, 9]\`. Compute the key for each element:

| \`i\` | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| \`nums[i]\` | \`0\` | \`2\` | \`3\` | \`4\` | \`6\` | \`8\` | \`9\` |
| key \`nums[i] - i\` | \`0\` | \`1\` | \`1\` | \`1\` | \`2\` | \`3\` | \`3\` |

The key is constant across \`2, 3, 4\` and constant across \`8, 9\` — exactly the two real runs — and it
changes at every gap. Building the buckets in one pass:

| after reading | \`groups\` |
|---|---|
| \`nums[0] = 0\` | \`{0: [0]}\` |
| \`nums[1] = 2\` | \`{0: [0], 1: [2]}\` |
| \`nums[2] = 3\` | \`{0: [0], 1: [2, 3]}\` |
| \`nums[3] = 4\` | \`{0: [0], 1: [2, 3, 4]}\` |
| \`nums[4] = 6\` | \`{0: [0], 1: [2, 3, 4], 2: [6]}\` |
| \`nums[5] = 8\` | \`{0: [0], 1: [2, 3, 4], 2: [6], 3: [8]}\` |
| \`nums[6] = 9\` | \`{0: [0], 1: [2, 3, 4], 2: [6], 3: [8, 9]}\` |

Then read the keys in ascending order, \`0, 1, 2, 3\`, formatting each bucket from its first and last
value: \`["0", "2->4", "6", "8->9"]\`.`,
  code: `def summary_ranges_value_minus_index(nums: list[int]) -> list[str]:
    groups: dict[int, list[int]] = {}
    for i, x in enumerate(nums):
        groups.setdefault(x - i, []).append(x)  # the key is constant inside a run
    out: list[str] = []
    for key in sorted(groups):
        run = groups[key]
        out.append(format_range(run[0], run[-1]))
    return out`,
  mistake: `> **Watch out.** The misconception is that the key *is* the group's identity, so whatever you collect
> under it will do. The key identifies **which** run an element belongs to; it says nothing about
> what the output needs, which is the run's first and last **values**.

Collecting indices — \`groups.setdefault(x - i, []).append(i)\` — produces, measured on
\`[0, 2, 3, 4, 6, 8, 9]\`:

\`\`\`
['0', '1->3', '4', '5->6']
\`\`\`

Four groups, correctly separated, and every number in the answer is wrong: \`"1->3"\` describes the
positions of the run \`2, 3, 4\`. It is easy to miss in review because the structure of the output is
right — the right count of ranges, in the right order, with the right bare-versus-arrow pattern.`,
  cost: `**Time \`O(n log n)\`, space \`O(n)\`.** Time is one linear pass to bucket, plus \`sorted(groups)\` over at
most \`n\` keys, and that sort is the only super-linear part. Space is \`O(n)\`: every element is stored
once inside a bucket.

Use it when the input is **not** sorted, or when you need the grouping itself rather than a summary —
the \`value - index\` key is a real technique that reappears in longest-consecutive-sequence variants
and in problems keyed on an arithmetic invariant. Here it does work the sortedness already did for
you, which is the next rung's argument.

---`,
}
