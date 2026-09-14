// mirror-tree — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "mirror-tree"

export const title = "Is the Tree Its Own Mirror?"

export const pattern = "trees"

export const difficulty: Difficulty = "easy"

export const leetcode = "symmetric-tree"

export const brief = "Decide whether a binary tree is a mirror image of itself down the middle."

export const statement = "Given the root of a binary tree, return true when the tree is symmetric about its centre line: the left subtree read left-to-right matches the right subtree read right-to-left, in both values and shape."

export const constraints: string[] = [
  "0 <= number of nodes <= 1000",
  "-100 <= node value <= 100",
  "symmetry is about SHAPE as well as values — two nodes match only when both are present or both absent",
  "an empty tree is symmetric, and so is a single node",
  "values may repeat, which is what makes a values-only check unsafe",
]

export const examples: Example[] = [
  {
    input: "root = [1, 2, 2, 3, 4, 4, 3]",
    output: "true",
    note: "Every pair matches across the centre: 2 with 2, then 3 with 3 and 4 with 4 crossed over.",
  },
  {
    input: "root = [1, 2, 2, null, 3, null, 3]",
    output: "false",
    note: "Both 2s carry a right child. A mirror would need the left 2's child on its right and the right 2's child on its left.",
  },
  {
    input: "root = [1, 1, 1, 1, null, 1]",
    output: "false",
    note: "The corner case that kills a values-only test: every value is 1, so any list of the values is a palindrome — but the left 1 has a left child while the right 1 does too, and a mirror needs it on the other side.",
  },
]
