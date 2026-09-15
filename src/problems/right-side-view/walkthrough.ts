// right-side-view — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 3, "·", 5, "·", 4],
      marks: { 0: "focus" },
      labels: { 0: "depth 0" },
    },
    caption:
      "Level order [1, 2, 3, null, 5, null, 4]. The walk starts at the root with depth 0 and an empty answer, so this is a first arrival: record 1.",
  },
  {
    cells: {
      values: [1, 2, 3, "·", 5, "·", 4],
      marks: { 0: "done", 2: "focus" },
      labels: { 2: "depth 1" },
    },
    caption:
      "Right child first: 3, at depth 1, and the answer holds one value, so depth == length again. Record 3 — the 2 on the same level will arrive later and be ignored.",
  },
  {
    cells: {
      values: [1, 2, 3, "·", 5, "·", 4],
      marks: { 0: "done", 2: "done", 6: "focus" },
      labels: { 6: "depth 2" },
    },
    caption: "Down 3's right child to 4 at depth 2. First arrival: record 4.",
  },
  {
    cells: {
      values: [1, 2, 3, "·", 5, "·", 4],
      marks: { 0: "done", 2: "done", 6: "done", 1: "compare", 4: "compare" },
    },
    caption:
      "Now the left half is walked. 2 sits at depth 1 and 5 at depth 2, but the answer already has values at those depths, so both are hidden and neither is recorded.",
  },
  {
    cells: {
      values: [1, 2, 3, 4],
      marks: { 0: "done", 2: "done", 3: "focus" },
      labels: { 3: "2 lefts" },
    },
    caption:
      "The corner case [1, 2, 3, 4]: depth 2 holds only 4, reached through two left steps. It is still the rightmost node on its level, which is why the rule is 'first arrival at a depth' and not 'follow right children'.",
  },
]
