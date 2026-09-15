// plus-one — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [1, 2, 3], marks: { 2: "focus" }, labels: { 2: "i" } },
    caption:
      "Start at the last digit. 3 is below 9, so it takes the increment alone.",
  },
  {
    cells: { values: [1, 2, 4], marks: { 2: "done" } },
    caption: "Return at once — the digits to the left never had to be read.",
  },
  {
    cells: { values: [9, 9, 9], marks: { 2: "focus" }, labels: { 2: "i" } },
    caption:
      "The other shape: 9 cannot absorb the one. Write 0 and step left.",
  },
  {
    cells: {
      values: [9, 0, 0],
      marks: { 0: "focus", 1: "done", 2: "done" },
      labels: { 0: "i" },
    },
    caption:
      "Same again at index 1 and index 0 — the walk runs off the front.",
  },
  {
    cells: { values: [1, 0, 0, 0], marks: { 0: "focus" } },
    caption:
      "Every digit was a 9, so the answer is one digit longer: a 1 in front of the zeros.",
  },
]
