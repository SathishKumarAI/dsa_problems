// sorted-pair-sum — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "sorted-pair-sum"

export const title = "Pair Sum in Sorted Array"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "two-sum-ii-input-array-is-sorted"

export const brief = "Two values in a sorted array that add to a target — O(1) space."

export const statement = "Given an array sorted in non-decreasing order and a target, return the indices of two distinct elements that sum to target, using constant extra space. Assume exactly one answer exists."

export const constraints: string[] = [
  "2 <= numbers.length <= 3 * 10^4",
  "-1000 <= numbers[i] <= 1000",
  "numbers is sorted ascending",
  "exactly one solution exists and an element may not be used twice; O(1) extra space is required",
]

export const examples: Example[] = [
  {
    input: "nums = [1, 3, 6, 9], target = 12",
    output: "[1, 3]",
    note: "3 + 9 = 12.",
  },
]
