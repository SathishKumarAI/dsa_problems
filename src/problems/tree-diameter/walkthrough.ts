// tree-diameter — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 3, 4, 5],
      marks: { 3: "focus", 4: "focus" },
      labels: { 3: "leaf", 4: "leaf" },
    },
    caption:
      "Level order [1, 2, 3, 4, 5]. The walk reaches the bottom first: 4 and 5 are leaves whose absent children return 0, so each leaf reports depth 1 and bends nothing.",
  },
  {
    cells: {
      values: [1, 2, 3, 4, 5],
      marks: { 1: "compare", 3: "done", 4: "done" },
      labels: { 1: "bend = 2" },
    },
    caption:
      "Both leaves return depth 1 (one node deep). At 2 the bend is left + right = 1 + 1 = 2 edges — the path 4 → 2 → 5. Best so far: 2, and 2 returns depth 1 + max(1, 1) = 2 to its parent.",
  },
  {
    cells: { values: [1, 2, 3, 4, 5], marks: { 2: "done" } },
    caption: "3 is a leaf as well: depth 1 counted from its parent, bend 0.",
  },
  {
    cells: {
      values: [1, 2, 3, 4, 5],
      marks: { 0: "compare", 1: "done", 2: "done", 3: "done", 4: "done" },
      labels: { 0: "bend = 3" },
    },
    caption:
      "At the root the left reach is 2 and the right reach is 1, so a path bending here is 3 edges: 4 → 2 → 1 → 3. Best becomes 3.",
  },
  {
    cells: {
      values: [1, 2, "·", 3, "·", 4],
      marks: { 0: "done", 1: "done", 3: "compare", 5: "done" },
    },
    caption:
      "The corner case: a chain down the left. Every bend at the root is 3 + 0, and the answer still comes from a node that is not the root in trees where the two deep sides sit in one subtree.",
  },
]
