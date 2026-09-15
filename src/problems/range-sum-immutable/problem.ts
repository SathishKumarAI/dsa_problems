// range-sum-immutable — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "range-sum-immutable"

export const title = "Answer Any Range in One Subtraction"

export const pattern = "prefix-sums"

export const difficulty: Difficulty = "easy"

export const leetcode = "range-sum-query-immutable"

export const brief = "Many sum-between-i-and-j queries over an array that never changes."

export const statement = "Given an array that will never be modified, answer many queries of the form: what is the sum of the values from index left to index right, inclusive? The array being immutable is the whole licence for the answer — it is what makes it safe to precompute totals once and never revisit them."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4 and up to 10^4 queries, so a per-query walk is 10^8 additions while precomputing is 2 * 10^4",
  "-10^5 <= nums[i] <= 10^5, so the running totals can be large and negative — no assumption of growth survives",
  "0 <= left <= right < nums.length, and both ends are INCLUSIVE, which is where the +1 in the formula comes from",
  "the array is immutable, which is what makes precomputation safe; a single update would invalidate every total after it",
  "the queries arrive after construction, so the cost model is build once and answer many — the shape that justifies the extra memory",
]

export const examples: Example[] = [
  {
    input: "nums = [-2,0,3,-5,2,-1], sumRange(0,2)",
    output: "1",
    note: "-2 + 0 + 3. Both ends included.",
  },
  {
    input: "nums = [-2,0,3,-5,2,-1], sumRange(2,5)",
    output: "-1",
    note: "A range that starts partway in is where the subtraction earns its keep.",
  },
  {
    input: "nums = [-2,0,3,-5,2,-1], sumRange(0,5)",
    output: "-3",
    note: "The whole array, which is the case that catches a prefix array sized without its extra leading zero.",
  },
]
