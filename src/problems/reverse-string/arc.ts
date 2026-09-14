// reverse-string — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/reverse-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step here chases is *stop building the answer and start moving it*, and the reason
the ladder has five rungs rather than two is that the cost of building is invisible in the source.
The recursive definition is where most people begin because it is the truest sentence about reversal —
the reverse of a string is the reverse of its tail with its head on the end — and it is also the most
expensive thing on the page, since each level copies a slice going down and allocates a longer string
coming up, giving quadratic work and one stack frame per character that overflows at a fraction of the
legal input size. Flattening it into a loop that prepends removes the stack depth and keeps the
quadratic cost, which is that rung's entire pedagogical purpose: the line \`out = c + out\` looks like
one operation and is \`n\` of them, and until you have **priced your language's string concatenation**
you cannot tell an \`O(n)\` loop from an \`O(n²)\` one by reading it. Pricing it points straight at the
fix — use a container whose ends are cheap — and a stack delivers that, turning the reversal into \`n\`
pushes and \`n\` pops that never copy the collection, the first honestly linear rung. But the stack's
output order is just the input read from the last index to the first, which means the container was
recovering ordering the string's own indices already carried; deleting it leaves a single backward
walk into a buffer, one read and one write per character, the floor for anything producing a new
string. And then the last question is whether a new string is needed at all — it is not, because the
destination of \`i\` is \`n−1−i\` and the destination of \`n−1−i\` is \`i\`, so the two can trade directly,
every swap settles two characters, and what remains is \`n/2\` iterations, no allocation, and two indices
as the entire state. Two habits are worth carrying away. First, before putting a concatenation inside
a loop, say out loud whether it is \`O(1)\` or \`O(n)\` — that one question separates the two quadratic
rungs from the three linear ones and generalises to every "build a collection incrementally" problem
you will meet. Second, the inward two-pointer swap is not a trick for this problem but the base
pattern for reversing any sub-range, which is precisely what rotate-array and next-permutation are
built out of.

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
      "Recursion",
      "`O(n²)`",
      "`O(n)` frames, `O(n²)` copied",
      "States what reversal *is* in one line; pays a slice and an allocation per character, and overflows the stack",
      "Explaining the definition out loud — never for running on real input"
    ],
    [
      "Grow a new string (prepend)",
      "`O(n²)`",
      "`O(n)`",
      "Flat, so no overflow, but every step rebuilds the whole answer so far",
      "Only as the mistake you catch and price before the interviewer does"
    ],
    [
      "Stack of characters",
      "`O(n)`",
      "`O(n)`",
      "Buys linear time with a container whose ends are cheap; carries a full extra copy",
      "The reversal is a by-product of something that genuinely needs a stack"
    ],
    [
      "Copy back to front",
      "`O(n)`",
      "`O(n)`",
      "One read and one write per character — the floor for producing a *new* string",
      "The input must not be modified, or a new string is wanted anyway (`s[::-1]`)"
    ],
    [
      "Two pointers swapping inward",
      "`O(n)`, `n/2` swaps",
      "`O(1)`",
      "Writes the answer over the input, so no buffer at all; needs a mutable input",
      "The default answer, and the sub-range primitive behind rotate-array and next-permutation"
    ]
  ]
}
