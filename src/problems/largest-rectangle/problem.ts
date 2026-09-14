// largest-rectangle — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "largest-rectangle"

export const title = "Largest Rectangle in Histogram"

export const pattern = "stack"

export const difficulty: Difficulty = "hard"

export const leetcode = "largest-rectangle-in-histogram"

export const brief = "Biggest rectangle fitting under a histogram's bars."

export const statement = "Given bar heights of a histogram (all width 1), return the area of the largest axis-aligned rectangle that fits entirely under the bars."

export const constraints: string[] = [
  "1 <= heights.length <= 10^5",
  "0 <= heights[i] <= 10^4",
  "the rectangle must span consecutive bars and is capped by the shortest of them",
]

export const examples: Example[] = [
  {
    input: "heights = [2, 1, 5, 6, 2, 3]",
    output: "10",
    note: "Height 5 spanning the 5 and 6 bars.",
  },
]
