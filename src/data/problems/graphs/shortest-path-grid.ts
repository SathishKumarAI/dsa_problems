import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "shortest-path-grid",
  title: "Fewest Cells Across an Open Grid",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "shortest-path-in-binary-matrix",
  brief: "Cross a 0/1 grid corner to corner through open cells, diagonals allowed, in the fewest cells.",
  statement:
    "Given an n × n grid where 0 is open and 1 is blocked, return the length of the shortest path from the top-left cell to the bottom-right cell, counted in CELLS visited, moving to any of the eight neighbours. Return -1 when no such path exists.",
  constraints: [
    "1 <= n <= 100",
    "each cell is 0 (open) or 1 (blocked)",
    "movement is EIGHT-directional, so a diagonal step costs the same as a straight one — that is what makes this a plain shortest-path question rather than a geometry one",
    "the path length counts cells, not steps: a 1 × 1 open grid answers 1, not 0",
    "either corner may itself be blocked, in which case the answer is -1 before any search starts",
  ],
  examples: [
    { input: "grid = [[0,1],[1,0]]", output: "2", note: "Straight down the diagonal." },
    {
      input: "grid = [[0,0,0],[1,1,0],[1,1,0]]",
      output: "4",
      note: "Right, then diagonally down the open right-hand column.",
    },
    {
      input: "grid = [[1,0,0],[1,1,0],[1,1,0]]",
      output: "-1",
      note: "The start itself is blocked. The check has to happen before the search, not inside it.",
    },
  ],
  hints: [
    "Every move costs exactly one cell, so no path is ever 'cheaper per step' than another — the first time you arrive somewhere is the cheapest time.",
    "That is the definition of breadth-first search: expand in rings, and the ring number IS the distance.",
    "Mark a cell as seen when you ENQUEUE it, not when you dequeue it, or the same cell is queued once per neighbour that reaches it.",
  ],
  whyNow:
    "Marking cells as seen only when they come off the queue lets the same cell be enqueued once per neighbour that reaches it — up to eight copies each, so the queue grows to several times the grid and the same cell is expanded more than once. The distance is already decided the moment a cell is first enqueued, so marking there keeps the queue at one entry per cell and makes the memory bound exact.",
  arc:
    "The whole ladder is about paying exactly for what the edges cost. Backtracking pays for every path; Dijkstra pays a logarithm to keep the frontier sorted; breadth-first pays nothing extra, because with unit edges the arrival order IS the distance order. The rule to internalise: use BFS when every step costs the same, Dijkstra when they do not, and be able to say which you are in — that single sentence answers a surprising share of graph interviews. The second rule is about marking. Mark on ENQUEUE, not on dequeue: a cell's distance is fixed the moment it is first reached, so marking later lets each of its eight neighbours queue a copy and the queue swells to several times the grid. Both versions are correct; only one of them is bounded by the grid.",
  approach:
    "Breadth-first from the top-left, if it is open. Keep a queue of cells and a distance for each; pop a cell, and for each of its eight neighbours that is open and unseen, mark it seen, record distance + 1, and enqueue it. Because every edge costs one, the first arrival at the bottom-right is the shortest path, so the search can return the moment that cell is enqueued. If the queue empties first, the corner is unreachable and the answer is -1.",
  complexity: { time: "O(n²)", space: "O(n²)" },
  python: `from collections import deque

def shortest_path(grid: list[list[int]]) -> int:
    n = len(grid)
    if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
        return -1
    seen = [[False] * n for _ in range(n)]
    seen[0][0] = True
    queue = deque([(0, 0, 1)])
    while queue:
        r, c, dist = queue.popleft()
        if r == n - 1 and c == n - 1:
            return dist
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and not seen[nr][nc] and grid[nr][nc] == 0:
                    seen[nr][nc] = True      # marked on ENQUEUE, not on pop
                    queue.append((nr, nc, dist + 1))
    return -1`,
  java: `public int shortestPath(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    boolean[][] seen = new boolean[n][n];
    seen[0][0] = true;
    Queue<int[]> queue = new ArrayDeque<>();
    queue.add(new int[]{0, 0, 1});
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        if (cell[0] == n - 1 && cell[1] == n - 1) return cell[2];
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int nr = cell[0] + dr, nc = cell[1] + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                if (seen[nr][nc] || grid[nr][nc] == 1) continue;
                seen[nr][nc] = true;
                queue.add(new int[]{nr, nc, cell[2] + 1});
            }
        }
    }
    return -1;
}`,
  cpp: `int shortestPath(vector<vector<int>> grid) {
    int n = (int)grid.size();
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    vector<vector<bool>> seen(n, vector<bool>(n, false));
    seen[0][0] = true;
    queue<vector<int>> q;
    q.push({0, 0, 1});
    while (!q.empty()) {
        vector<int> cell = q.front();
        q.pop();
        if (cell[0] == n - 1 && cell[1] == n - 1) return cell[2];
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int nr = cell[0] + dr, nc = cell[1] + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                if (seen[nr][nc] || grid[nr][nc] == 1) continue;
                seen[nr][nc] = true;
                q.push({nr, nc, cell[2] + 1});
            }
        }
    }
    return -1;
}`,
  walkthrough: [
    {
      cells: {
        values: [0, 0, 0, 1, 1, 0, 1, 1, 0],
        marks: { 0: "focus" },
        labels: { 0: "d = 1" },
      },
      caption:
        "The 3 × 3 grid read row by row: 0 is open, 1 is blocked. The start is open, so it enters the queue at distance 1 — the count is cells, not steps.",
    },
    {
      cells: {
        values: [0, 0, 0, 1, 1, 0, 1, 1, 0],
        marks: { 0: "done", 1: "window" },
        labels: { 1: "d = 2" },
      },
      caption:
        "Expanding the start: of its three neighbours only the cell to the right is open (the one below and the diagonal are 1s). It is marked as it is ENQUEUED, so nothing can queue it a second time.",
    },
    {
      cells: {
        values: [0, 0, 0, 1, 1, 0, 1, 1, 0],
        marks: { 0: "done", 1: "done", 2: "window", 5: "window" },
        labels: { 5: "d = 3" },
      },
      caption:
        "From there the top-right cell and the middle-right cell are both reachable — the second one diagonally, which costs exactly the same as a straight move.",
    },
    {
      cells: {
        values: [0, 0, 0, 1, 1, 0, 1, 1, 0],
        marks: { 0: "done", 1: "done", 2: "done", 5: "done", 8: "focus" },
        labels: { 8: "d = 4" },
      },
      caption:
        "The bottom-right corner is enqueued at distance 4 and the search stops there: in a graph where every edge costs one, the first arrival is the shortest path.",
    },
    {
      cells: {
        values: [1, 0, 0, 1, 1, 0, 1, 1, 0],
        marks: { 0: "compare" },
        labels: { 0: "blocked" },
      },
      caption:
        "The corner case: the start is a 1. No ring is ever expanded, and the answer is -1 — which is why the check sits before the queue rather than inside the loop.",
    },
  ],
  alternatives: [
    {
      name: "Try every path",
      summary:
        "Depth-first with backtracking: walk to any open neighbour not already on the current path, remember the length when the corner is reached, and unmark on the way back so other routes may use the cell.",
      complexity: { time: "O(8^(n²))", space: "O(n²)" },
      python: `def shortest_path(grid: list[list[int]]) -> int:
    n = len(grid)
    if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
        return -1
    on_path = [[False] * n for _ in range(n)]
    best = [n * n + 1]

    def walk(r: int, c: int, length: int) -> None:
        if r == n - 1 and c == n - 1:
            best[0] = min(best[0], length)
            return
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0 and not on_path[nr][nc]:
                    on_path[nr][nc] = True
                    walk(nr, nc, length + 1)
                    on_path[nr][nc] = False    # let another route use it

    on_path[0][0] = True
    walk(0, 0, 1)
    return -1 if best[0] > n * n else best[0]`,
      java: `public int shortestPath(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    boolean[][] onPath = new boolean[n][n];
    int[] best = {n * n + 1};
    onPath[0][0] = true;
    walk(grid, 0, 0, 1, onPath, best);
    return best[0] > n * n ? -1 : best[0];
}

private void walk(int[][] grid, int r, int c, int length, boolean[][] onPath, int[] best) {
    int n = grid.length;
    if (r == n - 1 && c == n - 1) {
        best[0] = Math.min(best[0], length);
        return;
    }
    for (int dr = -1; dr <= 1; dr++) {
        for (int dc = -1; dc <= 1; dc++) {
            int nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] == 1 || onPath[nr][nc]) continue;
            onPath[nr][nc] = true;
            walk(grid, nr, nc, length + 1, onPath, best);
            onPath[nr][nc] = false;
        }
    }
}`,
      cpp: `void walkPaths(const vector<vector<int>>& grid, int r, int c, int length,
               vector<vector<bool>>& onPath, int& best) {
    int n = (int)grid.size();
    if (r == n - 1 && c == n - 1) {
        best = min(best, length);
        return;
    }
    for (int dr = -1; dr <= 1; dr++) {
        for (int dc = -1; dc <= 1; dc++) {
            int nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] == 1 || onPath[nr][nc]) continue;
            onPath[nr][nc] = true;
            walkPaths(grid, nr, nc, length + 1, onPath, best);
            onPath[nr][nc] = false;
        }
    }
}

int shortestPath(vector<vector<int>> grid) {
    int n = (int)grid.size();
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    vector<vector<bool>> onPath(n, vector<bool>(n, false));
    int best = n * n + 1;
    onPath[0][0] = true;
    walkPaths(grid, 0, 0, 1, onPath, best);
    return best > n * n ? -1 : best;
}`,
    },
    {
      name: "Dijkstra with a heap",
      summary:
        "Treat it as a weighted graph and always expand the cheapest frontier cell, pulled from a min-heap keyed by distance so far.",
      complexity: { time: "O(n² log n)", space: "O(n²)" },
      whyNow:
        "Backtracking re-walks the same cells through every route that can reach them, which on an open grid is exponential — the same cell is visited once per path rather than once. A shortest-path algorithm visits each cell once by keeping the frontier sorted by distance, and Dijkstra is the general one that does it for any edge cost.",
      python: `import heapq

def shortest_path(grid: list[list[int]]) -> int:
    n = len(grid)
    if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
        return -1
    best = [[n * n + 1] * n for _ in range(n)]
    best[0][0] = 1
    heap = [(1, 0, 0)]
    while heap:
        dist, r, c = heapq.heappop(heap)
        if r == n - 1 and c == n - 1:
            return dist
        if dist > best[r][c]:
            continue
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                    if dist + 1 < best[nr][nc]:
                        best[nr][nc] = dist + 1
                        heapq.heappush(heap, (dist + 1, nr, nc))
    return -1`,
      java: `public int shortestPath(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    int[][] best = new int[n][n];
    for (int[] row : best) Arrays.fill(row, n * n + 1);
    best[0][0] = 1;
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    heap.add(new int[]{1, 0, 0});
    while (!heap.isEmpty()) {
        int[] top = heap.poll();
        int dist = top[0], r = top[1], c = top[2];
        if (r == n - 1 && c == n - 1) return dist;
        if (dist > best[r][c]) continue;
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc] == 1) continue;
                if (dist + 1 < best[nr][nc]) {
                    best[nr][nc] = dist + 1;
                    heap.add(new int[]{dist + 1, nr, nc});
                }
            }
        }
    }
    return -1;
}`,
      cpp: `int shortestPath(vector<vector<int>> grid) {
    int n = (int)grid.size();
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    vector<vector<int>> best(n, vector<int>(n, n * n + 1));
    best[0][0] = 1;
    priority_queue<vector<int>, vector<vector<int>>, greater<vector<int>>> heap;
    heap.push({1, 0, 0});
    while (!heap.empty()) {
        vector<int> top = heap.top();
        heap.pop();
        int dist = top[0], r = top[1], c = top[2];
        if (r == n - 1 && c == n - 1) return dist;
        if (dist > best[r][c]) continue;
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc] == 1) continue;
                if (dist + 1 < best[nr][nc]) {
                    best[nr][nc] = dist + 1;
                    heap.push({dist + 1, nr, nc});
                }
            }
        }
    }
    return -1;
}`,
    },
    {
      name: "Breadth-first, marked on the way out",
      summary:
        "A plain queue with no priorities — every edge costs the same, so arrival order is distance order. This version marks a cell as seen when it is DEQUEUED, which is the version most people write first.",
      complexity: { time: "O(n²)", space: "O(n²)" },
      whyNow:
        "The heap sorts a frontier whose keys are already sorted: with unit edges, cells come off in the order they went on, so the log factor pays for nothing. A plain queue gives the same visiting order for free.",
      python: `from collections import deque

def shortest_path(grid: list[list[int]]) -> int:
    n = len(grid)
    if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
        return -1
    seen = [[False] * n for _ in range(n)]
    queue = deque([(0, 0, 1)])
    while queue:
        r, c, dist = queue.popleft()
        if seen[r][c]:
            continue                  # a duplicate someone else already expanded
        seen[r][c] = True
        if r == n - 1 and c == n - 1:
            return dist
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and not seen[nr][nc] and grid[nr][nc] == 0:
                    queue.append((nr, nc, dist + 1))
    return -1`,
      java: `public int shortestPath(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    boolean[][] seen = new boolean[n][n];
    Queue<int[]> queue = new ArrayDeque<>();
    queue.add(new int[]{0, 0, 1});
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        int r = cell[0], c = cell[1];
        if (seen[r][c]) continue;
        seen[r][c] = true;
        if (r == n - 1 && c == n - 1) return cell[2];
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                if (seen[nr][nc] || grid[nr][nc] == 1) continue;
                queue.add(new int[]{nr, nc, cell[2] + 1});
            }
        }
    }
    return -1;
}`,
      cpp: `int shortestPath(vector<vector<int>> grid) {
    int n = (int)grid.size();
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    vector<vector<bool>> seen(n, vector<bool>(n, false));
    queue<vector<int>> q;
    q.push({0, 0, 1});
    while (!q.empty()) {
        vector<int> cell = q.front();
        q.pop();
        int r = cell[0], c = cell[1];
        if (seen[r][c]) continue;
        seen[r][c] = true;
        if (r == n - 1 && c == n - 1) return cell[2];
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                if (seen[nr][nc] || grid[nr][nc] == 1) continue;
                q.push({nr, nc, cell[2] + 1});
            }
        }
    }
    return -1;
}`,
    },
  ],
}
