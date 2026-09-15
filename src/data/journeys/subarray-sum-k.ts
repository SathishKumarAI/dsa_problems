// How Many Subarrays Sum to k?, derived. Three rungs, and the middle one is
// the interesting failure: prefix sums make each stretch's total free and the
// answer is still quadratic, because the pairing was never the arithmetic.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/subarray-sum-k/index.ts"

type N = Data<number> & { k: number }

export function countSubarrays(nums: number[], k: number) {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    let running = 0
    for (let j = i; j < nums.length; j++) {
      running += nums[j]
      if (running === k) total += 1
    }
  }
  return total
}

const stretch = (from: number, to: number, role: ChipRole = "focus") =>
  Object.fromEntries(
    Array.from({ length: Math.max(0, to - from + 1) }, (_, x) => [
      from + x,
      role,
    ])
  ) as Record<number, ChipRole>

function* story({ nums, k }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Count the contiguous stretches whose values add up to exactly ${k}. Not find one — count them all, and two stretches that overlap are two answers.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "One constraint changes everything about what is allowed: the values may be negative. A stretch that overshoots the target is not finished — a negative further along can bring it back — so growing a window and shrinking it when the total is too big does not work here.",
  }
  const total = countSubarrays(nums, k)
  const first = (() => {
    for (let i = 0; i < nums.length; i++) {
      let run = 0
      for (let j = i; j < nums.length; j++) {
        run += nums[j]
        if (run === k) return [i, j]
      }
    }
    return null
  })()
  yield {
    hold: 3,
    marks: first ? stretch(first[0], first[1], "answer") : {},
    state: [{ label: "count", value: total }],
    answer: total,
    corner:
      nums.some((v) => v < 0)
        ? "negatives"
        : nums.every((v) => v === 0)
          ? "zeros"
          : first && first[0] === 0
            ? "atstart"
            : undefined,
    note: nums.some((v) => v < 0)
      ? `${total} stretch${total === 1 ? "" : "es"} sum to ${k}. There are negatives in this row, so the running total goes back down as well as up — it can pass through the same value more than once, and every one of those repeats is another stretch.`
      : nums.every((v) => v === 0)
        ? `Every value is 0, so the running total never moves and ${total} different stretches sum to ${k}. Nothing here is a special case — it is what happens when the same total occurs many times.`
        : first && first[0] === 0
          ? `${total} stretch${total === 1 ? "" : "es"} sum to ${k}, and one of them starts at the very first element. Anything that works by comparing a total against an EARLIER total has to have an earlier total to compare against, before it has seen anything.`
          : `${total} stretch${total === 1 ? "" : "es"} sum to ${k}${first ? `, the first of them from ${first[0]} to ${first[1]}` : ""}.`,
  }
}

function* brute({ nums, k }: N): Generator<DFrame> {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    let running = 0
    for (let j = i; j < nums.length; j++) {
      running += nums[j]
      const hit = running === k
      if (hit) total += 1
      yield {
        line: 6,
        marks: { ...stretch(i, j, hit ? "answer" : "focus"), [i]: "anchor" },
        state: [
          { label: "sum", value: running },
          { label: "count", value: total },
        ],
        note: `From ${i} to ${j}: ${running}. ${hit ? `That is ${k} — count it, and keep going, because a longer stretch from the same start may hit ${k} again.` : `Not ${k}.`}`,
      }
    }
  }
  yield {
    line: 8,
    answer: total,
    state: [{ label: "count", value: total }],
    note: `${total}. Note what it does NOT do on a hit: stop. Overlapping stretches count separately, and with negatives around, a longer stretch from the same start can land on ${k} all over again.`,
  }
}

