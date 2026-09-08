// Where Would This Value Go?, derived. Two rungs, and the whole lesson is
// that the failure case of an ordinary search is not a failure here — the
// position where the range collapses is the answer being asked for.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/search-insert-position.ts"

type N = Data<number> & { target: number }

export function insertAt(nums: number[], target: number) {
  for (let i = 0; i < nums.length; i++) if (nums[i] >= target) return i
  return nums.length
}

const ruledOut = (n: number, lo: number, hi: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) if (i < lo || i > hi) marks[i] = "dim"
  return marks
}

function* story({ nums, target }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `A sorted row and a value, ${target}. If it is here, say where. If it is not, say where it WOULD go so the row stays sorted.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Those two answers are the same question asked once. Both are the position of the first value that is not smaller than the target — present or absent makes no difference to that sentence, which is the whole reason this needs no special case.",
  }
  const at = insertAt(nums, target)
  const present = nums[at] === target
  yield {
    hold: 3,
    marks: {
      ...(Object.fromEntries(
        nums.map((v, i) => [i, v < target ? "dim" : "focus"])
      ) as Record<number, ChipRole>),
      ...(at < nums.length ? { [at]: "answer" as ChipRole } : {}),
    },
    state: [{ label: "index", value: at }],
    answer: at,
    corner:
      nums.length === 1
        ? "single"
        : at === nums.length
          ? "past"
          : at === 0 && !present
            ? "before"
            : undefined,
    note:
      nums.length === 1
        ? `One value, so there are two possible answers: 0 if the target belongs at or before it, 1 if after. Here it is ${at}. Note that a row of length 1 already has an answer that is off the end of it.`
        : at === nums.length
          ? `${target} is larger than everything here, so it belongs at index ${at} — one PAST the last position. That is a legal answer and not an error, which anything returning an index into the row has to be prepared for.`
          : at === 0 && !present
            ? `${target} is smaller than everything here, so it belongs at the very front, index 0. The other extreme, and just as legal.`
            : present
              ? `${target} is already here, at ${at}.`
              : `${target} is absent. It belongs at ${at}, between ${nums[at - 1]} and ${nums[at]}.`,
  }
}

function* walk({ nums, target }: N): Generator<DFrame> {
  for (let i = 0; i < nums.length; i++) {
    const stop = nums[i] >= target
    yield {
      line: 2,
      marks: { [i]: stop ? "answer" : "focus" },
      state: [{ label: "at", value: i }],
      note: stop
        ? `${nums[i]} is the first value not smaller than ${target}, so ${target} belongs at ${i} — whether ${nums[i]} IS the target or merely the first thing above it.`
        : `${nums[i]} is below ${target}; the target belongs somewhere after this.`,
    }
    if (stop) {
      yield { line: 3, answer: i, note: `Return ${i}.` }
      return
    }
  }
  yield {
    line: 4,
    answer: nums.length,
    state: [{ label: "index", value: nums.length }],
    note: `Nothing was large enough, so ${target} belongs past the end, at ${nums.length}. Correct — and it read every value to learn a boundary the ordering already implied.`,
  }
}

function* halve({ nums, target }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let probes = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    probes += 1
    const below = nums[mid] < target
    yield {
      line: below ? 5 : 7,
      marks: { ...ruledOut(nums.length, lo, hi), [mid]: "focus" },
      state: [
        { label: "lo·hi", value: `${lo}·${hi}` },
        { label: "probes", value: probes },
      ],
      note: below
        ? `${nums[mid]} at ${mid} is below ${target}, so ${target} belongs strictly after it and everything up to ${mid} is out. lo = ${mid + 1}.`
        : `${nums[mid]} at ${mid} is at least ${target}, so this position is still a candidate for where ${target} goes — but so is everything before it. hi = ${mid - 1}, and lo remembers the boundary.`,
    }
    if (below) lo = mid + 1
    else hi = mid - 1
  }
  yield {
    line: 8,
    answer: lo,
    marks: lo < nums.length ? { [lo]: "answer" } : {},
    state: [
      { label: "index", value: lo },
      { label: "probes", value: probes },
    ],
    note: `The range has collapsed and lo is sitting at ${lo}. That is not a failure to find something — every value before ${lo} was proved smaller than ${target} and everything from ${lo} on was proved not smaller, so ${lo} IS the boundary. ${probes} probe${probes === 1 ? "" : "s"}, and no branch for the absent case anywhere.`,
  }
}

const ascendingDistinct = (nums: number[]) =>
  nums.every((v, i) => i === 0 || nums[i - 1] < v)

export const searchInsertPosition = deriveJourney(problem, {
  slug: "where-it-would-go",
  subtitle: "the position a failed search leaves you standing on",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "target", label: "target" }],
  classify: (d) =>
    ascendingDistinct(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning: "the row must ascend with no repeats",
        },
  presets: {
    example: { label: "the example", nums: [1, 3, 5, 6], extra: { target: 5 } },
    past: {
      label: "larger than everything",
      nums: [1, 3, 5, 6],
      extra: { target: 7 },
      info: "the answer is one past the end",
    },
    before: {
      label: "smaller than everything",
      nums: [1, 3, 5, 6],
      extra: { target: 0 },
      info: "the answer is 0",
    },
    between: {
      label: "it lands in a gap",
      nums: [1, 3, 5, 6],
      extra: { target: 4 },
      info: "between 3 and 5",
    },
    single: { label: "one value", nums: [2], extra: { target: 9 } },
    long: {
      label: "a longer row",
      nums: [-20, -11, -4, 0, 3, 8, 14, 19, 25, 31, 40, 52],
      extra: { target: 14 },
    },
  },
  edges: [
    {
      key: "single",
      name: "one value",
      example: "[2], target 9 → 1",
      why: "A row of one still has two possible answers — before it or after it — and the second is an index the row does not contain.",
      think: "How many distinct answers can a row of length n produce?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "past",
      name: "larger than everything",
      example: "[1, 3, 5, 6], target 7 → 4",
      why: "The answer is the length of the row — one past the last position. Any code that returns an index it then uses to read the array will read out of bounds here.",
      think: "Is your answer an index INTO the row, or a position BETWEEN its elements?",
      preset: "past",
      constraint: 2,
    },
    {
      key: "before",
      name: "smaller than everything",
      example: "[1, 3, 5, 6], target 0 → 0",
      why: "The other extreme. 0 also happens to be what an uninitialised answer often holds, so this case can pass by accident and hide a bug that shows up nowhere else.",
      think: "Is 0 your answer here because it is right, or because nothing overwrote it?",
      preset: "before",
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
        "given: a row ascending, values distinct, and a target",
        "present: return where it is",
        "absent: return where it would be inserted",
        "both are: the first position whose value is not smaller",
      ],
      tools: [
        {
          name: "Sorted array",
          role: "a row whose values only increase, so 'smaller than the target' and 'not smaller' split it into two stretches with exactly one boundary between them. That boundary is the answer.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "present and absent are the same question: the first position not smaller than the target",
        "the answer may be the length of the row, which is not an index into it",
        "there is exactly one boundary, and finding it is the entire task",
      ],
      quiz: [
        {
          q: "The target is bigger than every value in the row. What is the answer?",
          choices: [
            "-1, since it is not present",
            "the length of the row",
          ],
          answer: 1,
          explain:
            "It belongs after everything, and the position after the last element is the length. That is a real answer here, not a failure code.",
        },
      ],
      run: story,
    },
    {
      key: "walk",
      name: "Walk until it fits",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Scan from the front and return the first position whose value is at least the target. If none is, the target belongs at the end, so return the length.",
      takeaways: [
        "the rule is right and needs no special case for a missing target",
        "and it reads every value before the answer, using none of the ordering",
      ],
      run: walk,
    },
    {
      key: "halve",
      name: "Halve toward the boundary",
      short: "log n, no failure case",
      insight:
        "The scan already knows what it is looking for — the first position not smaller than the target — and that boundary can be halved toward instead of walked to, because the ordering guarantees everything before it is smaller and everything after it is not.",
      idea: problem.whyNow!,
      takeaways: [
        "a value below the target moves lo past it; anything else moves hi below the middle",
        "when the range empties, lo is standing exactly on the boundary",
        "so the 'not found' exit of an ordinary search IS the answer here — no branch needed",
        "and lo can legitimately finish at the length of the row",
      ],
      quiz: [
        {
          q: "The loop ends with lo past hi. Why is lo the answer?",
          choices: [
            "because it is where the last probe happened",
            "because every position before lo was proved smaller than the target, and every position from lo on was proved not smaller",
          ],
          answer: 1,
          explain:
            "The two pointers are a running record of what has been proved. When they cross, the boundary between the two proofs is exactly where lo is standing.",
        },
      ],
      run: halve,
    },
  ],
})
