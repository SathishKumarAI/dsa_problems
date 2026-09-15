// subsets — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [1, 2, 3] },
    caption:
      "Three distinct elements, so eight subsets. The recursion starts with an empty current subset.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "focus" } },
    caption:
      "Enter with current = []. Record it — the empty subset is an answer. Then choose 1.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "window", 1: "focus" } },
    caption:
      "current = [1], recorded on entry. Choose 2 from the elements AFTER 1, never before it.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "window", 1: "window", 2: "focus" } },
    caption:
      "current = [1,2] then [1,2,3], each recorded as it is entered. The branch is exhausted.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "window", 1: "done", 2: "focus" } },
    caption:
      "Un-choose 3, un-choose 2, then choose 3 instead: [1,3]. The pop is what makes one list serve every branch.",
  },
  {
    cells: { values: [1, 2, 3], marks: { 0: "done", 1: "done", 2: "done" } },
    caption:
      "Unwind to the top and start again at 2, then 3. Eight subsets, each recorded exactly once at its own node.",
  },
]
