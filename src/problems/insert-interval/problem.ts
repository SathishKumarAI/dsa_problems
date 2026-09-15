// insert-interval — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "insert-interval"

export const title = "Slot One Interval into a Sorted Cover"

export const pattern = "intervals"

export const difficulty: Difficulty = "medium"

export const leetcode = "insert-interval"

export const brief = "An already-merged list plus one newcomer, back to a merged list — without re-sorting."

export const statement = "You are given a list of non-overlapping intervals sorted by start, and one new interval. Insert it and return the list still sorted and still non-overlapping, merging wherever the newcomer bridges existing intervals. The input's order and disjointness are promises you are meant to spend, not re-establish."

export const constraints: string[] = [
  "0 <= intervals.length <= 10^4, and the empty list is legal — the answer is then the new interval alone",
  "intervals is sorted by start AND pairwise non-overlapping, which is the guarantee that makes a single linear pass possible",
  "newInterval = [start, end] with start <= end, and it may sit before everything, after everything, inside one interval, or span many",
  "the new interval can swallow the entire list, so the answer's length ranges from 1 to intervals.length + 1",
  "touching counts as overlapping: inserting [4,8] into a list holding [1,4] produces [1,8], not two intervals",
]

export const examples: Example[] = [
  {
    input: "intervals = [[1,3],[6,9]], newInterval = [2,5]",
    output: "[[1,5],[6,9]]",
    note: "The newcomer overlaps the first interval only. [6,9] is untouched because 6 > 5.",
  },
  {
    input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
    output: "[[1,2],[3,10],[12,16]]",
    note: "The newcomer bridges three intervals at once. Merging with only the first one it meets gets this wrong.",
  },
  {
    input: "intervals = [], newInterval = [5,7]",
    output: "[[5,7]]",
    note: "The empty list is legal input and every phase of the scan has to survive it.",
  },
]
