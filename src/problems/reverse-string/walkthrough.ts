// reverse-string — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: ["h", "e", "l", "l", "o"],
      marks: { 0: "focus", 4: "focus" },
      labels: { 0: "i", 4: "j" },
    },
    caption:
      "One index at each end. The pair (i, j) is about to trade, which settles two characters in one move.",
  },
  {
    cells: {
      values: ["o", "e", "l", "l", "h"],
      marks: { 0: "done", 4: "done", 1: "focus", 3: "focus" },
      labels: { 1: "i", 3: "j" },
    },
    caption:
      "'h' and 'o' are now final. Both indices step inward; nothing outside them will be looked at again.",
  },
  {
    cells: {
      values: ["o", "l", "l", "e", "h"],
      marks: { 0: "done", 1: "done", 3: "done", 4: "done", 2: "compare" },
      labels: { 2: "i/j" },
    },
    caption:
      "'e' and the second 'l' swap. The indices have met at position 2 — for an odd length that is the unpaired middle.",
  },
  {
    cells: {
      values: ["o", "l", "l", "e", "h"],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
    },
    caption:
      "i is no longer less than j, so the loop ends without touching the middle. Five characters, two swaps.",
  },
]
