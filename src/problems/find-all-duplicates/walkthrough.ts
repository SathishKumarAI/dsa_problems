// find-all-duplicates — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [4, 3, 2, 7, 8, 2, 3, 1],
      marks: { 0: "focus", 3: "compare" },
      labels: { 3: "slot 4" },
    },
    caption:
      "Value 4: slot 4 - 1 = 3 holds 7, which is positive. Negate it to record 4 as seen.",
  },
  {
    cells: {
      values: [4, 3, 2, -7, 8, 2, 3, 1],
      marks: { 1: "focus", 2: "compare" },
      labels: { 2: "slot 3" },
    },
    caption:
      "Value 3: slot 2 holds 2, positive. Negate it. The marks are piling up inside the array itself.",
  },
  {
    cells: {
      values: [4, 3, -2, -7, 8, -2, 3, 1],
      marks: { 5: "focus", 1: "compare" },
      labels: { 1: "slot 2" },
    },
    caption:
      "The second 2, at index 5: slot 1 was already negated, so 2 is a duplicate.",
  },
  {
    cells: {
      values: [4, -3, -2, -7, 8, -2, 3, 1],
      marks: { 6: "focus", 2: "compare" },
      labels: { 2: "slot 3" },
    },
    caption:
      "The second 3: slot 2 is negative too. Answer so far [2, 3]; the rest of the walk finds nothing new.",
  },
]
