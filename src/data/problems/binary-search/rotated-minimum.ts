import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "rotated-minimum",
  title: "Minimum in Rotated Sorted Array",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "find-minimum-in-rotated-sorted-array",
  brief: "Find the smallest value after an unknown rotation.",
  statement:
    "A sorted array of distinct values was rotated at an unknown pivot (e.g. [4,5,6,1,2,3]). Return its minimum element in O(log n).",
  constraints: [
    "1 <= nums.length <= 5000",
    "-5000 <= nums[i] <= 5000",
    "every value is distinct",
    "nums is a sorted array rotated between 1 and n times — a rotation of n leaves it sorted",
  ],
  examples: [
    { input: "nums = [4, 5, 6, 1, 2, 3]", output: "1" },
    {
      input: "nums = [1, 2, 3]",
      output: "1",
      note: "Rotation by zero is allowed.",
    },
  ],
  hints: [
    "The array is two sorted runs; the minimum starts the second run.",
    "Compare nums[mid] with nums[hi]: which side of the break are you on?",
    "nums[mid] > nums[hi] → break (and minimum) is right of mid. Otherwise mid could itself be the minimum — keep it in range.",
  ],
  whyNow:
    "Naming the seam is not the same as finding it quickly. Comparing the middle against the right end says which half the seam is in, so the search halves at every step.",
  approach:
    "Binary search on the break point. If nums[mid] > nums[hi], the middle sits in the first (larger) run, so the minimum lies strictly right: lo = mid + 1. Otherwise mid is in the second run — the minimum is mid or left of it: hi = mid. Loop until the range closes; comparing against nums[hi] rather than nums[lo] avoids ambiguity when the rotation is zero.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def rotated_min(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
  java: `public int rotatedMin(int[] nums) {
    int lo = 0;
    int hi = nums.length - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] > nums[hi]) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return nums[lo];
}`,
  cpp: `int rotatedMin(const vector<int>& nums) {
    int lo = 0;
    int hi = (int)nums.size() - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] > nums[hi]) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return nums[lo];
}`,
  walkthrough: [
    {
      cells: { values: [4, 5, 6, 1, 2, 3], labels: { 0: "lo", 5: "hi" } },
      caption: "Two sorted runs: 4,5,6 and 1,2,3. The minimum starts run two.",
    },
    {
      cells: {
        values: [4, 5, 6, 1, 2, 3],
        marks: { 2: "compare", 5: "compare" },
        labels: { 2: "mid", 5: "hi" },
      },
      caption:
        "nums[mid]=6 > nums[hi]=3 — mid is in the first run; minimum is to its right.",
    },
    {
      cells: {
        values: [4, 5, 6, 1, 2, 3],
        marks: { 0: "done", 1: "done", 2: "done" },
        labels: { 3: "lo", 5: "hi" },
      },
      caption: "lo = mid + 1 = 3.",
    },
    {
      cells: {
        values: [4, 5, 6, 1, 2, 3],
        marks: {
          0: "done",
          1: "done",
          2: "done",
          4: "compare",
          5: "compare",
        },
        labels: { 4: "mid", 5: "hi" },
      },
      caption:
        "nums[4]=2 ≤ nums[5]=3 — mid is in the second run; keep it: hi = mid = 4.",
    },
    {
      cells: {
        values: [4, 5, 6, 1, 2, 3],
        marks: {
          0: "done",
          1: "done",
          2: "done",
          3: "compare",
          4: "compare",
        },
        labels: { 3: "mid", 4: "hi" },
      },
      caption: "nums[3]=1 ≤ nums[4]=2 — hi = 3. Now lo = hi.",
    },
    {
      cells: { values: [4, 5, 6, 1, 2, 3], marks: { 3: "focus" } },
      caption: "Range closed at index 3: minimum is 1.",
    },
  ],
  alternatives: [
    {
      name: "Linear scan",
      summary:
        "min() of the array. Correct, O(n), and exactly what the problem forbids you to settle for.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def rotated_min(nums: list[int]) -> int:
    return min(nums)`,
      java: `public int rotatedMin(int[] nums) {
    int min = nums[0];
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] < min) min = nums[i];
    }
    return min;
}`,
      cpp: `int rotatedMin(const vector<int>& nums) {
    int minVal = nums[0];
    for (int i = 1; i < (int)nums.size(); i++) {
        if (nums[i] < minVal) minVal = nums[i];
    }
    return minVal;
}`,
    },
    {
      name: "Find the drop",
      whyNow:
        "min() reads everything and learns nothing about the array. Looking for the one place where the order breaks names the structure - the seam - even though it still walks the whole thing.",
      summary:
        "Scan for the single place where nums[i] > nums[i+1] — the rotation seam. Linear again, but names the structure the binary search exploits.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def rotated_min(nums: list[int]) -> int:
    for i in range(len(nums) - 1):
        if nums[i] > nums[i + 1]:
            return nums[i + 1]
    return nums[0]  # not rotated`,
      java: `public int rotatedMin(int[] nums) {
    for (int i = 0; i < nums.length - 1; i++) {
        if (nums[i] > nums[i + 1]) return nums[i + 1];
    }
    return nums[0];
}`,
      cpp: `int rotatedMin(const vector<int>& nums) {
    for (int i = 0; i < (int)nums.size() - 1; i++) {
        if (nums[i] > nums[i + 1]) return nums[i + 1];
    }
    return nums[0];
}`,
    },
  ],
}
