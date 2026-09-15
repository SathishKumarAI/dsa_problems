// tree-diameter — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "tree-diameter"

export const title = "The Longest Path Between Any Two Nodes"

export const pattern = "trees"

export const difficulty: Difficulty = "easy"

export const leetcode = "diameter-of-binary-tree"

export const brief = "Find the longest path in a binary tree, counted in edges. It need not touch the root."

export const statement = "Given the root of a binary tree, return the length of the longest path between any two nodes, measured in edges. The path may bend at any node and does not have to pass through the root."

export const constraints: string[] = [
  "1 <= number of nodes <= 10^4",
  "-100 <= node value <= 100 — values never enter the answer, only the shape does",
  "the answer is counted in EDGES, so a single node has diameter 0 and a two-node tree has diameter 1",
  "the longest path may live entirely inside one subtree and never reach the root",
  "the tree can be a chain, which makes recursion depth part of the problem",
]

export const examples: Example[] = [
  {
    input: "root = [1, 2, 3, 4, 5]",
    output: "3",
    note: "4 → 2 → 1 → 3 is three edges. The path bends at the root here, but nothing guarantees that.",
  },
  { input: "root = [1, 2]", output: "1" },
  {
    input: "root = [1, 2, null, 3, 4, 5, 6, 7]",
    output: "4",
    note: "The path is 5 → 3 → 2 → 4 → 7, four edges that bend at node 2 and never reach the root. Measuring only through the root gives 3, so this is the example that catches the most common wrong solution — the first two do not, because in both of them the longest path happens to end at the root.",
  },
]
