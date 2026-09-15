// contiguous-array — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "contiguous-array"

export const title = "The Longest Stretch With as Many Ones as Zeroes"

export const pattern = "prefix-sums"

export const difficulty: Difficulty = "medium"

export const leetcode = "contiguous-array"

export const brief = "A binary array in, the length of the longest balanced stretch out."

export const statement = "Given a binary array, return the length of the longest contiguous stretch containing an equal number of zeroes and ones. The trick that unlocks it is a relabelling: count a zero as -1 and the question becomes the longest stretch that sums to zero — which is a prefix-sum question with a map, not a counting question."

export const constraints: string[] = [
  "1 <= nums.length <= 10^5, so the answer has to come from one pass with a map rather than from examining stretches",
  "nums[i] is 0 or 1 only, which is what makes the -1 relabelling exact rather than approximate",
  "the answer may be 0 when no balanced stretch exists, for instance on an array of all ones",
  "a balanced stretch always has even length, which is a useful sanity check and not something to rely on in the algorithm",
  "the whole array may be the answer, so the empty prefix has to be in the map before the scan starts",
]

export const examples: Example[] = [
  {
    input: "nums = [0,1]",
    output: "2",
    note: "The whole array is balanced. Getting this requires the empty prefix to be recorded at index -1.",
  },
  {
    input: "nums = [0,1,0]",
    output: "2",
    note: "Two different stretches of length 2 qualify; the answer is the length, so either will do.",
  },
  {
    input: "nums = [0,0,1,0,0,0,1,1]",
    output: "6",
    note: "The balanced stretch starts partway in, so any solution anchored at index 0 gets this wrong.",
  },
]
