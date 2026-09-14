// first-missing-positive — approach 4 — Boolean table of size n+1.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "boolean-table-of-size-n-1",
  title: "Boolean table of size n+1",
  idea: `*The set is storing every value in the input, including the negatives and the billion-sized ones that
the bound argument already proved irrelevant — and it pays a hash on every insert and every probe.
Since the answer is capped at n+1, only the values 1..n can matter. Why not index a flat table by the
value itself?* That is this rung. Allocate n+1 booleans, tick off the in-range values, and return the
first index never ticked. This fixes the set's weakness: paying for generality and storing noise.`,
  intuition: `**The table is a row of numbered pigeonholes, one per candidate, and a value tells you which hole it
belongs in.** As each number walks past, it is either in 1..n — in which case it drops a token in its
own hole — or it is noise, and it is dropped on the floor immediately. No hashing, no boxing, no
comparison of one value against another; just a direct array write. Then walk the holes from 1 upward
and the first empty one names the answer.

This rung is where the final one becomes visible. Once you see the answer as "a row of n+1 pigeonholes
indexed by the values 1..n", the next question asks itself: *the input is already a row of n slots,
and the values 1..n are already legal indexes into it — why am I allocating a second row?*`,
  worked: `Input: \`nums = [3, 4, -1, 1]\`. n = 4, so \`seen\` is five \`False\` flags (indices 0..4; slot 0 is never
used, because 0 is not a candidate).

Pass 1, ticking off:

| Value | In 1..4? | \`seen\` after |
|---|---|---|
| 3 | yes | \`[F, F, F, T, F]\` |
| 4 | yes | \`[F, F, F, T, T]\` |
| −1 | **no — noise, dropped** | \`[F, F, F, T, T]\` |
| 1 | yes | \`[F, T, F, T, T]\` |

Pass 2, walking the candidates:

| Candidate | \`seen[c]\` | Action |
|---|---|---|
| 1 | True | keep going |
| 2 | **False** | return 2 |

Answer 2. Two linear passes, and the input is untouched. Note that \`-1\` never made it into the table
at all — the set version stored it, this one refused it at the door.`,
  code: `def first_missing_positive_boolean_table(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        if 1 <= x <= n:  # anything outside 1..n can neither be nor block the answer
            seen[x] = True
    for c in range(1, n + 1):
        if not seen[c]:
            return c
    return n + 1`,
  mistake: `Dropping the \`1 <= x <= n\` guard. Without it, \`seen[x]\` on a negative value silently writes to a slot
counted from the end of the list — Python allows \`seen[-1]\` — corrupting the flag for candidate n and
producing a wrong answer with no error message; and \`seen[x]\` on a value larger than n raises
\`IndexError\` outright. On \`[3, 4, -1, 1]\` the unguarded version writes \`seen[-1] = True\`, which is
\`seen[4]\`, marking candidate 4 as present when it already was — harmless here, which is precisely why
the bug survives casual testing and then fails in production on an input where it matters.

The companion off-by-one is allocating \`[False] * n\` instead of \`n + 1\`: the value n needs slot n, and
a table of length n stops at n−1.`,
  cost: `**Time O(n), space O(n).** One pass to tick off, one pass over at most n candidates to find the hole —
with a direct array read or write at each step and no hashing at all, so the constants are noticeably
better than the set. Space is n+1 booleans, which in C++ can be a bitset of n bits and in Python is a
list of references.

This is the right choice when the value range is known and dense, allocation is allowed, and the input
must survive — it is the fastest approach in this file that does not write to \`nums\`. It is also the
version worth writing first in an interview even when you intend to do the in-place trick, because it
makes the marking scheme obvious before you start hiding it inside the data.

---`,
}
