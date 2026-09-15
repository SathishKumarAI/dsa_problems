// gas-station — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [-2, -2, -2, 3, 3] },
    caption:
      "gas - cost at each station: -2, -2, -2, 3, 3. The total is 0, so an answer exists.",
  },
  {
    cells: { values: [-2, -2, -2, 3, 3], marks: { 0: "focus" } },
    caption:
      "Start at 0. The tank goes to -2 immediately — negative, so station 0 cannot be the start.",
  },
  {
    cells: { values: [-2, -2, -2, 3, 3], marks: { 0: "compare", 1: "focus" } },
    caption:
      "Candidate jumps to 1 and the tank resets. It fails at once again: -2.",
  },
  {
    cells: { values: [-2, -2, -2, 3, 3], marks: { 0: "compare", 1: "compare", 2: "compare", 3: "focus" } },
    caption:
      "Same at station 2. The candidate is now 3, and stations 0 through 2 are eliminated for good — not retried.",
  },
  {
    cells: { values: [-2, -2, -2, 3, 3], marks: { 3: "window", 4: "window" } },
    caption:
      "From 3 the tank runs 3, then 6. It never goes negative through the end of the array.",
  },
  {
    cells: { values: [-2, -2, -2, 3, 3], marks: { 3: "done", 4: "done" } },
    caption:
      "The total is 0, so the surviving candidate is the answer: 3. One pass, and the wrap-around never had to be simulated.",
  },
]
