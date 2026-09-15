// remove-duplicates-sorted — approach 1 — Build a distinct copy
//
// Converted from docs/deep/remove-duplicates-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "copy",
  title: "Build a distinct copy",
  idea: `*How do I know whether a value is new?* Compare it with the last value I decided to keep — because
the input is sorted, anything equal to an already-kept value must be sitting right next to it.
*And where do the survivors go?* Into a fresh list that I append to. This is the baseline: correct,
easy to read, and it ignores the one instruction that makes the problem interesting.`,
  intuition: `Picture copying a guest list onto a clean sheet of paper, skipping any name that matches the last
one you wrote down. You only ever glance at the bottom line of your new sheet — never the whole
sheet, and never back at the original — because the original is alphabetised, so a repeat can only
ever arrive immediately after its twin. One pass down the original, one growing sheet. The thing
to notice is that the clean sheet ends up holding values that already exist a few centimetres away
in the original: you are paying for paper to store a copy of something you were already holding.`,
  worked: `Input: \`nums = [1, 1, 2, 2, 3]\`. Every approach in this document traces this same input.

| Step | Reading | Last value kept (\`out[-1]\`) | Same? | \`out\` after |
|---|---|---|---|---|
| 1 | \`1\` | — (\`out\` is empty) | new by default | \`[1]\` |
| 2 | \`1\` | \`1\` | same → skip | \`[1]\` |
| 3 | \`2\` | \`1\` | different → keep | \`[1, 2]\` |
| 4 | \`2\` | \`2\` | same → skip | \`[1, 2]\` |
| 5 | \`3\` | \`2\` | different → keep | \`[1, 2, 3]\` |

Answer \`[1, 2, 3]\`, length 3. The original array is untouched — which is exactly the problem.`,
  code: `def remove_duplicates_sorted_distinct_copy(nums: list[int]) -> list[int]:
    out: list[int] = []
    for x in nums:
        if not out or out[-1] != x:  # compare against the last value KEPT
            out.append(x)
    return out`,
  mistake: `Writing the test as \`if x not in out\`. It looks more obviously correct — "keep it if I have not
kept it already" — and it *is* correct, but \`x not in out\` is a linear scan of everything kept so
far, so the function quietly becomes O(n²): on \`[1, 2, 3, …, 30000]\`, an input with no duplicates
at all, it performs about 450 million comparisons. Sortedness means only the **last** kept value
can possibly match, so \`out[-1] != x\` answers the same question in one step. Two lines that read
as equally innocent, four orders of magnitude apart.`,
  cost: `**Time O(n), space O(n).** Each input value is looked at once and appended at most once, so the
time is a single pass with one comparison per element. The space is the output list, which in the
worst case — an input with no duplicates at all — is as long as the input.

Use it when you were never asked to work in place, when the caller must keep the original array
intact, or when the "array" is really a stream you cannot write back to. Its other job is as an
oracle: it is short enough to be obviously right, which makes it a good thing to cross-check a
cleverer implementation against. That is exactly its role in the stress test at the bottom of this
file.

---`,
}
