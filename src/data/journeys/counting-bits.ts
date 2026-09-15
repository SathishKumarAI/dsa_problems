// Set Bits for Every Number up to n, derived. One number in, an array out.
//
// The stage is the answer array being filled, with the entry each new one
// READS marked — because the whole insight is that removing a bit lands you on
// a smaller number whose answer is already written down.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/counting-bits/index.ts"

type N = Data<number>

const nOf = (nums: number[]) => nums[0] ?? 0

/** The reference: how many 1 bits each number from 0 to n has. */
export function bitCounts(nums: number[]) {
  const n = nOf(nums)
  const best = Array.from({ length: n + 1 }, () => 0)
  for (let i = 1; i <= n; i++) best[i] = best[i >> 1] + (i & 1)
  return best
}

const bin = (x: number) => x.toString(2)

/** The answer array: index over count, blanks for what is not filled yet. */
const table = (
  n: number,
  value: (i: number) => number | string,
  label: string,
  mark?: (i: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  const idx: (number | string)[] = []
  const vals: (number | string)[] = []
  for (let i = 0; i <= n; i++) {
    idx.push(i)
    vals.push(value(i))
    const m = mark?.(i)
    if (m) marks[`1,${i}`] = m
  }
  return { cells: [idx, vals], marks, label }
}

function* story({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const answer = bitCounts(nums)
  const powers = answer.map((_, i) => i > 0 && (i & (i - 1)) === 0)
  yield {
    hold: 3,
    noChips: true,
    note: `For every number from 0 to ${n}, count the 1 bits in its binary form. The answer is an array of ${n + 1} numbers, not a single one.`,
  }
  yield {
    hold: 3,
    grid: table(
      n,
      (i) => bin(i),
      "in binary",
      (i) => (powers[i] ? "focus" : undefined)
    ),
    state: [
      { label: "n", value: n },
      { label: "entries", value: n + 1 },
    ],
    corner: n === 0 ? "zero" : powers.some(Boolean) ? "powers" : undefined,
    note:
      n === 0
        ? "n is 0, so the answer is a single entry: [0]. Zero has no set bits, and an array of one is not an empty array."
        : `Written in binary the pattern is not obvious — the counts rise and then drop back. The lit entries are the powers of two, where a number one bigger than a run of 1s collapses to a single bit.`,
  }
  yield {
    hold: 3,
    grid: table(
      n,
      (i) => answer[i],
      `[${answer.join(", ")}]`,
      () => "answer"
    ),
    answer,
    corner:
      n === 0
        ? "zero"
        : answer.some((_, i) => i > 0 && (i & (i - 1)) === 0)
          ? "powers"
          : "base",
    note: `[${answer.join(", ")}]. The counts do not grow steadily, so there is no formula to read off — but every number IS some smaller number with one more bit's worth of information, and that relationship is what the last rung uses.`,
  }
}

/** Rung 1 — count each number's bits independently. */
function* countEach({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const out: number[] = []
  let shifts = 0
  yield {
    line: 1,
    grid: table(n, () => "", "nothing computed yet"),
    state: [{ label: "entries to fill", value: n + 1 }],
    note: "Take each number in turn and count its bits from scratch: shift right until it reaches zero, adding the lowest bit each time.",
  }
  for (let i = 0; i <= n; i++) {
    let x = i
    let count = 0
    while (x > 0) {
      count += x & 1
      x >>= 1
      shifts++
    }
    out.push(count)
    yield {
      line: 6,
      grid: table(
        n,
        (k) => (k < out.length ? out[k] : ""),
        `${i} is ${bin(i)} → ${count}`,
        (k) => (k === i ? "focus" : k < i ? "dim" : undefined)
      ),
      state: [
        { label: "number", value: `${i} (${bin(i)})` },
        { label: "bits", value: count },
        { label: "shifts so far", value: shifts },
      ],
      corner: i === 0 ? "zero" : undefined,
      note:
        i === 0
          ? "Zero has no bits set, so the loop never runs and the count is 0. That entry costs nothing and everything else will rest on it."
          : `${i} is ${bin(i)}, so ${count} ${count === 1 ? "bit" : "bits"} — walked one bit at a time. And every one of those shifts re-derives something about a SMALLER number whose answer is already sitting in the array.`,
    }
  }
  const answer = bitCounts(nums)
  yield {
    line: 8,
    answer,
    grid: table(
      n,
      (i) => answer[i],
      `[${answer.join(", ")}]`,
      () => "answer"
    ),
    state: [
      { label: "answer", value: `[${answer.join(", ")}]` },
      { label: "shifts", value: shifts },
    ],
    corner: n === 0 ? "zero" : "reuse",
    note: `Correct, in ${shifts} ${shifts === 1 ? "shift" : "shifts"}. Each number was walked bit by bit — up to 32 steps for a large one — and the array it was filling already contained the answer for every smaller number.`,
  }
}

/** Rung 2 — one shift, one lookup. */
function* oneShift({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const best = Array.from({ length: n + 1 }, () => 0)
  yield {
    line: 1,
    grid: table(
      n,
      (i) => (i === 0 ? 0 : ""),
      "entry 0 is 0",
      (i) => (i === 0 ? "anchor" : undefined)
    ),
    state: [{ label: "entries", value: n + 1 }],
    corner: n === 0 ? "zero" : "base",
    note: "Entry 0 is 0, and it is the base every other entry rests on. It needs no special case — it is simply the starting point, which is what an array initialised to zero already gives you.",
  }
  for (let i = 1; i <= n; i++) {
    const from = i >> 1
    const low = i & 1
    best[i] = best[from] + low
    yield {
      line: 3,
      grid: table(
        n,
        (k) => (k <= i ? best[k] : ""),
        `${bin(i)} → ${bin(from)} + ${low}`,
        (k) =>
          k === i ? "focus" : k === from ? "anchor" : k < i ? "dim" : undefined
      ),
      state: [
        { label: "number", value: `${i} (${bin(i)})` },
        { label: `${i} >> 1`, value: `${from} (${bin(from)})` },
        { label: "lowest bit", value: low },
      ],
      corner: (i & (i - 1)) === 0 ? "powers" : undefined,
      note:
        (i & (i - 1)) === 0
          ? `${i} is a power of two: ${bin(i)}. Shifting right gives ${from}, whose answer is ${best[from]}, and the discarded bit was ${low} — so the count drops back to 1 no matter how large ${i} is. The pattern in the array is not smooth, and this is why.`
          : `${bin(i)} shifted right is ${bin(from)} — the same number with its lowest bit removed. That is entry ${from}, already ${best[from]}, and the "& 1" recovers exactly the bit the shift threw away: ${best[from]} + ${low} = ${best[i]}.`,
    }
  }
  const answer = bitCounts(nums)
  yield {
    line: 4,
    answer,
    grid: table(
      n,
      (i) => answer[i],
      `[${answer.join(", ")}]`,
      () => "answer"
    ),
    state: [
      { label: "answer", value: `[${answer.join(", ")}]` },
      { label: "work per entry", value: "a shift, an and, a lookup" },
      { label: "entries", value: n + 1 },
    ],
    corner: n === 0 ? "zero" : "reuse",
    note: `[${answer.join(", ")}], one pass. Each entry costs three constant operations, and the reason the loop can go straight up is that i >> 1 is always STRICTLY smaller than i — so the entry it reads was filled earlier, without anything having to check.`,
  }
}

export const countingBits = deriveJourney<number>(problem, {
  slug: "drop-a-bit-land-on-an-answer",
  subtitle: "shifting right lands on a smaller number you already solved",
  reveals: ["dp", "bit-manipulation"],
  defaultPreset: "example",
  harder: { preset: "long", label: "up to 16" },
  classify: (d) => {
    const nums = d.nums as number[]
    return nums.length === 1 &&
      Number.isInteger(nums[0]) &&
      nums[0] >= 0 &&
      nums[0] <= 16
      ? { ok: true }
      : {
          ok: false,
          warning:
            "one number: n, from 0 to 16 (the real problem allows 100000; the array would not fit)",
        }
  },
  presets: {
    example: { label: "n = 5", nums: [5], info: "[0, 1, 1, 2, 1, 2]" },
    zero: { label: "n = 0", nums: [0], info: "[0], not []" },
    one: { label: "n = 1", nums: [1], info: "[0, 1]" },
    powers: { label: "n = 8", nums: [8], info: "8 drops back to one bit" },
    long: { label: "up to 16", nums: [16], info: "seventeen entries" },
  },
  edges: [
    {
      key: "zero",
      name: "n = 0",
      example: "n = 0 → [0]",
      why: "The answer has n + 1 entries, so an array of one — not an empty array. It is the smallest legal input and the one where a loop written to run n times produces nothing at all.",
      think: "How many entries does your answer have when n is 0?",
      preset: "zero",
      constraint: 1,
    },
    {
      key: "base",
      name: "entry 0 is the base",
      example: "every entry traces back to bits(0) = 0",
      why: "Shifting right repeatedly always reaches 0, so entry 0 is what every other entry ultimately rests on. Getting it wrong is not a single wrong answer — it is an offset applied to the entire array.",
      think: "What does your recurrence bottom out on?",
      preset: "one",
      constraint: 2,
    },
    {
      key: "powers",
      name: "a power of two drops back to one bit",
      example: "7 is 111 with three bits; 8 is 1000 with one",
      why: "The counts do not rise smoothly, which rules out any solution that tries to extend the previous entry by a fixed amount. The recurrence reaches back to i >> 1 rather than to i − 1, and this is the input that shows why that matters.",
      think:
        "Is your recurrence looking at the previous entry, or at a different one?",
      preset: "powers",
      constraint: 2,
    },
    {
      key: "reuse",
      name: "the array already holds what you need",
      example: "bits(i) = bits(i >> 1) + (i & 1)",
      why: "i >> 1 is always strictly smaller than i, so its entry is already filled — no check, no ordering question, no recursion. That guarantee is what turns a per-number bit walk into a single pass.",
      think:
        "Is the entry you are reading always earlier than the one you are writing?",
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
        "given: a number n",
        "task: return an array of n + 1 entries",
        "entry i is the number of 1 bits in i",
        "entry 0 is 0",
      ],
      tools: [
        {
          name: "The answer array",
          role: "there is no input sequence — the row holds one number. What the stage draws is the answer being filled in, which is also the structure the fast version reads from.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is an array of n + 1 entries, so n = 0 gives [0] rather than nothing",
        "the counts do not rise smoothly — a power of two drops back to a single bit",
        "every number is some smaller number with one more bit's worth of information",
      ],
      quiz: [
        {
          q: "7 has three set bits. How many does 8 have?",
          choices: [
            "four — it is bigger",
            "one: 8 is 1000, and the run of 1s collapsed",
          ],
          answer: 1,
          explain:
            "Which is why nothing here can be built by extending the previous entry. The useful relationship reaches further back than one.",
        },
      ],
      run: story,
    },
    {
      key: "each",
      name: "Count every number separately",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "For each number from 0 to n, shift it right until it reaches zero, adding the lowest bit each time.",
      takeaways: [
        "obviously correct, and it needs nothing but the number in front of it",
        "each number costs as many steps as it has bits — up to 32 for a large one",
        "and every one of those steps is about a smaller number whose answer is already in the array being filled",
      ],
      run: countEach,
    },
    {
      key: "shift",
      name: "Remove one bit and look it up",
      short: "one pass",
      insight:
        "Counting each number's bits from scratch re-walks numbers the array has already answered — every shift lands on a smaller number, and smaller numbers are exactly what has been computed already.",
      idea: problem.approach,
      takeaways: [
        "bits(i) = bits(i >> 1) + (i & 1): the shift removes the lowest bit, the AND recovers it",
        "i >> 1 is strictly smaller than i, so the entry read is always already filled",
        "that guarantee is what lets a single left-to-right loop work with no recursion and no ordering check",
        "and entry 0 needs no special case — it is where the shifting bottoms out",
      ],
      quiz: [
        {
          q: "Why is the entry at i >> 1 guaranteed to be filled already?",
          choices: [
            "because the loop fills them in order",
            "because i >> 1 is strictly less than i, and the loop has already passed every smaller index",
          ],
          answer: 1,
          explain:
            "Both halves matter: the recurrence reaches backwards, and the loop runs forwards. That is what makes the table safe to read as it is written.",
        },
      ],
      run: oneShift,
    },
  ],
})
