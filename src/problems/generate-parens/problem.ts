// generate-parens — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "generate-parens"

export const title = "Every Well-Formed Bracket String"

export const pattern = "backtracking"

export const difficulty: Difficulty = "medium"

export const leetcode = "generate-parentheses"

export const brief = "All balanced strings of n pairs of brackets."

export const statement = "Given n, produce every string of n opening and n closing brackets that is well formed — every closing bracket matches an earlier opening one."

export const constraints: string[] = [
  "1 <= n <= 8",
  "the answer has the nth Catalan number of entries, which is 1430 at n = 8 — small enough to list, large enough that filtering all 2^2n strings is wasteful",
  "well formed means a running count of open brackets never goes negative and ends at zero",
  "the strings are returned in the order the construction produces them, so the answer is unambiguous",
]

export const examples: Example[] = [
  { input: "n = 1", output: '["()"]' },
  {
    input: "n = 2",
    output: '["(())", "()()"]',
    note: "Two of the four possible arrangements are balanced.",
  },
]
