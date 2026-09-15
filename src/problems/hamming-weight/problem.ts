// hamming-weight — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "hamming-weight"

export const title = "Count the Ones Without Looking at the Zeroes"

export const pattern = "bit-manipulation"

export const difficulty: Difficulty = "easy"

export const leetcode = "number-of-1-bits"

export const brief = "How many bits are set in this number — in as many steps as there are ones."

export const statement = "Return the number of set bits in a 32-bit unsigned integer, its Hamming weight. The interest is entirely in the cost: the obvious answer takes one step per BIT, and there is a one-line trick that takes one step per SET bit, which on sparse numbers is the difference between 32 steps and one."

export const constraints: string[] = [
  "the input is a 32-bit unsigned integer, so there are at most 32 set bits and the answer is between 0 and 32",
  "zero has no set bits and must return 0 — the loop condition has to handle it without entering the body",
  "in a language with signed shifts, a right shift on a negative value can fill with ones and loop forever; Python integers are unbounded and non-negative here, which sidesteps it",
  "all ones is the worst case for every approach and is the input to reason about when comparing them",
  "n & (n - 1) clears the lowest set bit, which is what makes the cost depend on the answer rather than the word size",
]

export const examples: Example[] = [
  {
    input: "n = 11 (binary 1011)",
    output: "3",
    note: "Three set bits. The clearing trick visits exactly three times.",
  },
  {
    input: "n = 128 (binary 10000000)",
    output: "1",
    note: "One set bit high up. Shifting takes eight steps to find it; clearing takes one.",
  },
  {
    input: "n = 0",
    output: "0",
    note: "No bits set at all — the loop must not run once.",
  },
]
