import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "count-provinces",
  title: "How Many Connected Groups?",
  pattern: "graphs",
  difficulty: "medium",
  leetcode: "number-of-provinces",
  brief: "Count connected components from an adjacency matrix.",
  statement:
    "Given an n × n matrix where cell [i][j] is 1 when city i is directly connected to city j, count the provinces — groups of cities connected directly or indirectly, with no connection to any city outside the group.",
  constraints: [
    "1 <= n <= 200, and the matrix is n × n",
    "matrix[i][j] is 0 or 1, matrix[i][i] is 1, and matrix[i][j] equals matrix[j][i]",
    "connection is TRANSITIVE — a linked to b and b to c puts all three in one province even if a and c are not directly linked",
    "a city connected to nothing else is a province of one",
  ],
  examples: [
    {
      input: "matrix = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]",
      output: "2",
      note: "Cities 0 and 1 together, city 2 alone.",
    },
    {
      input: "matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]",
      output: "3",
      note: "Nothing is connected, so every city is its own province.",
    },
  ],
  hints: [
    "The matrix is a graph written as a table: row i lists which cities i touches.",
    "Every province is one connected component. Start from an unvisited city, reach everything you can, and that whole reach is one province.",
    "Union-find asks the same question the other way round: merge the two ends of every edge, then count the groups that remain.",
  ],
  whyNow:
    "The flood fill answers the question fine, and for a static matrix it is the simpler code. Union-find earns its place when the edges arrive over time — it never needs to re-traverse, because merging is what maintains the answer. Both are here because the choice is about the shape of the input, not about speed.",
  approach:
    "Give every city its own group, then merge the groups at the two ends of every edge. `find` walks to a group's representative and flattens the path as it goes, so later lookups are almost immediate; `union` points one representative at the other. Because merging is transitive by construction, a chain of connections collapses into a single group without anyone having to walk the chain. The answer is the number of cities that are still their own representative at the end.",
  complexity: { time: "O(n² · α(n))", space: "O(n)" },
  python: `def find(parent: list[int], x: int) -> int:
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


def find_circle_num(matrix: list[list[int]]) -> int:
    n = len(matrix)
    parent = list(range(n))
    for i in range(n):
        for j in range(i + 1, n):
            if matrix[i][j] == 1:
                a, b = find(parent, i), find(parent, j)
                if a != b:
                    parent[a] = b
    return sum(1 for i in range(n) if find(parent, i) == i)`,
  java: `public int find(int[] parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

public int findCircleNum(int[][] matrix) {
    int n = matrix.length;
    int[] parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (matrix[i][j] == 1) {
                int a = find(parent, i);
                int b = find(parent, j);
                if (a != b) parent[a] = b;
            }
        }
    }
    int groups = 0;
    for (int i = 0; i < n; i++) {
        if (find(parent, i) == i) groups++;
    }
    return groups;
}`,
  cpp: `int findRoot(vector<int>& parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

int findCircleNum(const vector<vector<int>>& matrix) {
    int n = (int)matrix.size();
    vector<int> parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (matrix[i][j] == 1) {
                int a = findRoot(parent, i);
                int b = findRoot(parent, j);
                if (a != b) parent[a] = b;
            }
        }
    }
    int groups = 0;
    for (int i = 0; i < n; i++) {
        if (findRoot(parent, i) == i) groups++;
    }
    return groups;
}`,
  walkthrough: [
    {
      text: `cities   0  1  2  3
parent   0  1  2  3

edges: 0-1, 1-2`,
      caption:
        "Everyone starts as their own representative — four cities, four groups.",
    },
    {
      text: `edge 0-1

parent   1  1  2  3
groups: {0,1} {2} {3}`,
      caption: "Merge 0 into 1. Three groups remain.",
    },
    {
      text: `edge 1-2

parent   1  2  2  3
groups: {0,1,2} {3}`,
      caption:
        "Merge 1 into 2. Note city 0 was never touched — but it now reaches 2 THROUGH 1. Transitivity for free.",
    },
    {
      text: `find(0):  0 → 1 → 2
          parent[0] = 2   (path flattened)

parent   2  2  2  3`,
      caption:
        "The first lookup of 0 walks the chain and rewrites it, so the next lookup is one step.",
    },
    {
      text: `representatives:
  find(0)=2  find(1)=2  find(2)=2  find(3)=3

self-representing: 2, 3  →  2 provinces`,
      caption:
        "Count the cities that are still their own representative. That count is the number of groups.",
    },
    {
      text: `a chain a—b—c—d collapses to one
group without anyone walking it`,
      caption:
        "That is the difference from a flood fill: merging maintains the answer as edges arrive, instead of re-traversing to discover it.",
    },
  ],
  alternatives: [
    {
      name: "Flood fill from each city",
      summary:
        "Walk the cities; when one has not been visited, run a depth-first search marking everything it can reach, and add one to the count for each fill started.",
      complexity: { time: "O(n²)", space: "O(n)" },
      python: `def sink(matrix: list[list[int]], seen: list[bool], i: int) -> None:
    seen[i] = True
    for j in range(len(matrix)):
        if matrix[i][j] == 1 and not seen[j]:
            sink(matrix, seen, j)


def find_circle_num(matrix: list[list[int]]) -> int:
    n = len(matrix)
    seen = [False] * n
    groups = 0
    for i in range(n):
        if not seen[i]:
            sink(matrix, seen, i)
            groups += 1
    return groups`,
      java: `public void sink(int[][] matrix, boolean[] seen, int i) {
    seen[i] = true;
    for (int j = 0; j < matrix.length; j++) {
        if (matrix[i][j] == 1 && !seen[j]) sink(matrix, seen, j);
    }
}

public int findCircleNum(int[][] matrix) {
    int n = matrix.length;
    boolean[] seen = new boolean[n];
    int groups = 0;
    for (int i = 0; i < n; i++) {
        if (!seen[i]) {
            sink(matrix, seen, i);
            groups++;
        }
    }
    return groups;
}`,
      cpp: `void sink(const vector<vector<int>>& matrix, vector<char>& seen, int i) {
    seen[i] = 1;
    for (int j = 0; j < (int)matrix.size(); j++) {
        if (matrix[i][j] == 1 && !seen[j]) sink(matrix, seen, j);
    }
}

int findCircleNum(const vector<vector<int>>& matrix) {
    int n = (int)matrix.size();
    vector<char> seen(n, 0);
    int groups = 0;
    for (int i = 0; i < n; i++) {
        if (!seen[i]) {
            sink(matrix, seen, i);
            groups++;
        }
    }
    return groups;
}`,
    },
  ],
}
