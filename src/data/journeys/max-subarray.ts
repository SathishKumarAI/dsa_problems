// Best Contiguous Run, derived. Everything a Problem already carries — the
// ladder, the code, the complexities, the hints, the constraints — comes from
// ../problems/dp/max-subarray.ts; this file is only what a Problem cannot
// carry: the act framing, the quiz, the corner cases, and one generator per
// rung. See src/engine/derive.ts.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/max-subarray.ts"

// The best contiguous run, exhaustively — the narration quotes it, so it is
// computed rather than asserted.
function bestRun(nums: number[]) {
  let best = nums[0]
  let from = 0
  let to = 0
  for (let i = 0; i < nums.length; i++) {
    let total = 0
    for (let j = i; j < nums.length; j++) {
      total += nums[j]
      if (total > best) [best, from, to] = [total, i, j]
    }
  }
  return { best, from, to }
}

const span = (from: number, to: number, role: ChipRole = "focus") =>
  Object.fromEntries(
    Array.from({ length: to - from + 1 }, (_, k) => [from + k, role])
  ) as Record<number, ChipRole>

function* story({ nums }: Data): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A row of numbers, some of them losses. Pick a stretch of neighbours — no gaps, no reordering — and add it up. Which stretch adds up to the most?",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Two words carry the whole problem. CONTIGUOUS: the stretch is a window on the row, not a shopping list. NON-EMPTY: you must take at least one number, so a row of nothing but losses answers with its smallest loss, never with zero.",
  }
  const { best, from, to } = bestRun(nums)
  const crossesLoss = nums.slice(from, to + 1).some((v) => v < 0)
  yield {
    hold: 3,
    note: `${nums.length} number${nums.length === 1 ? "" : "s"}. There are ${(nums.length * (nums.length + 1)) / 2} stretches to choose between, and exactly one number to return: the total of the best of them.`,
  }
  yield {
    hold: 3,
    marks: span(from, to),
    state: [{ label: "answer", value: best }],
    answer: best,
    corner:
      nums.length === 1
        ? "single"
        : nums.every((v) => v < 0)
          ? "allneg"
          : crossesLoss
            ? "dip"
            : undefined,
    note:
      nums.length === 1
        ? `One number, so one stretch: ${best}. The smallest legal input still has an answer — that is what non-empty buys you.`
        : nums.every((v) => v < 0)
          ? `Every stretch here loses. The answer is ${best}, the least bad single number — a solution that reports 0 has quietly taken the stretch of no numbers at all, which was never allowed.`
          : `The answer is ${best}, held by positions ${from}…${to}${crossesLoss ? " — and it walks straight through a loss on the way, because what comes after pays for it" : ""}.`,
  }
}

function* brute({ nums }: Data): Generator<DFrame> {
  let best = nums[0]
  for (let i = 0; i < nums.length; i++) {
    let total = 0
    for (let j = i; j < nums.length; j++) {
      total += nums[j]
      const record = total > best
      if (record) best = total
      yield {
        line: 5,
        marks: { ...span(i, j), [i]: "anchor" },
        state: [
          { label: "total", value: total },
          { label: "best", value: best },
        ],
        note: `Start ${i}, end ${j}: that stretch totals ${total}. ${record ? "A new leader." : `Best so far is still ${best}.`}`,
      }
    }
  }
  yield {
    line: 8,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${(nums.length * (nums.length + 1)) / 2} totals added up, ${best} the largest. Correct — and it re-adds the same prefixes over and over, because the run from 0 to 5 is the run from 0 to 4 plus one number and this loop knows nothing about that.`,
  }
}

function* table({ nums }: Data): Generator<DFrame> {
  const ending = [nums[0]]
  yield {
    line: 2,
    marks: { 0: "anchor" },
    state: [{ label: "ending[0]", value: ending[0] }],
    note: `The best stretch ending exactly at position 0 can only be the number itself: ${nums[0]}.`,
  }
  for (let i = 1; i < nums.length; i++) {
    const carried = Math.max(ending[i - 1], 0)
    ending[i] = nums[i] + carried
    yield {
      line: 4,
      marks: { [i - 1]: "anchor", [i]: "focus" },
      state: [
        { label: `ending[${i - 1}]`, value: ending[i - 1] },
        { label: `ending[${i}]`, value: ending[i] },
      ],
      note: `At ${nums[i]}: the neighbour's entry is ${ending[i - 1]}, so ${carried === 0 ? "carrying it would only cost — drop it and begin again here" : "carry it"}. ending[${i}] = ${ending[i]}.`,
    }
  }
  const best = Math.max(...ending)
  yield {
    line: 5,
    answer: best,
    marks: span(0, nums.length - 1, "dim"),
    state: [{ label: "largest entry", value: best }],
    note: `One pass instead of ${(nums.length * (nums.length + 1)) / 2} sums, and the answer is the largest entry: ${best}. Look at what the array is used for, though — every entry is read exactly once, by the very next step.`,
  }
}

