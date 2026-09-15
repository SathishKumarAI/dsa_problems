// zero-matrix — approach 1 — Write the answer into a copy
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
  rung: "write-into-a-copy",
  title: "Write the answer into a copy",
  idea: `*How do I stop the sweep reacting to its own output?* Give it somewhere else to write. Read every
decision from the original grid and write every zero into a fresh grid of the same size. The original
is never modified while it is still being consulted, so the chain reaction has nothing to chain
through.`,
  intuition: `> **Intuition.** A photograph, with a sheet of tracing paper laid over it. You look only at the
> photograph and you draw only on the tracing paper; because you never look at the tracing paper, the
> marks you make can never be mistaken for something you found. Decide-then-apply is enforced by
> physics here rather than by care — the read surface and the write surface are different objects.
> That is the safest version of the discipline, and the most expensive, because the tracing paper is
> as big as the photograph.`,
  worked: `\`out\` starts as an exact copy. The scan walks the **original**, row by row.

| scan position | original value | action | \`out\` after |
|---|---|---|---|
| \`(0,0)\`–\`(0,3)\` | 1, 2, 3, 4 | nothing | \`[[1,2,3,4],[5,0,7,8],[9,1,2,3],[0,4,5,6]]\` |
| \`(1,0)\` | 5 | nothing | unchanged |
| **\`(1,1)\`** | **0** | blank row 1 and column 1 in \`out\` | \`[[1,0,3,4],[0,0,0,0],[9,0,2,3],[0,0,5,6]]\` |
| \`(1,2)\`, \`(1,3)\` | 7, 8 | nothing — \`out[1][2]\` is already \`0\`, but the scan reads the **original** | unchanged |
| \`(2,0)\`–\`(2,3)\` | 9, 1, 2, 3 | nothing | unchanged |
| **\`(3,0)\`** | **0** | blank row 3 and column 0 in \`out\` | \`[[0,0,3,4],[0,0,0,0],[0,0,2,3],[0,0,0,0]]\` |
| \`(3,1)\`–\`(3,3)\` | 4, 5, 6 | nothing | unchanged |

Result \`[[0,0,3,4],[0,0,0,0],[0,0,2,3],[0,0,0,0]]\`. ✅

The decisive row is \`(1,2)\`. By then \`out[1][2]\` is \`0\`, but the scan looks at \`matrix[1][2]\`, which
is still \`7\`, so nothing fires. In the false start that same cell *is* the zero, and the cascade
begins there.`,
  code: `def zero_matrix_copy(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    out = [row[:] for row in matrix]     # row[:] per row: [matrix[0]] * rows would alias one list
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:        # the decision ALWAYS reads the original
                for k in range(cols):
                    out[r][k] = 0
                for k in range(rows):
                    out[k][c] = 0
    for r in range(rows):
        matrix[r] = out[r]               # the caller asked for the input to be updated
    return matrix`,
  mistake: `> **Watch out.** Writing \`if out[r][c] == 0:\` instead of \`if matrix[r][c] == 0:\`. The misconception
> is that *making a copy* is the safety property. It is not — **reading from the one you are not
> writing to** is. With the copy in place and the wrong variable read, the cascade is back and you
> have paid for a second grid to host it.

On the worked example it returns \`[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]\` — byte for byte what the
false start returns. If you cannot say out loud which of the two grids each line touches, the bug is
already in.

The sibling slip is Python-specific: \`out = [[0] * cols] * rows\`, or \`[matrix[0][:]] * rows\`. The
\`* rows\` repeats a **reference**, so all four "rows" are one list and blanking any of them blanks all
four. Use a comprehension, or \`row[:]\` per row.`,
  cost: `**Time \`O(rows · cols · (rows + cols))\`** — every cell is visited once, and each zero found costs a
full row-blank plus a full column-blank, so on a grid that is mostly zeros the inner work dominates.
**Space \`O(rows · cols)\`** — a second grid the size of the input.

Use it when the input genuinely must not be modified (a caller still holds a reference), or as the
first thing you write at a whiteboard: it makes the read/write separation visible in the *shape* of
the code, and every later rung is then introduced by asking which part of it is waste.

---`,
}
