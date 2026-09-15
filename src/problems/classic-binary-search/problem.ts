// classic-binary-search — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "classic-binary-search"

export const title = "Find a Target in Sorted Array"

export const pattern = "binary-search"

export const difficulty: Difficulty = "easy"

export const leetcode = "binary-search"

export const brief = "Index of target in a sorted array, or -1."

export const statement = "Given a sorted integer array and a target, return the target's index or -1 if absent. Must run in O(log n)."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4",
  "-10^4 <= nums[i], target <= 10^4",
  "nums is sorted ascending and every value is distinct",
  "return -1 when the target is absent",
]

export const examples: Example[] = [
  { input: "nums = [-3, 0, 4, 9, 12], target = 9", output: "3" },
  { input: "nums = [-3, 0, 4, 9, 12], target = 2", output: "-1" },
]
