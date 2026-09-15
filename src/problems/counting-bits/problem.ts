// counting-bits — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "counting-bits"

export const title = "Set Bits for Every Number up to n"

export const pattern = "bit-manipulation"

export const difficulty: Difficulty = "easy"

export const leetcode = "counting-bits"

export const brief = "How many 1 bits each number from 0 to n has."

export const statement = "Given n, return an array of length n + 1 where entry i is the number of 1 bits in the binary representation of i."

export const constraints: string[] = [
  "0 <= n <= 10^5",
  "the answer has n + 1 entries, so n = 0 returns [0] rather than an empty array",
  "entry 0 is 0 — zero has no set bits, and it is the base every other entry rests on",
  "counting bits per number independently is allowed but wastes the answers already computed",
]

export const examples: Example[] = [
  { input: "n = 2", output: "[0, 1, 1]", note: "0, 1, 10 in binary." },
  {
    input: "n = 5",
    output: "[0, 1, 1, 2, 1, 2]",
    note: "4 is 100 — a power of two drops back to a single bit.",
  },
]
