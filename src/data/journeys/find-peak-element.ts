// Any Local Peak, in Log Time, derived. The row is not sorted, so halving
// looks impossible — until you stop reading the VALUE at the midpoint and
// start reading the SLOPE there.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/find-peak-element.ts"

type N = Data<number>

export const isPeak = (nums: number[], i: number) =>
  (i === 0 || nums[i - 1] < nums[i]) &&
  (i === nums.length - 1 || nums[i] > nums[i + 1])

export const peaks = (nums: number[]) =>
  nums.map((_, i) => i).filter((i) => isPeak(nums, i))

const ruledOut = (n: number, lo: number, hi: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) if (i < lo || i > hi) marks[i] = "dim"
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Find a peak: a value strictly larger than both its neighbours. Any peak — if the row has several, all of them are correct answers.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Just off each end of the row sits negative infinity. That single convention makes the ends eligible, and it also guarantees a peak always exists: a row that only rises must peak at its last element, because the next thing is infinitely low.",
  }
  const all = peaks(nums)
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((_, i) => [i, all.includes(i) ? "answer" : "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "peaks", value: all.join(", ") }],
    answer: all[0],
    corner:
      nums.length === 1
        ? "single"
        : nums.every((v, i) => i === 0 || v > nums[i - 1])
          ? "rising"
          : all.length > 1
            ? "multiple"
            : undefined,
    note:
      nums.length === 1
        ? "One value, and both of its neighbours are off the end and therefore infinitely low — so it is a peak, at index 0. The convention is doing real work already."
        : nums.every((v, i) => i === 0 || v > nums[i - 1])
          ? `This row only ever rises, so the only peak is the last element, at ${all[0]}. Nothing inside the row is larger than what follows it — the peak exists purely because the row ENDS.`
          : all.length > 1
            ? `There are ${all.length} peaks here: positions ${all.join(", ")}. All of them are correct, so two different methods can disagree about the answer and both be right — which is unusual, and worth knowing before you compare outputs.`
            : `The peak is at ${all[0]}: ${nums[all[0]]}, larger than both its neighbours.`,
  }
}

function* scan({ nums }: N): Generator<DFrame> {
  for (let i = 0; i < nums.length - 1; i++) {
    const turn = nums[i] > nums[i + 1]
    yield {
      line: 2,
      marks: { [i]: turn ? "answer" : "focus", [i + 1]: "anchor" },
      state: [{ label: "pair", value: `${nums[i]} · ${nums[i + 1]}` }],
      note: turn
        ? `${nums[i]} then ${nums[i + 1]} — the row turns down here. Everything before this was rising into position ${i}, so ${i} is larger than both its neighbours: a peak.`
        : `${nums[i]} then ${nums[i + 1]}: still rising, so ${i} cannot be a peak.`,
    }
    if (turn) {
      yield { line: 3, answer: i, note: `Return ${i}.` }
      return
    }
  }
  yield {
    line: 4,
    answer: nums.length - 1,
    marks: { [nums.length - 1]: "answer" },
    state: [{ label: "peak", value: nums.length - 1 }],
    note: `The row never turned down, so it rose all the way to the end — and the end is a peak, because what comes after it is off the array. ${nums.length} value${nums.length === 1 ? "" : "s"} read to find something that is only ever a local property.`,
  }
}

function* halve({ nums }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let probes = 0
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    probes += 1
    const rising = nums[mid] < nums[mid + 1]
    yield {
      line: rising ? 5 : 7,
      marks: {
        ...ruledOut(nums.length, lo, hi),
        [mid]: "focus",
        [mid + 1]: "anchor",
      },
      state: [
        { label: "lo·hi", value: `${lo}·${hi}` },
        { label: "probes", value: probes },
      ],
      note: rising
        ? `At ${mid} the row is RISING toward ${mid + 1}. Follow it: the climb either turns down somewhere to the right — a peak — or runs to the end, which is also a peak. Either way a peak exists strictly right of ${mid}, so lo = ${mid + 1}.`
        : `At ${mid} the row is FALLING toward ${mid + 1}. So ${mid} is either a peak itself or the tail of a climb that started further left, and a peak exists at or left of it. hi = ${mid}, keeping ${mid} in range.`,
    }
    if (rising) lo = mid + 1
    else hi = mid
  }
  yield {
    line: 8,
    answer: lo,
    marks: { [lo]: "answer" },
    state: [
      { label: "peak", value: lo },
      { label: "probes", value: probes },
    ],
    note: `lo and hi have met at ${lo}, and ${nums[lo]} is a peak — found in ${probes} probe${probes === 1 ? "" : "s"} on an UNSORTED row. Nothing here needed the row to be ordered; only that a slope at one point tells you which side must hold a turn.`,
  }
}

