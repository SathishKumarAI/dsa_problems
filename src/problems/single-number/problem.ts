// single-number — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "single-number"

export const title = "Single Number"

export const pattern = "bit-manipulation"

export const difficulty: Difficulty = "easy"

export const leetcode = "single-number"

export const brief = "Every value appears twice except one — find it in O(n) time and O(1) space."

export const statement = "Given a non-empty integer array nums where every element appears exactly twice except for one element that appears once, return that single element. The follow-up asks for linear time and constant extra space."

export const constraints: string[] = [
  "1 <= nums.length <= 3 * 10^4",
  "-3 * 10^4 <= nums[i] <= 3 * 10^4",
  "nums.length is always odd",
  "every value appears exactly twice except one, which appears once",
]

export const examples: Example[] = [
  { input: "nums = [2, 2, 1]", output: "1" },
  { input: "nums = [4, 1, 2, 1, 2]", output: "4" },
  {
    input: "nums = [1]",
    output: "1",
    note: "n = 1 is the edge every solution must survive.",
  },
]
