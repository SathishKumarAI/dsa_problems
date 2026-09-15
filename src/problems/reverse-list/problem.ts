// reverse-list — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "reverse-list"

export const title = "Reverse a Linked List"

export const pattern = "linked-list"

export const difficulty: Difficulty = "easy"

export const leetcode = "reverse-linked-list"

export const brief = "Flip all next-pointers in place."

export const statement = "Given the head of a singly linked list, reverse it in place and return the new head."

export const constraints: string[] = [
  "0 <= list length <= 5000",
  "-5000 <= node value <= 5000",
  "an empty list is legal input",
]

export const examples: Example[] = [{ input: "1 → 2 → 3 → ∅", output: "3 → 2 → 1 → ∅" }]
