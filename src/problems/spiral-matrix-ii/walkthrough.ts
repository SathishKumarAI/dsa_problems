// spiral-matrix-ii — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
    caption:
      "A 3 by 3 grid, read row by row. Boundaries: top 0, bottom 2, left 0, right 2.",
  },
  {
    cells: { values: [1, 2, 3, 0, 0, 0, 0, 0, 0], marks: { 0: "focus", 1: "focus", 2: "focus" } },
    caption:
      "Walk the top row left to right: 1, 2, 3. Then pull the top boundary down to 1.",
  },
  {
    cells: { values: [1, 2, 3, 0, 0, 4, 0, 0, 5], marks: { 5: "focus", 8: "focus" } },
    caption:
      "Walk the right column downwards: 4, 5. Pull the right boundary in to 1.",
  },
  {
    cells: { values: [1, 2, 3, 0, 0, 4, 7, 6, 5], marks: { 6: "focus", 7: "focus" } },
    caption:
      "top (1) <= bottom (2), so the bottom row is walked back: 6, 7. Pull the bottom up to 1.",
  },
  {
    cells: { values: [1, 2, 3, 8, 0, 4, 7, 6, 5], marks: { 3: "focus" } },
    caption:
      "left (0) <= right (1), so the left column is walked up: 8. Pull the left in to 1.",
  },
  {
    cells: { values: [1, 2, 3, 8, 9, 4, 7, 6, 5], marks: { 4: "focus" } },
    caption:
      "One cell left. The top walk writes 9 and the counter reaches n squared — the guards are what stopped it being written twice.",
  },
]
