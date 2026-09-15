// find-pivot-index — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [1, 7, 3, 6, 5, 6] },
    caption:
      "Total = 28, computed once. The running sum starts at 0 — the sum of nothing.",
  },
  {
    cells: { values: [1, 7, 3, 6, 5, 6], marks: { 0: "focus" } },
    caption:
      "i = 0: left 0, right 28 - 0 - 1 = 27. No balance. running becomes 1.",
  },
  {
    cells: { values: [1, 7, 3, 6, 5, 6], marks: { 0: "done", 1: "focus" } },
    caption:
      "i = 1: left 1, right 28 - 1 - 7 = 20. running becomes 8.",
  },
  {
    cells: { values: [1, 7, 3, 6, 5, 6], marks: { 0: "done", 1: "done", 2: "focus" } },
    caption:
      "i = 2: left 8, right 28 - 8 - 3 = 17. running becomes 11.",
  },
  {
    cells: { values: [1, 7, 3, 6, 5, 6], marks: { 0: "window", 1: "window", 2: "window", 3: "focus" } },
    caption:
      "i = 3: left 11, right 28 - 11 - 6 = 11. Balanced — and the pivot's own 6 was counted on neither side.",
  },
  {
    cells: { values: [1, 7, 3, 6, 5, 6], marks: { 3: "done" } },
    caption:
      "Return 3. One pass, two numbers, and the array was added up exactly twice in total.",
  },
]
