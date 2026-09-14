// rotate-array — approach 3 — Cut and rejoin
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
  rung: "cut-and-rejoin",
  title: "Cut and rejoin",
  idea: `*Is a rotation really a per-element computation at all?* No — it is two blocks swapping places. The
last \`k\` values move to the front as one solid piece, and the first \`n − k\` follow, unchanged and in
order. Say that directly: take the tail, append the head.

This fixes Approach 2's weakness: **it computes a modular index for every element, and the direction
of the rotation is hidden inside that arithmetic** where it can be written backwards without looking
wrong. Naming the two blocks puts the direction where a reader can see it.`,
  intuition: `> **Intuition.** Cutting a deck of cards. You lift the bottom \`k\` cards and place them on top — that
> is the whole operation, and nobody performing it thinks about an individual card's index. The cut
> point is \`n − k\`: everything from there to the end is block **A**, everything before it is block
> **B**, and the answer is A then B. Seeing it this way also explains the shape the final rung
> exploits — the answer is two blocks in the wrong order.`,
  worked: `\`nums = [1, 2, 3, 4, 5, 6, 7]\`, \`k = 3\`, \`n = 7\`, so the cut is at \`n − k = 4\`.

| piece | slice | contents |
|---|---|---|
| block **B** — the head | \`nums[:4]\` | \`[1, 2, 3, 4]\` |
| block **A** — the last \`k\` | \`nums[4:]\` | \`[5, 6, 7]\` |
| answer, A then B | \`nums[4:] + nums[:4]\` | \`[5, 6, 7, 1, 2, 3, 4]\` |

Two bulk copies, no per-element arithmetic, and the answer reads straight off the slice boundaries.`,
  code: `def rotate_array_cut_and_rejoin(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    nums[:] = nums[n - k:] + nums[: n - k]  # slice-assign so the caller's list changes
    return nums`,
  mistake: `> **Watch out.** This is the rung where skipping \`k %= n\` is most dangerous, because Python's slices
> refuse to complain: a negative start counts from the right, and an out-of-range slice is silently
> clamped to empty. The misconception is that an illegal index will announce itself. Here it
> **returns a plausible array instead.**

With \`nums = [1, 2]\` and \`k = 5\`, \`n - k\` is \`-3\`, so \`nums[-3:]\` is the whole list and \`nums[:-3]\`
is empty. Measured:

| input | without \`k %= n\` | correct |
|---|---|---|
| \`[1, 2]\`, \`k = 5\` | \`[1, 2]\` — completely unrotated | \`[2, 1]\` |
| \`[1, 2, 3, 4, 5, 6, 7]\`, \`k = 10\` | \`[5, 6, 7, 1, 2, 3, 4]\` | \`[5, 6, 7, 1, 2, 3, 4]\` — passes |

The second row is the sting: \`7 - 10 = -3\` happens to name the same cut as \`7 - 3\`, so the bug is
right for some \`k > n\` and wrong for others. It will pass your own quick test and fail a hidden one.
In Java or C++ the same omission is an immediate out-of-bounds crash — loud, and much easier to find.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Time is two slice copies plus the slice-assignment back over \`nums\`,
each linear with a very small constant — in CPython these run in C, so this is by far the fastest of
the five in wall-clock terms. Space is \`O(n)\`: the concatenation builds a complete new list before
the assignment overwrites the original, so the peak is two full arrays.

Use it in production Python, where it is one readable line and the memory is irrelevant, or in any
language with a slice or \`copy\` primitive. Do **not** offer it as the answer to the follow-up — it
allocates \`n\` extra values, which is precisely what "constant extra memory" rules out.

---`,
}
