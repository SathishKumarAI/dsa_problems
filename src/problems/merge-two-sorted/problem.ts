// merge-two-sorted — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "merge-two-sorted"

export const title = "Merge Two Sorted Lists"

export const pattern = "linked-list"

export const difficulty: Difficulty = "easy"

export const leetcode = "merge-two-sorted-lists"

export const brief = "Splice two sorted lists into one sorted list."

export const statement = "Given the heads of two sorted linked lists, merge them into one sorted list by splicing existing nodes (no new value nodes) and return its head."

export const constraints: string[] = [
  "0 <= each list length <= 50",
  "-100 <= node value <= 100",
  "both lists are sorted ascending",
  "either list may be empty",
]

export const examples: Example[] = [
  { input: "a = 1 → 3 → 5, b = 2 → 4", output: "1 → 2 → 3 → 4 → 5" },
]
