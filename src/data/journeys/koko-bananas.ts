// Koko Eating Bananas, derived.
//
// The reason this problem is worth a journey is that the binary search is not
// over the row on screen. The row is the piles; the search runs over SPEEDS,
// a range no array holds. That reframing — search the answer space, not the
// input — is the whole lesson, and the state line carries the range so it is
// visible while the chips stay still.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/koko-bananas.ts"

type P = Data<number> & { h: number }

/** Hours needed at speed k — one pile per hour, so partial hours round up. */
export const hoursAt = (piles: number[], k: number) =>
  piles.reduce((t, p) => t + Math.ceil(p / k), 0)

/** The reference: the slowest speed that finishes within h hours. */
export function slowestSpeed(piles: number[], h: number) {
  let lo = 1
  let hi = Math.max(...piles)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (hoursAt(piles, mid) <= h) hi = mid
    else lo = mid + 1
  }
  return lo
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

function* story({ nums, h }: P): Generator<DFrame> {
  const answer = slowestSpeed(nums, h)
  const biggest = Math.max(...nums)
  yield {
    hold: 3,
    noChips: true,
    note: `Piles of bananas and ${h} ${h === 1 ? "hour" : "hours"}. Pick an eating speed — bananas per hour — and each hour is spent on ONE pile. What is the slowest speed that still finishes everything in time?`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      nums[i] === biggest ? "anchor" : undefined
    ),
    state: [
      { label: "hours available", value: h },
      { label: "piles", value: nums.length },
      { label: "largest pile", value: biggest },
    ],
    corner: nums.length === h ? "tight" : undefined,
    note:
      nums.length === h
        ? `There are exactly as many hours as piles, so every pile must be finished in a single hour — the speed has to be at least the largest pile, ${biggest}. The tightest the deadline can legally be.`
        : `An hour spent on a pile smaller than the speed is still a whole hour: the rest is not carried over to the next pile. That rounding-up is what makes the answer discrete, and it is where most wrong answers come from.`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, () => "dim"),
    state: [
      { label: "at speed 1", value: `${hoursAt(nums, 1)} hours` },
      {
        label: `at speed ${biggest}`,
        value: `${hoursAt(nums, biggest)} hours`,
      },
      { label: "answer", value: answer },
    ],
    answer,
    corner:
      answer === biggest
        ? "tight"
        : answer === 1
          ? "slow"
          : nums.length === 1
            ? "onepile"
            : "monotone",
    note:
      answer === biggest
        ? `The answer is ${biggest}, the largest pile — no faster speed is ever needed, because one pile per hour means the largest pile alone takes one hour at that speed. That is the ceiling of the whole search.`
        : answer === 1
          ? `${h} hours is generous enough that speed 1 already works, so the answer is 1 — the floor. A search that starts its range at 0 divides by zero here; starting at 1 is not a detail.`
          : nums.length === 1
            ? `One pile of ${nums[0]} in ${h} hours: speed ${answer}. Notice the rounding — ${nums[0]} ÷ ${h} is ${(nums[0] / h).toFixed(2)}, and the answer is the ceiling of it.`
            : `Speed ${answer} finishes in ${hoursAt(nums, answer)} hours; speed ${answer - 1} would need ${hoursAt(nums, answer - 1)}. The answer is a boundary — the first speed that works — and everything faster works too.`,
  }
}

/** Rung 1 — try every speed from 1 upward. */
function* everySpeed({ nums, h }: P): Generator<DFrame> {
  const biggest = Math.max(...nums)
  let tried = 0
  yield {
    line: 3,
    marks: {},
    state: [{ label: "speed", value: 1 }],
    note: "Start at the slowest legal speed and walk upward until one of them fits in the time. The first that fits is by definition the slowest that fits.",
  }
  for (let k = 1; k <= biggest; k++) {
    const t = hoursAt(nums, k)
    tried++
    const ok = t <= h
    yield {
      line: 4,
      marks: marksOf(nums.length, (i) =>
        Math.ceil(nums[i] / k) > 1 ? "focus" : "dim"
      ),
      state: [
        { label: "speed", value: k },
        { label: "hours", value: `${t} of ${h}` },
      ],
      note: ok
        ? `Speed ${k} needs ${t} ${t === 1 ? "hour" : "hours"}, which fits. Every slower speed was checked and did not — so this is the answer, and the walk stops here.`
        : `Speed ${k} needs ${t} hours, over the ${h} available. The lit piles are the ones still taking more than an hour. Try ${k + 1}.`,
    }
    if (ok) break
  }
  const answer = slowestSpeed(nums, h)
  yield {
    line: 5,
    answer,
    marks: marksOf(nums.length, () => "answer"),
    state: [
      { label: "answer", value: answer },
      { label: "speeds tried", value: tried },
      { label: "range", value: `1 … ${biggest}` },
    ],
    corner: answer === 1 ? "slow" : undefined,
    note: `${answer}, after trying ${tried} ${tried === 1 ? "speed" : "speeds"}. Correct — and the range it walks is 1 to the largest pile, which the constraints allow to be a billion. The number of PILES is small; the range of answers is not.`,
  }
}