function* running({ nums }: Data): Generator<DFrame> {
  let run = nums[0]
  let best = nums[0]
  yield {
    line: 2,
    marks: { 0: "anchor" },
    state: [
      { label: "running", value: run },
      { label: "best", value: best },
    ],
    note: `Both numbers start at ${nums[0]}, not at 0 — seeding with zero would smuggle in the stretch of no numbers at all.`,
  }
  for (let i = 1; i < nums.length; i++) {
    const restart = run < 0
    run = nums[i] + Math.max(run, 0)
    const record = run > best
    best = Math.max(best, run)
    yield {
      line: 4,
      marks: { [i]: record ? "answer" : "focus", [i - 1]: "dim" },
      state: [
        { label: "running", value: run },
        { label: "best", value: best },
      ],
      note: `At ${nums[i]}: the carried total was ${restart ? "a liability, so it is dropped and the stretch begins again here" : "worth keeping, so the stretch extends"}. running = ${run}${record ? ", a new best" : `, best still ${best}`}.`,
    }
  }
  yield {
    line: 6,
    answer: best,
    state: [{ label: "answer", value: best }],
    note: `${best}, in one pass and two variables. The array was never needed: an entry read once, by the step immediately after it, is a variable wearing an array's clothes.`,
  }
}

export const maxSubarray = deriveJourney(problem, {
  slug: "best-contiguous-run",
  subtitle: "one number to carry, and the single decision that sets it",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  presets: {
    example: { label: "the example", nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    negatives: {
      label: "nothing but losses",
      nums: [-3, -1, -2],
      info: "every total is below zero — what should the answer be?",
    },
    one: { label: "a single number", nums: [7], info: "the smallest legal row" },
    dip: {
      label: "a loss worth crossing",
      nums: [4, -1, 2, 1, -5, 4],
      info: "the winning stretch walks through a negative",
    },
    long: {
      label: "a longer row",
      nums: [8, -19, 5, -4, 20, -3, 4, -1, 2, 1, -5, 4, 11, -20, 7],
    },
  },
  edges: [
    {
      key: "allneg",
      name: "every number is a loss",
      example: "[-3, -1, -2] → -1, not 0",
      why: "A solution that starts its total at 0 answers 0 here, because it silently took the stretch of no numbers at all.",
      think: "What is the answer when there is no good option — the least bad one, or nothing?",
      preset: "negatives",
      constraint: 2,
    },
    {
      key: "single",
      name: "one number",
      example: "[7] → 7",
      why: "Any loop that opens by comparing a position with the one before it has nothing to compare against here.",
      think: "Does your first step read a neighbour that exists?",
      preset: "one",
      constraint: 0,
    },
    {
      key: "dip",
      name: "a loss inside the winner",
      example: "[4, -1, 2, 1] → 6",
      why: "Stopping at the first negative number cuts the winning stretch in half; the loss is paid back by what follows it.",
      think: "When is a loss worth crossing, and when is it worth beginning again?",
      preset: "dip",
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
        "given: a row of numbers, some negative",
        "a stretch = neighbours, no gaps, at least one",
        "value(stretch) = the sum of its numbers",
        "task: return the largest value(stretch)",
      ],
      tools: [
        {
          name: "Array of numbers",
          role: "a row addressed by position. A stretch is a start and an end — everything between them is in, and nothing outside it is.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is one number — the total — not the stretch that produced it",
        "no gaps: this is a window on the row, not a selection from it",
        "at least one number, so a row of pure losses answers with its smallest loss",
      ],
      quiz: [
        {
          q: "The row is [-3, -1, -2]. What is the answer?",
          choices: ["0", "-1", "-6"],
          answer: 1,
          explain:
            "Zero would mean taking no numbers at all, and the answer must hold at least one. The least bad single number is -1.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Every stretch, added up",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take every start, extend it to every end, add as you go, and keep the largest total seen. Nothing at all is assumed about the numbers, which is exactly why it is slow.",
      takeaways: [
        "n(n+1)/2 stretches exist, and this walks all of them",
        "the total inside the inner loop is already doing the right thing — it just throws the work away on every new start",
      ],
      quiz: [
        {
          q: "Why is the inner total rebuilt for every start position?",
          choices: [
            "because a stretch's sum depends on where it began",
            "because the loop never reuses the work of the start before it",
          ],
          answer: 1,
          explain:
            "The totals overlap heavily — the run from 0 to 5 is the run from 0 to 4 plus one number — and this loop rebuilds each one from scratch.",
        },
      ],
      run: brute,
    },
    {
      key: "table",
      name: "An entry per position",
      short: "one pass, one array",
      from: 1,
      insight:
        "The honest loop re-adds prefixes it has already summed. Ask a narrower question instead — what is the best stretch ending exactly HERE? — and each answer is built from the one beside it.",
      idea: "Write down, for every position, the largest total of a stretch that ends exactly there. Each entry is the number itself plus its neighbour's entry, but only when that neighbour's entry helps. The answer is the largest entry.",
      takeaways: [
        "defining the answer AT a position is what turns n² into n",
        "the choice is binary: extend the neighbour's stretch, or begin again here",
        "the array holds n entries and each one is read exactly once",
      ],
      run: table,
    },
    {
      key: "running",
      name: "Two variables",
      short: "one pass, no array",
      insight:
        "Every entry in that array is read once, by the step immediately after it. Storage that is never revisited is not storage.",
      idea: problem.whyNow!,
      takeaways: [
        "an entry read only by its successor collapses into a variable",
        "the restart rule is the whole algorithm: drop the carried total exactly when it is negative",
        "seed both numbers with the first element, never with 0 — that is the all-losses case, in one line",
        "this is Kadane's algorithm, and the array above is the dynamic program it came from",
      ],
      quiz: [
        {
          q: "When does the carried total get dropped instead of extended?",
          choices: [
            "when the current number is negative",
            "when the carried total is negative",
            "when the carried total is smaller than the current number",
          ],
          answer: 1,
          explain:
            "A negative carried total can only drag the next stretch down, so it goes. The current number's own sign never decides anything — it is always taken.",
        },
      ],
      run: running,
    },
  ],
})
