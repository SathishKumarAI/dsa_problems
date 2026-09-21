// What the problem IS, before any answer to it: the identity a route resolves,
// the statement, what the input promises, and the examples the whole document
// traces.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

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

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "1 <= s.length <= 10^4",
    what: "Ten thousand characters. The repeated-replace rung deletes one matching pair per pass and rescans, so its worst case is about 5\u00b710\u2077 character reads on a string like ((((\u2026)))) \u2014 slow enough to notice, and the reason it is on the page is that it is the approach people actually reach for first.",
    figure: {
      kind: "quantities",
      unit: "ops",
      items: [
        { label: "delete a pair, rescan, repeat", value: 5e7, tone: "bad" },
        { label: "one pass with a stack", value: 1e4, tone: "good" },
      ],
    },
  },
  {
    constraint: "s holds only the six characters ()[]{}",
    what: "No letters, no digits, nothing to skip \u2014 every character is either an opener or a closer, so there is no third branch in the loop. It also means the matching table is three pairs, which is what makes the counter rung tempting and, for more than one bracket type, wrong.",
  },
  {
    constraint: "every closer must match the most recent unclosed opener",
    what: "The definition, and the reason this problem IS a stack: most-recent-first is last in, first out. It is also the exact line that kills a counting solution \u2014 ([)] has one opener and one closer of each kind and every count balances, and it is not valid.",
    figure: {
      kind: "cells",
      values: ["(", "[", ")", "]"],
      caption:
        "every count balances and the string is invalid: the closer at index 2 does not match the most recent unclosed opener, which is the [.",
    },
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: 's = "([)]". Is it balanced?',
    options: [
      "Yes \u2014 every bracket has a partner",
      "No \u2014 the ) closes a [, which is not the most recent unclosed opener",
      "Yes \u2014 the counts of each type match",
      "Only if brackets of different types may interleave",
    ],
    answer: 1,
    because:
      "Counting is not enough: both counts balance here. The constraint requires each closer to match the most recent unclosed opener, and at the ) the most recent one is [.",
  },
  {
    ask: 's = "(". What must an approach do at the END of the scan?',
    options: [
      "Return true \u2014 nothing was mismatched",
      "Check that no opener is still unclosed, and return false because one is",
      "Return false only if the string is empty",
      "Nothing \u2014 the loop already decided",
    ],
    answer: 1,
    because:
      "Every closer matched, and the string is still unbalanced. The final check \u2014 is the stack empty \u2014 is a separate condition from anything inside the loop, and forgetting it is the most common way this passes its examples and fails.",
  },
  {
    ask: "Why does a stack fit this problem in particular?",
    options: [
      "Because the string is short",
      "Because brackets NEST, so the opener that must close next is always the most recent one \u2014 last in, first out",
      "Because the six characters are known in advance",
      "Because it uses less memory than an array",
    ],
    answer: 1,
    because:
      "Nesting is the property, LIFO is the structure that matches it. Recognising this one shape is what transfers: the same argument makes a stack the right tool for an iterative depth-first walk, for undo, and for evaluating an expression.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Validate Parentheses \u2014 NeetCode",
    href: "https://neetcode.io/problems/validate-parentheses",
    kind: "course",
    note: "The stack rung on video, including the final emptiness check the examples never force you to get right.",
  },
  {
    title: "Check for balanced parentheses \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/check-for-balanced-parentheses-in-an-expression/",
    kind: "reference",
    note: "The same scan in four languages, and the counting variant with an explanation of exactly which inputs defeat it.",
  },
]
