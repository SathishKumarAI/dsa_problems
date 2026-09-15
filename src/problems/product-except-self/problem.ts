// product-except-self — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "product-except-self"

export const title = "Product of Everything Else"

export const pattern = "prefix-sums"

export const difficulty: Difficulty = "medium"

export const leetcode = "product-of-array-except-self"

export const brief = "Each position gets the product of all the others — no division."

export const statement = "Given an integer array, return an array where each position holds the product of every element except the one at that position. Solve it without using division, in linear time."

export const constraints: string[] = [
  "2 <= nums.length <= 10^5",
  "-30 <= nums[i] <= 30",
  "every answer is guaranteed to fit in a 32-bit integer",
  "division is off the table — which matters most precisely because the array may contain zeros",
]

export const examples: Example[] = [
  { input: "nums = [1, 2, 3, 4]", output: "[24, 12, 8, 6]" },
  {
    input: "nums = [-1, 1, 0, -3, 3]",
    output: "[0, 0, 9, 0, 0]",
    note: "A single zero makes every other answer zero.",
  },
]
