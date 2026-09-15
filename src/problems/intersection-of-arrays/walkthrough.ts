// intersection-of-arrays — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: [9, 4, 9, 8, 4] },
    caption:
      "nums1 = [4, 9, 5] is the shorter side, so it becomes the stock table: {4: 1, 9: 1, 5: 1}. The longer array, shown here, only streams past.",
  },
  {
    cells: { values: [9, 4, 9, 8, 4], marks: { 0: "focus" } },
    caption:
      "9 arrives. Stock for 9 is 1, so take it and drop the stock to 0. Answer so far: [9].",
  },
  {
    cells: { values: [9, 4, 9, 8, 4], marks: { 0: "done", 1: "focus" } },
    caption: "4 arrives. Stock for 4 is 1, so take it too. Answer: [9, 4].",
  },
  {
    cells: {
      values: [9, 4, 9, 8, 4],
      marks: { 0: "done", 1: "done", 2: "compare" },
    },
    caption:
      "A second 9. Its stock is now 0 — the left side only ever had one 9 — so this copy has no partner and is skipped. This is min(1, 2) happening by itself.",
  },
  {
    cells: {
      values: [9, 4, 9, 8, 4],
      marks: { 0: "done", 1: "done", 2: "compare", 3: "compare" },
    },
    caption:
      "8 was never in nums1 at all, so the table has never heard of it. Skipped.",
  },
  {
    cells: {
      values: [9, 4, 9, 8, 4],
      marks: {
        0: "done",
        1: "done",
        2: "compare",
        3: "compare",
        4: "compare",
      },
    },
    caption: "The second 4 is out of stock too. Nothing left to spend.",
  },
  {
    cells: {
      values: [9, 4, 9, 8, 4],
      marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
    },
    caption:
      "Sorted for a single canonical answer: [4, 9]. The 5 in the table was simply never spent, and the table never grew past the three distinct values of the smaller array.",
  },
]
