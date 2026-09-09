// Partition into Two Equal Halves, derived.
//
// The stage is the ROW of reachable sums, drawn as a grid of one row so each
// sum sits under its own index — the picture the algorithm actually works on.
// What it exists to show is the DIRECTION of the sweep: downward reuses each
// number once, upward reuses it as many times as it fits, and the two differ
// by the sign in a loop.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/partition-equal-subset.ts"

type N = Data<number>

const sum = (xs: number[]) => xs.reduce((t, v) => t + v, 0)

/** The reference: can the numbers be split into two groups of equal sum? */
export function canPartition(nums: number[]) {
  const total = sum(nums)
  if (total % 2 === 1) return false
  const target = total / 2
  const reachable = Array.from({ length: target + 1 }, () => false)
  reachable[0] = true
  for (const x of nums)
    for (let s = target; s >= x; s--) if (reachable[s - x]) reachable[s] = true
  return reachable[target]
}

/** The same sweep going UP — each number reusable, which is a different problem. */
export function canPartitionUpward(nums: number[]) {
  const total = sum(nums)
  if (total % 2 === 1) return false
  const target = total / 2
  const reachable = Array.from({ length: target + 1 }, () => false)
  reachable[0] = true
  for (const x of nums)
    for (let s = x; s <= target; s++) if (reachable[s - x]) reachable[s] = true
  return reachable[target]
}

/** One subset that reaches the target, for the story act to point at. */
function halfOf(nums: number[]) {
  const total = sum(nums)
  if (total % 2 === 1) return null
  const target = total / 2
  const from = new Map<number, number>([[0, -1]])
  for (let i = 0; i < nums.length; i++) {
    const snapshot = [...from.entries()]
    for (const [s] of snapshot) {
      const next = s + nums[i]
      if (next <= target && !from.has(next)) from.set(next, i)
    }
  }
  if (!from.has(target)) return null
  const picked: number[] = []
  let s = target
  while (s > 0) {
    const i = from.get(s)!
    picked.push(i)
    s -= nums[i]
  }
  return picked
}

