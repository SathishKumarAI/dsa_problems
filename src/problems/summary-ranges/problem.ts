// summary-ranges — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "summary-ranges"

export const title = "Collapse the Runs into Ranges"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "easy"

export const leetcode = "summary-ranges"

export const brief = "Sorted distinct numbers in, the shortest list of ranges that covers them out."

export const statement = 'Given a sorted array of distinct integers, return the smallest sorted list of ranges that covers exactly the values present. A stretch of consecutive numbers a, a+1, …, b becomes "a->b"; a number with no consecutive neighbour stands alone as "a".'

export const constraints: string[] = [
  "0 <= nums.length <= 20 — the empty array is legal input and must come back as an empty list",
  "-2^31 <= nums[i] <= 2^31 - 1, so the VALUES can be astronomically far apart even when there are only a handful of them",
  "nums is sorted strictly ascending: already ordered, and no duplicates to skip",
  'a run of length one prints as the bare value, never as "x->x"',
  "the ranges come out in ascending order and together cover every value exactly once, with no value covered twice",
]

export const examples: Example[] = [
  {
    input: "nums = [0, 1, 2, 4, 5, 7]",
    output: '["0->2", "4->5", "7"]',
  },
  {
    input: "nums = [0, 2, 3, 4, 6, 8, 9]",
    output: '["0", "2->4", "6", "8->9"]',
    note: 'Three runs of length one. A version that always prints a->b turns 6 into "6->6" and fails here.',
  },
  {
    input: "nums = []",
    output: "[]",
    note: "The empty array is legal, so nothing may read nums[0] before checking there is one.",
  },
]
