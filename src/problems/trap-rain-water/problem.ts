// trap-rain-water — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "trap-rain-water"

export const title = "Water Held by an Elevation Map"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "hard"

export const leetcode = "trapping-rain-water"

export const brief = "Total rain trapped between the bars of a skyline."

export const statement =
  "Given an array where each entry is the height of a bar of width 1, compute how many units of water are trapped between the bars after it rains."

export const constraints: string[] = [
  "1 <= height.length <= 2 * 10^4",
  "0 <= height[i] <= 10^5",
  "water can only rest where a taller bar stands on BOTH sides — the two ends never hold any",
  "a strictly increasing or strictly decreasing map traps nothing, whatever its size",
]

export const examples: Example[] = [
  {
    input: "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
    output: "6",
    note: "Six unit squares of water sit in the dips.",
  },
  {
    input: "height = [4, 2, 3]",
    output: "1",
    note: "The single dip at index 1 holds min(4, 3) − 2 = 1.",
  },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "1 <= height.length <= 2 * 10^4",
    what: "Twenty thousand bars puts the per-column rung at about 4\u00b710\u2078 operations \u2014 seconds, for a single number. That is what rules it out, and it is worth noticing that the fix is not a faster inner loop: the per-column rung recomputes the same two maxima for every column, so the win comes from computing each of them ONCE.",
    figure: {
      kind: "quantities",
      unit: "ops",
      items: [
        { label: "scan both sides per column", value: 4e8, tone: "bad" },
        { label: "three passes, precomputed maxima", value: 6e4, tone: "good" },
        { label: "one pass, two pointers", value: 2e4, tone: "good" },
      ],
    },
  },
  {
    constraint: "0 <= height[i] <= 10^5",
    what: "Bars can be ZERO high, which is the flat ground every worked example quietly assumes, and heights can differ by five orders of magnitude, which is what makes the arithmetic worth watching: total water at this ceiling is up to about 10^9, still inside a 32-bit integer, but only just. In Java and C++ the running total wants a long the moment the constraints loosen.",
  },
  {
    constraint:
      "water can only rest where a taller bar stands on BOTH sides \u2014 the two ends never hold any",
    what: "The physical rule, and the whole algorithm in one line: the water above column i is min(tallest to the left, tallest to the right) \u2212 height[i], floored at zero. Every rung on this page computes those two maxima; they differ only in how much work they repeat doing it.",
    figure: {
      kind: "cells",
      values: ["2", "0", "2"],
      caption:
        "the middle column holds min(2, 2) \u2212 0 = 2 units. Remove either outer bar and it holds nothing.",
    },
  },
  {
    constraint:
      "a strictly increasing or strictly decreasing map traps nothing, whatever its size",
    what: "The case that should be RUN rather than reasoned about, because it is the shape where an off-by-one hides: on a monotone map every column has one side with no taller bar, so the answer is zero however many bars there are. If your solution returns anything but zero on [1, 2, 3, 4, 5], the bug is in the maximum on one side, not in the water formula.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "How much water rests above a single column i?",
    options: [
      "The tallest bar in the whole array, minus height[i]",
      "min(tallest to its left, tallest to its right) \u2212 height[i], never below zero",
      "The average of its two neighbours, minus height[i]",
      "height[i] subtracted from its taller neighbour",
    ],
    answer: 1,
    because:
      "Water is held by the lower of the two walls that contain it, and a column taller than that level holds none \u2014 which is why the floor at zero is part of the formula and not an implementation detail.",
  },
  {
    ask: "height = [1, 2, 3, 4, 5]. How much water is trapped?",
    options: ["10", "4", "0", "1"],
    answer: 2,
    because:
      "The constraints say a strictly increasing map traps nothing: every column has no taller bar to its left, so its left maximum is itself and the water is zero. This is the case that catches an off-by-one in the maxima.",
  },
  {
    ask: "The per-column approach rescans both sides for every column. What exactly is it repeating?",
    options: [
      "The subtraction",
      "The maximum on each side, which does not change between columns except at the edges",
      "The comparison to zero",
      "Reading the array, which cannot be avoided",
    ],
    answer: 1,
    because:
      "The left maximum for column i+1 is either the left maximum for column i or height[i] \u2014 one comparison, not a scan. Noticing that a recomputed value has a one-step recurrence is the move that turns O(n\u00b2) into O(n) here and in the whole prefix-sums family.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Trapping Rain Water \u2014 NeetCode",
    href: "https://neetcode.io/problems/trapping-rain-water",
    kind: "course",
    note: "The two-pointer argument drawn, which is the one rung where a picture genuinely beats a paragraph.",
  },
  {
    title: "Trapping rain water \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/trapping-rain-water/",
    kind: "reference",
    note: "All four rungs written out, including the stack solution this page does not carry \u2014 worth reading after the two-pointer one, as a second shape for the same invariant.",
  },
]
