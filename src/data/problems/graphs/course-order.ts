import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "course-order",
  title: "Course Ordering (Topological Sort)",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "course-schedule-ii",
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
  whyNow:
    "Post-order produces a valid schedule, but it reveals a cycle only through a three-colour trick and hands the answer back reversed. Kahn's queue builds the order forwards and detects the cycle by counting what it could not place.",
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
  java: `public int[] courseOrder(int num, int[][] prereqs) {
    List<Integer>[] after = new ArrayList[num];
    for (int i = 0; i < num; i++) after[i] = new ArrayList<>();
    int[] indeg = new int[num];
    for (int[] p : prereqs) {
        int a = p[0], b = p[1];
        after[b].add(a);
        indeg[a]++;
    }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < num; i++) if (indeg[i] == 0) queue.add(i);
    List<Integer> orderList = new ArrayList<>();
    while (!queue.isEmpty()) {
        int c = queue.poll();
        orderList.add(c);
        for (int nxt : after[c]) {
            indeg[nxt]--;
            if (indeg[nxt] == 0) queue.add(nxt);
        }
    }
    if (orderList.size() != num) return new int[0];
    int[] res = new int[num];
    for (int i = 0; i < num; i++) res[i] = orderList.get(i);
    return res;
}
`,
  cpp: `vector<int> courseOrder(int num, const vector<vector<int>>& prereqs) {
    vector<vector<int>> after(num);
    vector<int> indeg(num, 0);
    for (const auto& p : prereqs) {
        int a = p[0], b = p[1];
        after[b].push_back(a);
        indeg[a]++;
    }
    deque<int> queue;
    for (int i = 0; i < num; i++) if (indeg[i] == 0) queue.push_back(i);
    vector<int> order;
    while (!queue.empty()) {
        int c = queue.front(); queue.pop_front();
        order.push_back(c);
        for (int nxt : after[c]) {
            indeg[nxt]--;
            if (indeg[nxt] == 0) queue.push_back(nxt);
        }
    }
    if (order.size() != num) return {};
    return order;
}
`,
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
}
