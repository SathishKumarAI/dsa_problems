// Sort Three Colours In Place, derived. Two rungs and one invariant. The
// counting rung is already linear, so the argument is not about speed — it is
// about what "in place, one pass" is actually asking for, and about the one
// line where everybody's first draft goes wrong.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/sort-colors/index.ts"

type N = Data<number>

export const colorsSorted = (nums: number[]) =>
  [...nums].sort((a, b) => a - b)

// low / mid / high draw the three regions the invariant promises: settled 0s,
// the unexamined middle, and settled 2s.
const regions = (n: number, low: number, mid: number, high: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++)
    marks[i] = i < low || i > high ? "answer" : i === mid ? "focus" : "dim"
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Only three values exist in this row — 0, 1 and 2 — and they have to end up grouped in that order. Rearrange the row itself, in a single pass.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Knowing the three values in advance is what makes this more than 'sort it'. There is nothing to compare: a value's position in the answer is decided by the value alone, not by how it ranks against anything else.",
  }
  const out = colorsSorted(nums)
  const nonIncreasing = nums.every((v, i) => i === 0 || v <= nums[i - 1])
  const twoBeforeZero = nums.some(
    (v, i) => v === 2 && nums.slice(i + 1).includes(0)
  )
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((v, i) => [i, v === 1 ? "dim" : "focus"])
    ) as Record<number, ChipRole>,
    state: [{ label: "becomes", value: out.join(", ") }],
    answer: out,
    corner:
      nums.every((v) => v === nums[0])
        ? "allsame"
        : nonIncreasing && nums.length > 1
          ? "reversed"
          : twoBeforeZero
            ? "twoback"
            : undefined,
    note:
      nums.every((v) => v === nums[0])
        ? `Every value is ${nums[0]}, so the row is already the answer and nothing may move. The easiest possible input, and the one where a solution that swaps unconditionally quietly does work it did not need to.`
        : nonIncreasing && nums.length > 1
          ? `${nums.join(", ")} becomes ${out.join(", ")} — the row is in exactly the wrong order, so almost everything has to travel. This is the input that makes 'rearrange in place' mean something rather than being a formality.`
          : twoBeforeZero
            ? `${nums.join(", ")} becomes ${out.join(", ")}. There is a 2 sitting before a 0 here, so at some point a 2 gets sent to the back and something unexamined arrives in its place — and whatever arrives has not been looked at yet.`
            : `${nums.join(", ")} becomes ${out.join(", ")}.`,
  }
}

function* countRewrite({ nums }: N): Generator<DFrame> {
  const counts = [0, 0, 0]
  const shown = [...nums]
  for (let i = 0; i < nums.length; i++) {
    counts[nums[i]] += 1
    yield {
      line: 3,
      row: shown,
      marks: { [i]: "focus" },
      state: [{ label: "counts", value: counts.join(" · ") }],
      note: `${nums[i]} at ${i}. Tally it — ${counts[0]} zero${counts[0] === 1 ? "" : "s"}, ${counts[1]} one${counts[1] === 1 ? "" : "s"}, ${counts[2]} two${counts[2] === 1 ? "" : "s"} so far. No comparison was made: the value indexed its own slot.`,
    }
  }
  let at = 0
  for (let value = 0; value < 3; value++)
    for (let n = 0; n < counts[value]; n++) {
      shown[at] = value
      at += 1
      yield {
        line: 7,
        row: [...shown],
        marks: { [at - 1]: "answer" },
        state: [{ label: "written", value: at }],
        note: `Write ${value} into position ${at - 1}. Note what this is not doing: moving anything. It is overwriting the row with values it counted earlier, which is a rewrite rather than a rearrangement.`,
      }
    }
  yield {
    line: 9,
    row: [...shown],
    answer: [...shown],
    state: [{ label: "result", value: shown.join(", ") }],
    note: `${shown.join(", ")}. Linear and correct — two passes, every element read twice, and the original values destroyed rather than moved. Fine for three plain numbers; not fine the moment each element carries anything else with it.`,
  }
}

function* threePointers({ nums }: N): Generator<DFrame> {
  const out = [...nums]
  let low = 0
  let mid = 0
  let high = out.length - 1
  while (mid <= high) {
    const v = out[mid]
    if (v === 0) {
      ;[out[low], out[mid]] = [out[mid], out[low]]
      low += 1
      mid += 1
      yield {
        line: 5,
        row: [...out],
        marks: regions(out.length, low, mid, high),
        state: [
          { label: "low·mid·high", value: `${low}·${mid}·${high}` },
          { label: "settled", value: low + (out.length - 1 - high) },
        ],
        note: `A 0. It belongs at the front, so it swaps down to ${low - 1} and that position is settled forever. Both low and mid advance — whatever came back from ${low - 1} was already examined, since mid has been past it.`,
      }
    } else if (v === 2) {
      ;[out[mid], out[high]] = [out[high], out[mid]]
      high -= 1
      yield {
        line: 9,
        row: [...out],
        marks: regions(out.length, low, mid, high),
        state: [
          { label: "low·mid·high", value: `${low}·${mid}·${high}` },
          { label: "settled", value: low + (out.length - 1 - high) },
        ],
        note: `A 2. It swaps to ${high + 1} and that end is settled — but mid does NOT advance. The value that just arrived at ${mid} came from the far end and has never been looked at; stepping past it would let a 0 slip into the middle region unseen. This is the line every first draft gets wrong.`,
      }
    } else {
      mid += 1
      yield {
        line: 11,
        row: [...out],
        marks: regions(out.length, low, mid, high),
        state: [
          { label: "low·mid·high", value: `${low}·${mid}·${high}` },
          { label: "settled", value: low + (out.length - 1 - high) },
        ],
        note: `A 1 — already where it belongs, between the 0s and the 2s. Step past it and nothing moves.`,
      }
    }
  }
  yield {
    line: 12,
    row: [...out],
    answer: [...out],
    state: [{ label: "result", value: out.join(", ") }],
    note: `${out.join(", ")}. One pass, no counting, and every value MOVED rather than overwritten. The whole thing is one invariant: before low is all 0s, after high is all 2s, and between mid and high is the part nobody has looked at yet.`,
  }
}

