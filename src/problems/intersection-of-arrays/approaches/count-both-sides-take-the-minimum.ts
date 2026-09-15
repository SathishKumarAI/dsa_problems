// intersection-of-arrays — approach 3 — Count both sides, take the minimum.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "count-both-sides-take-the-minimum",
  title: "Count both sides, take the minimum",
  idea: `*Sorting spends O(n log n) putting values into an order the answer never reads — the question is only
how many of each value each side holds, and ordering is not part of that. Can the counts be asked for
directly?* Yes: tally each array into its own map, then for every value emit it \`min(count₁, count₂)\`
times. This fixes sorting's weakness — the ordering work — and it states the multiplicity rule
outright as one line of code instead of leaving it to emerge from flags or cursors.`,
  intuition: `Two inventory sheets. You count what is in warehouse A, you count what is in warehouse B, and then for
each product you can ship as many units as the *emptier* warehouse holds. No item is ever compared
against another item; the only operations are "increment this product's row" and "take the smaller of
two numbers". The rule the whole problem rests on is now written down explicitly — \`min(a, b)\` — where
in every other rung it is an emergent side effect of some mechanism.

That explicitness is this rung's real value. If you are unsure whether your fancier solution is
correct, this is the version you compare it against, because you can read the rule straight off the
page.`,
  worked: `Input: \`nums1 = [4, 9, 5]\`, \`nums2 = [9, 4, 9, 8, 4]\`.

Two tally passes:

| | Map after |
|---|---|
| \`c1\` from \`[4, 9, 5]\` | \`{4: 1, 9: 1, 5: 1}\` |
| \`c2\` from \`[9, 4, 9, 8, 4]\` | \`{9: 2, 4: 2, 8: 1}\` |

Then walk the keys of \`c1\`:

| Value | count in \`c1\` | count in \`c2\` | \`min\` | Emitted |
|---|---|---|---|---|
| 4 | 1 | 2 | **1** | \`4\` |
| 9 | 1 | 2 | **1** | \`9\` |
| 5 | 1 | 0 (absent) | 0 | nothing |

Sorted for a canonical result: \`[4, 9]\`. Three passes in total (two to tally, one over the distinct
keys), two maps holding six entries between them, and neither input array is touched.`,
  code: `def intersection_of_arrays_count_both_take_min(nums1: list[int], nums2: list[int]) -> list[int]:
    c1: dict[int, int] = {}
    c2: dict[int, int] = {}
    for x in nums1:
        c1[x] = c1.get(x, 0) + 1
    for x in nums2:
        c2[x] = c2.get(x, 0) + 1
    out: list[int] = []
    for x, n in c1.items():
        take = min(n, c2.get(x, 0))  # absent on the right counts as zero, not as an error
        out.extend([x] * take)
    out.sort()
    return out`,
  mistake: `Writing \`c2[x]\` instead of \`c2.get(x, 0)\` when reading the second map. Any value present on the left
and absent on the right — the \`5\` in this example — has no key in \`c2\` at all, so the lookup raises
\`KeyError\`. It is the same defaulting bug as in every tally-building loop, and it fires on the most
ordinary input imaginable: two arrays that do not overlap completely.

The deeper mistake this rung exists to prevent is using a **set** on either side. \`set(nums1) &
set(nums2)\` is the answer to a different problem: it reports each shared value once regardless of how
many copies exist. On this example it happens to give \`{4, 9}\`, which looks right and is right by
luck; on \`nums1 = [1, 1, 1]\` against \`nums2 = [1, 1]\` it gives \`{1}\` where the answer is \`[1, 1]\`.
Presence is not multiplicity, and the moment you write \`set\` you have thrown the counts away.`,
  cost: `**Time O(n + m + k log k), space O(n + m)**, where k is the size of the answer. Time is two linear
tally passes plus one pass over the distinct keys, and the \`k log k\` is only the final sort that pins
down a canonical order — the judge accepts any order, so that term is this repo's choice, not the
problem's. Space is two maps, one per input, holding up to one entry per distinct value on each side.

This is the right choice when you want the rule visible and auditable, when both arrays are of similar
size so there is nothing to gain by treating them asymmetrically, or when you need the counts
themselves for something else afterwards. It is also the version that generalises: three arrays, or
"emit \`min\` across k arrays", is a small edit here and an awkward rewrite in every other rung.

---`,
}
