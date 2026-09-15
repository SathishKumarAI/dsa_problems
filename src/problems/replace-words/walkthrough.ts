// replace-words — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["c", "a", "t*", "b", "a", "t*"] },
    caption:
      "Roots \"cat\" and \"bat\" inserted. Each path ends in a flagged node — the star.",
  },
  {
    cells: { values: ["c", "a", "t*", "t", "l", "e"], marks: { 0: "focus" } },
    caption:
      "The word \"cattle\". Walk from the trie root: c exists, and that node is not flagged.",
  },
  {
    cells: { values: ["c", "a", "t*", "t", "l", "e"], marks: { 0: "window", 1: "window", 2: "focus" } },
    caption:
      "a, then t. This node IS flagged, so \"cat\" is a root — and because prefixes are met shortest first, no shorter one exists.",
  },
  {
    cells: { values: ["c", "a", "t*"], marks: { 0: "done", 1: "done", 2: "done" } },
    caption:
      "Stop immediately. The remaining characters \"tle\" are never examined, which is where the saving is.",
  },
  {
    cells: { values: ["d", "o", "g"], marks: { 0: "compare" } },
    caption:
      "The word \"dog\": the trie root has no child d, so the walk falls off at once and the word is kept whole.",
  },
]
