// Move the Zeroes to the End, derived. Two rungs and one idea: a reader that
// never stops and a writer that only moves when something is kept. The gap
// between them counts the zeroes without anybody counting anything.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/move-zeroes/index.ts"

type N = Data<number>

export function zeroesLast(nums: number[]) {
  const kept = nums.filter((v) => v !== 0)
  return [...kept, ...new Array<number>(nums.length - kept.length).fill(0)]
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Every 0 goes to the end. Everything else keeps the order it was already in. And it has to happen inside the row you were handed — no second array to build the answer in.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "That second rule is the one with teeth. Swapping each 0 with the last element would move the zeroes just fine, and it would also drag whatever was at the end into the middle — the non-zero values are not allowed to reorder among themselves.",
  }
  const out = zeroesLast(nums)
  const zeros = nums.filter((v) => v === 0).length
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((v, i) => [i, v === 0 ? "dim" : "focus"])
    ) as Record<number, ChipRole>,
    state: [{ label: "becomes", value: out.join(", ") }],
    answer: out,
    corner:
      zeros === 0
        ? "nozeros"
        : zeros === nums.length
          ? "allzeros"
          : nums[nums.length - 1] === 0 && nums[0] !== 0
            ? "trailing"
            : undefined,
    note:
      zeros === 0
        ? "There is not a single 0 here, so the answer is the row exactly as it arrived. Every value must stay where it is — an approach that shuffles anything has already failed on the easiest possible input."
        : zeros === nums.length
          ? "Every value is 0, so nothing is kept and nothing moves. Whatever marks 'where the next kept value goes' never advances at all, and everything from position 0 onward has to end up 0 — which it already is."
          : nums[nums.length - 1] === 0 && nums[0] !== 0
            ? `${nums.join(", ")} becomes ${out.join(", ")}. The row already ends in a 0, so some of the zeroes have nowhere to travel — and an approach that swaps every 0 with the last element would happily swap it with itself, or with another 0, forever.`
            : `${nums.join(", ")} becomes ${out.join(", ")}: ${nums.length - zeros} value${nums.length - zeros === 1 ? "" : "s"} kept in their original order, then ${zeros} zero${zeros === 1 ? "" : "es"}.`,
  }
}

function* copyOut({ nums }: N): Generator<DFrame> {
  const kept: number[] = []
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) kept.push(nums[i])
    yield {
      line: 1,
      marks: { [i]: nums[i] === 0 ? "dim" : "answer" },
      state: [{ label: "kept", value: kept.join(", ") || "—" }],
      note:
        nums[i] === 0
          ? `Position ${i} is 0 — dropped. The copy does not grow.`
          : `Position ${i} holds ${nums[i]} — kept, and appended to a second list, which now holds ${kept.length} value${kept.length === 1 ? "" : "s"}.`,
    }
  }
  const out = [...kept]
  while (out.length < nums.length) out.push(0)
  yield {
    line: 3,
    row: out,
    hold: 2,
    state: [{ label: "padded to", value: out.length }],
    note: `Padded with ${nums.length - kept.length} zero${nums.length - kept.length === 1 ? "" : "es"} to the original length: ${out.join(", ")}.`,
  }
  yield {
    line: 6,
    row: out,
    answer: out,
    state: [{ label: "answer", value: out.join(", ") }],
    note: `Copied back over the original: ${out.join(", ")}. Linear, correct, and it allocated a whole second row to hold values it immediately copied back into the first — which is exactly the thing the problem said not to do.`,
  }
}

function* readWrite({ nums }: N): Generator<DFrame> {
  const out = [...nums]
  let write = 0
  for (let read = 0; read < out.length; read++) {
    const keep = out[read] !== 0
    if (keep) {
      out[write] = out[read]
      write += 1
    }
    yield {
      line: keep ? 3 : 2,
      row: [...out],
      marks: {
        [read]: keep ? "focus" : "dim",
        [Math.max(0, write - 1)]: "answer",
      },
      state: [
        { label: "read", value: read },
        { label: "write", value: write },
      ],
      note: keep
        ? `${out[write - 1]} is kept, so it is written at ${write - 1} and the writer moves to ${write}. ${read === write - 1 ? "Reader and writer are still together — nothing has been dropped yet." : `The writer is ${read - write + 1} behind the reader, which is exactly how many zeroes have gone past.`}`
        : `Position ${read} is 0. The reader moves on; the writer does not — and that refusal to move is the entire mechanism.`,
    }
  }
  for (let i = write; i < out.length; i++) {
    out[i] = 0
    yield {
      line: 6,
      row: [...out],
      marks: { [i]: "dim" },
      state: [
        { label: "from", value: write },
        { label: "filling", value: i },
      ],
      note: `Everything from ${write} onward is a leftover of whatever used to be there, so it is overwritten with 0. Position ${i} done.`,
    }
  }
  yield {
    line: 7,
    row: [...out],
    answer: out,
    state: [{ label: "answer", value: out.join(", ") }],
    note: `${out.join(", ")}. One row, two indices, and the order of the kept values is preserved for free — because the writer only ever writes them in the order the reader met them.`,
  }
}

