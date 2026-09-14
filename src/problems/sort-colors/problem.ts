// sort-colors — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "sort-colors"

export const title = "Sort Three Colours In Place"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "medium"

export const leetcode = "sort-colors"

export const brief = "Order an array of 0s, 1s and 2s in a single pass."

export const statement = "Given an array holding only the values 0, 1 and 2, rearrange it in place so all the 0s come first, then the 1s, then the 2s. Do it in one pass, without a library sort."

export const constraints: string[] = [
  "1 <= nums.length <= 300",
  "nums[i] is 0, 1 or 2 — three values, known in advance",
  "the rearrangement must happen in place, so returning a fresh sorted array is not a solution",
  "one pass: each element may be examined a constant number of times",
]

export const examples: Example[] = [
  { input: "nums = [2, 0, 2, 1, 1, 0]", output: "[0, 0, 1, 1, 2, 2]" },
  { input: "nums = [2, 0, 1]", output: "[0, 1, 2]" },
]