/** Rung 2 — binary search the speeds. */
function* searchSpeeds({ nums, h }: P): Generator<DFrame> {
  let lo = 1
  let hi = Math.max(...nums)
  let probes = 0
  yield {
    line: 6,
    marks: marksOf(nums.length, (i) => (nums[i] === hi ? "anchor" : undefined)),
    state: [
      { label: "lo", value: lo },
      { label: "hi", value: hi },
    ],
    corner: "monotone",
    note: `The range is 1 to ${hi}, the largest pile — nothing faster can ever help, because one pile per hour is already one hour. And the crucial property: if a speed works, every faster speed works too. That single flip from no to yes is what a binary search needs, and it does not need an array to search.`,
  }
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const t = hoursAt(nums, mid)
    probes++
    const ok = t <= h
    if (ok) hi = mid
    else lo = mid + 1
    yield {
      line: ok ? 10 : 12,
      marks: marksOf(nums.length, (i) =>
        Math.ceil(nums[i] / mid) > 1 ? "focus" : "dim"
      ),
      state: [
        { label: "mid", value: mid },
        { label: "hours", value: `${t} of ${h}` },
        { label: "range", value: `${lo} … ${hi}` },
      ],
      note: ok
        ? `Speed ${mid} finishes in ${t} — it works, so nothing FASTER than it can be the answer, and the top half of the range is gone. Note that mid stays in the range: it might still be the slowest one that works.`
        : `Speed ${mid} needs ${t} hours and only ${h} are available, so ${mid} and everything slower is impossible. The range starts at ${mid + 1} now.`,
    }
  }
  const answer = slowestSpeed(nums, h)
  yield {
    line: 13,
    answer,
    marks: marksOf(nums.length, () => "answer"),
    state: [
      { label: "answer", value: answer },
      { label: "probes", value: probes },
      { label: "hours used", value: `${hoursAt(nums, answer)} of ${h}` },
    ],
    corner:
      answer === Math.max(...nums)
        ? "tight"
        : nums.length === 1
          ? "onepile"
          : undefined,
    note: `${answer}, found in ${probes} ${probes === 1 ? "probe" : "probes"} rather than ${answer} steps. The search never touched the array's ORDER — the piles were only ever summed. What was searched is the space of answers, and that is the move worth taking away: a monotone yes/no question over a numeric range is a binary search, array or no array.`,
  }
}

