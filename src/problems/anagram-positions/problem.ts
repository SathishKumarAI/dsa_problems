// anagram-positions — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "anagram-positions"

export const title = "Where Every Anagram Hides"

export const pattern = "sliding-window"

export const difficulty: Difficulty = "medium"

export const leetcode = "find-all-anagrams-in-a-string"

export const brief = "List every start index where a window of the text is an anagram of the pattern."

export const statement = "Given a text and a pattern, return the start index of every substring of the text that is an anagram of the pattern — the same letters in any order."

export const constraints: string[] = [
  "1 <= text length, pattern length <= 3 · 10^4, lowercase letters only",
  "the windows all have the same length as the pattern, so there are at most (text length − pattern length + 1) of them",
  "an anagram is about COUNTS, not order, so two windows differing only in arrangement are both answers",
  "windows overlap — consecutive answers are normal, and 'aaaa' with pattern 'aa' answers three times",
  "when the pattern is longer than the text there are no windows at all, and the answer is empty",
]

export const examples: Example[] = [
  {
    input: 'text = "cbaebabacd", pattern = "abc"',
    output: "[0, 6]",
    note: '"cba" at 0 and "bac" at 6.',
  },
  {
    input: 'text = "abab", pattern = "ab"',
    output: "[0, 1, 2]",
    note: "Overlapping windows all count.",
  },
  {
    input: 'text = "aa", pattern = "aaa"',
    output: "[]",
    note: "No window is long enough to hold the pattern.",
  },
]
