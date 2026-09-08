import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "max-island-area",
  title: "Largest Island in the Grid",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "max-area-of-island",
  brief: "Size of the biggest connected patch of land.",
  statement:
    "Given a grid of 0s (water) and 1s (land), an island is a group of 1s connected horizontally or vertically. Return the number of cells in the largest island, or 0 if the grid holds no land at all.",
  constraints: [
    "1 <= grid.length, grid[0].length <= 50",
    "each cell is 0 or 1",
    "connectivity is four-directional — diagonally touching cells are two different islands",
    "a grid of all water has a largest island of 0, which is an answer and not a failure",
  ],
  examples: [
    {
      input: "grid = [[1, 1, 0], [1, 0, 0], [0, 0, 1]]",
      output: "3",
      note: "The top-left island has three cells; the corner one has one.",
    },
    {
      input: "grid = [[0, 0], [0, 0]]",
      output: "0",
      note: "No land.",
    },
  ],
  hints: [
    "A grid is a graph in disguise: every land cell is a node, and it has an edge to each land neighbour.",
    "Start from an unvisited land cell and flood outward — everything you reach is one island, and counting the cells you reach is its area.",
    "Sink each cell as you visit it (write a 0, or mark it seen), or the flood will walk back the way it came forever.",
  ],
  whyNow:
    "Counting an island by repeatedly re-scanning the grid for cells adjacent to what you already have re-reads the whole grid once per growth step. A flood fill visits each cell exactly once, because a visited cell is marked the moment it is claimed — the traversal itself carries the frontier.",
  approach:
    "Walk every cell. When you find land that has not been claimed, run a flood fill from it: claim the cell, add one to the running area, and recurse into the four neighbours that are in bounds and still land. The value that comes back is the island's area; keep the largest seen. Marking on entry rather than on exit is what stops the fill revisiting cells and looping — the mark is the visited set.",
  complexity: { time: "O(m · n)", space: "O(m · n)" },
  python: `def fill(grid: list[list[int]], r: int, c: int) -> int:
    if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]):
        return 0
    if grid[r][c] != 1:
        return 0
    grid[r][c] = 0
    return (
        1
        + fill(grid, r + 1, c)
        + fill(grid, r - 1, c)
        + fill(grid, r, c + 1)
        + fill(grid, r, c - 1)
    )


def max_area_of_island(grid: list[list[int]]) -> int:
    best = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == 1:
                best = max(best, fill(grid, r, c))
    return best`,
  java: `public int fill(int[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return 0;
    if (grid[r][c] != 1) return 0;
    grid[r][c] = 0;
    return 1 + fill(grid, r + 1, c) + fill(grid, r - 1, c)
             + fill(grid, r, c + 1) + fill(grid, r, c - 1);
}

public int maxAreaOfIsland(int[][] grid) {
    int best = 0;
    for (int r = 0; r < grid.length; r++) {
        for (int c = 0; c < grid[0].length; c++) {
            if (grid[r][c] == 1) best = Math.max(best, fill(grid, r, c));
        }
    }
    return best;
}`,
  cpp: `int fill(vector<vector<int>>& grid, int r, int c) {
    if (r < 0 || r >= (int)grid.size() || c < 0 || c >= (int)grid[0].size()) return 0;
    if (grid[r][c] != 1) return 0;
    grid[r][c] = 0;
    return 1 + fill(grid, r + 1, c) + fill(grid, r - 1, c)
             + fill(grid, r, c + 1) + fill(grid, r, c - 1);
}

int maxAreaOfIsland(vector<vector<int>> grid) {
    int best = 0;
    for (int r = 0; r < (int)grid.size(); r++) {
        for (int c = 0; c < (int)grid[0].size(); c++) {
            if (grid[r][c] == 1) best = max(best, fill(grid, r, c));
        }
    }
    return best;
}`,
  walkthrough: [
    {
      text: `1 1 0
1 0 0
0 0 1`,
      caption:
        "Two islands: a three-cell one at the top left and a single cell at the bottom right.",
    },
    {
      text: `* 1 0
1 0 0
0 0 1`,
      caption:
        "The scan finds land at (0,0). The flood fill claims it — area 1 — and looks at its four neighbours.",
    },
    {
      text: `* * 0
1 0 0
0 0 1`,
      caption:
        "(0,1) is land → claimed, area 2. Its own neighbours are water or already claimed.",
    },
    {
      text: `* * 0
* 0 0
0 0 1`,
      caption:
        "(1,0) is land → claimed, area 3. The frontier is now empty, so this island is finished at 3.",
    },
    {
      text: `* * 0
* 0 0
0 0 *`,
      caption:
        "The scan continues and finds the lone cell at (2,2): a second island of area 1. Note it does NOT join the first — diagonal contact is not connection.",
    },
    {
      text: `* * 0
* 0 0
0 0 *`,
      caption: "Largest area seen: 3. Every cell was visited exactly once.",
    },
  ],
  alternatives: [
    {
      name: "Grow by rescanning",
      summary:
        "Claim one land cell as a seed, then sweep the whole grid over and over adding any land cell touching the island, until a full sweep adds nothing.",
      complexity: { time: "O((m · n)²)", space: "O(m · n)" },
      python: `def max_area_of_island(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    best = 0
    for r0 in range(rows):
        for c0 in range(cols):
            if grid[r0][c0] != 1 or seen[r0][c0]:
                continue
            island = {(r0, c0)}
            seen[r0][c0] = True
            grew = True
            while grew:
                grew = False
                for r in range(rows):
                    for c in range(cols):
                        if grid[r][c] != 1 or (r, c) in island:
                            continue
                        touches = any(
                            (r + dr, c + dc) in island
                            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                        )
                        if touches:
                            island.add((r, c))
                            seen[r][c] = True
                            grew = True
            best = max(best, len(island))
    return best`,
      java: `public int maxAreaOfIsland(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    boolean[][] seen = new boolean[rows][cols];
    int best = 0;
    for (int r0 = 0; r0 < rows; r0++) {
        for (int c0 = 0; c0 < cols; c0++) {
            if (grid[r0][c0] != 1 || seen[r0][c0]) continue;
            boolean[][] island = new boolean[rows][cols];
            island[r0][c0] = true;
            seen[r0][c0] = true;
            int size = 1;
            boolean grew = true;
            while (grew) {
                grew = false;
                for (int r = 0; r < rows; r++) {
                    for (int c = 0; c < cols; c++) {
                        if (grid[r][c] != 1 || island[r][c]) continue;
                        boolean touches =
                            (r > 0 && island[r - 1][c])
                            || (r + 1 < rows && island[r + 1][c])
                            || (c > 0 && island[r][c - 1])
                            || (c + 1 < cols && island[r][c + 1]);
                        if (touches) {
                            island[r][c] = true;
                            seen[r][c] = true;
                            size++;
                            grew = true;
                        }
                    }
                }
            }
            best = Math.max(best, size);
        }
    }
    return best;
}`,
      cpp: `int maxAreaOfIsland(vector<vector<int>> grid) {
    int rows = (int)grid.size(), cols = (int)grid[0].size();
    vector<vector<char>> seen(rows, vector<char>(cols, 0));
    int best = 0;
    for (int r0 = 0; r0 < rows; r0++) {
        for (int c0 = 0; c0 < cols; c0++) {
            if (grid[r0][c0] != 1 || seen[r0][c0]) continue;
            vector<vector<char>> island(rows, vector<char>(cols, 0));
            island[r0][c0] = 1;
            seen[r0][c0] = 1;
            int size = 1;
            bool grew = true;
            while (grew) {
                grew = false;
                for (int r = 0; r < rows; r++) {
                    for (int c = 0; c < cols; c++) {
                        if (grid[r][c] != 1 || island[r][c]) continue;
                        bool touches =
                            (r > 0 && island[r - 1][c])
                            || (r + 1 < rows && island[r + 1][c])
                            || (c > 0 && island[r][c - 1])
                            || (c + 1 < cols && island[r][c + 1]);
                        if (touches) {
                            island[r][c] = 1;
                            seen[r][c] = 1;
                            size++;
                            grew = true;
                        }
                    }
                }
            }
            best = max(best, size);
        }
    }
    return best;
}`,
    },
  ],
}
