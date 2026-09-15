// spiral-matrix-ii — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "spiral-matrix-ii"

export const title = "Fill a Square by Walking Inwards"

export const pattern = "matrix"

export const difficulty: Difficulty = "medium"

export const leetcode = "spiral-matrix-ii"

export const brief = "Generate an n by n grid holding 1 to n squared laid out in a clockwise spiral."

export const statement = "Given n, produce an n by n matrix filled with the numbers 1 to n squared in clockwise spiral order, starting at the top-left. It is the mirror image of reading a matrix in a spiral: the same traversal, writing instead of reading, which makes the boundary bookkeeping the entire content of the problem."

export const constraints: string[] = [
  "1 <= n <= 20, so the cost is never in question and the correctness of the boundaries is",
  "the numbers run 1 to n squared with each used exactly once, so any cell written twice or skipped is immediately visible",
  "an odd n leaves a single centre cell last, and it is where an off-by-one in the loop bound shows up",
  "n = 1 must produce [[1]] with no ring walked at all",
  "the spiral turns clockwise starting rightwards along the top row, which fixes the order of the four walks",
]

export const examples: Example[] = [
  {
    input: "n = 3",
    output: "[[1,2,3],[8,9,4],[7,6,5]]",
    note: "The outer ring takes 1 through 8 and the centre cell takes 9.",
  },
  {
    input: "n = 1",
    output: "[[1]]",
    note: "No ring is walked. Any loop that assumes four sides run at least once writes out of bounds here.",
  },
  {
    input: "n = 2",
    output: "[[1,2],[4,3]]",
    note: "One complete ring and no centre — the case that catches a bound written for odd sizes.",
  },
]
