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
  arc: "Both rungs compute the same object — an order in which every edge points forwards — and differ only in which end they build from. DFS post-order finishes a course only after everything it unlocks has finished, so the reversed finishing order is a schedule; Kahn's takes courses whose prerequisites are already done, which builds the order forwards and needs no reversal. The real separator is the failure case. A cycle means no order exists, and DFS finds it only with a third colour marking in-progress nodes, where meeting a grey node is the back edge; Kahn's gets it by counting — if fewer than numCourses came off the queue, the ones left over are exactly the ones stuck in the cycle. Know Kahn's cold: in-degree table, a queue of the free, decrement on release, compare the count at the end. It is the machinery behind alien dictionary, build order and any dependency schedule, and the in-degree count is what turns 'is there a cycle' into arithmetic.",
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
      java: `public int[] courseOrder(int num, int[][] prereqs) {
    List<List<Integer>> after = new ArrayList<>();
    for (int i = 0; i < num; i++) after.add(new ArrayList<>());
    for (int[] p : prereqs) {
        int a = p[0], b = p[1];
        after.get(b).add(a);
    }
    final int WHITE = 0, GRAY = 1, BLACK = 2;
    int[] color = new int[num];
    List<Integer> order = new ArrayList<>();
    Function<Integer, Boolean> dfs = new Function<>() {
        @Override public Boolean apply(Integer c) {
            color[c] = GRAY;
            for (int nxt : after.get(c)) {
                if (color[nxt] == GRAY) return false;
                if (color[nxt] == WHITE && !apply(nxt)) return false;
            }
            color[c] = BLACK;
            order.add(c);
            return true;
        }
    };
    for (int c = 0; c < num; c++) {
        if (color[c] == WHITE && !dfs.apply(c)) return new int[0];
    }
    Collections.reverse(order);
    int[] res = new int[order.size()];
    for (int i = 0; i < order.size(); i++) res[i] = order.get(i);
    return res;
}
`,
      cpp: `vector<int> courseOrder(int num, const vector<vector<int>>& prereqs) {
    vector<vector<int>> after(num);
    for (const auto& p : prereqs) {
        int a = p[0], b = p[1];
        after[b].push_back(a);
    }
    const int WHITE = 0, GRAY = 1, BLACK = 2;
    vector<int> color(num, WHITE);
    vector<int> order;
    function<bool(int)> dfs = [&](int c) {
        color[c] = GRAY;
        for (int nxt : after[c]) {
            if (color[nxt] == GRAY) return false;
            if (color[nxt] == WHITE && !dfs(nxt)) return false;
        }
        color[c] = BLACK;
        order.push_back(c);
        return true;
    };
    for (int c = 0; c < num; ++c) {
        if (color[c] == WHITE && !dfs(c)) return {};
    }
    reverse(order.begin(), order.end());
    return order;
}
`,
    },
  ],
}
