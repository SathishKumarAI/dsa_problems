import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "pacific-atlantic",
  title: "Rain That Reaches Both Oceans",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "pacific-atlantic-water-flow",
  brief: "Find every cell whose rain can run off to both the top-left ocean and the bottom-right one.",
  statement:
    "A grid gives the height of each cell. Rain flows from a cell to a four-directional neighbour whose height is less than or equal to it, and off the edge into an ocean: the top and left edges border one ocean, the bottom and right edges border the other. Return the coordinates of every cell whose water can reach both.",
  constraints: [
    "1 <= rows, columns <= 200, so a per-cell search over the whole grid is 1.6 · 10^9 steps in the worst case",
    "0 <= height <= 10^5",
    "water moves to a neighbour of EQUAL height too, so flat plateaus are two-way streets and a search can walk in circles without a visited set",
    "a cell on the top or left edge already touches the first ocean; a cell on the bottom or right edge already touches the second; a corner can touch both",
    "the answer is a set of coordinates — any order is accepted",
  ],
  examples: [
    {
      input:
        "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
      output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
      note: "Seven cells drain both ways; the classic example.",
    },
    {
      input: "heights = [[1]]",
      output: "[[0,0]]",
      note: "A single cell touches every edge, so it reaches both oceans without flowing anywhere.",
    },
    {
      input: "heights = [[2,2],[2,2]]",
      output: "[[0,0],[0,1],[1,0],[1,1]]",
      note: "A flat plateau: equal heights let water move in both directions, so every cell reaches both oceans — and a search without a visited set never stops.",
    },
  ],
  hints: [
    "Start by answering it for ONE cell: can this cell's water reach the top or left edge? That is a search downhill from the cell.",
    "Doing that search from every cell re-walks the same slopes over and over. Notice that the oceans are fixed and only the starting points change.",
    "Turn the flow around. From the ocean's edge, climb to neighbours of equal or greater height: every cell you reach that way is a cell whose water could have come down to that ocean.",
  ],
  whyNow:
    "Even with an early exit, a search per cell repeats the same descents: 40 000 cells each walking a slope of up to 40 000 steps. The oceans never move, so the expensive direction is the wrong one — run the flow BACKWARDS from each ocean's border, uphill, and two linear sweeps mark every cell that drains to each ocean. The answer is the intersection of the two marks.",
  arc:
    "The move that matters is the reversal: asking 'can this cell reach the ocean' makes you run one search per cell, while asking 'which cells can reach THIS ocean' makes you run one search per ocean. Same edges, opposite direction, quadratic work becomes linear. Once flipped, the second idea does the rest: two independent marks and an intersection, which is how most 'reachable from both / all of these' problems are built. Two things to carry: a flow rule with <= in it means equal neighbours are two-way streets, so a visited set is load-bearing rather than an optimisation; and when a search starts from many sources, seed the frontier with all of them at once instead of looping — one multi-source traversal is not more complicated than one single-source traversal.",
  approach:
    "Flip the question. Instead of asking 'can this cell reach the ocean', ask 'which cells can this ocean be reached FROM'. Push every cell on the top and left edges and climb: a neighbour is reachable when its height is greater than or equal to the current cell's, which is exactly the downhill rule read backwards. Do the same from the bottom and right edges into a second mark. Every cell carrying both marks is in the answer. Two traversals, each visiting a cell at most once.",
  complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
  python: `def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    rows, cols = len(heights), len(heights[0])

    def climb(starts: list[tuple[int, int]]) -> list[list[bool]]:
        seen = [[False] * cols for _ in range(rows)]
        stack = list(starts)
        for r, c in starts:
            seen[r][c] = True
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc]:
                    if heights[nr][nc] >= heights[r][c]:   # uphill == flows down here
                        seen[nr][nc] = True
                        stack.append((nr, nc))
        return seen

    pacific = climb([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])
    atlantic = climb(
        [(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)]
    )
    return [
        [r, c]
        for r in range(rows)
        for c in range(cols)
        if pacific[r][c] and atlantic[r][c]
    ]`,
  java: `public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int rows = heights.length, cols = heights[0].length;
    boolean[][] pacific = new boolean[rows][cols];
    boolean[][] atlantic = new boolean[rows][cols];
    Deque<int[]> stack = new ArrayDeque<>();
    for (int c = 0; c < cols; c++) { pacific[0][c] = true; stack.push(new int[]{0, c}); }
    for (int r = 0; r < rows; r++) { pacific[r][0] = true; stack.push(new int[]{r, 0}); }
    climb(heights, pacific, stack);
    for (int c = 0; c < cols; c++) { atlantic[rows - 1][c] = true; stack.push(new int[]{rows - 1, c}); }
    for (int r = 0; r < rows; r++) { atlantic[r][cols - 1] = true; stack.push(new int[]{r, cols - 1}); }
    climb(heights, atlantic, stack);
    List<List<Integer>> out = new ArrayList<>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (pacific[r][c] && atlantic[r][c]) out.add(List.of(r, c));
    return out;
}

private void climb(int[][] heights, boolean[][] seen, Deque<int[]> stack) {
    int rows = heights.length, cols = heights[0].length;
    int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!stack.isEmpty()) {
        int[] cell = stack.pop();
        for (int[] step : steps) {
            int nr = cell[0] + step[0], nc = cell[1] + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
            if (heights[nr][nc] < heights[cell[0]][cell[1]]) continue;
            seen[nr][nc] = true;
            stack.push(new int[]{nr, nc});
        }
    }
}`,
  cpp: `void climbFrom(const vector<vector<int>>& heights, vector<vector<bool>>& seen,
               vector<pair<int, int>>& stack) {
    int rows = (int)heights.size(), cols = (int)heights[0].size();
    int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!stack.empty()) {
        pair<int, int> cell = stack.back();
        stack.pop_back();
        for (int k = 0; k < 4; k++) {
            int nr = cell.first + steps[k][0], nc = cell.second + steps[k][1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
            if (heights[nr][nc] < heights[cell.first][cell.second]) continue;
            seen[nr][nc] = true;
            stack.push_back({nr, nc});
        }
    }
}

vector<vector<int>> pacificAtlantic(vector<vector<int>> heights) {
    int rows = (int)heights.size(), cols = (int)heights[0].size();
    vector<vector<bool>> pacific(rows, vector<bool>(cols, false));
    vector<vector<bool>> atlantic(rows, vector<bool>(cols, false));
    vector<pair<int, int>> stack;
    for (int c = 0; c < cols; c++) { pacific[0][c] = true; stack.push_back({0, c}); }
    for (int r = 0; r < rows; r++) { pacific[r][0] = true; stack.push_back({r, 0}); }
    climbFrom(heights, pacific, stack);
    for (int c = 0; c < cols; c++) { atlantic[rows - 1][c] = true; stack.push_back({rows - 1, c}); }
    for (int r = 0; r < rows; r++) { atlantic[r][cols - 1] = true; stack.push_back({r, cols - 1}); }
    climbFrom(heights, atlantic, stack);
    vector<vector<int>> out;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (pacific[r][c] && atlantic[r][c]) out.push_back({r, c});
    return out;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 2, 3, 2, 4, 3, 1, 5],
        marks: { 0: "window", 1: "window", 2: "window", 3: "window", 6: "window" },
        labels: { 0: "ocean A" },
      },
      caption:
        "A 3 × 3 grid of heights read row by row. The top row and the left column already touch the first ocean, so the backwards flood starts marked there.",
    },
    {
      cells: {
        values: [1, 2, 2, 3, 2, 4, 3, 1, 5],
        marks: { 3: "done", 5: "focus" },
        labels: { 5: "4 ≥ 2" },
      },
      caption:
        "Climbing from the marked cells: a neighbour joins when it is at least as high, because water there could run DOWN into the marked cell. The 4 is higher than the 2 beside it, so it drains to the first ocean too.",
    },
    {
      cells: {
        values: [1, 2, 2, 3, 2, 4, 3, 1, 5],
        marks: { 2: "compare", 5: "compare", 6: "compare", 7: "compare", 8: "window" },
        labels: { 8: "ocean B" },
      },
      caption:
        "The second flood starts on the bottom row and the right column and climbs the same way, filling a second mark.",
    },
    {
      cells: {
        values: [1, 2, 2, 3, 2, 4, 3, 1, 5],
        marks: { 2: "focus", 5: "focus", 6: "focus" },
        labels: { 5: "both" },
      },
      caption:
        "The answer is the intersection: cells carrying both marks. Neither flood ever visited a cell twice, so the whole thing is two linear sweeps.",
    },
    {
      cells: {
        values: [2, 2, 2, 2],
        marks: { 0: "focus", 1: "focus", 2: "focus", 3: "focus" },
      },
      caption:
        "The plateau corner case: equal heights pass the ≥ test in both directions, so every cell reaches both oceans — and the visited marks are the only thing stopping the walk from cycling forever.",
    },
  ],
  alternatives: [
    {
      name: "A search downhill from every cell",
      summary:
        "For each cell, run a depth-first search that may only step to a neighbour of equal or lower height, and record which edges it managed to touch. Keep the cells that touched both.",
      complexity: { time: "O((rows · cols)²)", space: "O(rows · cols)" },
      python: `def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    rows, cols = len(heights), len(heights[0])
    out: list[list[int]] = []
    for sr in range(rows):
        for sc in range(cols):
            seen = [[False] * cols for _ in range(rows)]
            seen[sr][sc] = True
            stack = [(sr, sc)]
            hit_first = hit_second = False
            while stack:
                r, c = stack.pop()
                if r == 0 or c == 0:
                    hit_first = True
                if r == rows - 1 or c == cols - 1:
                    hit_second = True
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc]:
                        if heights[nr][nc] <= heights[r][c]:
                            seen[nr][nc] = True
                            stack.append((nr, nc))
            if hit_first and hit_second:
                out.append([sr, sc])
    return out`,
      java: `public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int rows = heights.length, cols = heights[0].length;
    int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    List<List<Integer>> out = new ArrayList<>();
    for (int sr = 0; sr < rows; sr++) {
        for (int sc = 0; sc < cols; sc++) {
            boolean[][] seen = new boolean[rows][cols];
            seen[sr][sc] = true;
            Deque<int[]> stack = new ArrayDeque<>();
            stack.push(new int[]{sr, sc});
            boolean first = false, second = false;
            while (!stack.isEmpty()) {
                int[] cell = stack.pop();
                int r = cell[0], c = cell[1];
                if (r == 0 || c == 0) first = true;
                if (r == rows - 1 || c == cols - 1) second = true;
                for (int[] step : steps) {
                    int nr = r + step[0], nc = c + step[1];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
                    if (heights[nr][nc] > heights[r][c]) continue;
                    seen[nr][nc] = true;
                    stack.push(new int[]{nr, nc});
                }
            }
            if (first && second) out.add(List.of(sr, sc));
        }
    }
    return out;
}`,
      cpp: `vector<vector<int>> pacificAtlantic(vector<vector<int>> heights) {
    int rows = (int)heights.size(), cols = (int)heights[0].size();
    int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    vector<vector<int>> out;
    for (int sr = 0; sr < rows; sr++) {
        for (int sc = 0; sc < cols; sc++) {
            vector<vector<bool>> seen(rows, vector<bool>(cols, false));
            seen[sr][sc] = true;
            vector<pair<int, int>> stack{{sr, sc}};
            bool first = false, second = false;
            while (!stack.empty()) {
                pair<int, int> cell = stack.back();
                stack.pop_back();
                int r = cell.first, c = cell.second;
                if (r == 0 || c == 0) first = true;
                if (r == rows - 1 || c == cols - 1) second = true;
                for (int k = 0; k < 4; k++) {
                    int nr = r + steps[k][0], nc = c + steps[k][1];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
                    if (heights[nr][nc] > heights[r][c]) continue;
                    seen[nr][nc] = true;
                    stack.push_back({nr, nc});
                }
            }
            if (first && second) out.push_back({sr, sc});
        }
    }
    return out;
}`,
    },
    {
      name: "The same search, stopped early",
      summary:
        "Identical walk, but it abandons a cell's search the moment both oceans have been touched instead of exploring the rest of the reachable slope.",
      complexity: { time: "O((rows · cols)²)", space: "O(rows · cols)" },
      whyNow:
        "The full search per cell keeps walking long after the answer for that cell is settled — on a grid that drains easily, most cells know their verdict within a few steps. Stopping on the first pair of touches costs one comparison per pop and cuts the common case hard, while leaving the worst case exactly where it was: a grid that drains to one ocean only still walks every slope in full.",
      python: `def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    rows, cols = len(heights), len(heights[0])
    out: list[list[int]] = []
    for sr in range(rows):
        for sc in range(cols):
            seen = [[False] * cols for _ in range(rows)]
            seen[sr][sc] = True
            stack = [(sr, sc)]
            hit_first = hit_second = False
            while stack and not (hit_first and hit_second):
                r, c = stack.pop()
                if r == 0 or c == 0:
                    hit_first = True
                if r == rows - 1 or c == cols - 1:
                    hit_second = True
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc]:
                        if heights[nr][nc] <= heights[r][c]:
                            seen[nr][nc] = True
                            stack.append((nr, nc))
            if hit_first and hit_second:
                out.append([sr, sc])
    return out`,
      java: `public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int rows = heights.length, cols = heights[0].length;
    int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    List<List<Integer>> out = new ArrayList<>();
    for (int sr = 0; sr < rows; sr++) {
        for (int sc = 0; sc < cols; sc++) {
            boolean[][] seen = new boolean[rows][cols];
            seen[sr][sc] = true;
            Deque<int[]> stack = new ArrayDeque<>();
            stack.push(new int[]{sr, sc});
            boolean first = false, second = false;
            while (!stack.isEmpty() && !(first && second)) {
                int[] cell = stack.pop();
                int r = cell[0], c = cell[1];
                if (r == 0 || c == 0) first = true;
                if (r == rows - 1 || c == cols - 1) second = true;
                for (int[] step : steps) {
                    int nr = r + step[0], nc = c + step[1];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
                    if (heights[nr][nc] > heights[r][c]) continue;
                    seen[nr][nc] = true;
                    stack.push(new int[]{nr, nc});
                }
            }
            if (first && second) out.add(List.of(sr, sc));
        }
    }
    return out;
}`,
      cpp: `vector<vector<int>> pacificAtlantic(vector<vector<int>> heights) {
    int rows = (int)heights.size(), cols = (int)heights[0].size();
    int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    vector<vector<int>> out;
    for (int sr = 0; sr < rows; sr++) {
        for (int sc = 0; sc < cols; sc++) {
            vector<vector<bool>> seen(rows, vector<bool>(cols, false));
            seen[sr][sc] = true;
            vector<pair<int, int>> stack{{sr, sc}};
            bool first = false, second = false;
            while (!stack.empty() && !(first && second)) {
                pair<int, int> cell = stack.back();
                stack.pop_back();
                int r = cell.first, c = cell.second;
                if (r == 0 || c == 0) first = true;
                if (r == rows - 1 || c == cols - 1) second = true;
                for (int k = 0; k < 4; k++) {
                    int nr = r + steps[k][0], nc = c + steps[k][1];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
                    if (heights[nr][nc] > heights[r][c]) continue;
                    seen[nr][nc] = true;
                    stack.push_back({nr, nc});
                }
            }
            if (first && second) out.push_back({sr, sc});
        }
    }
    return out;
}`,
    },
  ],
}
