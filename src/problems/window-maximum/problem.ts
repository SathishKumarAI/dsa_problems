// window-maximum — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "window-maximum"

export const title = "Maximum of Every Window"

export const pattern = "sliding-window"

export const difficulty: Difficulty = "hard"

export const leetcode = "sliding-window-maximum"

export const brief = "The largest value in each window of width k."

export const statement = "Given an array and a window width k, return the maximum of every contiguous window of that width, from left to right."

export const constraints: string[] = [
  "1 <= nums.length <= 10^5",
  "-10^4 <= nums[i] <= 10^4",
  "1 <= k <= nums.length",
  "k = 1 returns the array itself, and k = nums.length returns a single value",
]

export const examples: Example[] = [
  {
    input: "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3",
    output: "[3, 3, 5, 5, 6, 7]",
  },
  {
    input: "nums = [4, 2, 1], k = 3",
    output: "[4]",
    note: "One window, and its maximum is the first element.",
  },
]
