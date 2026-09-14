// three-sum-closest — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [-4, -1, 1, 2],
      marks: { 0: "focus", 1: "compare", 3: "compare" },
      labels: { 0: "i", 1: "lo", 3: "hi" },
    },
    caption:
      "target = 1. Sorted, the array is [-4,-1,1,2]. Fix i on -4: the pair sum is -1 + 2, so the triple is -3 — four below the target.",
  },
  {
    cells: {
      values: [-4, -1, 1, 2],
      marks: { 0: "focus", 2: "compare", 3: "compare" },
      labels: { 0: "i", 2: "lo", 3: "hi" },
    },
    caption:
      "-3 undershoots, so lo moves up: only a larger value can help. The triple is now -1, still short but closer. Best so far: -1.",
  },
  {
    cells: {
      values: [-4, -1, 1, 2],
      marks: { 0: "done", 1: "focus", 2: "compare", 3: "compare" },
      labels: { 1: "i", 2: "lo", 3: "hi" },
    },
    caption:
      "lo and hi have met, so -4 is retired without ever looking at its remaining pairs. i moves to -1.",
  },
  {
    cells: {
      values: [-4, -1, 1, 2],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      labels: { 1: "i" },
    },
    caption:
      "-1 + 1 + 2 = 2, one above the target and one away — closer than -1, so best becomes 2. Nothing left to try, and 2 is the answer.",
  },
]
