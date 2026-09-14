// sort-colors — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/sort-colors_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step of this problem chases is *use what you were told*. A library sort is the
zero-knowledge answer: it assumes nothing about the values, discovers the ordering by comparison,
and pays O(n log n) for the privilege. But you were handed a fact — there are exactly three
values, and you already know their order — and the counting approach cashes that in immediately,
dropping to two linear passes with three counters, because when the alphabet is known there is
nothing left to *discover*, only to tally. That would be the end of it, except counting quietly
changes what an element *is*: it does not move your zeroes and twos anywhere, it overwrites every
slot with a freshly minted value, which is invisible for plain integers and destructive the moment
an element carries anything else. The Dutch-national-flag partition fixes that and the second pass
together, and the way it does so is the actual lesson: instead of collecting global knowledge first
and applying it second, it maintains a *local promise about the array's shape* that stays true after
every single step — everything before \`low\` is a zero, everything after \`high\` is a two, everything
between \`low\` and the cursor is a one, everything between the cursor and \`high\` is still unknown.
Correctness stops being an argument about totals and becomes an argument about one step: show that
each of the three cases preserves the promise, show that the unknown region shrinks every time, and
the algorithm is proved. That is also where the famous asymmetry comes from — swapping toward the
\`high\` side reaches into the unknown region and hands you back something unclassified, so the
cursor must stay and look; swapping toward the \`low\` side reaches into already-settled ground, so
the cursor may move on. Nothing about that is a trick to memorise; it falls straight out of asking
*which side still has unknowns in it*. And the payoff extends well past three colours: the same
loop, with the three cases rewritten as \`< pivot\`, \`== pivot\`, \`> pivot\`, is the three-way partition
that keeps quicksort linear-ish on arrays full of duplicate keys — which is the single most common
place a textbook quicksort falls over in production.

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
      "Count, then rewrite",
      "O(n), two passes",
      "O(1) — three counters",
      "Trivially correct and impossible to get subtly wrong, but reads the array twice and *replaces* elements rather than moving them",
      "Elements are plain interchangeable values, two passes are free, and you want certainty fast — also the right opening answer in an interview"
    ],
    [
      "Dutch national flag",
      "O(n), one pass",
      "O(1) — three indices",
      "One pass and every element genuinely moved, at the cost of an invariant you must state correctly and an asymmetric cursor rule",
      "A true single pass is required, elements carry a payload, or you want the three-way partition that hardens quicksort against duplicate keys"
    ]
  ]
}
