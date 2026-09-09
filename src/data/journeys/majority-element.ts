// The Value That Owns the Majority, derived. Two rungs. The first counts
// everything and answers a much bigger question than was asked; the second
// spends the one guarantee the problem hands over and needs two variables.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/arrays-hashing/majority-element.ts"

type N = Data<number>

export function majorityOf(nums: number[]) {
  const counts = new Map<number, number>()
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1)
  let best = nums[0]
  for (const [value, seen] of counts)
    if (seen > (counts.get(best) ?? 0)) best = value
  return best
}

const owned = (nums: number[], value: number) =>
  Object.fromEntries(
    nums.map((v, i) => [i, v === value ? "answer" : "dim"])
  ) as Record<number, ChipRole>

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "One value in this row appears more than half the time. Find it — and note that you are promised it exists, which is a much stronger gift than it looks.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "More than half means MORE than half, not at least. Line the majority up against everything else in the row and it wins: there are strictly more of it than of all the other values put together.",
  }
  const answer = majorityOf(nums)
  const times = nums.filter((v) => v === answer).length
  const distinct = new Set(nums).size
  yield {
    hold: 3,
    marks: owned(nums, answer),
    state: [
      { label: "majority", value: answer },
      { label: "of", value: `${times}/${nums.length}` },
    ],
    answer,
    corner:
      nums.length === 1
        ? "single"
        : distinct === 1
          ? "uniform"
          : times === nums.length - times + 1 ||
              nums.slice(0, 2).every((v) => v !== answer)
            ? "latestart"
            : undefined,
    note:
      nums.length === 1
        ? `One element, and it is trivially more than half of one: ${answer}. Every approach has to survive a row with nothing to compare against.`
        : distinct === 1
          ? `Every value is ${answer}, so it owns the row outright. Nothing ever disagrees, which means a counter that only ever rises is never tested here — this input cannot catch a broken cancellation.`
          : nums.slice(0, 2).every((v) => v !== answer)
            ? `${answer} appears ${times} times out of ${nums.length}. It does not appear at the front at all, so anything that latches onto the first value it sees has to be able to let go of it again.`
            : `${answer} appears ${times} times out of ${nums.length} — more than half, so it beats everything else combined.`,
  }
}

function* countAll({ nums }: N): Generator<DFrame> {
  const counts = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    counts.set(nums[i], (counts.get(nums[i]) ?? 0) + 1)
    yield {
      line: 2,
      marks: { ...owned(nums, nums[i]), [i]: "focus" },
      state: [
        { label: "value", value: nums[i] },
        { label: "seen", value: counts.get(nums[i])! },
      ],
      note: `${nums[i]} at ${i} — that is ${counts.get(nums[i])} of them so far. ${counts.size} distinct value${counts.size === 1 ? "" : "s"} being tracked.`,
    }
  }
  let best = nums[0]
  for (const [value, seen] of counts)
    if (seen > (counts.get(best) ?? 0)) best = value
  yield {
    line: 6,
    answer: best,
    marks: owned(nums, best),
    state: [
      { label: "majority", value: best },
      { label: "values held", value: counts.size },
    ],
    note: `${best}, with ${counts.get(best)} occurrences. Correct — and it computed how often EVERY value occurs when the question asked about exactly one, and held all ${counts.size} of them in memory to do it.`,
  }
}

function* cancel({ nums }: N): Generator<DFrame> {
  let candidate = nums[0]
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    const adopted = count === 0
    if (adopted) candidate = nums[i]
    const agrees = nums[i] === candidate
    count += agrees ? 1 : -1
    yield {
      line: agrees ? 5 : 5,
      marks: { ...owned(nums, candidate), [i]: "focus" },
      state: [
        { label: "candidate", value: candidate },
        { label: "count", value: count },
      ],
      note: adopted
        ? `The count had fallen to zero — every earlier occurrence of the previous candidate has been cancelled against something that disagreed with it. Nothing carries forward, so ${nums[i]} becomes the candidate and the count starts again at 1.`
        : agrees
          ? `${nums[i]} agrees with the candidate. Count up to ${count}.`
          : `${nums[i]} disagrees, so pair it off against one occurrence of the candidate — both are spent. Count down to ${count}.`,
    }
  }
  yield {
    line: 6,
    answer: candidate,
    marks: owned(nums, candidate),
    state: [{ label: "majority", value: candidate }],
    note: `${candidate}. The count is not how many times it appears — it is the surplus that survived every pairing, and only a value with more occurrences than everything else combined can end with a surplus at all. One value and one integer, whatever the row's length.`,
  }
}

const hasMajority = (nums: number[]) => {
  const counts = new Map<number, number>()
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1)
  return [...counts.values()].some((c) => c * 2 > nums.length)
}

