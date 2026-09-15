// container-water — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "container-water"

export const title = "Widest Container"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "medium"

export const leetcode = "container-with-most-water"

export const brief = "Pick two lines that hold the most water between them."

export const statement = "Given an array heights where heights[i] is the height of a vertical line at position i, choose two lines so the area between them (width × shorter height) is maximised. Return that area."

export const constraints: string[] = [
  "2 <= height.length <= 10^5",
  "0 <= height[i] <= 10^4",
  "the container is capped by the shorter line and widened by the distance between them",
  "the lines are vertical: nothing between them affects the area",
]

export const examples: Example[] = [
  {
    input: "heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
    output: "49",
    note: "Lines of height 8 and 7, seven apart: 7 × 7 = 49.",
  },
]
