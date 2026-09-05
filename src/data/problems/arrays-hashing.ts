import type { Problem } from "../types.ts"

export const arraysHashing: Problem[] = [
  {
    id: "pair-sum",
    title: "Pair With Target Sum",
    pattern: "arrays-hashing",
    difficulty: "easy",
    brief: "Find two indices whose values add up to a target.",
    statement:
      "Given an integer array nums and an integer target, return the indices of two distinct elements whose sum equals target. Assume exactly one such pair exists.",
    examples: [
      {
        input: "nums = [3, 6, 1, 5], target = 8",
        output: "[0, 3]",
        note: "3 + 5 = 8, at indices 0 and 3.",
      },
      { input: "nums = [2, 2], target = 4", output: "[0, 1]" },
    ],
    hints: [
      "Brute force checks every pair — O(n²). What single question do you ask when standing on nums[i]?",
      'The question is: "have I already seen target - nums[i]?" A hash map answers that in O(1).',
      "Store value → index as you scan. Check for the complement before inserting the current value, so you never pair an element with itself.",
    ],
    approach:
      "Walk the array once, keeping a map from value to index. At each element, compute the complement target - nums[i]. If the complement is already in the map, the current index and the stored index are the answer. Otherwise record the current value and move on. One pass, one lookup and one insert per element.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
    java: `public int[] pairSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[]{seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
    cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}`,
    alternatives: [
      {
        name: "Brute force",
        summary:
          "Check every pair. Correct, trivial to write, and the baseline every interviewer expects you to name before improving on it.",
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
        java: `public int[] pairSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++)
        for (int j = i + 1; j < nums.length; j++)
            if (nums[i] + nums[j] == target) return new int[]{i, j};
    return new int[0];
}`,
        cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    int n = nums.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (nums[i] + nums[j] == target) return {i, j};
    return {};
}`,
      },
      {
        name: "Sort + two pointers",
        summary:
          "Sort (value, index) pairs and run the converging-pointer scan. Beats brute force, but sorting costs the O(n log n) and the original indices must be carried along — the hash map wins on both counts.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    order = sorted(range(len(nums)), key=lambda k: nums[k])
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[order[i]] + nums[order[j]]
        if s == target:
            return sorted([order[i], order[j]])
        if s < target:
            i += 1
        else:
            j -= 1
    return []`,
        java: `public int[] pairSum(int[] nums, int target) {
    Integer[] order = new Integer[nums.length];
    for (int k = 0; k < nums.length; k++) order[k] = k;
    Arrays.sort(order, (a, b) -> Integer.compare(nums[a], nums[b]));
    int i = 0, j = nums.length - 1;
    while (i < j) {
        int s = nums[order[i]] + nums[order[j]];
        if (s == target) {
            int[] ans = {order[i], order[j]};
            Arrays.sort(ans);
            return ans;
        }
        if (s < target) i++; else j--;
    }
    return new int[0];
}`,
        cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    int n = nums.size();
    vector<int> order(n);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return nums[a] < nums[b]; });
    int i = 0, j = n - 1;
    while (i < j) {
        int s = nums[order[i]] + nums[order[j]];
        if (s == target) return {min(order[i], order[j]), max(order[i], order[j])};
        if (s < target) i++; else j--;
    }
    return {};
}`,
      },
    ],
  },
  {
    id: "top-k-frequent",
    title: "Top K Frequent Elements",
    pattern: "arrays-hashing",
    difficulty: "medium",
    brief: "Return the k values that appear most often.",
    statement:
      "Given an integer array nums and an integer k, return the k elements that occur most frequently. Order among the answers does not matter.",
    examples: [
      { input: "nums = [4, 4, 4, 6, 6, 2], k = 2", output: "[4, 6]" },
      { input: "nums = [9], k = 1", output: "[9]" },
    ],
    hints: [
      "Counting is the easy half — a hash map gives you value → count in one pass.",
      "Sorting the counts costs O(n log n). Can you avoid comparing counts to each other at all?",
      "Counts are bounded by n. Make an array of buckets where bucket[c] holds every value that occurs c times, then read buckets from the top.",
    ],
    approach:
      "Count occurrences with a hash map. Then bucket-sort by count: index c of a length n+1 array collects all values appearing exactly c times. Scanning buckets from n down to 1 and collecting values until you have k avoids any comparison sort, because a count can never exceed n.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    buckets: list[list[int]] = [[] for _ in range(len(nums) + 1)]
    for value, c in counts.items():
        buckets[c].append(value)
    out: list[int] = []
    for c in range(len(nums), 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out`,
    walkthrough: [
      {
        text: "nums = [4, 4, 4, 6, 6, 2]   k = 2\n\ncounts: {4: 3, 6: 2, 2: 1}",
        caption: "Pass 1: hash-map count.",
      },
      {
        text: "buckets (index = count):\n\n[0] —\n[1] 2\n[2] 6\n[3] 4\n[4] —\n[5] —\n[6] —",
        caption:
          "Pass 2: value goes into bucket[count]. Counts can't exceed n = 6.",
      },
      {
        text: "read top-down:\n\n[6] —\n[5] —\n[4] —\n[3] 4   ← take\n[2] 6   ← take, have k=2, stop",
        caption: "Highest buckets first — no sort ever happens.",
      },
      {
        text: "answer: [4, 6]\n\ncount O(n) + bucket O(n) + read O(n) = O(n)",
        caption: "Bucket sort by count beats O(n log n) sorting.",
      },
    ],
    alternatives: [
      {
        name: "Sort by count",
        summary:
          "Count, then sort the distinct values by frequency and slice the top k. Simplest to write; the sort is the only thing costing more than linear.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        python: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return sorted(counts, key=counts.get, reverse=True)[:k]`,
      },
      {
        name: "Heap",
        summary:
          "Keep a min-heap of the k most frequent seen while iterating counts. Better than sorting when k ≪ distinct values; stdlib nlargest does exactly this.",
        complexity: { time: "O(n log k)", space: "O(n)" },
        python: `import heapq
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return heapq.nlargest(k, counts, key=counts.get)`,
      },
    ],
  },
  {
    id: "longest-consecutive-run",
    title: "Longest Consecutive Sequence",
    pattern: "arrays-hashing",
    difficulty: "medium",
    brief: "Length of the longest run of consecutive integers, unsorted input.",
    statement:
      "Given an unsorted integer array, return the length of the longest sequence of consecutive integers present in it (order in the array does not matter). Target O(n) — sorting is the fallback, not the answer.",
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
    walkthrough: [
      {
        cells: { values: [50, 3, 2, 100, 4, 1] },
        caption: "Load everything into a set: {50, 3, 2, 100, 4, 1}.",
      },
      {
        cells: { values: [50, 3, 2, 100, 4, 1], marks: { 0: "focus" } },
        caption:
          "50: is 49 in the set? No → 50 starts a run. Walk: 51 absent. Length 1.",
      },
      {
        cells: {
          values: [50, 3, 2, 100, 4, 1],
          marks: { 1: "done", 2: "done" },
        },
        caption:
          "3 and 2: predecessors (2 and 1) exist → NOT run starts. Skipped — this is what keeps it O(n).",
      },
      {
        cells: { values: [50, 3, 2, 100, 4, 1], marks: { 3: "focus" } },
        caption: "100: 99 absent → run of length 1.",
      },
      {
        cells: { values: [50, 3, 2, 100, 4, 1], marks: { 5: "focus" } },
        caption: "1: 0 absent → run start. Walk: 2 ✓ 3 ✓ 4 ✓ 5 ✗. Length 4.",
      },
      {
        cells: {
          values: [50, 3, 2, 100, 4, 1],
          marks: { 1: "window", 2: "window", 4: "window", 5: "window" },
        },
        caption:
          "Best run: 1, 2, 3, 4 → answer 4. Each value visited at most twice.",
      },
    ],
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
      },
    ],
  },
  {
    id: "single-number",
    title: "Single Number",
    pattern: "arrays-hashing",
    difficulty: "easy",
    brief:
      "Every value appears twice except one — find it in O(n) time and O(1) space.",
    statement:
      "Given a non-empty integer array nums where every element appears exactly twice except for one element that appears once, return that single element. The follow-up asks for linear time and constant extra space.",
    examples: [
      { input: "nums = [2, 2, 1]", output: "1" },
      { input: "nums = [4, 1, 2, 1, 2]", output: "4" },
      {
        input: "nums = [1]",
        output: "1",
        note: "n = 1 is the edge every solution must survive.",
      },
    ],
    hints: [
      "A hash map of counts solves it in O(n) time — but the follow-up forbids O(n) space. What operation cancels a value against itself?",
      "x XOR x = 0 and x XOR 0 = x, and XOR is commutative — order never matters.",
      "XOR every element into one accumulator. Pairs annihilate bit by bit; only the loner survives.",
    ],
    approach:
      "Fold the array with XOR. Because x ^ x = 0 and the operation is commutative and associative, every paired value cancels regardless of position, leaving the single value in the accumulator. One pass, one integer of state. The trick leans entirely on the promise that exactly one value is unpaired.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def single_number(nums: list[int]) -> int:
    acc = 0
    for x in nums:
        acc ^= x
    return acc`,
    java: `public int singleNumber(int[] nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}`,
    cpp: `int singleNumber(const vector<int>& nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}`,
    alternatives: [
      {
        name: "Hash map",
        summary:
          "Count every value, then return the one with count 1. Linear time, but the map is O(n) extra space — exactly what the follow-up forbids.",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `def single_number(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    for x, c in counts.items():
        if c == 1:
            return x
    return -1`,
        java: `public int singleNumber(int[] nums) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int x : nums) counts.merge(x, 1, Integer::sum);
    for (Map.Entry<Integer, Integer> e : counts.entrySet())
        if (e.getValue() == 1) return e.getKey();
    return -1;
}`,
        cpp: `int singleNumber(const vector<int>& nums) {
    unordered_map<int, int> counts;
    for (int x : nums) counts[x]++;
    for (auto& [x, c] : counts)
        if (c == 1) return x;
    return -1;
}`,
      },
      {
        name: "Sort & scan",
        summary:
          "Sort, then twins are adjacent: walk in steps of two until a pair breaks. No map, but the sort costs O(n log n).",
        complexity: { time: "O(n log n)", space: "O(1)" },
        python: `def single_number(nums: list[int]) -> int:
    s = sorted(nums)
    for i in range(0, len(s) - 1, 2):
        if s[i] != s[i + 1]:
            return s[i]
    return s[-1]`,
        java: `public int singleNumber(int[] nums) {
    int[] s = nums.clone();
    Arrays.sort(s);
    for (int i = 0; i + 1 < s.length; i += 2)
        if (s[i] != s[i + 1]) return s[i];
    return s[s.length - 1];
}`,
        cpp: `int singleNumber(vector<int> nums) {
    sort(nums.begin(), nums.end());
    for (int i = 0; i + 1 < (int)nums.size(); i += 2)
        if (nums[i] != nums[i + 1]) return nums[i];
    return nums.back();
}`,
      },
    ],
  },
]
