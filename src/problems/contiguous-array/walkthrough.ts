// contiguous-array — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [0, 0, 1, 0, 0, 0, 1, 1] },
    caption:
      "Read a zero as -1 and a one as +1. A balanced stretch is now one that sums to zero.",
  },
  {
    cells: { values: [0, 0, 1, 0, 0, 0, 1, 1], marks: { 0: "focus" } },
    caption:
      "The map starts holding {0: -1} — the empty prefix. After index 0 the total is -1, first seen here.",
  },
  {
    cells: { values: [0, 0, 1, 0, 0, 0, 1, 1], marks: { 0: "done", 1: "focus", 2: "compare" } },
    caption:
      "Totals run -1, -2, then back to -1 at index 2. Height -1 was seen at index 0, so indices 1..2 balance: length 2.",
  },
  {
    cells: { values: [0, 0, 1, 0, 0, 0, 1, 1], marks: { 1: "window", 2: "window", 3: "window", 4: "window", 5: "focus" } },
    caption:
      "The total keeps falling to -4 by index 5. Each of those heights is recorded at its FIRST index only.",
  },
  {
    cells: { values: [0, 0, 1, 0, 0, 0, 1, 1], marks: { 1: "window", 2: "window", 3: "window", 4: "window", 5: "window", 6: "window", 7: "focus" } },
    caption:
      "At index 7 the total is back to -2, first seen at index 1. The stretch 2..7 is balanced: length 6.",
  },
  {
    cells: { values: [0, 0, 1, 0, 0, 0, 1, 1], marks: { 2: "done", 3: "done", 4: "done", 5: "done", 6: "done", 7: "done" } },
    caption:
      "Answer 6. Keeping only the first index per height is what made it the longest and not merely a balanced one.",
  },
]
