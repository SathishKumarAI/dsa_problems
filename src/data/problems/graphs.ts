import type { Problem } from "../types.ts"

export const graphs: Problem[] = [
  {
    id: "island-count",
    title: "Count the Islands",
    pattern: "graphs",
    difficulty: "medium",
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
    walkthrough: [
      {
        text: "1 1 0\n0 1 0\n0 0 1\n\ncount = 0",
        caption: "Scan row by row for unvisited land.",
      },
      {
        text: "▓ 1 0        ▓ = found land at (0,0)\n0 1 0\n0 0 1\n\ncount = 1 — flood fill starts",
        caption: "First land cell → new island. Sink everything connected.",
      },
      {
        text: "0 0 0\n0 0 0\n0 0 1\n\ncount = 1 — three cells sunk",
        caption: "(0,0), (0,1), (1,1) were one island; all sunk to water.",
      },
      {
        text: "0 0 0\n0 0 0\n0 0 ▓\n\ncount = 2 — flood fill sinks it",
        caption: "Scan continues; (2,2) is untouched land → second island.",
      },
      {
        text: "0 0 0\n0 0 0\n0 0 0\n\nanswer: 2",
        caption: "Grid drained. Each cell visited O(1) times.",
      },
    ],
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
      },
      {
        name: "Union-Find",
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
      },
    ],
  },
  {
    id: "course-order",
    title: "Course Ordering (Topological Sort)",
    pattern: "graphs",
    difficulty: "medium",
    brief: "Order tasks so every prerequisite comes first.",
    statement:
      'Given numCourses and prerequisite pairs [a, b] meaning "b before a", return any valid order to take all courses, or [] if impossible (a cycle exists).',
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "every pair is [course, prerequisite] with distinct entries",
      "a cycle means no valid order exists; return an empty list",
    ],
    examples: [
      {
        input: "numCourses = 4, prereqs = [[1,0],[2,0],[3,1],[3,2]]",
        output: "[0, 1, 2, 3]",
        note: "[0, 2, 1, 3] equally valid.",
      },
    ],
    hints: [
      "A course with no unmet prerequisites can be taken right now.",
      "Track in-degree (unmet prereq count) per course; start with all zeros in a queue.",
      "Taking a course decrements its dependents' in-degrees — new zeros join the queue. Fewer than numCourses processed ⇒ cycle.",
    ],
    approach:
      "Kahn's algorithm. Build the adjacency list and in-degree table. Seed a queue with all zero-in-degree courses. Repeatedly take one, append it to the order, and decrement each dependent; any dependent hitting zero becomes available. If the final order is shorter than numCourses, some courses never freed up — a cycle.",
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    python: `from collections import deque

def course_order(num: int, prereqs: list[list[int]]) -> list[int]:
    after: dict[int, list[int]] = {c: [] for c in range(num)}
    indeg = [0] * num
    for a, b in prereqs:
        after[b].append(a)
        indeg[a] += 1
    queue = deque(c for c in range(num) if indeg[c] == 0)
    order: list[int] = []
    while queue:
        c = queue.popleft()
        order.append(c)
        for nxt in after[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == num else []`,
    walkthrough: [
      {
        text: "0 → 1 → 3\n └→ 2 ─┘\n\nin-degree: 0:0  1:1  2:1  3:2",
        caption: "Edges point prerequisite → dependent.",
      },
      {
        text: "queue: [0]   order: []\n\ntake 0 → order [0]\n1 and 2 drop to in-degree 0",
        caption: "Only course 0 starts available.",
      },
      {
        text: "queue: [1, 2]   order: [0]\n\ntake 1 → 3 drops to 1\ntake 2 → 3 drops to 0",
        caption: "Each taken course unlocks its dependents.",
      },
      {
        text: "queue: [3]   order: [0, 1, 2]\n\ntake 3 → order [0, 1, 2, 3]",
        caption: "All 4 processed = no cycle. Valid schedule found.",
      },
    ],
    alternatives: [
      {
        name: "DFS post-order",
        summary:
          'DFS each unvisited course; a node finishes only after everything it unlocks. Reversed finish order is a valid schedule. Cycle detection needs a third color ("in progress") — meeting a gray node means a back edge.',
        complexity: { time: "O(V + E)", space: "O(V + E)" },
        python: `def course_order(num: int, prereqs: list[list[int]]) -> list[int]:
    after: dict[int, list[int]] = {c: [] for c in range(num)}
    for a, b in prereqs:
        after[b].append(a)
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * num
    order: list[int] = []

    def dfs(c: int) -> bool:
        color[c] = GRAY
        for nxt in after[c]:
            if color[nxt] == GRAY:
                return False  # back edge = cycle
            if color[nxt] == WHITE and not dfs(nxt):
                return False
        color[c] = BLACK
        order.append(c)
        return True

    for c in range(num):
        if color[c] == WHITE and not dfs(c):
            return []
    return order[::-1]`,
      },
    ],
  },
  {
    id: "rotting-fruit",
    title: "Rotting Spread (Multi-source BFS)",
    pattern: "graphs",
    difficulty: "medium",
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
  },
]
