// merge-intervals — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "merge-intervals"

export const title = "Fold the Overlapping Stretches Together"

export const pattern = "intervals"

export const difficulty: Difficulty = "medium"

export const leetcode = "merge-intervals"

export const brief = "Intervals in any order in, the fewest non-overlapping intervals covering the same points out."

export const statement = "Given a list of intervals, each written [start, end], merge every group that overlaps and return the smallest list of non-overlapping intervals that covers exactly the same points. Two intervals that merely touch at an endpoint — [1,4] and [4,5] — count as overlapping here, because together they cover an unbroken stretch."

export const constraints: string[] = [
  "1 <= intervals.length <= 10^4, so an O(n^2) pass over pairs is 10^8 comparisons and too slow",
  "intervals[i] = [start, end] with start <= end — a zero-length interval [3,3] is legal and covers exactly one point",
  "the input arrives in NO particular order, which is the whole difficulty: overlapping intervals can sit at opposite ends of the list",
  "0 <= start <= end <= 10^4 in the usual version, but nothing about the answer depends on that bound — treat the coordinates as arbitrary",
  "the output must itself be sorted and non-overlapping, so the answer is a canonical form and not merely a correct cover",
]

export const examples: Example[] = [
  {
    input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    output: "[[1,6],[8,10],[15,18]]",
    note: "[1,3] and [2,6] overlap and become [1,6]. Nothing reaches 8, so a new stretch starts there.",
  },
  {
    input: "intervals = [[1,4],[4,5]]",
    output: "[[1,5]]",
    note: "Touching counts. A merge test written with a strict < instead of <= returns both intervals and fails here.",
  },
  {
    input: "intervals = [[1,4],[2,3]]",
    output: "[[1,4]]",
    note: "The second interval is swallowed whole. Taking the new end unconditionally gives [1,3] — the single most common bug on this problem.",
  },
]
