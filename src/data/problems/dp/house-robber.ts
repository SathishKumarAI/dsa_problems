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
  arc:
    "The state is the whole problem, and it is smaller than it looks: standing at element i, the only thing the past can still tell you is the best total using everything before it, so best(i) is either best(i−1) with i skipped or nums[i] plus best(i−2) with i taken. Nothing about WHICH elements were chosen ever matters again, and that collapse from a subset to one number per position is what turns an exponential choice tree into a linear walk. The rest is the usual descent. Memoising asks each position once but leaves a call stack in the way; the explicit table removes the stack and makes the fill order visible, and it is the version to keep when a follow-up asks which elements were taken; and since the recurrence reads only two cells back, two rolling variables finish it in constant space. Know the two-variable version cold and practise naming the state out loud — the circular and tree variants are this recurrence with a different neighbour rule.",
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
