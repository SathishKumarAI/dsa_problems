// zero-matrix — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/zero-matrix_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed a grid of numbers. Wherever a zero sits, its whole row and its whole column are
blanked — every cell in that row becomes \`0\`, every cell in that column becomes \`0\`. Hand the grid
back after all of that has happened.

The phrase carrying the weight is **all of that has happened**. The wipes are decided by the grid you
were *given*, and they all take effect at once, like a simultaneous move in a board game. A cell that
turns \`0\` because someone else's row swept through it is a **casualty**, not a trigger — it must not
go on to wipe a column of its own.

**The core question: which rows and which columns are doomed?** Once you know those two lists the
rest is one pass of arithmetic. The naive approach is slow — and worse, wrong — because it tries to
answer that question and act on the answer in the same grid at the same time, so from the second row
onward it is reading zeros it planted itself.

### The misconception this problem is built around

Nearly everyone's first attempt is this, and it is worth writing down precisely because it *reads*
correctly:

\`\`\`python
for r in range(rows):
    for c in range(cols):
        if matrix[r][c] == 0:
            blank row r
            blank column c
\`\`\`

Run it on the grid used throughout this document and it returns:

| | result | |
|---|---|---|
| in | \`[[1,2,3,4], [5,0,7,8], [9,1,2,3], [0,4,5,6]]\` | |
| **false start** | \`[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]\` | everything gone |
| correct | \`[[0,0,3,4], [0,0,0,0], [0,0,2,3], [0,0,0,0]]\` | |

That is a **chain reaction**, not an off-by-one. The zero at \`(1,1)\` blanks row 1 and column 1, which
plants a zero at \`(2,1)\`; two steps later the scan meets that zero, believes it, and blanks row 2;
and so on until the grid is ash. (The script at the foot of this document reproduces that run, kept
deliberately *outside* the agreement check — it is the bug, not an approach.)

> **Watch out.** The thing you were about to think is *"I'll just be careful about the order I scan
> in."* You cannot be. There is no scan order that works, because a zero can appear anywhere relative
> to the zero that caused it. The fix is not care, it is structure: **decide in one pass, apply in
> another**, and never let a sweep write into the structure it is still consulting.

Every approach below obeys that rule. They differ only in **where the decision waits** between the
two passes — in a whole second grid, in two small sets, or inside the input itself.

### The constraints, and what each one unlocks

Note the ratio the follow-up is pointing at: at most \`rows + cols\` bits — 400 for the largest legal
grid — describe a 40 000-cell answer. Two marker arrays are already a big win over copying. The last
rung notices the grid already *contains* a row of length \`cols\` and a column of length \`rows\`, which
is exactly the storage required, and moves the marks in there.
### The worked example, used in every section below

\`\`\`
matrix = [[1, 2, 3, 4],
          [5, 0, 7, 8],
          [9, 1, 2, 3],
          [0, 4, 5, 6]]

answer = [[0, 0, 3, 4],
          [0, 0, 0, 0],
          [0, 0, 2, 3],
          [0, 0, 0, 0]]
\`\`\`

Two zeros: one at \`(1,1)\` in the interior, one at \`(3,0)\` sitting in column 0. Rows 1 and 3 are
doomed; columns 0 and 1 are doomed. It was chosen because that second zero lands in the very column
the last approach wants to use as scratch space — which is where that approach's only subtlety lives.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= rows, columns <= 200`",
    "what": "At most 40 000 cells, and every approach here is `O(rows · cols)`. Time is never the interesting axis on this problem — **space** is. A `1 × 1` grid is legal, and so are single-row and single-column grids, which is exactly where the constant-space rung's index juggling goes wrong."
  },
  {
    "constraint": "`-2^31 <= value < 2^31`",
    "what": "The full 32-bit range is in play, so **no value can be reserved as a private marker**. This kills the popular \"write `-10^9` into doomed cells and sweep for it later\" idea: any sentinel might be real data. It is why the last rung marks with a plain `0` in cells whose *position* carries the meaning."
  },
  {
    "constraint": "the triggers are the zeros in the **input**",
    "what": "The decide-then-apply rule, stated as a constraint. This is the problem."
  },
  {
    "constraint": "wipes overlap freely",
    "what": "A cell can be doomed twice and nothing needs de-duplicating — **doomed** is a boolean, not a count. That is why a set (or a boolean array, or a single marker cell) is the right shape and a list of coordinates is not."
  },
  {
    "constraint": "the follow-up asks for **`O(1)` extra memory**",
    "what": "**The permission slip for the last rung.** It forbids the two marker arrays, and the only place left for one bit per row and one bit per column is a row and a column of the matrix itself."
  }
]
