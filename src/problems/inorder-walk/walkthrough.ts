// inorder-walk — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, "·", 2, 3],
      marks: { 0: "focus" },
      labels: { 0: "root" },
    },
    caption:
      "The tree [1, null, 2, 3]: root 1 with no left child, right child 2, whose left child is 3. Inorder asks for everything left of a node before the node itself.",
  },
  {
    cells: { values: [1, "·", 2, 3], marks: { 0: "done" } },
    caption:
      "1 has no left subtree, so nothing is owed before it. Record 1 and step right into the subtree rooted at 2. Answer so far: [1].",
  },
  {
    cells: {
      values: [1, "·", 2, 3],
      marks: { 0: "done", 2: "window", 3: "focus" },
      labels: { 2: "stacked" },
    },
    caption:
      "From 2 the descent pushes 2 onto the stack and walks left to 3. 3 has no left child, so it is the next value owed.",
  },
  {
    cells: {
      values: [1, "·", 2, 3],
      marks: { 0: "done", 3: "done", 2: "focus" },
    },
    caption:
      "Record 3, step to its right child — there is none — so the loop pops the node still owed: 2. Answer so far: [1, 3].",
  },
  {
    cells: {
      values: [1, "·", 2, 3],
      marks: { 0: "done", 2: "done", 3: "done" },
    },
    caption:
      "Record 2, step right into nothing, stack empty, cursor null: the walk ends at [1, 3, 2]. Every node was pushed once and popped once.",
  },
]
