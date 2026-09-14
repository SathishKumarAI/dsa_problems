// find-all-duplicates — approach 3 — Count in a hash map.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "count-in-a-hash-map",
  title: "Count in a hash map",
  idea: `*Sorting spends O(n log n) arranging values into an order the question never asked about — it only
asks how many times each value occurs. Can that be asked directly?* Yes: walk once, tallying each
value in a dictionary, then walk the candidates 1..n and take the ones whose tally is 2. This fixes
sorting's weakness — the ordering work the answer makes no use of — and it leaves the input
untouched.`,
  intuition: `A tally sheet. As each number walks past you make a mark next to it on the sheet; at the end you
read off every name with two marks. No number is ever compared against another number; the only
operation is "find this name's row and increment it", which a hash map does in constant expected
time. Notice the trade being made explicit for the first time: you buy linear time with linear
memory, and that memory holds nothing but facts the input already contained.`,
  worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`.

Pass 1 builds the tally, one value at a time:

| Value seen | Map after |
|---|---|
| 4 | \`{4: 1}\` |
| 3 | \`{4: 1, 3: 1}\` |
| 2 | \`{4: 1, 3: 1, 2: 1}\` |
| 7 | \`{4: 1, 3: 1, 2: 1, 7: 1}\` |
| 8 | \`{4: 1, 3: 1, 2: 1, 7: 1, 8: 1}\` |
| 2 | \`{…, 2: 2, …}\` |
| 3 | \`{…, 3: 2, …}\` |
| 1 | \`{4: 1, 3: 2, 2: 2, 7: 1, 8: 1, 1: 1}\` |

Pass 2 walks the candidates 1, 2, 3, 4, 5, 6, 7, 8 and keeps those with a count of exactly 2: \`2\`
and \`3\`. Answer \`[2, 3]\`, ascending because the candidate walk is ascending. The map peaked at six
entries.`,
  code: `def find_all_duplicates_count_in_hash_map(nums: list[int]) -> list[int]:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    out: list[int] = []
    for v in range(1, len(nums) + 1):  # walk the candidates, not the map, to get order
        if counts.get(v, 0) == 2:
            out.append(v)
    return out`,
  mistake: `Writing \`counts[x] = counts[x] + 1\` without the \`.get(x, 0)\` default, which raises \`KeyError\` on the
first sighting of every value. The subtler version of the same bug is testing \`counts[v] == 2\` in
the second loop: values in 1..n that never appeared have no key at all, so the lookup throws. Both
are fixed by defaulting to 0, and in production code by reaching for \`collections.Counter\`, which
defaults for you. This file uses a plain \`dict\` so the mechanism stays visible instead of hiding in
a library.`,
  cost: `**Time O(n), space O(n).** Time is two linear passes with an O(1) expected hash operation at each
step. Space is the map, which holds one entry per distinct value — up to n of them.

This is the right choice when the values are **not** confined to 1..n: a hash map keys on anything
hashable, so it is the approach that survives the follow-up "now the values are arbitrary 64-bit
integers" or "now they are strings". It is also the one that generalises to "appears *k* times",
because it stores a count rather than a flag. Here it is two rungs short only because the promised
value range makes both the hashing and the extra allocation avoidable.

---`,
}
