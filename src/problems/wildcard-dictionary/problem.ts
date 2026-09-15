// wildcard-dictionary — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "wildcard-dictionary"

export const title = "A Dictionary That Accepts a Dot"

export const pattern = "trie"

export const difficulty: Difficulty = "medium"

export const leetcode = "design-add-and-search-words-data-structure"

export const brief = "Store words, then match them against patterns where a dot stands for any single letter."

export const statement = "Design a structure with addWord(word) and search(pattern), where the pattern may contain dots and each dot matches exactly one letter. Return true when any stored word matches. The dot is what makes this more than a trie exercise: at a dot the walk stops being a walk, because every child is a candidate and the search has to branch."

export const constraints: string[] = [
  "1 <= word.length <= 25 and up to 10^4 calls, with at most 3 dots in any pattern — the bound on dots is what keeps the branching affordable",
  "added words are lowercase letters only; a pattern is lowercase letters and dots",
  "a dot matches exactly one letter and never zero or many, so the pattern's length is the matched word's length",
  "a pattern of all dots matches every stored word OF THAT LENGTH and nothing else — \"...\" does not match \"ab\"",
  "words may be added after searches have already been made, so nothing may be precomputed once and frozen",
]

export const examples: Example[] = [
  {
    input: "addWord(\"bad\"), addWord(\"dad\"), search(\"pad\"), search(\".ad\"), search(\"b..\")",
    output: "false, true, true",
    note: "The dot at the front has to try both stored branches; the last pattern fixes the first letter and frees the rest.",
  },
  {
    input: "addWord(\"a\"), search(\".\")",
    output: "true",
    note: "One dot, one letter. The recursion must terminate correctly at depth one.",
  },
  {
    input: "addWord(\"ab\"), search(\"a\")",
    output: "false",
    note: "Arriving at a node is not the same as arriving at a word — the end-of-word flag decides, exactly as in the plain trie.",
  },
]
