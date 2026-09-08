// Longest Increasing Subsequence, derived. Three rungs and two different
// ideas: writing down the answer per position (n²), and then storing something
// else entirely — the smallest tail per achievable length — which turns the
// inner scan into a binary search.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/longest-increasing-run.ts"

type N = Data<number>

export function longestIncreasing(nums: number[]) {
  if (!nums.length) return { best: 0, pick: [] as number[] }
  const len = nums.map(() => 1)
  const from = nums.map(() => -1)
  for (let i = 1; i < nums.length; i++)
    for (let j = 0; j < i; j++)
      if (nums[j] < nums[i] && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1
        from[i] = j
      }
  let end = 0
  for (let i = 1; i < nums.length; i++) if (len[i] > len[end]) end = i
  const pick: number[] = []
  for (let i = end; i >= 0; i = from[i]) {
    pick.unshift(i)
    if (from[i] < 0) break
  }
  return { best: len[end], pick }
}

const chosen = (n: number, pick: number[]) =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [i, pick.includes(i) ? "answer" : "dim"])
  ) as Record<number, ChipRole>

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Pick values out of this row, keeping the order they arrived in, so that each one is strictly larger than the last. You may skip as many as you like. How long can that selection get?",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Skipping is what separates this from every stretch problem: the picks do not have to be neighbours. That makes the search space every subset of the row rather than every window in it — and the answer is a length, never the picks themselves.",
  }
  const { best, pick } = longestIncreasing(nums)
  const contiguous = pick.every((v, i) => i === 0 || v === pick[i - 1] + 1)
  yield {
    hold: 3,
    marks: chosen(nums.length, pick),
    state: [{ label: "longest", value: best }],
    answer: best,
    corner:
      nums.every((v) => v === nums[0]) && nums.length > 1
        ? "equal"
        : nums.every((v, i) => i === 0 || v < nums[i - 1])
          ? "decreasing"
          : !contiguous
            ? "scattered"
            : undefined,
    note:
      nums.every((v) => v === nums[0]) && nums.length > 1
        ? `Every value is the same, so nothing can be strictly larger than anything else — the answer is 1. STRICTLY is doing all the work in that sentence: a comparison written with ≥ answers ${nums.length}.`
        : nums.every((v, i) => i === 0 || v < nums[i - 1])
          ? "The row only ever falls, so no value can follow another — the answer is 1. Every single element is a selection of length one, which is why 1 rather than 0 is the floor."
          : !contiguous
            ? `The longest selection is ${pick.map((i) => nums[i]).join(", ")} — length ${best} — and it is taken from positions ${pick.join(", ")}, which are not adjacent. Anything measuring runs of neighbours sees something much shorter.`
            : `The longest selection is ${pick.map((i) => nums[i]).join(", ")}, length ${best}.`,
  }
}

function* everySubset({ nums }: N): Generator<DFrame> {
  let best = 0
  let explored = 0
  let bestPick: number[] = []
  const walk = function* (
    i: number,
    previous: number,
    taken: number[]
  ): Generator<DFrame> {
    if (i === nums.length) {
      explored += 1
      if (taken.length > best) {
        best = taken.length
        bestPick = [...taken]
        yield {
          line: 3,
          marks: chosen(nums.length, bestPick),
          state: [
            { label: "length", value: best },
            { label: "paths tried", value: explored },
          ],
          note: `A longer selection: ${bestPick.map((k) => nums[k]).join(", ") || "nothing"} — length ${best}, found after trying ${explored} complete choice${explored === 1 ? "" : "s"}.`,
        }
      }
      return
    }
    yield* walk(i + 1, previous, taken)
    if (nums[i] > previous) yield* walk(i + 1, nums[i], [...taken, i])
  }
  yield* walk(0, -Infinity, [])
  yield {
    line: 9,
    answer: best,
    marks: chosen(nums.length, bestPick),
    state: [
      { label: "longest", value: best },
      { label: "paths tried", value: explored },
    ],
    note: `${best}, after exploring all ${explored} take-or-skip combinations. Two branches at every position: ${nums.length} positions, ${explored} paths. Add one element to the row and that number doubles.`,
  }
}

