// find-pivot-index — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "find-pivot-index"

export const title = "The Index With Equal Weight on Both Sides"

export const pattern = "prefix-sums"

export const difficulty: Difficulty = "easy"

export const leetcode = "find-pivot-index"

export const brief = "Find the leftmost index where everything to the left sums to everything to the right."

export const statement = "Return the leftmost index whose strict left sum equals its strict right sum; the pivot itself belongs to neither side. An empty side sums to zero, so index 0 qualifies whenever the rest of the array sums to zero. Return -1 if no such index exists."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4, and -1000 <= nums[i] <= 1000, so negatives and zeroes are ordinary input rather than edge cases",
  "the pivot belongs to NEITHER side, which is the definition most wrong answers get subtly wrong",
  "an empty side sums to zero, so index 0 and the last index are legal answers and must not be skipped by the loop's bounds",
  "return the LEFTMOST such index, so the scan must run left to right and stop at the first hit",
  "negative values mean the running sums are not monotonic, which rules out any two-pointer approach that assumes they grow",
]

export const examples: Example[] = [
  {
    input: "nums = [1,7,3,6,5,6]",
    output: "3",
    note: "Left of index 3 sums to 11 and right of it sums to 11. The value 6 at the pivot counts for neither.",
  },
  {
    input: "nums = [2,1,-1]",
    output: "0",
    note: "The left side of index 0 is empty and sums to zero; the right side is 1 + (-1) = 0. A loop starting at index 1 misses this.",
  },
  {
    input: "nums = [1,2,3]",
    output: "-1",
    note: "No index balances. The function must have an answer for the no-answer case.",
  },
]
