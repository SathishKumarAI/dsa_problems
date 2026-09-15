// subarray-sum-k — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "subarray-sum-k"

export const title = "How Many Subarrays Sum to k?"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "medium"

export const leetcode = "subarray-sum-equals-k"

export const brief = "Count the contiguous stretches adding up to k."

export const statement = "Given an integer array and a value k, count how many contiguous subarrays sum to exactly k. Overlapping ones count separately."

export const constraints: string[] = [
  "1 <= nums.length <= 2 * 10^4",
  "-1000 <= nums[i] <= 1000, and -10^7 <= k <= 10^7",
  "values may be NEGATIVE, which is why a sliding window does not work here — a growing window's sum is not monotonic",
  "the count includes overlapping subarrays, and a subarray must be non-empty",
]

export const examples: Example[] = [
  {
    input: "nums = [1, 1, 1], k = 2",
    output: "2",
    note: "[1,1] at the front and [1,1] at the back — overlapping, both counted.",
  },
  {
    input: "nums = [1, -1, 0], k = 0",
    output: "3",
    note: "[1,−1], [0] and [1,−1,0]. Negatives make the running total revisit values.",
  },
]
