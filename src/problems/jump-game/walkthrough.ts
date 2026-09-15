// jump-game — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [2, 3, 1, 1, 4],
      marks: { 0: "focus" },
      labels: { 0: "reach = 2" },
    },
    caption:
      "Standing on index 0 with a 2: the furthest reachable index becomes 0 + 2 = 2. Nothing beyond index 2 is reachable yet.",
  },
  {
    cells: {
      values: [2, 3, 1, 1, 4],
      marks: { 0: "done", 1: "focus", 2: "window" },
      labels: { 1: "reach = 4" },
    },
    caption:
      "Index 1 is within reach, so it can be stood on. Its 3 pushes the reach to 1 + 3 = 4 — already the last index.",
  },
  {
    cells: {
      values: [2, 3, 1, 1, 4],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "focus" },
    },
    caption:
      "The rest of the pass only confirms it: every index is at or before the reach, so the walk finishes and the answer is true.",
  },
  {
    cells: {
      values: [3, 2, 1, 0, 4],
      marks: { 0: "done", 1: "done", 2: "done", 3: "compare" },
      labels: { 3: "reach = 3" },
    },
    caption:
      "The failing case: after three indices the reach is exactly 3, and index 3 holds a 0, so the reach stops growing there.",
  },
  {
    cells: {
      values: [3, 2, 1, 0, 4],
      marks: { 3: "done", 4: "compare" },
      labels: { 4: "i > reach" },
    },
    caption:
      "Index 4 is past the reach — nothing can stand there — so the pass returns false without looking at the 4 it holds.",
  },
]
