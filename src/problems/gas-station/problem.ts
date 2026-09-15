// gas-station — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "gas-station"

export const title = "Where to Start So the Tank Never Empties"

export const pattern = "greedy"

export const difficulty: Difficulty = "medium"

export const leetcode = "gas-station"

export const brief = "A circle of stations; find the one you can set off from and get all the way round."

export const statement = "Stations sit in a circle. Station i offers gas[i] units of fuel and it costs cost[i] units to drive from i to the next one. Starting with an empty tank at some station, return the index you can begin at and complete the whole loop, or -1 if no such station exists. The answer is guaranteed unique when one exists, which is a hint about the structure rather than a convenience."

export const constraints: string[] = [
  "n == gas.length == cost.length and 1 <= n <= 10^5, so trying every start with a full simulation is 10^10 steps",
  "0 <= gas[i], cost[i] <= 10^4, so no leg is ever free and the tank can only fall by driving",
  "the route is circular, so a start near the end wraps around to index 0 — a scan that stops at the array's end is wrong",
  "if the total gas is at least the total cost, a valid start is guaranteed to exist; if it is less, none does",
  "the valid start is unique when it exists, which is why returning the first one found is safe",
]

export const examples: Example[] = [
  {
    input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
    output: "3",
    note: "Starting at 3 the tank reads 3, 3, 1, 0, 0 along the way and never goes negative.",
  },
  {
    input: "gas = [2,3,4], cost = [3,4,3]",
    output: "-1",
    note: "Total gas 9 against total cost 10. No start can work, and the totals say so before any simulation.",
  },
  {
    input: "gas = [5,1,2,3,4], cost = [4,4,1,5,1]",
    output: "4",
    note: "The answer wraps: from index 4 the route runs 4, 0, 1, 2, 3.",
  },
]
