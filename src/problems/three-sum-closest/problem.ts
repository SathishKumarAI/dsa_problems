// three-sum-closest — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "three-sum-closest"

export const title = "The Triple Nearest the Target"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "medium"

export const leetcode = "3sum-closest"

export const brief = "Three values whose sum lands as close to the target as possible."

export const statement = "Given an integer array and a target, pick three values at distinct positions and return their sum — choosing the triple whose sum sits closest to the target. You return the sum itself, not the triple."

export const constraints: string[] = [
  "3 <= nums.length <= 500, so there is always at least one triple and always an answer",
  "-1000 <= nums[i] <= 1000 and -10^4 <= target <= 10^4; a triple sum fits comfortably in a 32-bit int",
  "the three POSITIONS must be distinct, but the values may repeat — [0, 0, 0] is legal input and its only triple is the answer",
  "unlike 3Sum, duplicate values need no skipping: we want one number back, not a set of distinct triples, so seeing the same sum twice costs nothing but time",
  "when two different triples are equally close to the target we return the SMALLER sum. LeetCode promises the input has a unique answer; pinning the tie-break anyway is what lets five different implementations be compared against each other",
]

export const examples: Example[] = [
  {
    input: "nums = [-1, 2, 1, -4], target = 1",
    output: "2",
    note: "-1 + 2 + 1 = 2 misses by one; every other triple misses by more.",
  },
  {
    input: "nums = [-2, 0, 1, 3], target = 0",
    output: "-1",
    note: "-1 and 1 are both one away from 0. The tie-break sends it to the smaller sum — an implementation that keeps whichever it happened to see first will disagree depending on the order it scanned.",
  },
  {
    input: "nums = [1, 1, 1, 0], target = -100",
    output: "2",
    note: "The target is below every possible sum, so the answer is simply the smallest triple and no pointer ever gets to bracket anything.",
  },
]