function* endingHere({ nums }: N): Generator<DFrame> {
  const len = nums.map(() => 1)
  yield {
    line: 3,
    hold: 2,
    marks: { 0: "answer" },
    state: [{ label: "best ending at 0", value: 1 }],
    note: "Ask a narrower question: how long is the longest selection ENDING at each position? At the first, only itself — length 1. Every position starts there, since a single element is always a legal selection.",
  }
  for (let i = 1; i < nums.length; i++) {
    let from = -1
    for (let j = 0; j < i; j++)
      if (nums[j] < nums[i] && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1
        from = j
      }
    yield {
      line: 7,
      marks: {
        ...(Object.fromEntries(
          Array.from({ length: i }, (_, k) => [
            k,
            nums[k] < nums[i] ? "focus" : "dim",
          ])
        ) as Record<number, ChipRole>),
        [i]: "answer",
        ...(from >= 0 ? { [from]: "anchor" as ChipRole } : {}),
      },
      state: [
        { label: `ending at ${i}`, value: len[i] },
        { label: "scanned", value: i },
      ],
      note:
        from >= 0
          ? `Position ${i} holds ${nums[i]}. Of the ${i} earlier positions, the best one it can extend is ${from} (${nums[from]}), whose own answer is ${len[from]} — so ending at ${i} the longest is ${len[i]}.`
          : `Position ${i} holds ${nums[i]}, and nothing before it is smaller, so it can extend nothing. Ending here the longest is 1 — it starts a selection rather than continuing one.`,
    }
  }
  const best = Math.max(...len)
  yield {
    line: 8,
    answer: best,
    state: [{ label: "longest", value: best }],
    note: `The largest of those is ${best}. Each position is solved once instead of re-explored — but solving it means scanning every earlier position, and that scan is the whole n² that is left.`,
  }
}

function* tails({ nums }: N): Generator<DFrame> {
  const list: number[] = []
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    let lo = 0
    let hi = list.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (list[mid] < x) lo = mid + 1
      else hi = mid
    }
    const grew = lo === list.length
    const replaced = grew ? null : list[lo]
    if (grew) list.push(x)
    else list[lo] = x
    yield {
      line: grew ? 8 : 10,
      marks: { [i]: grew ? "answer" : "focus" },
      state: [
        { label: "smallest tails", value: list.join(", ") },
        { label: "longest", value: list.length },
      ],
      note: grew
        ? `${x} is larger than every tail held, so it extends the longest selection there is: a selection of length ${list.length} now exists, and ${x} is the smallest value one can end with.`
        : `${x} is not big enough to extend the longest selection, but it IS a smaller ending for a selection of length ${lo + 1} than ${replaced} was. Replace it. The count does not change — the room for future values does.`,
    }
  }
  yield {
    line: 11,
    answer: list.length,
    state: [
      { label: "smallest tails", value: list.join(", ") },
      { label: "longest", value: list.length },
    ],
    note: `${list.length}. The list is NOT a selection — those values may not even sit in that order in the row. Its LENGTH is the answer, because entry k is the smallest value any selection of length k + 1 can end with, and a shorter list would mean no such selection exists.`,
  }
}

