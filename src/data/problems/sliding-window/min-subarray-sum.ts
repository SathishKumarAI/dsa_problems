import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "min-subarray-sum",
  title: "Shortest Subarray That Reaches the Target",
  pattern: "sliding-window",
  difficulty: "medium",
  leetcode: "minimum-size-subarray-sum",
  brief: "Fewest consecutive positives summing to at least the target.",
  statement:
    "Given an array of positive integers and a target, return the length of the shortest contiguous subarray whose sum is at least the target, or 0 if no such subarray exists.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "1 <= nums[i] <= 10^4 — all POSITIVE, which is what makes a window's sum grow as it widens",
    "1 <= target <= 10^9",
    "no qualifying subarray means 0, not -1",
  ],
  examples: [
    { input: "target = 7, nums = [2,3,1,2,4,3]", output: "2", note: "[4,3]." },
    {
      input: "target = 11, nums = [1,1,1,1]",
      output: "0",
      note: "The whole array only reaches 4.",
    },
  ],
  hints: [
    "All values are positive, so widening a window can only raise its sum and narrowing can only lower it. That monotonicity is what a window needs.",
    "Grow the right edge until the sum qualifies, then shrink from the left while it still qualifies.",
    "Record the width every time the window qualifies, not just at the end.",
  ],
  whyNow:
    "Prefix sums make each candidate's total a subtraction, but they still ask about every pair of endpoints. Positivity means that once a window qualifies, widening it further cannot give a shorter answer — so the right edge never needs to back up, and both edges move forward only.",
  approach:
    "Grow the right edge, adding to a running sum. Whenever the sum reaches the target, record the width and then shrink from the left as long as the window still qualifies — each shrink either finds a shorter qualifying window or ends the streak. Positivity is doing the work: it guarantees the sum falls when the window narrows and rises when it widens, so a single forward sweep of each edge suffices. If the sum never reaches the target, nothing is ever recorded and the answer stays 0.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def min_subarray_len(target: int, nums: list[int]) -> int:
    left = 0
    running = 0
    best = 0
    for right in range(len(nums)):
        running += nums[right]
        while running >= target:
            width = right - left + 1
            if best == 0 or width < best:
                best = width
            running -= nums[left]
            left += 1
    return best`,
  java: `public int minSubArrayLen(int target, int[] nums) {
    int left = 0;
    int running = 0;
    int best = 0;
    for (int right = 0; right < nums.length; right++) {
        running += nums[right];
        while (running >= target) {
            int width = right - left + 1;
            if (best == 0 || width < best) best = width;
            running -= nums[left];
            left++;
        }
    }
    return best;
}`,
  cpp: `int minSubArrayLen(int target, const vector<int>& nums) {
    int left = 0;
    int running = 0;
    int best = 0;
    for (int right = 0; right < (int)nums.size(); right++) {
        running += nums[right];
        while (running >= target) {
            int width = right - left + 1;
            if (best == 0 || width < best) best = width;
            running -= nums[left];
            left++;
        }
    }
    return best;
}`,
  walkthrough: [
    {
      cells: { values: [2, 3, 1, 2, 4, 3] },
      caption: "target = 7. The window grows right and shrinks left.",
    },
    {
      cells: {
        values: [2, 3, 1, 2, 4, 3],
        marks: { 0: "window", 1: "window", 2: "window", 3: "window" },
      },
      caption: "2+3+1+2 = 8 ≥ 7 → record width 4, then try to shrink.",
    },
    {
      cells: {
        values: [2, 3, 1, 2, 4, 3],
        marks: { 1: "window", 2: "window", 3: "window" },
      },
      caption:
        "Dropping the 2 leaves 6 — no longer qualifying, so the shrink stops.",
    },
    {
      cells: {
        values: [2, 3, 1, 2, 4, 3],
        marks: { 3: "window", 4: "window" },
      },
      caption:
        "Growing to 4 lets the left edge run forward: 2+4 = 6, then 4+3 = 7.",
    },
    {
      cells: { values: [2, 3, 1, 2, 4, 3], marks: { 4: "done", 5: "done" } },
      caption:
        "[4,3] qualifies at width 2 — the answer. Both edges only moved forward.",
    },
  ],
  alternatives: [
    {
      name: "Every subarray",
      summary:
        "Take each start, extend right adding as you go, and remember the shortest stretch whose total reaches the target.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      python: `def min_subarray_len(target: int, nums: list[int]) -> int:
    best = 0
    for i in range(len(nums)):
        running = 0
        for j in range(i, len(nums)):
            running += nums[j]
            if running >= target:
                width = j - i + 1
                if best == 0 or width < best:
                    best = width
                break
    return best`,
      java: `public int minSubArrayLen(int target, int[] nums) {
    int best = 0;
    for (int i = 0; i < nums.length; i++) {
        int running = 0;
        for (int j = i; j < nums.length; j++) {
            running += nums[j];
            if (running >= target) {
                int width = j - i + 1;
                if (best == 0 || width < best) best = width;
                break;
            }
        }
    }
    return best;
}`,
      cpp: `int minSubArrayLen(int target, const vector<int>& nums) {
    int best = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        int running = 0;
        for (int j = i; j < (int)nums.size(); j++) {
            running += nums[j];
            if (running >= target) {
                int width = j - i + 1;
                if (best == 0 || width < best) best = width;
                break;
            }
        }
    }
    return best;
}`,
    },
  ],
}
