// kth-largest-stream — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "kth-largest-stream"

export const title = "Kth Largest in a Stream"

export const pattern = "design"

export const difficulty: Difficulty = "easy"

export const leetcode = "kth-largest-element-in-a-stream"

export const brief = "Always know the kth largest as numbers keep arriving."

export const statement = "Design a class initialized with k and a list of numbers. Each call to add(x) inserts x and returns the kth largest value seen so far."

export const constraints: string[] = [
  "1 <= k <= 10^4",
  "0 <= nums.length <= 10^4",
  "-10^4 <= nums[i], val <= 10^4",
  "at least k values exist when kth-largest is asked for",
]

export const examples: Example[] = [
  {
    input: "k = 3, start = [4, 5, 8, 2]; add(3) → 4; add(5) → 5; add(10) → 5",
    output: "see calls",
    note: "After add(10) the three largest are 10, 8, 5.",
  },
]
