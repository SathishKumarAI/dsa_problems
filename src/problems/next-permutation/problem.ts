// next-permutation — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "next-permutation"

export const title = "The Next Arrangement in Order"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "medium"

export const leetcode = "next-permutation"

export const brief = "Rearrange the numbers into the very next arrangement, counting upward."

export const statement = "List every arrangement of the given numbers in increasing order, as if each arrangement were a number read left to right. Return the one that comes immediately after the array you were handed."

export const constraints: string[] = [
  "1 <= nums.length <= 100, and 0 <= nums[i] <= 100",
  "the answer uses exactly the same multiset of values — this is a rearrangement, never a substitution",
  "a fully descending array is the LAST arrangement, so it has no successor and wraps around to the sorted-ascending first one",
  "duplicates are allowed, and two arrangements that read the same are the same arrangement — [1,1,5] is followed by [1,5,1], not by another [1,1,5]",
  "a single element is both the first and last arrangement, so it comes back unchanged",
  "the rearrangement happens in place, using only a constant amount of extra room",
]

export const examples: Example[] = [
  { input: "nums = [1, 2, 3]", output: "[1, 3, 2]" },
  {
    input: "nums = [3, 2, 1]",
    output: "[1, 2, 3]",
    note: "The wrap. Nothing is larger, so the sequence starts over at the smallest arrangement — a solution that only knows how to step forward returns nothing here.",
  },
  {
    input: "nums = [1, 3, 5, 4, 2]",
    output: "[1, 4, 2, 3, 5]",
    note: "Only the tail from index 1 changes, and it comes back ascending rather than merely swapped.",
  },
]
