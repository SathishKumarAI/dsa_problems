// jump-game-ii — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [2, 3, 1, 1, 4] },
    caption:
      "Each value is a maximum hop. Level 0 is just index 0.",
  },
  {
    cells: { values: [2, 3, 1, 1, 4], marks: { 0: "focus" } },
    caption:
      "i = 0: the furthest reach is 0 + 2 = 2. The scan is at the level boundary, so spend a jump — level 1 ends at index 2.",
  },
  {
    cells: { values: [2, 3, 1, 1, 4], marks: { 0: "done", 1: "focus" } },
    caption:
      "i = 1: reach becomes max(2, 1 + 3) = 4. Not at the boundary yet, so nothing is spent.",
  },
  {
    cells: { values: [2, 3, 1, 1, 4], marks: { 0: "done", 1: "window", 2: "focus" } },
    caption:
      "i = 2 IS the boundary. Spend the second jump; level 2 ends at 4, the furthest anything in level 1 could reach.",
  },
  {
    cells: { values: [2, 3, 1, 1, 4], marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "focus" } },
    caption:
      "The loop stops before the last index, which level 2 already covers. Two jumps — and no landing index was ever chosen.",
  },
]
