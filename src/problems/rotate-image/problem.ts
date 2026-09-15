// rotate-image — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "rotate-image"

export const title = "Turn the Square a Quarter Turn, In Place"

export const pattern = "matrix"

export const difficulty: Difficulty = "medium"

export const leetcode = "rotate-image"

export const brief = "Rotate an n by n grid 90 degrees clockwise without allocating another one."

export const statement = "Rotate an n by n matrix 90 degrees clockwise, modifying it in place. Allocating a second matrix is explicitly not allowed, which is the entire point: the interesting answer is a pair of operations whose composition happens to be a rotation."

export const constraints: string[] = [
  "n == matrix.length == matrix[i].length and 1 <= n <= 20, so the clock is never the issue — the in-place requirement is",
  "the rotation must happen IN PLACE, so a second n by n grid is out and only a constant amount of extra storage is allowed",
  "clockwise, not anticlockwise: the first ROW becomes the last COLUMN, and getting the direction backwards is the most common error",
  "n may be odd, in which case the centre cell stays where it is and the transpose loop must not touch the diagonal twice",
  "values are arbitrary integers, so no cell can be used as a marker or sentinel",
]

export const examples: Example[] = [
  {
    input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
    output: "[[7,4,1],[8,5,2],[9,6,3]]",
    note: "The first row 1,2,3 becomes the last column, top to bottom.",
  },
  {
    input: "matrix = [[1,2],[3,4]]",
    output: "[[3,1],[4,2]]",
    note: "The smallest case that actually moves anything.",
  },
  {
    input: "matrix = [[1]]",
    output: "[[1]]",
    note: "A single cell is its own rotation, and both loops must handle n = 1 without running.",
  },
]
