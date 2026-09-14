// balanced-brackets — the ways a solution to this problem is wrong, numbered
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The numbers are load-bearing: the approaches below cite "failure 1/2/3"
// rather than restating the case, so a list renumbered in one place and not the
// others still reads as correct. That is why these are rows and not a paragraph.
//
// NOT the journey's `edges` (src/data/journeys/balanced-brackets.ts). Those are
// preset-bound cases that cite a line of `constraints` and load an animation;
// these are the document's own, with the line of code that catches each.

import type { Trap } from "../../content/types.ts"

export const intro = `A string is well-formed unless one of exactly three things goes wrong. Every correct solution
detects all three; every buggy one is missing one of them. Name them now, because the rest of this
document refers back to them:`

export const rows: Trap[] = [
  {
    "name": "A closer arrives with **nothing open at all**",
    "example": "`)`, `()]`",
    "check": "The stack is empty when a closer is read"
  },
  {
    "name": "A closer arrives but the most recent opener is the **wrong kind**",
    "example": "`(]`, `([)]`",
    "check": "The top of the stack is not this closer's partner"
  },
  {
    "name": "The scan finishes but **something is still open**",
    "example": "`(`, `([]`",
    "check": "The stack is non-empty at the end"
  }
]

export const outro = `Failure 1 and failure 3 are the two people forget. Both are easy to miss for the same reason: they
are not about a *comparison* going wrong, they are about the stack being the wrong *size*, and the
happy path never exercises either one. A solution missing failure 3 returns \`True\` for \`(\` —
verified below — and a solution missing failure 1 does not return a wrong answer at all, it crashes
with an \`IndexError\`, which at least is loud.

The worked example used in every section below is the statement's own first example:

\`\`\`
s = "([{}])"        answer: true
\`\`\`

---`
