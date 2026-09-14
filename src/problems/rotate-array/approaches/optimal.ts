// rotate-array — approach 5 — Three reversals (optimal)
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Three reversals (optimal)",
  idea: `*Cut-and-rejoin already said the answer is two blocks that swapped places — can two blocks be swapped
in place?* They can, with one primitive. Reverse the whole array: the tail block is now at the front
and the head at the back, each written backwards. Reverse each block where it now sits and both read
forwards again.

This fixes Approach 4's weakness: **the cyclic walk needs a move counter (or a \`gcd\`) to know how
many chains to start**, and that bookkeeping is the part that gets written wrong.`,
  intuition: `> **Intuition.** Write the array as block **B** then block **A**, and the goal as A then B. Reversing
> the whole thing gives reverse(A) followed by reverse(B) — the blocks are now on the correct sides,
> because reversing the array reverses the *order of the blocks* as well as the contents of each.
> Each block is individually backwards, so reverse each one where it sits. Reversing swaps the blocks
> and damages them in a way that reversing again repairs.

> **Why it works.** Let the array be \`B · A\` with \`|A| = k\`. Reversing a concatenation reverses both
> the order and each part: \`reverse(B · A) = reverse(A) · reverse(B)\`. So after the first pass the
> first \`k\` slots hold \`reverse(A)\` and the remaining \`n − k\` hold \`reverse(B)\`. Applying \`reverse\`
> to each of those spans gives \`A · B\`, which is the definition of a right rotation by \`k\`. The
> boundary for the second and third reversals is therefore \`k\`, **not** \`n − k\`: \`n − k\` was the cut
> in the *original* array, before anything moved.`,
  worked: `\`nums = [1, 2, 3, 4, 5, 6, 7]\`, \`k = 3\`, \`n = 7\`.

| pass | span reversed | array after |
|---|---|---|
| start | — | \`[1, 2, 3, 4, 5, 6, 7]\` |
| 1 | \`reverse_span(nums, 0, 6)\` — everything | \`[7, 6, 5, 4, 3, 2, 1]\` |
| 2 | \`reverse_span(nums, 0, 2)\` — the first \`k = 3\` | \`[5, 6, 7, 4, 3, 2, 1]\` |
| 3 | \`reverse_span(nums, 3, 6)\` — the remaining \`n − k = 4\` | \`[5, 6, 7, 1, 2, 3, 4]\` |

The individual swaps inside the third pass, to show the loop is nothing more than that:

| \`lo\` | \`hi\` | \`lo < hi\`? | array after |
|---|---|---|---|
| 3 | 6 | yes — swap \`4\` and \`1\` | \`[5, 6, 7, 1, 3, 2, 4]\` |
| 4 | 5 | yes — swap \`3\` and \`2\` | \`[5, 6, 7, 1, 2, 3, 4]\` |
| 5 | 4 | no — stop | \`[5, 6, 7, 1, 2, 3, 4]\` |

Three passes, about \`n\` swaps in total, no allocation.`,
  code: `def rotate_array_three_reversals(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    reverse_span(nums, 0, n - 1)  # blocks now on the correct sides, each backwards
    reverse_span(nums, 0, k - 1)  # repair the block that used to be the tail
    reverse_span(nums, k, n - 1)  # repair the block that used to be the head
    return nums`,
  codeNote: `\`k % n = 0\` needs no special case: the second span is \`(0, -1)\` and does nothing, while the first and
third both cover the whole array, so it is reversed and reversed back.`,
  mistake: `> **Watch out.** The misconception is that the block boundary is wherever the cut *was*. After the
> first reversal the tail block has moved to the **front** and is \`k\` long, so the boundary is \`k\`.
> Using \`n − k\` reverses the wrong two spans and produces a clean-looking rotation in the wrong
> direction.

Measured with \`n - k\` as the boundary:

| input | wrong boundary | correct |
|---|---|---|
| \`[1, 2, 3, 4, 5, 6, 7]\`, \`k = 3\` | \`[4, 5, 6, 7, 1, 2, 3]\` | \`[5, 6, 7, 1, 2, 3, 4]\` |
| \`[1, 2, 3, 4]\`, \`k = 1\` | \`[2, 3, 4, 1]\` | \`[4, 1, 2, 3]\` |

Both outputs are perfectly valid rotations, just left instead of right, which is why it survives a
glance. The fix is to re-derive the boundary from the **post-reversal** picture, not the pre-reversal
one.

The other mistake here is omitting \`k %= n\`, and on this rung it is finally loud: the second span is
\`(0, k - 1)\`, and \`k - 1\` can be far past the end. Measured on \`[1, 2]\` with \`k = 5\`:

\`\`\`
IndexError: list index out of range
\`\`\`

In C++ it would not raise — it would read past the end of the buffer and carry on, which is the
version of this bug you never want to meet.`,
  cost: `**Time \`O(n)\`, space \`O(1)\`.** Time is three reversal passes; the three spans together perform
\`n/2 + k/2 + (n − k)/2 = n\` swap-halves, so each value is written about twice. That is a constant
factor worse than the cyclic walk's exactly-one-write-per-value, and it is worth it. Space is
genuinely constant — two indices and the temporary inside the swap.

This is the rung to memorize. It satisfies the in-place follow-up, has no counter and no \`gcd\`
argument, its correctness fits in one sentence, and \`k = 0\` and \`k = n\` fall out with no special
cases. The reversal primitive itself reappears everywhere: reverse-words-in-a-string is the same
three-reversal trick with word boundaries instead of a single cut.

---`,
}
