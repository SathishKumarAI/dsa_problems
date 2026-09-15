// insert-interval — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["1,2", "3,5", "6,7", "8,10", "12,16"] },
    caption:
      "Sorted and disjoint. The newcomer is [4,8] — it will bridge three of these.",
  },
  {
    cells: { values: ["1,2", "3,5", "6,7", "8,10", "12,16"], marks: { 0: "done" } },
    caption:
      "Phase 1: [1,2] ends at 2, before the newcomer starts at 4. Copied, and never looked at again.",
  },
  {
    cells: { values: ["1,2", "3,5", "6,7", "8,10", "12,16"], marks: { 0: "done", 1: "focus" } },
    caption:
      "Phase 2 begins. [3,5] starts at 3 <= 8, so it is absorbed: the newcomer widens to [3,8].",
  },
  {
    cells: { values: ["1,2", "3,5", "6,7", "8,10", "12,16"], marks: { 0: "done", 1: "window", 2: "window", 3: "focus" } },
    caption:
      "[6,7] and [8,10] also start at or before 8. Absorbing both widens the newcomer to [3,10] — the end is a running max.",
  },
  {
    cells: { values: ["1,2", "3,10", "12,16"], marks: { 0: "done", 1: "done", 2: "focus" } },
    caption:
      "[12,16] starts at 12 > 10, so phase 2 stops and [3,10] is appended.",
  },
  {
    cells: { values: ["1,2", "3,10", "12,16"], marks: { 0: "done", 1: "done", 2: "done" } },
    caption:
      "Phase 3 copies the untouched tail. One pass, no sort, and the list is disjoint again.",
  },
]
