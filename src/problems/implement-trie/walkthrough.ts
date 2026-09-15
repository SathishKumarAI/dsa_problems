// implement-trie — the stepped visualization, for a problem with no journey.
//
// A journeyed problem must NOT have one — `problems.test.ts` forbids carrying
// both, because two sources for one animation is one source and one lie.

import type { Frame } from "../../data/types.ts"

export const walkthrough: Frame[] = [
  {
    cells: { values: ["root"], marks: { 0: "focus" } },
    caption:
      "An empty trie is a single root node holding no children and no end-of-word flag.",
  },
  {
    cells: { values: ["root", "a", "p", "p", "l", "e*"], marks: { 5: "focus" } },
    caption:
      "insert(\"apple\") creates one node per character. Only the last one is flagged as a word — the star marks it.",
  },
  {
    cells: { values: ["root", "a", "p", "p", "l", "e*"], marks: { 1: "window", 2: "window", 3: "focus" } },
    caption:
      "search(\"app\") walks r-a-p-p successfully, so the path exists. But that node has no flag, so the answer is false.",
  },
  {
    cells: { values: ["root", "a", "p", "p", "l", "e*"], marks: { 1: "window", 2: "window", 3: "done" } },
    caption:
      "startsWith(\"app\") makes exactly the same walk and asks nothing of the node it lands on: true.",
  },
  {
    cells: { values: ["root", "a", "p", "p*", "l", "e*"], marks: { 3: "focus" } },
    caption:
      "insert(\"app\") reuses every node already there and flags the one it stops at. Now search(\"app\") is true too — and nothing was copied.",
  },
]
