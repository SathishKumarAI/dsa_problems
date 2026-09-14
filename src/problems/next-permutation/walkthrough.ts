// next-permutation — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 3, 5, 4, 2],
      marks: { 2: "window", 3: "window", 4: "window" },
      labels: { 1: "pivot" },
    },
    caption:
      "Scanning in from the right, 4 >= 2 and 5 >= 4, but 3 < 5. Index 1 is the pivot; the tail [5, 4, 2] behind it is already its own largest arrangement.",
  },
  {
    cells: {
      values: [1, 3, 5, 4, 2],
      marks: { 1: "focus", 3: "compare" },
      labels: { 1: "pivot", 3: "at" },
    },
    caption:
      "Walking back from the end for the last value still greater than 3: the 2 is too small, the 4 is not. That 4 is the smallest possible upgrade for the pivot's slot.",
  },
  {
    cells: {
      values: [1, 4, 5, 3, 2],
      marks: { 1: "done", 2: "window", 3: "window", 4: "window" },
      labels: { 2: "left", 4: "right" },
    },
    caption:
      "Swap them. The front is now as small as it can be while still exceeding the original, and the tail [5, 3, 2] is still descending — the swap put 3 exactly where 4 had been.",
  },
  {
    cells: {
      values: [1, 4, 2, 3, 5],
      marks: { 1: "done", 2: "focus", 4: "focus" },
      labels: { 3: "left/right" },
    },
    caption:
      "Two indices walk in from the ends of the tail and swap as they go, turning the largest tail into the smallest. They meet at index 3 and stop.",
  },
  {
    cells: {
      values: [1, 4, 2, 3, 5],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
    },
    caption:
      "[1, 4, 2, 3, 5] — the immediate successor of [1, 3, 5, 4, 2]. Had there been no pivot at all, the same reversal would have run over the whole array and wrapped it to sorted order.",
  },
]
