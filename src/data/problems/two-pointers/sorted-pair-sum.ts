import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "sorted-pair-sum",
  title: "Pair Sum in Sorted Array",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "two-sum-ii-input-array-is-sorted",
  brief: "Two values in a sorted array that add to a target — O(1) space.",
  statement:
    "Given an array sorted in non-decreasing order and a target, return the indices of two distinct elements that sum to target, using constant extra space. Assume exactly one answer exists.",
  constraints: [
    "2 <= numbers.length <= 3 * 10^4",
    "-1000 <= numbers[i] <= 1000",
    "numbers is sorted ascending",
    "exactly one solution exists and an element may not be used twice; O(1) extra space is required",
  ],
  examples: [
    {
      input: "nums = [1, 3, 6, 9], target = 12",
      output: "[1, 3]",
      note: "3 + 9 = 12.",
    },
  ],
  hints: [
    "The hash-map trick works but spends O(n) memory. What does sortedness buy you?",
    "Put one pointer at each end. What does the current sum tell you about which pointer must move?",
    "Sum too small → only moving the left pointer right can help. Too big → move the right pointer left.",
  ],
  whyNow:
    "The map spends O(n) memory to remember what the ordering already tells you. Two pointers read the same information off the array itself, in constant space.",
  arc: "The same question as the unsorted version, with one promise added — and the whole point is what that promise buys. A hash map still works and still costs linear memory; sorted order makes the memory unnecessary, because the sum of the two ends tells you which end is wrong. Too small means the small end must grow, too big means the big end must shrink, and each pointer only ever moves one way, so the scan is linear and constant-space. That is the converging-pointer pattern in its purest form. Learn to spot its precondition — a sorted sequence and a monotone response to moving each end — because it is what unlocks three-sum, container with most water, and every k-sum built on top of them.",
  approach:
    "Start i at the front, j at the back. If nums[i] + nums[j] is too small, no pair using nums[i] can work with anything left of j (those are smaller still), so advance i. If too big, retreat j by the mirror argument. Each step permanently discards one element, so the walk terminates in n steps.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1
        else:
            j -= 1
    return []`,
  java: `public int[] sortedPairSum(int[] nums, int target) {
    int i = 0, j = nums.length - 1;
    while (i < j) {
        int s = nums[i] + nums[j];
        if (s == target) return new int[] {i, j};
        if (s < target) i++;
        else j--;
    }
    return new int[0];
}`,
  cpp: `vector<int> sortedPairSum(const vector<int>& nums, int target) {
    int i = 0, j = (int)nums.size() - 1;
    while (i < j) {
        int s = nums[i] + nums[j];
        if (s == target) return {i, j};
        if (s < target) i++;
        else j--;
    }
    return {};
}`,
  alternatives: [
    {
      name: "Brute force",
      summary:
        "Try every pair and stop at the one that hits the target. It ignores the one thing this input gives you for free — the order — and it is the baseline the two-pointer answer is measured against.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      java: `public int[] sortedPairSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++)
        for (int j = i + 1; j < nums.length; j++)
            if (nums[i] + nums[j] == target)
                return new int[] {i, j};
    return new int[0];
}`,
      cpp: `vector<int> sortedPairSum(const vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++)
        for (int j = i + 1; j < (int)nums.size(); j++)
            if (nums[i] + nums[j] == target)
                return {i, j};
    return {};
}`,
    },
    {
      name: "Hash map",
      whyNow:
        "The double loop asks whether a partner exists by trying every candidate. One pass with a map answers it in a single lookup - but this is the answer for an unsorted array, and this array is sorted.",
      summary:
        "The unsorted-array solution still works — but it spends O(n) memory to ignore information the input already gives you for free.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
      java: `public int[] sortedPairSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[] {seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
      cpp: `vector<int> sortedPairSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (seen.count(need)) return {seen[need], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
    },
  ],
}
