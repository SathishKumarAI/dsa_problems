// permutations — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [1, 2, 3] },
    caption:
      "Three distinct elements. Nothing is used yet and the arrangement is empty.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "focus" } },
    caption:
      "Choose 1 and mark it used. current = [1] — not full length, so nothing is recorded.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "window", 1: "focus" } },
    caption:
      "Choose 2, the first unused element. current = [1,2]. Still short.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "window", 1: "window", 2: "focus" } },
    caption:
      "Choose 3. current = [1,2,3] is full — record it. This is the only place an answer is ever produced.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "window", 1: "done", 2: "window" } },
    caption:
      "Unwind: un-choose 3, un-choose 2, then choose 3 at that depth instead. [1,3,2].",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "done", 1: "done", 2: "done" } },
    caption:
      "Back to the top, start with 2, then with 3. Six arrangements — and an element skipped earlier was always still available.",
  },
]
