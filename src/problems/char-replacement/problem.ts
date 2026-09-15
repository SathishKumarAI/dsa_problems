// char-replacement — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "char-replacement"

export const title = "Longest Run After k Rewrites"

export const pattern = "sliding-window"

export const difficulty: Difficulty = "medium"

export const leetcode = "longest-repeating-character-replacement"

export const brief = "Longest single-letter run you can buy with k changes."

export const statement = "Given a string of uppercase letters and an integer k, you may change up to k characters to any other uppercase letter. Return the length of the longest run of one repeated letter you can produce."

export const constraints: string[] = [
  "1 <= s.length <= 10^5",
  "s consists of uppercase English letters",
  "0 <= k <= s.length",
  "k = 0 means no rewrites at all, so the answer is the longest run already present",
]

export const examples: Example[] = [
  {
    input: 's = "AABABBA", k = 1',
    output: "4",
    note: 'Rewrite the single B in "AABA" to get "AAAA".',
  },
  {
    input: 's = "ABBB", k = 2',
    output: "4",
    note: "Two rewrites turn the whole string into one letter.",
  },
]
