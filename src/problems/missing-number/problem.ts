// missing-number — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "missing-number"

export const title = "The Number That Is Not There"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "easy"

export const leetcode = "missing-number"

export const brief = "n distinct values drawn from 0..n — name the one that never shows up."

export const statement = "An array holds n distinct integers taken from the range 0 to n inclusive. That range has n + 1 numbers in it and the array has n slots, so exactly one number is absent. Return it. The follow-up asks for linear time and constant extra memory."

export const constraints: string[] = [
  "n == nums.length, 1 <= n <= 10^4",
  "0 <= nums[i] <= n, and every value is distinct — no counting is needed, only presence",
  "the missing value can be 0 or n itself, so a scan that only looks between the smallest and largest value is wrong",
  "n may be 1: [0] is missing 1 and [1] is missing 0, and both ends have to work",
]

export const examples: Example[] = [
  { input: "nums = [3, 0, 1]", output: "2" },
  {
    input: "nums = [0, 1]",
    output: "2",
    note: "The gap is past the end of the array. Nothing inside the data points at it — only the promise about the range does.",
  },
  { input: "nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]", output: "8" },
]
