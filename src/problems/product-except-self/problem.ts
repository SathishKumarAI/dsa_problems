// product-except-self — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "product-except-self"

export const title = "Product of Everything Else"

export const pattern = "prefix-sums"

export const difficulty: Difficulty = "medium"

export const leetcode = "product-of-array-except-self"

export const brief =
  "Each position gets the product of all the others — no division."

export const statement =
  "Given an integer array, return an array where each position holds the product of every element except the one at that position. Solve it without using division, in linear time."

export const constraints: string[] = [
  "2 <= nums.length <= 10^5",
  "-30 <= nums[i] <= 30",
  "every answer is guaranteed to fit in a 32-bit integer",
  "division is off the table — which matters most precisely because the array may contain zeros",
]

export const examples: Example[] = [
  { input: "nums = [1, 2, 3, 4]", output: "[24, 12, 8, 6]" },
  {
    input: "nums = [-1, 1, 0, -3, 3]",
    output: "[0, 0, 9, 0, 0]",
    note: "A single zero makes every other answer zero.",
  },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "2 <= nums.length <= 10^5",
    what: "A hundred thousand elements makes the naive rung \u2014 a product of the other n\u22121 values per index \u2014 about 10^10 multiplications, which is the bound that rules it out outright. It also rules out anything that recomputes a product it has already computed, which is the single idea the whole page turns on.",
    figure: {
      kind: "quantities",
      unit: "ops",
      items: [
        { label: "product of the others, per index", value: 1e10, tone: "bad" },
        { label: "two sweeps", value: 2e5, tone: "good" },
      ],
    },
  },
  {
    constraint: "-30 <= nums[i] <= 30",
    what: "A deliberately tight value range, and it is doing real work: it is what keeps the products inside a 32-bit integer for the guaranteed cases. Take the constraint away and the same code overflows \u2014 this repo measured that directly: timing this problem at n = 10\u2075 with values in \u221230..30 never returned, because an input that violates the bound produces numbers with tens of thousands of digits.",
  },
  {
    constraint: "every answer is guaranteed to fit in a 32-bit integer",
    what: "A promise about the OUTPUT, not the input, and it is narrower than it looks: it says each answer fits, not that the total product does. An approach that multiplies everything and then divides can overflow on the way even when every answer would have fit.",
  },
  {
    constraint:
      "division is off the table \u2014 which matters most precisely because the array may contain zeros",
    what: "Two reasons stacked, and the second is the interesting one. Division is forbidden by the statement, and it would be fragile anyway: one zero makes the total product zero and every quotient meaningless, and the special-casing (zero zeros, one zero, two or more) is three branches that the prefix/suffix sweeps never need.",
    figure: {
      kind: "cells",
      values: ["1", "0", "3", "0"],
      caption:
        "two zeros: every answer is 0. One zero and only its own slot is non-zero \u2014 the branching a division solution needs, and the sweeps do not.",
    },
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "nums = [1, 2, 3, 4]. What is the answer at index 1?",
    options: ["24", "12", "8", "6"],
    answer: 1,
    because:
      "Everything except the 2, which is 1 \u00d7 3 \u00d7 4 = 12. Working one entry by hand fixes what the question is: a product of two SIDES, which is what makes a prefix sweep and a suffix sweep the natural shape.",
  },
  {
    ask: "nums = [1, 0, 3, 0]. What is the answer?",
    options: [
      "[0, 0, 0, 0]",
      "[0, 0, 0, 3]",
      "[0, 3, 0, 0]",
      "An error \u2014 division by zero",
    ],
    answer: 0,
    because:
      "Every index has at least one zero among the OTHER elements, so every answer is zero. With a single zero only that index would be non-zero \u2014 and having to distinguish those two cases is exactly the branching that a divide-the-total approach forces on you.",
  },
  {
    ask: "Why is the output array not counted against the O(1) space claim?",
    options: [
      "Because it is small",
      "Because the problem requires it to exist \u2014 space bounds count EXTRA space, beyond the input and the required output",
      "Because it is written once",
      "It is counted, and the claim is wrong",
    ],
    answer: 1,
    because:
      "This is a convention worth stating rather than absorbing: the answer has to go somewhere. The claim is that nothing ELSE of size n is allocated, which is what makes the two-sweep rung beat the two-prefix-array one.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Products of Array Discluding Self \u2014 NeetCode",
    href: "https://neetcode.io/problems/products-of-array-discluding-self",
    kind: "course",
    note: "The two sweeps drawn, with the suffix pass carried in a single variable \u2014 the step that drops the space from O(n) to O(1).",
  },
  {
    title: "A product array puzzle \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/a-product-array-puzzle/",
    kind: "reference",
    note: "Includes the division solution with all three zero cases written out, which is the clearest argument for not using it.",
  },
]
