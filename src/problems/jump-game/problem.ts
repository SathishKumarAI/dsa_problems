// jump-game — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "jump-game"

export const title = "Can You Reach the Last Index?"

export const pattern = "greedy"

export const difficulty: Difficulty = "medium"

export const leetcode = "jump-game"

export const brief = "Each cell says how far you may jump from it. Decide whether the end is reachable."

export const statement = "You start at index 0 of an array. The value at an index is the maximum number of steps you may jump forward from it. Return true when some sequence of jumps reaches the last index."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4",
  "0 <= nums[i] <= 10^5",
  "a value is a MAXIMUM, not a fixed step — from a 3 you may jump 1, 2 or 3",
  "a zero is a wall you can only pass by jumping OVER it from an earlier index",
  "an array of length 1 is already at the end, so the answer is true even when that single value is 0",
]

export const examples: Example[] = [
  {
    input: "nums = [2, 3, 1, 1, 4]",
    output: "true",
    note: "1 step to index 1, then 3 steps to the end. Taking the full 2 from the start also works.",
  },
  {
    input: "nums = [3, 2, 1, 0, 4]",
    output: "false",
    note: "Every route lands on the 0 at index 3 and stops there. The 4 beyond it is unreachable.",
  },
  {
    input: "nums = [0]",
    output: "true",
    note: "Already standing on the last index.",
  },
]
