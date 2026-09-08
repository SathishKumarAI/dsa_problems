// Minimum in Rotated Sorted Array, derived. Three rungs that are all correct;
// two of them are linear and one is not, and the difference is entirely about
// which neighbour you compare the middle against.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/rotated-minimum.ts"

type N = Data<number>

export const rotatedMin = (nums: number[]) => Math.min(...nums)

const ruledOut = (n: number, lo: number, hi: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) if (i < lo || i > hi) marks[i] = "dim"
  return marks
}

const seamAt = (nums: number[]) => {
  for (let i = 0; i < nums.length - 1; i++) if (nums[i] > nums[i + 1]) return i + 1
  return 0
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "This row was sorted once, then cut somewhere and the two pieces swapped. Find the smallest value — and do it without reading everything, because the ordering survived the cut in a usable form.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "What you are looking at is two ascending runs, back to back, where every value in the first run is larger than every value in the second. The smallest value is exactly where the second run begins — the seam.",
  }
  const at = seamAt(nums)
  yield {
    hold: 3,
    marks: { [at]: "answer", ...(at > 0 ? { [at - 1]: "anchor" as ChipRole } : {}) },
    state: [{ label: "minimum", value: nums[at] }],
    answer: nums[at],
    corner:
      nums.length === 1
        ? "single"
        : at === 0
          ? "notrotated"
          : nums.some((v) => v < 0)
            ? "negatives"
            : undefined,
    note:
      nums.length === 1
        ? `One value, so it is the minimum: ${nums[0]}. There is no seam and no pair to compare — a search that opens by comparing two distinct positions has to survive there being only one.`
        : at === 0
          ? `There is no drop anywhere: this row is still in ascending order, which is what a rotation by its own length looks like. The minimum is at the front, ${nums[0]}, and anything that assumes a seam exists somewhere in the middle will hunt for one that is not there.`
          : nums.some((v) => v < 0)
            ? `The seam is at position ${at} and the minimum is ${nums[at]}. Values here go below zero, so "smallest" has nothing to do with magnitude or sign — only with where the order breaks.`
            : `The seam is at position ${at}: ${nums[at - 1]} then ${nums[at]}, the one place where the row goes DOWN. The minimum is ${nums[at]}.`,
  }
}

function* scan({ nums }: N): Generator<DFrame> {
  let best = nums[0]
  for (let i = 0; i < nums.length; i++) {
    const record = nums[i] < best
    if (record) best = nums[i]
    yield {
      line: 1,
      marks: { [i]: record ? "answer" : "focus" },
      state: [{ label: "smallest so far", value: best }],
      note: `${nums[i]} at ${i}. ${record ? `Smaller than anything before it — ${best} is the new minimum.` : `Not smaller than ${best}.`}`,
    }
  }
  yield {
    line: 1,
    answer: best,
    state: [{ label: "minimum", value: best }],
    note: `${best}. Correct on any row at all, sorted, rotated or shuffled — and that is the problem: it read all ${nums.length} values and used nothing the input promised.`,
  }
}

function* findDrop({ nums }: N): Generator<DFrame> {
  for (let i = 0; i < nums.length - 1; i++) {
    const drop = nums[i] > nums[i + 1]
    yield {
      line: 2,
      marks: { [i]: "anchor", [i + 1]: drop ? "answer" : "focus" },
      state: [{ label: "pair", value: `${nums[i]} · ${nums[i + 1]}` }],
      note: drop
        ? `${nums[i]} then ${nums[i + 1]} — the row goes DOWN. That is the seam, and there is exactly one of them, so ${nums[i + 1]} is the minimum and nothing further needs reading.`
        : `${nums[i]} then ${nums[i + 1]}: still ascending, so the seam is not here.`,
    }
    if (drop) {
      yield { line: 3, answer: nums[i + 1], note: `Return ${nums[i + 1]}.` }
      return
    }
  }
  yield {
    line: 4,
    answer: nums[0],
    state: [{ label: "minimum", value: nums[0] }],
    note: `No drop anywhere, so the row was never really rotated and the minimum is at the front: ${nums[0]}. This rung names the right thing — the seam — and still walks the whole row to find it.`,
  }
}

function* halve({ nums }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let probes = 0
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    probes += 1
    const rightHalf = nums[mid] > nums[hi]
    yield {
      line: rightHalf ? 5 : 7,
      marks: {
        ...ruledOut(nums.length, lo, hi),
        [mid]: "focus",
        [hi]: "anchor",
      },
      state: [
        { label: "lo·hi", value: `${lo}·${hi}` },
        { label: "probes", value: probes },
      ],
      note: rightHalf
        ? `${nums[mid]} at the middle is bigger than ${nums[hi]} at the right end. Two ascending runs, and the middle is above the end — so the middle is still in the FIRST run and the seam is strictly to its right. lo = ${mid + 1}.`
        : `${nums[mid]} at the middle is below ${nums[hi]} at the right end, so the middle is already in the second run — at or after the seam. hi = ${mid}, keeping the middle IN range, because it might be the minimum itself.`,
    }
    if (rightHalf) lo = mid + 1
    else hi = mid
  }
  yield {
    line: 8,
    answer: nums[lo],
    marks: { [lo]: "answer" },
    state: [
      { label: "minimum", value: nums[lo] },
      { label: "probes", value: probes },
    ],
    note: `lo and hi have met at ${lo}: ${nums[lo]}, after ${probes} probe${probes === 1 ? "" : "s"} on ${nums.length} values. Comparing against the right END rather than the left is what makes one comparison decide a half — the left end tells you far less.`,
  }
}

