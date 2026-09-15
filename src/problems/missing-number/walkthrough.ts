// missing-number — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [3, 0, 1], labels: { 0: "i=0" }, marks: { 0: "focus" } },
    caption:
      "acc starts at n = 3. XOR in index 0 and value 3: acc = 3 ^ 0 ^ 3 = 0.",
  },
  {
    cells: { values: [3, 0, 1], labels: { 1: "i=1" }, marks: { 1: "focus" } },
    caption: "XOR in index 1 and value 0: acc = 0 ^ 1 ^ 0 = 1.",
  },
  {
    cells: { values: [3, 0, 1], labels: { 2: "i=2" }, marks: { 2: "focus" } },
    caption: "XOR in index 2 and value 1: acc = 1 ^ 2 ^ 1 = 2.",
  },
  {
    cells: { values: [3, 0, 1], marks: { 0: "done", 1: "done", 2: "done" } },
    caption:
      "0, 1 and 3 each appeared twice and cancelled. acc = 2 — the missing number.",
  },
]
