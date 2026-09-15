// first-missing-positive — approach 2 — Sort, then walk.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort-then-walk",
  title: "Sort, then walk",
  idea: `*The candidate scan re-reads the whole array once per candidate. What if the values were arranged so
that a single left-to-right walk could settle every candidate at once?* Sort them. Once the values are
in order, you can hold a single counter for "the next positive I am still looking for" and advance it
every time the array hands you exactly that number. This fixes the candidate scan's exact weakness:
the restarted inner sweep.`,
  intuition: `Walk the sorted array holding one number in your head — \`want\`, starting at 1. Each value you meet
falls into one of three cases. If it is *less than* \`want\` (a negative, a zero, or a duplicate of
something already counted), ignore it and keep walking. If it *equals* \`want\`, that candidate is
present, so bump \`want\` by one and keep going. If it is *greater than* \`want\`, you have just walked
past the place where \`want\` should have been and it was not there — so \`want\` is the answer and you
can stop. Sorting is what makes the third case a proof rather than a guess: in sorted order, nothing
smaller can appear later.`,
  worked: `Input: \`nums = [3, 4, -1, 1]\`. Sorted, that becomes \`[-1, 1, 3, 4]\`.

| Value | \`want\` before | Case | \`want\` after |
|---|---|---|---|
| −1 | 1 | less than \`want\` — noise, skip | 1 |
| 1 | 1 | equals \`want\` — present | 2 |
| 3 | 2 | **greater than \`want\`** — 2 was never here | 2, and stop |

Answer 2, in three steps plus the cost of the sort. Compare with the seven comparisons the candidate
scan needed on this tiny array; at n = 100,000 the gap is n log n versus n².`,
  code: `def first_missing_positive_sort_then_walk(nums: list[int]) -> int:
    """Destroys nums: sorts it in place."""
    nums.sort()
    want = 1
    for x in nums:
        if x == want:
            want += 1
        elif x > want:  # the run of wanted values has been overshot, so want is missing
            break
    return want`,
  mistake: `Writing \`elif x != want: break\` — that is, breaking on anything that is not the wanted value. Now the
leading \`-1\` in \`[-1, 1, 3, 4]\` breaks the loop immediately and the function returns 1, which is
wrong. The same bug fires on any duplicate: \`[1, 1, 2]\` sorted is \`[1, 1, 2]\`, \`want\` becomes 2 after
the first \`1\`, the second \`1\` is not 2, and you return 2 — the correct answer here by luck, but on
\`[1, 1, 2, 3]\` it returns 2 while the true answer is 4. The three cases really are three: skip,
advance, stop. Only *overshooting* proves absence.`,
  cost: `**Time O(n log n), space O(1) beyond the sort** (the in-place sort itself costs O(log n) of stack in
most libraries, and this version destroys the caller's array; \`sorted(nums)\` would cost O(n) instead).
The time is the sort; the walk afterwards is a single linear pass and free by comparison.

This is the right choice when you are handed data that is *already sorted* — then it is an O(n) answer
with no cleverness at all — or when n log n is fast enough and you want code that is obviously
correct. In an interview it is the honest second thing to say: it beats the quadratic version and it
sets up the question that leads to the next rung, namely *why am I paying to order values when the
question only ever asks whether one specific number is present?*

---`,
}
