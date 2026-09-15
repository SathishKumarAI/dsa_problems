// plus-one — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "plus-one"

export const title = "Add One to a Digit Array"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "easy"

export const leetcode = "plus-one"

export const brief = "A number written one digit per slot — add one and hand back the digits."

export const statement = "A non-negative integer is given as an array of its decimal digits, most significant first. Add one to that number and return the digits of the result in the same form."

export const constraints: string[] = [
  "1 <= digits.length <= 100, so the number can be far larger than any fixed-width integer type holds",
  "0 <= digits[i] <= 9",
  "no leading zeros, except that the array [0] is a legal way to write zero",
  "a carry out of the leading digit makes the answer exactly one digit longer (999 + 1 = 1000), and that is the only way the length ever changes",
]

export const examples: Example[] = [
  { input: "digits = [1, 2, 3]", output: "[1, 2, 4]" },
  {
    input: "digits = [9, 9, 9]",
    output: "[1, 0, 0, 0]",
    note: "All nines is the only shape that grows. A version that writes the answer back into the input array has nowhere to put the leading 1.",
  },
  { input: "digits = [1, 9, 9]", output: "[2, 0, 0]" },
]
