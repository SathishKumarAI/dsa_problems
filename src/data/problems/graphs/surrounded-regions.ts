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
  arc: "Both rungs are linear, and the whole difference is in what the traversal has to carry. Filling each interior region and asking afterwards whether it touched the border means every fill collects its cells and drags a verdict along, then goes back and rewrites them when the verdict says survive. Starting from the border removes the verdict entirely: reachability from the border IS the definition of not being enclosed, so everything the fill reaches is safe, everything it misses is captured, and one sweep at the end decides it with nothing to undo. That inversion — solve for the complement when the complement needs no per-case bookkeeping — is the transferable part. The temporary third mark is what keeps the final sweep to a single pass: safe cells carry it, captured cells do not, and one walk restores the one and flips the other. Pacific-atlantic water flow is this arc run twice, once from each shore.",
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
  java: `public void rescue(int[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
    if (grid[r][c] != 0) return;
    grid[r][c] = 2;
    rescue(grid, r + 1, c);
    rescue(grid, r - 1, c);
    rescue(grid, r, c + 1);
    rescue(grid, r, c - 1);
}

public int[][] solve(int[][] board) {
    int rows = board.length, cols = board[0].length;
    for (int r = 0; r < rows; r++) {
        rescue(board, r, 0);
        rescue(board, r, cols - 1);
    }
    for (int c = 0; c < cols; c++) {
        rescue(board, 0, c);
        rescue(board, rows - 1, c);
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 0) board[r][c] = 1;
            else if (board[r][c] == 2) board[r][c] = 0;
        }
    return board;
}`,
  cpp: `void rescue(vector<vector<int>>& grid, int r, int c) {
    if (r < 0 || r >= (int)grid.size() || c < 0 || c >= (int)grid[0].size()) return;
    if (grid[r][c] != 0) return;
    grid[r][c] = 2;
    rescue(grid, r + 1, c);
    rescue(grid, r - 1, c);
    rescue(grid, r, c + 1);
    rescue(grid, r, c - 1);
}

vector<vector<int>> solve(vector<vector<int>> board) {
    int rows = (int)board.size(), cols = (int)board[0].size();
    for (int r = 0; r < rows; r++) {
        rescue(board, r, 0);
        rescue(board, r, cols - 1);
    }
    for (int c = 0; c < cols; c++) {
        rescue(board, 0, c);
        rescue(board, rows - 1, c);
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 0) board[r][c] = 1;
            else if (board[r][c] == 2) board[r][c] = 0;
        }
    return board;
}`,
  alternatives: [
    {
      name: "Fill each region and check afterwards",
      summary:
        "Flood fill every region of 0s, collect the cells of each one, and note whether any of them sat on the border, then flip the regions that did not. It answers the question in the direction it was asked, and it holds a whole region in memory to decide it. The border-first version asks the same question backwards and needs no cell list at all.",
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
      java: `public boolean collect(int[][] grid, boolean[][] seen, int r, int c, List<int[]> cells) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    if (seen[r][c] || grid[r][c] != 0) return false;
    seen[r][c] = true;
    cells.add(new int[]{r, c});
    boolean touches = r == 0 || c == 0 || r == grid.length - 1 || c == grid[0].length - 1;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] d : dirs)
        if (collect(grid, seen, r + d[0], c + d[1], cells)) touches = true;
    return touches;
}

public int[][] solve(int[][] board) {
    int rows = board.length, cols = board[0].length;
    boolean[][] seen = new boolean[rows][cols];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (board[r][c] == 0 && !seen[r][c]) {
                List<int[]> cells = new ArrayList<>();
                if (!collect(board, seen, r, c, cells))
                    for (int[] cell : cells) board[cell[0]][cell[1]] = 1;
            }
    return board;
}`,
      cpp: `bool collect(vector<vector<int>>& grid, vector<vector<bool>>& seen, int r, int c, vector<pair<int, int>>& cells) {
    if (r < 0 || r >= (int)grid.size() || c < 0 || c >= (int)grid[0].size()) return false;
    if (seen[r][c] || grid[r][c] != 0) return false;
    seen[r][c] = true;
    cells.push_back({r, c});
    bool touches = r == 0 || c == 0 || r == (int)grid.size() - 1 || c == (int)grid[0].size() - 1;
    const int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (auto& d : dirs)
        if (collect(grid, seen, r + d[0], c + d[1], cells)) touches = true;
    return touches;
}

vector<vector<int>> solve(vector<vector<int>> board) {
    int rows = (int)board.size(), cols = (int)board[0].size();
    vector<vector<bool>> seen(rows, vector<bool>(cols, false));
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (board[r][c] == 0 && !seen[r][c]) {
                vector<pair<int, int>> cells;
                if (!collect(board, seen, r, c, cells))
                    for (auto& cell : cells) board[cell.first][cell.second] = 1;
            }
    return board;
}`,
    },
  ],
}
