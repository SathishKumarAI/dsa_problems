// daily-warmer — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "daily-warmer"

export const title = "Days Until Warmer"

export const pattern = "stack"

export const difficulty: Difficulty = "medium"

export const leetcode = "daily-temperatures"

export const brief = "For each day, how many days until a strictly warmer one?"

export const statement = "Given daily temperatures, return an array where answer[i] is the number of days you wait after day i for a strictly warmer temperature, or 0 if it never comes."

export const constraints: string[] = [
  "1 <= temperatures.length <= 10^5",
  "30 <= temperatures[i] <= 100",
  "a day with no warmer day ahead answers 0",
]

export const examples: Example[] = [
  {
    input: "temps = [73, 74, 75, 71, 69, 72, 76, 73]",
    output: "[1, 1, 4, 2, 1, 1, 0, 0]",
  },
]
