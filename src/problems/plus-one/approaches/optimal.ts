// plus-one — approach 5 — Walk from the back and return the moment a digit absorbs it (optimal)
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
  rung: "optimal",
  title: "Walk from the back and return the moment a digit absorbs it (optimal)",
  idea: `*If the all-nines test and the increment are both hunting for the first digit below 9, why run two
walks?* Walk backwards once. The first digit below 9 absorbs the increment and you return on the
spot. Never find one and you ran off the front — and running off the front **is** the all-nines case,
already fully zeroed on the way past.

This fixes Approach 4's weakness: **a full pass before any work begins**, followed by a second pass
to do it. One backward walk answers both questions, and the answer costs nothing extra because it is
simply where the loop ended.`,
  intuition: `> **Intuition.** You are walking left along a row of digits carrying one unit to deliver, asking each
> digit a single question: *can you take it?* A digit below 9 can — it becomes one larger, the
> delivery is complete, and every digit further left is none of your business, so you leave. A 9
> cannot — it rolls over to 0 and the delivery moves one place left. Walk past the first digit still
> carrying the unit and there were no takers anywhere: every digit was a 9, every one is now a 0, and
> the unit becomes a new leading digit. The early return is not a speed trick — **a carry cannot
> travel past a digit it does not overflow**, so there is genuinely nothing left to do.`,
  worked: `\`digits = [1, 9, 9]\`.

| \`i\` | \`digits[i]\` | below 9? | action | \`digits\` after |
|---|---|---|---|---|
| 2 | \`9\` | no | write 0, step left | \`[1, 9, 0]\` |
| 1 | \`9\` | no | write 0, step left | \`[1, 0, 0]\` |
| 0 | \`1\` | **yes** | \`digits[0] += 1\`, **return** | \`[2, 0, 0]\` |

Three iterations, no carry variable, no post-loop branch taken. Two shapes to hold beside it:

| input | what happens | result |
|---|---|---|
| \`[1, 2, 3]\` | \`i = 2\`, \`3 < 9\`, becomes \`4\`, return — **one** iteration; the \`1\` and \`2\` are never read | \`[1, 2, 4]\` |
| \`[9, 9, 9]\` | all three become \`0\`, the loop exhausts \`range\`, the final line runs | \`[1, 0, 0, 0]\` |`,
  code: `def plus_one_early_return(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits  # nothing left of a digit below 9 can change
        digits[i] = 0
    return all_nines_answer(len(digits))  # ran off the front: every digit was a 9`,
  mistake: `> **Watch out.** The misconception is that the last line is a general **epilogue**. It is the *else*
> branch of the loop — reachable only when the loop found no taker. \`return\` inside the loop is what
> expresses that, and \`break\` destroys it.

\`\`\`python
for i in range(len(digits) - 1, -1, -1):
    if digits[i] < 9:
        digits[i] += 1
        break                          # WRONG — leaves the loop, not the function
    digits[i] = 0
return all_nines_answer(len(digits))   # now runs on EVERY input
\`\`\`

Measured:

| input | with \`break\` | correct |
|---|---|---|
| \`[1, 2, 3]\` | \`[1, 0, 0, 0]\` | \`[1, 2, 4]\` |
| \`[1, 9, 9]\` | \`[1, 0, 0, 0]\` | \`[2, 0, 0]\` |
| \`[9, 9, 9]\` | \`[1, 0, 0, 0]\` | \`[1, 0, 0, 0]\` — passes |

The function now returns \`1000\` for every three-digit input, because the increment it carefully
performed is discarded and the all-nines answer is returned unconditionally. Note which row passes:
the only input the bug gets right is the one it was written for. If you prefer \`break\`, the honest
spelling is Python's \`for ... else\`, whose trailing block runs only when the loop was never broken
out of.`,
  cost: `**Time \`O(n)\` worst case, space \`O(1)\`.** Time is one backward pass with an early exit: \`n\` iterations
on all nines — the only input that reaches the first digit — and one iteration in the common case,
with an expected 1.11 iterations on uniformly random digits, since a step continues only on a 9.
Space is constant: one index, in-place edits, and a single allocation confined to the growing branch,
which is the one case where a new array is genuinely required. That is as tight as the problem gets —
you must read the last digit, and you must allocate when the length changes.

This is the rung to memorize. It has no carry variable to mishandle, its growing case and its loop
termination are the **same event** rather than two conditions kept in sync, and it generalises
directly into add-two-numbers, add-binary and string addition by replacing the implicit \`+ 1\` with a
second operand.

---`,
}
