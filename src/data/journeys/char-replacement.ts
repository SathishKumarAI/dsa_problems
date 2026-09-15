// Longest Run After k Rewrites, derived. Two rungs. The window is ordinary;
// the thing worth staring at is that the most-common count is never lowered
// when the window shrinks — and why that is correct rather than a bug.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/char-replacement/index.ts"

type S = Data<string> & { k: number }

export function longestAfterRewrites(chars: string[], k: number) {
  let best = 0
  for (let i = 0; i < chars.length; i++) {
    const counts = new Map<string, number>()
    for (let j = i; j < chars.length; j++) {
      counts.set(chars[j], (counts.get(chars[j]) ?? 0) + 1)
      const most = Math.max(...counts.values())
      if (j - i + 1 - most <= k) best = Math.max(best, j - i + 1)
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

function* story({ nums, k }: S): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Up to ${k} character${k === 1 ? "" : "s"} may be rewritten to anything you like. Afterwards, how long can a run of one repeated letter be?`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Turn it around and it becomes a question about windows: a stretch can be made uniform exactly when the characters that are NOT the most common one inside it fit inside the budget. Length minus the most common count — that is the price.",
  }
  const answer = longestAfterRewrites(nums, k)
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((_, i) => [i, "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "longest", value: answer }],
    answer,
    corner:
      k === 0
        ? "kzero"
        : k >= nums.length
          ? "budget"
          : nums.every((c) => c === nums[0])
            ? "uniform"
            : undefined,
    note:
      k === 0
        ? `No rewrites at all, so the answer is simply the longest run already present: ${answer}. The general method has to survive a budget of zero without special-casing it — a window that can never afford a single mismatch.`
        : k >= nums.length
          ? `The budget is ${k} and the string is only ${nums.length} long, so everything can be rewritten and the answer is the whole string: ${answer}. A legal input, and one where the window never shrinks at all.`
          : nums.every((c) => c === nums[0])
            ? `Every character is already '${nums[0]}', so nothing needs rewriting and the answer is the full length, ${answer}. The budget goes unspent.`
            : `${answer}. The best stretch is one where the letters that are not the most common inside it number ${k} or fewer.`,
  }
}

function* everySubstring({ nums, k }: S): Generator<DFrame> {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    const counts = new Map<string, number>()
    for (let j = i; j < nums.length; j++) {
      counts.set(nums[j], (counts.get(nums[j]) ?? 0) + 1)
      const most = Math.max(...counts.values())
      const cost = j - i + 1 - most
      const fits = cost <= k
      if (fits) best = Math.max(best, j - i + 1)
      yield {
        line: 6,
        marks: { ...span(nums.length, i, j, fits ? "focus" : "dim"), [i]: "anchor" },
        state: [
          { label: "rewrites needed", value: cost },
          { label: "best", value: best },
        ],
        note: `"${nums.slice(i, j + 1).join("")}" — ${j - i + 1} long, most common letter appears ${most} time${most === 1 ? "" : "s"}, so ${cost} rewrite${cost === 1 ? "" : "s"} would be needed. ${fits ? `Within the budget of ${k}.` : `Over the budget of ${k}.`}`,
      }
    }
  }
  yield {
    line: 8,
    answer: best,
    state: [{ label: "longest", value: best }],
    note: `${best}. Every start rebuilds its counts from scratch, and the counts for "AAB" are the counts for "AA" plus one letter — recomputed anyway.`,
  }
}

function* window({ nums, k }: S): Generator<DFrame> {
  const counts = new Map<string, number>()
  let best = 0
  let most = 0
  let left = 0
  for (let right = 0; right < nums.length; right++) {
    counts.set(nums[right], (counts.get(nums[right]) ?? 0) + 1)
    const grew = (counts.get(nums[right]) ?? 0) > most
    most = Math.max(most, counts.get(nums[right]) ?? 0)
    let shrunk = false
    while (right - left + 1 - most > k) {
      counts.set(nums[left], (counts.get(nums[left]) ?? 0) - 1)
      left += 1
      shrunk = true
    }
    best = Math.max(best, right - left + 1)
    yield {
      line: shrunk ? 9 : 7,
      marks: {
        ...span(nums.length, left, right, "focus"),
        [right]: "answer",
      },
      state: [
        { label: "most common", value: most },
        { label: "best", value: best },
      ],
      note: `'${nums[right]}' joins${grew ? `, and it is now the most common letter in play at ${most}` : ""}. The window "${nums.slice(left, right + 1).join("")}" is ${right - left + 1} long and would need ${right - left + 1 - most} rewrite${right - left + 1 - most === 1 ? "" : "s"}${shrunk ? " — over budget, so the left edge moved in until it fits again" : ""}. Best so far ${best}.`,
    }
  }
  yield {
    line: 12,
    answer: best,
    state: [{ label: "longest", value: best }],
    note: `${best}. Note what never happened: the most-common count was never LOWERED when the window shrank. It cannot cost a correct answer, because a smaller count could only ever justify a shorter window than one already recorded.`,
  }
}

export const charReplacement = deriveJourney<string>(problem, {
  slug: "longest-run-after-rewrites",
  subtitle: "length minus the most common letter is the price",
  reveals: ["sliding-window"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  params: [{ key: "k", label: "rewrites allowed" }],
  classify: (d) => {
    const k = d.k as number
    return Number.isInteger(k) && k >= 0
      ? { ok: true }
      : { ok: false, warning: "the budget must be zero or more" }
  },
  presets: {
    example: { label: "the example", nums: [..."AABABBA"], extra: { k: 1 } },
    kzero: {
      label: "no rewrites",
      nums: [..."AABABBA"],
      extra: { k: 0 },
      info: "the longest run already present",
    },
    budget: {
      label: "budget bigger than the string",
      nums: [..."ABBB"],
      extra: { k: 4 },
      info: "everything can be rewritten",
    },
    uniform: {
      label: "already one letter",
      nums: [..."AAAA"],
      extra: { k: 2 },
      info: "the budget goes unspent",
    },
    alternating: {
      label: "no two neighbours alike",
      nums: [..."ABABAB"],
      extra: { k: 2 },
      info: "every window costs about half its length",
    },
    long: {
      label: "a longer string",
      nums: [..."AABAABBBCCAABBAA"],
      extra: { k: 3 },
    },
  },
  edges: [
    {
      key: "kzero",
      name: "no rewrites at all",
      example: '"AABABBA", k = 0 → 2',
      why: "The answer is the longest run already present. The general method must handle it without a special case: a window that cannot afford a single mismatched character.",
      think: "Does your window still work when its budget is zero?",
      preset: "kzero",
      constraint: 3,
    },
    {
      key: "budget",
      name: "the budget covers the whole string",
      example: '"ABBB", k = 4 → 4',
      why: "k is allowed to reach the length of the string, so the window may never need to shrink at all. Anything assuming the left edge eventually moves is assuming something the input does not promise.",
      think: "What happens on an input where your shrink loop never runs?",
      preset: "budget",
      constraint: 2,
    },
    {
      key: "uniform",
      name: "already a single letter",
      example: '"AAAA", k = 2 → 4',
      why: "Nothing needs rewriting and the budget goes unspent. The cost formula must give 0 here, which it only does if the most-common count is the count within the WINDOW rather than anything global.",
      think: "Is your most-common count taken over the window, or over the whole string?",
      preset: "uniform",
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
        "given: a string of letters and a budget k",
        "any k characters may be rewritten to anything",
        "a stretch can be made uniform if (length − most common) ≤ k",
        "task: the length of the longest such stretch",
      ],
      tools: [
        {
          name: "String as a row of letters",
          role: "a row addressed by position. The answer is about a contiguous stretch of it, and what matters inside a stretch is only how often its most common letter appears.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the price of a stretch is its length minus the count of its most common letter",
        "which letter you rewrite TO never has to be decided — only how many rewrites it costs",
        "a budget of 0 and a budget larger than the string are both legal",
      ],
      quiz: [
        {
          q: 'How many rewrites does "AABBB" need to become one letter?',
          choices: ["3", "2", "5"],
          answer: 1,
          explain:
            "Its most common letter appears 3 times out of 5, so the other 2 are the ones to rewrite. Length minus the most common count.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Price every stretch",
      short: "the honest one",
      from: "brute",
      insight: "",
      idea: "Take every start and every end, count the letters in that stretch, and keep the longest whose price fits the budget.",
      takeaways: [
        "the price formula is right, and this rung is nothing but the formula applied everywhere",
        "each start rebuilds counts its predecessor already had",
        "n² stretches, each with a scan over the alphabet to find the most common letter",
      ],
      run: everySubstring,
    },
    {
      key: "window",
      name: "Carry the counts with the window",
      short: "one pass, counts kept",
      insight:
        "Two neighbouring stretches share all but one letter, so the counts do not need rebuilding — they need updating. Grow on the right always, and move the left edge only while the price is over budget.",
      idea: problem.whyNow!,
      takeaways: [
        "add on the right, remove on the left, and the counts stay correct for free",
        "the window is valid after every step, so its length is a candidate every step",
        "the most-common count is never lowered when the window shrinks — and that is correct, not a bug",
        "each character enters once and leaves at most once, so the pass is linear",
      ],
      quiz: [
        {
          q: "Why is it safe never to lower the most-common count when the window shrinks?",
          choices: [
            "because it is recomputed later anyway",
            "because a lower count could only ever justify a window shorter than one already recorded, so it cannot change the answer",
          ],
          answer: 1,
          explain:
            "A stale, too-high count can only make the window look cheaper than it is — and any window it wrongly permits is no longer than the best already seen, so the maximum is unaffected.",
        },
      ],
      run: window,
    },
  ],
})
