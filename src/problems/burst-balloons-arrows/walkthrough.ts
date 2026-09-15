// burst-balloons-arrows — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["10,16", "2,8", "1,6", "7,12"] },
    caption:
      "Four balloons, unordered. Two arrows are enough, but nothing local says where to put them.",
  },
  {
    cells: { values: ["1,6", "2,8", "7,12", "10,16"] },
    caption:
      "Sorted by end: 6, 8, 12, 16. The greedy rule reads left to right from here.",
  },
  {
    cells: { values: ["1,6", "2,8", "7,12", "10,16"], marks: { 0: "focus" } },
    caption:
      "Nothing is burst yet, so fire at the first balloon's end: an arrow at 6.",
  },
  {
    cells: { values: ["1,6", "2,8", "7,12", "10,16"], marks: { 0: "done", 1: "done" } },
    caption:
      "[2,8] starts at 2, which is at or before 6 — the arrow already passes through it. Skipped, no new arrow.",
  },
  {
    cells: { values: ["1,6", "2,8", "7,12", "10,16"], marks: { 0: "done", 1: "done", 2: "focus" } },
    caption:
      "[7,12] starts at 7 > 6, so the arrow misses it. Fire a second arrow at 12.",
  },
  {
    cells: { values: ["1,6", "2,8", "7,12", "10,16"], marks: { 0: "done", 1: "done", 2: "done", 3: "done" } },
    caption:
      "[10,16] starts at 10 <= 12 and is already burst. Two arrows for four balloons.",
  },
]
