// same-tree — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "same-tree"

export const title = "Are Two Trees Identical?"

export const pattern = "trees"

export const difficulty: Difficulty = "easy"

export const leetcode = "same-tree"

export const brief = "Same shape and same values, everywhere."

export const statement = "Given the roots of two binary trees, return true if they have identical structure and identical values at every position."

export const constraints: string[] = [
  "0 <= number of nodes in each tree <= 100",
  "-10^4 <= node.val <= 10^4",
  "STRUCTURE counts as much as values — the same values in a different shape are not the same tree",
  "two empty trees are identical; one empty and one not are not",
]

export const examples: Example[] = [
  { input: "p = [1,2,3], q = [1,2,3]", output: "true" },
  {
    input: "p = [1,2], q = [1,null,2]",
    output: "false",
    note: "Same values, mirrored shape.",
  },
]
