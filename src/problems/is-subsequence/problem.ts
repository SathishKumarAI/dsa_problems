// is-subsequence — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "is-subsequence"

export const title = "Is One String Hidden in the Other?"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "is-subsequence"

export const brief = "Do s's characters appear in t, in order?"

export const statement = "Given strings s and t, return true if s is a subsequence of t — that is, if s can be formed by deleting some characters from t without reordering the rest."

export const constraints: string[] = [
  "0 <= s.length <= 100, and 0 <= t.length <= 10^4",
  "both consist of lowercase English letters",
  "order must be preserved, but the characters need not be adjacent",
  "the empty string is a subsequence of anything, including of the empty string",
]

export const examples: Example[] = [
  { input: 's = "abc", t = "ahbgdc"', output: "true" },
  {
    input: 's = "axc", t = "ahbgdc"',
    output: "false",
    note: "The x is never available.",
  },
]
