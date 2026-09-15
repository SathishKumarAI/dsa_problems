// inorder-walk — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "inorder-walk"

export const title = "Read a Tree Left, Node, Right"

export const pattern = "trees"

export const difficulty: Difficulty = "easy"

export const leetcode = "binary-tree-inorder-traversal"

export const brief = "List a binary tree's values in left-node-right order, without recursion."

export const statement = "Given the root of a binary tree, return its values in inorder: everything in a node's left subtree, then the node, then everything in its right subtree."

export const constraints: string[] = [
  "0 <= number of nodes <= 10^4",
  "-100 <= node value <= 100",
  "the tree is a binary tree, NOT a search tree — inorder is defined by shape (left, node, right), so the answer is only sorted when the tree happens to be a BST",
  "every node appears exactly once in the answer, so the output length is the node count",
  "an empty tree is legal and answers with an empty row",
  "the tree may be a single chain, which is what makes recursion depth a real constraint rather than a detail",
]

export const examples: Example[] = [
  {
    input: "root = [1, null, 2, 3]",
    output: "[1, 3, 2]",
    note: "1 has no left child, so it prints first; then its right subtree, whose own left child 3 comes before 2.",
  },
  { input: "root = []", output: "[]" },
  {
    input: "root = [3, 1, 5, null, 2]",
    output: "[1, 2, 3, 5]",
    note: "Sorted here only because this tree happens to be a BST — the walk did not sort anything.",
  },
]
