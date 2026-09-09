import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "kth-smallest-matrix",
  title: "kth Smallest in a Sorted Matrix",
  pattern: "heaps",
  difficulty: "medium",
  leetcode: "kth-smallest-element-in-a-sorted-matrix",
  brief: "kth smallest when every row and column is sorted.",
  statement:
    "Given an n x n matrix whose rows and columns are each sorted ascending, return the kth smallest value in the whole matrix, counting duplicates separately.",
  constraints: [
    "1 <= n <= 300, and 1 <= k <= n * n",
    "-10^9 <= matrix[i][j] <= 10^9",
    "rows AND columns are each sorted, but the matrix as a whole is NOT one sorted sequence — the last of a row can exceed the first of the next",
    "kth smallest counts duplicates, so it is a position, not a distinct rank",
  ],
  examples: [
    { input: "matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8", output: "13" },
    { input: "matrix = [[-5]], k = 1", output: "-5" },
  ],
  hints: [
    "The smallest unseen value is always at the front of some row — which makes it a heap question.",
    "Seed the heap with the first entry of each row, then pop and push that row's next entry.",
    "After k pops, the value just removed is the answer.",
  ],
  whyNow:
    "Flattening and sorting orders all n² values to read one of them. Only n candidates can ever be the next smallest — the front of each row — so a heap of that size steps through the matrix in order and stops after k pops, touching a fraction of the cells when k is small.",
  approach:
    "Push the first entry of every row into a min-heap, each tagged with its position. Pop the smallest; if its row has another entry, push that. Repeat k times, and the last value popped is the answer. The invariant is that the heap always holds the smallest unvisited entry of every row, so its top is the smallest unvisited entry anywhere. Sortedness within a row is what makes the replacement correct — the next candidate from that row is exactly the one to its right.",
  complexity: { time: "O(k log n)", space: "O(n)" },
  python: `import heapq


def kth_smallest(matrix: list[list[int]], k: int) -> int:
    heap = []
    for r in range(len(matrix)):
        heap.append((matrix[r][0], r, 0))
    heapq.heapify(heap)
    value = 0
    for _ in range(k):
        value, r, c = heapq.heappop(heap)
        if c + 1 < len(matrix[r]):
            heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))
    return value`,
  java: `public int kthSmallest(int[][] matrix, int k) {
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    for (int r = 0; r < matrix.length; r++) heap.add(new int[]{matrix[r][0], r, 0});
    int value = 0;
    for (int i = 0; i < k; i++) {
        int[] top = heap.poll();
        value = top[0];
        int r = top[1], c = top[2];
        if (c + 1 < matrix[r].length) heap.add(new int[]{matrix[r][c + 1], r, c + 1});
    }
    return value;
}`,
  cpp: `int kthSmallest(const vector<vector<int>>& matrix, int k) {
    priority_queue<vector<int>, vector<vector<int>>, greater<vector<int>>> heap;
    for (int r = 0; r < (int)matrix.size(); r++) heap.push({matrix[r][0], r, 0});
    int value = 0;
    for (int i = 0; i < k; i++) {
        vector<int> top = heap.top();
        heap.pop();
        value = top[0];
        int r = top[1], c = top[2];
        if (c + 1 < (int)matrix[r].size()) heap.push({matrix[r][c + 1], r, c + 1});
    }
    return value;
}`,
  walkthrough: [
    {
      text: ` 1   5   9
10  11  13
12  13  15

heap: 1, 10, 12`,
      caption:
        "The heap holds the front of each row — the only cells that can be next.",
    },
    {
      text: `pop 1 → push 5
heap: 5, 10, 12`,
      caption:
        "Row 0 advances by one. Its next candidate is exactly the cell to the right.",
    },
    {
      text: `pop 5 → push 9
heap: 9, 10, 12`,
      caption: "Still only three entries, whatever the size of the matrix.",
    },
    {
      text: `pop 9 → row 0 exhausted
heap: 10, 12`,
      caption: "A finished row simply leaves the heap.",
    },
    {
      text: `... after 8 pops → 13`,
      caption:
        "Never more than n entries held, and only k values ever examined.",
    },
  ],
  alternatives: [
    {
      name: "Flatten and sort",
      summary:
        "Collect every value into one list, sort it, and read the entry at position k − 1.",
      complexity: { time: "O(n^2 log n)", space: "O(n^2)" },
      python: `def kth_smallest(matrix: list[list[int]], k: int) -> int:
    values = []
    for row in matrix:
        for x in row:
            values.append(x)
    values.sort()
    return values[k - 1]`,
      java: `public int kthSmallest(int[][] matrix, int k) {
    List<Integer> values = new ArrayList<>();
    for (int[] row : matrix)
        for (int x : row) values.add(x);
    Collections.sort(values);
    return values.get(k - 1);
}`,
      cpp: `int kthSmallest(const vector<vector<int>>& matrix, int k) {
    vector<int> values;
    for (const auto& row : matrix)
        for (int x : row) values.push_back(x);
    sort(values.begin(), values.end());
    return values[k - 1];
}`,
    },
  ],
}
