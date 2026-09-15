// non-overlapping-intervals — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "non-overlapping-intervals"

export const title = "Throw Away the Fewest to Stop the Clashes"

export const pattern = "intervals"

export const difficulty: Difficulty = "medium"

export const leetcode = "non-overlapping-intervals"

export const brief = "Remove as few intervals as possible so that none of the survivors overlap."

export const statement = "Given a list of intervals, return the minimum number you must remove so the rest are pairwise non-overlapping. Intervals that merely touch at an endpoint — [1,2] and [2,3] — do not overlap here, which is the opposite of the convention in the merging problems and is the detail most wrong answers trip on."

export const constraints: string[] = [
  "1 <= intervals.length <= 10^5, so anything quadratic in the number of intervals is out",
  "intervals[i] = [start, end] with start < end, so no interval is a single point",
  "touching does NOT overlap in this problem: [1,2] and [2,3] may both survive",
  "the input is unordered, and the answer is a COUNT rather than the surviving set — though the algorithm produces the set for free",
  "removing the fewest is the same question as keeping the most, and it is the keeping form that has the clean greedy rule",
]

export const examples: Example[] = [
  {
    input: "intervals = [[1,2],[2,3],[3,4],[1,3]]",
    output: "1",
    note: "Drop [1,3] and the other three chain end to end. Dropping anything else leaves a clash.",
  },
  {
    input: "intervals = [[1,2],[1,2],[1,2]]",
    output: "2",
    note: "Identical intervals all overlap each other, so only one can survive.",
  },
  {
    input: "intervals = [[1,2],[2,3]]",
    output: "0",
    note: "Touching is not overlapping. A comparison written <= instead of < answers 1 here.",
  },
]
