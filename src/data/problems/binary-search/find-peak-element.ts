import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "find-peak-element",
  title: "Any Local Peak, in Log Time",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "find-peak-element",
  brief: "An index larger than both its neighbours.",
  statement:
    "Given an array where no two adjacent values are equal, return the index of any peak — an element strictly greater than both of its neighbours. Values just outside the array count as negative infinity, so the ends can be peaks.",
  constraints: [
    "1 <= nums.length <= 1000",
    "-2^31 <= nums[i] <= 2^31 - 1, and nums[i] != nums[i + 1] for every i",
    "a peak is ALWAYS guaranteed to exist — the out-of-bounds negative infinity makes it so",
    "any peak is acceptable, so an array with several has several correct answers",
  ],
  examples: [
    {
      input: "nums = [1, 2, 3, 1]",
      output: "2",
      note: "3 is larger than 2 and 1.",
    },
    {
      input: "nums = [1, 2, 1, 3, 5, 6, 4]",
      output: "5",
      note: "Index 1 is also a peak; either is accepted, and this method finds 5.",
    },
  ],
  hints: [
    "The array is not sorted, so it seems like binary search cannot apply. Look at the slope at the midpoint instead of the value.",
    "If the midpoint is rising toward its right neighbour, a peak must exist somewhere to the right.",
    "If it is falling, a peak must exist at the midpoint or to its left. Either way, half the array can go.",
  ],
  whyNow:
    "Scanning for a peak reads the whole array even though the answer is only ever local. The slope at any point tells you which side must contain a peak — a rising slope cannot rise forever, because the boundary is negative infinity — so half the range can be discarded on a single comparison, with no sortedness required.",
  arc:
    "The surprise is that a peak can be found in logarithmic time in an UNSORTED array, and the reason is a slope argument rather than an ordering one: if the middle is lower than its right neighbour, the right half must contain a peak, because the sequence either keeps rising to the boundary or turns somewhere. With the ends treated as negative infinity, a peak always exists, so the search never fails. Carry the general form: binary search needs a monotone PREDICATE, not sorted data, and 'the answer is on the rising side' is such a predicate. It is the same idea that makes peak-finding in a bitonic array and several optimisation searches logarithmic.",
  approach:
    "Compare the midpoint with its right neighbour. If it is smaller, the sequence is rising there, and since it must eventually fall — the edge acts as negative infinity — a peak lies strictly to the right. If it is larger, the sequence is falling, so the midpoint itself or something to its left is a peak. Neither branch can discard every peak, which is what makes the halving safe. When the range narrows to one index, that index is a peak.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def find_peak_element(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
  java: `public int findPeakElement(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
  cpp: `int findPeakElement(const vector<int>& nums) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
  alternatives: [
    {
      name: "Scan for the turn",
      summary:
        "Walk forward and return the first index whose value is larger than the value after it, or the last index if the array never turns down.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def find_peak_element(nums: list[int]) -> int:
    for i in range(len(nums) - 1):
        if nums[i] > nums[i + 1]:
            return i
    return len(nums) - 1`,
      java: `public int findPeakElement(int[] nums) {
    for (int i = 0; i < nums.length - 1; i++) {
        if (nums[i] > nums[i + 1]) return i;
    }
    return nums.length - 1;
}`,
      cpp: `int findPeakElement(const vector<int>& nums) {
    for (int i = 0; i < (int)nums.size() - 1; i++) {
        if (nums[i] > nums[i + 1]) return i;
    }
    return (int)nums.size() - 1;
}`,
    },
  ],
}
