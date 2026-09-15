// subsets — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "subsets"

export const title = "Every Subset, Built One Decision at a Time"

export const pattern = "backtracking"

export const difficulty: Difficulty = "medium"

export const leetcode = "subsets"

export const brief = "All 2^n subsets of a set of distinct numbers, in any order."

export const statement = "Given an array of distinct integers, return all possible subsets — the power set — with no duplicates. Any order is acceptable. This is the smallest complete backtracking problem: the choice at each element is binary, take it or leave it, and the whole shape of the pattern is visible without any pruning to distract from it."

export const constraints: string[] = [
  "1 <= nums.length <= 10 and the values are distinct, which is why 2^10 = 1024 subsets is a perfectly reasonable output",
  "the answer has exactly 2^n entries including the empty subset and the full array — both are easy to lose",
  "values may be negative and are all different, so no duplicate handling is needed here (that is a different problem)",
  "the subsets may come back in any order and each may be in any order, so no sorting is required",
  "the output itself is exponential, so no algorithm can be better than exponential — the goal is to spend nothing BEYOND producing it",
]

export const examples: Example[] = [
  {
    input: "nums = [1,2,3]",
    output: "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]",
    note: "Eight subsets for three elements. The empty one counts.",
  },
  {
    input: "nums = [0]",
    output: "[[],[0]]",
    note: "The smallest case, and the one where forgetting the empty subset is most visible.",
  },
  {
    input: "nums = [1,2]",
    output: "[[],[1],[2],[1,2]]",
    note: "Four subsets. A solution that only emits at the deepest level of the recursion returns just [1,2].",
  },
]
