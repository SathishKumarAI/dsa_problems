// combination-sum — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [2, 3, 6, 7] },
    caption:
      "Target 7. The search may reuse a candidate but may never go back to an earlier one.",
  },
  {
    cells: { values: [2, 3, 6, 7], marks: { 0: "focus" } },
    caption:
      "Take 2. Remaining 5, and the next choice may start at 2 again — reuse is allowed.",
  },
  {
    cells: { values: [2, 3, 6, 7], marks: { 0: "window" } },
    caption:
      "Take 2 again. Remaining 3. The partial combination is [2,2].",
  },
  {
    cells: { values: [2, 3, 6, 7], marks: { 0: "window", 1: "focus" } },
    caption:
      "Take 3. Remaining 0 — record [2,2,3]. Because the index never moved backwards, [3,2,2] can never be produced.",
  },
  {
    cells: { values: [2, 3, 6, 7], marks: { 0: "window", 2: "compare" } },
    caption:
      "Back up and try 6 instead: remaining 3 - 6 is negative, so the branch dies at once rather than at full depth.",
  },
  {
    cells: { values: [2, 3, 6, 7], marks: { 3: "done" } },
    caption:
      "Unwind to the top and take 7 alone. Remaining 0 — record [7]. Two combinations, each reached by exactly one path.",
  },
]