const noEqualNeighbours = (nums: number[]) =>
  nums.every((v, i) => i === 0 || nums[i - 1] !== v)

export const findPeakElement = deriveJourney(problem, {
  slug: "find-a-peak",
  subtitle: "read the slope, not the value — and the row need not be sorted",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  classify: (d) =>
    noEqualNeighbours(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "no two neighbours may be equal — a flat stretch has no slope, and the whole method reads slopes",
        },
  presets: {
    example: { label: "the example", nums: [1, 2, 3, 1] },
    single: { label: "one value", nums: [7], info: "both neighbours are off the end" },
    rising: {
      label: "it only rises",
      nums: [1, 2, 3, 4, 5],
      info: "the peak is the last element",
    },
    multiple: {
      label: "several peaks",
      nums: [1, 3, 1, 5, 1, 4, 2],
      info: "any of them is a correct answer",
    },
    falling: {
      label: "it only falls",
      nums: [9, 7, 5, 3],
      info: "the peak is the first element",
    },
    long: {
      label: "a longer row",
      nums: [1, 4, 2, 9, 7, 12, 3, 8, 15, 6, 11, 5],
    },
  },
  edges: [
    {
      key: "single",
      name: "one value",
      example: "[7] → 0",
      why: "Both neighbours are off the array and therefore infinitely low, so the single element is a peak. A loop that compares a midpoint with its right neighbour must not run at all here.",
      think: "Does your first comparison read a position that exists?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "rising",
      name: "the row only rises",
      example: "[1, 2, 3, 4, 5] → 4",
      why: "Nothing inside the row is larger than what follows it. The peak exists only because the row ends — which is exactly what the negative-infinity convention buys, and why a climb can always be followed safely.",
      think: "If you keep walking uphill, what stops you?",
      preset: "rising",
      constraint: 2,
    },
    {
      key: "multiple",
      name: "several peaks",
      example: "[1, 3, 1, 5, 1, 4, 2] → 1, 3 or 5",
      why: "All of them are correct, so two methods can return different answers and both be right. Comparing outputs against a fixed expected index would fail a correct solution.",
      think: "Is the answer unique, and does your test assume it is?",
      preset: "multiple",
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
        "given: a row where no two neighbours are equal",
        "just off each end sits negative infinity",
        "a peak is strictly larger than both its neighbours",
        "task: return the index of ANY peak",
      ],
      tools: [
        {
          name: "Array with no equal neighbours",
          role: "a row addressed by position, unsorted. Between any two neighbours there is a definite slope — up or down, never flat — and that is the only structure the problem provides.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "being a peak is a LOCAL property — only the two neighbours decide it",
        "the ends count, because what lies beyond them is infinitely low",
        "a peak therefore always exists, and there may be many",
        "the row is not sorted, so nothing about ordering can be assumed",
      ],
      quiz: [
        {
          q: "Why is a peak guaranteed to exist in every legal row?",
          choices: [
            "because the values are distinct",
            "because a climb cannot continue forever — it either turns down or reaches the end, where the next value is infinitely low",
          ],
          answer: 1,
          explain:
            "Follow the slope upward from anywhere. It must stop, and where it stops is a peak. The convention at the boundary is what makes 'stops at the end' count.",
        },
      ],
      run: story,
    },
    {
      key: "scan",
      name: "Walk until it turns down",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk forward until a value is larger than the one after it — that position is a peak, since everything before it was rising into it. If the row never turns down, the last position is the peak.",
      takeaways: [
        "correct, and it explains why the answer exists at all",
        "n reads to find something that only ever depends on two neighbours",
        "and it always returns the LEFTMOST peak, which is more than was asked for",
      ],
      run: scan,
    },
    {
      key: "halve",
      name: "Follow the slope, discard the rest",
      short: "log n, on an unsorted row",
      insight:
        "Halving seems impossible without sortedness — but only if you read the VALUE at the midpoint. Read the slope instead: rising means a peak lies to the right, falling means one lies at or to the left. Either way half the range is gone.",
      idea: problem.whyNow!,
      takeaways: [
        "compare the midpoint with its right neighbour: that single comparison is the slope",
        "rising means a peak is strictly right — the climb must end somewhere, at worst at the array's edge",
        "falling means the midpoint may itself be the peak, so keep it: hi = mid, never mid − 1",
        "no sortedness required anywhere — this is binary search on a property, not on an order",
      ],
      quiz: [
        {
          q: "The midpoint is rising toward its right neighbour. Why must a peak exist to the right?",
          choices: [
            "because the values to the right are larger on average",
            "because the climb must end — either it turns down, or it reaches the end where the next value is infinitely low",
          ],
          answer: 1,
          explain:
            "Nothing is known about the values to the right except that the climb cannot go on forever. Both ways it ends, and where it ends is a peak.",
        },
      ],
      run: halve,
    },
  ],
})
