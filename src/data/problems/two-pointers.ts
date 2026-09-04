import type { Problem } from "../types"

export const twoPointers: Problem[] = [
  {
    id: "sorted-pair-sum",
    title: "Pair Sum in Sorted Array",
    pattern: "two-pointers",
    difficulty: "easy",
    brief: "Two values in a sorted array that add to a target — O(1) space.",
    statement:
      "Given an array sorted in non-decreasing order and a target, return the indices of two distinct elements that sum to target, using constant extra space. Assume exactly one answer exists.",
    examples: [
      { input: "nums = [1, 3, 6, 9], target = 12", output: "[1, 3]", note: "3 + 9 = 12." },
    ],
    hints: [
      "The hash-map trick works but spends O(n) memory. What does sortedness buy you?",
      "Put one pointer at each end. What does the current sum tell you about which pointer must move?",
      "Sum too small → only moving the left pointer right can help. Too big → move the right pointer left.",
    ],
    approach:
      "Start i at the front, j at the back. If nums[i] + nums[j] is too small, no pair using nums[i] can work with anything left of j (those are smaller still), so advance i. If too big, retreat j by the mirror argument. Each step permanently discards one element, so the walk terminates in n steps.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1
        else:
            j -= 1
    return []`,
    walkthrough: [
      { cells: { values: [1, 3, 6, 9], labels: { 0: "i", 3: "j" } }, caption: "Target 12. Pointers at both ends." },
      { cells: { values: [1, 3, 6, 9], marks: { 0: "compare", 3: "compare" }, labels: { 0: "i", 3: "j" } }, caption: "1 + 9 = 10 < 12. Nothing left of j can rescue 1 — advance i." },
      { cells: { values: [1, 3, 6, 9], marks: { 0: "done", 1: "compare", 3: "compare" }, labels: { 1: "i", 3: "j" } }, caption: "3 + 9 = 12 — hit. Return [1, 3]." },
      { cells: { values: [1, 3, 6, 9], marks: { 1: "focus", 3: "focus" } }, caption: "Each step throws away one element for good: O(n), O(1) space." },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary: "All pairs, no use of sortedness at all.",
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      },
      {
        name: "Hash map",
        summary:
          "The unsorted-array solution still works — but it spends O(n) memory to ignore information the input already gives you for free.",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
      },
    ],
  },
  {
    id: "container-water",
    title: "Widest Container",
    pattern: "two-pointers",
    difficulty: "medium",
    brief: "Pick two lines that hold the most water between them.",
    statement:
      "Given an array heights where heights[i] is the height of a vertical line at position i, choose two lines so the area between them (width × shorter height) is maximised. Return that area.",
    examples: [
      { input: "heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]", output: "49", note: "Lines of height 8 and 7, seven apart: 7 × 7 = 49." },
    ],
    hints: [
      "Area is limited by the shorter line. Start with maximum width — both ends.",
      "Shrinking width is always a loss unless the limiting side improves. Which pointer is pointless to move?",
      "Moving the taller side can never help: width drops and the short side still caps the height. Always move the shorter one.",
    ],
    approach:
      "Two pointers at the extremes. Record the area, then move the pointer at the shorter line inward — keeping it could only pair it with narrower widths while it stays the cap. This greedy discard is safe because every skipped pair is provably no better than one already measured.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def max_area(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(heights[i], heights[j]))
        if heights[i] < heights[j]:
            i += 1
        else:
            j -= 1
    return best`,
    walkthrough: [
      { cells: { values: [1, 8, 6, 2, 5, 4, 8, 3, 7], labels: { 0: "i", 8: "j" } }, caption: "Max width first. Area = 8 × min(1, 7) = 8." },
      { cells: { values: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 0: "compare", 8: "compare" }, labels: { 0: "i", 8: "j" } }, caption: "Left line (1) is shorter — it caps every wider pairing. Move i." },
      { cells: { values: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 0: "done", 1: "focus", 8: "focus" }, labels: { 1: "i", 8: "j" } }, caption: "8 and 7, width 7: area = 7 × 7 = 49. New best." },
      { cells: { values: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 1: "compare", 8: "compare" }, labels: { 1: "i", 8: "j" } }, caption: "Right (7) is shorter now — move j inward. Later pairs never beat 49." },
      { cells: { values: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 1: "done", 8: "done" } }, caption: "Answer 49. Every discarded pair was provably ≤ a measured one." },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary:
          "Measure all pairs. Fine for tiny inputs; quadratic wall at scale. State it, then improve it.",
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def max_area(heights: list[int]) -> int:
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            best = max(best, (j - i) * min(heights[i], heights[j]))
    return best`,
      },
    ],
  },
  {
    id: "three-sum-zero",
    title: "Triplets Summing to Zero",
    pattern: "two-pointers",
    difficulty: "medium",
    brief: "All unique triplets that sum to zero.",
    statement:
      "Given an integer array, return every unique triplet [a, b, c] with a + b + c = 0. The same triplet must not appear twice in the output.",
    examples: [
      { input: "nums = [-1, 0, 1, 2, -1, -4]", output: "[[-1, -1, 2], [-1, 0, 1]]" },
    ],
    hints: [
      "Sort first. Duplicates become adjacent and the pair search gets cheap.",
      "Fix the smallest element of the triplet; the rest is exactly the sorted pair-sum problem on the suffix.",
      "Skip repeats at every level: same fixed element, same left value, same right value.",
    ],
    approach:
      "Sort the array. For each index k (skipping values equal to the previous one), run the two-pointer pair search on the suffix for target -nums[k]. When a triplet is found, advance both pointers past duplicate values before continuing so no repeated triplet is emitted. A small cutoff: once nums[k] > 0, no triplet can sum to zero.",
    complexity: { time: "O(n²)", space: "O(1) beyond output" },
    python: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if nums[k] > 0:
            break
        if k > 0 and nums[k] == nums[k - 1]:
            continue
        i, j = k + 1, len(nums) - 1
        while i < j:
            s = nums[k] + nums[i] + nums[j]
            if s < 0:
                i += 1
            elif s > 0:
                j -= 1
            else:
                out.append([nums[k], nums[i], nums[j]])
                i += 1
                j -= 1
                while i < j and nums[i] == nums[i - 1]:
                    i += 1
                while i < j and nums[j] == nums[j + 1]:
                    j -= 1
    return out`,
    walkthrough: [
      { cells: { values: [-4, -1, -1, 0, 1, 2] }, caption: "Sorted: [-4, -1, -1, 0, 1, 2]. Fix each k, pair-search the suffix." },
      { cells: { values: [-4, -1, -1, 0, 1, 2], marks: { 0: "focus" }, labels: { 0: "k", 1: "i", 5: "j" } }, caption: "k = -4, need pair summing 4. -1+2=1 too small → i++. 0+2, 1+2 also fail. No pair." },
      { cells: { values: [-4, -1, -1, 0, 1, 2], marks: { 1: "focus" }, labels: { 1: "k", 2: "i", 5: "j" } }, caption: "k = -1, need 1. -1+2 = 1 ✓ → triplet [-1, -1, 2]. Move both pointers." },
      { cells: { values: [-4, -1, -1, 0, 1, 2], marks: { 1: "focus", 3: "compare", 4: "compare" }, labels: { 1: "k", 3: "i", 4: "j" } }, caption: "Still k = -1: 0+1 = 1 ✓ → [-1, 0, 1]. Pointers cross — next k." },
      { cells: { values: [-4, -1, -1, 0, 1, 2], marks: { 2: "done" }, labels: { 2: "k" } }, caption: "k at second -1: same as previous k — skipped. Duplicate triplets never emitted." },
      { cells: { values: [-4, -1, -1, 0, 1, 2], marks: { 1: "done", 2: "done", 3: "done", 4: "done", 5: "done" } }, caption: "Output: [[-1,-1,2], [-1,0,1]]. Sort + fixed-k pair search = O(n²)." },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary:
          "Three nested loops, dedup with a set of sorted tuples. Cubic — only useful to establish correctness on small inputs.",
        complexity: { time: "O(n³)", space: "O(n) for dedup" },
        python: `def three_sum(nums: list[int]) -> list[list[int]]:
    found: set[tuple[int, int, int]] = set()
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    found.add(tuple(sorted((nums[i], nums[j], nums[k]))))
    return [list(t) for t in found]`,
      },
      {
        name: "Hash per anchor",
        summary:
          "Fix one element, solve two-sum with a hash set on the rest. Same O(n²) time as the pointer version but extra memory and fiddlier dedup — pointers are cleaner once the array is sorted anyway.",
        complexity: { time: "O(n²)", space: "O(n)" },
        python: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if k > 0 and nums[k] == nums[k - 1]:
            continue
        seen: set[int] = set()
        target = -nums[k]
        for x in nums[k + 1 :]:
            if target - x in seen:
                triple = [nums[k], target - x, x]
                if triple not in out:
                    out.append(triple)
            seen.add(x)
    return out`,
      },
    ],
  },
]
