// summary-ranges — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [0, 1, 2, 4, 5, 7] },
    caption:
      "Sorted, distinct. Every stretch that steps by exactly 1 collapses into a single range.",
  },
  {
    cells: { values: [0, 1, 2, 4, 5, 7], marks: { 0: "focus" } },
    caption:
      "start = 0. The next value is 1, which is 0+1, so the run continues.",
  },
  {
    cells: {
      values: [0, 1, 2, 4, 5, 7],
      marks: { 0: "window", 1: "window", 2: "focus" },
    },
    caption:
      "2 is 1+1, still going. The next value is 4, and 4 is not 3 — the chain breaks here, with 2 as the run's last value.",
  },
  {
    cells: {
      values: [0, 1, 2, 4, 5, 7],
      marks: { 0: "done", 1: "done", 2: "done", 3: "focus" },
    },
    caption:
      'start 0 and end 2 differ, so emit "0->2". A new run starts at 4.',
  },
  {
    cells: {
      values: [0, 1, 2, 4, 5, 7],
      marks: { 0: "done", 1: "done", 2: "done", 3: "window", 4: "focus" },
    },
    caption: '5 is 4+1, then 7 breaks the chain. Emit "4->5".',
  },
  {
    cells: {
      values: [0, 1, 2, 4, 5, 7],
      marks: {
        0: "done",
        1: "done",
        2: "done",
        3: "done",
        4: "done",
        5: "focus",
      },
    },
    caption:
      '7 has nothing after it, so its run is one value long: start equals end, and it prints bare as "7", not "7->7".',
  },
  {
    cells: {
      values: [0, 1, 2, 4, 5, 7],
      marks: {
        0: "done",
        1: "done",
        2: "done",
        3: "done",
        4: "done",
        5: "done",
      },
    },
    caption:
      'Every index was visited exactly once by the anchor or the inner walk. Answer: ["0->2", "4->5", "7"].',
  },
]
