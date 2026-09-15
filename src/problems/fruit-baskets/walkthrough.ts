// fruit-baskets — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: [1, 2, 3, 2, 2],
      marks: { 0: "window", 1: "window" },
      labels: { 0: "left" },
    },
    caption:
      "The window grows over 1 and 2 — two kinds, legal, width 2. Nothing has been dropped yet.",
  },
  {
    cells: {
      values: [1, 2, 3, 2, 2],
      marks: { 0: "compare", 1: "window", 2: "focus" },
      labels: { 2: "3rd kind" },
    },
    caption:
      "The 3 arrives and the window now holds three kinds. The left edge moves one step, dropping the 1 — whose count reaches zero, so that kind is forgotten.",
  },
  {
    cells: {
      values: [1, 2, 3, 2, 2],
      marks: { 1: "window", 2: "window", 3: "window" },
      labels: { 1: "left" },
    },
    caption:
      "Legal again at width 3: kinds 2 and 3. The window never got smaller — it slid.",
  },
  {
    cells: {
      values: [1, 2, 3, 2, 2],
      marks: { 1: "window", 2: "window", 3: "window", 4: "window" },
      labels: { 4: "width 4" },
    },
    caption:
      "The last 2s extend the window without adding a kind. Its final width, 4, is the answer — no maximum ever had to be tracked.",
  },
  {
    cells: {
      values: [0, 1, 2, 2],
      marks: { 1: "window", 2: "window", 3: "window" },
      labels: { 1: "left" },
    },
    caption:
      "The same shape on [0,1,2,2]: one slide past the 0, and the window ends three wide.",
  },
]
