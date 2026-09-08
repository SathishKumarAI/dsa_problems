// Fewest Coins for Amount, derived. The first journey whose second rung is
// deliberately WRONG — greedy is the idea everybody reaches for, and watching
// it fail on a specific input is worth more than being told it fails.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/coin-change-min.ts"

type N = Data<number> & { amount: number }

export function fewestCoins(coins: number[], amount: number) {
  const best = [0, ...new Array<number>(amount).fill(Infinity)]
  for (let a = 1; a <= amount; a++)
    for (const c of coins)
      if (c <= a && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1
  return best[amount] === Infinity ? -1 : best[amount]
}

// Largest coin first. Kept because the second rung animates it and the story
// act quotes the number it gets wrong.
export function greedyCoins(coins: number[], amount: number) {
  let left = amount
  let count = 0
  for (const c of [...coins].sort((a, b) => b - a)) {
    count += Math.floor(left / c)
    left %= c
  }
  return left === 0 ? count : -1
}

const table = (best: number[]) =>
  best.map((v) => (v === Infinity ? "∞" : v)) as (number | string)[]

function* story({ nums, amount }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Denominations, an unlimited supply of each, and a target of ${amount}. Use as few coins as possible to make it exactly, or say it cannot be done.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The obvious move is to take the biggest coin that still fits, over and over. It is fast, it is intuitive, and on some sets of denominations it is simply wrong — which is the reason this problem exists.",
  }
  const best = fewestCoins(nums, amount)
  const greedy = greedyCoins(nums, amount)
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((c, i) => [i, c <= amount ? "focus" : "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "fewest coins", value: best }],
    answer: best,
    corner:
      amount === 0
        ? "zero"
        : best < 0
          ? "impossible"
          : greedy !== best
            ? "greedy"
            : undefined,
    note:
      amount === 0
        ? "The target is 0, which needs no coins at all — the answer is 0, not −1. An amount of nothing is reachable by definition, and that base case is what everything else is eventually built from."
        : best < 0
          ? `No combination of these coins reaches ${amount}, so the answer is −1. Unreachable is a real answer here, and it has to be distinguishable from 'reachable using zero coins'.`
          : greedy !== best
            ? `The answer is ${best} coins. Taking the largest coin that fits each time gives ${greedy === -1 ? "no answer at all" : `${greedy}`} — worse, on this very ordinary-looking set of denominations. A choice that is locally the biggest is not the one that leaves the best remainder.`
            : `${best} coin${best === 1 ? "" : "s"} make ${amount}.`,
  }
}

function* greedy({ nums, amount }: N): Generator<DFrame> {
  let left = amount
  let count = 0
  for (const c of [...nums].sort((a, b) => b - a)) {
    const take = Math.floor(left / c)
    if (take) {
      count += take
      left %= c
      yield {
        line: 3,
        marks: {
          [nums.indexOf(c)]: "answer",
        },
        state: [
          { label: "remaining", value: left },
          { label: "coins", value: count },
        ],
        note: `${c} is the largest coin that still fits. Take it ${take} time${take === 1 ? "" : "s"} — ${count} coin${count === 1 ? "" : "s"} so far, ${left} left to make.`,
      }
    } else {
      yield {
        line: 2,
        marks: { [nums.indexOf(c)]: "dim" },
        state: [
          { label: "remaining", value: left },
          { label: "coins", value: count },
        ],
        note: `${c} does not fit in ${left}. Skip it.`,
      }
    }
  }
  const answer = left === 0 ? count : -1
  yield {
    line: 5,
    answer,
    state: [{ label: "answer", value: answer }],
    note:
      answer === -1
        ? `${left} left over and no coin small enough, so this rung reports −1. It may well be wrong: taking fewer large coins could have left a remainder the small ones can finish.`
        : `${answer} coin${answer === 1 ? "" : "s"}. Fast, and this is the answer only when the denominations happen to be well behaved — every large coin has to be a clean multiple of the choices below it, and nothing in the problem promises that.`,
  }
}

function* bfs({ nums, amount }: N): Generator<DFrame> {
  if (amount === 0) {
    yield { line: 4, answer: 0, note: "The target is 0 — no coins needed." }
    return
  }
  const seen = new Set<number>([amount])
  let frontier: number[] = [amount]
  let steps = 0
  while (frontier.length) {
    const next: number[] = []
    steps += 1
    for (const remaining of frontier)
      for (const c of nums) {
        const nxt = remaining - c
        if (nxt === 0) {
          yield {
            line: 12,
            marks: { [nums.indexOf(c)]: "answer" },
            state: [
              { label: "coins", value: steps },
              { label: "amounts seen", value: seen.size },
            ],
            note: `Spending ${c} from ${remaining} lands exactly on 0, and this is the first time 0 has been reached. Every amount reachable in fewer coins was already explored and none of them got here — so ${steps} is the minimum.`,
          }
          yield { line: 12, answer: steps, note: `Return ${steps}.` }
          return
        }
        if (nxt > 0 && !seen.has(nxt)) {
          seen.add(nxt)
          next.push(nxt)
        }
      }
    if (next.length)
      yield {
        line: 15,
        marks: Object.fromEntries(
          nums.map((c, i) => [i, c <= amount ? "focus" : "dim"])
        ) as Record<number, ChipRole>,
        state: [
          { label: "coins spent", value: steps },
          { label: "amounts to try", value: next.length },
        ],
        note: `Nothing reachable in ${steps} coin${steps === 1 ? "" : "s"} hits 0. The amounts still standing are ${next.slice(0, 8).join(", ")}${next.length > 8 ? ", …" : ""} — every one of them costs exactly ${steps} coin${steps === 1 ? "" : "s"} to reach, which is why the first arrival at 0 is guaranteed to be the fewest.`,
      }
    frontier = next
  }
  yield {
    line: 16,
    answer: -1,
    state: [{ label: "amounts seen", value: seen.size }],
    note: `Every reachable amount was explored and none of them reached 0 exactly. −1 — and note that the frontier and the set of amounts already seen both had to be carried the whole way.`,
  }
}

function* dp({ nums, amount }: N): Generator<DFrame> {
  const best = [0, ...new Array<number>(amount).fill(Infinity)]
  yield {
    line: 2,
    row: table(best),
    hold: 2,
    state: [{ label: "best[0]", value: 0 }],
    note: "One entry per amount from 0 up to the target. Amount 0 needs no coins; everything else is unreachable until proved otherwise, which is what the ∞ means.",
  }
  for (let a = 1; a <= amount; a++) {
    let from = -1
    for (const c of nums)
      if (c <= a && best[a - c] + 1 < best[a]) {
        best[a] = best[a - c] + 1
        from = c
      }
    yield {
      line: 5,
      row: table(best),
      marks: from > 0 ? ({ [nums.indexOf(from)]: "answer" } as Record<number, ChipRole>) : {},
      state: [
        { label: `best[${a}]`, value: best[a] === Infinity ? "∞" : best[a] },
        { label: "via", value: from > 0 ? from : "—" },
      ],
      note:
        best[a] === Infinity
          ? `Amount ${a} cannot be made from any coin plus an amount already solved — it stays unreachable.`
          : `Amount ${a}: the cheapest way in is one ${from} on top of amount ${a - from}, which already costs ${best[a - from]}. best[${a}] = ${best[a]}. Every coin was tried, not just the largest — that is the whole difference from the greedy rung.`,
    }
  }
  const answer = best[amount] === Infinity ? -1 : best[amount]
  yield {
    line: 7,
    row: table(best),
    answer,
    state: [{ label: "answer", value: answer }],
    note: `${answer === -1 ? "−1: the target is unreachable." : `${answer} coin${answer === 1 ? "" : "s"}.`} The table holds the answer for every amount up to ${amount}, not only the one asked for — and it got there with no frontier, no queue and no set of visited amounts.`,
  }
}

export const coinChangeMin = deriveJourney(problem, {
  slug: "fewest-coins",
  subtitle: "the greedy answer, and the input that proves it wrong",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger amount" },
  params: [{ key: "amount", label: "amount" }],
  presets: {
    example: { label: "the example", nums: [1, 3, 4], extra: { amount: 6 } },
    impossible: {
      label: "cannot be made",
      nums: [2],
      extra: { amount: 3 },
      info: "the answer is −1",
    },
    zero: {
      label: "an amount of nothing",
      nums: [1, 2, 5],
      extra: { amount: 0 },
      info: "zero coins, not −1",
    },
    canonical: {
      label: "well-behaved denominations",
      nums: [1, 5, 10],
      extra: { amount: 12 },
      info: "here the greedy answer happens to be right",
    },
    long: {
      label: "a bigger amount",
      nums: [1, 3, 4, 7],
      extra: { amount: 14 },
    },
  },
  edges: [
    {
      key: "greedy",
      name: "the largest coin is the wrong first move",
      example: "coins [1, 3, 4], amount 6 → 2, not 3",
      why: "Taking 4 leaves 2, which needs two 1s: three coins. Taking 3 leaves 3, which needs one more: two coins. Nothing in the problem promises the denominations are well behaved, and these are not.",
      think: "Does taking the biggest coin leave a remainder that is easy to finish, or just a smaller one?",
      preset: "example",
      constraint: 0,
    },
    {
      key: "impossible",
      name: "the amount cannot be made at all",
      example: "coins [2], amount 3 → -1",
      why: "Every combination overshoots or falls short. -1 is a real answer, and it has to be distinguishable from 0 — which means 'made with no coins at all'.",
      think: "How does your code tell 'impossible' apart from 'free'?",
      preset: "impossible",
      constraint: 3,
    },
    {
      key: "zero",
      name: "an amount of nothing",
      example: "coins [1, 2, 5], amount 0 → 0",
      why: "Zero is reachable by definition, using no coins. It is the base case everything else is built from, so getting it wrong quietly corrupts every other answer.",
      think: "What is the cost of making 0, and is that written down before any loop runs?",
      preset: "zero",
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
        "given: denominations, unlimited supply of each",
        "given: an amount to make exactly",
        "task: the FEWEST coins that make it",
        "no combination reaches it: return −1",
      ],
      tools: [
        {
          name: "Array of denominations",
          role: "a small set of coin values, each usable any number of times. Their order carries no meaning — this row is a set, and the interesting object is the amount, not the array.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is a count of coins, and −1 when the amount cannot be made",
        "an amount of 0 costs 0 coins, which is different from being impossible",
        "the denominations are arbitrary, so nothing licenses taking the biggest one first",
      ],
      quiz: [
        {
          q: "Coins [1, 3, 4], amount 6. Largest-first gives 4 + 1 + 1. What is the true answer?",
          choices: ["3 coins", "2 coins, using 3 + 3"],
          answer: 1,
          explain:
            "Taking 4 leaves a remainder of 2 that only 1s can finish. Taking 3 leaves 3, which one more coin completes.",
        },
      ],
      run: story,
    },
    {
      key: "greedy",
      name: "Take the biggest coin that fits",
      short: "fast, and wrong",
      from: 0,
      insight: "",
      idea: "Sort the denominations high to low and take as many of each as will fit, moving down. It is what everybody tries first, it runs in almost no time, and it is included here because watching it fail is the point.",
      takeaways: [
        "it is right whenever every coin is a clean multiple of the ones below it — real currencies are usually designed that way",
        "the denominations here are arbitrary, so that guarantee does not hold",
        "a locally largest choice is being made without any account of the remainder it leaves",
      ],
      quiz: [
        {
          q: "When IS largest-coin-first safe?",
          choices: [
            "always, it is just slower than the alternatives",
            "only for denomination sets where the biggest choice never leaves a worse remainder",
          ],
          answer: 1,
          explain:
            "The property has a name and real currencies are built to have it. An arbitrary set from a problem statement is not.",
        },
      ],
      run: greedy,
    },
    {
      key: "bfs",
      name: "Explore by number of coins",
      short: "correct, with a frontier",
      from: 1,
      insight:
        "Greedy is not slow — it is wrong, because it commits to a coin without knowing what remainder is easy to finish. Fix that by never committing: explore every amount reachable with one coin, then with two, and stop the first time 0 appears.",
      idea: "Treat each remaining amount as a place you can stand, and each coin as a move between them. Explore in waves — everything one coin away, then everything two coins away — so the first arrival at 0 used the fewest coins possible.",
      takeaways: [
        "exploring by wave means the first arrival is the cheapest arrival",
        "amounts already seen are never queued again, or the same work repeats forever",
        "it carries a frontier and a set of visited amounts the whole way",
        "and it answers only the amount asked for — the work done on the way is discarded",
      ],
      quiz: [
        {
          q: "Why is the first arrival at 0 guaranteed to use the fewest coins?",
          choices: [
            "because the coins are sorted",
            "because everything reachable in fewer coins was explored in an earlier wave and none of it was 0",
          ],
          answer: 1,
          explain:
            "The exploration order IS the coin count. Reaching 0 in wave k means no wave before k contained it, so k is minimal.",
        },
      ],
      run: bfs,
    },
    {
      key: "table",
      name: "One entry per amount, filled upward",
      short: "no queue, every amount answered",
      insight:
        "The waves are just amounts grouped by cost, and the frontier and visited set exist only to keep track of which group each amount landed in. Write that cost down per amount instead and both disappear.",
      idea: problem.whyNow!,
      takeaways: [
        "best[a] = one coin on top of the cheapest way to make a − c, over every coin c that fits",
        "fill upward, so every amount an entry depends on is already final",
        "unreachable stays at infinity, and that is what becomes −1 at the end",
        "the table answers every amount up to the target, not only the target — which the queue could not",
      ],
      quiz: [
        {
          q: "Why must every coin be tried at each amount, rather than the largest that fits?",
          choices: [
            "for speed",
            "because that is exactly the assumption the greedy rung got wrong",
          ],
          answer: 1,
          explain:
            "The whole correction is refusing to guess which coin leaves the best remainder. Trying all of them, against answers already computed, is what makes it right.",
        },
      ],
      run: dp,
    },
  ],
})
