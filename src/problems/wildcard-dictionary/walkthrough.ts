// wildcard-dictionary — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["b-a-d*", "d-a-d*"] },
    caption:
      "Two words added. They share nothing at the first character, so the root has two children.",
  },
  {
    cells: { values: ["b-a-d*", "d-a-d*"], marks: { 0: "compare", 1: "compare" } },
    caption:
      "search(\".ad\") starts at a dot: the child is unknown, so BOTH branches must be tried.",
  },
  {
    cells: { values: ["b-a-d*", "d-a-d*"], marks: { 0: "focus" } },
    caption:
      "First branch, through b. The pattern continues \"ad\" and the walk follows a then d concretely.",
  },
  {
    cells: { values: ["b-a-d*", "d-a-d*"], marks: { 0: "done" } },
    caption:
      "The pattern is exhausted at a node flagged as a word, so this branch succeeds and the other is never explored.",
  },
  {
    cells: { values: ["b-a-d*", "d-a-d*"], marks: { 0: "done", 1: "done" } },
    caption:
      "search(\"pad\") fails immediately: the root has no child p, so the walk stops before any recursion begins.",
  },
]
