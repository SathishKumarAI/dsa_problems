// rotate-image — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Transpose the matrix by swapping each cell above the main diagonal with its mirror below, then reverse each row. Transposing reflects the grid across the diagonal and reversing reflects it left to right; two reflections compose into a rotation, and the order picks the direction — this order gives clockwise, the reverse order gives anticlockwise. Both steps are in place and use one temporary cell. The inner loop of the transpose must start at the diagonal, since swapping every pair twice returns the matrix to where it started."

export const whyNow = "Cycling four cells at a time is the same rotation in one pass and is genuinely the tighter answer, but its index arithmetic has four expressions that must agree and is easy to get subtly wrong under pressure. Transpose-then-reverse is two operations that are each obviously correct on their own, which is why it is the one to reach for."

export const arc = "The idea that carries beyond this problem is decomposing a transformation you cannot see into ones you can. A 90-degree rotation is hard to perform cell by cell in place; a transpose and a row reversal are each trivial, and their composition is exactly the rotation. That is worth remembering as a fact — two reflections about intersecting axes make a rotation through twice the angle between them — and as a habit: when a transformation looks awkward, ask which simple ones compose into it. The details that bite are the loop bound on the transpose, which must start at the diagonal, and the direction, which the ORDER of the two steps decides."

export const complexity = { time: "O(n^2)", space: "O(1)" }

export const python = `def rotate(matrix: list[list[int]]) -> list[list[int]]:
    n = len(matrix)
    # 1. transpose: swap across the main diagonal, ABOVE it only —
    #    doing both halves swaps every pair twice and changes nothing
    for r in range(n):
        for c in range(r + 1, n):
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    # 2. reverse each row; transpose then reverse is CLOCKWISE
    for row in matrix:
        row.reverse()
    return matrix`

export const alternatives: Solution[] = [
  {
    name: "Write into a fresh grid",
    summary:
      "Allocate an n by n result and copy each cell to where the rotation sends it: row r, column c becomes row c, column n-1-r. It is the clearest statement of what rotating means, and it is the one thing the problem forbids.",
    complexity: { time: "O(n^2)", space: "O(n^2)" },
    python: `def rotate(matrix: list[list[int]]) -> list[list[int]]:
    n = len(matrix)
    fresh = [[0] * n for _ in range(n)]
    for r in range(n):
        for c in range(n):
            fresh[c][n - 1 - r] = matrix[r][c]
    for r in range(n):
        for c in range(n):
            matrix[r][c] = fresh[r][c]
    return matrix`,
  },
  {
    name: "Rotate four cells at a time",
    summary:
      "Work ring by ring from the outside in, moving four cells around in one go with a single temporary. It touches every cell exactly once and allocates nothing — the tightest version, and the one whose four index expressions must all agree.",
    complexity: { time: "O(n^2)", space: "O(1)" },
    whyNow:
      "Building a fresh grid needs the second n by n array the problem rules out. Rotating a cycle of four cells at once means each one moves straight to its destination with nowhere to store the rest.",
    python: `def rotate(matrix: list[list[int]]) -> list[list[int]]:
    n = len(matrix)
    for layer in range(n // 2):
        last = n - 1 - layer
        for i in range(layer, last):
            offset = i - layer
            top = matrix[layer][i]
            matrix[layer][i] = matrix[last - offset][layer]
            matrix[last - offset][layer] = matrix[last][last - offset]
            matrix[last][last - offset] = matrix[i][last]
            matrix[i][last] = top
    return matrix`,
  },
]
