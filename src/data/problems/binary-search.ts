import type { Problem } from "../types.ts"

export const binarySearch: Problem[] = [
  {
    id: "classic-binary-search",
    title: "Find a Target in Sorted Array",
    pattern: "binary-search",
    difficulty: "easy",
    brief: "Index of target in a sorted array, or -1.",
    statement:
      "Given a sorted integer array and a target, return the target's index or -1 if absent. Must run in O(log n).",
    examples: [
      { input: "nums = [-3, 0, 4, 9, 12], target = 9", output: "3" },
      { input: "nums = [-3, 0, 4, 9, 12], target = 2", output: "-1" },
    ],
    hints: [
      "Compare the target with the middle element — half the array becomes irrelevant.",
      "Keep an inclusive [lo, hi] range; loop while lo <= hi.",
      "Off-by-one bugs live in the update: mid ± 1, never mid itself, or the loop can spin forever.",
    ],
    approach:
      "Maintain an inclusive search range [lo, hi] that must contain the target if it exists. Probe the midpoint: equal means done; smaller means the answer lives strictly right of mid; larger means strictly left. Each probe halves the range, giving the logarithmic bound.",
    complexity: { time: "O(log n)", space: "O(1)" },
    python: `def binary_search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    walkthrough: [
      { cells: { values: [-3, 0, 4, 9, 12], labels: { 0: "lo", 4: "hi" } }, caption: "Search 9. Range covers the whole array." },
      { cells: { values: [-3, 0, 4, 9, 12], marks: { 2: "compare" }, labels: { 0: "lo", 2: "mid", 4: "hi" } }, caption: "mid = 2. nums[2] = 4 < 9 — target must be right of mid." },
      { cells: { values: [-3, 0, 4, 9, 12], marks: { 0: "done", 1: "done", 2: "done" }, labels: { 3: "lo", 4: "hi" } }, caption: "Discard the left half. lo = mid + 1 = 3." },
      { cells: { values: [-3, 0, 4, 9, 12], marks: { 0: "done", 1: "done", 2: "done", 3: "compare" }, labels: { 3: "lo·mid", 4: "hi" } }, caption: "mid = 3. nums[3] = 9 — found, return 3." },
      { cells: { values: [-3, 0, 4, 9, 12], marks: { 3: "focus" } }, caption: "Two probes for five elements: each step halved the range." },
    ],
    alternatives: [
      {
        name: "Linear scan",
        summary: "Ignore sortedness, check every element. The baseline the log bound is measured against.",
        complexity: { time: "O(n)", space: "O(1)" },
        python: `def binary_search(nums: list[int], target: int) -> int:
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1`,
      },
      {
        name: "Recursive",
        summary:
          "Same halving, expressed recursively. Cleaner to some eyes, costs stack frames; iterative is the production default.",
        complexity: { time: "O(log n)", space: "O(log n) stack" },
        python: `def binary_search(nums: list[int], target: int) -> int:
    def go(lo: int, hi: int) -> int:
        if lo > hi:
            return -1
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            return go(mid + 1, hi)
        return go(lo, mid - 1)

    return go(0, len(nums) - 1)`,
      },
    ],
  },
  {
    id: "rotated-minimum",
    title: "Minimum in Rotated Sorted Array",
    pattern: "binary-search",
    difficulty: "medium",
    brief: "Find the smallest value after an unknown rotation.",
    statement:
      "A sorted array of distinct values was rotated at an unknown pivot (e.g. [4,5,6,1,2,3]). Return its minimum element in O(log n).",
    examples: [
      { input: "nums = [4, 5, 6, 1, 2, 3]", output: "1" },
      { input: "nums = [1, 2, 3]", output: "1", note: "Rotation by zero is allowed." },
    ],
    hints: [
      "The array is two sorted runs; the minimum starts the second run.",
      "Compare nums[mid] with nums[hi]: which side of the break are you on?",
      "nums[mid] > nums[hi] → break (and minimum) is right of mid. Otherwise mid could itself be the minimum — keep it in range.",
    ],
    approach:
      "Binary search on the break point. If nums[mid] > nums[hi], the middle sits in the first (larger) run, so the minimum lies strictly right: lo = mid + 1. Otherwise mid is in the second run — the minimum is mid or left of it: hi = mid. Loop until the range closes; comparing against nums[hi] rather than nums[lo] avoids ambiguity when the rotation is zero.",
    complexity: { time: "O(log n)", space: "O(1)" },
    python: `def rotated_min(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
    walkthrough: [
      { cells: { values: [4, 5, 6, 1, 2, 3], labels: { 0: "lo", 5: "hi" } }, caption: "Two sorted runs: 4,5,6 and 1,2,3. The minimum starts run two." },
      { cells: { values: [4, 5, 6, 1, 2, 3], marks: { 2: "compare", 5: "compare" }, labels: { 2: "mid", 5: "hi" } }, caption: "nums[mid]=6 > nums[hi]=3 — mid is in the first run; minimum is to its right." },
      { cells: { values: [4, 5, 6, 1, 2, 3], marks: { 0: "done", 1: "done", 2: "done" }, labels: { 3: "lo", 5: "hi" } }, caption: "lo = mid + 1 = 3." },
      { cells: { values: [4, 5, 6, 1, 2, 3], marks: { 0: "done", 1: "done", 2: "done", 4: "compare", 5: "compare" }, labels: { 4: "mid", 5: "hi" } }, caption: "nums[4]=2 ≤ nums[5]=3 — mid is in the second run; keep it: hi = mid = 4." },
      { cells: { values: [4, 5, 6, 1, 2, 3], marks: { 0: "done", 1: "done", 2: "done", 3: "compare", 4: "compare" }, labels: { 3: "mid", 4: "hi" } }, caption: "nums[3]=1 ≤ nums[4]=2 — hi = 3. Now lo = hi." },
      { cells: { values: [4, 5, 6, 1, 2, 3], marks: { 3: "focus" } }, caption: "Range closed at index 3: minimum is 1." },
    ],
    alternatives: [
      {
        name: "Linear scan",
        summary: "min() of the array. Correct, O(n), and exactly what the problem forbids you to settle for.",
        complexity: { time: "O(n)", space: "O(1)" },
        python: `def rotated_min(nums: list[int]) -> int:
    return min(nums)`,
      },
      {
        name: "Find the drop",
        summary:
          "Scan for the single place where nums[i] > nums[i+1] — the rotation seam. Linear again, but names the structure the binary search exploits.",
        complexity: { time: "O(n)", space: "O(1)" },
        python: `def rotated_min(nums: list[int]) -> int:
    for i in range(len(nums) - 1):
        if nums[i] > nums[i + 1]:
            return nums[i + 1]
    return nums[0]  # not rotated`,
      },
    ],
  },
  {
    id: "koko-bananas",
    title: "Slowest Sufficient Eating Speed",
    pattern: "binary-search",
    difficulty: "medium",
    brief: "Binary search the answer, not the array.",
    statement:
      "Given piles of bananas and h hours, choose the smallest integer speed k (bananas/hour) so all piles can be finished within h hours. Each hour you eat from one pile only; a pile of p bananas takes ceil(p / k) hours.",
    examples: [
      { input: "piles = [3, 6, 7, 11], h = 8", output: "4" },
    ],
    hints: [
      "The check \"can speed k finish in h hours?\" is monotonic: if k works, every faster speed works.",
      "Monotonic yes/no over a numeric range = binary search over that range.",
      "Range is [1, max(piles)]. Find the leftmost \"yes\".",
    ],
    approach:
      "Instead of searching positions, search candidate speeds. hours(k) = Σ ceil(pile/k) is non-increasing in k, so feasibility flips from no to yes exactly once. Binary search the boundary: if hours(mid) ≤ h, mid is feasible — try slower (hi = mid); otherwise lo = mid + 1. This 'search the answer space' framing generalizes to shipping capacities, split arrays, and similar minimization problems.",
    complexity: { time: "O(n log max(piles))", space: "O(1)" },
    python: `import math

def min_eating_speed(piles: list[int], h: int) -> int:
    def hours(k: int) -> int:
        return sum(math.ceil(p / k) for p in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    walkthrough: [
      { text: "piles = [3, 6, 7, 11]   h = 8\nspeed k range: 1 .. 11\n\nfeasible(k) is monotonic:\nno no no YES YES YES ...\n         ^ find this boundary", caption: "The answer space, not the array, is what we search." },
      { text: "k = 6  →  ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6)\n       =  1 + 1 + 2 + 2 = 6 hours ≤ 8   ✓\n\nrange: 1 .. 6", caption: "mid = 6 works — try slower speeds, keep 6 in range." },
      { text: "k = 3  →  1 + 2 + 3 + 4 = 10 hours > 8   ✗\n\nrange: 4 .. 6", caption: "mid = 3 too slow — go right: lo = 4." },
      { text: "k = 5  →  1 + 2 + 2 + 3 = 8 hours ≤ 8   ✓\nrange: 4 .. 5\n\nk = 4  →  1 + 2 + 2 + 3 = 8 hours ≤ 8   ✓\nrange: 4 .. 4", caption: "5 works, then 4 works. Range closes." },
      { text: "answer: k = 4\n\nno  no  no  YES YES ...\n 1   2   3   4   5\n             ^ leftmost yes", caption: "Smallest feasible speed found in O(log 11) checks." },
    ],
    alternatives: [
      {
        name: "Try every speed",
        summary:
          "Test k = 1, 2, 3, … until one fits within h hours. The first success is the answer — correct because feasibility is monotonic, slow because the range can be huge.",
        complexity: { time: "O(n · max(piles))", space: "O(1)" },
        python: `import math

def min_eating_speed(piles: list[int], h: int) -> int:
    k = 1
    while sum(math.ceil(p / k) for p in piles) > h:
        k += 1
    return k`,
      },
    ],
  },
]
