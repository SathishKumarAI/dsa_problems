// backspace-compare — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "backspace-compare"

export const title = "Two Strings After the Backspaces"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "backspace-string-compare"

export const brief = "Type both strings, treating '#' as a backspace. Do they end up equal?"

export const statement = "Two strings are typed into an empty editor, where '#' means backspace. Return true if the two finished texts are identical."

export const constraints: string[] = [
  "0 <= s.length, t.length <= 200 — and a string made entirely of '#' finishes empty, so the empty text has to work either way",
  "every character is a lowercase letter or '#'",
  "a '#' with nothing typed before it deletes nothing — a no-op, not an error, which is why a leading '#' cannot be handled by blindly dropping the previous character",
  "one '#' removes exactly one surviving character, so a run of them removes that many",
  "the answer is a single boolean, which means the finished texts never have to exist anywhere",
]

export const examples: Example[] = [
  {
    input: 's = "ab#c", t = "ad#c"',
    output: "true",
    note: 'Both finish as "ac" — different keystrokes, same text.',
  },
  {
    input: 's = "a#c", t = "b"',
    output: "false",
    note: 'The survivors are "c" and "b": same length, different text.',
  },
  {
    input: 's = "#a", t = "a"',
    output: "true",
    note: "The trap. That leading '#' has nothing to delete, so it vanishes without taking the 'a' with it.",
  },
]
