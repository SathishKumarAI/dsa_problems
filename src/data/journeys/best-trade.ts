// Single Buy/Sell Profit, derived. Two rungs, and the whole journey is one
// question: what does the buy day have to be, given the sell day? Answer that
// and the nested loop collapses into a running minimum.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import { problem } from "../problems/sliding-window/best-trade.ts"

type N = Data<number>

// The best legal trade, by exhaustion — buy strictly before sell. The
// narration quotes the days, so they are computed rather than asserted.
export function bestProfit(prices: number[]) {
  let best = 0
  let buy = -1
  let sell = -1
  for (let i = 0; i < prices.length; i++)
    for (let j = i + 1; j < prices.length; j++)
      if (prices[j] - prices[i] > best)
        [best, buy, sell] = [prices[j] - prices[i], i, j]
  return { best, buy, sell }
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "One price per day, and exactly one trade: buy on some day, sell on a later one. Return the profit. Not the days — the number.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Two rules do all the damage. The sell day must come AFTER the buy day, so the cheapest day and the dearest day are not automatically an answer. And doing nothing is always allowed, so the worst outcome is 0, never a loss.",
  }
  const { best, buy, sell } = bestProfit(nums)
  const cheapest = nums.indexOf(Math.min(...nums))
  const dearest = nums.indexOf(Math.max(...nums))
  yield {
    hold: 3,
    marks: best > 0 ? { [buy]: "anchor", [sell]: "answer" } : {},
    state: [{ label: "profit", value: best }],
    answer: best,
    corner:
      nums.length === 1
        ? "single"
        : best === 0
          ? "falling"
          : dearest < cheapest
            ? "order"
            : undefined,
    note:
      nums.length === 1
        ? "One day, and a trade needs two. Nothing can be bought and sold, so the profit is 0 — which is the same 0 that means 'every trade would lose', and both are correct answers."
        : best === 0
          ? "Every later day is cheaper than every earlier one, so every trade loses. The answer is 0 — the profit from not trading. A running best that starts below zero, or one seeded from the first pair, reports a loss here and is wrong."
          : dearest < cheapest
            ? `The answer is ${best}: buy on day ${buy} at ${nums[buy]}, sell on day ${sell} at ${nums[sell]}. And notice what it is NOT: the dearest day is ${dearest} and the cheapest is ${cheapest}, so the biggest gap in the row is ${Math.max(...nums) - Math.min(...nums)} — unreachable, because it would mean selling before buying.`
            : `The answer is ${best}: buy on day ${buy} at ${nums[buy]}, sell on day ${sell} at ${nums[sell]}.`,
  }
}

function* brute({ nums }: N): Generator<DFrame> {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const profit = nums[j] - nums[i]
      const record = profit > best
      if (record) best = profit
      yield {
        line: 4,
        marks: { [i]: "anchor", [j]: record ? "answer" : "focus" },
        state: [
          { label: "profit", value: profit },
          { label: "best", value: best },
        ],
        note: `Buy day ${i} at ${nums[i]}, sell day ${j} at ${nums[j]}: ${profit >= 0 ? `+${profit}` : profit}. ${record ? "The best trade so far." : profit <= 0 ? "A loss, so it can never be the answer — 0 beats it by doing nothing." : `Best is still ${best}.`}`,
      }
    }
  }
  yield {
    line: 5,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${(nums.length * (nums.length - 1)) / 2} legal pairs tried, best ${best}. Every one of them asked the same question — how cheap was some earlier day? — and rediscovered the answer from scratch.`,
  }
}

function* running({ nums }: N): Generator<DFrame> {
  let lowest = Infinity
  let lowestAt = -1
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    const cheaper = nums[i] < lowest
    if (cheaper) [lowest, lowestAt] = [nums[i], i]
    const profit = nums[i] - lowest
    const record = profit > best
    best = Math.max(best, profit)
    yield {
      line: cheaper ? 4 : 5,
      marks: {
        [lowestAt]: "anchor",
        [i]: record ? "answer" : "focus",
      },
      state: [
        { label: "cheapest", value: lowest },
        { label: "best", value: best },
      ],
      note: cheaper
        ? `Day ${i} costs ${nums[i]} — cheaper than anything before it, so it becomes the buy day from here on. Selling on the day you buy earns nothing, which is why the profit read here is 0.`
        : `Day ${i} at ${nums[i]}, against the cheapest day so far (${lowest} on day ${lowestAt}): ${profit >= 0 ? `+${profit}` : profit}${record ? ", a new best" : `, best still ${best}`}. No other buy day needs trying — a dearer one can only earn less.`,
    }
  }
  yield {
    line: 6,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}, one pass and two numbers. The buy day is never searched for: it is whatever the cheapest day so far happens to be, and "so far" is what makes selling before buying impossible by construction.`,
  }
}

