// remove-list-elements — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "remove-list-elements"

export const title = "Delete Every Node Holding a Value"

export const pattern = "linked-list"

export const difficulty: Difficulty = "easy"

export const leetcode = "remove-linked-list-elements"

export const brief = "Unlink every node whose value matches, head included."

export const statement = "Given the head of a linked list and a value, remove every node holding that value and return the head of what is left."

export const constraints: string[] = [
  "0 <= nodes <= 10^4, and both the node values and the target sit in 0..50",
  "EVERY match goes, not just the first — one pass has to keep deleting after it has deleted once",
  "the HEAD may match, and so may the node that replaces it, so the front of the list can need several removals in a row",
  "every node may match, which means the legal answer is an empty list and the function must be able to return nothing",
  "an empty list in is an empty list out",
]

export const examples: Example[] = [
  { input: "head = [1,2,6,3,4,5,6], val = 6", output: "[1,2,3,4,5]" },
  {
    input: "head = [7,7,7,7], val = 7",
    output: "[]",
    note: "Every node goes. A loop that starts at head.next and only ever edits prev.next can never produce this answer — the head is the node it cannot reach.",
  },
  { input: "head = [], val = 1", output: "[]" },
]
