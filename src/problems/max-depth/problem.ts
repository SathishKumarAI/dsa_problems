// max-depth — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "max-depth"

export const title = "Maximum Depth of Binary Tree"

export const pattern = "trees"

export const difficulty: Difficulty = "easy"

export const leetcode = "maximum-depth-of-binary-tree"

export const brief = "How many levels deep does the tree go?"

export const statement = "Given the root of a binary tree, return its maximum depth — the number of nodes on the longest root-to-leaf path. An empty tree has depth 0."

export const constraints: string[] = [
  "0 <= node count <= 10^4",
  "-100 <= node value <= 100",
  "an empty tree has depth 0",
]

export const examples: Example[] = [{ input: "root = [3, 9, 20, null, null, 15, 7]", output: "3" }]
