import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "find-peak-element",
  title: "Any Local Peak, in Log Time",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "find-peak-element",
  brief: "An index larger than both its neighbours.",
  statement:
    "Given an array where no two adjacent values are equal, return the index of any peak — an element strictly greater than both of its neighbours. Values just outside the array count as negative infinity, so the ends can be peaks.",
  constraints: [
    "1 <= nums.length <= 1000",
    "-2^31 <= nums[i] <= 2^31 - 1, and nums[i] != nums[i + 1] for every i",
    "a peak is ALWAYS guaranteed to exist — the out-of-bounds negative infinity makes it so",
    "any peak is acceptable, so an array with several has several correct answers",
  ],
  examples: [
    {
      input: "nums = [1, 2, 3, 1]",
      output: "2",
      note: "3 is larger than 2 and 1.",
    },
    {
      input: "nums = [1, 2, 1, 3, 5, 6, 4]",
      output: "5",
      note: "Index 1 is also a peak; either is accepted, and this method finds 5.",
    },
  ],
  hints: [
    "The array is not sorted, so it seems like binary search cannot apply. Look at the slope at the midpoint instead of the value.",
    "If the midpoint is rising toward its right neighbour, a peak must exist somewhere to the right.",
    "If it is falling, a peak must exist at the midpoint or to its left. Either way, half the array can go.",
  ],
  whyNow:
    "Scanning for a peak reads the whole array even though the answer is only ever local. The slope at any point tells you which side must contain a peak — a rising slope cannot rise forever, because the boundary is negative infinity — so half the range can be discarded on a single comparison, with no sortedness required.",
  approach:
    "Compare the midpoint with its right neighbour. If it is smaller, the sequence is rising there, and since it must eventually fall — the edge acts as negative infinity — a peak lies strictly to the right. If it is larger, the sequence is falling, so the midpoint itself or something to its left is a peak. Neither branch can discard every peak, which is what makes the halving safe. When the range narrows to one index, that index is a peak.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def find_peak_element(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
  walkthrough: [
    {
      cells: { values: [1, 2, 1, 3, 5, 6, 4], labels: { 0: "lo", 6: "hi" } },
      caption:
        "Not sorted — but the SLOPE at the midpoint still decides a direction.",
    },
    {
      cells: {
        values: [1, 2, 1, 3, 5, 6, 4],
        marks: { 3: "focus", 4: "compare" },
        labels: { 3: "mid" },
      },
      caption: "nums[3]=3 < nums[4]=5 → rising. A peak must lie to the right.",
    },
    {
      cells: {
        values: [1, 2, 1, 3, 5, 6, 4],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done", 5: "focus" },
        labels: { 5: "mid" },
      },
      caption:
        "nums[5]=6 > nums[6]=4 → falling. Keep the midpoint and everything left of it.",
    },
    {
      cells: {
        values: [1, 2, 1, 3, 5, 6, 4],
        marks: { 4: "focus", 5: "compare" },
        labels: { 4: "mid" },
      },
      caption: "nums[4]=5 < nums[5]=6 → rising again; lo moves to 5.",
    },
    {
      cells: { values: [1, 2, 1, 3, 5, 6, 4], marks: { 5: "done" } },
      caption: "The range is one wide: index 5. Three comparisons, no scan.",
    },
  ],
  alternatives: [
    {
      name: "Scan for the turn",
      summary:
        "Walk forward and return the first index whose value is larger than the value after it, or the last index if the array never turns down.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def find_peak_element(nums: list[int]) -> int:
    for i in range(len(nums) - 1):
        if nums[i] > nums[i + 1]:
            return i
    return len(nums) - 1`,
    },
  ],
}
