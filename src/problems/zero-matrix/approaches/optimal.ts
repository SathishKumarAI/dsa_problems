// zero-matrix — approach 3 — Store the marks in the first row and first column (optimal)
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
  rung: "optimal",
  title: "Store the marks in the first row and first column (optimal)",
  idea: `*Two boolean arrays are already small, but the follow-up says \`O(1)\` extra memory — where can
\`rows + cols\` bits live if not in new memory?* Inside the matrix. Row 0 has exactly \`cols\` cells and
column 0 has exactly \`rows\` cells, which is precisely the shape of the two marker arrays. This fixes
the previous rung's last cost — **\`O(rows + cols)\` of marker storage** — and incurs one new
obligation: those two lines are about to be overwritten with marks, so their own fate must be read
first, into two booleans.`,
  intuition: `> **Intuition.** The grid has a **margin** built into it: its top edge and its left edge. Scribbling
> the bookkeeping in the margin costs nothing extra because the margin is part of the page — but
> whatever was written there is lost, so you read the margin first and remember, in two words,
> whether the margin itself was doomed. From then on the order is forced: write marks into the
> margin, blank the *interior* from those marks, and only when nobody will read the margin again,
> blank the margin. Every bug in this approach is a line in the wrong place, not an idea in the wrong
> shape.`,
  worked: `**Step 0 — record the margin's own fate, before anything is written.**

| line | contents | flag |
|---|---|---|
| row 0 | \`1, 2, 3, 4\` — no zero | \`first_row_zero = False\` |
| column 0 | \`1, 5, 9, 0\` — a zero at \`(3,0)\` | \`first_col_zero = True\` |

That second flag is why this example exists. The \`0\` at \`(3,0)\` is a **real** zero in the input, and
it sits in the very column about to become scratch space.

**Step 1 — mark, scanning the interior only (\`r >= 1\`, \`c >= 1\`).**

| cell | value | marks written |
|---|---|---|
| \`(1,1)\` | **0** | \`matrix[1][0] = 0\` (row 1 doomed), \`matrix[0][1] = 0\` (column 1 doomed) |
| \`(1,2)\`, \`(1,3)\` | 7, 8 | none |
| \`(2,1)\`–\`(2,3)\` | 1, 2, 3 | none |
| \`(3,1)\`–\`(3,3)\` | 4, 5, 6 | none |

The grid now holds data and marks side by side:

\`\`\`
[[1, 0, 3, 4],      matrix[0][1] = 0 is a MARK: "column 1 is doomed"
 [0, 0, 7, 8],      matrix[1][0] = 0 is a MARK: "row 1 is doomed"
 [9, 1, 2, 3],
 [0, 4, 5, 6]]      matrix[3][0] = 0 was already 0 — and it means BOTH things at once
\`\`\`

**Step 2 — apply to the interior, reading the marks.**

| cell | \`matrix[r][0]\` | \`matrix[0][c]\` | blanked? |
|---|---|---|---|
| \`(1,1)\` | 0 | 0 | yes |
| \`(1,2)\` | 0 | 3 | yes — row mark |
| \`(1,3)\` | 0 | 4 | yes — row mark |
| \`(2,1)\` | 9 | 0 | yes — column mark |
| \`(2,2)\` | 9 | 3 | no |
| \`(2,3)\` | 9 | 4 | no |
| \`(3,1)\` | **0** | 0 | yes |
| \`(3,2)\` | **0** | 3 | yes — the original zero at \`(3,0)\` doing double duty |
| \`(3,3)\` | **0** | 4 | yes |

\`\`\`
[[1, 0, 3, 4],
 [0, 0, 0, 0],
 [9, 0, 2, 3],
 [0, 0, 0, 0]]
\`\`\`

**Step 3 — the margin, last, now that nothing will read it again.** \`first_row_zero\` is \`False\`, so
row 0 keeps its values; \`first_col_zero\` is \`True\`, so column 0 is blanked:

\`\`\`
[[0, 0, 3, 4],
 [0, 0, 0, 0],
 [0, 0, 2, 3],
 [0, 0, 0, 0]]
\`\`\`

✅ Identical to approaches 1 and 2, with two booleans of extra memory.`,
  code: `def zero_matrix_first_line_marks(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    # read the margin's own fate FIRST: the next loop is about to overwrite it
    first_row_zero = any(matrix[0][c] == 0 for c in range(cols))
    first_col_zero = any(matrix[r][0] == 0 for r in range(rows))

    for r in range(1, rows):              # interior only: row 0 and column 0 are storage now
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = 0          # this row is doomed
                matrix[0][c] = 0          # so is this column

    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0

    if first_row_zero:                    # last, so the marks survive until they are read
        for c in range(cols):
            matrix[0][c] = 0
    if first_col_zero:
        for r in range(rows):
            matrix[r][0] = 0
    return matrix`,
  mistake: `> **Watch out.** Computing the two flags **after** the marking loop instead of before it. The line
> reads identically and the variable names are identical. The misconception is that the flags are
> just "does this line contain a zero" — by then the line contains **marks**, which were never data,
> and the code reads its own handwriting as evidence.

On the worked example:

| | result |
|---|---|
| buggy | \`[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]\` |
| correct | \`[[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]\` |

Row 0 was destroyed because \`matrix[0][1]\` had been set to \`0\` as the mark for column 1. On
\`[[1,2,3],[4,0,6],[7,8,9]]\` the same bug returns \`[[0,0,0],[0,0,0],[0,0,9]]\` where the answer is
\`[[1,0,3],[0,0,0],[7,0,9]]\`: two extra lines wiped, both traceable to one mark.

Two near neighbours, both measured:

| Variant | On this input | Result |
|---|---|---|
| Blank the margin **before** the interior apply loop | any grid with marks | the apply loop reads all-zero marks and the entire grid goes to \`0\` |
| Drop the flags entirely, never blank the margin | \`[[1,0],[1,1]]\` | \`[[1,0],[1,0]]\` instead of \`[[0,0],[1,0]]\` — the zero in row 0 blanked column 1 but was never allowed to blank its own row |`,
  cost: `**Time \`O(rows · cols)\`** — four passes, all linear in the cell count: two to read the flags (really
\`rows + cols\`), one to mark, one to apply, plus a bounded tidy-up. **Space \`O(1)\`** — two booleans
and the loop counters; nothing allocated scales with the input.

> **In an interview.** This is the expected answer, because this problem is asked *for* its follow-up.
> State the ordering before writing anything — read the flags, mark from the interior, apply to the
> interior, blank the margin last — and be ready for "why do the loops start at 1?". The answer,
> \`matrix[0][0]\` would have to mean two things at once, is the whole insight. Expect one more
> follow-up: *"could you mark with a sentinel value instead?"* Refuse it out loud — values span the
> full 32-bit range, so any sentinel might be genuine data.

The transferable idea is bigger than this problem: **information worth one bit per line does not need
storage of its own when the structure already contains a line that can hold it**, and borrowing that
storage always carries the same interest — save the borrowed cells' state before overwriting, restore
it after everything has read them. The same shape appears in in-place array marking (negating
\`nums[abs(x) - 1]\` to record "I have seen \`x\`" in first-missing-positive and find-all-duplicates).

---`,
  notes: [
    { title: "why it works", body: `> **Why it works.** Two separate claims, and the second is the one everyone skips.
>
> **1. Column 0 can safely hold the row marks.** The invariant is: *after the marking pass,
> \`matrix[r][0] == 0\` if and only if row \`r\` is doomed*, for every \`r >= 1\`. Both directions hold.
> If an interior cell \`(r, c)\` is zero, the pass explicitly writes \`matrix[r][0] = 0\` — so a doomed
> row is always marked. And if \`matrix[r][0]\` is zero without the pass writing it, then it was zero
> in the **input**, and an input zero in row \`r\` dooms row \`r\` anyway — so the mark is still telling
> the truth. That second half is the part that looks like luck and is not: the cell used for storage
> lies *in the very row it describes*, so the only way it can lie to you is by accidentally telling
> the truth. Row 0 holds the column marks by the mirror argument. Look at \`(3,0)\` in the trace above:
> an original zero that reads as "row 3 is doomed", which it is.
>
> **2. Why the two lines' own fate must be read first.** The invariant just stated says nothing about
> whether **column 0 itself** is doomed — and it cannot, because \`matrix[r][0] == 0\` is now
> overloaded: it might be an original zero (which dooms column 0) or a mark written by an interior
> zero (which does not). After the marking pass those two are indistinguishable. Before it, they are
> perfectly distinguishable, because no mark has been written yet. So the flags are not defensive
> bookkeeping; they capture the one fact that the marking pass is about to destroy.
>
> The same overloading is why both loops start at index \`1\`. If the marking pass ran from \`0\`, an
> input zero at \`(0,c)\` would write a "row 0 is doomed" mark into \`matrix[0][0]\` — and \`matrix[0][0]\`
> is simultaneously the row-0 mark and the column-0 mark. One cell, two meanings, no way to separate
> them. Reserving the margin and keeping two booleans outside the grid is exactly what buys the
> separation back.` },
  ],
}
