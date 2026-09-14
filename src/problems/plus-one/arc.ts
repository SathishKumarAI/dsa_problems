// plus-one — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/plus-one_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every step on this ladder chases one principle: **do the arithmetic where the data lives, and stop
the moment nothing more can change.** The first instinct is to reassemble the number, and in Python
that instinct is even correct — which is the trap, because the array representation exists for
exactly one reason, that the value may not fit a machine word, and folding a hundred digits into a
\`long long\` is not slightly wrong but catastrophically wrong in a way that returns a plausible number
instead of an error. So the first real move is to stop forming the number at all and do paper-column
addition, carrying one digit's worth of state; reversing the array puts the units at index 0 where a
forward loop wants it, and that works, at the price of two flips and a full copy purely to change
which way the digits face. A decrementing index faces them the other way for nothing, so the copies
go — and with them gone, a second observation surfaces: the loop need not run to the end at all,
because once a digit absorbs the carry the message is spent and every digit to its left is already
the answer. That leaves one variable and one boundary, the moment the loop ends with the carry still
alive, and that boundary is where the classic wrong answer lives, all nines silently returning all
zeros. One way to kill a boundary is to decide it first, testing for all nines before touching
anything, which reads beautifully and asks the same question twice: the guard scans forward for a
digit below nine and the loop then walks backward to that same digit. The last rung fuses them — walk
backward once, and the first digit below nine takes the increment and ends the function on the spot;
run off the front and you have *proved* it was all nines, every digit already zeroed on the way past,
so the special case is not tested for, it is what remains when the walk finds nothing. Reassemble,
carry with copies, carry in place, decide the special case, and finally let the special case fall out
of where the walk stopped — and the two worth carrying into an interview are the last one, which you
write, and the first one, which you name and reject out loud, because saying why the digit array
exists is the answer to the question the problem is really asking.

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
      "Build the number, add one, split it back",
      "`O(n)`",
      "`O(n)`",
      "Shortest code, bought by depending on an integer type wide enough for the whole value — which no fixed-width type is",
      "The value is known to fit; otherwise only as the rung you name and reject"
    ],
    [
      "Reverse, carry, reverse back",
      "`O(n)`",
      "`O(n)`",
      "Removes the width dependency; pays two extra passes and a copy to put the units at index 0",
      "The input must not be mutated, or you are writing general multi-digit addition"
    ],
    [
      "Carry from the back",
      "`O(n)`",
      "`O(1)`",
      "Same carry logic with a decrementing index, so no copies — but the carry must be read after the loop",
      "You want one routine that generalises to adding two arbitrary-length numbers"
    ],
    [
      "Special-case all nines",
      "`O(n)`",
      "`O(1)`",
      "Removes the carry variable and its boundary; pays a second scan to do it",
      "The special case is worth stating at the top of the function for a reader"
    ],
    [
      "**Walk from the back, return early**",
      "`O(n)` worst, ~`O(1)` typical",
      "`O(1)`",
      "One pass answers both questions; the growing case is where the loop ended, not a thing tested for",
      "The default answer for this problem"
    ]
  ]
}
