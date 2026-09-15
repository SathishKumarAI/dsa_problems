// valid-palindrome — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "valid-palindrome"

export const title = "Palindrome, Ignoring the Noise"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "valid-palindrome"

export const brief = "Reads the same both ways, counting only letters and digits."

export const statement = "Given a string, return true if it reads the same forwards and backwards once every non-alphanumeric character is ignored and case is disregarded."

export const constraints: string[] = [
  "1 <= s.length <= 2 * 10^5",
  "s may contain letters, digits, spaces and punctuation",
  "a string with no alphanumeric characters at all is an empty palindrome — true, not false",
  "case is not part of the comparison, so 'A' and 'a' are the same character",
]

export const examples: Example[] = [
  {
    input: 's = "A man, a plan, a canal: Panama"',
    output: "true",
    note: "Strip the noise and it reads amanaplanacanalpanama.",
  },
  {
    input: 's = " "',
    output: "true",
    note: "Nothing left to compare, so it is trivially a palindrome.",
  },
]