function* prefixPairs({ nums, k }: N): Generator<DFrame> {
  const prefix = [0]
  for (let i = 0; i < nums.length; i++) {
    prefix.push(prefix[i] + nums[i])
    yield {
      line: 3,
      marks: { ...stretch(0, i, "dim"), [i]: "focus" },
      state: [{ label: `prefix[${i + 1}]`, value: prefix[i + 1] }],
      note: `Everything up to and including position ${i} adds to ${prefix[i + 1]} — one addition, built from the total before it.`,
    }
  }
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j <= nums.length; j++) {
      const sum = prefix[j] - prefix[i]
      const hit = sum === k
      if (hit) total += 1
      yield {
        line: 7,
        marks: { ...stretch(i, j - 1, hit ? "answer" : "focus"), [i]: "anchor" },
        state: [
          { label: "difference", value: sum },
          { label: "count", value: total },
        ],
        note: `prefix[${j}] − prefix[${i}] = ${prefix[j]} − ${prefix[i]} = ${sum}${hit ? ` — that is ${k}. One subtraction, no re-adding.` : "."}`,
      }
    }
  }
  yield {
    line: 9,
    answer: total,
    state: [{ label: "count", value: total }],
    note: `${total}. Every stretch's total now costs one subtraction instead of a walk — and the answer is still quadratic, because there are still n²/2 pairs of endpoints to try. The arithmetic was never the expensive part.`,
  }
}

function* counts({ nums, k }: N): Generator<DFrame> {
  const seen = new Map<number, number>([[0, 1]])
  let running = 0
  let total = 0
  yield {
    line: 1,
    hold: 2,
    state: [{ label: "seen", value: "{0: 1}" }],
    note: "Seed the tally with one occurrence of 0: before reading anything, the running total is 0, and it has happened once. That single entry is what lets a stretch starting at the very first element be counted at all.",
  }
  for (let i = 0; i < nums.length; i++) {
    running += nums[i]
    const want = running - k
    const found = seen.get(want) ?? 0
    total += found
    yield {
      line: 6,
      marks: { ...stretch(0, i, "dim"), [i]: "focus" },
      state: [
        { label: "running", value: running },
        { label: "count", value: total },
      ],
      note: `Running total is ${running}. A stretch ending here sums to ${k} exactly when it starts just after a point where the total was ${want} — and that total has occurred ${found} time${found === 1 ? "" : "s"}. ${found ? `Add ${found}.` : "Nothing to add."} One lookup, not a scan.`,
    }
    seen.set(running, (seen.get(running) ?? 0) + 1)
  }
  yield {
    line: 8,
    answer: total,
    state: [
      { label: "count", value: total },
      { label: "totals held", value: seen.size },
    ],
    note: `${total}, in one pass. It stores HOW MANY times each total has occurred, not where — which is exactly what a count needs, and why repeated totals and negatives need no special handling whatsoever.`,
  }
}

