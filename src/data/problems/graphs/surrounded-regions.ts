import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "surrounded-regions",
  title: "Capture the Enclosed Regions",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "surrounded-regions",
  brief: "Flip every region of 0s that does not touch the border.",
  statement:
    "Given a grid of 1s and 0s, flip to 1 every region of connected 0s that is completely surrounded — that is, every such region not connected to the border. Return the grid.",
  constraints: [
    "1 <= rows, cols <= 200",
    "each cell is 0 or 1",
    "a region touching ANY border cell survives, however large it is",
    "connectivity is four-directional, so a diagonal touch does not connect two regions",
  ],
  examples: [
    {
      input: "board = [[1,1,1,1],[1,0,0,1],[1,1,0,1],[1,0,1,1]]",
      output: "[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,0,1,1]]",
      note: "The bottom 0 touches the border and survives.",
    },
    { input: "board = [[0]]", output: "[[0]]" },
  ],
  hints: [
    "Deciding whether each region is enclosed is hard. Deciding which ones are NOT is easy.",
    "A region survives exactly when it touches the border. So start from the border, not from the interior.",
    "Mark everything reachable from a border 0 as safe, then flip whatever is left.",
  ],
  whyNow:
    "Flood filling each interior region and asking afterwards whether it touched the border means carrying a verdict through the traversal and undoing work when the answer turns out to be no. Starting from the border inverts the question into one with no verdict to carry: everything reached is safe, everything else is captured.",
  approach:
    "Run a flood fill from every 0 on the border, marking each cell it reaches with a temporary value. Those are exactly the regions that survive, because reachability from the border is the definition of not being enclosed. Then sweep the grid once: any remaining 0 was unreachable, so it is captured and becomes 1, while every temporary mark is restored to 0. Inverting the question is the whole idea — it replaces a per-region verdict with a single global one.",
  complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
  python: `def rescue(grid: list[list[int]], r: int, c: int) -> None:
    if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]):
        return
    if grid[r][c] != 0:
        return
    grid[r][c] = 2
    rescue(grid, r + 1, c)
    rescue(grid, r - 1, c)
    rescue(grid, r, c + 1)
    rescue(grid, r, c - 1)


def solve(board: list[list[int]]) -> list[list[int]]:
    rows, cols = len(board), len(board[0])
    for r in range(rows):
        rescue(board, r, 0)
        rescue(board, r, cols - 1)
    for c in range(cols):
        rescue(board, 0, c)
        rescue(board, rows - 1, c)
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == 0:
                board[r][c] = 1
            elif board[r][c] == 2:
                board[r][c] = 0
    return board`,
  walkthrough: [
    {
      text: `1 1 1 1
1 0 0 1
1 1 0 1
1 0 1 1`,
      caption:
        "Two regions of 0s: one enclosed, one touching the bottom border.",
    },
    {
      text: `start from the BORDER

1 1 1 1
1 0 0 1
1 1 0 1
1 2 1 1`,
      caption: "The border 0 at the bottom is rescued and marked 2.",
    },
    {
      text: `1 1 1 1
1 0 0 1
1 1 0 1
1 2 1 1`,
      caption:
        "The interior region was never reached — no border cell connects to it.",
    },
    {
      text: `sweep: 0 → 1, 2 → 0

1 1 1 1
1 1 1 1
1 1 1 1
1 0 1 1`,
      caption: "Remaining 0s are captured; the rescued cells are restored.",
    },
    {
      text: `the question was inverted:
not 'is this enclosed?'
but 'what does the border reach?'`,
      caption: "That inversion is what removes the per-region verdict.",
    },
  ],
  alternatives: [
    {
      name: "Fill each region and check afterwards",
      summary:
        "Flood fill every region of 0s, collecting its cells and noting whether any of them sat on the border, then flip the regions that did not.",
      complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
      python: `def collect(grid: list[list[int]], seen: list[list[bool]], r: int, c: int, cells: list[tuple[int, int]]) -> bool:
    if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]):
        return False
    if seen[r][c] or grid[r][c] != 0:
        return False
    seen[r][c] = True
    cells.append((r, c))
    touches = r == 0 or c == 0 or r == len(grid) - 1 or c == len(grid[0]) - 1
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if collect(grid, seen, r + dr, c + dc, cells):
            touches = True
    return touches


def solve(board: list[list[int]]) -> list[list[int]]:
    rows, cols = len(board), len(board[0])
    seen = [[False] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == 0 and not seen[r][c]:
                cells: list[tuple[int, int]] = []
                if not collect(board, seen, r, c, cells):
                    for cr, cc in cells:
                        board[cr][cc] = 1
    return board`,
    },
  ],
}
