// reverse-list — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/reverse-list_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every step of this ladder chases one principle: **the only thing reversal actually needs to remember is
the node you just came from, and each approach differs only in how expensively it remembers it.** The
array version remembers everything — all \`n\` values, at once, in a structure it then barely uses — and
pays with \`n\` new nodes and a result that is a copy rather than the list you were asked to reverse; its
weakness is treating "I need the previous node" as "I need the whole history". Recursion notices that
the history is not needed, only the immediate predecessor, and lets the call stack hold it: each
frame's \`head\` *is* the predecessor of the sublist below it, so no new nodes are allocated and the
rewiring happens in place. But the stack is still \`O(n)\` memory that merely happens to be invisible,
one frame per node, and with 5000 nodes allowed it is memory the runtime will refuse to give you. The
last step is the observation that a stack frame storing one pointer can be replaced by a variable
storing one pointer: \`prev\` is the predecessor, carried forward explicitly instead of rebuilt by
unwinding. Once you say it that way the loop writes itself — save the successor, flip the arrow, shift
both pointers — and the \`None\` you initialised \`prev\` with turns out to do double duty as the
terminator for the new tail and as the answer for the empty list. The whole progression is one idea
being sharpened: from *store the past*, to *let the runtime store the past*, to *the past is one
pointer, hold it in your hand*.

---`

export const comparison: Comparison = {
  "head": [
    "Approach",
    "Time",
    "Space",
    "Core trade-off",
    "Best used when"
  ],
  "rows": [
    [
      "Copy to array",
      "`O(n)`",
      "`O(n)`",
      "Buys an easy mental model with `n` extra nodes; returns a copy, not the original list",
      "The input must not be mutated — shared, immutable, or const-borrowed data"
    ],
    [
      "Recursive",
      "`O(n)`",
      "`O(n)` stack",
      "In-place rewiring, but memory moved from the heap to an invisible call stack",
      "The list is provably short and the recursive form reads better to your team"
    ],
    [
      "**Three pointers**",
      "**`O(n)`**",
      "**`O(1)`**",
      "**None worth naming — three variables, one pass, no allocation**",
      "**Always, for this problem**"
    ]
  ]
}
