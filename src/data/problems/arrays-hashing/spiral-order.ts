import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "spiral-order",
  title: "Read the Matrix in a Spiral",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "spiral-matrix",
  brief: "Walk a matrix clockwise from the outside in and list the values in that order.",
  statement:
    "Given a matrix, return all of its values in spiral order: left to right along the top, down the right side, right to left along the bottom, up the left side, then inward and around again.",
  constraints: [
    "1 <= rows, columns <= 10, and the matrix need not be square",
    "-100 <= value <= 100",
    "every value appears exactly once in the answer, so its length is rows × columns",
    "a single row or a single column is a legal matrix, and the walk must not double back over it",
    "the innermost layer is where naive versions break: after the top row and the right column, there may be no bottom row or left column left to walk",
  ],
  examples: [
    {
      input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
      output: "[1, 2, 3, 6, 9, 8, 7, 4, 5]",
      note: "One full ring, then the single centre cell.",
    },
    {
      input: "matrix = [[1,2,3,4]]",
      output: "[1, 2, 3, 4]",
      note: "The corner case: one row. After walking it there is no right column, and a version that walks back along 'the bottom row' would emit it twice.",
    },
    {
      input: "matrix = [[1,2],[3,4],[5,6]]",
      output: "[1, 2, 4, 6, 5, 3]",
      note: "Taller than it is wide — the rings are rectangles, not squares.",
    },
  ],
  hints: [
    "The walk is four straight runs repeated, each one shorter than the last.",
    "Track the four edges — top row, bottom row, left column, right column — and close one in after each run.",
    "After the top and right runs, check that the rectangle still has more than one row or column left before walking back, or the last line gets emitted twice.",
  ],
  whyNow:
    "A visited grid works, but it allocates a boolean for every cell to record something the geometry already knows: the spiral's shape is four shrinking edges, not an arbitrary path. Tracking the edges makes the turn condition explicit, drops the extra memory to four integers, and turns 'have I been here?' into 'is this rectangle still non-empty?'.",
  arc:
    "There is no clever algorithm here, and that is the point: the difficulty is entirely in the boundaries, which makes it a good rehearsal for writing loops that are correct at the edges rather than correct on average. The visited grid works by refusing to think about geometry and paying memory for it; the boundary version thinks once and pays four integers. The trap is the final ring. After the top row and the right column have been taken, a rectangle that is one row or one column tall has nothing left to walk back along, and a version without that guard emits those cells twice — which is why single-row and single-column inputs are the first tests to write, not an afterthought. Reach for the same shape in rotate-image and matrix-layer problems generally.",
  approach:
    "Keep four boundaries: top, bottom, left, right. Walk the top row left to right and move top down; walk the right column top to bottom and move right in; then — only if a row is still left — walk the bottom row back, and only if a column is still left, walk the left column up. Repeat while the rectangle is non-empty. The two guards are the whole difficulty: they are what a single row or a single column needs to avoid being read twice.",
  complexity: { time: "O(rows · cols)", space: "O(1)" },
  python: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    out: list[int] = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(matrix[r][right])
        right -= 1
        if top <= bottom:                 # a row is still left to walk back along
            for c in range(right, left - 1, -1):
                out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:                 # and a column to climb
            for r in range(bottom, top - 1, -1):
                out.append(matrix[r][left])
            left += 1
    return out`,
  java: `public List<Integer> spiralOrder(int[][] matrix) {
    List<Integer> out = new ArrayList<>();
    int top = 0, bottom = matrix.length - 1;
    int left = 0, right = matrix[0].length - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.add(matrix[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) out.add(matrix[r][right]);
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) out.add(matrix[bottom][c]);
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) out.add(matrix[r][left]);
            left++;
        }
    }
    return out;
}`,
  cpp: `vector<int> spiralOrder(vector<vector<int>> matrix) {
    vector<int> out;
    int top = 0, bottom = (int)matrix.size() - 1;
    int left = 0, right = (int)matrix[0].size() - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.push_back(matrix[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) out.push_back(matrix[r][right]);
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) out.push_back(matrix[bottom][c]);
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) out.push_back(matrix[r][left]);
            left++;
        }
    }
    return out;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        marks: { 0: "done", 1: "done", 2: "done" },
        labels: { 0: "top" },
      },
      caption:
        "The 3 × 3 matrix read row by row. The first run walks the top row left to right, then the top boundary moves down a row.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        marks: { 0: "done", 1: "done", 2: "done", 5: "done", 8: "done" },
        labels: { 8: "right" },
      },
      caption:
        "Down the right column from the new top to the bottom: 6 then 9. The right boundary moves in a column.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        marks: { 7: "done", 6: "done", 5: "done", 8: "done" },
        labels: { 6: "bottom" },
      },
      caption:
        "A row is still left, so the bottom row is walked back: 8 then 7. Then the left column is climbed — just the 4 — and both boundaries close in.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        marks: { 4: "focus" },
        labels: { 4: "centre" },
      },
      caption:
        "The rectangle is now a single cell. The top run emits 5, the other three runs find nothing left to walk, and the loop ends.",
    },
    {
      cells: {
        values: [1, 2, 3, 4],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
        labels: { 0: "one row" },
      },
      caption:
        "The single-row case: after the top run the top boundary passes the bottom, so the guard stops the bottom run from emitting 4, 3, 2, 1 all over again.",
    },
  ],
  alternatives: [
    {
      name: "A visited grid and four directions",
      summary:
        "Step cell by cell in the current direction, marking each as visited; when the next step would leave the matrix or land on a visited cell, turn right. Stop after every cell is taken.",
      complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
      python: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    seen = [[False] * cols for _ in range(rows)]
    steps = ((0, 1), (1, 0), (0, -1), (-1, 0))    # right, down, left, up
    r = c = heading = 0
    out: list[int] = []
    for _ in range(rows * cols):
        out.append(matrix[r][c])
        seen[r][c] = True
        nr, nc = r + steps[heading][0], c + steps[heading][1]
        if not (0 <= nr < rows and 0 <= nc < cols) or seen[nr][nc]:
            heading = (heading + 1) % 4
            nr, nc = r + steps[heading][0], c + steps[heading][1]
        r, c = nr, nc
    return out`,
      java: `public List<Integer> spiralOrder(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    boolean[][] seen = new boolean[rows][cols];
    int[][] steps = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
    int r = 0, c = 0, heading = 0;
    List<Integer> out = new ArrayList<>();
    for (int i = 0; i < rows * cols; i++) {
        out.add(matrix[r][c]);
        seen[r][c] = true;
        int nr = r + steps[heading][0], nc = c + steps[heading][1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) {
            heading = (heading + 1) % 4;
            nr = r + steps[heading][0];
            nc = c + steps[heading][1];
        }
        r = nr;
        c = nc;
    }
    return out;
}`,
      cpp: `vector<int> spiralOrder(vector<vector<int>> matrix) {
    int rows = (int)matrix.size(), cols = (int)matrix[0].size();
    vector<vector<bool>> seen(rows, vector<bool>(cols, false));
    int steps[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
    int r = 0, c = 0, heading = 0;
    vector<int> out;
    for (int i = 0; i < rows * cols; i++) {
        out.push_back(matrix[r][c]);
        seen[r][c] = true;
        int nr = r + steps[heading][0], nc = c + steps[heading][1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) {
            heading = (heading + 1) % 4;
            nr = r + steps[heading][0];
            nc = c + steps[heading][1];
        }
        r = nr;
        c = nc;
    }
    return out;
}`,
    },
    {
      name: "Peel one ring at a time",
      summary:
        "Treat the matrix as nested rings indexed by layer: for each layer, walk its four sides using the layer number to derive the bounds, with a guard for a ring that is a single row or column.",
      complexity: { time: "O(rows · cols)", space: "O(1)" },
      whyNow:
        "The visited grid spends memory proportional to the matrix on a question the shape already answers — a spiral never revisits anything, so 'have I been here' is only ever standing in for 'has this edge closed in'. Indexing by layer says that directly and drops the grid.",
      python: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    out: list[int] = []
    for layer in range((min(rows, cols) + 1) // 2):
        top, bottom = layer, rows - 1 - layer
        left, right = layer, cols - 1 - layer
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        for r in range(top + 1, bottom + 1):
            out.append(matrix[r][right])
        if top == bottom or left == right:
            continue                    # a one-line ring is already fully read
        for c in range(right - 1, left - 1, -1):
            out.append(matrix[bottom][c])
        for r in range(bottom - 1, top, -1):
            out.append(matrix[r][left])
    return out`,
      java: `public List<Integer> spiralOrder(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    List<Integer> out = new ArrayList<>();
    for (int layer = 0; layer < (Math.min(rows, cols) + 1) / 2; layer++) {
        int top = layer, bottom = rows - 1 - layer;
        int left = layer, right = cols - 1 - layer;
        for (int c = left; c <= right; c++) out.add(matrix[top][c]);
        for (int r = top + 1; r <= bottom; r++) out.add(matrix[r][right]);
        if (top == bottom || left == right) continue;
        for (int c = right - 1; c >= left; c--) out.add(matrix[bottom][c]);
        for (int r = bottom - 1; r > top; r--) out.add(matrix[r][left]);
    }
    return out;
}`,
      cpp: `vector<int> spiralOrder(vector<vector<int>> matrix) {
    int rows = (int)matrix.size(), cols = (int)matrix[0].size();
    vector<int> out;
    for (int layer = 0; layer < (min(rows, cols) + 1) / 2; layer++) {
        int top = layer, bottom = rows - 1 - layer;
        int left = layer, right = cols - 1 - layer;
        for (int c = left; c <= right; c++) out.push_back(matrix[top][c]);
        for (int r = top + 1; r <= bottom; r++) out.push_back(matrix[r][right]);
        if (top == bottom || left == right) continue;
        for (int c = right - 1; c >= left; c--) out.push_back(matrix[bottom][c]);
        for (int r = bottom - 1; r > top; r--) out.push_back(matrix[r][left]);
    }
    return out;
}`,
    },
  ],
}
