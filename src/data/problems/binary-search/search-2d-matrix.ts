import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "search-2d-matrix",
  title: "Search a Fully Sorted Matrix",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "search-a-2d-matrix",
  brief: "One binary search over a grid that is really a sorted list.",
  statement:
    "Given an m × n matrix where each row is sorted ascending and the first value of every row is greater than the last value of the row above it, return true if a target value appears in the matrix.",
  constraints: [
    "1 <= m, n <= 100",
    "-10^4 <= matrix[i][j], target <= 10^4",
    "every row is sorted, AND the rows are sorted relative to each other — the two together are what make the grid one sequence",
    "a target outside the range of the whole matrix must return false, not run off the edge",
  ],
  examples: [
    {
      input:
        "matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 3",
      output: "true",
    },
    {
      input:
        "matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 13",
      output: "false",
      note: "13 falls between rows and appears in neither.",
    },
  ],
  hints: [
    "Read the second guarantee again: the last value of a row is smaller than the first of the next. What does that make the grid, if you flatten it?",
    "Index k of the flattened sequence lives at row k / n, column k % n.",
    "That means one binary search over 0 .. m·n − 1, not one per row.",
  ],
  whyNow:
    "Searching row by row already exploits half the guarantee — that each row is sorted — but it walks past whole rows to find the right one. The second guarantee makes the entire grid a single sorted sequence, so one binary search over m·n positions replaces both loops, and log(m·n) beats m + log n.",
  arc: "The matrix is a lie: if every row starts after the previous row ends, it is one sorted array wearing a rectangle, and index i maps to row i divided by the width and column i modulo the width. Once that is said, the answer is a single binary search over the whole cell count. The two-step rung — find the row, then search it — is the version that survives when the rows are sorted but NOT globally ordered, which is a different LeetCode problem and the reason to keep both in your head. The transferable habit is to look for a re-indexing that turns a two-dimensional structure into a one-dimensional one before inventing anything new.",
  approach:
    "Treat the grid as a flat sorted array of length m·n, and translate each midpoint back to a cell with a divide and a remainder. From there it is ordinary binary search: compare, discard the half that cannot hold the target, repeat. The arithmetic is the whole trick — nothing about the search itself changes because the data is drawn as a rectangle.",
  complexity: { time: "O(log (m · n))", space: "O(1)" },
  python: `def search_matrix(matrix: list[list[int]], target: int) -> bool:
    rows = len(matrix)
    cols = len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = matrix[mid // cols][mid % cols]
        if value == target:
            return True
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
  java: `public boolean searchMatrix(int[][] matrix, int target) {
    int rows = matrix.length;
    int cols = matrix[0].length;
    int lo = 0, hi = rows * cols - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int value = matrix[mid / cols][mid % cols];
        if (value == target) return true;
        if (value < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
  cpp: `bool searchMatrix(const vector<vector<int>>& matrix, int target) {
    int rows = (int)matrix.size();
    int cols = (int)matrix[0].size();
    int lo = 0, hi = rows * cols - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int value = matrix[mid / cols][mid % cols];
        if (value == target) return true;
        if (value < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
  alternatives: [
    {
      name: "Scan every cell",
      summary:
        "Walk the grid row by row comparing each value to the target, ignoring the fact that it is sorted at all.",
      complexity: { time: "O(m · n)", space: "O(1)" },
      python: `def search_matrix(matrix: list[list[int]], target: int) -> bool:
    for row in matrix:
        for value in row:
            if value == target:
                return True
    return False`,
      java: `public boolean searchMatrix(int[][] matrix, int target) {
    for (int[] row : matrix) {
        for (int value : row) {
            if (value == target) return true;
        }
    }
    return false;
}`,
      cpp: `bool searchMatrix(const vector<vector<int>>& matrix, int target) {
    for (const vector<int>& row : matrix) {
        for (int value : row) {
            if (value == target) return true;
        }
    }
    return false;
}`,
    },
    {
      name: "Pick the row, then binary search it",
      summary:
        "Walk down the rows until you find the one whose last value is at least the target, then binary search inside that single row.",
      whyNow:
        "The full scan reads cells it already knows are too small. Choosing the row first cuts the work to one row plus the walk to reach it — but that walk is still linear in the number of rows.",
      complexity: { time: "O(m + log n)", space: "O(1)" },
      python: `def search_matrix(matrix: list[list[int]], target: int) -> bool:
    row = None
    for candidate in matrix:
        if candidate[-1] >= target:
            row = candidate
            break
    if row is None:
        return False
    lo, hi = 0, len(row) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if row[mid] == target:
            return True
        if row[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
      java: `public boolean searchMatrix(int[][] matrix, int target) {
    int[] row = null;
    for (int[] candidate : matrix) {
        if (candidate[candidate.length - 1] >= target) {
            row = candidate;
            break;
        }
    }
    if (row == null) return false;
    int lo = 0, hi = row.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (row[mid] == target) return true;
        if (row[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
      cpp: `bool searchMatrix(const vector<vector<int>>& matrix, int target) {
    int chosen = -1;
    for (int r = 0; r < (int)matrix.size(); r++) {
        if (matrix[r].back() >= target) {
            chosen = r;
            break;
        }
    }
    if (chosen < 0) return false;
    const vector<int>& row = matrix[chosen];
    int lo = 0, hi = (int)row.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (row[mid] == target) return true;
        if (row[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
    },
  ],
}
