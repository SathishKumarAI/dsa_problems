import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "single-in-sorted",
  title: "The Lone Value Among Pairs",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "single-element-in-a-sorted-array",
  brief: "Every value appears twice except one — find it in log time.",
  statement:
    "Given a sorted array where every value appears exactly twice except one that appears once, return the single value, in logarithmic time and constant space.",
  constraints: [
    "1 <= nums.length <= 10^5, and the length is always ODD",
    "0 <= nums[i] <= 10^5, sorted non-decreasing",
    "exactly one value is unpaired; every other value appears exactly twice, adjacently",
    "logarithmic time rules out the XOR sweep, which is linear",
  ],
  examples: [
    { input: "nums = [1,1,2,3,3,4,4,8,8]", output: "2" },
    { input: "nums = [3,3,7,7,10,11,11]", output: "10" },
  ],
  hints: [
    "Before the lone value, every pair starts at an EVEN index. After it, every pair starts at an odd one.",
    "So the question becomes: where does that pattern break? That boundary is binary-searchable.",
    "Force the midpoint to an even index, then check whether it still pairs with the value after it.",
  ],
  whyNow:
    "XOR-ing the whole array finds the loner in one pass and is beautiful, but it reads every element — and the problem asks for logarithmic time precisely to rule it out. Sortedness means the pairing pattern breaks exactly once, and a broken pattern is a boundary, which is what binary search is for.",
  approach:
    "Round the midpoint down to an even index. Before the lone value, an even index always holds the first half of a pair, so nums[mid] equals nums[mid + 1]; after it, that equality fails. If they are equal the loner is to the right of the pair, so move low past both; otherwise the loner is at the midpoint or to its left. When the range narrows to one index, it holds the lone value. Rounding to even is what makes the test meaningful — on an odd index the comparison would be against the wrong half of a pair.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def single_non_duplicate(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid % 2 == 1:
            mid -= 1
        if nums[mid] == nums[mid + 1]:
            lo = mid + 2
        else:
            hi = mid
    return nums[lo]`,
  java: `public int singleNonDuplicate(int[] nums) {
    int lo = 0;
    int hi = nums.length - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (mid % 2 == 1) mid--;
        if (nums[mid] == nums[mid + 1]) lo = mid + 2;
        else hi = mid;
    }
    return nums[lo];
}`,
  cpp: `int singleNonDuplicate(const vector<int>& nums) {
    int lo = 0;
    int hi = (int)nums.size() - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (mid % 2 == 1) mid--;
        if (nums[mid] == nums[mid + 1]) lo = mid + 2;
        else hi = mid;
    }
    return nums[lo];
}`,
  alternatives: [
    {
      name: "XOR everything",
      summary:
        "Combine every value with exclusive-or; the pairs cancel and the lone value is what remains.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def single_non_duplicate(nums: list[int]) -> int:
    out = 0
    for x in nums:
        out ^= x
    return out`,
      java: `public int singleNonDuplicate(int[] nums) {
    int out = 0;
    for (int x : nums) out ^= x;
    return out;
}`,
      cpp: `int singleNonDuplicate(const vector<int>& nums) {
    int out = 0;
    for (int x : nums) out ^= x;
    return out;
}`,
    },
  ],
}
