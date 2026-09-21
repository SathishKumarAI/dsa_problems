// subarray-sum-k — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "subarray-sum-k"

export const title = "How Many Subarrays Sum to k?"

export const pattern = "prefix-sums"

export const difficulty: Difficulty = "medium"

export const leetcode = "subarray-sum-equals-k"

export const brief = "Count the contiguous stretches adding up to k."

export const statement =
  "Given an integer array and a value k, count how many contiguous subarrays sum to exactly k. Overlapping ones count separately."

export const constraints: string[] = [
  "1 <= nums.length <= 2 * 10^4",
  "-1000 <= nums[i] <= 1000, and -10^7 <= k <= 10^7",
  "values may be NEGATIVE, which is why a sliding window does not work here — a growing window's sum is not monotonic",
  "the count includes overlapping subarrays, and a subarray must be non-empty",
]

export const examples: Example[] = [
  {
    input: "nums = [1, 1, 1], k = 2",
    output: "2",
    note: "[1,1] at the front and [1,1] at the back — overlapping, both counted.",
  },
  {
    input: "nums = [1, -1, 0], k = 0",
    output: "3",
    note: "[1,−1], [0] and [1,−1,0]. Negatives make the running total revisit values.",
  },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "1 <= nums.length <= 2 * 10^4",
    what: "Twenty thousand elements. Every subarray is about 2\u00b710\u2078 of them, and summing each one as you go makes the brute rung roughly that many additions \u2014 seconds. The prefix-pair rung is the same count of comparisons. Only the one-pass map rung is linear, and at this size that is the difference between a solution and a timeout.",
    figure: {
      kind: "quantities",
      unit: "ops",
      items: [
        { label: "every subarray", value: 2e8, tone: "bad" },
        { label: "one pass with a map", value: 2e4, tone: "good" },
      ],
    },
  },
  {
    constraint: "-1000 <= nums[i] <= 1000, and -10^7 <= k <= 10^7",
    what: "k can be NEGATIVE, and so can the values \u2014 which together rule out every argument that depends on sums growing. The running total is bounded by 2\u00b710\u2077 in magnitude, comfortably inside a 32-bit integer, so the count rather than the sum is what needs care in the translations.",
  },
  {
    constraint:
      "values may be NEGATIVE, which is why a sliding window does not work here — a growing window's sum is not monotonic",
    what: "The constraint that decides the whole page, and the reason a window rung sits on the ladder as a FAILURE. A window shrinks from the left when the sum is too large; with negatives, a sum that is too large now can become correct by growing, so there is no rule for which edge to move. Read this line before reaching for the window this problem\u2019s shape suggests.",
    figure: {
      kind: "cells",
      values: ["1", "-1", "0"],
      caption:
        "k = 0. The answer is 3 \u2014 [1,\u22121], [\u22121,\u2026,0] and [0] \u2014 and a window that shrinks on an over-large sum finds only one of them.",
    },
  },
  {
    constraint:
      "the count includes overlapping subarrays, and a subarray must be non-empty",
    what: "Overlapping is what makes this a counting problem rather than a packing one: [1, 1, 1] with k = 2 answers 2, not 1. Non-empty is the detail that decides the map\u2019s seed \u2014 the prefix sum 0 is seeded with one occurrence so that a subarray starting at index 0 counts, and seeding it with zero occurrences silently loses exactly those.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "nums = [1, 1, 1], k = 2. What is the answer?",
    options: ["1", "2", "3", "0"],
    answer: 1,
    because:
      "Both [1, 1] windows count \u2014 indices 0..1 and 1..2 \u2014 because overlapping subarrays are included. Counting this one by hand is what makes the question concrete before any approach is chosen.",
  },
  {
    ask: "Why does a sliding window fail here when it works on the same question with non-negative values?",
    options: [
      "Because k may be negative",
      "Because a growing window\u2019s sum is not monotonic with negatives, so there is no rule for which edge to move",
      "Because the array is not sorted",
      "Because subarrays may overlap",
    ],
    answer: 1,
    because:
      "A window rests on the sum only ever moving one way as the window grows. Add a negative value and a sum that is too large can become correct by growing, which leaves the shrink rule with nothing to stand on.",
  },
  {
    ask: "Walking the array with running totals, what question does each index ask the map?",
    options: [
      "How many times has this exact value appeared?",
      "How many earlier prefix sums equal (running total \u2212 k)?",
      "What is the largest prefix sum so far?",
      "How many subarrays have I already counted?",
    ],
    answer: 1,
    because:
      "A subarray ending here sums to k exactly when the prefix before it equals running \u2212 k. Counting how many such prefixes exist counts all of those subarrays at once, which is what turns a pairwise comparison into a single lookup.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Subarray Sum Equals K \u2014 NeetCode",
    href: "https://neetcode.io/problems/subarray-sum-equals-k",
    kind: "course",
    note: "The prefix-sum map built step by step, including why the map is seeded with one occurrence of 0.",
  },
  {
    title: "Number of subarrays with sum exactly k \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/number-subarrays-sum-exactly-equal-k/",
    kind: "reference",
    note: "The same three rungs, with the negative-values case called out as the reason the window variant is listed separately.",
  },
]
