// hamming-weight — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [1, 0, 1, 1] },
    caption:
      "The bits of 11, most significant first. Three of them are set.",
  },
  {
    cells: { values: [1, 0, 1, 1], marks: { 3: "focus" } },
    caption:
      "n = 1011. n - 1 = 1010: the lowest set bit flipped off, nothing below it to change.",
  },
  {
    cells: { values: [1, 0, 1, 0], marks: { 3: "done" } },
    caption:
      "1011 & 1010 = 1010. Exactly one set bit gone. Count 1.",
  },
  {
    cells: { values: [1, 0, 0, 0], marks: { 2: "done", 3: "done" } },
    caption:
      "n = 1010, n - 1 = 1001 — the borrow ran through one zero. The AND gives 1000. Count 2.",
  },
  {
    cells: { values: [0, 0, 0, 0], marks: { 0: "done", 1: "done", 2: "done", 3: "done" } },
    caption:
      "n = 1000, n - 1 = 0111, and the AND is 0. Count 3, and the loop ran three times for three bits — not four.",
  },
]