export const moveZeroes = deriveJourney(problem, {
  slug: "zeroes-to-the-end",
  subtitle: "a writer that only moves when something is worth keeping",
  reveals: ["two-pointers"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  presets: {
    example: { label: "the example", nums: [0, 1, 0, 3, 12] },
    nozeros: {
      label: "no zeroes at all",
      nums: [4, 1, 7, 2],
      info: "nothing may move",
    },
    allzeros: {
      label: "every value is zero",
      nums: [0, 0, 0],
      info: "nothing is kept",
    },
    trailing: {
      label: "it already ends in a zero",
      nums: [1, 0, 2, 0],
      info: "some zeroes have nowhere to travel",
    },
    long: {
      label: "a longer row",
      nums: [0, 5, 0, 0, 3, 8, 0, 1, 0, 0, 7, 2, 0],
    },
  },
  edges: [
    {
      key: "nozeros",
      name: "no zeroes at all",
      example: "[4, 1, 7, 2] → [4, 1, 7, 2]",
      why: "Nothing may move. An approach built on swapping will still perform its swaps here, and any of them that exchanges two different positions has already broken the required order.",
      think: "On a row with nothing to do, does your code do nothing?",
      preset: "nozeros",
      constraint: 2,
    },
    {
      key: "allzeros",
      name: "every value is zero",
      example: "[0, 0, 0] → [0, 0, 0]",
      why: "Nothing is ever kept, so whatever marks where the next kept value goes never advances — and the final fill has to start from position 0 and cover the entire row.",
      think: "Where does your fill start when nothing at all was kept?",
      preset: "allzeros",
      constraint: 0,
    },
    {
      key: "trailing",
      name: "the row already ends in a zero",
      example: "[1, 0, 2, 0] → [1, 2, 0, 0]",
      why: "A zero at the end has nowhere to travel. An approach that swaps each zero with the last element swaps a zero with a zero — no progress, and on a naive loop, no termination either.",
      think: "What does your move do when the destination already holds a zero?",
      preset: "trailing",
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
        "given: a row of integers, some of them 0",
        "every 0 ends up after every non-zero value",
        "the non-zero values keep their RELATIVE order",
        "task: rearrange the row itself, no second row",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row addressed by position, and the row you must hand back is the same object. Reading and writing it at two different positions at once is allowed — that is what 'in place' leaves you.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "two rules, not one: zeroes to the end AND the rest in their original order",
        "the second rule is what rules out swapping a zero with the last element",
        "in place means the answer has to be assembled on top of the input as you read it",
      ],
      quiz: [
        {
          q: "Why can you not just swap each 0 with the value at the end of the row?",
          choices: [
            "because it is too slow",
            "because it drags the last value into the middle and reorders the non-zero values",
          ],
          answer: 1,
          explain:
            "The zeroes would end up in the right place and everything else would be shuffled. The order of the kept values is half the problem.",
        },
      ],
      run: story,
    },
    {
      key: "copy",
      name: "Filter into a copy",
      short: "the honest one",
      from: "copy",
      insight: "",
      idea: "Collect the non-zero values into a new list in the order they appear, pad it with zeroes until it is as long as the original, then copy it back over the original.",
      takeaways: [
        "the order is preserved for free, because the values are collected in the order they are met",
        "already linear — the complaint is not speed",
        "it allocates a whole second row to hold values it immediately copies back",
      ],
      quiz: [
        {
          q: "What does this rung do wrong, given the problem statement?",
          choices: [
            "it reorders the non-zero values",
            "it is quadratic",
            "it builds a second array, which 'in place' forbids",
          ],
          answer: 2,
          explain:
            "It is correct and linear. The only thing wrong with it is the extra row — which is precisely the constraint the problem added to make this interesting.",
        },
      ],
      run: copyOut,
    },
    {
      key: "readwrite",
      name: "One reader, one writer",
      short: "in place, one pass",
      insight:
        "The copy is written in exactly the order the original is read, and it only ever gets shorter. Positions that have already been read can therefore be overwritten safely — so the second row can be the first row.",
      idea: problem.whyNow!,
      takeaways: [
        "the reader visits every position; the writer advances only when a value is kept",
        "the writer can never overtake the reader, so nothing unread is ever destroyed",
        "the gap between them is exactly the number of zeroes seen — nobody has to count them",
        "everything from the writer onward at the end is stale, and becomes 0",
      ],
      quiz: [
        {
          q: "Why is it safe for the writer to overwrite a position the reader has not finished with?",
          choices: [
            "it is not safe, and that is why a copy is needed",
            "the writer is never ahead of the reader, so it only overwrites positions already read",
          ],
          answer: 1,
          explain:
            "The writer advances at most once per read and starts level, so it trails or ties. Anything it lands on has already been consumed.",
        },
      ],
      run: readWrite,
    },
  ],
})
