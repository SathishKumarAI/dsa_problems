// product-except-self — approach 3 — Two prefix arrays
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "prefix",
  title: "Two prefix arrays",
  idea: `*If division is not available to remove a factor, can the product be built without that factor ever
going in?* Yes. The product of everything except position \`i\` is (everything strictly left of \`i\`) ×
(everything strictly right of \`i\`). Build both as arrays of running products — one sweep forward, one
backward — then multiply them position by position.

This fixes Approach 2's weakness — **it needs an inverse operation that does not exist at zero** —
and brute force's too, because each running product reuses the one before it.`,
  intuition: `> **Intuition.** Two people walk the array from opposite ends, each carrying a running total. The one
> starting on the left writes down, at every position, the product of everything they have passed *so
> far but not including where they are standing*; the one on the right does the mirror image. Every
> position ends up with two notes pinned to it — "everything before me" and "everything after me" —
> and multiplying them gives "everything but me". No factor was ever removed, because the element at
> position \`i\` never went into either note. **Exclusion by never including**, rather than by dividing
> out.

This is the prefix-sum idea with multiplication swapped in for addition, and recognising it as such
is worth more than the solution itself.

> **Why it works.** Two invariants, one per sweep. Forward: after the step for \`i\`, \`left[i]\` equals
> the product of \`nums[0..i-1]\`, maintained by multiplying in \`nums[i - 1]\` — the element just passed,
> never the current one. Backward: \`right[i]\` equals the product of \`nums[i+1..n-1]\`, maintained by
> multiplying in \`nums[i + 1]\`. Since those two ranges are **disjoint** and together cover every index
> except \`i\`, their product is by definition the answer for \`i\` — and the boundary slots are correct
> for free, because the product over an empty range is \`EMPTY_PRODUCT\`.`,
  worked: `\`nums = [1, 2, 3, 4]\`. The forward sweep fills \`left\`, the backward sweep fills \`right\`, and the last
column is the answer. \`left[0]\` and \`right[3]\` start at \`EMPTY_PRODUCT\` because nothing lies outside
those boundaries:

| step | direction | computed as | \`left\` | \`right\` |
|---|---|---|---|---|
| init | — | boundaries are the empty product | \`[1, _, _, _]\` | \`[_, _, _, 1]\` |
| \`i=1\` | → | \`left[0] × nums[0]\` = 1 × 1 | \`[1, 1, _, _]\` | \`[_, _, _, 1]\` |
| \`i=2\` | → | \`left[1] × nums[1]\` = 1 × 2 | \`[1, 1, 2, _]\` | \`[_, _, _, 1]\` |
| \`i=3\` | → | \`left[2] × nums[2]\` = 2 × 3 | \`[1, 1, 2, 6]\` | \`[_, _, _, 1]\` |
| \`i=2\` | ← | \`right[3] × nums[3]\` = 1 × 4 | \`[1, 1, 2, 6]\` | \`[_, _, 4, 1]\` |
| \`i=1\` | ← | \`right[2] × nums[2]\` = 4 × 3 | \`[1, 1, 2, 6]\` | \`[_, 12, 4, 1]\` |
| \`i=0\` | ← | \`right[1] × nums[1]\` = 12 × 2 | \`[1, 1, 2, 6]\` | \`[24, 12, 4, 1]\` |

Combine them position by position:

| \`i\` | \`left[i]\` | \`right[i]\` | \`out[i]\` |
|---|---|---|---|
| 0 | 1 | 24 | **24** |
| 1 | 1 | 12 | **12** |
| 2 | 2 | 4 | **8** |
| 3 | 6 | 1 | **6** |

Three passes, \`2n\` stored numbers, not a single division. Note that \`left\` and \`right\` are each read
exactly once, in the combining step — that observation is what the next approach is built on.`,
  code: `def product_except_self_two_prefix_arrays(nums: list[int]) -> list[int]:
    n = len(nums)
    left = [EMPTY_PRODUCT] * n   # left[i] = product of everything strictly before i
    right = [EMPTY_PRODUCT] * n  # right[i] = product of everything strictly after i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]`,
  codeNote: `The two off-by-one details carry the whole meaning: forward multiplies in \`nums[i - 1]\`, backward in
\`nums[i + 1]\`. That is what makes each array *strictly* exclusive of its own position.`,
  mistake: `> **Watch out.** The misconception is that \`left[i]\` means "the running product **at** \`i\`" — the
> natural reading of a prefix array, and the one every prefix-*sum* tutorial encourages. Here it must
> mean the product strictly **before** \`i\`, so the last element folded in is \`nums[i - 1]\`.

Writing \`left[i] = left[i - 1] * nums[i]\` makes the array hold "everything up to and including me".
Combined with \`right[i]\` — "everything strictly after me" — it multiplies the *whole* array together
at every position: \`[1, 2, 3, 4]\` produces \`[24, 24, 24, 24]\`, and position \`0\` being right is what
makes the bug easy to miss.

The mirror-image version loops \`for i in range(n - 1, -1, -1)\` in the backward sweep and reads
\`right[i + 1]\`, indexing one past the end on the first iteration — an \`IndexError\` in Python, silent
memory corruption in C++. Both sweeps must start one position *inside* the boundary, because the
boundary slot is already \`EMPTY_PRODUCT\` and already correct.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\`. Three linear passes, one multiplication per element each, so the
time is linear with a small constant. The space is the two auxiliary arrays holding \`2n\` numbers —
genuinely extra storage, not counted in the output — and that is the only thing separating this from
optimal.

Use it when **clarity** matters more than memory, which is more often than interview culture admits:
\`left\` and \`right\` are self-describing and \`2n\` integers is nothing at \`n = 10^5\`. Use it also as the
intermediate step in an interview — state it, show it is linear, then compress it, because the
compression is far easier to explain when the thing being compressed is already on the board.

---`,
}
