// valid-palindrome — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "valid-palindrome"

export const title = "Palindrome, Ignoring the Noise"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "valid-palindrome"

export const brief =
  "Reads the same both ways, counting only letters and digits."

export const statement =
  "Given a string, return true if it reads the same forwards and backwards once every non-alphanumeric character is ignored and case is disregarded."

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

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "1 <= s.length <= 2 * 10^5",
    what: "Two hundred thousand characters. Both rungs on this page are linear, so this bound does not choose between them \u2014 what it rules out is anything that builds a new string PER CHECK, and it is the reason the cleaned copy is worth talking about at all: at this size an extra pass and an extra 200 KB is a real cost even though the bound stays O(n).",
    figure: {
      kind: "quantities",
      items: [
        { label: "characters, at the ceiling", value: 2e5, tone: "plain" },
        {
          label: "extra bytes the cleaned copy holds",
          value: 2e5,
          tone: "bad",
        },
        { label: "extra bytes two indices hold", value: 16, tone: "good" },
      ],
    },
  },
  {
    constraint: "s may contain letters, digits, spaces and punctuation",
    what: "The input is a SENTENCE, not a word, which is the whole difficulty: the comparison is over a subsequence of the string rather than the string. Every approach here therefore needs a rule for skipping, and the skipping is where the bugs live \u2014 a skip loop that forgets to re-check its bound walks off the end on a string of pure punctuation.",
  },
  {
    constraint:
      "a string with no alphanumeric characters at all is an empty palindrome \u2014 true, not false",
    what: 'The base case, stated so it cannot be argued about. ",.;" answers TRUE: the empty sequence reads the same both ways. Code that starts by asserting the two pointers are in order gets this free; code that special-cases an empty result usually gets it backwards.',
    figure: {
      kind: "cells",
      values: [".", ",", ";"],
      caption:
        "no alphanumeric characters at all. The pointers cross before comparing anything, which IS the answer: true.",
    },
  },
  {
    constraint:
      "case is not part of the comparison, so 'A' and 'a' are the same character",
    what: "Fold case at the point of COMPARISON, not by lowercasing the whole string first \u2014 that is a second pass and a second copy for a decision you make once per character anyway. Worth knowing where this stops being trivial: case folding is language-dependent in general, and only the constraint that this is ASCII makes a 32-bit flip correct.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: 's = ",.;" \u2014 punctuation only. What is the answer?',
    options: ["false", "true", "an error", "the empty string"],
    answer: 1,
    because:
      "The constraints say a string with no alphanumeric characters is an empty palindrome, and the empty sequence reads the same in both directions. An approach whose pointers cross before comparing anything returns true without a special case.",
  },
  {
    ask: "Which of these is the comparison actually over?",
    options: [
      "Every character of s",
      "Only the alphanumeric characters of s, case folded",
      "Only the letters of s",
      "The words of s",
    ],
    answer: 1,
    because:
      "Digits count and punctuation and spaces do not, and case is not part of the comparison. That makes the palindrome a claim about a SUBSEQUENCE of the string, which is why every approach needs a skipping rule.",
  },
  {
    ask: "Why does building a cleaned copy first still cost something, when both approaches are O(n)?",
    options: [
      "It changes the time bound to O(n log n)",
      "It holds a second string as large as the input \u2014 O(n) space where the two-pointer walk needs O(1)",
      "It cannot handle digits",
      "It breaks on the empty string",
    ],
    answer: 1,
    because:
      "The bounds agree on time and disagree on space. At 2\u00b710\u2075 characters that copy is real memory, and the point of the second rung is that the same answer is available without ever materialising it.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Is Palindrome \u2014 NeetCode",
    href: "https://neetcode.io/problems/is-palindrome",
    kind: "course",
    note: "The same two rungs on video, with the skip loops written out slowly \u2014 which is where this problem is actually lost.",
  },
  {
    title: "str.isalnum() \u2014 Python docs",
    href: "https://docs.python.org/3/library/stdtypes.html#str.isalnum",
    kind: "docs",
    note: "What the skip test means exactly, and the reason it is NOT ASCII-only in Python: it is true for any Unicode letter or digit, which matters the moment the constraint is lifted.",
  },
]
