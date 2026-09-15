// remove-element — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [0, 1, 2, 2, 3, 0, 4, 2],
      marks: { 0: "focus" },
      labels: { 0: "r/w" },
    },
    caption:
      "val = 2. Reader and writer both start at 0. While nothing has matched, they move together.",
  },
  {
    cells: {
      values: [0, 1, 2, 2, 3, 0, 4, 2],
      marks: { 0: "done", 1: "done", 2: "compare" },
      labels: { 2: "r/w" },
    },
    caption:
      "0 and 1 survive and are written onto themselves — the skip test makes those two writes free. The reader now sees a 2.",
  },
  {
    cells: {
      values: [0, 1, 2, 2, 3, 0, 4, 2],
      marks: { 0: "done", 1: "done", 3: "compare" },
      labels: { 2: "w", 3: "r" },
    },
    caption:
      "The writer stays at 2 while the reader steps past the match. A second 2 follows, so the gap widens to two.",
  },
  {
    cells: {
      values: [0, 1, 3, 2, 3, 0, 4, 2],
      marks: { 0: "done", 1: "done", 2: "done", 4: "compare" },
      labels: { 3: "w", 4: "r" },
    },
    caption:
      "The 3 at index 4 is a survivor, so it is copied back to index 2 and the writer advances. The gap is the number of 2s seen so far.",
  },
  {
    cells: {
      values: [0, 1, 3, 0, 4, 0, 4, 2],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
      labels: { 5: "w" },
    },
    caption:
      "The 0 and the 4 follow the same way; the last 2 is skipped. The reader is spent and the writer sits at 5 — the answer is the first five cells.",
  },
]
