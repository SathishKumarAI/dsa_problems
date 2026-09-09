import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "majority-element",
  title: "The Value That Owns the Majority",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "majority-element",
  brief: "The value appearing more than n/2 times.",
  statement:
    "Given an array where one value appears more than n/2 times, return that value. The majority element is guaranteed to exist.",
  constraints: [
    "1 <= nums.length <= 5 * 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "the majority element is guaranteed to exist, which is what makes a single-counter approach safe",
    "more than n/2 means strictly more than half — a value appearing exactly n/2 times is not a majority",
  ],
  examples: [
    { input: "nums = [3, 2, 3]", output: "3" },
    {
      input: "nums = [2, 2, 1, 1, 1, 2, 2]",
      output: "2",
      note: "Four 2s in seven elements.",
    },
  ],
  hints: [
    "A hash map of counts works and is easy. What does it store that the question never asks about?",
    "Pair off each occurrence of the candidate with one occurrence of something else. A true majority survives every pairing.",
    "So carry one candidate and one count: same value raises it, different value lowers it, zero means adopt the newcomer.",
  ],
  whyNow:
    "Counting every value spends O(n) memory to answer a question about a single one. Because a majority outnumbers everything else combined, cancelling one occurrence against one of anything else leaves it standing — so a candidate and a counter are enough, in constant space.",
  approach:
    "Walk once holding a candidate and a count. When the count is zero, adopt the current value as the candidate. Then raise the count if the value matches the candidate and lower it otherwise. Every decrement pairs off one majority occurrence against one non-majority occurrence, and since the majority has more than half the elements it cannot be exhausted — whatever is left standing at the end is it. The guarantee that a majority exists is load-bearing: without it, the survivor would need a verification pass.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def majority_element(nums: list[int]) -> int:
    candidate = nums[0]
    count = 0
    for x in nums:
        if count == 0:
            candidate = x
        count += 1 if x == candidate else -1
    return candidate`,
  java: `public int majorityElement(int[] nums) {
    int candidate = nums[0];
    int count = 0;
    for (int x : nums) {
        if (count == 0) candidate = x;
        count += x == candidate ? 1 : -1;
    }
    return candidate;
}`,
  cpp: `int majorityElement(const vector<int>& nums) {
    int candidate = nums[0];
    int count = 0;
    for (int x : nums) {
        if (count == 0) candidate = x;
        count += x == candidate ? 1 : -1;
    }
    return candidate;
}`,
  alternatives: [
    {
      name: "Count everything",
      summary:
        "Tally how many times each value occurs, then return whichever tally is largest.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def majority_element(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    best = nums[0]
    for value, seen in counts.items():
        if seen > counts[best]:
            best = value
    return best`,
      java: `public int majorityElement(int[] nums) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int x : nums) counts.merge(x, 1, Integer::sum);
    int best = nums[0];
    for (Map.Entry<Integer, Integer> e : counts.entrySet()) {
        if (e.getValue() > counts.get(best)) best = e.getKey();
    }
    return best;
}`,
      cpp: `int majorityElement(const vector<int>& nums) {
    unordered_map<int, int> counts;
    for (int x : nums) counts[x]++;
    int best = nums[0];
    for (const auto& kv : counts) {
        if (kv.second > counts.at(best)) best = kv.first;
    }
    return best;
}`,
    },
  ],
}
