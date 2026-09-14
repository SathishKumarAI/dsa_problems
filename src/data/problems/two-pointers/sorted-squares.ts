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
  arc: "Squaring destroys the sorted order only in one specific way: the negatives reverse and the positives keep going, so the result is two sorted runs facing each other. Once that is said, the merge is obvious and the only real decision is direction — comparing the two ENDS gives the largest square, so filling the output from the back avoids any shifting. The general lesson is worth more than the trick: when a transformation breaks sortedness, ask what structure it leaves behind, because a merge of two sorted runs is linear while a fresh sort is not. This is also a clean rehearsal for merging in place from the back, which is the merge-sorted-array technique next door.",
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
  alternatives: [
    {
      name: "Square, then sort",
      summary:
        "Square every value and hand the result to a sort. One line, and it throws away the only promise the input makes: the input was sorted, so the squares already run outward from whichever value sits nearest zero. Paying n log n to rediscover that is the waste.",
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
