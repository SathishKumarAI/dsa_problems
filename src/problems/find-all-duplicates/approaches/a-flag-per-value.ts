// find-all-duplicates — approach 4 — A flag per value.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "a-flag-per-value",
  title: "A flag per value",
  idea: `*The map is hashing keys that are already small integers in a known range, and boxing each one.
What is that buying?* Nothing. When keys are guaranteed to be 1..n, a flat array of n+1 booleans
indexed by the value itself does the same job with a direct memory read instead of a hash. This
fixes the map's weakness — paying for generality you were promised you would not need — and as a
bonus the answer falls out during the single pass, with no second sweep.`,
  intuition: `**The array is a row of numbered pigeonholes, and the value tells you which hole it belongs in.**
Hole 1 is for the value 1, hole 2 for the value 2, up to hole n. As each number walks past, you look
in its own hole: empty means this is the first copy, so drop a token in; occupied means you have met
this number before, so it is a duplicate. One glance per element — no searching, no hashing, no
comparing of any two values against each other.

This is the rung that makes the final one obvious. Once you see the answer as "a row of n
pigeonholes", the next question asks itself: *the input is already a row of n slots — why am I
building a second one?*`,
  worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`. \`seen\` starts as nine \`False\` flags (indices 0..8; slot 0
is never used, because no value is 0).

| Step | Value | \`seen[value]\` before | Action | Answer so far |
|---|---|---|---|---|
| 1 | 4 | False | set \`seen[4] = True\` | \`[]\` |
| 2 | 3 | False | set \`seen[3] = True\` | \`[]\` |
| 3 | 2 | False | set \`seen[2] = True\` | \`[]\` |
| 4 | 7 | False | set \`seen[7] = True\` | \`[]\` |
| 5 | 8 | False | set \`seen[8] = True\` | \`[]\` |
| 6 | 2 | **True** | duplicate | \`[2]\` |
| 7 | 3 | **True** | duplicate | \`[2, 3]\` |
| 8 | 1 | False | set \`seen[1] = True\` | \`[2, 3]\` |

Eight steps, one pass, no second sweep. The input array was never written to.`,
  code: `def find_all_duplicates_flag_per_value(nums: list[int]) -> list[int]:
    seen = [False] * (len(nums) + 1)  # index by the value itself, so slot 0 goes unused
    out: list[int] = []
    for x in nums:
        if seen[x]:
            out.append(x)
        else:
            seen[x] = True
    return out`,
  mistake: `Allocating \`[False] * len(nums)\` instead of \`len(nums) + 1\`. The values run up to n inclusive, so
\`seen[n]\` has to exist — and it does not. The array \`[1]\` has n = 1, the value 1 needs slot 1, and a
one-element table only has slot 0, so the code raises \`IndexError\` on the smallest legal input. The
off-by-one is invisible on every input whose maximum value happens to be less than n, which is most
randomly generated ones, so it survives casual testing.`,
  cost: `**Time O(n), space O(n).** One pass, with an array read and possibly an array write per element —
strictly cheaper constants than the hash map, since there is no hashing and no boxing. Space is n+1
booleans, which in Python is a list of object references and in C++ can be a bitset of n bits.

This is the right choice whenever the value range is known, small, and dense, and you are allowed to
allocate — which describes an enormous number of real counting problems, not just interview ones. It
is also the version to write when the input must come back intact, because it is the fastest
approach in this file that does not touch \`nums\`.

---`,
}
