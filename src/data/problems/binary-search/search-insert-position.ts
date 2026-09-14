import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "search-insert-position",
  title: "Where Would This Value Go?",
  pattern: "binary-search",
  difficulty: "easy",
  leetcode: "search-insert-position",
  brief: "Index of the target, or where it would be inserted.",
  statement:
    "Given a sorted array of distinct values and a target, return the index of the target if it is present, or the index at which it would be inserted to keep the array sorted.",
  constraints: [
    "1 <= nums.length <= 10^4, sorted ascending, values distinct",
    "-10^4 <= nums[i], target <= 10^4",
    "a target larger than everything belongs at index nums.length — one past the end, which is a valid answer",
    "a target smaller than everything belongs at index 0",
  ],
  examples: [
    { input: "nums = [1, 3, 5, 6], target = 5", output: "2" },
    {
      input: "nums = [1, 3, 5, 6], target = 7",
      output: "4",
      note: "Past the end — the answer is the length.",
    },
  ],
  hints: [
    "This is binary search with the failure case given a meaning instead of returning -1.",
    "Think of it as: find the first index whose value is at least the target.",
    "When the range empties, the low pointer is sitting exactly on that index.",
  ],
  whyNow:
    "Scanning for the first value that is not smaller is correct but reads every element before the answer. The array is sorted, so the boundary between too-small and large-enough can be halved toward instead of walked to — and the loop's exit position IS that boundary, which is why no separate handling is needed for a missing target.",
  arc: "This is lower bound with a friendly name, and that is the takeaway: the answer is the first index whose value is at least the target, which is also the insertion point when the target is absent. Writing it with the converging form — low < high, high = mid, low = mid + 1 — leaves low equal to high at exactly that boundary and needs no post-loop adjustment, which is why it is the form worth memorising. The corner cases are a target smaller than everything, larger than everything, and equal to an existing element; all three are handled by the same loop, and checking them is how you confirm the boundary convention rather than guessing it.",
  approach:
    "Binary search for the first index whose value is at least the target. Narrow on the usual rule: if the midpoint is smaller than the target, everything up to it is too small, so move low past it; otherwise the midpoint might itself be the answer, so keep it and move high below it. When low passes high the range is empty and low sits on the boundary — the index of the target if present, or the slot it would occupy. The past-the-end case needs no special code because low can legitimately finish at the array's length.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def search_insert(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return lo`,
  java: `public int searchInsert(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return lo;
}`,
  cpp: `int searchInsert(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return lo;
}`,
  alternatives: [
    {
      name: "Walk until it fits",
      summary:
        "Scan from the front and return the first index whose value is at least the target, or the length if none is.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def search_insert(nums: list[int], target: int) -> int:
    for i in range(len(nums)):
        if nums[i] >= target:
            return i
    return len(nums)`,
      java: `public int searchInsert(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] >= target) return i;
    }
    return nums.length;
}`,
      cpp: `int searchInsert(const vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] >= target) return i;
    }
    return (int)nums.size();
}`,
    },
  ],
}
