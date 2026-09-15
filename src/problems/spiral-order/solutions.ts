// spiral-order — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Keep four boundaries: top, bottom, left, right. Walk the top row left to right and move top down; walk the right column top to bottom and move right in; then — only if a row is still left — walk the bottom row back, and only if a column is still left, walk the left column up. Repeat while the rectangle is non-empty. The two guards are the whole difficulty: they are what a single row or a single column needs to avoid being read twice."

export const whyNow = "A visited grid works, but it allocates a boolean for every cell to record something the geometry already knows: the spiral's shape is four shrinking edges, not an arbitrary path. Tracking the edges makes the turn condition explicit, drops the extra memory to four integers, and turns 'have I been here?' into 'is this rectangle still non-empty?'."

export const arc = "There is no clever algorithm here, and that is the point: the difficulty is entirely in the boundaries, which makes it a good rehearsal for writing loops that are correct at the edges rather than correct on average. The visited grid works by refusing to think about geometry and paying memory for it; the boundary version thinks once and pays four integers. The trap is the final ring. After the top row and the right column have been taken, a rectangle that is one row or one column tall has nothing left to walk back along, and a version without that guard emits those cells twice — which is why single-row and single-column inputs are the first tests to write, not an afterthought. Reach for the same shape in rotate-image and matrix-layer problems generally."

export const complexity = { time: "O(rows · cols)", space: "O(1)" }

export const python = `def spiral_order(matrix: list[list[int]]) -> list[int]:
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
    return out`

export const java = `public List<Integer> spiralOrder(int[][] matrix) {
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
}`

export const cpp = `vector<int> spiralOrder(vector<vector<int>> matrix) {
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
}`

export const alternatives: Solution[] = [
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
]
