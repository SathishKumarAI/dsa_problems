// max-depth — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "max-depth"

export const title = "Maximum Depth of Binary Tree"

export const pattern = "trees"

export const difficulty: Difficulty = "easy"

export const leetcode = "maximum-depth-of-binary-tree"

export const brief = "How many levels deep does the tree go?"

export const statement =
  "Given the root of a binary tree, return its maximum depth — the number of nodes on the longest root-to-leaf path. An empty tree has depth 0."

export const constraints: string[] = [
  "0 <= node count <= 10^4",
  "-100 <= node value <= 100",
  "an empty tree has depth 0",
]

export const examples: Example[] = [
  { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3" },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "0 <= node count <= 10^4",
    what: "Ten thousand nodes, and the bound that matters is not the count but the SHAPE it permits: a degenerate tree is a 10\u2074-node chain, so a recursive walk is 10\u2074 stack frames deep. CPython\u2019s default limit is 1000. This constraint is what makes the iterative rungs a correctness question rather than a style preference.",
    figure: {
      kind: "quantities",
      items: [
        { label: "recursion depth, degenerate tree", value: 1e4, tone: "bad" },
        {
          label: "CPython default recursion limit",
          value: 1000,
          tone: "plain",
        },
        { label: "recursion depth, balanced tree", value: 14, tone: "good" },
      ],
    },
  },
  {
    constraint: "-100 <= node value <= 100",
    what: "The values never enter the answer, and the bound is here to make that obvious: depth is a question about SHAPE. Nothing is compared, nothing is summed. A solution that reads node.val at all is doing work the problem did not ask for.",
  },
  {
    constraint: "an empty tree has depth 0",
    what: "The base case the whole recursion rests on, and it is what makes the one-line solution total: a missing child contributes 0, so a leaf is 1 + max(0, 0) = 1 with no branch for leaves. Write the empty case as a return rather than as a guard around the recursive calls and every other case falls out.",
    figure: {
      kind: "cells",
      values: ["?"],
      caption:
        "the empty tree. Depth 0, and it is the value every leaf\u2019s two missing children contribute.",
    },
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "A leaf node. What is the depth of the subtree rooted at it?",
    options: ["0", "1", "2", "It depends on the whole tree"],
    answer: 1,
    because:
      "Its two children are empty and contribute 0 each, so the leaf itself is 1 + max(0, 0) = 1. Getting this one right is what makes the recursion total: there is no separate case for a leaf.",
  },
  {
    ask: "The tree is a single chain of 10^4 nodes, each with only a left child. What breaks?",
    options: [
      "Nothing \u2014 the answer is still computed",
      "The time bound becomes quadratic",
      "A recursive walk needs 10^4 stack frames, past CPython\u2019s default limit of 1000",
      "The values overflow",
    ],
    answer: 2,
    because:
      "The constraints permit exactly this shape. It is why the iterative rungs are on the page: the space bound of a recursive walk is O(h), and h can be n.",
  },
  {
    ask: "Which of these does the answer NOT depend on?",
    options: [
      "The shape of the tree",
      "The number of nodes on the longest root-to-leaf path",
      "The values stored in the nodes",
      "Whether a node has one child or two",
    ],
    answer: 2,
    because:
      "Depth is a question about structure alone. Any solution that compares or accumulates node values is computing something the statement never asked for.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Depth of Binary Tree \u2014 NeetCode",
    href: "https://neetcode.io/problems/depth-of-binary-tree",
    kind: "course",
    note: "Recursive and iterative side by side, with the level-by-level BFS counting made explicit.",
  },
]
