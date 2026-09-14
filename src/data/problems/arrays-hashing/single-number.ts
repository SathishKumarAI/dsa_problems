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
  arc: "Three rungs, three different ideas about what to remember. A hash map remembers everything and throws almost all of it away. Sorting remembers nothing but pays to impose order the question never asked for. XOR remembers exactly one number, because the operation itself cancels pairs: a ^ a is zero, zero ^ x is x, and order does not matter. That is the lesson worth keeping — when duplicates come in pairs and you need the odd one out, reach for an operation with an inverse rather than for a container. Know why XOR is safe here (commutative, associative, self-inverse) because the follow-ups change the pairing to threes, where XOR alone stops working and bit counting takes over.",
  whyNow:
    "Sorting spends O(n log n) arranging data whose ORDER the answer never uses. The only fact that matters is that pairs cancel, and XOR cancels them in place: one pass, one integer of state, no rearrangement.",
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
        "Count every value, then return the one whose count is 1. Linear and obvious, and it pays O(n) memory to store 'appears twice' for every value in the array — facts the answer never reads. That is exactly the extra space the follow-up question forbids.",
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
      whyNow:
        "The map counts every value in order to find the one whose count is odd: n entries of bookkeeping for a single answer, which is exactly the O(n) space the follow-up forbids. Sorting puts twins next to each other instead, so the pairing becomes visible without storing anything.",
      summary:
        "Sort, so twins land next to each other, then walk in steps of two until a pair fails to match. Memory drops to nothing, but n log n is spent arranging the whole array to expose a fact about pairing — and it rearranges the caller's data to do it.",
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
