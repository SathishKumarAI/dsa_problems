// subarray-sum-k — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Carry a running total and a map from prefix sum to the number of times it has occurred. At each element, any earlier prefix equal to running − k marks the start of a stretch summing to k, so add that count to the answer. Then record the current running total. Seeding the map with {0: 1} is what lets a stretch that starts at index 0 be counted — the empty prefix has sum zero and has occurred once. Counting occurrences rather than indices is why duplicates and negatives need no special handling."

export const whyNow = "Prefix sums already cut the re-adding, but they still ask, for every endpoint, which of the earlier starts work — that inner scan is the remaining n². Storing how many times each prefix sum has been seen turns that scan into a single lookup, and counts rather than positions are all the question needs."

export const arc = "The insight is arithmetic, not cleverness: the sum of a subarray is the difference of two prefix sums, so 'a subarray summing to k ending here' means 'a prefix sum equal to current minus k has been seen before'. That turns a question about ranges into a question about membership, which a hash map answers in one step — and the counting version stores how MANY times each prefix sum occurred, because several earlier positions can all qualify. Carry two details that catch people: the map must start with prefix sum zero counted once, or subarrays beginning at index 0 go missing; and this works with negative numbers, which is exactly why a sliding window does not."

export const complexity = { time: "O(n)", space: "O(n)" }

export const python = `def subarray_sum(nums: list[int], k: int) -> int:
    seen = {0: 1}
    running = 0
    total = 0
    for x in nums:
        running += x
        total += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return total`

export const java = `public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> seen = new HashMap<>();
    seen.put(0, 1);
    int running = 0, total = 0;
    for (int x : nums) {
        running += x;
        total += seen.getOrDefault(running - k, 0);
        seen.put(running, seen.getOrDefault(running, 0) + 1);
    }
    return total;
}`

export const cpp = `int subarraySum(const vector<int>& nums, int k) {
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
}`

export const alternatives: Solution[] = [
  {
    key: "brute",
    name: "Sum every subarray",
    summary:
      "Take each start, extend to each end adding as you go, and count the totals landing on k. Quadratic, and the waste is specific: the sum of a window is almost the sum of the previous window, and this throws that away at every step.",
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
    key: "prefix",
    name: "Prefix sums, compared pairwise",
    summary:
      "Build the running totals once, then test every pair of endpoints by subtracting one prefix from another. The re-adding is gone and the arithmetic is now O(1) per pair — but the pairs themselves are still quadratic, because it asks which earlier prefix makes this work by searching rather than by looking up.",
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
  // B79. A rung that is WRONG on this problem, on purpose, and the document
  // spends a section on why. It is here rather than left out because the
  // sliding window is what almost everyone reaches for after seeing two
  // quadratic rungs, and "it does not degrade, it breaks" is the lesson —
  // shrinking to restore an invariant needs the running sum to be MONOTONE in
  // the window's length, which a negative value destroys.
  //
  // The three-language gate applies to it like any other rung: the point is
  // that Java and C++ are wrong in exactly the same way Python is, which is
  // what `verify:run` checks.
  {
    key: "window",
    after: "prefix",
    name: "The sliding window that fails here",
    whyNow:
      "Both quadratic rungs consider every pair of endpoints. A window moves the two endpoints in one coordinated sweep and never walks either backwards — linear time, constant space, and on paper better than the answer below. It is also wrong here, and finding out exactly where is worth more than the approach.",
    summary:
      "Count windows summing to at most k, count windows summing to at most k − 1, subtract. Linear and constant-space, and correct ONLY while every value is non-negative — the shrink step assumes that removing a value from the left can only make the running sum smaller. One negative breaks that assumption and the count comes out wrong rather than slow: `[1, -1, 0]` with k = 0 answers 3, and this rung does not. Reach for it when the values are known non-negative, where it generalises to the whole longest-window-under-a-threshold family.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def subarray_sum(nums: list[int], k: int) -> int:
    """WRONG when nums contains a negative — the shrink step assumes it cannot."""

    def at_most(limit: int) -> int:
        left = running = total = 0
        for right, x in enumerate(nums):
            running += x
            while running > limit and left <= right:
                running -= nums[left]
                left += 1
            total += right - left + 1  # windows ending at right, starting >= left
        return total

    return at_most(k) - at_most(k - 1)`,
    java: `public int subarraySum(int[] nums, int k) {
    // WRONG when nums contains a negative — the shrink step assumes it cannot.
    return atMost(nums, k) - atMost(nums, k - 1);
}

private int atMost(int[] nums, int limit) {
    int left = 0, running = 0, total = 0;
    for (int right = 0; right < nums.length; right++) {
        running += nums[right];
        while (running > limit && left <= right) {
            running -= nums[left];
            left++;
        }
        total += right - left + 1;
    }
    return total;
}`,
    cpp: `int atMost(const vector<int>& nums, int limit) {
    int left = 0, running = 0, total = 0;
    for (int right = 0; right < (int)nums.size(); right++) {
        running += nums[right];
        while (running > limit && left <= right) {
            running -= nums[left];
            left++;
        }
        total += right - left + 1;
    }
    return total;
}

int subarraySum(const vector<int>& nums, int k) {
    // WRONG when nums contains a negative — the shrink step assumes it cannot.
    return atMost(nums, k) - atMost(nums, k - 1);
}`,
  },
]
