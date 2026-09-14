// rotate-array — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "rotate-array"

export const title = "Rotate the Array by k"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "medium"

export const leetcode = "rotate-array"

export const brief = "Shift every value k places to the right, wrapping around, in place."

export const statement = "Given an integer array, move every value k positions to the right; the values that fall off the end wrap around to the front. The follow-up asks for it in place, with constant extra memory."

export const constraints: string[] = [
  "1 <= nums.length <= 10^5",
  "-2^31 <= nums[i] <= 2^31 - 1",
  "0 <= k <= 10^5, and k may exceed the length — k % n is the real rotation, so k = 7 on a 7-element array is no rotation at all",
  "the rotation is to the RIGHT: nums[i] ends up at index (i + k) % n",
  "in place: the follow-up rules out a second array the size of the input",
]

export const examples: Example[] = [
  {
    input: "nums = [1, 2, 3, 4, 5, 6, 7], k = 3",
    output: "[5, 6, 7, 1, 2, 3, 4]",
  },
  { input: "nums = [-1, -100, 3, 99], k = 2", output: "[3, 99, -1, -100]" },
  {
    input: "nums = [1, 2], k = 5",
    output: "[2, 1]",
    note: "k is larger than the array. Without k % n every version below either loops five times for nothing or indexes past the end.",
  },
]
