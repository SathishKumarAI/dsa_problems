// boats-to-save — approach 4 — Count the weights into buckets.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "count-the-weights-into-buckets",
  title: "Count the weights into buckets",
  idea: `*Sorting costs \`O(n log n)\` — but these are small whole numbers, so does anything actually need
comparing?* No. Count how many people share each weight, then walk one cursor down from \`limit\` and
one up from 1 over that table of counts. Removing a person becomes "decrement a counter", which is a
single write and shifts nothing.

This fixes the queue's weakness — **taking a person off the front moves every person behind them.**`,
  intuition: `> **Intuition.** Instead of a line of people, picture a row of numbered pigeonholes, one per possible weight from 1 to
> \`limit\`, each holding a tally of how many people weigh that much. The heaviest person still waiting is
> found by walking the high cursor down until it lands on a non-empty hole; the lightest by walking the
> low cursor up. Neither cursor ever goes backwards, so across the entire run they cover the row once
> each, and everything else is arithmetic on counters. The catch — and it is the whole reason this is
> not the final rung — is that the row is as long as the weight *limit*, not as long as the crowd.`,
  worked: `\`people = [3, 2, 2, 1]\`, \`limit = 3\`. The table of counts, indexed by weight 1…3, is

\`\`\`
weight:  1  2  3
count:   1  2  1
\`\`\`

| round | \`high\` walks down to | take | \`low\` walks up to | fits? | counts after | waiting | boats |
|---|---|---|---|---|---|---|---|
| 1 | 3 (count 1) | one person of weight 3 | 1 (count 1) | 1 + 3 = 4 > 3 — no | \`1, 2, 0\` | 3 | 1 |
| 2 | 2 (count 2) | one person of weight 2 | 1 (count 1) | 1 + 2 = 3 ≤ 3 — yes | \`0, 1, 0\` | 1 | 2 |
| 3 | 2 (count 1) | the last person of weight 2 | — (nobody waiting) | — | \`0, 0, 0\` | 0 | 3 |

Three boats again. The decisions are identical to every rung above; only the machinery changed. Note
round 3: the \`waiting > 0\` check is what stops the low cursor from being consulted when the person
just taken was the last one.`,
  code: `def boats_to_save_buckets(people: list[int], limit: int) -> int:
    count = [0] * (limit + 1)  # +1 because a person may weigh exactly the limit
    for w in people:
        count[w] += 1
    low, high = 1, limit
    waiting = len(people)
    boats = 0
    while waiting > 0:
        while count[high] == 0:  # neither cursor ever moves back, so both are O(limit) in total
            high -= 1
        count[high] -= 1
        waiting -= 1
        boats += 1
        if waiting > 0:  # without this, the low cursor could re-seat the person just taken
            while low <= limit and count[low] == 0:
                low += 1
            if low <= limit and fits_one_boat(low, high, limit):
                count[low] -= 1
                waiting -= 1
    return boats`,
  codeNote: `\`fits_one_boat\` is the shared rule from Approach 1 — every rung asks it the same question.`,
  mistake: `> **Watch out.** Allocating \`count = [0] * limit\` instead of \`limit + 1\`. It looks right — there are \`limit\` distinct
> weights, 1 through \`limit\` — but index \`limit\` is then one past the end, and the constraints
> explicitly permit \`people[i] == limit\`. On the worked example, where somebody weighs exactly 3 and
> the limit is 3, Python raises \`IndexError: list index out of range\` on the very first person. Python
> at least tells you; C++ writes past the end of the vector and corrupts whatever was next in memory,
> which is the same bug with a much worse failure mode. Whenever a table is indexed by a value, size it
> by \`max_value + 1\`, not \`max_value\`.`,
  cost: `**Time \`O(n + limit)\`, space \`O(limit)\`.** The \`n\` is the single pass that fills the table; the \`limit\` is
the two cursors, each of which crosses the table once and never turns around. The space is one
counter per possible weight. There is no \`log n\` anywhere — which is exactly why this rung tempts
people, and exactly where it misleads.

Use it when the weight range is genuinely small relative to the crowd — thousands of people with
weights 1…100 is its home ground, and there it beats sorting outright. Do **not** reach for it by
default here, and the reason is worth saying precisely: with \`limit = 30000\` and two people to ferry,
this allocates thirty thousand counters and then walks over all of them, while a sort touches two
elements. *"Linear" means nothing until you say linear in what* — this rung is linear in a quantity
the problem never promised would be small.

---`,
  notes: [
    { title: "what must be true, and what breaks if it is not", body: `The assumption is that weights are whole numbers in a **small, known, non-negative range** — here
1…30000, which is 30 KB of counters and entirely affordable. Break any part of it and the rung
collapses: fractional weights have no bucket to live in, and a range of 10⁹ would need a gigabyte of
counters to ferry two people. This problem's constraints do grant the assumption, which is why the
rung is real rather than hypothetical — but granting it is not the same as it being the best choice,
and the next section is why.` },
  ],
}
