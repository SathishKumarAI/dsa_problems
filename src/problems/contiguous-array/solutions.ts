// contiguous-array — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Walk once, adding +1 for a one and -1 for a zero, and keep a map from each running total to the FIRST index at which it occurred. Whenever the current total has been seen before, everything between that earlier position and here sums to zero, so it is balanced, and its length is the difference of the indices; keep the largest. Recording only the first occurrence is what makes each stretch as long as possible. The map must start holding total 0 at index -1, or a balanced stretch beginning at the array's start is never counted."

export const whyNow = "Recomputing a count for every stretch re-walks values that the stretch one shorter already counted. Turning balance into a running total makes the question 'have I been at this height before?', which a map answers in one lookup — so each element is visited once instead of once per stretch that contains it."

export const arc = "Two ideas meet here and both travel further than this problem. The first is relabelling: converting 'equally many of two things' into 'sums to zero' replaces a pair of counters with one number, and that reframing is what makes the rest possible. The second is the prefix-sum map — a stretch has a given sum exactly when two prefix totals differ by it, so remembering where each total was first seen turns a question about stretches into a question about repeats. Together they solve a whole family: longest stretch summing to k, counting stretches divisible by k, longest balanced substring of brackets. The detail that separates working code from nearly working code is seeding the map with the empty prefix, because without it every stretch that starts at index 0 goes unseen and no small example reveals it."

export const complexity = { time: "O(n)", space: "O(n)" }

export const python = `def find_max_length(nums: list[int]) -> int:
    # the empty prefix has total 0 and ends just before index 0
    first_seen: dict[int, int] = {0: -1}
    total = 0
    best = 0
    for i, x in enumerate(nums):
        total += 1 if x == 1 else -1
        if total in first_seen:
            # same height twice: everything between sums to zero
            best = max(best, i - first_seen[total])
        else:
            # FIRST occurrence only, so the stretch is as long as possible
            first_seen[total] = i
    return best`

export const alternatives: Solution[] = [
  {
    name: "Count inside every stretch",
    summary:
      "Take every start and every end, count the zeroes and ones between them, and keep the longest balanced pair. It is the definition with nothing removed, and it re-counts almost the same values for every stretch it examines.",
    complexity: { time: "O(n^3)", space: "O(1)" },
    python: `def find_max_length(nums: list[int]) -> int:
    n = len(nums)
    best = 0
    for start in range(n):
        for end in range(start + 1, n + 1):
            window = nums[start:end]
            if window.count(0) == window.count(1) and end - start > best:
                best = end - start
    return best`,
  },
  {
    name: "Carry the balance per start",
    summary:
      "Fix a start and extend the end one step at a time, keeping a single running balance instead of recounting. Reset for each start. It removes one full factor of n and shows the running-total idea in miniature, still anchored to a start.",
    complexity: { time: "O(n^2)", space: "O(1)" },
    whyNow:
      "Re-counting a stretch throws away the count of the stretch one shorter, which differs by a single element. Carrying the balance forward as the end moves keeps that work instead of repeating it.",
    python: `def find_max_length(nums: list[int]) -> int:
    n = len(nums)
    best = 0
    for start in range(n):
        balance = 0
        for end in range(start, n):
            balance += 1 if nums[end] == 1 else -1
            if balance == 0 and end - start + 1 > best:
                best = end - start + 1
    return best`,
  },
]
