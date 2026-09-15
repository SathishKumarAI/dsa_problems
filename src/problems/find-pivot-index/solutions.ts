// find-pivot-index — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Take the total of the array once. Then walk left to right carrying the running sum of everything strictly before the current index; at each index the right side is total minus running minus the current value, so the balance test is one subtraction and no second loop. Return the first index where the two agree. The pivot's own value is excluded on both sides by construction, which is the definition rather than an adjustment, and an empty left side is handled for free because the running sum starts at zero."

export const whyNow = "Keeping an explicit array of prefix sums is the same arithmetic with n extra slots, and every value in it is read exactly once immediately after being written. A single running number holds all the state the scan ever needs, which is the step from linear space to constant."

export const arc = "The move here is the one every prefix-sum problem is built on: a range sum is a difference of totals, so knowing the whole and knowing one part gives you the other for free. Written out, the right side is total - running - nums[i], and that single expression is what turns a quadratic double loop into one pass. Notice also what the array's prefix sums were used for — each one was consumed immediately after being computed, which is the reliable sign that the array can collapse into a variable. The corner cases are the two empty sides, at index 0 and at the last index, and they are only corner cases for solutions that reconstruct a side rather than deriving it."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def pivot_index(nums: list[int]) -> int:
    total = sum(nums)
    running = 0  # everything strictly LEFT of i
    for i, x in enumerate(nums):
        # the pivot itself belongs to neither side, hence the extra - x
        if running == total - running - x:
            return i
        running += x
    return -1`

export const alternatives: Solution[] = [
  {
    name: "Sum both sides at every index",
    summary:
      "For each index, add up everything to its left and everything to its right and compare. It is the definition transcribed directly and it recomputes almost the same sum n times, which is exactly the waste the pattern exists to remove.",
    complexity: { time: "O(n^2)", space: "O(1)" },
    python: `def pivot_index(nums: list[int]) -> int:
    for i in range(len(nums)):
        left = sum(nums[:i])
        right = sum(nums[i + 1:])
        if left == right:
            return i
    return -1`,
  },
  {
    name: "Build the prefix array",
    summary:
      "Precompute prefix[i], the sum of everything before index i, in one pass. Any side is then a subtraction: the left side is prefix[i] and the right side is prefix[n] - prefix[i] - nums[i]. Two clean passes and no repeated addition.",
    complexity: { time: "O(n)", space: "O(n)" },
    whyNow:
      "Re-adding a side per index repeats work the previous index already did — the sum before i is the sum before i-1 plus one value. Storing the running totals once makes every side a subtraction and drops the quadratic entirely.",
    python: `def pivot_index(nums: list[int]) -> int:
    n = len(nums)
    prefix = [0] * (n + 1)  # prefix[0] is the sum of NOTHING, and must be 0
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    for i in range(n):
        left = prefix[i]
        right = prefix[n] - prefix[i] - nums[i]
        if left == right:
            return i
    return -1`,
  },
]
