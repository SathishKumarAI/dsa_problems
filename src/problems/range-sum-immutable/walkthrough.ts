// range-sum-immutable — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [-2, 0, 3, -5, 2, -1] },
    caption:
      "The array never changes, which is what makes precomputing safe.",
  },
  {
    cells: { values: [0, -2, -2, 1, -4, -2, -3], marks: { 0: "focus" } },
    caption:
      "The prefix array, one longer than the input. Entry 0 is the sum of NOTHING — the seed that removes every off-by-one.",
  },
  {
    cells: { values: [0, -2, -2, 1, -4, -2, -3], marks: { 0: "compare", 3: "focus" } },
    caption:
      "sumRange(0,2): prefix[3] - prefix[0] = 1 - 0 = 1. Three values added, one subtraction done.",
  },
  {
    cells: { values: [0, -2, -2, 1, -4, -2, -3], marks: { 2: "compare", 6: "focus" } },
    caption:
      "sumRange(2,5): prefix[6] - prefix[2] = -3 - (-2) = -1. The range starts partway in and costs exactly the same.",
  },
  {
    cells: { values: [0, -2, -2, 1, -4, -2, -3], marks: { 0: "compare", 6: "focus" } },
    caption:
      "sumRange(0,5): prefix[6] - prefix[0] = -3. The whole array through the same formula, with no special case.",
  },
]
