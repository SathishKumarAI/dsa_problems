// first-missing-positive — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [3, 4, -1, 1] },
    caption:
      "n = 4, so the answer is somewhere in 1..5. Goal: make slot i hold i+1 wherever that value exists.",
  },
  {
    cells: { values: [3, 4, -1, 1], marks: { 0: "focus", 2: "compare" } },
    caption:
      "nums[0] = 3 belongs in slot 2 (0-based). Slot 2 holds -1, which is not 3, so swap them.",
  },
  {
    cells: { values: [-1, 4, 3, 1], marks: { 0: "focus" } },
    caption:
      "Slot 0 now holds -1 — outside 1..4, so it can never be an answer and never blocks one. Leave it and move on.",
  },
  {
    cells: { values: [-1, 4, 3, 1], marks: { 1: "focus", 3: "compare" } },
    caption: "nums[1] = 4 belongs in slot 3, which holds 1. Swap.",
  },
  {
    cells: { values: [-1, 1, 3, 4], marks: { 1: "focus", 0: "compare" } },
    caption:
      "The swap handed slot 1 a new value, 1, which belongs in slot 0. Keep working the SAME slot until it holds junk or is already home.",
  },
  {
    cells: {
      values: [1, -1, 3, 4],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
    },
    caption:
      "3 and 4 were already home, so the placing pass is over. At most n swaps happened in total — that is why the nested loop is still linear.",
  },
  {
    cells: { values: [1, -1, 3, 4], marks: { 0: "done", 1: "focus" } },
    caption:
      "Second pass. Slot 0 holds 1, correct. Slot 1 holds -1, not 2 — so 2 was never placed. Answer: 2.",
  },
]
