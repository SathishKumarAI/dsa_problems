// Search a Rotated Sorted Array, derived. Three rungs. The middle one finds
// the seam first and then searches, which works and does the job twice; the
// last one notices that the comparison narrowing the range is the same
// comparison that says which half is ordered.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/rotated-search.ts"

type N = Data<number> & { target: number }

export const findRotated = (nums: number[], target: number) =>
  nums.indexOf(target)

const seamAt = (nums: number[]) => {
  for (let i = 0; i < nums.length - 1; i++) if (nums[i] > nums[i + 1]) return i + 1
  return 0
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
    note: `A sorted row, cut somewhere and its two pieces swapped, and a value to find: ${target}. Return its index, or −1, in logarithmic time.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The row is not sorted, so halving looks unavailable. But it is two sorted runs — and here is the fact the whole problem rests on: cut it ANYWHERE and at least one of the two halves is entirely in order, because a single seam cannot fall on both sides of the cut.",
  }
  const at = findRotated(nums, target)
  const seam = seamAt(nums)
  yield {
    hold: 3,
    marks: {
      ...(at >= 0 ? ({ [at]: "answer" } as Record<number, ChipRole>) : {}),
      ...(seam > 0 ? ({ [seam]: "anchor" } as Record<number, ChipRole>) : {}),
    },
    state: [
      { label: "target", value: target },
      { label: "index", value: at },
    ],
    answer: at,
    corner:
      at < 0
        ? "absent"
        : seam === 0
          ? "notrotated"
          : at >= seam
            ? "wraphalf"
            : undefined,
    note:
      at < 0
        ? `${target} is not here, so the answer is −1. It has to fall outside the range of BOTH runs for that to be true, and a method that only ever checks one of them can miss it.`
        : seam === 0
          ? `This row was rotated by its own length, so it is simply sorted and the seam is at the front. ${target} sits at ${at}. Anything that insists on locating a seam somewhere in the middle has to survive there not being one.`
          : at >= seam
            ? `The seam is at ${seam}, and ${target} sits at ${at} — in the SECOND run, past the break. That is the half that is not in ascending order relative to the whole row, so a decision made only about the ordered half has to be able to say "not in there, go the other way".`
            : `The seam is at ${seam}; ${target} sits at ${at}, in the first run.`,
  }
}

function* scan({ nums, target }: N): Generator<DFrame> {
  for (let i = 0; i < nums.length; i++) {
    const hit = nums[i] === target
    yield {
      line: 2,
      marks: { [i]: hit ? "answer" : "focus" },
      state: [{ label: "at", value: i }],
      note: hit
        ? `${nums[i]} at ${i} is the target.`
        : `${nums[i]} is not ${target}. Next.`,
    }
    if (hit) {
      yield { line: 3, answer: i, note: `Return ${i}.` }
      return
    }
  }
  yield {
    line: 4,
    answer: -1,
    note: `Not found: −1. Correct on any row whatsoever, and it never used the fact that this one is two sorted runs.`,
  }
}

function* pivotThenSearch({ nums, target }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const right = nums[mid] > nums[hi]
    yield {
      line: right ? 5 : 7,
      marks: { ...ruledOut(nums.length, lo, hi), [mid]: "focus", [hi]: "anchor" },
      state: [{ label: "lo·hi", value: `${lo}·${hi}` }],
      note: `Hunting the seam: ${nums[mid]} at the middle against ${nums[hi]} at the right end — ${right ? "bigger, so the seam is to the right" : "smaller, so the seam is at or left of the middle"}.`,
    }
    if (right) lo = mid + 1
    else hi = mid
  }
  const pivot = lo
  yield {
    line: 8,
    marks: { [pivot]: "anchor" },
    hold: 2,
    state: [{ label: "pivot", value: pivot }],
    note: `The seam is at ${pivot}. That splits the row into two genuinely ascending pieces — 0 to ${pivot - 1} and ${pivot} to ${nums.length - 1} — and an ordinary search works on either.`,
  }
  for (const [start, end] of [
    [0, pivot - 1],
    [pivot, nums.length - 1],
  ] as [number, number][]) {
    let a = start
    let b = end
    while (a <= b) {
      const mid = Math.floor((a + b) / 2)
      const hit = nums[mid] === target
      yield {
        line: 13,
        marks: { ...ruledOut(nums.length, a, b), [mid]: hit ? "answer" : "focus" },
        state: [{ label: "piece", value: `${start}…${end}` }],
        note: hit
          ? `${nums[mid]} at ${mid} — found, on the ${start === 0 ? "first" : "second"} piece.`
          : `${nums[mid]} at ${mid} is ${nums[mid] < target ? "below" : "above"} ${target}; half of this piece goes.`,
      }
      if (hit) {
        yield { line: 14, answer: mid, note: `Return ${mid}.` }
        return
      }
      if (nums[mid] < target) a = mid + 1
      else b = mid - 1
    }
  }
  yield {
    line: 19,
    answer: -1,
    note: `Neither piece held ${target}: −1. Logarithmic — and it walked the row twice, and the second search means nothing unless the seam hunt was right on its own.`,
  }
}

function* oneLoop({ nums, target }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let probes = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    probes += 1
    if (nums[mid] === target) {
      yield {
        line: 5,
        marks: { ...ruledOut(nums.length, lo, hi), [mid]: "answer" },
        state: [{ label: "probes", value: probes }],
        note: `${nums[mid]} at ${mid} is the target. Found in ${probes} probe${probes === 1 ? "" : "s"}.`,
      }
      yield { line: 5, answer: mid, note: `Return ${mid}.` }
      return
    }
    const leftSorted = nums[lo] <= nums[mid]
    const inside = leftSorted
      ? nums[lo] <= target && target < nums[mid]
      : nums[mid] < target && target <= nums[hi]
    yield {
      line: leftSorted ? (inside ? 8 : 10) : inside ? 13 : 15,
      marks: {
        ...ruledOut(nums.length, lo, hi),
        [mid]: "focus",
        [leftSorted ? lo : hi]: "anchor",
      },
      state: [
        { label: "lo·hi", value: `${lo}·${hi}` },
        { label: "probes", value: probes },
      ],
      note: `${nums[lo]} at ${lo} against ${nums[mid]} at ${mid}: the ${leftSorted ? "LEFT" : "RIGHT"} half is the one in plain order, running ${leftSorted ? `${nums[lo]} to ${nums[mid]}` : `${nums[mid]} to ${nums[hi]}`}. ${target} is ${inside ? "inside that range, so search there" : "outside it — and since that half is ordered, being outside its range is proof the target is not in it at all. Go the other way"}.`,
    }
    if (leftSorted) {
      if (inside) hi = mid - 1
      else lo = mid + 1
    } else {
      if (inside) lo = mid + 1
      else hi = mid - 1
    }
  }
  yield {
    line: 16,
    answer: -1,
    state: [{ label: "probes", value: probes }],
    note: `The range emptied: −1, after ${probes} probe${probes === 1 ? "" : "s"}. One loop, one pass, and no seam was ever located — the comparison that narrows the range is the same one that says which half is ordered.`,
  }
}

const rotatedSortedDistinct = (nums: number[]) => {
  if (new Set(nums).size !== nums.length) return false
  let drops = 0
  for (let i = 0; i < nums.length - 1; i++) if (nums[i] > nums[i + 1]) drops += 1
  return drops <= 1 && (drops === 0 || nums[nums.length - 1] < nums[0])
}

export const rotatedSearch = deriveJourney(problem, {
  slug: "search-past-the-seam",
  subtitle: "cut it anywhere and one half is always in order",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "target", label: "target" }],
  classify: (d) =>
    rotatedSortedDistinct(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the row must be a sorted run of distinct values, rotated — ascending with at most one drop, and the last value below the first",
        },
  presets: {
    example: {
      label: "the example",
      nums: [4, 5, 6, 7, 0, 1, 2],
      extra: { target: 0 },
    },
    absent: {
      label: "not in the row",
      nums: [4, 5, 6, 7, 0, 1, 2],
      extra: { target: 3 },
      info: "outside the range of both runs",
    },
    notrotated: {
      label: "not rotated at all",
      nums: [1, 3, 5, 7, 9],
      extra: { target: 7 },
      info: "there is no seam to find",
    },
    firsthalf: {
      label: "the target is before the seam",
      nums: [4, 5, 6, 7, 0, 1, 2],
      extra: { target: 6 },
      info: "in the ordered half, this time",
    },
    single: { label: "one value", nums: [3], extra: { target: 3 } },
    long: {
      label: "a longer row",
      nums: [23, 29, 34, 41, 55, 60, 2, 6, 9, 13, 17, 20],
      extra: { target: 13 },
    },
  },
  edges: [
    {
      key: "absent",
      name: "the target is not there",
      example: "[4, 5, 6, 7, 0, 1, 2], target 3 → -1",
      why: "3 falls outside the range of both runs. -1 is a real answer, and a method that commits to one half without proving the target cannot be in the other will miss it.",
      think: "When you discard a half, what have you actually proved about it?",
      preset: "absent",
      constraint: 0,
    },
    {
      key: "notrotated",
      name: "the row was never rotated",
      example: "[1, 3, 5, 7, 9], target 7 → 3",
      why: "A rotation by the full length is legal input and leaves the row simply sorted. There is no seam anywhere, so anything that insists on locating one has to cope with that.",
      think: "What does your seam hunt return when the row never drops?",
      preset: "notrotated",
      constraint: 2,
    },
    {
      key: "wraphalf",
      name: "the target is past the seam",
      example: "[4, 5, 6, 7, 0, 1, 2], target 0 → 4",
      why: "The ordered half at the first probe is the left one, and 0 is not in its range — so the decision has to be 'not in the ordered half, therefore the other one', which is only sound because that half IS ordered.",
      think: "Which half do you reason about, and what does the other one's disorder cost you?",
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
        "given: distinct values, sorted, then cut and swapped",
        "given: a target to find",
        "cut anywhere: at least one half is still in plain order",
        "task: return its index, or −1, in log time",
      ],
      tools: [
        {
          name: "Rotated sorted array",
          role: "two ascending runs with one seam between them. Because there is only one seam, any cut of the row leaves it on one side — so the other side is entirely ordered.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "one seam means any cut leaves at least one half fully ordered",
        "an ordered half lets you say for certain whether the target is inside it",
        "−1 is a real answer, and rotation by zero is legal input",
        "distinctness is what keeps the halves tellable apart",
      ],
      quiz: [
        {
          q: "You cut the row at its midpoint. How many of the two halves are guaranteed to be in plain ascending order?",
          choices: ["neither", "at least one", "both"],
          answer: 1,
          explain:
            "There is exactly one seam, and it can only fall in one half. Whichever half does not contain it is ordered — and that is the entire lever.",
        },
      ],
      run: story,
    },
    {
      key: "scan",
      name: "Read them all",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk from the front comparing each value with the target. Correct on any row, ordered or not.",
      takeaways: [
        "n reads, and it uses nothing the input promises",
        "the problem asks for log time explicitly, which is a hint that the structure is meant to be spent",
      ],
      run: scan,
    },
    {
      key: "pivot",
      name: "Find the seam, then search a piece",
      short: "log n, twice",
      from: 1,
      insight:
        "Ignoring the rotation entirely is the only real fault of the scan. Locate the seam first and the row becomes two genuinely sorted pieces, each of which an ordinary search can handle.",
      idea: "Binary search for the rotation point, then run a plain binary search on whichever of the two sorted pieces could contain the target.",
      takeaways: [
        "the seam hunt is itself logarithmic, so the total is still log n",
        "two passes over the row, and two loops to get right",
        "and the second search means nothing unless the first one was correct on its own — including when there is no seam at all",
      ],
      quiz: [
        {
          q: "What is the risk of splitting the work into two searches?",
          choices: [
            "it is asymptotically slower",
            "the second search is only meaningful if the seam hunt was right, including on an un-rotated row",
          ],
          answer: 1,
          explain:
            "Both are logarithmic. The cost is a second thing that has to be correct, with its own edge cases, before the first result can be trusted.",
        },
      ],
      run: pivotThenSearch,
    },
    {
      key: "oneloop",
      name: "Decide which half is ordered, every step",
      short: "one loop, one pass",
      insight:
        "The seam hunt and the search both boil down to one comparison at the midpoint. Ask it once: comparing the midpoint with the low end says which half is ordered, and an ordered half's endpoints say for certain whether the target is inside it.",
      idea: problem.whyNow!,
      takeaways: [
        "compare the midpoint with the LOW end to find the ordered half",
        "then the target is either inside that half's range — search it — or provably not in it, so search the other",
        "'provably not' is only available because that half is ordered; nothing is ever assumed about the disordered one",
        "one loop, one pass, and the seam is never located at all",
      ],
      quiz: [
        {
          q: "The left half is ordered and the target is outside its range. Why is it safe to discard it entirely?",
          choices: [
            "because the target is usually on the right",
            "because an ordered range's endpoints bound everything inside it, so being outside them is proof of absence",
          ],
          answer: 1,
          explain:
            "That proof is what the ordering buys. The other half is never reasoned about directly — only arrived at by elimination.",
        },
      ],
      run: oneLoop,
    },
  ],
})
