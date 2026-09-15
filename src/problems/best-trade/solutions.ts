// best-trade — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Scan left to right holding two numbers: the lowest price seen so far and the best profit so far. Each day, profit-if-sold-today is price minus that minimum; update both trackers. This is a shrunk sliding window: the left edge is always the historical minimum."

export const whyNow = "Every buy/sell pair asks the same question over and over. Walking once while remembering the cheapest day so far answers it with two numbers and no nested loop."

export const arc = "The smallest useful dynamic program in disguise. Brute force asks 'which pair?' and pays quadratically; the linear version asks a local question instead — for each day, what is the best profit if I SELL today? — which needs only the cheapest price seen so far. Carrying one running extreme and folding the answer as you go is the same shape as maximum-subarray, and the two problems are worth learning together because the sell-today framing converts one into the other exactly. The corner case is a strictly falling price series, where the answer is zero rather than negative: the contract says you may decline to trade, and a solution that tracks the best difference without that floor gets it wrong."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def max_profit(prices: list[int]) -> int:
    lowest = float("inf")
    best = 0
    for p in prices:
        lowest = min(lowest, p)
        best = max(best, p - lowest)
    return best`

export const java = `public int maxProfit(int[] prices) {
    int lowest = Integer.MAX_VALUE;
    int best = 0;
    for (int p : prices) {
        lowest = Math.min(lowest, p);
        best = Math.max(best, p - lowest);
    }
    return best;
}`

export const cpp = `int maxProfit(const vector<int>& prices) {
    int lowest = INT_MAX;
    int best = 0;
    for (int p : prices) {
        if (p < lowest) lowest = p;
        int profit = p - lowest;
        if (profit > best) best = profit;
    }
    return best;
}`

export const alternatives: Solution[] = [
  {
    name: "Brute force",
    summary:
      "Try every buy day against every later sell day and keep the best difference. Correct, and the right first sentence in an interview, but it re-asks a question it has already answered: by the time you reach day i you have seen every earlier price, and the only one that matters is the smallest. Quadratic on 10^5 days is five billion pairs.",
    complexity: { time: "O(n²)", space: "O(1)" },
    python: `def max_profit(prices: list[int]) -> int:
    best = 0
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            best = max(best, prices[j] - prices[i])
    return best`,
    java: `public int maxProfit(int[] prices) {
    int best = 0;
    for (int i = 0; i < prices.length; i++) {
        for (int j = i + 1; j < prices.length; j++) {
            best = Math.max(best, prices[j] - prices[i]);
        }
    }
    return best;
}`,
    cpp: `int maxProfit(const vector<int>& prices) {
    int best = 0;
    for (int i = 0; i < (int)prices.size(); i++) {
        for (int j = i + 1; j < (int)prices.size(); j++) {
            best = max(best, prices[j] - prices[i]);
        }
    }
    return best;
}`,
  },
]
