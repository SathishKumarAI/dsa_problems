// plus-one — approach 3 — Carry from the back
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
  rung: "carry-from-the-back",
  title: "Carry from the back",
  idea: `*Why physically turn the digits around when an index can count downwards?* Leave the array alone and
run \`i\` from the last slot to the first. And once the carry becomes 0, nothing further can change, so
the loop can stop early rather than marching through digits it will not touch.

This fixes Approach 2's weakness: **two extra passes and a full-size copy purely to face the digits
the other way**, which a decrementing index does for nothing.`,
  intuition: `> **Intuition.** Same paper addition, but instead of rotating the sheet you read it right to left.
> The carry is a **message** being passed leftwards, and the loop condition says two things at once:
> keep going while there are columns (\`i >= 0\`) *and* while there is still a message to deliver
> (\`carry\`). The moment a column absorbs the carry without producing one, the message is spent and
> every digit further left is already correct. If the columns run out with a message still in flight,
> it has nowhere to go but a brand-new column at the front.`,
  worked: `\`digits = [1, 9, 9]\`, \`carry = 1\`, \`i\` starting at 2.

| \`i\` | \`digits[i]\` | \`carry\` in | \`total\` | \`digits[i]\` becomes | \`carry\` out | \`digits\` after | loop continues? |
|---|---|---|---|---|---|---|---|
| 2 | \`9\` | \`1\` | \`10\` | \`0\` | \`1\` | \`[1, 9, 0]\` | yes — \`i = 1\`, carry alive |
| 1 | \`9\` | \`1\` | \`10\` | \`0\` | \`1\` | \`[1, 0, 0]\` | yes — \`i = 0\`, carry alive |
| 0 | \`1\` | \`1\` | \`2\` | \`2\` | \`0\` | \`[2, 0, 0]\` | **no** — carry is 0 |

The loop exits on the carry, not on the index, and \`[2, 0, 0]\` is returned as it stands. On \`[1, 2, 3]\`
the same loop does exactly one iteration and never reads the \`1\` or the \`2\`.`,
  code: `def plus_one_carry_back(digits: list[int]) -> list[int]:
    carry = 1
    i = len(digits) - 1
    while i >= 0 and carry:  # stop the moment the carry is spent
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        i -= 1
    if carry:
        return all_nines_answer(len(digits))
    return digits`,
  mistake: `> **Watch out.** The misconception is *"there cannot be a carry once a digit absorbs it, so \`while
> carry\` is enough"*. True — and irrelevant, because on all nines **no digit ever absorbs it**. The
> index guard is not redundancy, it is the only thing standing between the loop and the front of the
> array.

In a bounds-checked language you get a crash, which is at least loud. In Python you get a silent
wrong answer, because \`digits[-1]\` is not an error — it wraps to the last element. Measured on
\`[9, 9, 9]\` with \`while carry:\` alone:

\`\`\`
[0, 0, 1]
\`\`\`

Trace it: the three nines become zeros, \`i\` reaches \`-1\`, the loop runs once more, \`digits[-1]\` reads
the final \`0\`, adds the carry, and writes \`1\` into the **last** slot. The carry is now spent, so the
growing branch never fires, and a three-digit array worth 1 is returned where 1000 was wanted.
Negative indexing turned an out-of-bounds bug into a plausible number, which is strictly worse than a
crash.`,
  cost: `**Time \`O(n)\`, space \`O(1)\`.** Time is one backward pass that stops when the carry dies — worst case
all nines visits every digit, best case one digit, and on uniformly random digits the expected count
is about 1.11 columns, because a step continues only when it lands on a 9. Space is two scalars plus
in-place edits; the only allocation is the growing branch, reached by one input shape.

Use it when you want a routine that **generalises**: replace \`carry = 1\` with a second number's
digits and this is the body of add-two-numbers and of string addition, structure unchanged. For
adding literally one, Approach 5 says the same thing with less state.

---`,
}
