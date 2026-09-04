import type { Problem } from "../types"

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
      { input: "nums = [3, 6, 1, 5], target = 8", output: "[0, 3]", note: "3 + 5 = 8, at indices 0 and 3." },
      { input: "nums = [2, 2], target = 4", output: "[0, 1]" },
    ],
    hints: [
      "Brute force checks every pair — O(n²). What single question do you ask when standing on nums[i]?",
      "The question is: \"have I already seen target - nums[i]?\" A hash map answers that in O(1).",
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
    walkthrough: [
      { cells: { values: [3, 6, 1, 5], labels: { 0: "i" } }, caption: "Target 8. Map empty; stand on 3." },
      { cells: { values: [3, 6, 1, 5], marks: { 0: "focus" }, labels: { 0: "i" } }, caption: "Need 8 − 3 = 5. Not seen → store {3: 0}, move on." },
      { cells: { values: [3, 6, 1, 5], marks: { 1: "focus" }, labels: { 1: "i" } }, caption: "Need 8 − 6 = 2. Not seen → store {3:0, 6:1}." },
      { cells: { values: [3, 6, 1, 5], marks: { 2: "focus" }, labels: { 2: "i" } }, caption: "Need 8 − 1 = 7. Not seen → store {3:0, 6:1, 1:2}." },
      { cells: { values: [3, 6, 1, 5], marks: { 0: "compare", 3: "focus" }, labels: { 3: "i" } }, caption: "Need 8 − 5 = 3 — seen at index 0. Return [0, 3]." },
      { cells: { values: [3, 6, 1, 5], marks: { 0: "done", 3: "done" } }, caption: "One pass, one map: each element asks one O(1) question." },
    ],
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
      { text: "nums = [4, 4, 4, 6, 6, 2]   k = 2\n\ncounts: {4: 3, 6: 2, 2: 1}", caption: "Pass 1: hash-map count." },
      { text: "buckets (index = count):\n\n[0] —\n[1] 2\n[2] 6\n[3] 4\n[4] —\n[5] —\n[6] —", caption: "Pass 2: value goes into bucket[count]. Counts can't exceed n = 6." },
      { text: "read top-down:\n\n[6] —\n[5] —\n[4] —\n[3] 4   ← take\n[2] 6   ← take, have k=2, stop", caption: "Highest buckets first — no sort ever happens." },
      { text: "answer: [4, 6]\n\ncount O(n) + bucket O(n) + read O(n) = O(n)", caption: "Bucket sort by count beats O(n log n) sorting." },
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
      { input: "nums = [50, 3, 2, 100, 4, 1]", output: "4", note: "1, 2, 3, 4 is the longest run." },
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
      { cells: { values: [50, 3, 2, 100, 4, 1] }, caption: "Load everything into a set: {50, 3, 2, 100, 4, 1}." },
      { cells: { values: [50, 3, 2, 100, 4, 1], marks: { 0: "focus" } }, caption: "50: is 49 in the set? No → 50 starts a run. Walk: 51 absent. Length 1." },
      { cells: { values: [50, 3, 2, 100, 4, 1], marks: { 1: "done", 2: "done" } }, caption: "3 and 2: predecessors (2 and 1) exist → NOT run starts. Skipped — this is what keeps it O(n)." },
      { cells: { values: [50, 3, 2, 100, 4, 1], marks: { 3: "focus" } }, caption: "100: 99 absent → run of length 1." },
      { cells: { values: [50, 3, 2, 100, 4, 1], marks: { 5: "focus" } }, caption: "1: 0 absent → run start. Walk: 2 ✓ 3 ✓ 4 ✓ 5 ✗. Length 4." },
      { cells: { values: [50, 3, 2, 100, 4, 1], marks: { 1: "window", 2: "window", 4: "window", 5: "window" } }, caption: "Best run: 1, 2, 3, 4 → answer 4. Each value visited at most twice." },
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
]
