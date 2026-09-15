// rotate-image — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    caption:
      "A 3 by 3 grid read row by row: 1 2 3 / 4 5 6 / 7 8 9.",
  },
  {
    cells: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9], marks: { 1: "focus", 3: "compare" } },
    caption:
      "Transpose step one: swap cell (0,1) with cell (1,0) — the 2 and the 4.",
  },
  {
    cells: { values: [1, 4, 7, 2, 5, 8, 3, 6, 9], marks: { 0: "done", 4: "done", 8: "done" } },
    caption:
      "After all the above-diagonal swaps: 1 4 7 / 2 5 8 / 3 6 9. The diagonal never moved.",
  },
  {
    cells: { values: [7, 4, 1, 2, 5, 8, 3, 6, 9], marks: { 0: "focus", 1: "window", 2: "focus" } },
    caption:
      "Now reverse each row. The first becomes 7 4 1.",
  },
  {
    cells: { values: [7, 4, 1, 8, 5, 2, 9, 6, 3], marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done", 5: "done", 6: "done", 7: "done", 8: "done" } },
    caption:
      "All three rows reversed: 7 4 1 / 8 5 2 / 9 6 3. Two easy reflections composed into one hard rotation.",
  },
]
