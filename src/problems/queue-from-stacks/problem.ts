// queue-from-stacks — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "queue-from-stacks"

export const title = "First In, First Out, From Two Stacks"

export const pattern = "design"

export const difficulty: Difficulty = "easy"

export const leetcode = "implement-queue-using-stacks"

export const brief = "Build a queue when the only container you have reverses everything you put in."

export const statement = "Implement a first-in-first-out queue — push, pop, peek and empty — using only stacks, whose operations are push to the top, pop from the top, peek at the top and a test for emptiness. The interest is not that it can be done but that it can be done with each operation costing constant time on average, even though one pop can move every element."

export const constraints: string[] = [
  "1 <= x <= 9 and at most 100 calls, so the naive version passes — this problem is about the amortised argument rather than the clock",
  "pop and peek are only called on a non-empty queue",
  "you may use two stacks, but nothing with indexed access: no reading the middle, no reversing in place",
  "amortised constant is the real bar: a single pop may move n elements, and the claim is that a sequence of n operations still costs O(n) in total",
  "the two-stack version must never refill while the output stack still holds anything, or the order is silently wrong",
]

export const examples: Example[] = [
  {
    input: "push(1), push(2), peek(), pop(), empty()",
    output: "1, 1, false",
    note: "peek and pop both see 1, the oldest element, even though 2 is on top of the stack it was pushed onto.",
  },
  {
    input: "push(1), pop(), push(2), pop(), empty()",
    output: "1, 2, true",
    note: "Alternating pushes and pops. Each pop empties the transfer stack, and the next push must not be poured on top of it.",
  },
  {
    input: "push(1), push(2), pop(), push(3), pop(), pop()",
    output: "1, 2, 3",
    note: "Pushing 3 while the output stack still holds 2 is the case that breaks a version which refills unconditionally.",
  },
]
