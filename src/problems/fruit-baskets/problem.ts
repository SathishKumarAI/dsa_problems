// fruit-baskets — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "fruit-baskets"

export const title = "The Longest Run of Two Kinds"

export const pattern = "sliding-window"

export const difficulty: Difficulty = "medium"

export const leetcode = "fruit-into-baskets"

export const brief = "Pick from a row of trees with two baskets: find the longest run holding at most two kinds."

export const statement = "Each value in the array is the kind of fruit on that tree. You walk the row picking one fruit per tree and may hold at most two kinds in total; you must stop as soon as a third kind appears. Return the largest number of fruits you can pick, which is the length of the longest run containing at most two distinct values."

export const constraints: string[] = [
  "1 <= fruits.length <= 10^5",
  "0 <= fruit kind < fruits.length, so the kinds are unbounded in value but bounded in count",
  "the run must be CONTIGUOUS — you cannot skip a tree and continue",
  "at most two distinct kinds, so a row of one kind is entirely pickable",
  "repeats do not count against the limit: [1,1,1,2,2] is five fruits and only two kinds",
]

export const examples: Example[] = [
  {
    input: "fruits = [1, 2, 1]",
    output: "3",
    note: "Two kinds, the whole row.",
  },
  {
    input: "fruits = [0, 1, 2, 2]",
    output: "3",
    note: "Starting at the 1 gives 1, 2, 2 — starting at the 0 stops at the first 2.",
  },
  {
    input: "fruits = [1, 2, 3, 2, 2]",
    output: "4",
    note: "The corner case for shrinking: the window must drop the 1 AND the 2s before it, landing on 2, 3, 2, 2 rather than just after the 3.",
  },
]
