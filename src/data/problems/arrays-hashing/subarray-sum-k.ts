import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "subarray-sum-k",
  title: "How Many Subarrays Sum to k?",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "subarray-sum-equals-k",
  brief: "Count the contiguous stretches adding up to k.",
  statement:
    "Given an integer array and a value k, count how many contiguous subarrays sum to exactly k. Overlapping ones count separately.",
  constraints: [
    "1 <= nums.length <= 2 * 10^4",
    "-1000 <= nums[i] <= 1000, and -10^7 <= k <= 10^7",
    "values may be NEGATIVE, which is why a sliding window does not work here — a growing window's sum is not monotonic",
    "the count includes overlapping subarrays, and a subarray must be non-empty",
  ],
  examples: [
    {
      input: "nums = [1, 1, 1], k = 2",
      output: "2",
      note: "[1,1] at the front and [1,1] at the back — overlapping, both counted.",
    },
    {
      input: "nums = [1, -1, 0], k = 0",
      output: "3",
      note: "[1,−1], [0] and [1,−1,0]. Negatives make the running total revisit values.",
    },
  ],
  hints: [
    "The sum of the stretch from i to j is (running total up to j) − (running total up to i−1). Two prefix sums, one subtraction.",
    "So for each position, the question becomes: how many earlier prefix sums equal (running total − k)?",
    "A map of prefix sum → how many times it has occurred answers that in constant time. Seed it with one occurrence of 0.",
  ],
  whyNow:
    "Prefix sums already cut the re-adding, but they still ask, for every endpoint, which of the earlier starts work — that inner scan is the remaining n². Storing how many times each prefix sum has been seen turns that scan into a single lookup, and counts rather than positions are all the question needs.",
  approach:
    "Carry a running total and a map from prefix sum to the number of times it has occurred. At each element, any earlier prefix equal to running − k marks the start of a stretch summing to k, so add that count to the answer. Then record the current running total. Seeding the map with {0: 1} is what lets a stretch that starts at index 0 be counted — the empty prefix has sum zero and has occurred once. Counting occurrences rather than indices is why duplicates and negatives need no special handling.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def subarray_sum(nums: list[int], k: int) -> int:
    seen = {0: 1}
    running = 0
    total = 0
    for x in nums:
        running += x
        total += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return total`,
  java: `public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> seen = new HashMap<>();
    seen.put(0, 1);
    int running = 0, total = 0;
    for (int x : nums) {
        running += x;
        total += seen.getOrDefault(running - k, 0);
        seen.put(running, seen.getOrDefault(running, 0) + 1);
    }
    return total;
}`,
  cpp: `int subarraySum(const vector<int>& nums, int k) {
    unordered_map<int, int> seen;
    seen[0] = 1;
    int running = 0, total = 0;
    for (int x : nums) {
        running += x;
        auto it = seen.find(running - k);
        if (it != seen.end()) total += it->second;
        seen[running]++;
    }
    return total;
}`,
  walkthrough: [
    {
      cells: { values: [1, -1, 0], labels: { 0: "k = 0" } },
      caption:
        "The map starts as {0: 1}: the empty prefix has sum 0 and has happened once.",
    },
    {
      cells: { values: [1, -1, 0], marks: { 0: "focus" } },
      caption:
        "running = 1. Looking for an earlier prefix of 1 − 0 = 1 → none yet. Map becomes {0:1, 1:1}.",
    },
    {
      cells: { values: [1, -1, 0], marks: { 0: "window", 1: "focus" } },
      caption:
        "running = 0. An earlier prefix of 0 has occurred once → count 1. That is the stretch [1, −1].",
    },
    {
      cells: {
        values: [1, -1, 0],
        marks: { 0: "window", 1: "window", 2: "focus" },
      },
      caption:
        "Map now has 0 twice. running is still 0, so the lookup finds TWO earlier prefixes → count rises by 2.",
    },
    {
      cells: { values: [1, -1, 0], marks: { 0: "done", 1: "done", 2: "done" } },
      caption:
        "Total 3: [1,−1], [1,−1,0] and [0]. The two zeros in the map are exactly the two different starts.",
    },
    {
      cells: { values: [1, -1, 0] },
      caption:
        "Note what a sliding window would do here: adding −1 makes the sum FALL, so there is no rule for when to shrink. That is why this is a hashing problem.",
    },
  ],
  alternatives: [
    {
      name: "Sum every subarray",
      summary:
        "Take each start, extend to each end adding as you go, and count the totals that land on k.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def subarray_sum(nums: list[int], k: int) -> int:
    total = 0
    for i in range(len(nums)):
        running = 0
        for j in range(i, len(nums)):
            running += nums[j]
            if running == k:
                total += 1
    return total`,
      java: `public int subarraySum(int[] nums, int k) {
    int total = 0;
    for (int i = 0; i < nums.length; i++) {
        int running = 0;
        for (int j = i; j < nums.length; j++) {
            running += nums[j];
            if (running == k) total++;
        }
    }
    return total;
}`,
      cpp: `int subarraySum(const vector<int>& nums, int k) {
    int total = 0;
    int n = (int)nums.size();
    for (int i = 0; i < n; i++) {
        int running = 0;
        for (int j = i; j < n; j++) {
            running += nums[j];
            if (running == k) total++;
        }
    }
    return total;
}`,
    },
    {
      name: "Prefix sums, compared pairwise",
      summary:
        "Build the array of running totals once, then check every pair of endpoints by subtracting one prefix from another.",
      whyNow:
        "The nested loop re-adds the same prefix over and over. Computing each running total once means a stretch's sum is a single subtraction — the same quadratic number of pairs, but no arithmetic repeated inside them.",
      complexity: { time: "O(n²)", space: "O(n)" },
      python: `def subarray_sum(nums: list[int], k: int) -> int:
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    total = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums) + 1):
            if prefix[j] - prefix[i] == k:
                total += 1
    return total`,
      java: `public int subarraySum(int[] nums, int k) {
    int[] prefix = new int[nums.length + 1];
    for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
    int total = 0;
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j <= nums.length; j++) {
            if (prefix[j] - prefix[i] == k) total++;
        }
    }
    return total;
}`,
      cpp: `int subarraySum(const vector<int>& nums, int k) {
    int n = (int)nums.size();
    vector<int> prefix(n + 1, 0);
    for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
    int total = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j <= n; j++) {
            if (prefix[j] - prefix[i] == k) total++;
        }
    }
    return total;
}`,
    },
  ],
}