export const longestIncreasingRun = deriveJourney(problem, {
  slug: "longest-rising-pick",
  subtitle: "store the answer per position, or the smallest tail per length",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  presets: {
    example: { label: "the example", nums: [10, 9, 2, 5, 3, 7, 101, 18] },
    equal: {
      label: "every value the same",
      nums: [7, 7, 7],
      info: "strictly increasing means equal is no good",
    },
    decreasing: {
      label: "it only falls",
      nums: [5, 4, 3, 2, 1],
      info: "nothing can follow anything",
    },
    single: { label: "one value", nums: [4], info: "a selection of one" },
    rising: {
      label: "already increasing",
      nums: [1, 3, 5, 9],
      info: "take everything",
    },
    long: {
      label: "a longer row",
      nums: [3, 10, 2, 1, 20, 4, 6, 21, 5, 7],
    },
  },
  edges: [
    {
      key: "equal",
      name: "every value is the same",
      example: "[7, 7, 7] → 1",
      why: "Strictly increasing means an equal value cannot follow. A comparison written with >= instead of > answers 3 here, and it will answer wrongly on any row with a repeat.",
      think: "Does your comparison allow an equal value to extend a selection?",
      preset: "equal",
      constraint: 2,
    },
    {
      key: "decreasing",
      name: "the row only falls",
      example: "[5, 4, 3, 2, 1] → 1",
      why: "No value can follow another, so every selection is a single element. The answer is 1, not 0 — a lone element is a legal selection, and the floor has to say so.",
      think: "What is the shortest legal answer, and does your starting value match it?",
      preset: "decreasing",
      constraint: 0,
    },
    {
      key: "scattered",
      name: "the picks are not adjacent",
      example: "[10, 9, 2, 5, 3, 7, 101, 18] → 4",
      why: "The answer is 2, 3, 7, 101 — taken from positions 2, 4, 5 and 6, skipping the 5 in between. Anything measuring runs of neighbours sees 3 at best.",
      think: "Are you looking for a stretch of the row, or a selection from it?",
      preset: "example",
      constraint: 3,
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
        "given: a row of integers",
        "pick values in the order they appear, skipping freely",
        "each pick must be STRICTLY larger than the one before",
        "task: return the LENGTH of the longest such pick",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row addressed by position. Position fixes only the ORDER of the picks, never which are adjacent — the selection may leave arbitrary gaps.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "skipping is allowed, so this is a selection and not a stretch",
        "strictly increasing: equal values cannot both be taken",
        "the answer is a length, so the picks themselves never have to be kept",
        "one element is always a legal selection, so the floor is 1 for any non-empty row",
      ],
      quiz: [
        {
          q: "The row is [7, 7, 7]. How long is the longest strictly increasing selection?",
          choices: ["3", "1"],
          answer: 1,
          explain:
            "No 7 is strictly larger than another 7, so no two of them can be taken together. One element on its own is the best available.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Try taking and skipping everything",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "At each position make both choices — take this value if it is larger than the last one taken, or skip it — and report the deepest selection any path reached.",
      takeaways: [
        "two branches per position, so 2ⁿ paths",
        "correct, and unusable past twenty or so elements",
        "the same suffix is re-solved once per path that arrives at it, which is exactly what a table fixes",
      ],
      run: everySubset,
    },
    {
      key: "table",
      name: "The longest selection ending here",
      short: "each position solved once",
      from: 1,
      insight:
        "Every path that reaches a position with the same last-taken value faces an identical remaining problem, and the recursion re-solves it every time. Ask instead, for each position, how long a selection can END there — that is one question per position, not one per path.",
      idea: "Let each position hold the length of the longest increasing selection that ends exactly there. It is one more than the best of the earlier positions holding a smaller value, or 1 if there are none. The answer is the largest entry.",
      takeaways: [
        "defining the answer AT a position is what collapses the exponential",
        "every entry starts at 1: a single element is always a legal selection",
        "and building each entry means scanning every earlier position — n² comparisons",
      ],
      quiz: [
        {
          q: "Why does each entry start at 1 rather than 0?",
          choices: [
            "to avoid an empty answer",
            "because the element itself is already a legal selection of length one",
          ],
          answer: 1,
          explain:
            "It is not a guard, it is the truth. A position that can extend nothing still ends a selection — its own.",
        },
      ],
      run: endingHere,
    },
    {
      key: "tails",
      name: "The smallest ending for each length",
      short: "n log n, and it stops scanning",
      insight:
        "The inner scan asks 'which earlier position can I extend?' — and the answer only ever depends on how SMALL that position's selection ends, not on where it is. Keep one number per achievable length instead: the smallest value a selection of that length can end with.",
      idea: problem.whyNow!,
      takeaways: [
        "entry k is the smallest value any selection of length k + 1 can end with",
        "that list is increasing by construction, so the right slot is a binary search, not a scan",
        "a value either extends the list — a longer selection exists — or lowers one entry, making room for later values",
        "the list is NOT the selection: only its LENGTH is the answer",
      ],
      quiz: [
        {
          q: "Replacing an entry does not change the list's length. Why do it?",
          choices: [
            "to keep the list sorted",
            "because a smaller ending for that length leaves more values able to extend it later",
          ],
          answer: 1,
          explain:
            "A selection of length k that ends at 3 can be continued by far more of the row than one ending at 90. The count is unchanged; the future is not.",
        },
      ],
      run: tails,
    },
  ],
})
