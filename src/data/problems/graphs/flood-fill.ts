import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "flood-fill",
  title: "Repaint the Patch You Clicked",
  pattern: "graphs",
  difficulty: "easy",
  leetcode: "flood-fill",
  brief: "Recolour the connected region of equal colours around a starting pixel.",
  statement:
    "Given a grid of colours, a starting row and column, and a new colour, repaint the starting pixel and every pixel connected to it through up/down/left/right neighbours of the SAME original colour. Return the grid.",
  constraints: [
    "1 <= rows, columns <= 50",
    "0 <= colour value < 2^16, and the new colour may be any of them",
    "connectivity is four-directional — diagonals are not neighbours",
    "only pixels holding the START pixel's original colour spread the fill; a same-coloured region touching it diagonally is a different region",
    "the new colour may EQUAL the original colour, in which case the grid comes back unchanged — and a solution that repaints without checking loops forever",
  ],
  examples: [
    {
      input: "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, colour = 2",
      output: "[[2,2,2],[2,2,0],[2,0,1]]",
      note: "The bottom-right 1 is not repainted: it only touches the region diagonally.",
    },
    {
      input: "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, colour = 0",
      output: "[[0,0,0],[0,0,0]]",
      note: "The corner case. Nothing changes — but a fill that does not notice will revisit the same pixels forever.",
    },
  ],
  hints: [
    "The region is a connected component in a graph whose nodes are pixels and whose edges join equal-coloured neighbours.",
    "Repainting a pixel is what marks it visited: once it holds the new colour it no longer matches the original, so it cannot be entered again.",
    "That trick fails in exactly one case — when the new colour is the original. Handle it before you start.",
  ],
  whyNow:
    "Recursion is the same walk, but its depth is the size of the region: a 50 × 50 image of one colour is 2500 nested calls, past Python's default limit and deep enough to be a real stack frame cost elsewhere. Moving the frontier into an explicit stack keeps the traversal identical and makes the memory a list you can see and bound.",
  arc:
    "This is the smallest honest graph problem: the grid is the graph, four neighbours are the edges, and a region is a connected component. Every rung differs only in where the frontier lives — searched for by sweeping the grid, held in a queue, held in the call stack, held in an explicit stack — which is exactly the choice you make in every traversal for the rest of the pattern. The other lesson is the visited mark. Repainting a pixel is a beautiful visited mark right up until the new colour equals the old one, and then it marks nothing and the walk never terminates. Any time you encode 'seen' by mutating the data, ask what input makes that mutation invisible. Know the stack or queue version cold and keep the recursion for small grids, where 2500 nested calls is still a real stack.",
  approach:
    "Return immediately when the new colour equals the original — that is the only way the fill can fail to terminate. Otherwise push the start pixel and loop: pop a pixel, repaint it, and push each of its four neighbours that still holds the original colour. Repainting is the visited mark, so no pixel is ever queued twice and the walk is linear in the region's size.",
  complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
  python: `def flood_fill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
    start = image[sr][sc]
    if start == color:
        return image                      # repainting would never terminate
    rows, cols = len(image), len(image[0])
    stack = [(sr, sc)]
    while stack:
        r, c = stack.pop()
        if r < 0 or r >= rows or c < 0 or c >= cols or image[r][c] != start:
            continue
        image[r][c] = color               # the repaint IS the visited mark
        stack.append((r + 1, c))
        stack.append((r - 1, c))
        stack.append((r, c + 1))
        stack.append((r, c - 1))
    return image`,
  java: `public int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int start = image[sr][sc];
    if (start == color) return image;
    int rows = image.length, cols = image[0].length;
    Deque<int[]> stack = new ArrayDeque<>();
    stack.push(new int[]{sr, sc});
    while (!stack.isEmpty()) {
        int[] cell = stack.pop();
        int r = cell[0], c = cell[1];
        if (r < 0 || r >= rows || c < 0 || c >= cols || image[r][c] != start) continue;
        image[r][c] = color;
        stack.push(new int[]{r + 1, c});
        stack.push(new int[]{r - 1, c});
        stack.push(new int[]{r, c + 1});
        stack.push(new int[]{r, c - 1});
    }
    return image;
}`,
  cpp: `vector<vector<int>> floodFill(vector<vector<int>> image, int sr, int sc, int color) {
    int start = image[sr][sc];
    if (start == color) return image;
    int rows = (int)image.size(), cols = (int)image[0].size();
    vector<pair<int, int>> stack;
    stack.push_back({sr, sc});
    while (!stack.empty()) {
        pair<int, int> cell = stack.back();
        stack.pop_back();
        int r = cell.first, c = cell.second;
        if (r < 0 || r >= rows || c < 0 || c >= cols || image[r][c] != start) continue;
        image[r][c] = color;
        stack.push_back({r + 1, c});
        stack.push_back({r - 1, c});
        stack.push_back({r, c + 1});
        stack.push_back({r, c - 1});
    }
    return image;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 1, 1, 1, 1, 0, 1, 0, 1],
        marks: { 4: "focus" },
        labels: { 4: "start" },
      },
      caption:
        "The 3 × 3 image read row by row. The click lands on row 1, column 1 — a 1 — and the new colour is 2. Original colour: 1.",
    },
    {
      cells: {
        values: [1, 1, 1, 1, 2, 0, 1, 0, 1],
        marks: { 4: "done", 1: "compare", 3: "compare", 7: "compare", 5: "compare" },
      },
      caption:
        "Repaint the start to 2 and offer its four neighbours. Up (1) and left (1) match the original colour; right is a 0 and down is a 0, so both are dropped.",
    },
    {
      cells: {
        values: [2, 2, 2, 2, 2, 0, 1, 0, 1],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
      },
      caption:
        "The frontier spreads through the matching 1s: the whole top row and the left of row 1 become 2. Each repaint removes that pixel from the frontier forever.",
    },
    {
      cells: {
        values: [2, 2, 2, 2, 2, 0, 1, 0, 1],
        marks: { 6: "compare", 8: "compare" },
        labels: { 8: "diagonal" },
      },
      caption:
        "Row 2 still holds two 1s. The left one is blocked by the 0 above it and the bottom-right one touches the region only diagonally — neither is reachable, so both keep their colour.",
    },
    {
      cells: {
        values: [0, 0, 0, 0, 0, 0],
        marks: { 0: "focus" },
        labels: { 0: "new = 0" },
      },
      caption:
        "The corner case: new colour equals the original. Repainting no longer marks anything as visited, so a fill without the early return re-enters its own output forever.",
    },
  ],
  alternatives: [
    {
      name: "Sweep the whole grid until nothing changes",
      summary:
        "Keep a separate 'in the region' grid, mark the start, then pass over every pixel repeatedly, marking any original-coloured pixel that touches a marked one. Stop when a full pass changes nothing, and paint at the end. The only rung that needs no guard for 'new colour equals old': it never uses the image itself as the mark.",
      complexity: { time: "O((rows · cols)²)", space: "O(rows · cols)" },
      python: `def flood_fill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
    start = image[sr][sc]
    rows, cols = len(image), len(image[0])
    inside = [[False] * cols for _ in range(rows)]
    inside[sr][sc] = True
    changed = True
    while changed:
        changed = False
        for r in range(rows):
            for c in range(cols):
                if inside[r][c] or image[r][c] != start:
                    continue
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and inside[nr][nc]:
                        inside[r][c] = True
                        changed = True
                        break
    for r in range(rows):
        for c in range(cols):
            if inside[r][c]:
                image[r][c] = color
    return image`,
      java: `public int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int start = image[sr][sc];
    int rows = image.length, cols = image[0].length;
    boolean[][] inside = new boolean[rows][cols];
    inside[sr][sc] = true;
    int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    boolean changed = true;
    while (changed) {
        changed = false;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (inside[r][c] || image[r][c] != start) continue;
                for (int[] step : steps) {
                    int nr = r + step[0], nc = c + step[1];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                    if (inside[nr][nc]) {
                        inside[r][c] = true;
                        changed = true;
                        break;
                    }
                }
            }
        }
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (inside[r][c]) image[r][c] = color;
    return image;
}`,
      cpp: `vector<vector<int>> floodFill(vector<vector<int>> image, int sr, int sc, int color) {
    int start = image[sr][sc];
    int rows = (int)image.size(), cols = (int)image[0].size();
    vector<vector<bool>> inside(rows, vector<bool>(cols, false));
    inside[sr][sc] = true;
    int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    bool changed = true;
    while (changed) {
        changed = false;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (inside[r][c] || image[r][c] != start) continue;
                for (int k = 0; k < 4; k++) {
                    int nr = r + steps[k][0], nc = c + steps[k][1];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                    if (inside[nr][nc]) {
                        inside[r][c] = true;
                        changed = true;
                        break;
                    }
                }
            }
        }
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (inside[r][c]) image[r][c] = color;
    return image;
}`,
    },
    {
      name: "A queue from the start pixel",
      summary:
        "Breadth-first from the click: repaint the start, then repeatedly dequeue a pixel and enqueue its four same-coloured neighbours. The region grows outward one ring at a time.",
      complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
      whyNow:
        "Sweeping the grid re-reads every pixel — including whole regions that will never be painted — once per ring the fill grows, so a snake-shaped region of 2500 pixels costs 2500 full sweeps. The fill only ever spreads from pixels already painted, so the walk should carry its own frontier instead of searching the grid for one.",
      python: `from collections import deque

