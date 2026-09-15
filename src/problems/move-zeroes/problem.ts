// move-zeroes — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "move-zeroes"

export const title = "Push the Zeroes to the End"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "move-zeroes"

export const brief = "Zeroes to the back, everything else keeps its order."

export const statement = "Given an integer array, move every 0 to the end while keeping the relative order of the non-zero values. Do it in place."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4",
  "-2^31 <= nums[i] <= 2^31 - 1",
  "the non-zero values must keep their RELATIVE ORDER, which rules out swapping a zero with the last element",
  "in place: no second array to build the answer in",
]

export const examples: Example[] = [
  { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
  {
    input: "nums = [0, 0, 1]",
    output: "[1, 0, 0]",
    note: "A run of zeroes at the front is the case that catches a careless swap.",
  },
]
