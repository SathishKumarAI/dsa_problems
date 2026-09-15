// partition-labels — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["a", "b", "a", "b", "c", "b", "a", "c", "a"] },
    caption:
      "The prefix of \"ababcbacadefeg...\". Last occurrences: a at 8, b at 5, c at 7.",
  },
  {
    cells: { values: ["a", "b", "a", "b", "c", "b", "a", "c", "a"], marks: { 0: "focus" } },
    caption:
      "i = 0, letter a. The furthest reach becomes 8 — the part cannot close before then, whatever follows.",
  },
  {
    cells: { values: ["a", "b", "a", "b", "c", "b", "a", "c", "a"], marks: { 0: "window", 1: "focus" } },
    caption:
      "i = 1, letter b, last at 5. The reach stays 8, because it is a running MAXIMUM and 5 is nearer.",
  },
  {
    cells: { values: ["a", "b", "a", "b", "c", "b", "a", "c", "a"], marks: { 0: "window", 1: "window", 2: "window", 3: "window", 4: "focus" } },
    caption:
      "i = 4, letter c, last at 7. Still short of 8, so no cut is legal yet.",
  },
  {
    cells: { values: ["a", "b", "a", "b", "c", "b", "a", "c", "a"], marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done", 5: "done", 6: "done", 7: "done", 8: "focus" } },
    caption:
      "i = 8 and the reach is 8. Nothing inside occurs later, so this is the earliest legal cut: a part of size 9.",
  },
]
