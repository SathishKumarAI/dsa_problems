// missing-number — approach 2 — A table of flags
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
  rung: "table-of-flags",
  title: "A table of flags",
  idea: `*Sorting spends O(n log n) arranging values into an order the answer never reads — it only asks "is
this candidate present?". Can that be asked directly?* Yes: since every value lies in 0..n, allocate
n+1 booleans, tick off each value in its own slot, then walk 0..n and return the first slot never
ticked. This fixes sorting's weakness — the ordering work the answer makes no use of — and it leaves
the input untouched.`,
  intuition: `**The table is a row of numbered pigeonholes, and the value tells you which hole it belongs in.**
Hole 0 is for the value 0, hole 3 for the value 3, up to hole n. As each number walks past, it drops a
token in its own hole — no searching, no comparing, just a direct array write at a computed address.
Then walk the holes from 0 upward and the first empty one is the answer. Because there are n+1 holes
and only n numbers, exactly one hole is guaranteed to be empty.

This rung is where the next two become visible. Once you see the answer as "a row of n+1 pigeonholes
indexed by the values", the obvious question is: *the input is already a row of n slots and the values
are already legal indexes — why am I allocating a second row?*`,
  worked: `Input: \`nums = [3, 0, 1]\`. n = 3, so \`seen\` is four \`False\` flags, indices 0..3.

Pass 1, ticking off:

| Value | \`seen\` after |
|---|---|
| 3 | \`[F, F, F, T]\` |
| 0 | \`[T, F, F, T]\` |
| 1 | \`[T, T, F, T]\` |

Pass 2, walking the candidates:

| Candidate | \`seen[c]\` | Action |
|---|---|---|
| 0 | True | keep going |
| 1 | True | keep going |
| 2 | **False** | return 2 |

Answer 2. Two linear passes, and the array comes back exactly as it went in.`,
  code: `def missing_number_table_of_flags(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        seen[x] = True
    for i in range(n + 1):
        if not seen[i]:
            return i
    return -1  # unreachable: n + 1 candidates and only n values`,
  mistake: `Allocating \`[False] * n\` instead of \`n + 1\`. The values run up to n inclusive, so \`seen[n]\` has to
exist. On \`[1]\` (n = 1, value 1 needs slot 1) the undersized table has only slot 0 and the code raises
\`IndexError\` on the smallest legal input. The same off-by-one hides in the second loop written as
\`range(n)\`: it never examines candidate n, so \`[0, 1]\` finds no empty slot, falls through, and returns
the sentinel \`-1\` for an input whose answer is 2. The range here is \`0..n\` inclusive — n+1 candidates
— and every loop bound in this function has to say so.`,
  cost: `**Time O(n), space O(n).** One pass to tick off and one pass over n+1 candidates to find the hole,
with a direct array read or write at each step. Space is n+1 booleans.

This is the right choice when the value range is known and dense, allocation is allowed, and the input
must survive intact. It is also the only rung in this file that generalises cleanly to "more than one
number is missing" — the arithmetic rungs below collapse completely if two values are gone, because a
single sum or a single XOR cannot separate two unknowns, while the table simply reports two empty
holes.

---`,
}
