// find-all-duplicates — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "find-all-duplicates"

export const title = "Every Value That Appears Twice"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "medium"

export const leetcode = "find-all-duplicates-in-an-array"

export const brief = "Values are 1..n in an array of length n — report the ones that show up twice."

export const statement = "An array of length n holds values between 1 and n. Each of those values appears either once or twice. Return every value that appears twice. The follow-up asks for linear time with no extra array."

export const constraints: string[] = [
  "n == nums.length, 1 <= n <= 10^5",
  "1 <= nums[i] <= n — every value is a legal index of the array, which is the whole trick",
  "a value appears once or twice, never three times, so one flag per value is enough to decide",
  "the answer may be empty (nothing repeats), and the order of the values in it is not part of the answer",
  "n may be 1, where the only legal array is [1] and the answer is empty",
]

export const examples: Example[] = [
  { input: "nums = [4, 3, 2, 7, 8, 2, 3, 1]", output: "[2, 3]" },
  {
    input: "nums = [1]",
    output: "[]",
    note: "The smallest legal input, and the one that catches a loop starting at index 1 or comparing nums[i] with nums[i - 1] without a guard.",
  },
  { input: "nums = [2, 2]", output: "[2]" },
]
