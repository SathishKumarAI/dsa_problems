// remove-element — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "remove-element"

export const title = "Strip Out Every Copy of a Value"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "remove-element"

export const brief = "Drop every copy of one value; the survivors stay packed at the front."

export const statement = "Given an integer array and a value, remove every occurrence of that value and hand back what survives, in the order it appeared. Do the removal inside the array you were given rather than building a second one."

export const constraints: string[] = [
  "0 <= nums.length <= 100",
  "0 <= nums[i] <= 50 and 0 <= val <= 100, so val may be a number that never appears at all",
  "the survivors keep their ORIGINAL relative order — LeetCode accepts any order, but pinning it is what lets five different implementations be compared against each other",
  "an empty array is legal, and so is an array where every value is val: both answer with nothing, so the code must survive a writer that never advances",
]

export const examples: Example[] = [
  { input: "nums = [3, 2, 2, 3], val = 3", output: "[2, 2]" },
  {
    input: "nums = [0, 1, 2, 2, 3, 0, 4, 2], val = 2",
    output: "[0, 1, 3, 0, 4]",
    note: "The two 2s in the middle are adjacent — the writer has to fall two behind, not one.",
  },
  {
    input: "nums = [2, 2, 2], val = 2",
    output: "[]",
    note: "Everything matches. The writer never moves, and the answer is an empty prefix.",
  },
]
