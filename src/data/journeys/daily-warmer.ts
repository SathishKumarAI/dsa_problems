// Days Until Warmer, derived. Three rungs, and the argument between them is
// about whose work gets thrown away: the forward scan re-walks the same cold
// runs, the backward scan hops over them but only as far as the data lets it,
// and the stack gives every day exactly one push and one pop.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/daily-warmer.ts"

type N = Data<number>

export function warmerDays(temps: number[]) {
  const out = new Array<number>(temps.length).fill(0)
  const waiting: number[] = []
  for (let i = 0; i < temps.length; i++) {
    while (waiting.length && temps[waiting[waiting.length - 1]] < temps[i]) {
      const j = waiting.pop()!
      out[j] = i - j
    }
    waiting.push(i)
  }
  return out
}

const stackMarks = (waiting: number[], current: number, hit?: number) => {
  const marks: Record<number, ChipRole> = {}
  for (const w of waiting) marks[w] = "anchor"
  if (hit !== undefined) marks[hit] = "answer"
  marks[current] = "focus"
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A temperature per day, and one question asked of every single day: how many days until it gets strictly warmer than this? Not the warmer temperature — the wait.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The answer is a whole row, not one number, which changes what 'efficient' can mean. Every day needs its own answer, so nothing can be skipped — the only thing available to save is the work of finding each one.",
  }
  const out = warmerDays(nums)
  const never = out.filter((v) => v === 0).length
  yield {
    hold: 3,
    marks: Object.fromEntries(
      out.map((v, i) => [i, v === 0 ? "dim" : "focus"])
    ) as Record<number, ChipRole>,
    state: [{ label: "answers", value: out.join(", ") }],
    answer: out,
    corner:
      nums.length === 1
        ? "single"
        : never === nums.length
          ? "nowarmer"
          : nums.some((v, i) => i > 0 && v === nums[i - 1])
            ? "equal"
            : undefined,
    note:
      nums.length === 1
        ? "One day, and no day after it, so the wait is 0. Zero is a real answer here and not a missing one — which is worth deciding before you write a loop that leaves the array untouched."
        : never === nums.length
          ? "Not one day is ever followed by a warmer one, so every answer is 0. Whatever holds the days still waiting will end the run completely full — and everything left in it at the end answers 0."
          : nums.some((v, i) => i > 0 && v === nums[i - 1])
            ? `The answers are ${out.join(", ")}. Two neighbouring days here read the same temperature, and the question says STRICTLY warmer — equal does not resolve anything, and a comparison written with ≥ instead of > answers 1 where the truth is ${out[nums.findIndex((v, i) => i > 0 && v === nums[i - 1]) - 1]}.`
            : `The answers are ${out.join(", ")}${never ? `, and ${never} of them are 0 — days with nothing warmer ahead of them at all` : ""}.`,
  }
}

function* brute({ nums }: N): Generator<DFrame> {
  const out = new Array<number>(nums.length).fill(0)
  for (let i = 0; i < nums.length; i++) {
    let looked = 0
    for (let j = i + 1; j < nums.length; j++) {
      looked += 1
      if (nums[j] > nums[i]) {
        out[i] = j - i
        yield {
          line: 6,
          marks: { [i]: "anchor", [j]: "answer" },
          state: [
            { label: "day", value: i },
            { label: "waited", value: j - i },
          ],
          note: `Day ${i} at ${nums[i]}: day ${j} is ${nums[j]}, the first strictly warmer one. Answer ${j - i}, after looking at ${looked} day${looked === 1 ? "" : "s"}.`,
        }
        break
      }
    }
    if (!out[i])
      yield {
        line: 8,
        marks: { [i]: "anchor" },
        state: [
          { label: "day", value: i },
          { label: "waited", value: 0 },
        ],
        note: `Day ${i} at ${nums[i]}: nothing warmer in the ${looked} day${looked === 1 ? "" : "s"} that follow. Answer 0 — and the entire tail was read to learn it.`,
      }
  }
  yield {
    line: 8,
    answer: out,
    state: [{ label: "answers", value: out.join(", ") }],
    note: `${out.join(", ")}. Correct, and a run of cold days is walked again from every day inside it — the same stretch, re-read once per day that starts in it.`,
  }
}