export const majorityElement = deriveJourney(problem, {
  slug: "owns-the-majority",
  subtitle: "one candidate, one counter, and the guarantee that pays for them",
  reveals: ["arrays-hashing"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  // Without a true majority the cancellation returns a candidate that is not
  // the answer — the promise is load-bearing, so an input that breaks it is
  // refused rather than animated into a lie.
  classify: (d) =>
    hasMajority(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "some value must appear MORE than half the time — the single-counter method rests on that promise",
        },
  presets: {
    example: { label: "the example", nums: [2, 2, 1, 1, 1, 2, 2] },
    single: { label: "one element", nums: [7], info: "trivially the majority" },
    uniform: {
      label: "every value the same",
      nums: [4, 4, 4],
      info: "nothing ever disagrees",
    },
    latestart: {
      label: "the majority starts late",
      nums: [5, 6, 3, 3, 3, 3, 1],
      info: "the first value is not the answer",
    },
    exactly: {
      label: "the narrowest majority",
      nums: [8, 1, 8, 2, 8],
      info: "three of five",
    },
    long: {
      label: "a longer row",
      nums: [9, 4, 9, 9, 2, 9, 7, 9, 9, 1, 9, 3, 9],
    },
  },
  edges: [
    {
      key: "single",
      name: "one element",
      example: "[7] → 7",
      why: "One occurrence out of one is more than half, so it is the majority. Anything that starts by comparing two positions has nothing to compare.",
      think: "What is the answer when the row has nothing to disagree with?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "uniform",
      name: "every value the same",
      example: "[4, 4, 4] → 4",
      why: "Nothing ever disagrees, so a counter that only ever rises works perfectly. That is exactly why this input cannot catch a broken cancellation — it is the case that proves nothing.",
      think: "Which of your inputs would actually notice if the decrement were wrong?",
      preset: "uniform",
      constraint: 2,
    },
    {
      key: "latestart",
      name: "the majority starts late",
      example: "[5, 6, 3, 3, 3, 3, 1] → 3",
      why: "The first two values are not the answer. Anything that latches onto the first value it sees, and cannot let go, is wrong here — the candidate has to be abandonable.",
      think: "Can your candidate ever be replaced, and what makes that happen?",
      preset: "latestart",
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
        "given: a row of integers",
        "promised: one value appears MORE than half the time",
        "so: it outnumbers every other value put together",
        "task: return it",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row whose positions carry no meaning — only the multiset of values does. What matters is a single count, and the problem promises that count is bigger than all the others summed.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "more than half, strictly — exactly half is not a majority",
        "the majority outnumbers everything else COMBINED, which is stronger than outnumbering each",
        "the guarantee that it exists is not decoration: it is what makes a one-counter method safe",
      ],
      quiz: [
        {
          q: "A value appears more than n/2 times. How does it compare with all the other values put together?",
          choices: [
            "it appears more often than any single other value",
            "it appears more often than all of them combined",
          ],
          answer: 1,
          explain:
            "More than half on one side leaves less than half for everything else. That is the property the cancellation rests on.",
        },
      ],
      run: story,
    },
    {
      key: "count",
      name: "Count every value",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Tally how many times each value occurs, then return whichever tally is largest.",
      takeaways: [
        "one pass, and obviously right",
        "it computes how often every value occurs to answer a question about one",
        "linear memory, holding counts nobody will ever read",
      ],
      quiz: [
        {
          q: "What does this rung know at the end that the question never asked for?",
          choices: [
            "nothing extra",
            "the exact frequency of every value in the row",
          ],
          answer: 1,
          explain:
            "All of it is computed and all but one number is discarded. That surplus is what the next rung declines to pay for.",
        },
      ],
      run: countAll,
    },
    {
      key: "cancel",
      name: "Pair each one off against the rest",
      short: "one pass, two variables",
      insight:
        "Counting everything ignores the promise. Take it seriously: if one value outnumbers all the others combined, then pairing off each of its occurrences with one occurrence of anything else must leave it standing when the pairs run out.",
      idea: problem.whyNow!,
      takeaways: [
        "carry a candidate and a surplus, not a table of counts",
        "a matching value raises the surplus; a differing one cancels a pair, spending both",
        "a surplus of zero means everything so far has cancelled out — adopt whatever comes next",
        "only a true majority can end with a surplus, which is why the guarantee is load-bearing",
      ],
      quiz: [
        {
          q: "The counter reaches zero midway. What does that tell you about the row so far?",
          choices: [
            "the candidate was wrong",
            "occurrences of the candidate and of everything else have cancelled exactly, so nothing about the prefix can help — start fresh",
          ],
          answer: 1,
          explain:
            "The prefix has been fully paired off, and a majority of the WHOLE row must still be a majority of what remains. Discarding a balanced prefix is safe.",
        },
      ],
      run: cancel,
    },
  ],
})