/** The reachable row, drawn as a single grid row indexed by sum. */
const row = (
  reachable: boolean[],
  label: string,
  mark?: (s: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  reachable.forEach((_, s) => {
    const m = mark?.(s)
    if (m) marks[`1,${s}`] = m
  })
  return {
    cells: [
      reachable.map((_, s) => s),
      reachable.map((v) => (v ? "✓" : "·")),
    ] as (number | string)[][],
    marks,
    label,
  }
}

function* story({ nums }: N): Generator<DFrame> {
  const total = sum(nums)
  const answer = canPartition(nums)
  const picked = halfOf(nums)
  yield {
    hold: 3,
    noChips: true,
    note: "A bag of positive numbers. Can it be split into two groups with the same total? Every number goes into exactly one group — none may be left out, and none may be cut in half.",
  }
  yield {
    hold: 3,
    state: [
      { label: "total", value: total },
      { label: "half", value: total / 2 },
    ],
    marks: {},
    corner: total % 2 === 1 ? "odd" : undefined,
    note:
      total % 2 === 1
        ? `The total is ${total}, which is odd. Two equal whole halves of an odd number do not exist, so the answer is already false — one line, before any searching at all.`
        : `The total is ${total}, so each half would have to be ${total / 2}. That reframes the whole problem: not 'find two groups' but 'can any subset reach ${total / 2}'.`,
  }
  yield {
    hold: 3,
    marks: (picked ?? []).reduce<Record<number, ChipRole>>((m, i) => {
      m[i] = "answer"
      return m
    }, {}),
    state: [
      { label: "answer", value: String(answer) },
      ...(picked
        ? [{ label: "one half", value: picked.map((i) => nums[i]).join(" + ") }]
        : []),
    ],
    answer,
    corner:
      total % 2 === 1
        ? "odd"
        : !answer
          ? "unreachable"
          : picked && picked.length !== nums.length - picked.length
            ? "sizes"
            : undefined,
    note:
      total % 2 === 1
        ? "So this one never reaches the interesting part. Worth keeping: the parity check is not an optimisation, it is a whole class of inputs answered for free."
        : !answer
          ? `The total is even and it still cannot be done — no subset adds up to ${total / 2}. Even is necessary and not sufficient, which is exactly why the parity test cannot be the whole answer.`
          : picked && picked.length !== nums.length - picked.length
            ? `Yes: ${picked.map((i) => nums[i]).join(" + ")} on one side, the rest on the other. Note the group SIZES differ — only the sums have to match, and expecting equal counts is a way to answer a harder question by mistake.`
            : `Yes: ${picked!.map((i) => nums[i]).join(" + ")} against the rest.`,
  }
}

/** Rung 1 — take it or leave it, over every element. */
function* everySubset({ nums }: N): Generator<DFrame> {
  const total = sum(nums)
  if (total % 2 === 1) {
    yield {
      line: 11,
      answer: false,
      marks: {},
      state: [{ label: "total", value: total }],
      corner: "odd",
      note: `The total ${total} is odd, so the recursion is never entered. Even the exhaustive version wants this test first — it removes half of all possible inputs for the price of one modulo.`,
    }
    return
  }
  const target = total / 2
  let calls = 0
  const states = new Set<string>()
  let repeats = 0
  let found = false
  function* walk(at: number, remaining: number): Generator<DFrame, boolean> {
    calls++
    const key = `${at},${remaining}`
    if (states.has(key)) repeats++
    states.add(key)
    if (remaining === 0) {
      found = true
      yield {
        line: 2,
        marks: {},
        state: [
          { label: "remaining", value: 0 },
          { label: "calls", value: calls },
        ],
        note: `Nothing left to reach — some combination of the numbers behind us adds up to exactly ${target}. That answer now travels all the way back up the recursion.`,
      }
      return true
    }
    if (at === nums.length || remaining < 0) return false
    yield {
      line: 5,
      marks: Object.fromEntries(
        nums
          .map((_, i) => [i, i < at ? "dim" : i === at ? "focus" : undefined])
          .filter(([, v]) => v) as [number, ChipRole][]
      ),
      state: [
        { label: "at", value: nums[at] },
        { label: "remaining", value: remaining },
        { label: "calls", value: calls },
      ],
      note: `${nums[at]} is either in the first group or in the second — both are tried. The state that matters is only how much is left to reach: ${remaining}.`,
    }
    if (yield* walk(at + 1, remaining - nums[at])) return true
    return yield* walk(at + 1, remaining)
  }
  yield* walk(0, target)
  const answer = canPartition(nums)
  yield {
    line: 12,
    answer,
    marks: {},
    state: [
      { label: "answer", value: String(answer) },
      { label: "calls", value: calls },
      { label: "states repeated", value: repeats },
    ],
    corner: !answer ? "unreachable" : undefined,
    note: `${answer}, after ${calls} calls, of which ${repeats} asked a question already asked elsewhere. Two branches per element is 2^${nums.length} in the worst case — and yet the state is only (position, remaining), so there are far fewer distinct questions than calls. ${found ? "" : "Every branch ran out."}`,
  }
}

/** Rung 2 — a row of reachable sums, swept downward. */
function* reachableRow({ nums }: N): Generator<DFrame> {
  const total = sum(nums)
  if (total % 2 === 1) {
    yield {
      line: 3,
      answer: false,
      marks: {},
      state: [{ label: "total", value: total }],
      corner: "odd",
      note: `${total} is odd, so no split exists and the function returns before allocating anything. The cheapest possible answer.`,
    }
    return
  }
  const target = total / 2
  const reachable = Array.from({ length: target + 1 }, () => false)
  reachable[0] = true
  yield {
    line: 6,
    grid: row(reachable, "sum 0 is reachable by taking nothing", (s) =>
      s === 0 ? "anchor" : undefined
    ),
    state: [{ label: "target", value: target }],
    note: `One boolean per sum from 0 to ${target}. Sum 0 is reachable before any number is used — take nothing — and everything else grows out of that single true.`,
  }
  for (const x of nums) {
    const before = [...reachable]
    const turned: number[] = []
    for (let s = target; s >= x; s--)
      if (reachable[s - x] && !reachable[s]) {
        reachable[s] = true
        turned.push(s)
      }
    yield {
      line: 10,
      grid: row(reachable, `after using ${x}`, (s) =>
        turned.includes(s) ? "answer" : before[s] ? "dim" : undefined
      ),
      state: [
        { label: "number", value: x },
        {
          label: "new sums",
          value: turned.length ? turned.join(", ") : "none",
        },
      ],
      corner: turned.length ? "downward" : undefined,
      note: turned.length
        ? `${x} makes ${turned.length} new ${turned.length === 1 ? "sum" : "sums"} reachable: ${turned.join(", ")}. The sweep runs DOWNWARD, from ${target} to ${x}, so every cell it reads was written before this number arrived — which is what uses ${x} exactly once. Sweeping upward, a cell just turned on would be read again in the same pass and ${x} would be spent twice.`
        : `${x} adds nothing new — every sum it could reach was already reachable another way. Two subsets with the same total are the same state, and that collapse is the whole saving.`,
    }
  }
  const answer = canPartition(nums)
  const picked = halfOf(nums)
  yield {
    line: 11,
    answer,
    grid: row(
      reachable,
      answer ? `${target} is reachable` : `${target} is not reachable`,
      (s) =>
        s === target
          ? answer
            ? "answer"
            : "focus"
          : reachable[s]
            ? "dim"
            : undefined
    ),
    state: [
      { label: "answer", value: String(answer) },
      { label: "sums reachable", value: reachable.filter(Boolean).length },
      ...(picked
        ? [{ label: "one half", value: picked.map((i) => nums[i]).join(" + ") }]
        : []),
    ],
    corner: !answer
      ? "unreachable"
      : picked && picked.length !== nums.length - picked.length
        ? "sizes"
        : undefined,
    note: `${answer}. ${reachable.filter(Boolean).length} of the ${target + 1} sums turned out reachable, and the only cell that was ever asked about is ${target}. The work is bounded by the TOTAL rather than by the number of elements — which is why 200 numbers are fine and a huge total would not be.`,
  }
}

export const partitionEqualSubset = deriveJourney<number>(problem, {
  slug: "half-of-everything",
  subtitle: "sweep downward, and each number is spent exactly once",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "more numbers" },
  classify: (d) => {
    const nums = d.nums as number[]
    return nums.length > 0 &&
      nums.every((v) => Number.isInteger(v) && v >= 1 && v <= 100)
      ? { ok: true }
      : {
          ok: false,
          warning: "positive whole numbers, each between 1 and 100",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 5, 11, 5],
      info: "[11] against [1, 5, 5]",
    },
    odd: {
      label: "an odd total",
      nums: [1, 2, 3, 5],
      info: "false without any search",
    },
    unreachable: {
      label: "even, and still impossible",
      nums: [2, 2, 3, 5],
      info: "half is 6, nothing reaches it",
    },
    sizes: {
      label: "groups of different sizes",
      nums: [1, 1, 1, 3],
      info: "three against one",
    },
    pair: {
      label: "two equal numbers",
      nums: [4, 4],
      info: "the smallest true case",
    },
    single: {
      label: "one number",
      nums: [7],
      info: "odd total, so false",
    },
    long: {
      label: "more numbers",
      nums: [3, 1, 4, 2, 2, 1, 5, 2],
      info: "total 20, half 10",
    },
  },
  edges: [
    {
      key: "odd",
      name: "an odd total",
      example: "[1, 2, 3, 5] sums to 11 → false",
      why: "Two equal whole halves of an odd number cannot exist, so the answer is decided before any work. It is not an optimisation — the table below is indexed by half the total, and half of an odd number is not an index.",
      think: "What does your table's size become when the total is odd?",
      preset: "odd",
      constraint: 2,
    },
    {
      key: "unreachable",
      name: "an even total that still cannot be split",
      example: "[2, 2, 3, 5] sums to 12, and nothing reaches 6",
      why: "Even is necessary and not sufficient. A solution that stops at the parity check is right on half its inputs, which is exactly enough to look like it works.",
      think: "Is your parity test an early rejection, or an answer?",
      preset: "unreachable",
      constraint: 2,
    },
    {
      key: "sizes",
      name: "the two groups are different sizes",
      example: "[1, 1, 1, 3] → [3] against [1, 1, 1]",
      why: "Only the sums have to match. Requiring equal counts as well answers a harder question, and the mistake is invisible on inputs where a balanced split happens to exist.",
      think:
        "Does anything in your solution care how MANY numbers are on each side?",
      preset: "sizes",
      constraint: 3,
    },
    {
      key: "downward",
      name: "the sweep must run downward",
      example: "[4, 4] with an upward sweep: 4 alone reaches 8",
      why: "Going upward reads cells that this same number has just written, so one number is spent twice and sums become reachable that no real subset can make. The direction of a loop is the entire difference between 'use each once' and 'use each freely'.",
      think: "When you write reachable[s], could the same pass read it again?",
      preset: "pair",
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
        "given: positive whole numbers, every one of which must be used",
        "split them into two groups",
        "task: return whether the two groups can have equal sums",
        "the groups need not be the same size",
      ],
      tools: [
        {
          name: "A bag of numbers",
          role: "the row. Order is irrelevant here — what matters is which totals can be made — so the picture that solves this problem is not the row but a line of sums.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "equal halves means each group is exactly half the total, so the target is known before anything is searched",
        "an odd total is impossible, and that costs one modulo to find out",
        "the question becomes 'can any subset reach the target', which is a yes/no about sums rather than a search for groups",
      ],
      quiz: [
        {
          q: "The numbers total 11. How much work is needed to answer?",
          choices: [
            "search every subset",
            "none — an odd total cannot be split into two equal whole halves",
          ],
          answer: 1,
          explain:
            "Parity settles it. It is the cheapest test in the problem and it removes half of all possible inputs.",
        },
      ],
      run: story,
    },
    {
      key: "subsets",
      name: "Take it or leave it",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the numbers, trying each in both groups, and report whether any combination reaches half the total.",
      takeaways: [
        "two branches per number, so 2^n paths in the worst case",
        "the state each call actually depends on is small: where we are, and how much is left",
        "so the same question is asked again and again down different paths",
        "which is the signal that the exponent is avoidable",
      ],
      quiz: [
        {
          q: "Two different sets of choices leave the same amount remaining at the same position. What do they have in common?",
          choices: [
            "nothing — they are different subsets",
            "everything that matters: the rest of the search depends only on the position and the remainder",
          ],
          answer: 1,
          explain:
            "That is precisely why the exponential collapses. What differs between them is a history nothing later reads.",
        },
      ],
      run: everySubset,
    },
    {
      key: "sums",
      name: "One row of reachable sums",
      short: "sweep downward",
      insight:
        "Almost all of those subsets differ only in a history that the rest of the search never reads — and two subsets with the same total behave identically from there on.",
      idea: problem.whyNow!,
      takeaways: [
        "one boolean per sum, seeded with 0 reachable by taking nothing",
        "each number turns on the sums it can now reach, and identical totals merge into one state",
        "the sweep runs DOWNWARD so a sum written by this number is never read by it again — that direction is the difference between using each number once and using it freely",
        "the cost is bounded by the total, not by the number of elements",
      ],
      quiz: [
        {
          q: "What breaks if the inner loop runs upward instead of downward?",
          choices: [
            "nothing — addition is commutative",
            "a sum just marked by this number gets read again in the same pass, so that number is spent more than once",
          ],
          answer: 1,
          explain:
            "Upward is the correct direction for a different problem — the one where each number may be reused. Same three lines, one sign apart.",
        },
      ],
      run: reachableRow,
    },
  ],
})
