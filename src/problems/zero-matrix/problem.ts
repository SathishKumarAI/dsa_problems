// zero-matrix — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "zero-matrix"

export const title = "One Zero Wipes Its Row and Column"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "medium"

export const leetcode = "set-matrix-zeroes"

export const brief = "Every zero in the matrix blanks its whole row and column — done in place."

export const statement = "Given a matrix, set the entire row and the entire column of every zero to 0. The wipe is decided by the ORIGINAL matrix, and the classic follow-up asks for it in place with constant extra memory."

export const constraints: string[] = [
  "1 <= rows, columns <= 200",
  "-2^31 <= value < 2^31, so no value can be reserved as a private marker",
  "the zeros that trigger a wipe are the ones in the INPUT — a cell blanked by one wipe must not trigger another",
  "wipes overlap freely: one zero can blank a row that another zero's column already crossed",
  "the follow-up asks for O(1) extra memory, which rules out remembering the rows and columns in separate arrays",
]

export const examples: Example[] = [
  {
    input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
    output: "[[1,0,1],[0,0,0],[1,0,1]]",
    note: "One zero blanks the middle row and the middle column.",
  },
  {
    input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]",
    output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]",
    note: "Two zeros in one row; their columns are both wiped.",
  },
  {
    input: "matrix = [[1,0],[1,1]]",
    output: "[[0,0],[1,0]]",
    note: "The trap for an in-place pass: blanking the first row as you go would make the 1 below look like a zero if the sweep is not ordered carefully.",
  },
]
