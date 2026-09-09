// The Lone Value Among Pairs, derived. Two rungs, and the second is only
// necessary because the problem asks for logarithmic time — which is a
// deliberate move to rule the beautiful linear answer out.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/single-in-sorted.ts"

type N = Data<number>

export function loneValue(nums: number[]) {
  let out = 0
  for (const x of nums) out ^= x
  return out
}

const ruledOut = (n: number, lo: number, hi: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) if (i < lo || i > hi) marks[i] = "dim"
  return marks
}

const loneAt = (nums: number[]) => nums.indexOf(loneValue(nums))

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Every value here appears exactly twice, side by side, except one that appears once. Find the lone one — and do it without reading the whole row.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Look at where the pairs START. Before the lone value, each pair begins at an even position; after it, everything is shifted by one and each pair begins at an odd position. There is exactly one place where that pattern breaks, and the lone value is standing in it.",
  }
  const at = loneAt(nums)
  yield {
    hold: 3,
    marks: { ...ruledOut(nums.length, 0, nums.length - 1), [at]: "answer" },
    state: [
      { label: "lone value", value: nums[at] },
      { label: "at", value: at },
    ],
    answer: nums[at],
    corner:
      nums.length === 1
        ? "single"
        : at === 0
          ? "front"
          : at === nums.length - 1
            ? "back"
            : undefined,
    note:
      nums.length === 1
        ? `One value, so it is the lone one: ${nums[0]}. The pattern has nowhere to break, and a search comparing a midpoint with its neighbour must not read past the end.`
        : at === 0
          ? `The lone value is right at the front: ${nums[0]}. Every pair after it starts at an odd position, so the pattern is broken from the very first comparison.`
          : at === nums.length - 1
            ? `The lone value is at the very end: ${nums[at]}. Every pair before it is perfectly aligned, so the search only learns anything at the last possible moment — this is the input that punishes a range that stops one short.`
            : `The lone value is ${nums[at]}, at position ${at}. Pairs before it start on even positions; pairs after it start on odd ones.`,
  }
}

function* xorAll({ nums }: N): Generator<DFrame> {
  let out = 0
  for (let i = 0; i < nums.length; i++) {
    out ^= nums[i]
    yield {
      line: 2,
      marks: { ...ruledOut(nums.length, 0, i), [i]: "focus" },
      state: [{ label: "combined", value: out }],
      note: `${nums[i]} folded in — the running value is ${out}. A value combined with itself cancels to nothing, so every pair that has been fully seen has vanished from this number.`,
    }
  }
  yield {
    line: 3,
    answer: out,
    state: [{ label: "lone value", value: out }],
    note: `${out}. Every pair cancelled itself and the loner is what survived. It is exact, it needs one integer, it is arguably the nicest answer here — and it read all ${nums.length} values, which is precisely what the problem's logarithmic requirement exists to forbid.`,
  }
}

function* halve({ nums }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let probes = 0
  while (lo < hi) {
    let mid = Math.floor((lo + hi) / 2)
    const nudged = mid % 2 === 1
    if (nudged) mid -= 1
    probes += 1
    const paired = nums[mid] === nums[mid + 1]
    yield {
      line: paired ? 6 : 8,
      marks: {
        ...ruledOut(nums.length, lo, hi),
        [mid]: "focus",
        [mid + 1]: "anchor",
      },
      state: [
        { label: "lo·hi", value: `${lo}·${hi}` },
        { label: "probes", value: probes },
      ],
      note: `${nudged ? `The midpoint landed on ${mid + 1}, an odd position, so step back to ${mid} — a pair can only be tested from its own start. ` : ""}Positions ${mid} and ${mid + 1} hold ${nums[mid]} and ${nums[mid + 1]}: ${paired ? `a matching pair, so the pattern still holds here and everything up to ${mid + 1} is accounted for. The break is to the right — lo = ${mid + 2}.` : `NOT a pair, so the pattern has already broken at or before ${mid}. hi = ${mid}, keeping ${mid} in range because it may be the lone value itself.`}`,
    }
    if (paired) lo = mid + 2
    else hi = mid
  }
  yield {
    line: 9,
    answer: nums[lo],
    marks: { ...ruledOut(nums.length, lo, lo), [lo]: "answer" },
    state: [
      { label: "lone value", value: nums[lo] },
      { label: "probes", value: probes },
    ],
    note: `lo and hi have met at ${lo}: ${nums[lo]}, after ${probes} probe${probes === 1 ? "" : "s"} on ${nums.length} values. Nothing here compared values with each other for size — it only ever asked whether a pair was still intact.`,
  }
}

const pairedExceptOne = (nums: number[]) => {
  if (nums.length % 2 !== 1) return false
  const counts = new Map<number, number>()
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1)
  const odd = [...counts.values()].filter((c) => c % 2 === 1)
  return (
    odd.length === 1 &&
    [...counts.values()].every((c) => c === 1 || c === 2) &&
    nums.every((v, i) => i === 0 || nums[i - 1] <= v)
  )
}