def flood_fill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
    start = image[sr][sc]
    if start == color:
        return image
    rows, cols = len(image), len(image[0])
    image[sr][sc] = color
    queue = deque([(sr, sc)])
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and image[nr][nc] == start:
                image[nr][nc] = color
                queue.append((nr, nc))
    return image`,
      java: `public int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int start = image[sr][sc];
    if (start == color) return image;
    int rows = image.length, cols = image[0].length;
    image[sr][sc] = color;
    Queue<int[]> queue = new ArrayDeque<>();
    queue.add(new int[]{sr, sc});
    int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        for (int[] step : steps) {
            int nr = cell[0] + step[0], nc = cell[1] + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (image[nr][nc] != start) continue;
            image[nr][nc] = color;
            queue.add(new int[]{nr, nc});
        }
    }
    return image;
}`,
      cpp: `vector<vector<int>> floodFill(vector<vector<int>> image, int sr, int sc, int color) {
    int start = image[sr][sc];
    if (start == color) return image;
    int rows = (int)image.size(), cols = (int)image[0].size();
    image[sr][sc] = color;
    queue<pair<int, int>> q;
    q.push({sr, sc});
    int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!q.empty()) {
        pair<int, int> cell = q.front();
        q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = cell.first + steps[k][0], nc = cell.second + steps[k][1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (image[nr][nc] != start) continue;
            image[nr][nc] = color;
            q.push({nr, nc});
        }
    }
    return image;
}`,
    },
    {
      name: "Recursive fill",
      summary:
        "The shortest code in the ladder: repaint this pixel, then call yourself on each of the four neighbours, returning immediately from any pixel that is off the grid or not the original colour.",
      complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
      whyNow:
        "The queue is correct and linear, and the only thing left to argue about is how the frontier is stored. Recursion stores it in the call stack, which makes the whole fill four lines and removes the bookkeeping — worth writing once, because it is the version most people reach for and the one whose failure mode is worth seeing.",
      python: `def flood_fill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
    start = image[sr][sc]
    if start == color:
        return image
    rows, cols = len(image), len(image[0])

    def paint(r: int, c: int) -> None:
        if r < 0 or r >= rows or c < 0 or c >= cols or image[r][c] != start:
            return
        image[r][c] = color
        paint(r + 1, c)
        paint(r - 1, c)
        paint(r, c + 1)
        paint(r, c - 1)

    paint(sr, sc)
    return image`,
      java: `public int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int start = image[sr][sc];
    if (start == color) return image;
    paint(image, sr, sc, start, color);
    return image;
}

private void paint(int[][] image, int r, int c, int start, int color) {
    if (r < 0 || r >= image.length || c < 0 || c >= image[0].length) return;
    if (image[r][c] != start) return;
    image[r][c] = color;
    paint(image, r + 1, c, start, color);
    paint(image, r - 1, c, start, color);
    paint(image, r, c + 1, start, color);
    paint(image, r, c - 1, start, color);
}`,
      cpp: `void paintCell(vector<vector<int>>& image, int r, int c, int start, int color) {
    if (r < 0 || r >= (int)image.size() || c < 0 || c >= (int)image[0].size()) return;
    if (image[r][c] != start) return;
    image[r][c] = color;
    paintCell(image, r + 1, c, start, color);
    paintCell(image, r - 1, c, start, color);
    paintCell(image, r, c + 1, start, color);
    paintCell(image, r, c - 1, start, color);
}

vector<vector<int>> floodFill(vector<vector<int>> image, int sr, int sc, int color) {
    int start = image[sr][sc];
    if (start == color) return image;
    paintCell(image, sr, sc, start, color);
    return image;
}`,
    },
  ],
}
