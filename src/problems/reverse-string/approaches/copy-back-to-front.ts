// reverse-string — approach 4 — Copy the input backwards into a buffer
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
  rung: "copy-back-to-front",
  title: "Copy the input backwards into a buffer",
  idea: `*The stack's pop order turned out to be the input read from the last index to the first — so why build
the stack?* Walk an index down from \`n-1\` to \`0\`, appending to a buffer. This fixes the stack's waste
— **\`n\` pushes, \`n\` pops and a whole container whose ordering the string's indices already implied** —
while keeping linear cost.`,
  intuition: `> **Intuition.** Copying names off a whiteboard onto a fresh sheet, starting at the **bottom**. One
> finger walks right-to-left across the source, one hand writes left-to-right on the destination, and
> they never interact. It is the first approach whose cost is honestly one read and one write per
> character — the floor for anything that produces a *new* string. The only question left is whether a
> new string is needed at all.`,
  worked: `| step | \`i\` | \`s[i]\` | \`out\` after |
|---|---|---|---|
| 1 | 4 | \`'o'\` | \`['o']\` |
| 2 | 3 | \`'l'\` | \`['o','l']\` |
| 3 | 2 | \`'l'\` | \`['o','l','l']\` |
| 4 | 1 | \`'e'\` | \`['o','l','l','e']\` |
| 5 | 0 | \`'h'\` | \`['o','l','l','e','h']\` |

\`"".join(out)\` → ✅ \`"olleh"\`. Five reads, five writes, one allocation — the stack's table with the
push phase deleted.

The loop stops at \`i = 0\` **inclusive**. That is the entire content of this approach's bug.`,
  code: `def reverse_string_backward_copy(s: str) -> str:
    out: list[str] = []
    for i in range(len(s) - 1, -1, -1):   # stop is EXCLUSIVE, so -1 is what makes index 0 be read
        out.append(s[i])
    return "".join(out)`,
  mistake: `> **Watch out.** Writing \`range(len(s) - 1, 0, -1)\`. The misconception is reading the stop value as
> "where the loop ends". Python's \`range\` **excludes** it, so the loop finishes at index 1 and the
> first character of the input is never read.

On \`"hello"\` it returns \`'olle'\`; on \`"abcd"\`, \`'dcb'\`. The result is short by exactly one character,
quiet enough to survive a glance. The habit that prevents it: say the first and last values the loop
will take before running it — "4 down to 0" means \`range(4, -1, -1)\`.

The empty string is a free sanity check: \`range(-1, -1, -1)\` is empty, the body never runs, and
\`"".join([])\` is \`""\`. Off-by-ones at either endpoint tend to break that case loudly.`,
  cost: `**Time \`O(n)\`** — one read and one append per character plus one \`join\`; no container is ever copied.
**Space \`O(n)\`** — the output buffer: same asymptotic space as the stack, but one buffer instead of two
and no push/pop overhead.

This is the right answer whenever **the input must not be modified**, or the reversed text is wanted
as a new object anyway. In Python you write it \`s[::-1]\`, which is this loop implemented in C. Know it
explicitly, because the last rung's \`O(1)\` space is available only when you may write over the input —
and often you may not.

---`,
}
