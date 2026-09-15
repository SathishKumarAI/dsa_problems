// remove-duplicates-sorted — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "remove-duplicates-sorted"

export const title = "Squeeze Out the Duplicates"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "remove-duplicates-from-sorted-array"

export const brief = "Keep one of each value, in place, order preserved."

export const statement = "Given a sorted array, remove the duplicates in place so each value appears once, keeping the original order, and return the array truncated to the values that remain."

export const constraints: string[] = [
  "1 <= nums.length <= 3 * 10^4, sorted non-decreasing",
  "-100 <= nums[i] <= 100",
  "sortedness is the whole gift: duplicates are always ADJACENT, so a value only has to be compared with the one before it",
  "in place — the survivors must end up at the front of the same array",
]

export const examples: Example[] = [
  { input: "nums = [1, 1, 2]", output: "[1, 2]" },
  {
    input: "nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]",
    output: "[0, 1, 2, 3, 4]",
  },
]
