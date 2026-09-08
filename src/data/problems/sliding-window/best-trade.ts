import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "best-trade",
  title: "Single Buy/Sell Profit",
  pattern: "sliding-window",
  difficulty: "easy",
  leetcode: "best-time-to-buy-and-sell-stock",
  brief: "Max profit from one buy and one later sell.",
  statement:
    "Given prices where prices[i] is a stock's price on day i, pick one day to buy and a later day to sell so profit is maximised. Return the profit, or 0 if no profitable trade exists.",
  constraints: [
    "1 <= prices.length <= 10^5",
    "0 <= prices[i] <= 10^4",
    "the sell day must come after the buy day",
    "no profitable pair means a profit of 0, not a negative number",
  ],
  examples: [
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
  ],
  hints: [
    "For each sell day, the best buy day is simply the cheapest price seen so far.",
    "One pass: carry the running minimum and the running best profit.",
    "Selling before buying is impossible by construction — the minimum you compare against always comes from earlier days.",
  ],
  whyNow:
    "Every buy/sell pair asks the same question over and over. Walking once while remembering the cheapest day so far answers it with two numbers and no nested loop.",
  approach:
    "Scan left to right holding two numbers: the lowest price seen so far and the best profit so far. Each day, profit-if-sold-today is price minus that minimum; update both trackers. This is a shrunk sliding window: the left edge is always the historical minimum.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def max_profit(prices: list[int]) -> int:
    lowest = float("inf")
    best = 0
    for p in prices:
        lowest = min(lowest, p)
        best = max(best, p - lowest)
    return best`,
  java: `public int maxProfit(int[] prices) {
    int lowest = Integer.MAX_VALUE;
    int best = 0;
    for (int p : prices) {
        lowest = Math.min(lowest, p);
        best = Math.max(best, p - lowest);
    }
    return best;
}`,
  cpp: `int maxProfit(const vector<int>& prices) {
    int lowest = INT_MAX;
    int best = 0;
    for (int p : prices) {
        if (p < lowest) lowest = p;
        int profit = p - lowest;
        if (profit > best) best = profit;
    }
    return best;
}`,
  walkthrough: [
    {
      cells: { values: [7, 1, 5, 3, 6, 4] },
      caption:
        "Track two numbers while scanning: lowest so far, best profit so far.",
    },
    {
      cells: { values: [7, 1, 5, 3, 6, 4], marks: { 0: "focus" } },
      caption: "Day 0: lowest = 7, best = 0.",
    },
    {
      cells: { values: [7, 1, 5, 3, 6, 4], marks: { 1: "focus" } },
      caption: "Day 1: price 1 < 7 → new lowest. Selling today would lose.",
    },
    {
      cells: {
        values: [7, 1, 5, 3, 6, 4],
        marks: { 1: "window", 2: "focus" },
      },
      caption: "Day 2: 5 − 1 = 4 → best = 4.",
    },
    {
      cells: {
        values: [7, 1, 5, 3, 6, 4],
        marks: { 1: "window", 4: "focus" },
      },
      caption: "Day 4: 6 − 1 = 5 → best = 5. Day 3 (profit 2) didn't beat it.",
    },
    {
      cells: { values: [7, 1, 5, 3, 6, 4], marks: { 1: "done", 4: "done" } },
      caption: "Answer 5: buy at 1, sell at 6. One pass, two variables.",
    },
  ],
  alternatives: [
    {
      name: "Brute force",
      summary: "Try every buy/sell day pair with the sell strictly later.",
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
  ],
}
