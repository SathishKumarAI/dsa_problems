// cycle-detect — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "cycle-detect"

export const title = "Detect a Cycle"

export const pattern = "linked-list"

export const difficulty: Difficulty = "easy"

export const leetcode = "linked-list-cycle"

export const brief = "Does the list loop back on itself?"

export const statement = "Given the head of a linked list, return true if following next-pointers ever revisits a node (a cycle), false if the walk reaches the end."

export const constraints: string[] = [
  "0 <= list length <= 10^4",
  "-10^5 <= node value <= 10^5",
  "the cycle, if any, is entered from some node's next pointer",
  "O(1) extra space is the point — a visited set solves it and misses the lesson",
]

export const examples: Example[] = [
  { input: "1 → 2 → 3 → (back to 2)", output: "true" },
  { input: "1 → 2 → ∅", output: "false" },
]
