// Longest Run of 1s With k Flips, derived. Two rungs. The window is the point,
// and the reframing that makes it available is: stop thinking about flipping,
// and start thinking about how many zeroes a stretch is allowed to contain.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/sliding-window/max-ones-after-flips.ts"

type N = Data<number>

export function longestAfterFlips(nums: number[], k: number) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let zeroes = 0
    for (let j = i; j < nums.length; j++) {
      if (nums[j] === 0) zeroes += 1
      if (zeroes <= k) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

const span = (n: number, from: number, to: number, role: ChipRole = "focus") =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [
      i,
      i >= from && i <= to ? role : "dim",
    ])
  ) as Record<number, ChipRole>

function* story({ nums, k }: N & { k: number }): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Zeroes and ones, and a budget of ${k} flip${k === 1 ? "" : "s"}. Turn up to that many zeroes into ones, then take the longest unbroken run of ones you can.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Nothing actually has to be flipped. Turn the question around: a stretch can be made solid exactly when it contains no more than the budget's worth of zeroes. The flips are the price of a stretch, not an action to plan.",
  }
  const answer = longestAfterFlips(nums, k)
  const zeroes = nums.filter((v) => v === 0).length
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((v, i) => [i, v === 0 ? "focus" : "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "longest", value: answer }],
    answer,
    corner:
      k === 0
        ? "nobudget"
        : zeroes <= k
          ? "budgetcovers"
          : nums.every((v) => v === 0)
            ? "allzero"
            : undefined,
    note:
      k === 0
        ? `No flips at all, so the answer is the longest run of ones already there: ${answer}. The general method has to survive a budget of zero — a window that cannot afford a single zero inside it.`
        : zeroes <= k
          ? `There are only ${zeroes} zero${zeroes === 1 ? "" : "es"} in the whole row and the budget is ${k}, so everything can be flipped and the answer is the full length, ${answer}. A legal input, and one where the window never shrinks at all.`
          : nums.every((v) => v === 0)
            ? `Every value is 0 and the budget is ${k}, so the best possible run is exactly ${answer} — the budget itself. Nothing is free here; the answer is bought entirely with flips.`
            : `${answer}. The best stretch is one holding ${k} zero${k === 1 ? "" : "es"} or fewer.`,
  }
}

function* everyWindow({ nums, k }: N & { k: number }): Generator<DFrame> {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let zeroes = 0
    for (let j = i; j < nums.length; j++) {
      if (nums[j] === 0) zeroes += 1
      const fits = zeroes <= k
      if (fits) best = Math.max(best, j - i + 1)
      yield {
        line: 7,
        marks: { ...span(nums.length, i, j, fits ? "focus" : "dim"), [i]: "anchor" },
        state: [
          { label: "zeroes inside", value: zeroes },
          { label: "best", value: best },
        ],
        note: `Window ${i} to ${j}: ${zeroes} zero${zeroes === 1 ? "" : "es"} inside, ${fits ? `within the budget of ${k}, so a run of ${j - i + 1} is possible` : `over the budget of ${k} — and every wider window from this same start is over it too, since zeroes only accumulate`}.`,
      }
    }
  }
  yield {
    line: 9,
    answer: best,
    state: [{ label: "longest", value: best }],
    note: `${best}. Every start recounts the zeroes its predecessor already counted — and it keeps widening windows it has already proved unaffordable.`,
  }
}

function* window({ nums, k }: N & { k: number }): Generator<DFrame> {
  let left = 0
  let zeroes = 0
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeroes += 1
    let moved = 0
    while (zeroes > k) {
      if (nums[left] === 0) zeroes -= 1
      left += 1
      moved += 1
    }
    best = Math.max(best, right - left + 1)
    yield {
      line: moved ? 6 : 4,
      marks: { ...span(nums.length, left, right), [right]: "answer" },
      state: [
        { label: "zeroes inside", value: zeroes },
        { label: "best", value: best },
      ],
      note: `${nums[right]} joins on the right${nums[right] === 0 ? `, so the window now holds ${zeroes} zero${zeroes === 1 ? "" : "es"}` : ""}.${moved ? ` Over budget, so the left edge moves in ${moved} place${moved === 1 ? "" : "s"} — past ${moved === 1 ? "a value" : "values"} until a zero has been dropped and the window is affordable again.` : ""} It is ${right - left + 1} wide${right - left + 1 === best ? ", the longest yet" : `, best still ${best}`}.`,
    }
  }
  yield {
    line: 8,
    answer: best,
    state: [{ label: "longest", value: best }],
    note: `${best}. The window is affordable after every step, so its width is a candidate at every step — and neither edge ever moves backward, so each element is added once and dropped at most once.`,
  }
}

