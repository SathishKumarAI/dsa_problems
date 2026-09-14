// first-missing-positive — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "first-missing-positive"

export const title = "The Smallest Positive That Is Missing"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "hard"

export const leetcode = "first-missing-positive"

export const brief = "The smallest positive integer absent from the array, in O(n) time and O(1) extra space."

export const statement = "Given an unsorted integer array, return the smallest positive integer (1, 2, 3, …) that does not appear in it. Zeroes and negatives may be present but can never be the answer. The follow-up — and the whole difficulty — is doing it in linear time with only a constant amount of extra memory."

export const constraints: string[] = [
  "1 <= nums.length <= 10^5",
  "-2^31 <= nums[i] <= 2^31 - 1 — zeroes, negatives and duplicates are all allowed",
  "the answer always lies in 1..n+1, because n values can cover at most n consecutive positives",
  "any value <= 0 or > n is noise: it can never be the answer and it never blocks one",
  "O(n) time AND O(1) extra space is the requirement — a hash set is a correct answer that fails the follow-up",
  "the input array may be modified; nothing promises it comes back intact",
]

export const examples: Example[] = [
  { input: "nums = [1, 2, 0]", output: "3" },
  {
    input: "nums = [3, 4, -1, 1]",
    output: "2",
    note: "The answer is a hole in the middle, not one past the end — a solution that only extends the longest run misses it.",
  },
  {
    input: "nums = [7, 8, 9, 11, 12]",
    output: "1",
    note: "Nothing in 1..n is present at all. Every value is noise and the answer is the very first candidate.",
  },
]
