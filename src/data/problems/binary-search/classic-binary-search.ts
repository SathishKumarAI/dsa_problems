import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "classic-binary-search",
  title: "Find a Target in Sorted Array",
  pattern: "binary-search",
  difficulty: "easy",
  leetcode: "binary-search",
  brief: "Index of target in a sorted array, or -1.",
  statement:
    "Given a sorted integer array and a target, return the target's index or -1 if absent. Must run in O(log n).",
  constraints: [
    "1 <= nums.length <= 10^4",
    "-10^4 <= nums[i], target <= 10^4",
    "nums is sorted ascending and every value is distinct",
    "return -1 when the target is absent",
  ],
  examples: [
    { input: "nums = [-3, 0, 4, 9, 12], target = 9", output: "3" },
    { input: "nums = [-3, 0, 4, 9, 12], target = 2", output: "-1" },
  ],
  hints: [
    "Compare the target with the middle element — half the array becomes irrelevant.",
    "Keep an inclusive [lo, hi] range; loop while lo <= hi.",
    "Off-by-one bugs live in the update: mid ± 1, never mid itself, or the loop can spin forever.",
  ],
  whyNow:
    "Recursion pays a stack frame per halving and buys nothing. The same loop written iteratively is constant space, and it is the version to write under pressure.",
  arc:
    "The base case of a whole pattern, and worth writing until the boundaries are automatic: while low is at most high, probe the middle, and move the side that cannot contain the answer. Two habits prevent most bugs. Compute the midpoint as low plus half the gap rather than by adding the two ends, so nothing overflows in languages with fixed-width integers. And decide the loop's contract before typing — either 'low <= high' with mid plus or minus one, or 'low < high' converging on a single survivor — then keep it consistent, because mixing the two is how the off-by-one and the infinite loop both appear. Every later rung in this pattern is this loop with a different question at the probe.",
  approach:
    "Maintain an inclusive search range [lo, hi] that must contain the target if it exists. Probe the midpoint: equal means done; smaller means the answer lives strictly right of mid; larger means strictly left. Each probe halves the range, giving the logarithmic bound.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def binary_search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
  java: `public int binarySearch(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  cpp: `int binarySearch(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  alternatives: [
    {
      name: "Linear scan",
      summary:
        "Ignore sortedness, check every element. The baseline the log bound is measured against.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def binary_search(nums: list[int], target: int) -> int:
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1`,
      java: `public int binarySearch(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}
`,
      cpp: `int binarySearch(const vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}
`,
    },
    {
      name: "Recursive",
      whyNow:
        "Checking every element ignores the only thing the input promises: order. Halving the range uses it, and the halving reads most naturally as a recursion.",
      summary:
        "Same halving, expressed recursively. Cleaner to some eyes, costs stack frames; iterative is the production default.",
      complexity: { time: "O(log n)", space: "O(log n) stack" },
      python: `def binary_search(nums: list[int], target: int) -> int:
    def go(lo: int, hi: int) -> int:
        if lo > hi:
            return -1
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            return go(mid + 1, hi)
        return go(lo, mid - 1)

    return go(0, len(nums) - 1)`,
      java: `public int binarySearch(int[] nums, int target) {
    return binarySearch(nums, target, 0, nums.length - 1);
}
private int binarySearch(int[] nums, int target, int lo, int hi) {
    if (lo > hi) return -1;
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) return binarySearch(nums, target, mid + 1, hi);
    return binarySearch(nums, target, lo, mid - 1);
}`,
      cpp: `int binarySearchHelper(const vector<int>& nums, int target, int lo, int hi) {
    if (lo > hi) return -1;
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) return binarySearchHelper(nums, target, mid + 1, hi);
    return binarySearchHelper(nums, target, lo, mid - 1);
}

int binarySearch(const vector<int>& nums, int target) {
    return binarySearchHelper(nums, target, 0, (int)nums.size() - 1);
}`,
    },
  ],
}
