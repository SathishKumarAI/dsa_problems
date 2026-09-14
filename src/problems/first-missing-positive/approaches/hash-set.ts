// first-missing-positive — approach 3 — Hash set.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "hash-set",
  title: "Hash set",
  idea: `*Sorting spends O(n log n) putting the values into an arrangement the answer never reads — it only
ever asks "is this number here?". Can that be asked directly?* Yes: pour everything into a set, then
probe 1, 2, 3, … until a probe misses. Each probe is O(1) expected, so the whole thing is linear. This
fixes sorting's weakness: the ordering work that the answer makes no use of.`,
  intuition: `Same bouncer as Approach 1, except now the guest list is indexed. Instead of walking the room to
answer "is 1 here?", you glance at a lookup structure that answers it in one step. You still ask the
candidates in order — 1, 2, 3 — because you want the *smallest* missing one, but each question is now
cheap instead of costing a full sweep. The trade is stated plainly for the first time in this ladder:
you buy linear time with linear memory, and the input is never touched.

Note how few probes you actually make. The probing loop stops the instant it misses, so it runs
\`answer\` times, and \`answer\` is at most n+1 — total work is linear, and usually much less.`,
  worked: `Input: \`nums = [3, 4, -1, 1]\`.

Pass 1 builds the set: \`{3, 4, -1, 1}\`. Four inserts, and note that \`-1\` goes in too even though it
can never matter — the set has no idea which values are relevant.

Pass 2 probes:

| Probe | In the set? | Action |
|---|---|---|
| 1 | yes | try 2 |
| 2 | **no** | return 2 |

Two probes. The answer is 2, and the array comes back untouched.`,
  code: `def first_missing_positive_hash_set(nums: list[int]) -> int:
    seen = set(nums)
    want = 1
    while want in seen:
        want += 1
    return want`,
  mistake: `Believing the \`while\` loop can run away. It cannot, and knowing why is the point: \`seen\` holds at most
n distinct values, so it cannot contain all of 1, 2, …, n+1, and the loop is guaranteed to miss by
candidate n+1 at the latest. The real mistake here is a different one — reaching for this version when
the interviewer said "constant extra space" and then being unable to say what is wrong with it. It is
not slow. It is O(n) memory, and the memory holds negatives and billion-sized values that could never
have participated in the answer, which is exactly the wastefulness the next rung removes.`,
  cost: `**Time O(n), space O(n).** Time is one linear pass to build the set plus at most n+1 constant-time
probes. Space is the set, which holds up to n distinct values of arbitrary magnitude.

This is the right choice when the input must survive, when you are not being asked for constant space,
and above all when the values are **not** integers in a small range — a set keys on anything hashable,
so this is the version that survives "now the values are 64-bit" or "now they are strings you want to
order somehow". It is also the version most production code should ship: it is four lines, obviously
correct, and O(n) memory on a 100,000-element array is nothing to worry about.

---`,
}
