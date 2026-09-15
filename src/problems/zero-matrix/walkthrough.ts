// zero-matrix — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 1, 1, 1, 0, 1, 1, 1, 1],
      marks: { 4: "focus" },
      labels: { 4: "the zero" },
    },
    caption:
      "A 3 × 3 matrix read row by row with one zero in the middle. Its row and its column are doomed, but writing them now would hide the original values.",
  },
  {
    cells: {
      values: [1, 0, 1, 0, 0, 1, 1, 1, 1],
      marks: { 1: "compare", 3: "compare" },
      labels: { 1: "col mark", 3: "row mark" },
    },
    caption:
      "First sweep: the zero writes a mark into its row's first cell and its column's first cell. Those two cells are the entire bookkeeping.",
  },
  {
    cells: {
      values: [1, 0, 1, 0, 0, 0, 1, 0, 1],
      marks: { 5: "done", 7: "done" },
    },
    caption:
      "Second sweep over the inner cells: a cell is blanked when its row mark or its column mark is zero. The marks themselves are not touched while they are being read.",
  },
  {
    cells: {
      values: [1, 0, 1, 0, 0, 0, 1, 0, 1],
      marks: { 0: "window", 3: "window" },
      labels: { 0: "flags" },
    },
    caption:
      "Finally the first row and column are handled from the two booleans recorded before anything was overwritten — here neither held an original zero, so they keep their values.",
  },
  {
    cells: {
      values: [1, 0, 1, 1],
      marks: { 1: "focus" },
      labels: { 1: "in row 0" },
    },
    caption:
      "The corner case [[1,0],[1,1]]: the zero IS in the first row, so the mark and the original zero are the same cell — which is why the boolean is read before the sweeps, not after.",
  },
]
