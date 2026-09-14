import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "max-ones-after-flips",
  title: "Longest Run of 1s With k Flips",
  pattern: "sliding-window",
  difficulty: "medium",
  leetcode: "max-consecutive-ones-iii",
  brief: "Longest stretch of 1s you can buy with k zero-flips.",
  statement:
    "Given a binary array and an integer k, you may flip at most k zeroes to ones. Return the length of the longest run of consecutive 1s you can produce.",
  constraints: [
    "1 <= nums.length <= 10^5, and each value is 0 or 1",
    "0 <= k <= nums.length",
    "k = 0 asks for the longest run of 1s already present",
    "the flips must all land INSIDE one window — they cannot be spent in two separate places",
  ],
  examples: [
    { input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", output: "6" },
    {
      input: "nums = [0,0,0], k = 0",
      output: "0",
      note: "No flips and no ones.",
    },
  ],
  hints: [
    "A window is affordable while the zeroes inside it are at most k.",
    "Grow the right edge always. Move the left edge only when the window has become unaffordable.",
    "You never need to count the zeroes again — track the count as the edges move.",
  ],
  whyNow:
    "Checking every window recounts zeroes it has already counted, once per starting position. A window carries that count as its edges move, so each element is added once and removed at most once, and the answer falls out of the largest window ever held.",
  arc: "Read it as a window question and the flips stop being a story: the answer is the longest run containing at most k zeros. That translation — 'change at most k things' into 'a window whose count of the wrong thing is bounded' — is the reusable part, and it covers the longest-repeating-character variants as well. Once translated, the window grows on the right and its left edge moves only when the zero count exceeds k. The non-shrinking form works here too, for the same reason as elsewhere: the answer is a maximum, so the window never needs to become legal again, only never wider than the widest legal window seen.",
  approach:
    "Slide a window carrying the number of zeroes inside it. The right edge always advances, adding a zero to the count when it swallows one. While the count exceeds k the window is unaffordable, so the left edge advances, releasing a zero when it passes one. The largest width the window ever reaches is the answer. Because the left edge only ever moves forward, the total work is linear even though the inner loop looks nested.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def longest_ones(nums: list[int], k: int) -> int:
    left = 0
    zeroes = 0
    best = 0
    for right in range(len(nums)):
        if nums[right] == 0:
            zeroes += 1
        while zeroes > k:
            if nums[left] == 0:
                zeroes -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
  java: `public int longestOnes(int[] nums, int k) {
    int left = 0;
    int zeroes = 0;
    int best = 0;
    for (int right = 0; right < nums.length; right++) {
        if (nums[right] == 0) zeroes++;
        while (zeroes > k) {
            if (nums[left] == 0) zeroes--;
            left++;
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
  cpp: `int longestOnes(const vector<int>& nums, int k) {
    int left = 0;
    int zeroes = 0;
    int best = 0;
    for (int right = 0; right < (int)nums.size(); right++) {
        if (nums[right] == 0) zeroes++;
        while (zeroes > k) {
            if (nums[left] == 0) zeroes--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}`,
  alternatives: [
    {
      name: "Try every window",
      summary:
        "Take every start and every end, count the zeroes between them, and remember the widest stretch whose zero count fits the budget. It is the definition of the answer written straight out, and it recounts the same zeroes for every window that contains them, so the work is quadratic where one sliding count is linear.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      python: `def longest_ones(nums: list[int], k: int) -> int:
    best = 0
    for i in range(len(nums)):
        zeroes = 0
        for j in range(i, len(nums)):
            if nums[j] == 0:
                zeroes += 1
            if zeroes <= k:
                best = max(best, j - i + 1)
    return best`,
      java: `public int longestOnes(int[] nums, int k) {
    int best = 0;
    for (int i = 0; i < nums.length; i++) {
        int zeroes = 0;
        for (int j = i; j < nums.length; j++) {
            if (nums[j] == 0) zeroes++;
            if (zeroes <= k) best = Math.max(best, j - i + 1);
        }
    }
    return best;
}`,
      cpp: `int longestOnes(const vector<int>& nums, int k) {
    int best = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        int zeroes = 0;
        for (int j = i; j < (int)nums.size(); j++) {
            if (nums[j] == 0) zeroes++;
            if (zeroes <= k) best = max(best, j - i + 1);
        }
    }
    return best;
}`,
    },
  ],
}