export const kokoBananas = deriveJourney<number>(problem, {
  slug: "search-the-answer-not-the-row",
  subtitle:
    "a monotone yes/no over a range is a binary search, with no array in sight",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "more piles" },
  params: [{ key: "h", label: "hours (h)" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const h = (d as P).h
    if (!nums.length || !nums.every((v) => Number.isInteger(v) && v >= 1))
      return { ok: false, warning: "piles are whole numbers of at least 1" }
    return Number.isInteger(h) && h >= nums.length
      ? { ok: true }
      : {
          ok: false,
          warning:
            "h must be at least the number of piles — an hour cannot be shared between two piles",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [3, 6, 7, 11],
      extra: { h: 8 },
      info: "the answer is 4",
    },
    tight: {
      label: "one hour per pile",
      nums: [3, 6, 7, 11],
      extra: { h: 4 },
      info: "speed must reach the largest pile",
    },
    slow: {
      label: "all the time in the world",
      nums: [3, 6, 7, 11],
      extra: { h: 27 },
      info: "speed 1 is enough",
    },
    onepile: {
      label: "a single pile",
      nums: [10],
      extra: { h: 3 },
      info: "rounding decides it",
    },
    equal: {
      label: "piles all the same",
      nums: [5, 5, 5, 5],
      extra: { h: 8 },
      info: "no pile is special",
    },
    wide: {
      label: "one enormous pile",
      nums: [1, 1, 1, 100],
      extra: { h: 10 },
      info: "the range is 1 to 100",
    },
    long: {
      label: "more piles",
      nums: [30, 11, 23, 4, 20, 8, 15, 6],
      extra: { h: 20 },
      info: "eight piles, twenty hours",
    },
  },
  edges: [
    {
      key: "tight",
      name: "exactly one hour per pile",
      example: "four piles and four hours → the speed is the largest pile",
      why: "The deadline cannot be tighter than one hour per pile, so this is where the answer hits its ceiling. It also fixes the top of the search range: no speed above the largest pile ever helps, because an hour is spent on one pile whatever the speed.",
      think: "What is the fastest speed that could ever be useful?",
      preset: "tight",
      constraint: 3,
    },
    {
      key: "slow",
      name: "the deadline is generous",
      example: "27 hours for piles summing to 27 → speed 1",
      why: "1 is the floor of the range and a legal answer. A search seeded at 0 divides by zero on its first probe, and one seeded at the average silently skips the answer when it lies below.",
      think:
        "What is the slowest speed your range allows, and can you divide by it?",
      preset: "slow",
      constraint: 2,
    },
    {
      key: "onepile",
      name: "the rounding is the whole answer",
      example: "one pile of 10 in 3 hours → speed 4, not 3",
      why: "10 ÷ 3 is 3.33, and a third of an hour is not available: the hours per pile round UP. Integer division here gives 3, which needs four hours and misses the deadline by one.",
      think: "Does your hours-needed calculation round up or truncate?",
      preset: "onepile",
      constraint: 3,
    },
    {
      key: "monotone",
      name: "feasibility flips exactly once",
      example: "speeds 1, 2, 3 fail and 4, 5, 6 … all work",
      why: "This is the property the binary search rests on, and it is worth stating rather than assuming: eating faster never needs more hours. Without it, halving the range would be guessing.",
      think: "Why is it safe to discard every speed above one that works?",
      preset: "wide",
      constraint: 1,
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
        "given: piles of bananas, and h hours",
        "an hour is spent on ONE pile, whatever the speed",
        "so a pile of p at speed k costs ceil(p / k) hours",
        "task: the smallest whole speed that finishes within h hours",
      ],
      tools: [
        {
          name: "The piles",
          role: "the row on screen — and note that nothing here ever reorders it or looks at neighbouring piles. Only the total hours matter, which is a hint about where the real search happens.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "hours per pile round UP: leftover time in an hour is wasted",
        "no speed above the largest pile helps, and speed 0 is not a speed",
        "if a speed works, every faster speed works — so the answer is a boundary, not a needle",
      ],
      quiz: [
        {
          q: "At speed 5, how many hours does a pile of 6 take?",
          choices: [
            "1.2",
            "2 — an hour is spent on one pile, and the remainder needs its own",
          ],
          answer: 1,
          explain:
            "The rounding up is the rule that makes this problem discrete. Truncating instead is the most common wrong answer here.",
        },
      ],
      run: story,
    },
    {
      key: "walk",
      name: "Try 1, then 2, then 3",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Start at speed 1 and increase until the piles fit in the hours available. The first speed that fits is the answer.",
      takeaways: [
        "the first speed that fits is the slowest that fits — no extra bookkeeping needed",
        "each check costs a pass over the piles, which is fine",
        "what is not fine is the number of checks: the range is 1 to the largest pile, and a pile may hold a billion bananas",
      ],
      quiz: [
        {
          q: "What decides how many speeds this version tries?",
          choices: [
            "the number of piles",
            "the answer itself — it walks up to it one speed at a time",
          ],
          answer: 1,
          explain:
            "Which is why a few piles can still be slow: the cost tracks the SIZE of the piles, not how many there are.",
        },
      ],
      run: everySpeed,
    },
    {
      key: "binary",
      name: "Halve the range of speeds",
      short: "search the answer",
      insight:
        "Walking the speeds one at a time crosses a range as wide as the largest pile — and every speed below the answer fails while every speed above it works, which is a great deal more structure than a walk uses.",
      idea: problem.whyNow!,
      takeaways: [
        "the range is 1 to the largest pile: below is illegal, above is never useful",
        "feasibility flips from no to yes exactly once, and a binary search finds exactly that boundary",
        "a working speed keeps mid IN the range — it might be the slowest one that works",
        "nothing is searched in the array; the search space is the answers, which is the move that generalises",
      ],
      quiz: [
        {
          q: "This is binary search without a sorted array. What is being searched?",
          choices: [
            "the piles, after sorting them",
            "the range of possible answers — the piles are only ever summed",
          ],
          answer: 1,
          explain:
            "The same shape solves shipping capacities and split arrays. What makes it work is a monotone yes/no over a numeric range, not an array.",
        },
      ],
      run: searchSpeeds,
    },
  ],
})
