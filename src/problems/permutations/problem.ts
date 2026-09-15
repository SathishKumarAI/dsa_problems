// permutations — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "permutations"

export const title = "Every Ordering of the Same Elements"

export const pattern = "backtracking"

export const difficulty: Difficulty = "medium"

export const leetcode = "permutations"

export const brief = "All n! arrangements of a list of distinct numbers."

export const statement = "Given an array of distinct integers, return every possible ordering of them. Any order of the results is acceptable. Held against subsets, this is the same skeleton with two changes — every element stays available at every depth, and an answer is recorded only at the leaves — and those two changes are the whole difference between a combination and a permutation."

export const constraints: string[] = [
  "1 <= nums.length <= 6, because the answer has n! entries and 6! = 720 while 10! is over three million",
  "the integers are distinct, which is what lets a simple used-marker work; duplicates would need sorting and a skip rule",
  "every permutation uses ALL the elements, so unlike subsets only the deepest level of the recursion produces an answer",
  "results may come back in any order, so nothing needs sorting",
  "the output is factorial in size, so the aim is to spend nothing beyond producing it",
]

export const examples: Example[] = [
  {
    input: "nums = [1,2,3]",
    output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
    note: "Six orderings of three elements.",
  },
  {
    input: "nums = [0,1]",
    output: "[[0,1],[1,0]]",
    note: "Two elements, two orderings — the smallest case where order actually matters.",
  },
  {
    input: "nums = [1]",
    output: "[[1]]",
    note: "One permutation, not zero. The recursion must record at depth one.",
  },
]
