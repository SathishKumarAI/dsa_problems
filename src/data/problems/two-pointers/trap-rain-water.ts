import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "trap-rain-water",
  title: "Water Held by an Elevation Map",
  pattern: "two-pointers",
  difficulty: "hard",
  leetcode: "trapping-rain-water",
  brief: "Total rain trapped between the bars of a skyline.",
  statement:
    "Given an array where each entry is the height of a bar of width 1, compute how many units of water are trapped between the bars after it rains.",
  constraints: [
    "1 <= height.length <= 2 * 10^4",
    "0 <= height[i] <= 10^5",
    "water can only rest where a taller bar stands on BOTH sides — the two ends never hold any",
    "a strictly increasing or strictly decreasing map traps nothing, whatever its size",
  ],
  examples: [
    {
      input: "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
      output: "6",
      note: "Six unit squares of water sit in the dips.",
    },
    {
      input: "height = [4, 2, 3]",
      output: "1",
      note: "The single dip at index 1 holds min(4, 3) − 2 = 1.",
    },
  ],
  hints: [
    "Stop thinking about pools. Ask what one column holds, then add those up.",
    "Column i holds min(tallest to its left, tallest to its right) − height[i], and never less than zero.",
    "You do not need both maxima exactly — only the smaller one. The pointer standing on the smaller wall already knows its own side is the limit.",
  ],
  whyNow:
    "Precomputing the two maxima arrays is already linear, but it reads the array three times and holds 2n extra numbers. Walking inward from both ends carries the same two maxima in two variables, because the shorter wall is always the one that decides — and the shorter wall is always the one you can safely move.",
  approach:
    "Put i at the left and j at the right, carrying leftMax and rightMax. Whichever side is shorter is the side whose water level is already fixed: nothing outside it can raise the level, because the other side is taller. So process that side — add its trapped water and step inward — and repeat. Each bar is visited once and the two maxima are only ever updated, never recomputed.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def trap(height: list[int]) -> int:
    i, j = 0, len(height) - 1
    left_max = right_max = 0
    total = 0
    while i < j:
        if height[i] < height[j]:
            left_max = max(left_max, height[i])
            total += left_max - height[i]
            i += 1
        else:
            right_max = max(right_max, height[j])
            total += right_max - height[j]
            j -= 1
    return total`,
  java: `public int trap(int[] height) {
    int i = 0, j = height.length - 1;
    int leftMax = 0, rightMax = 0, total = 0;
    while (i < j) {
        if (height[i] < height[j]) {
            leftMax = Math.max(leftMax, height[i]);
            total += leftMax - height[i];
            i++;
        } else {
            rightMax = Math.max(rightMax, height[j]);
            total += rightMax - height[j];
            j--;
        }
    }
    return total;
}`,
  cpp: `int trap(const vector<int>& height) {
    int i = 0, j = (int)height.size() - 1;
    int leftMax = 0, rightMax = 0, total = 0;
    while (i < j) {
        if (height[i] < height[j]) {
            leftMax = max(leftMax, height[i]);
            total += leftMax - height[i];
            i++;
        } else {
            rightMax = max(rightMax, height[j]);
            total += rightMax - height[j];
            j--;
        }
    }
    return total;
}`,
  walkthrough: [
    {
      cells: { values: [4, 2, 0, 3, 2, 5] },
      caption:
        "Each column holds min(tallest left, tallest right) − its own height. Two pointers will find those maxima as they go.",
    },
    {
      cells: {
        values: [4, 2, 0, 3, 2, 5],
        marks: { 0: "focus", 5: "focus" },
        labels: { 0: "i", 5: "j" },
      },
      caption:
        "height[i] = 4 < height[j] = 5, so the LEFT side is the shorter wall and its level is settled. leftMax becomes 4, and column 0 holds nothing.",
    },
    {
      cells: {
        values: [4, 2, 0, 3, 2, 5],
        marks: { 0: "done", 1: "focus", 5: "compare" },
        labels: { 1: "i", 5: "j" },
      },
      caption:
        "Column 1 is height 2 under a leftMax of 4 → it holds 2. Total 2.",
    },
    {
      cells: {
        values: [4, 2, 0, 3, 2, 5],
        marks: { 0: "done", 1: "done", 2: "focus", 5: "compare" },
        labels: { 2: "i", 5: "j" },
      },
      caption:
        "Column 2 is height 0 under the same wall of 4 → it holds 4. Total 6.",
    },
    {
      cells: {
        values: [4, 2, 0, 3, 2, 5],
        marks: { 0: "done", 1: "done", 2: "done", 3: "focus", 4: "focus" },
        labels: { 3: "i", 4: "j" },
      },
      caption:
        "Columns 3 and 4 hold 1 and 2 by the same rule. Total 9, and the pointers are about to cross.",
    },
    {
      cells: {
        values: [4, 2, 0, 3, 2, 5],
        marks: { 1: "window", 2: "window", 3: "window", 4: "window" },
      },
      caption:
        "Answer 9. Every column was visited once, and the two end bars — with nothing outside them — held nothing.",
    },
  ],
  alternatives: [
    {
      name: "Brute force per column",
      summary:
        "For each column, scan the whole array left and right to find the tallest bar on each side, then take the smaller of the two minus this column's height.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def trap(height: list[int]) -> int:
    total = 0
    for i in range(len(height)):
        left = max(height[: i + 1])
        right = max(height[i:])
        total += min(left, right) - height[i]
    return total`,
      java: `public int trap(int[] height) {
    int total = 0;
    for (int i = 0; i < height.length; i++) {
        int left = 0, right = 0;
        for (int a = 0; a <= i; a++) left = Math.max(left, height[a]);
        for (int b = i; b < height.length; b++) right = Math.max(right, height[b]);
        total += Math.min(left, right) - height[i];
    }
    return total;
}`,
      cpp: `int trap(const vector<int>& height) {
    int n = (int)height.size();
    int total = 0;
    for (int i = 0; i < n; i++) {
        int left = 0, right = 0;
        for (int a = 0; a <= i; a++) left = max(left, height[a]);
        for (int b = i; b < n; b++) right = max(right, height[b]);
        total += min(left, right) - height[i];
    }
    return total;
}`,
    },
    {
      name: "Prefix and suffix maxima",
      summary:
        "Precompute, for every index, the tallest bar at or before it and the tallest at or after it, then read both off in a third pass.",
      whyNow:
        "The per-column scan recomputes the same two maxima from scratch for every index, so the same prefix is walked n times. Storing each maximum once turns the whole thing linear — at the cost of two extra arrays.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def trap(height: list[int]) -> int:
    n = len(height)
    if n == 0:
        return 0
    left = [0] * n
    right = [0] * n
    left[0] = height[0]
    for i in range(1, n):
        left[i] = max(left[i - 1], height[i])
    right[n - 1] = height[n - 1]
    for i in range(n - 2, -1, -1):
        right[i] = max(right[i + 1], height[i])
    return sum(min(left[i], right[i]) - height[i] for i in range(n))`,
      java: `public int trap(int[] height) {
    int n = height.length;
    if (n == 0) return 0;
    int[] left = new int[n];
    int[] right = new int[n];
    left[0] = height[0];
    for (int i = 1; i < n; i++) left[i] = Math.max(left[i - 1], height[i]);
    right[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) right[i] = Math.max(right[i + 1], height[i]);
    int total = 0;
    for (int i = 0; i < n; i++) total += Math.min(left[i], right[i]) - height[i];
    return total;
}`,
      cpp: `int trap(const vector<int>& height) {
    int n = (int)height.size();
    if (n == 0) return 0;
    vector<int> left(n), right(n);
    left[0] = height[0];
    for (int i = 1; i < n; i++) left[i] = max(left[i - 1], height[i]);
    right[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) right[i] = max(right[i + 1], height[i]);
    int total = 0;
    for (int i = 0; i < n; i++) total += min(left[i], right[i]) - height[i];
    return total;
}`,
    },
  ],
}
