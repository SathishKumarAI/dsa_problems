import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "island-count",
  title: "Count the Islands",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "number-of-islands",
  brief: "Connected groups of land cells in a grid.",
  statement:
    "Given a grid of '1' (land) and '0' (water), count the islands — groups of land cells connected horizontally or vertically.",
  constraints: [
    "1 <= grid.length, grid[0].length <= 300",
    "each cell is 0 (water) or 1 (land)",
    "only the four orthogonal neighbours connect — diagonals do not",
  ],
  examples: [{ input: "grid = [[1,1,0],[0,1,0],[0,0,1]]", output: "2" }],
  hints: [
    "Every unvisited land cell you encounter starts exactly one new island.",
    "Flood-fill from it (DFS or BFS) and mark everything reachable as visited.",
    "Sinking visited land in place ('1' → '0') doubles as the visited set.",
  ],
  whyNow:
    "Union-Find carries a parent array and a not-quite-constant factor for what is really one pass over a grid. Sinking each island as it is found is the same linear work with nothing to maintain.",
  approach:
    "Scan every cell. On finding land, increment the island count and flood-fill from it, sinking each connected land cell so it is never counted again. Each cell is touched a constant number of times. The grid is an implicit graph: cells are vertices, 4-adjacency is the edge set.",
  complexity: {
    time: "O(rows × cols)",
    space: "O(rows × cols) worst-case stack",
  },
  python: `def count_islands(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])

    def sink(r: int, c: int) -> None:
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == 0:
            return
        grid[r][c] = 0
        sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                count += 1
                sink(r, c)
    return count`,
  java: `public int countIslands(int[][] grid) {
    int rows = grid.length;
    int cols = grid[0].length;
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 1) {
                count++;
                int[][] stack = new int[rows * cols][2];
                int sz = 0;
                stack[sz++] = new int[]{r, c};
                while (sz > 0) {
                    int[] cell = stack[--sz];
                    int cr = cell[0], cc = cell[1];
                    if (grid[cr][cc] == 0) continue;
                    grid[cr][cc] = 0;
                    if (cr + 1 < rows) stack[sz++] = new int[]{cr + 1, cc};
                    if (cr - 1 >= 0) stack[sz++] = new int[]{cr - 1, cc};
                    if (cc + 1 < cols) stack[sz++] = new int[]{cr, cc + 1};
                    if (cc - 1 >= 0) stack[sz++] = new int[]{cr, cc - 1};
                }
            }
        }
    }
    return count;
}`,
  cpp: `int countIslands(const vector<vector<int>>& grid) {
    vector<vector<int>> g = grid;
    int rows = (int)g.size();
    int cols = (int)g[0].size();
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (g[r][c] == 1) {
                count++;
                vector<pair<int,int>> st;
                st.push_back({r, c});
                while (!st.empty()) {
                    auto [cr, cc] = st.back();
                    st.pop_back();
                    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols || g[cr][cc] == 0)
                        continue;
                    g[cr][cc] = 0;
                    st.push_back({cr + 1, cc});
                    st.push_back({cr - 1, cc});
                    st.push_back({cr, cc + 1});
                    st.push_back({cr, cc - 1});
                }
            }
        }
    }
    return count;
}
`,
  alternatives: [
    {
      name: "BFS flood fill",
      summary:
        "Identical counting, queue instead of recursion. Preferable on huge grids where the DFS recursion could blow the stack.",
      complexity: {
        time: "O(rows × cols)",
        space: "O(min(rows, cols)) frontier",
      },
      python: `from collections import deque

def count_islands(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1:
                continue
            count += 1
            grid[r][c] = 0
            queue = deque([(r, c)])
            while queue:
                y, x = queue.popleft()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == 1:
                        grid[ny][nx] = 0
                        queue.append((ny, nx))
    return count`,
      java: `public int countIslands(int[][] grid) {
    int rows = grid.length;
    int cols = grid[0].length;
    int count = 0;
    ArrayDeque<int[]> queue = new ArrayDeque<>();
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != 1) continue;
            count++;
            grid[r][c] = 0;
            queue.add(new int[]{r, c});
            while (!queue.isEmpty()) {
                int[] pos = queue.poll();
                int y = pos[0];
                int x = pos[1];
                for (int[] dir : new int[][]{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}) {
                    int ny = y + dir[0];
                    int nx = x + dir[1];
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] == 1) {
                        grid[ny][nx] = 0;
                        queue.add(new int[]{ny, nx});
                    }
                }
            }
        }
    }
    return count;
}
`,
      cpp: `int countIslands(vector<vector<int>>& grid) {
    int rows = (int)grid.size();
    int cols = (int)grid[0].size();
    int count = 0;
    deque<pair<int,int>> queue;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != 1) continue;
            count++;
            grid[r][c] = 0;
            queue.push_back({r, c});
            while (!queue.empty()) {
                auto [y, x] = queue.front();
                queue.pop_front();
                for (auto [dy, dx] : vector<pair<int,int>>{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}) {
                    int ny = y + dy;
                    int nx = x + dx;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] == 1) {
                        grid[ny][nx] = 0;
                        queue.push_back({ny, nx});
                    }
                }
            }
        }
    }
    return count;
}
`,
    },
    {
      name: "Union-Find",
      whyNow:
        "Flood fill answers this grid, but the moment cells arrive one at a time there is nothing to fill from. Union-Find merges neighbours as they appear and counts roots at the end.",
      summary:
        "Union every land cell with its right/down land neighbours; islands = distinct roots among land cells. Overkill here, essential when the grid mutates (add-land queries).",
      complexity: { time: "O(cells · α)", space: "O(cells)" },
      python: `def count_islands(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    parent = list(range(rows * cols))

    def find(a: int) -> int:
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a: int, b: int) -> None:
        parent[find(a)] = find(b)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1:
                continue
            if r + 1 < rows and grid[r + 1][c] == 1:
                union(r * cols + c, (r + 1) * cols + c)
            if c + 1 < cols and grid[r][c + 1] == 1:
                union(r * cols + c, r * cols + c + 1)
    return len({find(r * cols + c)
                 for r in range(rows) for c in range(cols) if grid[r][c] == 1})`,
      java: `public int countIslands(int[][] grid) {
    int rows = grid.length;
    int cols = grid[0].length;
    int[] parent = new int[rows * cols];
    for (int i = 0; i < parent.length; i++) parent[i] = i;

    IntUnaryOperator find = new IntUnaryOperator() {
        public int applyAsInt(int a) {
            while (parent[a] != a) {
                parent[a] = parent[parent[a]];
                a = parent[a];
            }
            return a;
        }
    };

    BiConsumer<Integer, Integer> union = new BiConsumer<Integer, Integer>() {
        public void accept(Integer a, Integer b) {
            parent[find.applyAsInt(a)] = find.applyAsInt(b);
        }
    };

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != 1) continue;
            if (r + 1 < rows && grid[r + 1][c] == 1) union.accept(r * cols + c, (r + 1) * cols + c);
            if (c + 1 < cols && grid[r][c + 1] == 1) union.accept(r * cols + c, r * cols + c + 1);
        }
    }

    HashSet<Integer> roots = new HashSet<>();
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 1) roots.add(find.applyAsInt(r * cols + c));
        }
    }
    return roots.size();
}
`,
      cpp: `int countIslands(const vector<vector<int>>& grid) {
    int rows = (int)grid.size(), cols = (int)grid[0].size();
    vector<int> parent(rows * cols);
    for (int i = 0; i < (int)parent.size(); i++) parent[i] = i;

    function<int(int)> find = [&](int a) {
        while (parent[a] != a) {
            parent[a] = parent[parent[a]];
            a = parent[a];
        }
        return a;
    };
    auto join = [&](int a, int b) { parent[find(a)] = find(b); };

    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != 1) continue;
            if (r + 1 < rows && grid[r + 1][c] == 1) join(r * cols + c, (r + 1) * cols + c);
            if (c + 1 < cols && grid[r][c + 1] == 1) join(r * cols + c, r * cols + c + 1);
        }

    int islands = 0;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == 1 && find(r * cols + c) == r * cols + c) islands++;
    return islands;
}`,
    },
  ],
}
