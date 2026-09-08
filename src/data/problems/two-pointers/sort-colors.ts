import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "sort-colors",
  title: "Sort Three Colours In Place",
  pattern: "two-pointers",
  difficulty: "medium",
  leetcode: "sort-colors",
  brief: "Order an array of 0s, 1s and 2s in a single pass.",
  statement:
    "Given an array holding only the values 0, 1 and 2, rearrange it in place so all the 0s come first, then the 1s, then the 2s. Do it in one pass, without a library sort.",
  constraints: [
    "1 <= nums.length <= 300",
    "nums[i] is 0, 1 or 2 — three values, known in advance",
    "the rearrangement must happen in place, so returning a fresh sorted array is not a solution",
    "one pass: each element may be examined a constant number of times",
  ],
  examples: [
    { input: "nums = [2, 0, 2, 1, 1, 0]", output: "[0, 0, 1, 1, 2, 2]" },
    { input: "nums = [2, 0, 1]", output: "[0, 1, 2]" },
  ],
  hints: [
    "Three values means three regions. Where does each region begin and end while the walk is only half done?",
    "Keep three indices: everything before `low` is 0, everything after `high` is 2, and `mid` is the value being examined.",
    "The subtle part: after swapping a 2 down from the back, do NOT advance `mid` — the value that arrived has not been looked at yet.",
  ],
  whyNow:
    "Counting each colour and rewriting the array is already linear, but it reads every element twice and overwrites values rather than moving them — which the in-place requirement is really asking you to avoid. Three pointers do it in one pass, and the invariant they maintain is the reason it works rather than a trick.",
  approach:
    "Hold three indices and one promise: everything left of `low` is 0, everything right of `high` is 2, and everything between `low` and `mid` is 1. Read `nums[mid]`. A 0 is swapped down to `low` and both advance. A 1 is already where it belongs, so only `mid` advances. A 2 is swapped up to `high`, which then retreats — and `mid` stays put, because the value swapped in from the back has never been examined. When `mid` passes `high` every element has been placed.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def sort_colors(nums: list[int]) -> list[int]:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
        else:
            mid += 1
    return nums`,
  java: `public int[] sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            int t = nums[low];
            nums[low] = nums[mid];
            nums[mid] = t;
            low++;
            mid++;
        } else if (nums[mid] == 2) {
            int t = nums[mid];
            nums[mid] = nums[high];
            nums[high] = t;
            high--;
        } else {
            mid++;
        }
    }
    return nums;
}`,
  cpp: `vector<int> sortColors(vector<int> nums) {
    int low = 0, mid = 0, high = (int)nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            swap(nums[low], nums[mid]);
            low++;
            mid++;
        } else if (nums[mid] == 2) {
            swap(nums[mid], nums[high]);
            high--;
        } else {
            mid++;
        }
    }
    return nums;
}`,
  alternatives: [
    {
      name: "Count, then rewrite",
      summary:
        "Count how many 0s, 1s and 2s there are, then overwrite the array with that many of each in order.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def sort_colors(nums: list[int]) -> list[int]:
    counts = [0, 0, 0]
    for x in nums:
        counts[x] += 1
    at = 0
    for value in range(3):
        for _ in range(counts[value]):
            nums[at] = value
            at += 1
    return nums`,
      java: `public int[] sortColors(int[] nums) {
    int[] counts = new int[3];
    for (int x : nums) counts[x]++;
    int at = 0;
    for (int value = 0; value < 3; value++) {
        for (int i = 0; i < counts[value]; i++) {
            nums[at] = value;
            at++;
        }
    }
    return nums;
}`,
      cpp: `vector<int> sortColors(vector<int> nums) {
    vector<int> counts(3, 0);
    for (int x : nums) counts[x]++;
    int at = 0;
    for (int value = 0; value < 3; value++) {
        for (int i = 0; i < counts[value]; i++) {
            nums[at] = value;
            at++;
        }
    }
    return nums;
}`,
    },
  ],
}
