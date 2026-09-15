// lru-cache — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["1"], marks: { 0: "focus" } },
    caption:
      "Capacity 2. put(1,1): the cache holds key 1, most recent at the front.",
  },
  {
    cells: { values: ["2", "1"], marks: { 0: "focus" } },
    caption:
      "put(2,2). Key 2 goes to the front; key 1 is now at the back, the eviction end.",
  },
  {
    cells: { values: ["1", "2"], marks: { 0: "focus" } },
    caption:
      "get(1) returns 1 AND counts as a use — key 1 moves to the front, which makes key 2 the oldest.",
  },
  {
    cells: { values: ["3", "1"], marks: { 0: "focus", 1: "done" } },
    caption:
      "put(3,3) at full capacity. The back of the list is key 2, so key 2 is evicted and its map entry deleted.",
  },
  {
    cells: { values: ["3", "1"], marks: { 0: "done", 1: "done" } },
    caption:
      "get(2) now returns -1. Had the get on key 1 not counted as a use, key 1 would have gone instead.",
  },
]
