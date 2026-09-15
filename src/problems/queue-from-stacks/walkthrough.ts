// queue-from-stacks — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["1", "2", "3"], marks: { 2: "focus" } },
    caption:
      "push(1), push(2), push(3) all land on the inbox. Its top is 3 — the newest, which is the wrong end for a queue.",
  },
  {
    cells: { values: ["3", "2", "1"], marks: { 2: "focus" } },
    caption:
      "pop() finds the outbox empty, so the inbox is poured across. One transfer reverses the order: 1 is now on top.",
  },
  {
    cells: { values: ["3", "2"], marks: { 1: "focus" } },
    caption:
      "The pop returns 1, the oldest element. The outbox still holds 2 and 3, already in the right order.",
  },
  {
    cells: { values: ["3", "2", "4"], marks: { 2: "compare" } },
    caption:
      "push(4) goes to the INBOX, not on top of the outbox. Pouring now would put 4 ahead of 2 and 3.",
  },
  {
    cells: { values: ["3", "4"], marks: { 1: "focus" } },
    caption:
      "pop() returns 2 straight from the outbox — no transfer, because it was not empty. Each element moves at most twice in its life.",
  },
]
