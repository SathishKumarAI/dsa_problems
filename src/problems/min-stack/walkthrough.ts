// min-stack — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["(-2,-2)"], marks: { 0: "focus" } },
    caption:
      "push(-2) onto an empty stack. The entry records its own value as the minimum so far.",
  },
  {
    cells: { values: ["(-2,-2)", "(0,-2)"], marks: { 1: "focus" } },
    caption:
      "push(0). The record is min(0, -2) = -2 — the new entry inherits the minimum beneath it.",
  },
  {
    cells: { values: ["(-2,-2)", "(0,-2)", "(-3,-3)"], marks: { 2: "focus" } },
    caption:
      "push(-3). min(-3, -2) = -3, so this entry becomes the new record holder. getMin reads the top: -3.",
  },
  {
    cells: { values: ["(-2,-2)", "(0,-2)"], marks: { 1: "focus" } },
    caption:
      "pop() discards the pair. No recomputation: the entry now on top already knows the minimum is -2.",
  },
  {
    cells: { values: ["(-2,-2)", "(0,-2)"], marks: { 0: "done", 1: "done" } },
    caption:
      "top() is 0 and getMin() is -2. Each entry carried its own answer, so nothing had to be rebuilt.",
  },
]
