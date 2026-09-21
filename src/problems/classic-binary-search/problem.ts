// classic-binary-search — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "classic-binary-search"

export const title = "Find a Target in Sorted Array"

export const pattern = "binary-search"

export const difficulty: Difficulty = "easy"

export const leetcode = "binary-search"

export const brief = "Index of target in a sorted array, or -1."

export const statement =
  "Given a sorted integer array and a target, return the target's index or -1 if absent. Must run in O(log n)."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4",
  "-10^4 <= nums[i], target <= 10^4",
  "nums is sorted ascending and every value is distinct",
  "return -1 when the target is absent",
]

export const examples: Example[] = [
  { input: "nums = [-3, 0, 4, 9, 12], target = 9", output: "3" },
  { input: "nums = [-3, 0, 4, 9, 12], target = 2", output: "-1" },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "1 <= nums.length <= 10^4",
    what: "Ten thousand elements is 14 halvings \u2014 log\u2082(10\u2074) \u2248 13.3 \u2014 against 10\u2074 comparisons for a scan. Both finish instantly at this size, which is worth saying: the bound is not what makes binary search matter here. What makes it matter is that the ratio is 700\u00d7 at this size and 10\u2075\u00d7 at a billion, and the same argument scales to search spaces that are not arrays at all.",
    figure: {
      kind: "quantities",
      items: [
        { label: "comparisons, linear scan", value: 1e4, tone: "bad" },
        { label: "comparisons, halving", value: 14, tone: "good" },
      ],
    },
  },
  {
    constraint: "-10^4 <= nums[i], target <= 10^4",
    what: "Small values, which matters for one reason only and it is a portability reason: (lo + hi) cannot overflow at this size, so the midpoint bug is invisible here. Write lo + (hi \u2212 lo) / 2 anyway \u2014 the same code at a larger bound overflows in Java and C++, and Python\u2019s unbounded integers mean your tests will never tell you.",
  },
  {
    constraint: "nums is sorted ascending and every value is distinct",
    what: "Sorted is what makes a comparison INFORMATIVE: one probe at the midpoint eliminates half the range, which is the entire mechanism. Distinct is the quieter half \u2014 it means there is one answer rather than a range of them, so the loop may stop at the first hit and never needs the leftmost/rightmost boundary handling that duplicates force.",
    figure: {
      kind: "span",
      from: "lo",
      to: "hi",
      marks: [50],
      note: "one probe at the midpoint. Whichever side the answer is not on stops existing \u2014 the half that is discarded is discarded PROVABLY, not heuristically.",
    },
  },
  {
    constraint: "return -1 when the target is absent",
    what: "The exit condition, and the case that separates a correct loop from a lucky one. The loop must end when the range is EMPTY, which is what lo > hi means on an inclusive range \u2014 an off-by-one here either loops forever or returns \u22121 for a value that is present.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "The probe at the midpoint says nums[mid] < target. Which half survives?",
    options: [
      "Everything from lo to mid",
      "Everything from mid + 1 to hi",
      "Everything from mid to hi",
      "Neither \u2014 the target is absent",
    ],
    answer: 1,
    because:
      "The array ascends, so everything at or below mid is at most nums[mid], which is already too small. mid itself is excluded because it was just tested \u2014 including it is the off-by-one that makes the loop run forever.",
  },
  {
    ask: "When does the loop stop searching on an inclusive range [lo, hi]?",
    options: [
      "When lo equals hi",
      "When lo passes hi \u2014 the range is empty",
      "After log n iterations",
      "When mid stops changing",
    ],
    answer: 1,
    because:
      "lo == hi is a range holding exactly one element, which still has to be tested. The range is empty only once lo > hi, and that is the condition that makes the -1 return correct rather than premature.",
  },
  {
    ask: "Why write lo + (hi \u2212 lo) / 2 instead of (lo + hi) / 2?",
    options: [
      "It is faster",
      "(lo + hi) can overflow a fixed-width integer, a bug that sat in the JDK for nine years",
      "It rounds differently",
      "It avoids a division",
    ],
    answer: 1,
    because:
      "At this problem\u2019s bounds the sum cannot overflow, so the habit costs nothing here and saves you where it counts. Python integers never overflow, which is exactly why a Python test suite cannot catch this in a Java or C++ translation.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Binary Search \u2014 NeetCode",
    href: "https://neetcode.io/problems/binary-search",
    kind: "course",
    note: "The inclusive-range version written slowly, with the two boundary updates said out loud.",
  },
  {
    title: "Nearly all binary searches are broken \u2014 Google Research",
    href: "https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/",
    kind: "reference",
    note: "Joshua Bloch on the midpoint overflow he found in the JDK after nine years. The best argument in print that a correct-looking loop is not a proof.",
  },
]
