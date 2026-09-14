// merge-sorted-array — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "merge-sorted-array"

export const title = "Merge the Second Array Into the First"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "merge-sorted-array"

export const brief = "Two sorted arrays, one of them already big enough to hold both."

export const statement = "You are handed two arrays sorted in non-decreasing order. The first one is already the right size for the finished job: its first m slots hold its own values and the last n slots are padding. Fill it so it holds all m + n values in sorted order, and return it."

export const constraints: string[] = [
  "0 <= m, n <= 200 and 1 <= m + n; a has exactly m + n slots",
  "a's first m values and all n of b's are each already sorted non-decreasing",
  "the last n slots of a are padding you are free to overwrite — that spare room at the BACK is the whole trick, because writing forward from index 0 would land on a value of a that has not been placed yet, while writing backward only ever lands on padding or on a slot already read",
  "m = 0 (a is nothing but padding) and n = 0 (nothing to merge in) are both legal, and the second one must leave a alone rather than reading b at all",
  "values may repeat, within one array and across both — equal values are interchangeable, so ties can go either way",
]

export const examples: Example[] = [
  {
    input: "a = [1, 2, 3, 0, 0, 0], m = 3, b = [2, 5, 6], n = 3",
    output: "[1, 2, 2, 3, 5, 6]",
    note: "b's 5 and 6 are larger than everything in a, so the first two writes come straight off b's end and a's values never move.",
  },
  {
    input: "a = [1], m = 1, b = [], n = 0",
    output: "[1]",
    note: "There is no padding and nothing to merge — the loop must not run once.",
  },
  {
    input: "a = [0], m = 0, b = [1], n = 1",
    output: "[1]",
    note: "a is pure padding. The read index into a starts at -1 and must never be dereferenced.",
  },
]
