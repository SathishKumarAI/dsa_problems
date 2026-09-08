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
  walkthrough: [
    {
      text: "2 1 1\n1 1 0\n0 1 1\n\nqueue: [(0,0)]   fresh = 6",
      caption: "One rotten source; six fresh cells.",
    },
    {
      text: "minute 1:\n2 2 1\n2 1 0\n0 1 1\n\nfresh = 4",
      caption: "Level 1 of BFS: both neighbours of the source rot.",
    },
    {
      text: "minute 2:\n2 2 2\n2 2 0\n0 1 1\n\nfresh = 2",
      caption: "The frontier advances one ring per minute.",
    },
    {
      text: "minute 3:\n2 2 2\n2 2 0\n0 2 1\n\nminute 4:\n2 2 2\n2 2 0\n0 2 2\n\nfresh = 0 → answer 4",
      caption: "Queue drains with fresh = 0: everything rotted in 4 minutes.",
    },
  ],
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
    },
  ],
}