export const bestTrade = deriveJourney(problem, {
  slug: "one-trade",
  subtitle: "the buy day you never have to search for",
  reveals: ["sliding-window"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer run of days" },
  presets: {
    example: { label: "the example", nums: [7, 1, 5, 3, 6, 4] },
    falling: {
      label: "prices only fall",
      nums: [5, 4, 3],
      info: "every trade loses — what is the answer?",
    },
    single: {
      label: "one day",
      nums: [7],
      info: "a trade needs two days",
    },
    order: {
      label: "dearest before cheapest",
      nums: [2, 10, 1],
      info: "the biggest gap in the row is not a legal trade",
    },
    flat: {
      label: "the price never moves",
      nums: [4, 4, 4, 4],
      info: "profit 0, and no trade is better than any other",
    },
    long: {
      label: "a longer run of days",
      nums: [9, 11, 8, 5, 7, 6, 12, 3, 4, 10, 2, 9, 1],
    },
  },
  edges: [
    {
      key: "single",
      name: "one day",
      example: "[7] → 0",
      why: "A trade needs a buy day and a strictly later sell day, and there is no later day. Any loop that assumes at least one pair exists has nothing to iterate over here.",
      think: "What does your answer start at, and is that value correct when no trade is possible?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "falling",
      name: "every trade loses",
      example: "[5, 4, 3] → 0, not -1",
      why: "Seeding the best profit from the first pair, or letting it go negative, reports a loss. Doing nothing is always available, so the floor is 0.",
      think: "Is 'no trade' one of the options your answer is competing against?",
      preset: "falling",
      constraint: 3,
    },
    {
      key: "order",
      name: "the dearest day comes first",
      example: "[2, 10, 1] → 8, not 9",
      why: "The cheapest price is 1 and the dearest is 10, but 1 falls on a LATER day, so that pair is not a trade. Answering max minus min gives 9 for a row whose answer is 8.",
      think: "Does every pair your approach considers have its buy day strictly before its sell day?",
      preset: "order",
      constraint: 2,
    },
  ],
  rungs: [
    {
      key: "story",
      name: "The Problem",
      short: "start here",
      insight: "",
      idea: problem.statement,
      pseudo: [
        "given: one price per day, in day order",
        "pick a buy day, then a STRICTLY later sell day",
        "profit = price(sell) − price(buy)",
        "task: return the largest profit, or 0 for no trade",
      ],
      tools: [
        {
          name: "Array of prices",
          role: "a row addressed by day. Position is time here, and time only runs one way — that is what makes half the pairs illegal.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is the profit, not the two days that made it",
        "the sell day must be strictly later, so max minus min is not the answer",
        "not trading is always allowed, so the answer is never negative",
      ],
      quiz: [
        {
          q: "Prices are [2, 10, 1]. What is the answer?",
          choices: ["9", "8", "0"],
          answer: 1,
          explain:
            "The cheapest day (1) comes after the dearest (10), so that pair is not a trade. The best legal one is buy at 2, sell at 10.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Every legal pair",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take every day as the buy day, pair it with every later day as the sell day, and keep the largest difference. Start the best at 0 so that no-trade wins when every pair loses.",
      takeaways: [
        "n(n−1)/2 pairs, and the strictly-later rule is enforced by where the inner loop starts",
        "starting the best at 0 is what makes the all-falling row answer 0 instead of a loss",
        "every sell day re-scans the same earlier days, asking a question it has already answered",
      ],
      quiz: [
        {
          q: "Why does the inner loop start at i + 1 rather than i?",
          choices: [
            "to avoid comparing a day with itself",
            "because buying and selling on the same day earns 0, and a later day is what the rules require",
          ],
          answer: 1,
          explain:
            "Both amount to the same guard: the sell day must be strictly later. Starting at i would allow a same-day trade, which is worth 0 anyway — harmless here, and fatal in the variants where it is not.",
        },
      ],
      run: brute,
    },
    {
      key: "running",
      name: "The cheapest day so far",
      short: "one pass, two numbers",
      insight:
        "Fix the sell day and ask which buy day is best for it: it is always the cheapest of the days before it, because a dearer one can only earn less. That means the inner loop was never searching — it was recomputing a minimum it had already walked past.",
      idea: problem.whyNow!,
      takeaways: [
        "the best buy day for today is the cheapest day so far, and nothing else can beat it",
        "'so far' is not an optimisation, it is the rule: it makes selling before buying impossible to express",
        "two numbers replace the inner loop — the cheapest price seen, and the best profit seen",
        "this is a sliding window shrunk to one edge: the left edge is pinned to the historical minimum",
      ],
      quiz: [
        {
          q: "Why is it safe to only ever compare today against the cheapest earlier day?",
          choices: [
            "because prices generally rise",
            "because any other earlier day costs more, so selling today would earn strictly less",
          ],
          answer: 1,
          explain:
            "The sell price is fixed at today's, so the profit depends only on the buy price. The smallest one available wins, and every other candidate is dominated.",
        },
      ],
      run: running,
    },
  ],
})
