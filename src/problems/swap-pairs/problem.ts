// swap-pairs — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "swap-pairs"

export const title = "Swap Every Adjacent Pair"

export const pattern = "linked-list"

export const difficulty: Difficulty = "medium"

export const leetcode = "swap-nodes-in-pairs"

export const brief = "Exchange nodes two at a time by relinking, not by copying values."

export const statement = "Given the head of a linked list, swap every two adjacent nodes and return the new head. The nodes themselves must move — you may not solve it by copying values between them."

export const constraints: string[] = [
  "0 <= nodes <= 100, values in 0..100",
  "the swap has to be done by relinking; rewriting the values is a different answer that happens to print the same for ints",
  "an ODD number of nodes leaves the last one exactly where it is, with nothing to swap it with",
  "0 and 1 nodes return unchanged, which is why the loop guard tests both the node and the node after it",
  "the first pair changes the head, so whatever you return is not the head you were given (unless there is no pair at all)",
]

export const examples: Example[] = [
  { input: "head = [1,2,3,4]", output: "[2,1,4,3]" },
  {
    input: "head = [1,2,3]",
    output: "[2,1,3]",
    note: "Odd length: 3 has no partner and stays put. A loop that only tests curr, not curr.next, walks off the end here.",
  },
  { input: "head = []", output: "[]" },
]
