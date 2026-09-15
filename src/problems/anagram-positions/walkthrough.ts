// anagram-positions — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: {
      values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
      marks: { 0: "window", 1: "window", 2: "window" },
      labels: { 0: "start 0" },
    },
    caption:
      'Pattern "abc" wants one a, one b and one c. The first window "cba" has exactly that: all 26 letters agree, so index 0 is an answer.',
  },
  {
    cells: {
      values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
      marks: { 1: "window", 2: "window", 3: "focus", 0: "compare" },
      labels: { 3: "in: e", 0: "out: c" },
    },
    caption:
      "Sliding by one adds 'e' and removes 'c'. Only those two letters can change their verdict — 'e' now has one too many and 'c' one too few, so agreement drops to 24.",
  },
  {
    cells: {
      values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
      marks: { 4: "window", 5: "window", 6: "window" },
    },
    caption:
      'Windows "bab" and friends keep the counter below 26: two b\'s and no c means two letters disagree. No comparison of the whole alphabet is ever made.',
  },
  {
    cells: {
      values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
      marks: { 6: "window", 7: "window", 8: "window" },
      labels: { 6: "start 6" },
    },
    caption:
      'At index 6 the window is "bac" — the same multiset as "abc", so the counter is back to 26 and 6 joins the answer.',
  },
  {
    cells: {
      values: ["a", "b", "a", "b"],
      marks: { 0: "done", 1: "done", 2: "done" },
      labels: { 0: "0,1,2" },
    },
    caption:
      'The overlap case "abab" with "ab": three windows, all anagrams. Nothing is skipped after a hit — the window advances by one, always.',
  },
]
