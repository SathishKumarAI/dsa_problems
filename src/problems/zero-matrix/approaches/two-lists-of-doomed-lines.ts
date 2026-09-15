// zero-matrix — approach 2 — Two lists of doomed lines
//
// Converted from docs/deep/zero-matrix_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "two-lists-of-doomed-lines",
  title: "Two lists of doomed lines",
  idea: `*The copy stores 40 000 numbers to remember at most 400 facts — can the decision be kept at its own
natural size?* Yes. All the second pass needs is "is this row doomed?" and "is this column doomed?".
Collect those two sets in one pass, apply them in another. This fixes the copy's weakness: **it
duplicates a whole grid to record one bit per line.**`,
  intuition: `> **Intuition.** A spreadsheet with a tick-box at the head of every row and every column. Walk the
> cells once and tick the boxes — you are marking margins, not editing data, so nothing you write can
> be mistaken for something you found. Walk the cells a second time and blank any cell whose row box
> or column box is ticked. Because **doomed** is a yes/no, ticking a box twice is harmless, which is
> exactly why overlapping wipes need no special handling at all.`,
  worked: `**Pass 1 — decide.** Nothing is written to the grid.

| cell | value | \`dead_rows\` | \`dead_cols\` |
|---|---|---|---|
| \`(0,0)\`–\`(0,3)\` | 1, 2, 3, 4 | \`{}\` | \`{}\` |
| \`(1,0)\` | 5 | \`{}\` | \`{}\` |
| **\`(1,1)\`** | **0** | \`{1}\` | \`{1}\` |
| \`(1,2)\`–\`(2,3)\` | 7, 8, 9, 1, 2, 3 | \`{1}\` | \`{1}\` |
| **\`(3,0)\`** | **0** | \`{1, 3}\` | \`{0, 1}\` |
| \`(3,1)\`–\`(3,3)\` | 4, 5, 6 | \`{1, 3}\` | \`{0, 1}\` |

**Pass 2 — apply.** Blank every cell whose row is in \`{1,3}\` or whose column is in \`{0,1}\`.

| row | before | why | after |
|---|---|---|---|
| 0 | \`[1, 2, 3, 4]\` | columns 0 and 1 are doomed | \`[0, 0, 3, 4]\` |
| 1 | \`[5, 0, 7, 8]\` | the whole row is doomed | \`[0, 0, 0, 0]\` |
| 2 | \`[9, 1, 2, 3]\` | columns 0 and 1 are doomed | \`[0, 0, 2, 3]\` |
| 3 | \`[0, 4, 5, 6]\` | the whole row is doomed | \`[0, 0, 0, 0]\` |

✅ Same answer as approach 1, with two small sets instead of a second grid.`,
  code: `def zero_matrix_marker_lists(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    dead_rows: set[int] = set()
    dead_cols: set[int] = set()
    for r in range(rows):                     # pass 1: decide, write nothing
        for c in range(cols):
            if matrix[r][c] == 0:
                dead_rows.add(r)
                dead_cols.add(c)
    for r in range(rows):                     # pass 2: apply, decide nothing
        for c in range(cols):
            if r in dead_rows or c in dead_cols:
                matrix[r][c] = 0
    return matrix`,
  mistake: `> **Watch out.** Merging the two loops "to save a pass". The misconception is that the second pass is
> a stylistic tidy-up. It is not — **the second pass exists to reach backwards**, to the cells the
> scan had already gone past when the verdict arrived.

\`\`\`python
for r in range(rows):
    for c in range(cols):
        if matrix[r][c] == 0:
            dead_rows.add(r); dead_cols.add(c)
        if r in dead_rows or c in dead_cols:   # BUG: applying while still deciding
            matrix[r][c] = 0
\`\`\`

This does not cascade — the sets are still fed from original values — but it applies each verdict only
to cells it has *not yet passed*. A row discovered doomed at column 3 keeps columns 0 to 2. On the
worked example it returns

\`\`\`
[[1, 2, 3, 4], [5, 0, 0, 0], [9, 0, 2, 3], [0, 0, 0, 0]]
\`\`\`

against the correct \`[[0,0,3,4],[0,0,0,0],[0,0,2,3],[0,0,0,0]]\`. Row 0 is untouched because both
doomed columns were discovered after it; row 1 keeps its \`5\` for the same reason.`,
  cost: `**Time \`O(rows · cols)\`** — two flat passes, with the blanking folded into the second rather than
repeated per zero, so unlike approach 1 this is strictly linear in the cell count. **Space
\`O(rows + cols)\`** — one bit per line, at most 400 entries.

This is the answer to give if the follow-up is never asked, and the one to reach for under pressure:
no argument is needed beyond "decide, then apply", and there are no edge cases to get wrong. It also
generalises — the same shape handles game-of-life, simultaneous relabelling, and any grid update
whose new state is a function of the old one. Know that the next rung exists; write this one if you
have sixty seconds.

---`,
}
