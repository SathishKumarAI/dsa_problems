// min-stack — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "min-stack"

export const title = "A Stack That Knows Its Smallest"

export const pattern = "design"

export const difficulty: Difficulty = "medium"

export const leetcode = "min-stack"

export const brief = "push, pop, top and getMin — every one of them in constant time."

export const statement = "Design a stack that supports push, pop, top and retrieving the minimum of everything currently on it, each in constant time. The difficulty is entirely in the last one: a minimum is easy to maintain while values only arrive, and the moment a pop can remove the current minimum you need to know what the minimum was before it."

export const constraints: string[] = [
  "at most 3 * 10^4 calls in total, so a per-call scan is not merely inelegant — it is the difference between linear and constant",
  "pop, top and getMin are only ever called on a non-empty stack, which removes the empty case from the contract but not from good sense",
  "-2^31 <= val <= 2^31 - 1, so a sentinel like 'minimum starts at zero' is wrong the moment a negative arrives",
  "duplicate values are allowed and are the case most broken solutions fail: two copies of the minimum must survive one pop",
  "every operation must be constant time, which is what makes the obvious scan-on-demand answer the wrong rung",
]

export const examples: Example[] = [
  {
    input: "push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()",
    output: "-3, 0, -2",
    note: "After popping -3 the minimum has to go back to -2 — a value that was already buried when -3 arrived.",
  },
  {
    input: "push(1), push(1), getMin(), pop(), getMin()",
    output: "1, 1",
    note: "Duplicates. A version that pops its minimum record on equality reports the wrong minimum here.",
  },
  {
    input: "push(5), getMin(), push(7), getMin()",
    output: "5, 5",
    note: "Pushing something larger must not disturb the minimum.",
  },
]
