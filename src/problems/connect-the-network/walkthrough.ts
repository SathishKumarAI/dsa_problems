// connect-the-network — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [0, 1, 2, 3] },
    caption:
      "Four computers, three cables: 0-1, 0-2, 1-2. Every computer starts in its own group.",
  },
  {
    cells: { values: [0, 1, 2, 3], marks: { 0: "window", 1: "window" } },
    caption:
      "Cable 0-1 joins two groups. Components 4 -> 3.",
  },
  {
    cells: { values: [0, 1, 2, 3], marks: { 0: "window", 1: "window", 2: "window" } },
    caption:
      "Cable 0-2 joins another. Components 3 -> 2, and computer 3 is still alone.",
  },
  {
    cells: { values: [0, 1, 2, 3], marks: { 0: "done", 1: "done", 2: "done", 3: "compare" } },
    caption:
      "Cable 1-2: both endpoints already share a root, so it is spare. Components stay at 2.",
  },
  {
    cells: { values: [0, 1, 2, 3], marks: { 0: "done", 1: "done", 2: "done", 3: "focus" } },
    caption:
      "Two components left, so one move — and the spare cable found above is what makes it. Answer 1.",
  },
]
