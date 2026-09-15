// reverse-bits — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "reverse-bits"

export const title = "Read the Word Backwards"

export const pattern = "bit-manipulation"

export const difficulty: Difficulty = "easy"

export const leetcode = "reverse-bits"

export const brief = "Reverse the order of all 32 bits of an unsigned integer."

export const statement = "Reverse the bits of a 32-bit unsigned integer and return the result. Unlike counting set bits, every position matters here — including the leading zeroes, which is the detail that separates a correct answer from one that passes only on numbers starting with a one."

export const constraints: string[] = [
  "the input is exactly 32 bits, so leading zeroes are SIGNIFICANT: they become trailing bits and must be reversed too",
  "a loop that stops when the value reaches zero is wrong, because the remaining zero bits still occupy positions in the answer",
  "the answer can exceed the input's magnitude by a lot: reversing 1 gives 2^31",
  "in Python the integer is unbounded, so the result must be built inside 32 bits explicitly rather than trusted to overflow",
  "if the function were called many times, the swap-by-masks version is worth knowing — it is a fixed five steps regardless of input",
]

export const examples: Example[] = [
  {
    input: "n = 43261596 (00000010100101000001111010011100)",
    output: "964176192 (00111001011110000010100101000000)",
    note: "The trailing zeroes of the input become leading zeroes of the answer, and vice versa.",
  },
  {
    input: "n = 1",
    output: "2147483648",
    note: "One bit at the bottom lands at the top. A loop that stops when n hits zero answers 1 here.",
  },
  {
    input: "n = 0",
    output: "0",
    note: "All 32 zeroes reverse to 32 zeroes, and the loop must still be allowed to run its full course.",
  },
]
