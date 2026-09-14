// reverse-string — approach 1 — Recursion: reverse the tail, then append the head
//
// Converted from docs/deep/reverse-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "recursion",
  title: "Recursion: reverse the tail, then append the head",
  idea: `*If I could already reverse a shorter string, could I reverse this one?* Yes — reverse everything
after the first character, then stick that character on the end. \`reverse("hello")\` is
\`reverse("ello") + "h"\`, down to a one-character string which is its own reverse.`,
  intuition: `> **Intuition.** A stack of plates you are re-stacking one at a time. You lift the top plate off, ask
> someone else to reverse the rest, and place your plate on the **bottom** of what comes back. It is
> the truest one-line sentence about reversal — it says what reversal *is* rather than how to perform
> it. What the picture hides is the cost of "ask someone else": you hand them a fresh copy of the
> remaining plates, and they hand a fresh copy onward, so \`n\` people are each holding a stack of
> nearly \`n\` plates.`,
  worked: `Going down — each level slices off the head and copies the tail:

| depth | call | slice made | head kept |
|---|---|---|---|
| 0 | \`reverse("hello")\` | copies \`"ello"\` (4 chars) | \`'h'\` |
| 1 | \`reverse("ello")\` | copies \`"llo"\` (3 chars) | \`'e'\` |
| 2 | \`reverse("llo")\` | copies \`"lo"\` (2 chars) | \`'l'\` |
| 3 | \`reverse("lo")\` | copies \`"o"\` (1 char) | \`'l'\` |
| 4 | \`reverse("o")\` | base case, length 1 | — |

Coming back up — each level concatenates, allocating a new string:

| depth | returns | length built |
|---|---|---|
| 4 | \`"o"\` | 1 |
| 3 | \`"o" + "l"\` = \`"ol"\` | 2 |
| 2 | \`"ol" + "l"\` = \`"oll"\` | 3 |
| 1 | \`"oll" + "e"\` = \`"olle"\` | 4 |
| 0 | \`"olle" + "h"\` = \`"olleh"\` | 5 |

✅ \`"olleh"\` — using five stack frames, \`4+3+2+1 = 10\` characters copied on the way down and another
\`1+2+3+4 = 10\` on the way back up, to reorder five characters.`,
  code: `def reverse_string_recursion(s: str) -> str:
    if len(s) <= 1:                                  # <= 1, not == 1: the empty string is legal input
        return s
    return reverse_string_recursion(s[1:]) + s[0]    # s[1:] copies n-1 characters, every level`,
  mistake: `> **Watch out.** Assembling the pieces the other way round: \`return s[0] + reverse(s[1:])\`. The
> misconception is that recursion "handles the order for you". It does not — **you** choose which
> side the head goes on, and putting it in front of a reversed tail rebuilds the original.

On \`"hello"\` it returns \`'hello'\`; on \`"abc"\`, \`'abc'\`. It terminates cleanly and any palindromic test
data makes it look correct. Say the recurrence out loud before writing it: *"the first character must
end up **last**, so it goes on the **right** of what comes back."*`,
  cost: `**Time \`O(n²)\`** — two quadratic costs stacked: \`s[1:]\` copies \`n−1\`, \`n−2\`, \`n−3\`… on the way down,
and \`+\` allocates a growing string on the way back up. **Space \`O(n)\` live frames, \`O(n²)\` copied** —
one frame per character, each holding its own slice, so a \`10^5\`-character input opens \`10^5\` frames
and blows CPython's default recursion limit of 1000 long before it finishes being slow.

Use it to *state* what reversal means, then stop. Its real value is a general lesson: **recursion that
slices is recursion that copies.** Reversing a linked list recursively is genuinely \`O(n)\` because the
step is a pointer move; reversing a string recursively is \`O(n²)\` because the step is a copy. Same
shape, different cost, and the difference is in the data structure, not the recursion.

---`,
}