const onlyThreeColours = (nums: number[]) =>
  nums.every((v) => v === 0 || v === 1 || v === 2)

export const sortColors = deriveJourney(problem, {
  slug: "three-colours-in-place",
  subtitle: "one invariant, and the one line where every first draft breaks",
  reveals: ["two-pointers"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  classify: (d) =>
    onlyThreeColours(d.nums as number[])
      ? { ok: true }
      : { ok: false, warning: "every value must be 0, 1 or 2" },
  presets: {
    example: { label: "the example", nums: [2, 0, 2, 1, 1, 0] },
    allsame: {
      label: "one colour only",
      nums: [1, 1, 1],
      info: "nothing should move",
    },
    reversed: {
      label: "exactly backwards",
      nums: [2, 1, 0],
      info: "almost everything has to travel",
    },
    twoback: {
      label: "a 2 before a 0",
      nums: [2, 0, 2, 1],
      info: "something unexamined arrives from the back",
    },
    single: { label: "one value", nums: [2], info: "nothing to rearrange" },
    long: {
      label: "a longer row",
      nums: [2, 1, 0, 2, 2, 1, 0, 0, 1, 2, 0, 1, 2, 0],
    },
  },
  edges: [
    {
      key: "allsame",
      name: "one colour only",
      example: "[1, 1, 1] → unchanged",
      why: "Nothing may move. A solution that swaps unconditionally still produces the right answer here while doing work it did not need to — which means this input cannot catch that mistake, and the reversed one can.",
      think: "On an input that is already correct, does your code perform any swaps?",
      preset: "allsame",
      constraint: 1,
    },
    {
      key: "reversed",
      name: "exactly backwards",
      example: "[2, 1, 0] → [0, 1, 2]",
      why: "Every value has to travel the length of the row. This is where a rewrite and a rearrangement visibly differ, and where a wrong pointer update leaves values stranded.",
      think: "Are you moving the values, or overwriting them with values you counted earlier?",
      preset: "reversed",
      constraint: 2,
    },
    {
      key: "twoback",
      name: "a 2 sits before a 0",
      example: "[2, 0, 2, 1] → [0, 1, 2, 2]",
      why: "Sending a 2 to the back brings an unexamined value forward in its place. Advancing past it steps over a value nobody has looked at — and if that value is a 0, it is stranded in the middle for good.",
      think: "After a swap, is the value now under your pointer one you have already examined?",
      preset: "twoback",
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
        "given: a row holding only 0, 1 and 2",
        "rearrange it so all 0s come first, then 1s, then 2s",
        "in place: the row you were handed is the answer",
        "one pass: each element examined a constant number of times",
      ],
      tools: [
        {
          name: "Array of three known values",
          role: "a row whose values come from a set of three fixed in advance. That is what removes comparison from the problem: where a value belongs is decided by the value itself.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "three known values means three regions, and every value belongs to one by its own identity",
        "nothing has to be compared against anything else",
        "in place means moving values, not overwriting them with counted copies",
      ],
      quiz: [
        {
          q: "What does knowing the three values in advance buy you?",
          choices: [
            "a faster comparison",
            "no comparisons at all — a value's destination follows from the value itself",
          ],
          answer: 1,
          explain:
            "General sorting must discover the order. Here it is given, so the only question is where each value goes, not how it ranks.",
        },
      ],
      run: story,
    },
    {
      key: "count",
      name: "Count, then rewrite",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Count how many 0s, 1s and 2s there are, then overwrite the row with that many of each in order.",
      takeaways: [
        "already linear — the objection is not speed",
        "two passes, and every element is read twice",
        "and it destroys the original values rather than moving them, which is what 'in place' was really asking about",
      ],
      quiz: [
        {
          q: "This rung is already O(n). What is actually wrong with it?",
          choices: [
            "it uses too much memory",
            "it overwrites values instead of moving them, and reads the row twice",
          ],
          answer: 1,
          explain:
            "For three bare numbers the overwrite is harmless. For elements carrying anything else — a record, an object — writing '0' over them is not a rearrangement at all.",
        },
      ],
      run: countRewrite,
    },
    {
      key: "pointers",
      name: "Three pointers, one pass",
      short: "in place, and it never looks back",
      insight:
        "Counting reads everything before writing anything, because it wants totals. But a value's destination never depended on the totals — only on the value. So place each one the moment you see it, and keep the boundaries of the three regions as you go.",
      idea: problem.whyNow!,
      takeaways: [
        "the invariant: before low is all 0s, after high is all 2s, between mid and high is unexamined",
        "a 0 swaps down and both low and mid advance — what comes back has already been seen",
        "a 2 swaps to the back and mid does NOT advance — what comes back has not",
        "a 1 is already in the right region, so mid simply steps past it",
      ],
      quiz: [
        {
          q: "After swapping a 2 to the back, why must mid stay where it is?",
          choices: [
            "to re-check the 2 that was just placed",
            "because the value that arrived came from the unexamined end and has never been looked at",
          ],
          answer: 1,
          explain:
            "Stepping past it would let an unexamined value — possibly a 0 — into the settled middle. The asymmetry with the 0 case is the entire subtlety.",
        },
      ],
      run: threePointers,
    },
  ],
})
