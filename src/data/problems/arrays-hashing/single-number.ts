import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "single-number",
  title: "Single Number",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "single-number",
  brief:
    "Every value appears twice except one — find it in O(n) time and O(1) space.",
  statement:
    "Given a non-empty integer array nums where every element appears exactly twice except for one element that appears once, return that single element. The follow-up asks for linear time and constant extra space.",
  constraints: [
    "1 <= nums.length <= 3 * 10^4",
    "-3 * 10^4 <= nums[i] <= 3 * 10^4",
    "nums.length is always odd",
    "every value appears exactly twice except one, which appears once",
  ],
  examples: [
    { input: "nums = [2, 2, 1]", output: "1" },
    { input: "nums = [4, 1, 2, 1, 2]", output: "4" },
    {
      input: "nums = [1]",
      output: "1",
      note: "n = 1 is the edge every solution must survive.",
    },
  ],
  hints: [
    "A hash map of counts solves it in O(n) time — but the follow-up forbids O(n) space. What operation cancels a value against itself?",
    "x XOR x = 0 and x XOR 0 = x, and XOR is commutative — order never matters.",
    "XOR every element into one accumulator. Pairs annihilate bit by bit; only the loner survives.",
  ],
  approach:
    "Fold the array with XOR. Because x ^ x = 0 and the operation is commutative and associative, every paired value cancels regardless of position, leaving the single value in the accumulator. One pass, one integer of state. The trick leans entirely on the promise that exactly one value is unpaired.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def single_number(nums: list[int]) -> int:
    acc = 0
    for x in nums:
        acc ^= x
    return acc`,
  java: `public int singleNumber(int[] nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}`,
  cpp: `int singleNumber(const vector<int>& nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}`,
  alternatives: [
    {
      name: "Hash map",
      summary:
        "Count every value, then return the one with count 1. Linear time, but the map is O(n) extra space — exactly what the follow-up forbids.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def single_number(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    for x, c in counts.items():
        if c == 1:
            return x
    return -1`,
      java: `public int singleNumber(int[] nums) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int x : nums) counts.merge(x, 1, Integer::sum);
    for (Map.Entry<Integer, Integer> e : counts.entrySet())
        if (e.getValue() == 1) return e.getKey();
    return -1;
}`,
      cpp: `int singleNumber(const vector<int>& nums) {
    unordered_map<int, int> counts;
    for (int x : nums) counts[x]++;
    for (auto& [x, c] : counts)
        if (c == 1) return x;
    return -1;
}`,
    },
    {
      name: "Sort & scan",
      summary:
        "Sort, then twins are adjacent: walk in steps of two until a pair breaks. No map, but the sort costs O(n log n).",
      complexity: { time: "O(n log n)", space: "O(1)" },
      python: `def single_number(nums: list[int]) -> int:
    s = sorted(nums)
    for i in range(0, len(s) - 1, 2):
        if s[i] != s[i + 1]:
            return s[i]
    return s[-1]`,
      java: `public int singleNumber(int[] nums) {
    int[] s = nums.clone();
    Arrays.sort(s);
    for (int i = 0; i + 1 < s.length; i += 2)
        if (s[i] != s[i + 1]) return s[i];
    return s[s.length - 1];
}`,
      cpp: `int singleNumber(vector<int> nums) {
    sort(nums.begin(), nums.end());
    for (int i = 0; i + 1 < (int)nums.size(); i += 2)
        if (nums[i] != nums[i + 1]) return nums[i];
    return nums.back();
}`,
    },
  ],
}
