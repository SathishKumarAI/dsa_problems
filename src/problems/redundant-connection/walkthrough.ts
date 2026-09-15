// redundant-connection — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["1-2", "1-3", "2-3"] },
    caption:
      "Three edges over three nodes. Every node starts as its own component: {1} {2} {3}.",
  },
  {
    cells: { values: ["1-2", "1-3", "2-3"], marks: { 0: "focus" } },
    caption:
      "Edge 1-2: the representatives differ, so this edge joins two components. Union them: {1,2} {3}.",
  },
  {
    cells: { values: ["1-2", "1-3", "2-3"], marks: { 0: "done", 1: "focus" } },
    caption:
      "Edge 1-3: 1's root is 1, 3's root is 3. Still different — union again: {1,2,3}.",
  },
  {
    cells: { values: ["1-2", "1-3", "2-3"], marks: { 0: "done", 1: "done", 2: "compare" } },
    caption:
      "Edge 2-3: both endpoints find the same root. They were ALREADY connected, so this edge closes the cycle.",
  },
  {
    cells: { values: ["1-2", "1-3", "2-3"], marks: { 0: "done", 1: "done", 2: "focus" } },
    caption:
      "Return [2,3]. Because the scan runs in input order, the first failure is also the last cycle edge given.",
  },
]
