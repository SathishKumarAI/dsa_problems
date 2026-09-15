// find-all-duplicates — approach 1 — Compare every pair.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "compare-every-pair",
  title: "Compare every pair",
  idea: `*How do I know whether a value repeats?* Compare it against everything that comes after it. *And
how do I find all of them?* Do that for every position, and collect each match. This is the
baseline. It uses nothing about the input except that it is a list of things you can compare — it
would work unchanged if the values were names, dates, or floating-point temperatures.`,
  intuition: `Picture two fingers. The outer finger parks on an element; the inner finger walks the whole
remaining tail, checking each one against it. When the tail runs out, the outer finger advances and
the inner one restarts just behind it. You are enumerating every unordered pair exactly once, which
is n(n−1)/2 comparisons in total. The shape to notice is that the inner walk *starts over* every
time: whatever the outer step at index 3 learned is thrown away before index 4 begins. Every later
approach is a different way of not throwing that away. Because a value appears at most twice, a
match fires at most once per duplicate, so the answer needs no de-duplication.`,
  worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\` — the same input traced through every approach in this
document.

| Outer i (value) | Inner walk over the tail | Result |
|---|---|---|
| 0 (4) | 3, 2, 7, 8, 2, 3, 1 | no 4 anywhere after it |
| 1 (3) | 2, 7, 8, 2, **3**, 1 | match at index 6 → collect \`3\` |
| 2 (2) | 7, 8, **2**, 3, 1 | match at index 5 → collect \`2\` |
| 3 (7) | 8, 2, 3, 1 | nothing |
| 4 (8) | 2, 3, 1 | nothing |
| 5 (2) | 3, 1 | nothing — its partner was *before* it, already counted at i = 2 |
| 6 (3) | 1 | nothing, same reason |

28 comparisons for an eight-element array. Answer collected: \`[3, 2]\`, which is \`[2, 3]\` once
sorted. Note the array is never written to — it comes back exactly as it went in.`,
  code: `def find_all_duplicates_compare_every_pair(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                out.append(nums[i])
    return out`,
  mistake: `Writing the inner loop as \`for j in range(len(nums))\` instead of \`range(i + 1, len(nums))\`. Now \`j\`
can equal \`i\`, so every element matches itself and the answer is the entire array. Starting at
\`i + 1\` fixes two things at once: it stops the self-match, and it stops you from reporting the pair
\`(a, b)\` and then \`(b, a)\` — which on \`[2, 2]\` would return \`[2, 2]\` instead of \`[2]\`.`,
  cost: `**Time O(n²), space O(1)** (not counting the answer list, which every approach must build). The
cost is the nested walk: n outer positions, each scanning up to n elements, with nothing remembered
between outer steps. Space is constant because only two indices are ever held.

Use it when n is genuinely tiny, when the values are not integers in a known range so none of the
indexing tricks apply, or as a trustworthy reference to cross-check a clever solution against —
which is exactly the job it does in the stress test at the bottom of this file.

---`,
}
