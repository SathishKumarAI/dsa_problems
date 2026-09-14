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
  arc: "The array is not sorted, yet binary search still applies, and understanding why is the point: a probe can always tell which HALF is ordered by comparing the middle to an end, and the minimum must lie in the half that is not. Comparing the middle to the RIGHT end is the cleaner formulation because it never needs a special case for a non-rotated array. Rehearse duplicates as the follow-up, since equal values destroy the ability to tell the halves apart and force a linear worst case — knowing that limitation is what separates understanding from memorising. The same reasoning runs the rotated-search problem next door.",
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
  alternatives: [
    {
      name: "Linear scan",
      summary:
        "Take the minimum of the array. Correct, one line, and exactly what the problem forbids you to settle for — it reads every element because it assumes nothing, which is the right instinct on unstructured data and the wrong one here. Naming it is how you find out what structure is left to exploit once the array has been rotated.",
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
        "Scan for the single place where a value is larger than the one after it: the rotation seam, which is also the minimum. Still linear, and it earns its rung by naming the structure the binary search will use — a rotated sorted array has exactly ONE descent, so finding it is a search for a local property rather than a comparison of every element.",
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
