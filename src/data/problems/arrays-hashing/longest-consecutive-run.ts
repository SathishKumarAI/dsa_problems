import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "longest-consecutive-run",
  title: "Longest Consecutive Sequence",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "longest-consecutive-sequence",
  brief: "Length of the longest run of consecutive integers, unsorted input.",
  statement:
    "Given an unsorted integer array, return the length of the longest sequence of consecutive integers present in it (order in the array does not matter). Target O(n) — sorting is the fallback, not the answer.",
  constraints: [
    "0 <= nums.length <= 10^5",
    "-10^9 <= nums[i] <= 10^9",
    "duplicates are allowed and do not lengthen a run",
    "the array is not sorted, and sorting it is what the O(n) answer avoids",
  ],
  examples: [
    {
      input: "nums = [50, 3, 2, 100, 4, 1]",
      output: "4",
      note: "1, 2, 3, 4 is the longest run.",
    },
    { input: "nums = []", output: "0" },
  ],
  hints: [
    "Put everything in a set. Membership checks are now O(1).",
    "If you start counting from the middle of a run you will re-count it many times. Which numbers are safe to start from?",
    "A number x starts a run only if x - 1 is absent from the set. Only start counting there.",
  ],
  whyNow:
    "Sorting spends n log n to learn something a set already knows - whether a number is present. Ask that question directly, start a walk only from a value with no left neighbour, and the whole thing is linear.",
  approach:
    "Load all values into a hash set. For each value x, if x - 1 is not in the set then x is the left end of a run — walk x+1, x+2, … while they exist and track the length. Every element is visited at most twice (once in the outer loop, once inside a walk), so the total work is linear despite the nested-looking loops.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def longest_consecutive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:
            continue  # not the start of a run
        length = 1
        while x + length in values:
            length += 1
        best = max(best, length)
    return best`,
  java: `public int longestConsecutive(int[] nums) {
    Set<Integer> values = new HashSet<>();
    for (int num : nums) values.add(num);
    int best = 0;
    for (int x : values) {
        if (values.contains(x - 1)) continue;
        int length = 1;
        while (values.contains(x + length)) length++;
        best = Math.max(best, length);
    }
    return best;
}`,
  cpp: `int longestConsecutive(const vector<int>& nums) {
    unordered_set<int> values;
    for (int num : nums) values.insert(num);
    int best = 0;
    for (int x : values) {
        if (values.find(x - 1) != values.end()) continue;
        int length = 1;
        while (values.find(x + length) != values.end()) length++;
        best = max(best, length);
    }
    return best;
}`,
  alternatives: [
    {
      name: "Sort",
      summary:
        "Sort, then walk once counting runs (skip duplicates, reset on gaps). Violates the O(n) target but is the honest first answer and handles everything correctly.",
      complexity: { time: "O(n log n)", space: "O(1)" },
      python: `def longest_consecutive(nums: list[int]) -> int:
    if not nums:
        return 0
    nums = sorted(set(nums))
    best = run = 1
    for prev, cur in zip(nums, nums[1:]):
        run = run + 1 if cur == prev + 1 else 1
        best = max(best, run)
    return best`,
      java: `public int longestConsecutive(int[] nums) {
    if (nums.length == 0) return 0;
    Set<Integer> set = new HashSet<>();
    for (int n : nums) set.add(n);
    Integer[] arr = set.toArray(new Integer[0]);
    Arrays.sort(arr);
    int best = 1, run = 1;
    for (int i = 0; i < arr.length - 1; i++) {
        int prev = arr[i];
        int cur = arr[i + 1];
        if (cur == prev + 1) run++;
        else run = 1;
        best = Math.max(best, run);
    }
    return best;
}
`,
      cpp: `int longestConsecutive(const vector<int>& nums) {
    if (nums.empty()) return 0;
    unordered_set<int> s(nums.begin(), nums.end());
    vector<int> v(s.begin(), s.end());
    sort(v.begin(), v.end());
    int best = 1, run = 1;
    for (int i = 0; i + 1 < (int)v.size(); ++i) {
        int prev = v[i];
        int cur = v[i + 1];
        if (cur == prev + 1) run++;
        else run = 1;
        best = max(best, run);
    }
    return best;
}
`,
    },
  ],
}
