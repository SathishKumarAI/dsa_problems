// merge-sorted-array — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 3, 0, 0, 0],
      marks: { 2: "focus", 3: "window", 4: "window", 5: "window" },
      labels: { 2: "i", 5: "w" },
    },
    caption:
      "a = [1,2,3,_,_,_], b = [2,5,6]. i is on a's last real value, w on a's last slot, and j (not drawn) on b's 6.",
  },
  {
    cells: {
      values: [1, 2, 3, 0, 0, 6],
      marks: { 2: "focus", 5: "done", 3: "window", 4: "window" },
      labels: { 2: "i", 4: "w" },
    },
    caption:
      "6 beats 3, so it goes into the last slot and j steps back to b's 5. i has not moved — a's 3 is still waiting.",
  },
  {
    cells: {
      values: [1, 2, 3, 0, 5, 6],
      marks: { 2: "focus", 4: "done", 5: "done", 3: "window" },
      labels: { 2: "i", 3: "w" },
    },
    caption:
      "5 beats 3 too. Notice w is still to the RIGHT of i — that gap is why nothing has been destroyed.",
  },
  {
    cells: {
      values: [1, 2, 3, 3, 5, 6],
      marks: { 3: "done", 4: "done", 5: "done", 1: "focus" },
      labels: { 1: "i", 2: "w" },
    },
    caption:
      "Now 3 beats b's 2, so a's own value is copied rightwards onto padding and i steps back to the 2.",
  },
  {
    cells: {
      values: [1, 2, 2, 3, 5, 6],
      marks: { 2: "done", 3: "done", 4: "done", 5: "done" },
      labels: { 1: "i/w" },
    },
    caption:
      "b's 2 ties with a's 2; the tie goes to b and j hits -1. The loop stops with [1,2] already in place — untouched, because they were never in the way.",
  },
]
