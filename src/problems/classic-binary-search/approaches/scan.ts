// classic-binary-search — approach 1 — Read every ticket
//
// Converted from docs/deep/classic-binary-search_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "scan",
  title: "Read every ticket",
  idea: `*How do I find a value in an array?* Look at the values, one after another, until one of them is it.
If you get to the end, it was not there. This is the baseline, and its only job is to be so obviously
correct that the clever versions can be checked against it.`,
  intuition: `> **Intuition.** You are looking for a name in a phone book by starting at \`A\` and reading every
> entry. Nothing about this is wrong — it is guaranteed to find the name. What it does is **decline
> a gift**: the book is in order, and order is information about entries you have not read. The
> scan learns exactly one bit per comparison ("not this one") when a comparison against a sorted
> array could have told you about thousands of entries at once. Everything that follows is one idea
> — *spend each comparison on as many elements as possible*.`,
  worked: `\`nums = [-3, 0, 4, 9, 12]\`.

| target | \`i\` | \`nums[i]\` | equal? | action |
|---|---|---|---|---|
| **9** | 0 | \`-3\` | no | keep going |
| | 1 | \`0\` | no | keep going |
| | 2 | \`4\` | no | keep going |
| | 3 | \`9\` | **yes** | **return 3** |
| **2** | 0 | \`-3\` | no | keep going |
| | 1 | \`0\` | no | keep going |
| | 2 | \`4\` | no | keep going |
| | 3 | \`9\` | no | keep going |
| | 4 | \`12\` | no | keep going |
| | — | — | — | fell off the end → **return −1** |

Nine comparisons for a five-element array. The optimal versions below use **three**, total, for both
targets combined.`,
  code: `def classic_binary_search_linear_scan(nums: list[int], target: int) -> int:
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1`,
  mistake: `> **Watch out.** The misconception is that adding an early exit — *stop as soon as \`nums[i]\` passes
> the target, since the array is sorted* — turns the scan into something fast. It does not. It is
> **correct**, and it changes nothing that matters.

This is a case where the "buggy" variant is not buggy, and saying so is more useful than inventing a
failure:

\`\`\`python
    for i, x in enumerate(nums):
        if x == target:
            return i
        if x > target:       # correct, and worth nothing
            return -1
    return -1
\`\`\`

Run it on the worked example and it returns \`3\` for target \`9\` and \`-1\` for target \`2\` — both right.
It even saves two comparisons on the miss. But the worst case is unchanged: a target equal to the
last element, or larger than everything, still reads all \`n\` entries. \`O(n)\` is a statement about the
worst case, and the early exit does not touch the worst case. **The misconception worth naming is
"uses sortedness" being confused with "logarithmic".** Both the early exit and binary search use
sortedness. Only one of them discards a *fraction* of the remaining candidates per comparison, and
that fraction is the entire difference.

The genuinely wrong version of this rung is reaching for the language's built-in:

\`\`\`python
    return nums.index(target)     # WRONG — raises instead of returning -1
\`\`\`

On the worked example with target \`2\` that does not return anything; it raises
\`ValueError: 2 is not in list\`. The statement asked for \`-1\`, and a thrown exception is not \`-1\`.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. The cost is one comparison per element and there are \`n\` of them;
there is no state beyond the loop index, so space is a constant.

Use it as the oracle. At the bottom of this document it is the reference every other approach is
cross-checked against, and that is the right role for it: it is the only version whose correctness
you can confirm by reading it once. In an interview, name it in a sentence, name \`O(n)\`, note that
the statement explicitly demands \`O(log n)\`, and move on.

---`,
}
