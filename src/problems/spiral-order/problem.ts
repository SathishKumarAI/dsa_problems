// spiral-order — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "spiral-order"

export const title = "Read the Matrix in a Spiral"

export const pattern = "matrix"

export const difficulty: Difficulty = "medium"

export const leetcode = "spiral-matrix"

export const brief = "Walk a matrix clockwise from the outside in and list the values in that order."

export const statement = "Given a matrix, return all of its values in spiral order: left to right along the top, down the right side, right to left along the bottom, up the left side, then inward and around again."

export const constraints: string[] = [
  "1 <= rows, columns <= 10, and the matrix need not be square",
  "-100 <= value <= 100",
  "every value appears exactly once in the answer, so its length is rows × columns",
  "a single row or a single column is a legal matrix, and the walk must not double back over it",
  "the innermost layer is where naive versions break: after the top row and the right column, there may be no bottom row or left column left to walk",
]

export const examples: Example[] = [
  {
    input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
    output: "[1, 2, 3, 6, 9, 8, 7, 4, 5]",
    note: "One full ring, then the single centre cell.",
  },
  {
    input: "matrix = [[1,2,3,4]]",
    output: "[1, 2, 3, 4]",
    note: "The corner case: one row. After walking it there is no right column, and a version that walks back along 'the bottom row' would emit it twice.",
  },
  {
    input: "matrix = [[1,2],[3,4],[5,6]]",
    output: "[1, 2, 4, 6, 5, 3]",
    note: "Taller than it is wide — the rings are rectangles, not squares.",
  },
]
