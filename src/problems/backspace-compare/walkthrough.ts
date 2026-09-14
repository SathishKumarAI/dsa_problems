// backspace-compare — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
      marks: { 3: "focus", 8: "focus" },
      labels: { 3: "i", 8: "j" },
    },
    caption:
      's = "ab#c" on the left of the bar, t = "ad#c" on the right. Both walks start at the last character owing nothing.',
  },
  {
    cells: {
      values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
      marks: { 3: "done", 8: "done", 2: "compare", 7: "compare" },
      labels: { 2: "i", 7: "j" },
    },
    caption:
      "'c' faces 'c' — a match, so both indices step left and land on a '#'. Each side raises its own pending-delete count to 1.",
  },
  {
    cells: {
      values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
      marks: { 3: "done", 8: "done", 1: "compare", 6: "compare" },
      labels: { 1: "i", 6: "j" },
    },
    caption:
      "The whole trick: the '#' was read BEFORE the character it kills. 'b' and 'd' are cancelled on sight and never compared to anything.",
  },
  {
    cells: {
      values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
      marks: { 3: "done", 8: "done", 0: "focus", 5: "focus" },
      labels: { 0: "i", 5: "j" },
    },
    caption:
      "With the deletions paid off, the next survivors surface: 'a' against 'a'. Another match.",
  },
  {
    cells: {
      values: ["a", "b", "#", "c", "|", "a", "d", "#", "c"],
      marks: { 0: "done", 3: "done", 5: "done", 8: "done" },
    },
    caption:
      'Both indices fall off the front in the same round, so the texts ran out together: "ac" and "ac". true — and neither text was ever built.',
  },
]