export const singleInSorted = deriveJourney(problem, {
  slug: "the-loner-among-pairs",
  subtitle: "where the pairing pattern breaks",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  classify: (d) =>
    pairedExceptOne(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the row must be sorted, of odd length, with every value twice except exactly one",
        },
  presets: {
    example: { label: "the example", nums: [1, 1, 2, 3, 3, 4, 4, 8, 8] },
    front: {
      label: "the loner is first",
      nums: [2, 3, 3, 4, 4],
      info: "the pattern breaks immediately",
    },
    back: {
      label: "the loner is last",
      nums: [3, 3, 7, 7, 10],
      info: "nothing is learned until the end",
    },
    single: { label: "one value", nums: [6], info: "no pattern to break" },
    middle: {
      label: "the loner in the middle",
      nums: [1, 1, 2, 3, 3],
      info: "one probe either way",
    },
    long: {
      label: "a longer row",
      nums: [0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7],
    },
  },
  edges: [
    {
      key: "single",
      name: "one value",
      example: "[6] → 6",
      why: "There is no pattern to break and no neighbour to compare against. A loop that reads the position after the midpoint must not run at all here.",
      think: "Does your first comparison read a position that exists?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "front",
      name: "the loner is at the front",
      example: "[2, 3, 3, 4, 4] → 2",
      why: "The pattern is broken from the very first pair, so the search must be able to conclude at position 0. A range that assumes the answer is somewhere inside never gets there.",
      think: "Can your search return the first position?",
      preset: "front",
      constraint: 2,
    },
    {
      key: "back",
      name: "the loner is at the end",
      example: "[3, 3, 7, 7, 10] → 10",
      why: "Every pair before it is intact, so nothing is learned until the last possible probe. This is the input that punishes a range stopping one short of the end.",
      think: "Where does your range finish, and can the answer be the last position?",
      preset: "back",
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
        "given: a sorted row, odd length",
        "every value twice, side by side, except one",
        "before the loner, pairs start on EVEN positions",
        "after it, pairs start on odd ones — task: find the loner",
      ],
      tools: [
        {
          name: "Sorted array of pairs",
          role: "a row whose structure is about POSITIONS rather than values: where each pair begins. Exactly one thing disturbs that structure, and it is the answer.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the pairing pattern breaks exactly once, and the loner is standing in the break",
        "before it, pairs begin at even positions; after it, at odd ones",
        "the answer can be the very first or the very last position",
        "logarithmic is demanded on purpose — it rules out reading everything",
      ],
      quiz: [
        {
          q: "You look at an even position and it matches the value after it. What does that tell you?",
          choices: [
            "nothing useful without more comparisons",
            "everything up to and including that pair is intact, so the break is to the right",
          ],
          answer: 1,
          explain:
            "An intact pair starting at an even position means the shift has not happened yet. One comparison rules out everything to the left.",
        },
      ],
      run: story,
    },
    {
      key: "xor",
      name: "Cancel every pair",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Combine every value with exclusive-or. A value paired with itself cancels to nothing, so what survives is the one that had no partner.",
      takeaways: [
        "exact, one integer of state, and it does not even need the row to be sorted",
        "and it reads every element, which is the one thing the problem forbids",
        "the sortedness — the input's whole structure — goes completely unused",
      ],
      quiz: [
        {
          q: "What does this rung fail to use?",
          choices: [
            "the fact that the values are small",
            "the fact that the row is sorted and the pairs are adjacent",
          ],
          answer: 1,
          explain:
            "It would give the same answer on a shuffled row, at the same cost. The structure is handed over and spent on nothing.",
        },
      ],
      run: xorAll,
    },
    {
      key: "halve",
      name: "Find where the pattern breaks",
      short: "log n, one probe each",
      insight:
        "Cancelling reads everything because it asks about values. Ask about POSITIONS instead: pairs start on even positions before the loner and on odd ones after it, so the break is a boundary — and a boundary can be halved toward.",
      idea: problem.whyNow!,
      takeaways: [
        "force the midpoint to an even position: a pair can only be tested from its own start",
        "an intact pair there means the break is strictly to the right",
        "a broken one means the loner is at or left of the midpoint, so keep the midpoint — hi = mid",
        "the loop runs while lo < hi, and where they meet is the answer",
      ],
      quiz: [
        {
          q: "Why is the midpoint forced to an even position before the comparison?",
          choices: [
            "to make the arithmetic simpler",
            "because the pattern is about where pairs BEGIN, and an odd position is the second half of a pair rather than the start of one",
          ],
          answer: 1,
          explain:
            "Comparing from the middle of a pair tests nothing about the pattern. The whole invariant is stated in terms of pair starts.",
        },
      ],
      run: halve,
    },
  ],
})
