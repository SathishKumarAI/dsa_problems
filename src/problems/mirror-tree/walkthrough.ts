// mirror-tree — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 2, 3, 4, 4, 3],
      marks: { 1: "focus", 2: "focus" },
      labels: { 1: "a", 2: "b" },
    },
    caption:
      "Level order [1, 2, 2, 3, 4, 4, 3]. The question starts as a PAIR: the root's two children, one cursor on each.",
  },
  {
    cells: {
      values: [1, 2, 2, 3, 4, 4, 3],
      marks: { 0: "done", 1: "done", 2: "done", 3: "focus", 6: "focus" },
      labels: { 3: "a.left", 6: "b.right" },
    },
    caption:
      "2 = 2, so the pair descends CROSSED: a's left (3) against b's right (3). They match.",
  },
  {
    cells: {
      values: [1, 2, 2, 3, 4, 4, 3],
      marks: {
        0: "done",
        1: "done",
        2: "done",
        3: "done",
        6: "done",
        4: "focus",
        5: "focus",
      },
      labels: { 4: "a.right", 5: "b.left" },
    },
    caption:
      "The other crossing: a's right (4) against b's left (4). Also a match, and both pairs have empty children below, which count as matching too.",
  },
  {
    cells: {
      values: [1, 2, 2, 3, 4, 4, 3],
      marks: {
        0: "done",
        1: "done",
        2: "done",
        3: "done",
        4: "done",
        5: "done",
        6: "done",
      },
    },
    caption:
      "Every pair agreed and nothing is left: the tree is symmetric. Had one pair disagreed, the `and` would have stopped the walk there.",
  },
  {
    cells: {
      values: [1, 1, 1, 1, "·", 1],
      marks: { 3: "compare", 4: "compare" },
      labels: { 3: "a.left", 4: "b.right" },
    },
    caption:
      "The corner case: all values equal. The crossed pair is (a node, nothing) — one present and one absent, so the answer is false even though no two VALUES ever disagreed.",
  },
]
