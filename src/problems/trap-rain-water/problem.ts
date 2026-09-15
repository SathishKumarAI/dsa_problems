// trap-rain-water — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "trap-rain-water"

export const title = "Water Held by an Elevation Map"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "hard"

export const leetcode = "trapping-rain-water"

export const brief = "Total rain trapped between the bars of a skyline."

export const statement = "Given an array where each entry is the height of a bar of width 1, compute how many units of water are trapped between the bars after it rains."

export const constraints: string[] = [
  "1 <= height.length <= 2 * 10^4",
  "0 <= height[i] <= 10^5",
  "water can only rest where a taller bar stands on BOTH sides — the two ends never hold any",
  "a strictly increasing or strictly decreasing map traps nothing, whatever its size",
]

export const examples: Example[] = [
  {
    input: "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
    output: "6",
    note: "Six unit squares of water sit in the dips.",
  },
  {
    input: "height = [4, 2, 3]",
    output: "1",
    note: "The single dip at index 1 holds min(4, 3) − 2 = 1.",
  },
]