function* backward({ nums }: N): Generator<DFrame> {
  const n = nums.length
  const out = new Array<number>(n).fill(0)
  for (let i = n - 2; i >= 0; i--) {
    let j = i + 1
    let hops = 0
    while (j < n && nums[j] <= nums[i]) {
      hops += 1
      if (out[j] === 0) j = n
      else j += out[j]
    }
    out[i] = j < n ? j - i : 0
    yield {
      line: 9,
      marks: {
        [i]: "anchor",
        ...(j < n ? ({ [j]: "answer" } as Record<number, ChipRole>) : {}),
      },
      state: [
        { label: "day", value: i },
        { label: "hops", value: hops },
      ],
      note:
        j < n
          ? `Day ${i} at ${nums[i]}: day ${i + 1} is not warmer, so jump by ITS answer rather than stepping — ${hops} hop${hops === 1 ? "" : "s"} lands on day ${j} at ${nums[j]}. Answer ${j - i}. Each hop clears a whole stretch that was already solved.`
          : `Day ${i} at ${nums[i]}: every hop lands on a day that is no warmer, and one of them had nothing warmer ahead of it either — so neither does this one. Answer 0.`,
    }
  }
  yield {
    line: 11,
    answer: out,
    state: [{ label: "answers", value: out.join(", ") }],
    note: `${out.join(", ")}, with no extra storage at all — the answers already written ARE the index. But how far each hop travels is decided by the shape of the temperatures, so the work per day is whatever the data feels like giving you.`,
  }
}

function* stack({ nums }: N): Generator<DFrame> {
  const out = new Array<number>(nums.length).fill(0)
  const waiting: number[] = []
  for (let i = 0; i < nums.length; i++) {
    while (waiting.length && nums[waiting[waiting.length - 1]] < nums[i]) {
      const j = waiting.pop()!
      out[j] = i - j
      yield {
        line: 6,
        marks: stackMarks(waiting, i, j),
        state: [
          { label: "resolved", value: j },
          { label: "waiting", value: waiting.length },
        ],
        note: `Day ${i} at ${nums[i]} is warmer than day ${j} at ${nums[j]}, which has been waiting since it arrived. Answer ${i - j}, and day ${j} is gone for good — nothing will ever ask about it again.`,
      }
    }
    waiting.push(i)
    yield {
      line: 7,
      marks: stackMarks(waiting, i),
      state: [
        { label: "temperature", value: nums[i] },
        { label: "waiting", value: waiting.length },
      ],
      note: `Day ${i} joins the days still waiting${waiting.length > 1 ? `, on top of day ${waiting[waiting.length - 2]} at ${nums[waiting[waiting.length - 2]]}` : " — the first of them"}. The waiting days always read coldest-last, because any day that was colder than this one has just been resolved and removed.`,
    }
  }
  yield {
    line: 8,
    answer: out,
    state: [
      { label: "answers", value: out.join(", ") },
      { label: "left waiting", value: waiting.length },
    ],
    note: `${out.join(", ")}. ${waiting.length} day${waiting.length === 1 ? "" : "s"} never found anything warmer and answer 0. Every day was added once and removed at most once — ${nums.length} days, at most ${2 * nums.length} operations, whatever the temperatures do.`,
  }
}

