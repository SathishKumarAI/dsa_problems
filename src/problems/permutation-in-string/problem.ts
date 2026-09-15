// permutation-in-string — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "permutation-in-string"

export const title = "Does One String Hide the Other's Letters?"

export const pattern = "sliding-window"

export const difficulty: Difficulty = "medium"

export const leetcode = "permutation-in-string"

export const brief = "Is some rearrangement of s1 a substring of s2?"

export const statement = "Given two lowercase strings s1 and s2, return true if s2 contains a contiguous substring that is a rearrangement of s1."

export const constraints: string[] = [
  "1 <= s1.length, s2.length <= 10^4",
  "both strings are lowercase English letters",
  "the match must be CONTIGUOUS — scattered letters in the right numbers do not count",
  "if s1 is longer than s2 no window can exist, which is a free early exit",
]

export const examples: Example[] = [
  {
    input: 's1 = "ab", s2 = "eidbaooo"',
    output: "true",
    note: '"ba" sits at index 3.',
  },
  {
    input: 's1 = "ab", s2 = "eidboaoo"',
    output: "false",
    note: "The a and b are there, but never adjacent.",
  },
]
