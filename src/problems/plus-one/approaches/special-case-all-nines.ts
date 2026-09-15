// plus-one — approach 4 — Special-case all nines
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
  rung: "special-case-all-nines",
  title: "Special-case all nines",
  idea: `*The carry variable is the part that keeps going wrong — can the problem be arranged so there is no
carry?* Only one input ever grows, and its answer is known in advance. Test for it up front and
return it directly; everything else can zero its trailing nines and bump the first digit that is not
one, with no carry state at all.

This fixes Approach 3's weakness: **the carry must be read correctly *after* the loop ends**, and
that after-the-loop read is precisely where it gets forgotten — the \`[9, 9, 9] -> [0, 0, 0]\` failure
from Approach 2 is the same wound in a different place.`,
  intuition: `> **Intuition.** Split the world in two before doing any work. Either the number is all nines, in
> which case you already know the answer and compute nothing — or it is not, in which case there is
> **guaranteed** to be a digit below 9, and the rightmost such digit is where the increment lands.
> Everything to its right is a nine and becomes a zero; everything to its left is untouched. The
> all-nines test is not an optimization, it is a **precondition**: it is what makes the inner
> \`while digits[i] == 9\` loop safe to write with no index guard.`,
  worked: `\`digits = [1, 9, 9]\`.

**Step 1 — the guard.** All nines? \`1\` is not. Fall through.

**Step 2 — zero the trailing nines,** \`i\` starting at 2:

| \`i\` | \`digits[i]\` | is it 9? | action | \`digits\` after |
|---|---|---|---|---|
| 2 | \`9\` | yes | write 0, step left | \`[1, 9, 0]\` |
| 1 | \`9\` | yes | write 0, step left | \`[1, 0, 0]\` |
| 0 | \`1\` | **no** | stop | \`[1, 0, 0]\` |

**Step 3 — bump.** \`digits[0] += 1\` gives \`[2, 0, 0]\`.

On \`[9, 9, 9]\` the guard fires at step 1 and returns \`[1, 0, 0, 0]\` without entering any loop.`,
  code: `def plus_one_special_case_nines(digits: list[int]) -> list[int]:
    if all(d == 9 for d in digits):
        return all_nines_answer(len(digits))
    i = len(digits) - 1
    while digits[i] == 9:  # safe: the guard above ruled out running off the front
        digits[i] = 0
        i -= 1
    digits[i] += 1
    return digits`,
  mistake: `> **Watch out.** The misconception is that the leading \`1\` **replaces** something, so the zeros
> should be one fewer. It replaces nothing — it is an extra column, and all \`n\` original nines become
> zeros.

Writing \`[1] + [0] * (len(digits) - 1)\` instead of \`all_nines_answer(len(digits))\` returns, measured
on \`[9, 9, 9]\`:

\`\`\`
[1, 0, 0]
\`\`\`

That is 100 where 1000 was wanted. The output is a perfectly well-formed digit array with no leading
zeros, so nothing about it looks broken, and it is off by a factor of ten on every input that reaches
the branch. The one-second check: the answer must be \`len(digits) + 1\` long, so there are
\`len(digits)\` zeros. Lifting it into \`all_nines_answer\` is what makes that check a single place.`,
  cost: `**Time \`O(n)\`, space \`O(1)\`.** Time is up to two passes: the \`all(...)\` scan short-circuits at the
first non-nine, so it is usually one comparison; on the one input where it runs to the end, the
zeroing walk does not run at all — no input pays both in full. Space is constant apart from the
allocation in the growing branch.

Use it when the special case is worth stating at the top of the function where a reader meets it
first; that readability argument is real. But notice what the next rung notices: the guard scans
forward for a non-nine and the loop then walks backward to the same non-nine. **The same question is
asked twice.**

---`,
}
