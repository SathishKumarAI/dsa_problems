// intersection-of-arrays — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "intersection-of-arrays"

export const title = "What Both Arrays Hold"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "easy"

export const leetcode = "intersection-of-two-arrays-ii"

export const brief = "The values two arrays share, each repeated as many times as both can supply."

export const statement = "Given two integer arrays, return the values they have in common. A value appears in the answer as many times as it appears in BOTH arrays — three 1s on the left and two on the right yield two 1s, not one and not five. Neither array is sorted, and either may repeat values."

export const constraints: string[] = [
  "1 <= nums1.length, nums2.length <= 1000",
  "0 <= nums1[i], nums2[i] <= 1000",
  "the multiplicity of a value in the answer is min(its count in nums1, its count in nums2) — this is a counting problem, not a membership problem",
  "neither array is sorted, and both may hold duplicates",
  "the judge accepts any order; this repo returns the answer ascending so there is exactly one canonical result to compare against",
  "the follow-up is the real lesson: if nums2 is enormous and can only be streamed past once, the extra memory has to be bounded by the SMALLER array",
]

export const examples: Example[] = [
  { input: "nums1 = [1, 2, 2, 1], nums2 = [2, 2]", output: "[2, 2]" },
  {
    input: "nums1 = [4, 9, 5], nums2 = [9, 4, 9, 8, 4]",
    output: "[4, 9]",
    note: "9 appears twice on the right but once on the left, so it appears once in the answer — a set-based solution that only asks 'is it present?' gets [4, 9] here by luck and gets [1] for [1,1,1] against [1,1].",
  },
  {
    input: "nums1 = [1], nums2 = [2]",
    output: "[]",
    note: "The smallest legal input, and the empty answer that a loop assuming at least one match will trip over.",
  },
]
