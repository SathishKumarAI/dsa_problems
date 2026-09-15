// burst-balloons-arrows — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "burst-balloons-arrows"

export const title = "The Fewest Arrows to Pop Every Balloon"

export const pattern = "intervals"

export const difficulty: Difficulty = "medium"

export const leetcode = "minimum-number-of-arrows-to-burst-balloons"

export const brief = "Each balloon spans a stretch; one arrow pops everything it passes through."

export const statement = "Balloons are given as horizontal stretches [start, end]. An arrow shot straight up at position x bursts every balloon whose stretch contains x, endpoints included. Return the smallest number of arrows that bursts them all. This is interval scheduling's twin: instead of keeping the most non-overlapping intervals, you are covering all of them with the fewest points."

export const constraints: string[] = [
  "1 <= points.length <= 10^5, so the answer has to come out of one sort and one pass",
  "points[i] = [start, end] with start <= end, and the coordinates run the full 32-bit signed range",
  "the endpoints count: an arrow at exactly end bursts that balloon, so overlap here is <= and not <",
  "balloons arrive unordered and may be nested, identical, or disjoint",
  "the coordinates can be far apart and negative, so any answer that walks the number line rather than the list is not an answer",
]

export const examples: Example[] = [
  {
    input: "points = [[10,16],[2,8],[1,6],[7,12]]",
    output: "2",
    note: "One arrow at 6 takes [1,6] and [2,8]; one at 12 takes [7,12] and [10,16].",
  },
  {
    input: "points = [[1,2],[3,4],[5,6],[7,8]]",
    output: "4",
    note: "Nothing overlaps, so every balloon costs its own arrow. The greedy rule must not merge disjoint stretches.",
  },
  {
    input: "points = [[1,2],[2,3],[3,4],[4,5]]",
    output: "2",
    note: "Touching balloons share an endpoint and can be burst together — an arrow at 2 and one at 4.",
  },
]
