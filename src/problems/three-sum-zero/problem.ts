// three-sum-zero — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "three-sum-zero"

export const title = "Triplets Summing to Zero"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "medium"

export const leetcode = "3sum"

export const brief = "All unique triplets that sum to zero."

export const statement = "Given an integer array, return every unique triplet [a, b, c] with a + b + c = 0. The same triplet must not appear twice in the output."

export const constraints: string[] = [
  "3 <= nums.length <= 3000",
  "-10^5 <= nums[i] <= 10^5",
  "the triples must be distinct as sets of values, not as sets of indices",
  "an element may not be reused within one triple",
]

export const examples: Example[] = [
  {
    input: "nums = [-1, 0, 1, 2, -1, -4]",
    output: "[[-1, -1, 2], [-1, 0, 1]]",
  },
]
