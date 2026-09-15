// spiral-order — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      marks: { 0: "done", 1: "done", 2: "done" },
      labels: { 0: "top" },
    },
    caption:
      "The 3 × 3 matrix read row by row. The first run walks the top row left to right, then the top boundary moves down a row.",
  },
  {
    cells: {
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      marks: { 0: "done", 1: "done", 2: "done", 5: "done", 8: "done" },
      labels: { 8: "right" },
    },
    caption:
      "Down the right column from the new top to the bottom: 6 then 9. The right boundary moves in a column.",
  },
  {
    cells: {
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      marks: { 7: "done", 6: "done", 5: "done", 8: "done" },
      labels: { 6: "bottom" },
    },
    caption:
      "A row is still left, so the bottom row is walked back: 8 then 7. Then the left column is climbed — just the 4 — and both boundaries close in.",
  },
  {
    cells: {
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      marks: { 4: "focus" },
      labels: { 4: "centre" },
    },
    caption:
      "The rectangle is now a single cell. The top run emits 5, the other three runs find nothing left to walk, and the loop ends.",
  },
  {
    cells: {
      values: [1, 2, 3, 4],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      labels: { 0: "one row" },
    },
    caption:
      "The single-row case: after the top run the top boundary passes the bottom, so the guard stops the bottom run from emitting 4, 3, 2, 1 all over again.",
  },
]