export const subarraySumK = deriveJourney(problem, {
  slug: "stretches-that-sum-to-k",
  subtitle: "why a window fails, and what a tally of totals replaces it with",
  reveals: ["arrays-hashing"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "k", label: "k" }],
  presets: {
    example: { label: "the example", nums: [1, 1, 1], extra: { k: 2 } },
    negatives: {
      label: "with negatives",
      nums: [1, -1, 0],
      extra: { k: 0 },
      info: "the running total comes back down",
    },
    atstart: {
      label: "one starts at the front",
      nums: [3, 4, 7],
      extra: { k: 7 },
      info: "a stretch beginning at position 0",
    },
    zeros: {
      label: "everything is zero",
      nums: [0, 0, 0],
      extra: { k: 0 },
      info: "the same total, over and over",
    },
    none: {
      label: "nothing matches",
      nums: [2, 4, 6],
      extra: { k: 5 },
      info: "the answer is 0, not an absence",
    },
    long: {
      label: "a longer row",
      nums: [3, -1, 4, 2, -6, 5, 1, -1, 2, 3],
      extra: { k: 5 },
    },
  },
  edges: [
    {
      key: "negatives",
      name: "the row contains negatives",
      example: "[1, -1, 0], k = 0 → 3",
      why: "A growing window whose total has passed k is not finished, because a negative further on can bring it back. Every sliding-window instinct is wrong here, and this is the input that proves it.",
      think: "If your total overshoots k, is it safe to shrink from the left?",
      preset: "negatives",
      constraint: 2,
    },
    {
      key: "atstart",
      name: "a stretch starts at the first element",
      example: "[3, 4, 7], k = 7 → 2",
      why: "[3, 4] begins at position 0, so there is no earlier total to subtract. An approach comparing against earlier running totals must already hold one — the total of nothing at all, which is 0 — before it reads a single value.",
      think: "What has your running total been, and how many times, before the first element?",
      preset: "atstart",
      constraint: 3,
    },
    {
      key: "zeros",
      name: "the same total, over and over",
      example: "[0, 0, 0], k = 0 → 6",
      why: "The running total never changes, so it recurs at every position and every pair of positions is an answer. Anything storing one position per total instead of a count answers 3 here, or 1.",
      think: "When the same running total happens twice, is that one fact or two?",
      preset: "zeros",
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
        "given: a row of integers, negatives allowed, and a value k",
        "a stretch = neighbours, no gaps, at least one",
        "count the stretches whose values add to exactly k",
        "overlapping stretches count separately",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row addressed by position, whose values may go up or down. That second part is what stops the total from being monotonic, and it is the whole reason this problem is not a window.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is a count, so positions never need to be remembered — only how many",
        "negatives mean the running total is not monotonic: overshooting k does not end a stretch",
        "overlapping stretches are separate answers, so nothing stops after the first hit",
      ],
      quiz: [
        {
          q: "Why can a sliding window not solve this?",
          choices: [
            "because the array is unsorted",
            "because with negatives, a total that has passed k can come back to it",
          ],
          answer: 1,
          explain:
            "A window relies on the total growing when you extend and shrinking when you contract. Negatives break that, so 'too big — shrink' is no longer sound reasoning.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Add up every stretch",
      short: "the honest one",
      from: "brute",
      insight: "",
      idea: "Take every start, extend to every end adding as you go, and count each time the total lands on k. Never stop early — a longer stretch from the same start can hit k again.",
      takeaways: [
        "n²/2 stretches, each costing one addition thanks to the running total",
        "no early exit: overlapping answers and negatives both forbid it",
        "every start re-adds the same values the previous start already added",
      ],
      run: brute,
    },
    {
      key: "prefix",
      name: "Totals up to each point",
      short: "no re-adding, still quadratic",
      from: "prefix",
      insight:
        "Each start re-walks values the one before it already added. Compute the total up to every position once, and the sum of any stretch becomes the difference of two of them — a single subtraction, no walking.",
      idea: "Build the running total up to each position. The sum of the stretch from i to j−1 is then prefix[j] − prefix[i]. Try every pair of endpoints and count the differences that equal k.",
      takeaways: [
        "a stretch's sum is the difference of two running totals — that identity is the key to the whole problem",
        "the arithmetic is now free, and the answer is still quadratic",
        "what remains expensive is the pairing: for every endpoint, WHICH earlier totals work?",
      ],
      quiz: [
        {
          q: "The arithmetic is now constant per stretch. Why is this still O(n²)?",
          choices: [
            "because building the prefix totals is quadratic",
            "because there are still n²/2 pairs of endpoints to test",
          ],
          answer: 1,
          explain:
            "The totals take one linear pass. The cost that survives is asking every endpoint about every earlier start — a question, not a calculation.",
        },
      ],
      run: prefixPairs,
    },
    {
      key: "counts",
      name: "Tally the totals as you go",
      short: "one pass, one lookup each",
      insight:
        "For an endpoint whose running total is R, the starts that work are exactly the earlier points where the total was R − k. That is not a search — it is a lookup, provided somebody has been counting.",
      idea: problem.whyNow!,
      takeaways: [
        "count occurrences of each running total, not their positions — a count is all the answer needs",
        "seed the tally with one occurrence of 0, or every stretch starting at the front is missed",
        "each element costs one lookup and one increment, so the pass is linear",
        "and because it counts rather than compares, repeated totals and negatives are ordinary",
      ],
      quiz: [
        {
          q: "Why is the tally seeded with {0: 1} before anything is read?",
          choices: [
            "to avoid a lookup failing",
            "because a stretch starting at the first element needs an earlier total of 0 to subtract, and that total has legitimately occurred once",
          ],
          answer: 1,
          explain:
            "The total of the empty prefix is 0 and it really has happened, exactly once. Leaving it out silently drops every stretch that starts at position 0.",
        },
      ],
      run: counts,
    },
  ],
})
