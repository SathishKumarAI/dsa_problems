// container-water — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "container-water"

export const title = "Widest Container"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "medium"

export const leetcode = "container-with-most-water"

export const brief = "Pick two lines that hold the most water between them."

export const statement =
  "Given an array heights where heights[i] is the height of a vertical line at position i, choose two lines so the area between them (width × shorter height) is maximised. Return that area."

export const constraints: string[] = [
  "2 <= height.length <= 10^5",
  "0 <= height[i] <= 10^4",
  "the container is capped by the shorter line and widened by the distance between them",
  "the lines are vertical: nothing between them affects the area",
]

export const examples: Example[] = [
  {
    input: "heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
    output: "49",
    note: "Lines of height 8 and 7, seven apart: 7 × 7 = 49.",
  },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md). What each bound BUYS, the
// questions to answer before solving, and where to read further.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "2 <= height.length <= 10^5",
    what: "A hundred thousand lines makes every pair about 5\u00b710\u2079 area calculations \u2014 seconds of work for one number. THIS is the bound that rules the quadratic rung out, and it is the reason the greedy argument below has to be proved rather than merely believed: there is no fallback if it is wrong.",
    figure: {
      kind: "quantities",
      unit: "ops",
      items: [
        { label: "every pair", value: 5e9, tone: "bad" },
        { label: "one sweep, two pointers", value: 1e5, tone: "good" },
      ],
    },
  },
  {
    constraint: "0 <= height[i] <= 10^4",
    what: "A line may be ZERO high, which is the case most first drafts never test: a zero-height wall caps the area at zero however far away the other one is. It is also what makes the greedy rule safe to state without a tie-break \u2014 a zero is always the shorter wall, so it is always the one that moves.",
    figure: {
      kind: "cells",
      values: ["0", "5", "0"],
      caption:
        "every pair here holds nothing: the shorter wall is 0, and 0 \u00d7 any width is 0. The answer is 0, not 5.",
    },
  },
  {
    constraint:
      "the container is capped by the shorter line and widened by the distance between them",
    what: "The whole problem in one line, and the source of the only argument that matters: area = (j \u2212 i) \u00d7 min(h[i], h[j]). Because the MINIMUM caps it, moving the taller wall inward can never help \u2014 the width shrinks and the height is still capped by the same short wall. Moving the shorter one is the only move that can improve anything, which is exactly why discarding it is safe.",
  },
  {
    constraint: "the lines are vertical: nothing between them affects the area",
    what: "The line that separates this problem from trapping rain water, which looks identical and is not. Here the water spans BETWEEN two chosen lines and the terrain in the middle is ignored; there, every bar in between holds its own water and the middle is the whole question. Read this constraint before reaching for a remembered solution.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]. What is the area between the two 8s, at indices 1 and 6?",
    options: ["48", "40", "56", "8"],
    answer: 1,
    because:
      "Width is 6 \u2212 1 = 5 and the shorter wall is 8, so the area is 40. Getting this by hand once is what makes the formula \u2014 distance times the SHORTER height \u2014 stick before any approach is chosen.",
  },
  {
    ask: "Does a line taller than both chosen walls, sitting between them, change the answer?",
    options: [
      "Yes \u2014 it splits the container in two",
      "Yes \u2014 it raises the water level",
      "No \u2014 only the two chosen lines matter",
      "Only if it is exactly in the middle",
    ],
    answer: 2,
    because:
      "The constraints say the lines are vertical and nothing between them affects the area. That is what makes this a two-pointer problem rather than trapping rain water, where the middle is the entire question.",
  },
  {
    ask: "Two walls, one shorter than the other. Why is it safe to discard the SHORTER one?",
    options: [
      "Because the taller one will pair better with something further away",
      "Because every remaining pair with the shorter wall is narrower and still capped by it, so none can beat the area just measured",
      "Because the array is sorted",
      "It is not safe \u2014 the sweep is a heuristic",
    ],
    answer: 1,
    because:
      "This is the exchange argument the whole rung rests on. Keeping the short wall means pairing it with lines strictly closer to it: the width shrinks and the height is still capped by that same wall, so no such pair beats the one already recorded. If you cannot say this sentence, the loop is a guess.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Max Water Container \u2014 NeetCode",
    href: "https://neetcode.io/problems/max-water-container",
    kind: "course",
    note: "The same two rungs on video. Worth it for the animation of the discard, which is the part a static page argues and a picture shows.",
  },
  {
    title: "Container with most water \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/container-with-most-water/",
    kind: "reference",
    note: "The same greedy proof written out a second way, in four languages \u2014 useful when the exchange argument has not clicked yet.",
  },
]
