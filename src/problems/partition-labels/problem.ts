// partition-labels — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "partition-labels"

export const title = "Cut the String Where No Letter Crosses"

export const pattern = "greedy"

export const difficulty: Difficulty = "medium"

export const leetcode = "partition-labels"

export const brief = "Split a string into as many pieces as possible so no letter appears in two of them."

export const statement = "Partition a string into as many parts as possible such that each letter appears in at most one part, and return the sizes of those parts in order. Every character must land in exactly one part, so the sizes sum to the string's length — this is a cutting problem, not a selection one."

export const constraints: string[] = [
  "1 <= s.length <= 500 and s is lowercase English letters, so a 26-entry table of last positions is the whole precomputation",
  "every character belongs to exactly one part and the parts are contiguous, so the answer's sizes sum to the length",
  "as MANY parts as possible, which is what makes the cut greedy: close a part at the earliest legal point",
  "a letter appearing once is free to end a part immediately, and a letter spanning the whole string forces exactly one part",
  "the parts come back in order, so the answer is a list of sizes rather than a set of cut points",
]

export const examples: Example[] = [
  {
    input: "s = \"ababcbacadefegdehijhklij\"",
    output: "[9,7,8]",
    note: "The first part must reach index 8 because the last a is there; the second is pinned by the last e and g.",
  },
  {
    input: "s = \"eccbbbbdec\"",
    output: "[10]",
    note: "The last c sits at the end, so no cut is ever legal and the whole string is one part.",
  },
  {
    input: "s = \"abc\"",
    output: "[1,1,1]",
    note: "Every letter appears once, so each one closes its part immediately. The maximum number of parts.",
  },
]
