// first-missing-positive — approach 1 — Try 1, then 2, then 3.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "try-1-then-2-then-3",
  title: "Try 1, then 2, then 3",
  idea: `*How do I know whether the answer is 1?* Scan the array looking for a 1. *And if it is there?* Then
try 2, then 3, and so on. The first candidate that is absent is the answer. The bound above tells you
where to stop: n+1 candidates is always enough, because the array cannot block more than n of them.
This is the baseline, and it uses nothing about the input except that you can compare its elements
for equality.`,
  intuition: `A bouncer with a list of names, calling them out one at a time. "Is 1 in the building?" — walk the
whole room, ask everyone. "Yes." — "Is 2 in the building?" — walk the whole room again. The first
name nobody answers to is the answer. The reason it is slow is obvious from the picture: you walk the
entire room from scratch for every name, and the walk for name 5 re-reads every person that the walks
for names 1 through 4 already read. Nothing learned in one sweep is carried into the next.

The one genuinely important thing this approach contains is the loop bound. \`range(1, n + 2)\` is the
bound argument made executable, and it is the part of this problem an interviewer is actually testing.`,
  worked: `Input: \`nums = [3, 4, -1, 1]\` — the same input traced through every approach in this document. n = 4,
so candidates run 1 through 5.

| Candidate | Scan of \`[3, 4, -1, 1]\` | Verdict |
|---|---|---|
| 1 | 3? no. 4? no. −1? no. **1? yes** | present, try the next candidate |
| 2 | 3? no. 4? no. −1? no. 1? no | **absent → answer 2** |

Two candidates, seven element comparisons. Notice that the scan for candidate 2 re-read all four
elements the scan for candidate 1 had already read. On an array where the answer is n+1, every one of
the n+1 candidates triggers a full n-element scan — that is where the quadratic blowup lives. The
array is never written to.`,
  code: `def first_missing_positive_try_each_candidate(nums: list[int]) -> int:
    for c in range(1, len(nums) + 2):  # n + 1 candidates is always enough
        found = False
        for x in nums:
            if x == c:
                found = True
                break
        if not found:
            return c
    return len(nums) + 1`,
  mistake: `Bounding the candidate loop by the largest value in the array instead of by n+1 — \`for c in
range(1, max(nums) + 2)\`. On \`[7, 8, 9, 11, 12]\` that happens to work, but on \`[-5, -3]\` the maximum
is negative, the range is empty, and the function falls through to whatever the default is. It also
does far more work than necessary on \`[1000000]\`, walking a million candidates for a one-element
array. The bound is a property of the array's **length**, not of its contents, and getting that
backwards is the single most common wrong instinct on this problem.`,
  cost: `**Time O(n²), space O(1).** The cost is n+1 candidates each triggering a scan of up to n elements,
with nothing remembered between candidates. Space is one counter and one flag.

Use it when n is tiny, or — its real job — as a trustworthy oracle to cross-check the clever versions
against, which is exactly what it does in the stress test at the bottom of this file. It is also the
right thing to say out loud first in an interview, because saying it forces you to state the n+1
bound, and the bound is the insight the rest of the solution is built on.

---`,
}