const rotatedSortedDistinct = (nums: number[]) => {
  if (new Set(nums).size !== nums.length) return false
  let drops = 0
  for (let i = 0; i < nums.length - 1; i++) if (nums[i] > nums[i + 1]) drops += 1
  return drops <= 1 && (drops === 0 || nums[nums.length - 1] < nums[0])
}

export const rotatedMinimum = deriveJourney(problem, {
  slug: "where-the-order-breaks",
  subtitle: "one comparison, and which end you make it against",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  classify: (d) =>
    rotatedSortedDistinct(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the row must be a sorted run of distinct values, rotated — that is, ascending with at most one drop, and the last value below the first",
        },
  presets: {
    example: { label: "the example", nums: [4, 5, 6, 1, 2, 3] },
    notrotated: {
      label: "not rotated at all",
      nums: [1, 2, 3],
      info: "there is no drop to find",
    },
    single: { label: "one value", nums: [7], info: "no pair to compare" },
    negatives: {
      label: "values below zero",
      nums: [-2, -1, -5, -4, -3],
      info: "smallest has nothing to do with sign",
    },
    seamlast: {
      label: "the seam is at the very end",
      nums: [2, 3, 4, 5, 1],
      info: "the minimum is the last value",
    },
    long: {
      label: "a longer row",
      nums: [21, 25, 30, 34, 41, 55, 2, 6, 9, 13, 17],
    },
  },
  edges: [
    {
      key: "single",
      name: "one value",
      example: "[7] → 7",
      why: "There is no pair to compare and no seam. A loop written to run while two positions differ must simply not run, and the single value must already be the answer.",
      think: "Does your search need at least two positions to produce an answer?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "notrotated",
      name: "the row was never really rotated",
      example: "[1, 2, 3] → 1",
      why: "A rotation by the array's own length is allowed, and it leaves the row untouched. There is no drop anywhere, so anything hunting for a seam has to end up at the front rather than off the end.",
      think: "What does your code return when the row is simply in order?",
      preset: "notrotated",
      constraint: 3,
    },
    {
      key: "negatives",
      name: "values below zero",
      example: "[-2, -1, -5, -4, -3] → -5",
      why: "The minimum has nothing to do with sign or magnitude — it is wherever the order breaks. A comparison against 0, or an assumption that the smallest value is nearest zero, is answering a different question.",
      think: "Is your comparison about the values themselves, or about their relationship to each other?",
      preset: "negatives",
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
        "given: distinct values, sorted, then cut and swapped",
        "so: two ascending runs, first run entirely above the second",
        "the smallest value begins the second run",
        "task: return it, without reading everything",
      ],
      tools: [
        {
          name: "Rotated sorted array",
          role: "a row with exactly one place where the order goes down. Everywhere else it ascends, which means any single value you read tells you which of the two runs you are standing in.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "two ascending runs, and every value in the first is larger than every value in the second",
        "the minimum is exactly where the second run begins",
        "a rotation by the full length is allowed, so 'no drop anywhere' is a legal shape",
      ],
      quiz: [
        {
          q: "You read one value in the middle. What could it tell you?",
          choices: [
            "nothing until you compare it with something",
            "which of the two runs you are in, if you compare it with an end",
          ],
          answer: 1,
          explain:
            "Alone it is just a number. Compared against a value whose run you already know — an end — it places you on one side of the seam or the other.",
        },
      ],
      run: story,
    },
    {
      key: "scan",
      name: "Read everything and keep the smallest",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the row tracking the smallest value seen. Correct for any input whatsoever, and it never asks why this particular input is special.",
      takeaways: [
        "n reads, and identical behaviour on a shuffled row",
        "the problem asks for logarithmic explicitly, which is a hint that structure is being handed to you",
      ],
      run: scan,
    },
    {
      key: "drop",
      name: "Find the place it goes down",
      short: "linear, but it names the thing",
      from: 1,
      insight:
        "Tracking a minimum never asks WHY the minimum is there. It is there because the row was cut — so look for the cut itself: the single pair of neighbours where the value drops.",
      idea: "Walk forward comparing each value with its neighbour. The one place where the row goes down is the seam, and the value just after it is the minimum. If no drop exists, the row was never rotated and the front is the answer.",
      takeaways: [
        "there is exactly one drop, and it is the whole structure of the input",
        "naming the seam is real progress — it turns 'find the smallest' into 'find one specific position'",
        "and it still walks the entire row to find it, so nothing was saved yet",
      ],
      run: findDrop,
    },
    {
      key: "halve",
      name: "Ask which half holds the seam",
      short: "log n, one comparison each",
      insight:
        "Looking for the seam one pair at a time ignores the fact that everything BETWEEN the pairs is ordered too. A single comparison against a known end says which half the seam lies in — and then the other half is gone.",
      idea: problem.whyNow!,
      takeaways: [
        "compare the middle against the RIGHT end: bigger means the seam is strictly right, otherwise it is at or left of the middle",
        "against the left end the same comparison is ambiguous on an unrotated row, which is why the right end is chosen",
        "when the seam may be AT the middle, keep the middle in range — hi = mid, not mid − 1",
        "the loop runs while lo < hi, not <=, because the answer is the position where they meet",
      ],
      quiz: [
        {
          q: "The middle value is smaller than the right end. Why is hi set to mid rather than mid − 1?",
          choices: [
            "to make the loop shorter",
            "because the middle is at or after the seam, so it might itself be the minimum",
          ],
          answer: 1,
          explain:
            "Being below the right end only places the middle in the second run. It could be the very first element of that run — the answer — so discarding it would discard the thing being looked for.",
        },
      ],
      run: halve,
    },
  ],
})
