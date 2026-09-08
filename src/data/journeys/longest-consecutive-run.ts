// Longest Consecutive Sequence, derived. Two rungs. The first sorts, which is
// the honest answer and also the one the problem explicitly asks you to beat;
// the second is the one whose loops LOOK quadratic and are not, and the reason
// why is the only thing worth remembering here.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/arrays-hashing/longest-consecutive-run.ts"

type N = Data<number>

export function longestRun(nums: number[]) {
  const values = new Set(nums)
  let best = 0
  let from = 0
  for (const x of values) {
    if (values.has(x - 1)) continue
    let length = 1
    while (values.has(x + length)) length += 1
    if (length > best) [best, from] = [length, x]
  }
  return { best, from }
}

const holding = (nums: number[], want: number[], role: ChipRole = "answer") =>
  Object.fromEntries(
    nums.map((v, i) => [i, want.includes(v) ? role : "dim"])
  ) as Record<number, ChipRole>

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Find the longest run of consecutive integers hiding in this row — 5, 6, 7, 8 and so on. Where they sit in the row does not matter at all; only whether they are present.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Read that again, because it is the whole problem: position is irrelevant. This is a question about a SET of numbers that has been handed to you in an array, and the array's ordering is noise.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      answer: 0,
      corner: "empty",
      note: "No numbers at all, so the longest run has length 0. Worth deciding before writing a loop that seeds its best from the first element — there isn't one.",
    }
    return
  }
  const { best, from } = longestRun(nums)
  const run = Array.from({ length: best }, (_, i) => from + i)
  const dupes = new Set(nums).size < nums.length
  yield {
    hold: 3,
    marks: holding(nums, run),
    state: [{ label: "longest run", value: `${from}…${from + best - 1}` }],
    answer: best,
    corner: dupes
      ? "duplicates"
      : nums.some((v, i) => i > 0 && v < nums[i - 1])
        ? "scattered"
        : undefined,
    note: dupes
      ? `The longest run is ${run.join(", ")} — length ${best}. Some value appears twice in this row, and a repeat adds nothing to a run: 1, 2, 2, 3 is a run of three, not four.`
      : nums.some((v, i) => i > 0 && v < nums[i - 1])
        ? `The longest run is ${run.join(", ")} — length ${best}, and its members are scattered all over the row. Nothing about their positions is a clue; only their presence.`
        : `The longest run is ${run.join(", ")} — length ${best}.`,
  }
}

function* sortFirst({ nums }: N): Generator<DFrame> {
  if (!nums.length) {
    yield { line: 2, answer: 0, note: "Nothing to sort, and nothing to count: 0." }
    return
  }
  const ordered = [...new Set(nums)].sort((a, b) => a - b)
  yield {
    line: 3,
    row: ordered,
    hold: 2,
    state: [{ label: "distinct", value: ordered.length }],
    note: `Duplicates dropped and the rest put in order: ${ordered.join(", ")}. Consecutive values are now neighbours, which is the only reason a single walk can measure a run.`,
  }
  let best = 1
  let run = 1
  for (let i = 1; i < ordered.length; i++) {
    run = ordered[i] === ordered[i - 1] + 1 ? run + 1 : 1
    best = Math.max(best, run)
    yield {
      line: 6,
      row: ordered,
      marks: { [i - 1]: "anchor", [i]: run > 1 ? "answer" : "focus" },
      state: [
        { label: "run", value: run },
        { label: "best", value: best },
      ],
      note:
        ordered[i] === ordered[i - 1] + 1
          ? `${ordered[i - 1]} then ${ordered[i]}: consecutive, so the run reaches ${run}.`
          : `${ordered[i - 1]} then ${ordered[i]}: a gap, so the run restarts at 1.`,
    }
  }
  yield {
    line: 8,
    row: ordered,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}. Correct — and it bought a total ordering, at n log n, when the only question ever asked was "is this number present?". That is a far weaker question than "what comes next".`,
  }
}

function* fromEnds({ nums }: N): Generator<DFrame> {
  const values = new Set(nums)
  let best = 0
  yield {
    line: 1,
    hold: 2,
    state: [{ label: "distinct values", value: values.size }],
    note: `All ${values.size} distinct value${values.size === 1 ? "" : "s"} loaded into a set. Duplicates collapse for free, and "is x present?" is now one question, answered instantly.`,
  }
  for (const x of values) {
    if (values.has(x - 1)) {
      yield {
        line: 4,
        marks: holding(nums, [x], "dim"),
        state: [{ label: "at", value: x }],
        note: `${x} has ${x - 1} sitting behind it, so ${x} is in the MIDDLE of a run, not at its start. Skip it — counting from here would re-count a run somebody else will count properly.`,
      }
      continue
    }
    let length = 1
    while (values.has(x + length)) length += 1
    best = Math.max(best, length)
    yield {
      line: 8,
      marks: holding(
        nums,
        Array.from({ length }, (_, i) => x + i)
      ),
      state: [
        { label: "run from", value: x },
        { label: "best", value: best },
      ],
      note: `${x - 1} is absent, so ${x} really is the left end of a run. Walk up: ${Array.from({ length }, (_, i) => x + i).join(", ")} — length ${length}${length === best ? ", the longest so far" : `, best still ${best}`}.`,
    }
  }
  yield {
    line: 10,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}. Two nested loops that are not quadratic: the inner walk only ever runs from the START of a run, so each value is stepped over exactly once across the entire outer loop.`,
  }
}

