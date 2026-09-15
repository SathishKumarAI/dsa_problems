// best-trade — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "best-trade"

export const title = "Single Buy/Sell Profit"

export const pattern = "greedy"

export const difficulty: Difficulty = "easy"

export const leetcode = "best-time-to-buy-and-sell-stock"

export const brief = "Max profit from one buy and one later sell."

export const statement = "Given prices where prices[i] is a stock's price on day i, pick one day to buy and a later day to sell so profit is maximised. Return the profit, or 0 if no profitable trade exists."

export const constraints: string[] = [
  "1 <= prices.length <= 10^5",
  "0 <= prices[i] <= 10^4",
  "the sell day must come after the buy day",
  "no profitable pair means a profit of 0, not a negative number",
]

export const examples: Example[] = [
  {
    input: "prices = [7, 1, 5, 3, 6, 4]",
    output: "5",
    note: "Buy at 1, sell at 6.",
  },
  {
    input: "prices = [5, 4, 3]",
    output: "0",
    note: "Prices only fall — don't trade.",
  },
]
