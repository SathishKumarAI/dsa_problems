// sorted-squares — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "sorted-squares"

export const title = "Squares of a Sorted Array"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "squares-of-a-sorted-array"

export const brief = "Square a sorted array and keep it sorted, in one pass."

export const statement = "Given an array sorted in non-decreasing order, return an array of the squares of each value, also sorted in non-decreasing order."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4",
  "-10^4 <= nums[i] <= 10^4, sorted non-decreasing",
  "negatives are what make this interesting: squaring destroys the ordering, because the most negative value has the largest square",
  "duplicates are allowed, and equal magnitudes of opposite sign square to the same value",
]

export const examples: Example[] = [
  {
    input: "nums = [-4, -1, 0, 3, 10]",
    output: "[0, 1, 9, 16, 100]",
    note: "The largest square, 100, comes from the right end; the second largest, 16, from the left.",
  },
  {
    input: "nums = [-3, -2, -1]",
    output: "[1, 4, 9]",
    note: "All negative — the order reverses completely.",
  },
]