export const longestConsecutiveRun = deriveJourney(problem, {
  slug: "longest-run-of-consecutives",
  subtitle: "nested loops that are linear, and the guard that makes them so",
  reveals: ["arrays-hashing"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  presets: {
    example: { label: "the example", nums: [50, 3, 2, 100, 4, 1] },
    empty: { label: "no numbers at all", nums: [], info: "the answer is 0" },
    duplicates: {
      label: "with duplicates",
      nums: [1, 2, 2, 3],
      info: "a repeat does not lengthen a run",
    },
    scattered: {
      label: "one long run, shuffled",
      nums: [9, 4, 6, 8, 5, 7],
      info: "position tells you nothing",
    },
    nogaps: {
      label: "no run longer than one",
      nums: [10, 20, 30],
      info: "every value stands alone",
    },
    long: {
      label: "a longer row",
      nums: [12, 4, 100, 5, 13, 6, 3, 101, 14, 7, 99, 15, 2],
    },
  },
  edges: [
    {
      key: "empty",
      name: "no numbers at all",
      example: "[] → 0",
      why: "There is no first element to seed a best length from, and no run of length 1 to fall back on. The answer is 0, and it has to be the starting value rather than something the loop produces.",
      think: "What does your answer start at, before any value is read?",
      preset: "empty",
      constraint: 0,
    },
    {
      key: "duplicates",
      name: "the same value twice",
      example: "[1, 2, 2, 3] → 3",
      why: "A repeat adds nothing: 1, 2, 3 is a run of three however many 2s were handed over. A walk that counts elements rather than distinct values answers 4.",
      think: "Does your count measure how many numbers you saw, or how far the run reaches?",
      preset: "duplicates",
      constraint: 2,
    },
    {
      key: "scattered",
      name: "the run is shuffled through the row",
      example: "[9, 4, 6, 8, 5, 7] → 6",
      why: "Every one of 4…9 is present but no two neighbours in the row are consecutive. Anything that reads the array in order, without first collecting the values, sees runs of length 1 everywhere.",
      think: "Is what you are looking at a sequence, or a set that arrived in an arbitrary order?",
      preset: "scattered",
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
        "given: a row of integers, unsorted, duplicates allowed",
        "a run = consecutive integers, all present somewhere in the row",
        "positions do not matter; presence does",
        "task: return the LENGTH of the longest run",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row that is really a bag: the question never refers to a position, so the array's ordering carries no information at all.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "positions are noise — this is a question about which values are present",
        "duplicates do not lengthen a run",
        "the only question ever asked of the data is 'is this number here?'",
      ],
      quiz: [
        {
          q: "What question does this problem actually ask of the input?",
          choices: [
            "what comes after each value",
            "whether a given value is present",
          ],
          answer: 1,
          explain:
            "That is the whole thing. 'What comes next' is what sorting buys you, and it is more than this problem ever needs.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Put them in order first",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Drop duplicates, sort, then walk once: each value either continues the previous run or starts a new one. The longest run seen is the answer.",
      takeaways: [
        "sorting makes consecutive values adjacent, so one pass measures every run",
        "duplicates have to be removed or they break the count",
        "n log n — and the problem explicitly asks for better, which is a hint about what to stop buying",
      ],
      run: sortFirst,
    },
    {
      key: "ends",
      name: "Start only from the left end of a run",
      short: "linear, nested loops and all",
      insight:
        "Sorting answers 'what comes next', and the only thing ever asked is 'is this present?'. A set answers that directly — and then the trap is counting a run from the middle, which re-walks it once per member.",
      idea: problem.whyNow!,
      takeaways: [
        "a value x begins a run exactly when x − 1 is absent — that guard is the whole algorithm",
        "without it the inner walk runs from every member of a run and the whole thing is quadratic",
        "with it, each value is walked over exactly once in total, so two nested loops are linear",
        "this is the hash set again, answering membership rather than ordering",
      ],
      quiz: [
        {
          q: "Why is the total work linear despite a loop inside a loop?",
          choices: [
            "because the inner loop is short in practice",
            "because the inner walk only starts at the left end of a run, so each value is stepped over exactly once overall",
          ],
          answer: 1,
          explain:
            "Nothing bounds the inner loop by itself — a run can be enormous. What bounds the total is that every run is walked from its start once and from nowhere else.",
        },
      ],
      run: fromEnds,
    },
  ],
})
