import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "sorted-squares",
  title: "Squares of a Sorted Array",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "squares-of-a-sorted-array",
  brief: "Square a sorted array and keep it sorted, in one pass.",
  statement:
    "Given an array sorted in non-decreasing order, return an array of the squares of each value, also sorted in non-decreasing order.",
  constraints: [
    "1 <= nums.length <= 10^4",
    "-10^4 <= nums[i] <= 10^4, sorted non-decreasing",
    "negatives are what make this interesting: squaring destroys the ordering, because the most negative value has the largest square",
    "duplicates are allowed, and equal magnitudes of opposite sign square to the same value",
  ],
  examples: [
    {
      input: "nums = [-4, -1, 0, 3, 10]",
      output: "[0, 1, 9, 16, 100]",
      note: "The largest square, 100, comes from the right end; the second largest, 16, from the left.",
    },
    {
      input: "nums = [-3, -2, -1]",
      output: "[1, 4, 9]",
      note: "All negative — the order reverses completely.",
    },
  ],
  hints: [
    "Where do the LARGEST squares live in a sorted array? Not in the middle.",
    "The biggest square is always at one end or the other. Compare the two ends and take the larger.",
    "So fill the answer from the BACK, taking whichever end squares bigger and moving that pointer inward.",
  ],
  whyNow:
    "Squaring and sorting throws away the ordering that was handed to you and pays n log n to rebuild it. The sortedness is still there in a usable form — the array is smallest in the middle and largest at the ends — so two pointers walking inward produce the answer in order, in a single pass.",
  approach:
    "Squaring folds the array around zero: values decrease in magnitude toward the middle and increase toward both ends. So the largest square is always at one end, which means the answer can be filled from the back. Compare the squares at the two ends, write the larger into the last unfilled slot, and move that pointer inward. Each step places exactly one value and consumes exactly one input, so the walk is linear and the result is sorted by construction.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def sorted_squares(nums: list[int]) -> list[int]:
    out = [0] * len(nums)
    i, j = 0, len(nums) - 1
    for at in range(len(nums) - 1, -1, -1):
        left = nums[i] * nums[i]
        right = nums[j] * nums[j]
        if left > right:
            out[at] = left
            i += 1
        else:
            out[at] = right
            j -= 1
    return out`,
  java: `public int[] sortedSquares(int[] nums) {
    int[] out = new int[nums.length];
    int i = 0, j = nums.length - 1;
    for (int at = nums.length - 1; at >= 0; at--) {
        int left = nums[i] * nums[i];
        int right = nums[j] * nums[j];
        if (left > right) {
            out[at] = left;
            i++;
        } else {
            out[at] = right;
            j--;
        }
    }
    return out;
}`,
  cpp: `vector<int> sortedSquares(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> out(n);
    int i = 0, j = n - 1;
    for (int at = n - 1; at >= 0; at--) {
        int left = nums[i] * nums[i];
        int right = nums[j] * nums[j];
        if (left > right) {
            out[at] = left;
            i++;
        } else {
            out[at] = right;
            j--;
        }
    }
    return out;
}`,
  walkthrough: [
    {
      cells: {
        values: [-4, -1, 0, 3, 10],
        labels: { 0: "i", 4: "j" },
      },
      caption:
        "Squares grow toward BOTH ends, so the largest is at one end or the other — never in the middle.",
    },
    {
      cells: {
        values: [-4, -1, 0, 3, 10],
        marks: { 4: "focus" },
        labels: { 0: "i", 4: "j" },
      },
      caption:
        "16 vs 100 → 100 is larger. It goes in the last slot; j moves in.",
    },
    {
      cells: {
        values: [-4, -1, 0, 3, 10],
        marks: { 0: "focus", 4: "done" },
        labels: { 0: "i", 3: "j" },
      },
      caption: "16 vs 9 → now the LEFT end wins. 16 goes next; i moves in.",
    },
    {
      cells: {
        values: [-4, -1, 0, 3, 10],
        marks: { 0: "done", 3: "focus", 4: "done" },
        labels: { 1: "i", 3: "j" },
      },
      caption:
        "1 vs 9 → 9. The answer is being filled from the back, in order.",
    },
    {
      cells: {
        values: [-4, -1, 0, 3, 10],
        marks: { 0: "done", 1: "focus", 3: "done", 4: "done" },
        labels: { 1: "i", 2: "j" },
      },
      caption: "1 vs 0 → 1, then the last slot takes 0. The pointers have met.",
    },
    {
      cells: {
        values: [0, 1, 9, 16, 100],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
      },
      caption:
        "[0, 1, 9, 16, 100] — sorted by construction, one pass, no comparison sort.",
    },
  ],
  alternatives: [
    {
      name: "Square, then sort",
      summary:
        "Replace each value with its square and hand the result to a sort, ignoring the ordering the input already had.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `def sorted_squares(nums: list[int]) -> list[int]:
    return sorted(x * x for x in nums)`,
      java: `public int[] sortedSquares(int[] nums) {
    int[] out = new int[nums.length];
    for (int i = 0; i < nums.length; i++) out[i] = nums[i] * nums[i];
    Arrays.sort(out);
    return out;
}`,
      cpp: `vector<int> sortedSquares(const vector<int>& nums) {
    vector<int> out;
    for (int x : nums) out.push_back(x * x);
    sort(out.begin(), out.end());
    return out;
}`,
    },
  ],
}
