import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "rotting-fruit",
  title: "Rotting Spread (Multi-source BFS)",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "rotting-oranges",
  brief: "Minutes for rot to spread to every fresh cell.",
  statement:
    "In a grid, 0 = empty, 1 = fresh, 2 = rotten. Every minute, fresh cells adjacent to a rotten cell rot. Return the minutes until nothing fresh remains, or -1 if some cell can never rot.",
  constraints: [
    "1 <= grid.length, grid[0].length <= 10",
    "each cell is 0 (empty), 1 (fresh) or 2 (rotten)",
    "rot spreads to the four orthogonal neighbours, one step per minute",
    "return -1 if any fresh fruit can never be reached",
  ],
  examples: [
    { input: "grid = [[2,1,1],[1,1,0],[0,1,1]]", output: "4" },
    {
      input: "grid = [[0,2],[1,0]]",
      output: "-1",
      note: "The fresh cell is unreachable.",
    },
  ],
  hints: [
    "Rot spreads from ALL rotten cells simultaneously — one BFS per source is wrong and slow.",
    "Seed the queue with every initially rotten cell at time 0.",
    "BFS level = one minute. Count fresh cells up front to detect the unreachable case.",
  ],
  whyNow:
    "Rescanning the whole grid every minute re-reads cells that will never change again. Seeding a queue with every rotten cell visits each cell once, and the minutes fall out of the level count.",
  arc: "Minutes and BFS levels are the same thing, and seeing that is the problem. The simulation makes it literal but pays for it, rescanning every cell every minute including the ones that will never change again, which is how a long thin corridor of fruit goes quadratic. A queue holds only the cells actually rotting this minute, so each cell is touched once and the elapsed minutes fall out of the level count for free. The step that surprises people is the seeding: every rotten cell goes in before the first level runs, because the spread is simultaneous, and multi-source BFS is just BFS with more than one start — no extra machinery, one extra loop. Mark a fresh cell rotten as it is ENQUEUED, not as it is dequeued, or it joins the queue from two neighbours and the level count stops meaning a minute. The two answers off the happy path deserve rehearsal: no fresh fruit at all is 0, and any fresh cell the queue never reached is −1.",
  approach:
    "Multi-source BFS: enqueue every rotten cell as a starting point and count fresh cells. Process the queue level by level; each level is one minute, rotting fresh neighbours and enqueueing them. When the queue drains, either the fresh count hit zero (answer = minutes elapsed) or some cells were never reached (-1). Seeding multiple sources is what models simultaneous spread.",
  complexity: { time: "O(rows × cols)", space: "O(rows × cols)" },
  python: `from collections import deque

def minutes_to_rot(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    queue: deque[tuple[int, int]] = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes`,
  java: `public int minutesToRot(int[][] grid) {
    int rows = grid.length;
    int cols = grid[0].length;
    ArrayDeque<int[]> queue = new ArrayDeque<>();
    int fresh = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) {
                queue.add(new int[]{r, c});
            } else if (grid[r][c] == 1) {
                fresh++;
            }
        }
    }
    int minutes = 0;
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!queue.isEmpty() && fresh > 0) {
        int level = queue.size();
        for (int i = 0; i < level; i++) {
            int[] cell = queue.pollFirst();
            int r = cell[0];
            int c = cell[1];
            for (int[] d : dirs) {
                int nr = r + d[0];
                int nc = c + d[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.add(new int[]{nr, nc});
                }
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
`,
  cpp: `int minutesToRot(vector<vector<int>>& grid) {
    int rows = (int)grid.size();
    int cols = (int)grid[0].size();
    queue<pair<int,int>> q;
    int fresh = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) {
                q.emplace(r, c);
            } else if (grid[r][c] == 1) {
                fresh++;
            }
        }
    }
    int minutes = 0;
    const vector<pair<int,int>> dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!q.empty() && fresh > 0) {
        int level = (int)q.size();
        for (int i = 0; i < level; i++) {
            auto [r, c] = q.front();
            q.pop();
            for (auto d : dirs) {
                int nr = r + d.first;
                int nc = c + d.second;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    q.emplace(nr, nc);
                }
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
`,
  alternatives: [
    {
      name: "Simulate whole grid",
      summary:
        "Each minute, scan the entire grid and rot every fresh cell adjacent to a rotten one; repeat until a pass changes nothing. Correct and obvious — but each minute costs a full scan, so a long thin snake of cells goes quadratic.",
      complexity: {
        time: "O((rows × cols)²) worst",
        space: "O(rows × cols)",
      },
      python: `def minutes_to_rot(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    minutes = 0
    while True:
        to_rot = [(r, c)
                  for r in range(rows) for c in range(cols)
                  if grid[r][c] == 1 and any(
                      0 <= r + dr < rows and 0 <= c + dc < cols
                      and grid[r + dr][c + dc] == 2
                      for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        if not to_rot:
            break
        for r, c in to_rot:
            grid[r][c] = 2
        minutes += 1
    fresh_left = any(1 in row for row in grid)
    return -1 if fresh_left else minutes`,
      java: `public int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    int minutes = 0;
    while (true) {
        List<int[]> toRot = new ArrayList<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != 1) continue;
                for (int[] d : dirs) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                    if (grid[nr][nc] == 2) { toRot.add(new int[] {r, c}); break; }
                }
            }
        if (toRot.isEmpty()) break;
        for (int[] cell : toRot) grid[cell[0]][cell[1]] = 2;
        minutes++;
    }
    for (int[] row : grid)
        for (int v : row)
            if (v == 1) return -1;
    return minutes;
}`,
      cpp: `int orangesRotting(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    const int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    int minutes = 0;
    while (true) {
        vector<pair<int, int>> toRot;
        for (int r = 0; r < rows; ++r)
            for (int c = 0; c < cols; ++c) {
                if (grid[r][c] != 1) continue;
                for (auto& d : dirs) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                    if (grid[nr][nc] == 2) { toRot.push_back({r, c}); break; }
                }
            }
        if (toRot.empty()) break;
        for (auto& cell : toRot) grid[cell.first][cell.second] = 2;
        ++minutes;
    }
    for (auto& row : grid)
        for (int v : row)
            if (v == 1) return -1;
    return minutes;
}`,
    },
  ],
}
