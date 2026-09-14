// plus-one — approach 2 — Reverse, carry, reverse back
//
// Converted from docs/deep/plus-one_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "reverse-carry-reverse-back",
  title: "Reverse, carry, reverse back",
  idea: `*If the number might not fit a machine word, can we add one without ever forming the number?* Yes —
do it the way you were taught on paper, one column at a time, carrying. Addition runs right to left
and a \`for\` loop runs left to right, so flip the digits, carry forward, flip back.

This fixes Approach 1's fatal weakness: **it depends on an integer type wide enough for the whole
value**, and no fixed-width type is wide enough for a hundred digits. Carrying one column at a time
has no width at all.`,
  intuition: `> **Intuition.** Column addition, exactly as you did it at school: digits stacked, the little carried
> \`1\` written above the next column, working right to left. The only simplification is that the
> bottom row is all zeros except a single \`1\` in the units column — so instead of adding two digits
> you add one digit and a **carry** that starts at 1. The reversal is pure ergonomics: the arithmetic
> wants to start at the units and a loop wants to start at index 0, so reversing makes those the same
> place. When the columns run out with the carry still alive, there is one more column — the one you
> would have written to the left of everything.`,
  worked: `\`digits = [1, 9, 9]\`. Reverse first: \`rev = [9, 9, 1]\`, so index 0 is now the units.

| \`i\` | \`rev[i]\` | \`carry\` in | \`total\` | \`rev[i]\` becomes | \`carry\` out | \`rev\` after |
|---|---|---|---|---|---|---|
| 0 | \`9\` | \`1\` | \`10\` | \`0\` | \`1\` | \`[0, 9, 1]\` |
| 1 | \`9\` | \`1\` | \`10\` | \`0\` | \`1\` | \`[0, 0, 1]\` |
| 2 | \`1\` | \`1\` | \`2\` | \`2\` | \`0\` | \`[0, 0, 2]\` |

The loop ends with \`carry = 0\`, so nothing is appended. Reverse back: \`[2, 0, 0]\`.

Contrast \`[9, 9, 9]\`: every column carries, the loop ends with \`carry = 1\`, the append fires, \`rev\`
becomes \`[0, 0, 0, 1]\`, and reversing gives \`[1, 0, 0, 0]\`.`,
  code: `def plus_one_reverse_carry(digits: list[int]) -> list[int]:
    rev = digits[::-1]
    carry = 1
    for i in range(len(rev)):
        total = rev[i] + carry
        rev[i] = total % 10
        carry = total // 10
    if carry:
        rev.append(carry)  # a carry still alive means the answer is one digit longer
    rev.reverse()
    return rev`,
  mistake: `> **Watch out.** The misconception is that the loop finishes the job. It finishes the **columns**. A
> carry still in flight after the last column is not leftover state to tidy up — it is a digit of the
> answer that has not been written yet.

Dropping \`if carry: rev.append(carry)\` is easy: it is the only statement outside the loop, it looks
like housekeeping, and on most inputs it does nothing. Measured:

| input | without the append | correct |
|---|---|---|
| \`[1, 9, 9]\` | \`[2, 0, 0]\` | \`[2, 0, 0]\` — passes |
| \`[9, 9, 9]\` | \`[0, 0, 0]\` | \`[1, 0, 0, 0]\` |

\`[9, 9, 9]\` comes back as \`[0, 0, 0]\` — the new leading digit was computed, stored in a variable, and
thrown away on return. Invisible on every input that is not all nines, which is why "run it on all
nines" is the first test to write for this problem, not the last.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Time is three linear passes — reverse, carry, reverse — each column
doing fixed arithmetic, so the constant is small but the pass count is three. Space is \`O(n)\` because
\`digits[::-1]\` allocates a full copy; nothing here writes into the caller's array.

Use it when the input must not be mutated and you would rather copy than reason about aliasing, or
when writing general **multi-digit addition** — there the reversed layout genuinely pays, because
aligning two arrays of different lengths at their units digits is free when index 0 is the units. For
adding exactly one, the next rung gets the same answer without the copies.

---`,
}