export const dailyWarmer = deriveJourney(problem, {
  slug: "days-until-warmer",
  subtitle: "an answer for every day, and the days still waiting for theirs",
  reveals: ["stack"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer run of days" },
  presets: {
    example: { label: "the example", nums: [73, 74, 75, 71, 69, 72, 76, 73] },
    nowarmer: {
      label: "it only gets colder",
      nums: [80, 75, 70, 65],
      info: "no day is ever followed by a warmer one",
    },
    single: { label: "one day", nums: [70], info: "no day after it" },
    equal: {
      label: "two days the same",
      nums: [70, 70, 75],
      info: "equal is not warmer",
    },
    long: {
      label: "a longer run of days",
      nums: [55, 54, 53, 52, 60, 51, 50, 49, 48, 47, 62, 46, 70, 45],
    },
  },
  edges: [
    {
      key: "single",
      name: "one day",
      example: "[70] → [0]",
      why: "There is no day after it, so the wait is 0 — a real answer, not a missing one. Any code that leaves the array untouched happens to be right here, and for the wrong reason.",
      think: "Is 0 your answer for 'never', or just what the array happened to be initialised to?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "nowarmer",
      name: "it only ever gets colder",
      example: "[80, 75, 70, 65] → [0, 0, 0, 0]",
      why: "Nothing is ever resolved, so whatever holds the unresolved days grows to the full length of the input and is still full at the end. Everything left in it answers 0.",
      think: "What happens to the days that are still waiting when the input runs out?",
      preset: "nowarmer",
      constraint: 2,
    },
    {
      key: "equal",
      name: "the next day is exactly as warm",
      example: "[70, 70, 75] → [2, 1, 0]",
      why: "The question says STRICTLY warmer. An equal temperature resolves nothing, so a comparison written with >= answers 1 for the first day when the truth is 2.",
      think: "Which comparison do you use, and does an equal temperature end a wait or not?",
      preset: "equal",
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
        "given: one temperature per day, in day order",
        "for EVERY day: how many days until a strictly warmer one?",
        "no warmer day ahead means 0",
        "task: return one answer per day",
      ],
      tools: [
        {
          name: "Array of temperatures",
          role: "a row addressed by day. The answer is another row of the same length — every position asks its own question, and the questions overlap heavily.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is a wait in days, not the warmer temperature",
        "strictly warmer: an equal day resolves nothing",
        "0 means 'never', and it is an answer rather than an absence",
        "every day needs an answer, so the saving can only come from sharing work between them",
      ],
      quiz: [
        {
          q: "Temperatures are [70, 70, 75]. What is the answer for day 0?",
          choices: ["1", "2"],
          answer: 1,
          explain:
            "Day 1 is 70 — equal, not warmer, so the wait continues. Day 2 at 75 is the first strictly warmer day, two days later.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Look forward from each day",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "For each day, walk forward until a strictly warmer temperature appears, and record the gap. If the walk falls off the end, the answer is 0.",
      takeaways: [
        "every day gets its answer independently, which is why nothing is shared",
        "a long cold run is re-walked from every day inside it",
        "the worst case is a row that only warms at the very end: n²/2 comparisons",
      ],
      quiz: [
        {
          q: "Which input makes this rung slowest?",
          choices: [
            "temperatures that rise every day",
            "a long cold stretch followed by one warm day",
          ],
          answer: 1,
          explain:
            "A rising row resolves every day in one step. A long flat-or-falling stretch makes every day inside it walk the whole rest of the row.",
        },
      ],
      run: brute,
    },
    {
      key: "backward",
      name: "Hop over what is already solved",
      short: "no extra storage",
      from: 1,
      insight:
        "The forward scan re-walks stretches it has already been through. Go right to left instead and every day ahead already has its answer — so instead of stepping one day at a time, jump by the answer that is already sitting there.",
      idea: "Work from the end backwards. When the next day is not warm enough, do not step past it — jump by ITS answer, which lands on the next day that beat it. Repeat until something is warmer or the row runs out.",
      takeaways: [
        "the answers already written are the only index this rung needs",
        "one hop can clear an arbitrarily long stretch that is already resolved",
        "how far each hop travels depends entirely on the shape of the data",
        "no extra memory, and no promise about the work per day either",
      ],
      run: backward,
    },
    {
      key: "stack",
      name: "Keep the days that are still waiting",
      short: "one push and one pop each",
      insight:
        "Hopping is still reading the row to find out what it already knew: which days are unresolved. Hold exactly those days instead, and the newest warm day resolves all of them at once — no searching, no hopping.",
      idea: problem.whyNow!,
      takeaways: [
        "hold the unresolved days, in arrival order — the answer to 'who is still waiting?' is not something to rediscover",
        "they stay in decreasing temperature order for free: anything colder than the new day has just been removed",
        "each day is added once and removed at most once, so the pass is linear no matter what the temperatures do",
        "this is the monotonic stack, and the ordering it maintains is the entire reason it works",
      ],
      quiz: [
        {
          q: "Why are the waiting days always in decreasing temperature order?",
          choices: [
            "because the input is sorted",
            "because a new day removes every waiting day colder than itself before joining",
          ],
          answer: 1,
          explain:
            "Nothing about the input is sorted. The order is an invariant the algorithm maintains: anything a new day could out-warm is gone before that day is added.",
        },
      ],
      run: stack,
    },
  ],
})
