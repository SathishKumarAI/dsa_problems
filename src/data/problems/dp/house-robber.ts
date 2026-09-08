import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "house-robber",
  title: "Non-Adjacent Maximum Take",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "house-robber",
  brief: "Max sum picking values with no two adjacent.",
  statement:
    "Given non-negative values in a row, choose a subset with no two adjacent elements so the sum is maximised. Return the sum.",
  constraints: [
    "1 <= nums.length <= 100",
    "0 <= nums[i] <= 400",
    "no two chosen indices may be adjacent",
  ],
  examples: [
    { input: "nums = [2, 7, 9, 3, 1]", output: "12", note: "2 + 9 + 1." },
  ],
  hints: [
    "At each position: take it (plus best up to i-2) or skip it (best up to i-1).",
    "best(i) = max(best(i-1), nums[i] + best(i-2)).",
    "Two rolling variables again — the array version is training wheels.",
  ],
  whyNow:
    "The table keeps n values, but each step reads only the two before it. Two variables are enough, and the space drops to constant.",
  approach:
    "State: best(i), the maximum sum using only the first i+1 elements. Transition: either element i is skipped (carry best(i-1)) or taken (nums[i] + best(i-2), since i-1 is then forbidden). Take the max. Roll two variables left to right; the final value is the answer.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def max_take(nums: list[int]) -> int:
    skip = take = 0  # best excluding / including previous element
    for x in nums:
        skip, take = max(skip, take), skip + x
    return max(skip, take)`,
  java: `public int maxTake(int[] nums) {
    int skip = 0, take = 0;
    for (int x : nums) {
        int newSkip = Math.max(skip, take);
        int newTake = skip + x;
        skip = newSkip;
        take = newTake;
    }
    return Math.max(skip, take);
}`,
  cpp: `int maxTake(const vector<int>& nums) {
    int skip = 0, take = 0;
    for (int x : nums) {
        int newSkip = max(skip, take);
        int newTake = skip + x;
        skip = newSkip;
        take = newTake;
    }
    return max(skip, take);
}`,
  walkthrough: [
    {
      cells: { values: [2, 7, 9, 3, 1] },
      caption: "Pick non-adjacent values, maximise the sum.",
    },
    {
      cells: { values: [2, 7, 9, 3, 1], marks: { 0: "focus" } },
      caption: "i=0: best = 2 (take it; nothing to conflict).",
    },
    {
      cells: { values: [2, 7, 9, 3, 1], marks: { 1: "focus" } },
      caption: "i=1: max(skip → 2, take → 7) = 7.",
    },
    {
      cells: { values: [2, 7, 9, 3, 1], marks: { 0: "done", 2: "focus" } },
      caption: "i=2: max(7, 9 + 2) = 11 — take 9 with the earlier 2.",
    },
    {
      cells: {
        values: [2, 7, 9, 3, 1],
        marks: { 0: "done", 2: "done", 3: "compare" },
      },
      caption: "i=3: max(11, 3 + 7) = 11 — skipping 3 wins.",
    },
    {
      cells: {
        values: [2, 7, 9, 3, 1],
        marks: { 0: "done", 2: "done", 4: "focus" },
      },
      caption: "i=4: max(11, 1 + 11) = 12. Answer: 2 + 9 + 1.",
    },
  ],
  alternatives: [
    {
      name: "Recursion + memo",
      summary:
        "best(i) tried top-down with caching. Same recurrence; the table version just removes the stack.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `from functools import lru_cache

def max_take(nums: list[int]) -> int:
    @lru_cache(maxsize=None)
    def best(i: int) -> int:
        if i < 0:
            return 0
        return max(best(i - 1), nums[i] + best(i - 2))

    return best(len(nums) - 1)`,
      java: `public int maxTake(int[] nums) {
    Integer[] memo = new Integer[nums.length];
    return best(nums, nums.length - 1, memo);
}
private int best(int[] nums, int i, Integer[] memo) {
    if (i < 0) return 0;
    if (memo[i] != null) return memo[i];
    int take = nums[i] + best(nums, i - 2, memo);
    int skip = best(nums, i - 1, memo);
    memo[i] = Math.max(take, skip);
    return memo[i];
}`,
      cpp: `int maxTake(const vector<int>& nums) {
    vector<int> memo(nums.size(), INT_MIN);
    function<int(int)> best = [&](int i) -> int {
        if (i < 0) return 0;
        if (memo[i] != INT_MIN) return memo[i];
        int take = nums[i] + best(i - 2);
        int skip = best(i - 1);
        memo[i] = max(take, skip);
        return memo[i];
    };
    return best((int)nums.size() - 1);
}`,
    },
    {
      name: "Full table",
      whyNow:
        "The memo already computes bottom-up, with a call stack in the way. Filling the array in order removes the recursion and makes the order of computation visible.",
      summary:
        "Explicit dp array before the two-variable compression. Easier to debug and to extend (e.g. recovering WHICH elements were taken).",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def max_take(nums: list[int]) -> int:
    if not nums:
        return 0
    dp = [0] * (len(nums) + 2)
    for i, x in enumerate(nums):
        dp[i + 2] = max(dp[i + 1], x + dp[i])
    return dp[-1]`,
      java: `public int maxTake(int[] nums) {
    if (nums.length == 0) return 0;
    int[] dp = new int[nums.length + 2];
    for (int i = 0; i < nums.length; i++) {
        int x = nums[i];
        dp[i + 2] = Math.max(dp[i + 1], x + dp[i]);
    }
    return dp[dp.length - 1];
}`,
      cpp: `int maxTake(const vector<int>& nums) {
    if (nums.size() == 0) return 0;
    vector<int> dp((int)nums.size() + 2, 0);
    for (int i = 0; i < (int)nums.size(); i++) {
        int x = nums[i];
        dp[i + 2] = max(dp[i + 1], x + dp[i]);
    }
    return dp.back();
}`,
    },
  ],
}
