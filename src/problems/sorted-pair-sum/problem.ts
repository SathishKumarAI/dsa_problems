// sorted-pair-sum — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "sorted-pair-sum"

export const title = "Pair Sum in Sorted Array"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "two-sum-ii-input-array-is-sorted"

export const brief =
  "Two values in a sorted array that add to a target — O(1) space."

export const statement =
  "Given an array sorted in non-decreasing order and a target, return the indices of two distinct elements that sum to target, using constant extra space. Assume exactly one answer exists."

export const constraints: string[] = [
  "2 <= numbers.length <= 3 * 10^4",
  "-1000 <= numbers[i] <= 1000",
  "numbers is sorted ascending",
  "exactly one solution exists and an element may not be used twice; O(1) extra space is required",
]

export const examples: Example[] = [
  {
    input: "nums = [1, 3, 6, 9], target = 12",
    output: "[1, 3]",
    note: "3 + 9 = 12.",
  },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md).

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "2 <= numbers.length <= 3 * 10^4",
    what: "Thirty thousand elements makes every pair about 4.5\u00b710\u2078 checks: slow, not impossible. So this bound alone does not kill the quadratic answer \u2014 the O(1) space line below does. Two constraints, two different jobs.",
    figure: {
      kind: "quantities",
      unit: "ops",
      items: [
        { label: "every pair", value: 4.5e8, tone: "bad" },
        { label: "one converging sweep", value: 3e4, tone: "good" },
      ],
    },
  },
  {
    constraint: "-1000 <= numbers[i] <= 1000",
    what: "Only 2001 distinct values. A counting array over that range would be O(1) space by the letter — and would lose the indices the answer is made of. Notice it, then leave it.",
  },
  {
    constraint: "numbers is sorted ascending",
    what: "The line everything rests on. If the two ends sum too small, nothing paired with the left end can ever be big enough, so the left end is finished — one comparison retires a whole row of pairs. Take this line away and you are solving the unsorted sibling.",
  },
  {
    constraint:
      "exactly one solution exists and an element may not be used twice; O(1) extra space is required",
    what: "The real constraint on this page. It forbids the one-pass hash map that solves the unsorted version, and leaves one door open: a method whose whole state is two indices. The problem is naming its own answer.",
    figure: {
      kind: "quantities",
      items: [
        { label: "a map of every value seen", value: 3e4, tone: "bad" },
        { label: "two indices", value: 2, tone: "good" },
      ],
    },
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "numbers = [1, 3, 6, 9], target = 12. The ends sum to 1 + 9 = 10, which is too small. Which element is now finished?",
    options: [
      "The 9, because it is the largest",
      "The 1, because even with the largest value available it cannot reach the target",
      "Neither \u2014 both must stay",
      "Both \u2014 the answer is not at the ends",
    ],
    answer: 1,
    because:
      "The array is ascending, so 9 is the largest partner the 1 will ever have. If 1 + 9 falls short, every other pair containing the 1 falls shorter still. That is the whole argument: a comparison at the ends retires an element permanently.",
  },
  {
    ask: "What does the O(1) extra space requirement rule out?",
    options: [
      "Sorting the array first",
      "Returning two indices",
      "Remembering every value you have passed, in a map",
      "Reading the array more than once",
    ],
    answer: 2,
    because:
      "The one-pass map solution to the unsorted version stores up to n values. That is O(n) space, which this statement forbids \u2014 and forbidding it is how the problem points at the technique it wants.",
  },
  {
    ask: "If the array were NOT sorted, what would break?",
    options: [
      "Nothing \u2014 the walk still works",
      "Only the running time, not the correctness",
      "The discard rule: a sum being too small would no longer prove the left element is finished",
      "The indices would come back in the wrong order",
    ],
    answer: 2,
    because:
      "Every step of the walk is justified by order. On unsorted input a small sum says nothing about what the left element might pair with later, so the pointer that moves is a guess and the answer can be missed entirely.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Two Integer Sum II \u2014 NeetCode",
    href: "https://neetcode.io/problems/two-integer-sum-ii",
    kind: "course",
    note: "The sorted variant specifically, and the one-based indexing trap that LeetCode adds to it.",
  },
  {
    title: "Two pointers technique \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/two-pointers-technique/",
    kind: "reference",
    note: "The general move, with the termination argument stated plainly: the gap shrinks every iteration, so the walk always ends.",
  },
]
