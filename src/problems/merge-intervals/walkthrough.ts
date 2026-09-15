// merge-intervals — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["1,3", "2,6", "8,10", "15,18"] },
    caption:
      "The input in its own order. [1,3] and [2,6] overlap, but nothing in the list says so locally.",
  },
  {
    cells: { values: ["1,3", "2,6", "8,10", "15,18"], marks: { 0: "focus" } },
    caption:
      "Sorted by start — already sorted here. [1,3] opens the first stretch.",
  },
  {
    cells: { values: ["1,6", "2,6", "8,10", "15,18"], marks: { 0: "window", 1: "focus" } },
    caption:
      "2 <= 3, so [2,6] overlaps. The stretch extends to max(3, 6) = 6.",
  },
  {
    cells: { values: ["1,6", "2,6", "8,10", "15,18"], marks: { 0: "done", 1: "done", 2: "focus" } },
    caption:
      "8 > 6. Nothing later can start before 8, so [1,6] can never grow again — emit it and open a new stretch at [8,10].",
  },
  {
    cells: { values: ["1,6", "2,6", "8,10", "15,18"], marks: { 0: "done", 1: "done", 2: "done", 3: "focus" } },
    caption:
      "15 > 10 for the same reason. Emit [8,10] and open [15,18].",
  },
  {
    cells: { values: ["1,6", "8,10", "15,18"], marks: { 0: "done", 1: "done", 2: "done" } },
    caption:
      "The list ends, so the open stretch is emitted. Three intervals, sorted and non-overlapping.",
  },
]
