// What the problem IS, before any answer to it: the identity a route resolves,
// the statement, what the input promises, and the examples the whole document
// traces.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "balanced-brackets"
export const title = "Balanced Brackets"
export const pattern = "stack"
export const difficulty: Difficulty = "easy"
export const leetcode = "valid-parentheses"
export const brief = "Is every bracket opened and closed in the right order?"

export const statement =
  "Given a string of the characters ()[]{} only, decide whether it is well-formed: every opener has a matching closer of the same kind, closed in last-opened-first-closed order."

export const constraints = [
  "1 <= s.length <= 10^4",
  "s holds only the six characters ()[]{}",
  "every closer must match the most recent unclosed opener",
]

export const examples: Example[] = [
  { input: 's = "([{}])"', output: "true" },
  { input: 's = "(]"', output: "false" },
  { input: 's = "("', output: "false", note: "Unclosed opener left over." },
]
