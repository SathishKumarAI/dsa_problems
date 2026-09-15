// zero-matrix — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/zero-matrix_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step here chases is *separate the reading of a structure from the writing of it,
then shrink whatever carries the decision across the gap*. The trouble starts because the problem's
semantics are **simultaneous** — every wipe is triggered by the grid as handed to you — while a
program is unavoidably sequential, so the instinctive single sweep begins consulting zeros it planted
itself and a four-by-four grid collapses to nothing; fixing that is not an optimisation, it is the
problem, and the only design question left is where the decision waits in between the two passes. The
first honest answer is a second grid: read the photograph, draw on the tracing paper, and the two
cannot be confused because they are different objects — safe, obvious, and 40 000 numbers spent to
record at most 400 facts. Naming that ratio forces the next step, because what is actually being
remembered is one bit per row and one bit per column, so two sets of line indices hold it exactly and
the grid is touched only twice, once to fill the margins and once to blank from them. Then the
follow-up asks for constant memory and there is nowhere left to put the marks except the input —
which turns out to already contain a row of length \`cols\` and a column of length \`rows\`, exactly the
two arrays just discarded, sitting there as unused storage. Moving the marks in costs nothing and
works because a mark lives in the very line it describes, so an original zero occupying a mark cell
can only ever say something true; the one fact that arrangement destroys is whether those two lines
were doomed *themselves*, which is why two booleans are read before the first mark is written and
acted on only after the last mark has been read. That ordering — save the borrowed cells, mark,
apply, restore — is the whole of the final rung. Two habits come out of it. First, whenever an update
rule is phrased in terms of the *original* state, expect two passes and say so before writing a line;
game-of-life, simultaneous graph relabelling and double-buffered rendering are the same question in
different clothes. Second, when an algorithm needs a little side memory, check whether the input
already contains somewhere to put it — and remember that borrowing space is a loan with interest, and
the interest is recording what was there first.

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
      "Write into a copy",
      "`O(rows · cols · (rows + cols))`",
      "`O(rows · cols)`",
      "Buys safety with a whole second grid; read surface and write surface are different objects, so the cascade is impossible by construction",
      "The input must not be modified, or you are establishing the decide-then-apply rule out loud before optimising"
    ],
    [
      "Two lists of doomed lines",
      "`O(rows · cols)`",
      "`O(rows + cols)`",
      "Stores the decision at its natural size — one bit per line — at the cost of two auxiliary containers",
      "In-place is fine but constant space was not demanded; the version to derive under pressure, with no edge cases"
    ],
    [
      "Marks in the first row and column",
      "`O(rows · cols)`",
      "`O(1)`",
      "Borrows storage from the input itself; pays for it by saving and restoring the two borrowed lines in the right order",
      "The follow-up asks for `O(1)` extra memory — which on this problem it always does"
    ]
  ]
}
