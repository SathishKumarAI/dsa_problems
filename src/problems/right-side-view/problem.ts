// right-side-view — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "right-side-view"

export const title = "What You See Standing to the Right"

export const pattern = "trees"

export const difficulty: Difficulty = "medium"

export const leetcode = "binary-tree-right-side-view"

export const brief = "List the nodes visible from the right of a binary tree, top to bottom."

export const statement = "Given the root of a binary tree, imagine standing to its right and looking at it. Return the values you can see, ordered from the top level down — one value per level, the rightmost node on that level."

export const constraints: string[] = [
  "0 <= number of nodes <= 100",
  "-100 <= node value <= 100",
  "exactly one value per level, so the answer's length is the tree's height",
  "the rightmost node on a level is not always a right child — a level can be reached only through left children",
  "an empty tree sees nothing and answers with an empty row",
]

export const examples: Example[] = [
  {
    input: "root = [1, 2, 3, null, 5, null, 4]",
    output: "[1, 3, 4]",
    note: "Level 2 shows 3, not 5: 5 is hidden behind it. Level 3 has only 4.",
  },
  {
    input: "root = [1, 2, 3, 4]",
    output: "[1, 3, 4]",
    note: "The trap: on level 3 the only node is 4, reached through two LEFT steps. Rightmost means last on the level, not 'the right child'.",
  },
  { input: "root = []", output: "[]" },
]
