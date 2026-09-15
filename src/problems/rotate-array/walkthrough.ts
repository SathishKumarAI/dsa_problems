// rotate-array — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 3, 4, 5, 6, 7],
      marks: { 4: "window", 5: "window", 6: "window" },
    },
    caption: "k = 3 on 7 values. The marked tail belongs at the front.",
  },
  {
    cells: {
      values: [7, 6, 5, 4, 3, 2, 1],
      marks: { 0: "window", 1: "window", 2: "window" },
    },
    caption:
      "Reverse everything. The tail is at the front now — but backwards.",
  },
  {
    cells: {
      values: [5, 6, 7, 4, 3, 2, 1],
      marks: { 0: "done", 1: "done", 2: "done" },
      labels: { 0: "lo", 2: "hi" },
    },
    caption: "Reverse the first k = 3. That block reads forwards again.",
  },
  {
    cells: {
      values: [5, 6, 7, 1, 2, 3, 4],
      marks: { 3: "done", 4: "done", 5: "done", 6: "done" },
      labels: { 3: "lo", 6: "hi" },
    },
    caption:
      "Reverse the remaining n - k = 4. Both blocks are in order — done.",
  },
]
