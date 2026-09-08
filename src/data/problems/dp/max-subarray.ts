import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "max-subarray",
  title: "Best Contiguous Run",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "maximum-subarray",
  brief: "Largest sum of any contiguous stretch.",
  statement:
    "Given an integer array, find the contiguous subarray with the largest sum and return that sum. The subarray must hold at least one element.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "-10^4 <= nums[i] <= 10^4",
    "the subarray must be non-empty, so an all-negative array answers with its largest element, not 0",
    "contiguous — this is a stretch of the array, not a selection from it",
  ],
  examples: [
    {
      input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
      output: "6",
      note: "[4, −1, 2, 1].",
    },
    {
      input: "nums = [-3, -1, -2]",
      output: "-1",
      note: "Every stretch is negative, so take the least bad one.",
    },
  ],
  hints: [
    "Define the answer for a position: the best sum of a run that ENDS at index i. The overall answer is the largest of those.",
    "A run ending at i either extends the best run ending at i − 1, or starts fresh at i. Two choices, not many.",
    "So the recurrence is: best-ending-here = nums[i] + max(0, best-ending-at-previous). Carry one number, not a table.",
  ],
  whyNow:
    "The table version is already linear, but every entry is read exactly once, by the very next step. A value read once and never again does not need to be stored — so the whole table collapses to a single running number, and the space goes from n to a constant.",
  approach:
    "Walk once carrying two numbers: the best sum of a run ending at the current position, and the best sum seen anywhere. At each element the run either continues or restarts, and it restarts exactly when the run so far is a liability — a negative carried sum. That single decision is the recurrence. Seeding both numbers with the first element, rather than with zero, is what keeps the all-negative case honest: an empty run is not an allowed answer.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def max_subarray(nums: list[int]) -> int:
    running = nums[0]
    best = nums[0]
    for i in range(1, len(nums)):
        running = nums[i] + max(running, 0)
        best = max(best, running)
    return best`,
  java: `public int maxSubArray(int[] nums) {
    int running = nums[0];
    int best = nums[0];
    for (int i = 1; i < nums.length; i++) {
        running = nums[i] + Math.max(running, 0);
        best = Math.max(best, running);
    }
    return best;
}`,
  cpp: `int maxSubArray(const vector<int>& nums) {
    int running = nums[0];
    int best = nums[0];
    for (int i = 1; i < (int)nums.size(); i++) {
        running = nums[i] + max(running, 0);
        best = max(best, running);
    }
    return best;
}`,
  walkthrough: [
    {
      cells: { values: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
      caption:
        "Two numbers: the best run ending here, and the best run anywhere. Both start at −2.",
    },
    {
      cells: {
        values: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        marks: { 0: "compare", 1: "focus" },
      },
      caption:
        "At 1: the carried run is −2, a liability → restart. running = 1, best = 1.",
    },
    {
      cells: {
        values: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        marks: { 1: "window", 2: "focus" },
      },
      caption:
        "At −3: continuing gives 1 − 3 = −2, still better than restarting at −3. running = −2, best stays 1.",
    },
    {
      cells: {
        values: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        marks: { 3: "focus", 2: "compare" },
      },
      caption:
        "At 4: the carried −2 is dropped → restart. running = 4, best = 4.",
    },
    {
      cells: {
        values: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        marks: { 3: "window", 4: "window", 5: "window", 6: "focus" },
      },
      caption:
        "The run 4, −1, 2, 1 never goes negative, so it is never dropped. running = 6, best = 6.",
    },
    {
      cells: {
        values: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        marks: { 3: "done", 4: "done", 5: "done", 6: "done" },
      },
      caption:
        "−5 drags the run to 1 and the final 4 lifts it to 5 — neither beats 6. Answer 6, in one pass and two variables.",
    },
  ],
  alternatives: [
    {
      name: "Every subarray",
      summary:
        "Take each start and each end, add up the elements between them, and keep the largest total found.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def max_subarray(nums: list[int]) -> int:
    best = nums[0]
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            if total > best:
                best = total
    return best`,
      java: `public int maxSubArray(int[] nums) {
    int best = nums[0];
    for (int i = 0; i < nums.length; i++) {
        int total = 0;
        for (int j = i; j < nums.length; j++) {
            total += nums[j];
            if (total > best) best = total;
        }
    }
    return best;
}`,
      cpp: `int maxSubArray(const vector<int>& nums) {
    int best = nums[0];
    int n = (int)nums.size();
    for (int i = 0; i < n; i++) {
        int total = 0;
        for (int j = i; j < n; j++) {
            total += nums[j];
            if (total > best) best = total;
        }
    }
    return best;
}`,
    },
    {
      name: "Table of best-ending-here",
      summary:
        "Fill an array where entry i is the largest sum of a run ending exactly at i, each entry built from the one before it, then take the largest entry.",
      whyNow:
        "The double loop re-adds prefixes it has already summed. Writing down the best run ending at each position means every entry is built from its predecessor in constant time — the same answer, once through the array instead of n times.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def max_subarray(nums: list[int]) -> int:
    ending = [0] * len(nums)
    ending[0] = nums[0]
    for i in range(1, len(nums)):
        ending[i] = nums[i] + max(ending[i - 1], 0)
    return max(ending)`,
      java: `public int maxSubArray(int[] nums) {
    int[] ending = new int[nums.length];
    ending[0] = nums[0];
    for (int i = 1; i < nums.length; i++) {
        ending[i] = nums[i] + Math.max(ending[i - 1], 0);
    }
    int best = ending[0];
    for (int x : ending) best = Math.max(best, x);
    return best;
}`,
      cpp: `int maxSubArray(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> ending(n);
    ending[0] = nums[0];
    for (int i = 1; i < n; i++) {
        ending[i] = nums[i] + max(ending[i - 1], 0);
    }
    int best = ending[0];
    for (int x : ending) best = max(best, x);
    return best;
}`,
    },
  ],
}