export const maxOnesAfterFlips = deriveJourney(problem, {
  slug: "longest-run-of-ones",
  subtitle: "do not plan the flips — price the stretch",
  reveals: ["sliding-window"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "k", label: "flips allowed" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const k = d.k as number
    if (!nums.every((v) => v === 0 || v === 1))
      return { ok: false, warning: "every value must be 0 or 1" }
    return Number.isInteger(k) && k >= 0
      ? { ok: true }
      : { ok: false, warning: "the budget must be zero or more" }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0],
      extra: { k: 2 },
    },
    nobudget: {
      label: "no flips",
      nums: [1, 1, 0, 1, 1, 1, 0, 1],
      extra: { k: 0 },
      info: "the longest run already there",
    },
    budgetcovers: {
      label: "enough flips for everything",
      nums: [1, 0, 1, 0, 1],
      extra: { k: 3 },
      info: "the window never shrinks",
    },
    allzero: {
      label: "nothing but zeroes",
      nums: [0, 0, 0, 0],
      extra: { k: 2 },
      info: "the answer is the budget",
    },
    shrinktwice: {
      label: "the window must shrink twice",
      nums: [1, 1, 0, 0, 1, 1, 1],
      extra: { k: 1 },
      info: "one arrival costs two steps",
    },
    long: {
      label: "a longer row",
      nums: [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1],
      extra: { k: 3 },
    },
  },
  edges: [
    {
      key: "nobudget",
      name: "no flips at all",
      example: "k = 0 → the longest run already present",
      why: "The window can never afford a single zero, so it must shrink past every one it meets. The general method has to handle it with no special case.",
      think: "Does your window still work when its budget is zero?",
      preset: "nobudget",
      constraint: 2,
    },
    {
      key: "budgetcovers",
      name: "enough flips for every zero",
      example: "[1, 0, 1, 0, 1], k = 3 → 5",
      why: "The budget reaches the whole row, so the window never shrinks at all. Anything assuming the left edge eventually moves is assuming something the input does not promise.",
      think: "What happens on an input where your shrink loop never runs?",
      preset: "budgetcovers",
      constraint: 1,
    },
    {
      key: "allzero",
      name: "nothing but zeroes",
      example: "[0, 0, 0, 0], k = 2 → 2",
      why: "Nothing is free — the answer is exactly the budget. It is the case that separates 'longest run of ones' from 'longest affordable window', which are the same thing only when some ones exist.",
      think: "If there are no ones at all, where does your answer come from?",
      preset: "allzero",
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
        "given: a row of 0s and 1s, and a budget k",
        "up to k zeroes may become ones",
        "a stretch is affordable if it holds at most k zeroes",
        "task: the length of the longest affordable stretch",
      ],
      tools: [
        {
          name: "Binary array",
          role: "a row of two values, where one of them is free and the other has a price. The answer is a contiguous stretch, so what matters is how many of the priced value it contains.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "nothing has to be flipped — the flips are the price of a stretch",
        "the flips must all land inside ONE stretch; they cannot be split between two",
        "k = 0 and a budget covering the whole row are both legal",
      ],
      quiz: [
        {
          q: "What decides whether a stretch is achievable?",
          choices: [
            "how many ones it contains",
            "how many zeroes it contains, against the budget",
          ],
          answer: 1,
          explain:
            "The ones are free. The cost of a stretch is exactly the number of zeroes in it, and it is affordable while that fits the budget.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Price every window",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take every start and every end, count the zeroes between them, and keep the widest window whose count fits the budget.",
      takeaways: [
        "the pricing rule is right, and this rung is just the rule applied everywhere",
        "each start recounts zeroes the previous start already counted",
        "and it keeps widening windows it has already proved unaffordable",
      ],
      run: everyWindow,
    },
    {
      key: "window",
      name: "Carry the count with the window",
      short: "one pass, both edges forward",
      insight:
        "Two neighbouring windows differ by one element, so the count of zeroes does not need rebuilding — it needs updating. And a window that is already too expensive only gets worse as it widens, so there is never a reason to move the right edge back.",
      idea: problem.whyNow!,
      takeaways: [
        "grow on the right always; move the left edge only while the window is unaffordable",
        "the count is updated as the edges move, never recomputed",
        "the window is affordable after every step, so its width is a candidate every step",
        "each element enters once and leaves at most once — linear, whatever the budget",
      ],
      quiz: [
        {
          q: "Why does the right edge never need to move backward?",
          choices: [
            "because the array is sorted",
            "because a window that is too expensive stays too expensive as it widens — going back could only find shorter answers",
          ],
          answer: 1,
          explain:
            "Zeroes only accumulate as a window grows. Once a start is unaffordable at some end, no wider end helps it, so retreating can never uncover a longer answer.",
        },
      ],
      run: window,
    },
  ],
})
