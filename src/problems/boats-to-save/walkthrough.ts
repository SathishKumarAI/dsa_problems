// boats-to-save — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 2, 3],
      marks: { 0: "focus", 3: "focus" },
      labels: { 0: "i", 3: "j" },
    },
    caption:
      "limit = 3, weights sorted. The lightest is 1, the heaviest is 3. Boat 1 is for the 3 — the only question is whether the 1 joins.",
  },
  {
    cells: {
      values: [1, 2, 2, 3],
      marks: { 0: "compare", 3: "done" },
      labels: { 0: "i", 2: "j" },
    },
    caption:
      "1 + 3 = 4, over the limit. Nobody lighter exists, so nobody can ride with the 3: it sails alone and only the heavy index moves. Boats: 1.",
  },
  {
    cells: {
      values: [1, 2, 2, 3],
      marks: { 0: "window", 2: "window", 3: "done" },
      labels: { 0: "i", 2: "j" },
    },
    caption:
      "1 + 2 = 3, exactly the limit — a full boat. Both indices move inward. Boats: 2.",
  },
  {
    cells: {
      values: [1, 2, 2, 3],
      marks: { 0: "done", 1: "focus", 2: "done", 3: "done" },
      labels: { 1: "i/j" },
    },
    caption:
      "One person left, and the two indices have met on them. 2 + 2 would be over the limit, but there is no second 2 left anyway.",
  },
  {
    cells: {
      values: [1, 2, 2, 3],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
    },
    caption:
      "That last boat carries them alone. i passes j and the walk ends: 3 boats, one per round, four people placed.",
  },
]
