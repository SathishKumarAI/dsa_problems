// sorted-squares — approach 1 — Square, then sort
//
// Converted from docs/deep/sorted-squares_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort",
  title: "Square, then sort",
  idea: `*The output is the squares in sorted order. Can I just do exactly that?* Yes — square every value,
hand the resulting list to the library sort, return it. It uses nothing about the input except that
it is a list of numbers; the fact that it arrived sorted is discarded on the first line.`,
  intuition: `Somebody hands you a neatly ordered row of cards, you flip each one over to reveal a new number on
the back, and — because flipping has scrambled the order — you sweep them all into a pile and sort
the pile from scratch. Every step is correct and the result is right. The waste is visible in the
picture: the row was *nearly* sorted after the flip, in a very specific and exploitable way, and you
threw that away before looking at it.`,
  worked: `Input: \`nums = [-4, -1, 0, 3, 10]\` — the statement's own example, and the same input traced through
every approach in this document.

**Stage one — square each value, in place order:**

| index | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| \`nums\` | \`-4\` | \`-1\` | \`0\` | \`3\` | \`10\` |
| square | \`16\` | \`1\` | \`0\` | \`9\` | \`100\` |

The intermediate sequence is \`[16, 1, 0, 9, 100]\`. Notice its shape: it descends \`16, 1, 0\` and then
ascends \`0, 9, 100\`. It is a **valley** — two sorted runs meeting at the bottom — and that is
exactly the structure the next two approaches exploit and this one discards.

**Stage two — sort:**

\`\`\`
[16, 1, 0, 9, 100]  ->  sorted()  ->  [0, 1, 9, 16, 100]
\`\`\`

Five squarings and then a full comparison sort over five elements. At n = 10,000 that sort does
roughly 10,000 × log₂(10,000) ≈ 133,000 comparisons to reorganise a sequence that was already two
sorted runs.`,
  code: `def sorted_squares_square_then_sort(nums: list[int]) -> list[int]:
    return sorted(x * x for x in nums)  # squares FIRST, then sort — the order matters`,
  mistake: `Sorting before squaring — \`[x * x for x in sorted(nums)]\`. It reads almost identically and it is
wrong, because the input is *already* sorted, so \`sorted(nums)\` changes nothing and the result is
just the squares in input order: \`[16, 1, 0, 9, 100]\` for the example above, which is not sorted.
The comment in the code names the trap because the two lines are so close: **sorting the inputs and
sorting the outputs are different operations, and only the second one is the answer.** The general
form of this mistake — applying an order-destroying transformation and then assuming the order
survived — is the same bug that makes people sort by a key and then mutate the key.

A second, quieter version: \`nums.sort(key=lambda x: x * x)\` sorts the *originals* by their squares,
giving \`[0, -1, 3, -4, 10]\`. The ordering is right; the values are the ones you were supposed to
replace.`,
  cost: `**Time O(n log n), space O(n).** The squaring is one linear pass; the sort dominates at n log n
comparisons. The space is the output array, which is O(n) and unavoidable since the problem asks for
a new array, plus whatever the sort itself needs (Timsort's merge buffer is O(n) in the worst case).

Use it when n is small, when the code will be read more often than run, or when you are not certain
the input really is sorted — this is the only approach on this page that does not depend on that
promise, which makes it the safe choice against untrusted input. It is also the natural oracle for
checking the faster versions, which is exactly its role in the test script at the bottom of this
file. In an interview it is the right first sentence and the wrong last one.

---`,
}
