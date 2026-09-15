// non-overlapping-intervals — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["1,2", "2,3", "3,4", "1,3"] },
    caption:
      "Four intervals, unordered. [1,3] clashes with two of the others.",
  },
  {
    cells: { values: ["1,2", "1,3", "2,3", "3,4"] },
    caption:
      "Sorted by END: 2, 3, 3, 4. This is the ordering the greedy rule needs.",
  },
  {
    cells: { values: ["1,2", "1,3", "2,3", "3,4"], marks: { 0: "focus" } },
    caption:
      "Keep [1,2] — nothing is kept yet, so it cannot clash. The mark moves to 2.",
  },
  {
    cells: { values: ["1,2", "1,3", "2,3", "3,4"], marks: { 0: "done", 1: "compare" } },
    caption:
      "[1,3] starts at 1, before the mark at 2. It clashes with what is already kept: removed, count 1.",
  },
  {
    cells: { values: ["1,2", "1,3", "2,3", "3,4"], marks: { 0: "done", 1: "compare", 2: "focus" } },
    caption:
      "[2,3] starts exactly at the mark. Touching is allowed, so keep it — the mark moves to 3.",
  },
  {
    cells: { values: ["1,2", "1,3", "2,3", "3,4"], marks: { 0: "done", 1: "compare", 2: "done", 3: "focus" } },
    caption:
      "[3,4] starts at 3, at the mark again. Keep it. Three kept, one removed — the answer is 1.",
  },
]
