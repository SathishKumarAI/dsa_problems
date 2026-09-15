// spiral-matrix-ii — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Hold four boundaries and repeat: walk left to right along the top and pull the top down; walk top to bottom down the right and pull the right in; then, only if a row still remains, walk right to left along the bottom and pull it up; and only if a column still remains, walk bottom to top up the left and pull it in. The two guarded walks are what make odd sizes and single rows correct — without them the final ring is traversed twice and writes over what it already wrote. The counter runs from 1 to n squared, and the loop ends when it has been used up."

export const whyNow = "Walking with a direction vector and bouncing off cells already filled needs the matrix itself as the boundary, so it reads what it wrote and only works because zero is not a legal value here. Explicit boundaries keep the geometry in four numbers, which is the version that survives a rectangle, a different fill value, or a read instead of a write."

export const arc = "Spiral problems are not about the spiral; they are about whether your boundaries are half-open or closed and whether you shrink them before or after walking. Pick one convention — here, inclusive boundaries pulled in after each side — and every one of the four walks follows from it. The two guards before the return walks are the part worth internalising: the moment a ring is a single row or a single column, the walk back along it would revisit cells already handled, and that is exactly where an odd n or a one-by-one grid breaks a solution that looked right on the example. Write the guard first and the corner cases never arrive."

export const complexity = { time: "O(n^2)", space: "O(1) beyond the output" }

export const python = `def generate_matrix(n: int) -> list[list[int]]:
    grid = [[0] * n for _ in range(n)]
    top, bottom, left, right = 0, n - 1, 0, n - 1
    value = 1
    while value <= n * n:
        for c in range(left, right + 1):
            grid[top][c] = value
            value += 1
        top += 1
        for r in range(top, bottom + 1):
            grid[r][right] = value
            value += 1
        right -= 1
        if top <= bottom:  # guard: a single row must not be walked back
            for c in range(right, left - 1, -1):
                grid[bottom][c] = value
                value += 1
            bottom -= 1
        if left <= right:  # guard: a single column must not be walked back
            for r in range(bottom, top - 1, -1):
                grid[r][left] = value
                value += 1
            left += 1
    return grid`

export const alternatives: Solution[] = [
  {
    name: "Walk with a direction and bounce",
    summary:
      "Step in the current direction and turn clockwise whenever the next cell is off the grid or already filled. The matrix itself acts as the boundary, which works here only because zero cannot be a legitimate value.",
    complexity: { time: "O(n^2)", space: "O(1) beyond the output" },
    python: `def generate_matrix(n: int) -> list[list[int]]:
    grid = [[0] * n for _ in range(n)]
    moves = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    r = c = d = 0
    for value in range(1, n * n + 1):
        grid[r][c] = value
        dr, dc = moves[d]
        nr, nc = r + dr, c + dc
        # turn when the next cell is outside or already written
        if not (0 <= nr < n and 0 <= nc < n) or grid[nr][nc] != 0:
            d = (d + 1) % 4
            dr, dc = moves[d]
            nr, nc = r + dr, c + dc
        r, c = nr, nc
    return grid`,
  },
]
