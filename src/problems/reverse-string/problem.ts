// reverse-string — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "reverse-string"

export const title = "Reverse the Characters in Place"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "reverse-string"

export const brief = "Swap the two ends inward until the pointers meet."

export const statement = "Given a string, return it with its characters in the opposite order. Build the answer by moving characters around inside one buffer rather than growing a new string a concatenation at a time."

export const constraints: string[] = [
  "0 <= s.length <= 10^5",
  "the characters are ordinary printable ASCII; nothing here depends on the alphabet, only on position",
  "the empty string and a one-character string are both legal input and both answer with themselves — the swap loop must run zero times, not once",
  "an odd length leaves a middle character with no partner: it is its own mirror and must not be touched, which is why the loop stops when the pointers MEET rather than when they cross",
]

export const examples: Example[] = [
  { input: 's = "hello"', output: '"olleh"' },
  {
    input: 's = "abc"',
    output: '"cba"',
    note: "Odd length: 'b' sits at the middle and stays exactly where it is.",
  },
  {
    input: 's = ""',
    output: '""',
    note: "The right pointer starts at -1, already past the left one — the trap is a loop that swaps before it tests.",
  },
]
