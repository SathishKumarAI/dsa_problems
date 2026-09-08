import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "unique-paths",
  title: "Paths Across a Grid",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "unique-paths",
  brief: "How many ways from the top-left to the bottom-right.",
  statement:
    "A robot starts at the top-left of an m x n grid and may only move right or down. Return how many distinct paths reach the bottom-right corner.",
  constraints: [
    "1 <= m, n <= 100",
    "moves are RIGHT or DOWN only — never up or left, which is what makes the count finite",
    "the answer fits in a 32-bit signed integer for all allowed inputs",
    "a grid one cell wide or one cell tall has exactly one path",
  ],
  examples: [
    { input: "m = 3, n = 7", output: "28" },
    { input: "m = 3, n = 2", output: "3" },
  ],
  hints: [
    "How many ways reach a given cell? Only two cells can lead into it.",
    "So paths(r, c) = paths(r-1, c) + paths(r, c-1) — the cell above plus the cell to the left.",
    "The top row and left column have exactly one path each, which seeds the whole table.",
  ],
  whyNow:
    "The recursion asks the same cell's question once for every path that passes through it, which is exponential. Filling a table asks each cell once — and because a cell needs only the row above and the value to its left, a single row can be updated in place, so the memory drops from a full grid to one row.",
  approach:
    "Keep one row holding the number of paths to each column of the current row, initialised to all ones for the top row. Sweep down: for each new row, walk left to right adding the value to the left into the current value. That addition IS the recurrence — the value already in the slot is the count from the row above, and the value to the left is the count from the left neighbour, because it has already been updated for this row. The last entry after the final sweep is the answer.",
  complexity: { time: "O(m · n)", space: "O(n)" },
  python: `def unique_paths(m: int, n: int) -> int:
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]
    return row[n - 1]`,
  walkthrough: [
    {
      text: `m = 3, n = 3

row   1  1  1`,
      caption:
        "The top row has one path to each cell — you can only walk right.",
    },
    {
      text: `after row 2

row   1  2  3`,
      caption: "Each cell adds the one to its left: 1, 1+1=2, 1+2=3.",
    },
    {
      text: `after row 3

row   1  3  6   ←`,
      caption: "Again: 1, 1+2=3, 3+3=6. The last entry is the answer.",
    },
    {
      text: `full grid, for comparison

1  1  1
1  2  3
1  3  6`,
      caption:
        "The one row was the bottom of this grid at each step — the rows above were never needed again.",
    },
    {
      text: `answer 6`,
      caption:
        "Each cell was computed once. The recursion would have re-asked the middle cells dozens of times.",
    },
  ],
  alternatives: [
    {
      name: "Branch at every cell",
      summary:
        "Recurse from the start, trying a move right and a move down at each cell and summing the paths each returns.",
      complexity: { time: "O(2^(m+n))", space: "O(m + n)" },
      python: `def walk(m: int, n: int, r: int, c: int) -> int:
    if r == m - 1 or c == n - 1:
        return 1
    return walk(m, n, r + 1, c) + walk(m, n, r, c + 1)


def unique_paths(m: int, n: int) -> int:
    return walk(m, n, 0, 0)`,
    },
  ],
}
