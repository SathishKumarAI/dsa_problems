// combination-sum — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "combination-sum"

export const title = "Every Way to Reach the Target, Reusing Freely"

export const pattern = "backtracking"

export const difficulty: Difficulty = "medium"

export const leetcode = "combination-sum"

export const brief = "All distinct multisets of the given numbers that add up to the target, each number usable any number of times."

export const statement = "Given distinct positive candidates and a target, return every unique combination summing to the target. A candidate may be used any number of times, and two combinations are the same if they use the same numbers the same number of times — so [2,2,3] and [2,3,2] are one answer, not two. This is the first problem in the pattern where a pruning rule really matters."

export const constraints: string[] = [
  "1 <= candidates.length <= 30 with distinct values from 2 to 40, and 1 <= target <= 40",
  "candidates are POSITIVE, which is what makes the running sum monotonic and therefore makes pruning sound",
  "a candidate may be reused without limit, so the recursion passes the SAME index rather than the next one",
  "combinations are unordered, so the search must be prevented from producing the same multiset in two orders",
  "fewer than 150 combinations exist for any valid input, which is the constraint promising the search space is tame once pruned",
]

export const examples: Example[] = [
  {
    input: "candidates = [2,3,6,7], target = 7",
    output: "[[2,2,3],[7]]",
    note: "2 is reused twice. [3,2,2] is the same combination and must not appear separately.",
  },
  {
    input: "candidates = [2], target = 1",
    output: "[]",
    note: "No combination exists. Every branch overshoots immediately and the answer is the empty list.",
  },
  {
    input: "candidates = [2,3,5], target = 8",
    output: "[[2,2,2,2],[2,3,3],[3,5]]",
    note: "Three answers of different lengths, which is why depth cannot be the recursion's stopping rule.",
  },
]
