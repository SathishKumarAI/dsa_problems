// reverse-string — approach 2 — Grow a new string by prepending
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
  rung: "grow-a-new-string",
  title: "Grow a new string by prepending",
  idea: `*The recursion opens a frame per character and overflows before it finishes — can the same
cancel-and-rebuild run in a flat loop?* Yes: walk the input forward and put each character *in front*
of everything collected so far, so the answer grows backwards. This fixes the recursion's fatal
weakness — **stack depth** — and handles any length without crashing. It does not fix the cost, and
that is why it is a rung rather than a footnote.`,
  intuition: `> **Intuition.** Writing the answer on a strip of paper where you may only write at the far **left**
> edge — and there is no margin, so every new character means sliding the whole strip one place right
> first. Each step looks cheap and the total is not: the first character copies nothing, the second
> copies one, the tenth copies nine. That triangular sum is \`n²/2\`. The thing to hold in mind is the
> copying you cannot see — the line \`out = c + out\` says nothing about it, which is precisely why the
> trap catches people.`,
  worked: `| step | \`c\` | operation | \`out\` after | characters copied |
|---|---|---|---|---|
| 1 | \`'h'\` | \`'h' + ""\` | \`"h"\` | 0 |
| 2 | \`'e'\` | \`'e' + "h"\` | \`"eh"\` | 1 |
| 3 | \`'l'\` | \`'l' + "eh"\` | \`"leh"\` | 2 |
| 4 | \`'l'\` | \`'l' + "leh"\` | \`"lleh"\` | 3 |
| 5 | \`'o'\` | \`'o' + "lleh"\` | \`"olleh"\` | 4 |

✅ \`"olleh"\` — ten characters copied to place five. On \`10^5\` characters that column sums to about
\`5 × 10^9\`.`,
  code: `def reverse_string_grow(s: str) -> str:
    out = ""
    for c in s:
        out = c + out      # prepending: every existing character is copied one place right
    return out`,
  mistake: `> **Watch out.** Writing \`out = out + c\` instead of \`out = c + out\`. The misconception is that the
> *direction* of a concatenation is cosmetic. It is the whole algorithm — appending returns the input
> unchanged, and because appending is also the **fast** direction, the bug runs quickly and silently.

On \`"hello"\` it returns \`'hello'\`. Palindromic test data hides it completely. The tell: a reversal must
read from the **end** of the input or write to the **front** of the output; a loop doing neither is
reversing nothing.

Note the irony worth remembering — the correct line here is the expensive one and the typo is the
cheap one. That is a hint the whole approach is the wrong shape, which the next rung acts on.`,
  cost: `**Time \`O(n²)\`** — the cost is entirely the prepend: step \`k\` copies \`k−1\` characters, total
\`n(n−1)/2\`, confirmed by the measured 2.7 ms → 9.4 ms → 33.3 ms as \`n\` doubles from 20 000 to 80 000.
**Space \`O(n)\`** — the output, plus a discarded intermediate each step.

Almost never the right choice. It earns its place because it is what most people write first, and
saying *"that line is \`O(n)\`, so this loop is \`O(n²)\` — let me fix it"* **before the interviewer does**
is worth more than arriving silently at the optimum. If a genuinely tiny string makes clarity matter
more than speed, write \`s[::-1]\` or \`"".join(reversed(s))\` — same clarity, linear cost, someone else's
code.

---`,
}
