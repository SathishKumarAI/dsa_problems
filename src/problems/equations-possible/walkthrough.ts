// equations-possible — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["a==b", "b==c", "a!=c"] },
    caption:
      "Three claims. Nothing says a and c are equal — but two of these together do.",
  },
  {
    cells: { values: ["a==b", "b==c", "a!=c"], marks: { 0: "focus" } },
    caption:
      "Pass 1 takes only the equalities. a==b merges their groups: {a,b} {c}.",
  },
  {
    cells: { values: ["a==b", "b==c", "a!=c"], marks: { 0: "done", 1: "focus" } },
    caption:
      "b==c merges again. Now {a,b,c} — a and c are in one group without any equation saying so directly.",
  },
  {
    cells: { values: ["a==b", "b==c", "a!=c"], marks: { 0: "done", 1: "done", 2: "compare" } },
    caption:
      "Pass 2 tests the inequalities. a and c both find the same representative.",
  },
  {
    cells: { values: ["a==b", "b==c", "a!=c"], marks: { 0: "done", 1: "done", 2: "focus" } },
    caption:
      "Forced equal and forbidden from being equal: return false. Checking a!=c before the merges would have wrongly said true.",
  },
]
