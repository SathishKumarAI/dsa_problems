// reverse-bits — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [0, 0, 1, 1] },
    caption:
      "A four-bit stand-in for the idea: the value 3, written 0011. Its reversal is 1100.",
  },
  {
    cells: { values: [0, 0, 1, 1], marks: { 3: "focus" } },
    caption:
      "Iteration 1: result = 0 shifted left, OR the lowest bit 1. result = 1. Input becomes 001.",
  },
  {
    cells: { values: [0, 0, 1], marks: { 2: "focus" } },
    caption:
      "Iteration 2: result = 1 shifted left is 10, OR 1 gives 11. Input becomes 00.",
  },
  {
    cells: { values: [0, 0], marks: { 1: "focus" } },
    caption:
      "Iteration 3: result = 110. The input's ZERO is pushed in — it occupies a position like any other bit.",
  },
  {
    cells: { values: [0], marks: { 0: "focus" } },
    caption:
      "Iteration 4: result = 1100, the answer. The loop ran the full width even though the input hit zero two steps ago.",
  },
]
