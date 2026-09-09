// Shortest Subarray That Reaches the Target, derived. Two rungs, and the
// permission slip for the second one is a constraint that looks like scenery:
// every value is positive, so a window's sum is monotonic in its width.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/sliding-window/min-subarray-sum.ts"

type N = Data<number> & { target: number }

export function shortestReaching(nums: number[], target: number) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let running = 0
    for (let j = i; j < nums.length; j++) {
      running += nums[j]
      if (running >= target) {
        const width = j - i + 1
        if (best === 0 || width < best) best = width
        break
      }
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

function* story({ nums, target }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Find the SHORTEST stretch of neighbours whose total reaches ${target}. At least ${target} — overshooting is fine. If nothing reaches it, the answer is 0.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "One constraint quietly decides the whole method: every value is positive. That means widening a stretch can only raise its total and narrowing it can only lower one — the sum moves in step with the width, and that is exactly the property a window needs.",
  }
  const answer = shortestReaching(nums, target)
  const total = nums.reduce((a, b) => a + b, 0)
  const at = (() => {
    for (let i = 0; i < nums.length; i++) {
      let run = 0
      for (let j = i; j < nums.length; j++) {
        run += nums[j]
        if (run >= target && j - i + 1 === answer) return [i, j]
      }
    }
    return null
  })()
  yield {
    hold: 3,
    marks: at ? span(nums.length, at[0], at[1], "answer") : {},
    state: [{ label: "shortest", value: answer }],
    answer,
    corner:
      answer === 0
        ? "unreachable"
        : answer === 1
          ? "single"
          : at && at[0] > 0
            ? "notatfront"
            : undefined,
    note:
      answer === 0
        ? `The whole row only adds to ${total}, short of ${target}, so nothing reaches it and the answer is 0. Not −1 and not infinity — 0 is the stated answer for "no such stretch", and it has to be distinguishable from a stretch of length zero, which does not exist.`
        : answer === 1
          ? `One element on its own already reaches ${target}, so the answer is 1 — the shortest a stretch can be. A search that only checks stretches of two or more misses it entirely.`
          : at && at[0] > 0
            ? `The shortest stretch reaching ${target} is ${answer} long, at positions ${at[0]}…${at[1]} — not at the front. The first stretch that qualifies is rarely the shortest one, so nothing may stop at the first success.`
            : `The shortest stretch reaching ${target} is ${answer} long.`,
  }
}

function* everyStart({ nums, target }: N): Generator<DFrame> {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let running = 0
    let reached = false
    for (let j = i; j < nums.length; j++) {
      running += nums[j]
      if (running >= target) {
        const width = j - i + 1
        const better = best === 0 || width < best
        if (better) best = width
        reached = true
        yield {
          line: 7,
          marks: { ...span(nums.length, i, j, "answer"), [i]: "anchor" },
          state: [
            { label: "sum", value: running },
            { label: "best", value: best },
          ],
          note: `From ${i}: the total reaches ${running} at position ${j}, width ${width}. ${better ? "Shorter than anything so far." : `Best is still ${best}.`} Stop widening — every value is positive, so a longer stretch from this same start can only be longer, never better.`,
        }
        break
      }
    }
    if (!reached)
      yield {
        line: 5,
        marks: { ...span(nums.length, i, nums.length - 1), [i]: "anchor" },
        state: [
          { label: "sum", value: running },
          { label: "best", value: best },
        ],
        note: `From ${i}: even taking everything to the end only reaches ${running}. This start can never qualify.`,
      }
  }
  yield {
    line: 9,
    answer: best,
    state: [{ label: "shortest", value: best }],
    note: `${best}. It already knows to stop widening once a start qualifies — but every start still re-adds values the previous start had already summed.`,
  }
}

function* window({ nums, target }: N): Generator<DFrame> {
  let left = 0
  let running = 0
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    running += nums[right]
    let shrank = 0
    while (running >= target) {
      const width = right - left + 1
      if (best === 0 || width < best) best = width
      running -= nums[left]
      left += 1
      shrank += 1
    }
    yield {
      line: shrank ? 8 : 6,
      marks: {
        ...span(nums.length, left, right),
        [right]: shrank ? "answer" : "focus",
      },
      state: [
        { label: "sum", value: running },
        { label: "best", value: best === 0 ? "—" : best },
      ],
      note: shrank
        ? `${nums[right]} joins and the window reaches ${target}. Now shrink from the left while it still qualifies — ${shrank} step${shrank === 1 ? "" : "s"} — recording the width each time, because every one of those is a genuine candidate. Shortest so far: ${best}.`
        : `${nums[right]} joins; the window totals ${running}, still short of ${target}. Nothing to record, and nothing to shrink — with all values positive, a window below the target cannot be improved by making it smaller.`,
    }
  }
  yield {
    line: 11,
    answer: best,
    state: [{ label: "shortest", value: best }],
    note: `${best}. Both edges only ever moved forward, so each value was added once and removed at most once — and the right edge never needed to back up, because a window that already reaches the target cannot be improved by widening it.`,
  }
}

export const minSubarraySum = deriveJourney(problem, {
  slug: "shortest-stretch-to-target",
  subtitle: "positive values are the permission slip for a window",
  reveals: ["sliding-window"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "target", label: "target" }],
  classify: (d) =>
    (d.nums as number[]).every((v) => v > 0)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "every value must be positive — a window rests on the sum rising with the width, and a negative breaks that",
        },
  presets: {
    example: {
      label: "the example",
      nums: [2, 3, 1, 2, 4, 3],
      extra: { target: 7 },
    },
    unreachable: {
      label: "nothing reaches it",
      nums: [1, 1, 1, 1],
      extra: { target: 11 },
      info: "the answer is 0",
    },
    single: {
      label: "one element is enough",
      nums: [1, 4, 9, 2],
      extra: { target: 9 },
      info: "the shortest possible stretch",
    },
    notatfront: {
      label: "the best stretch is late",
      nums: [1, 1, 1, 1, 8, 8],
      extra: { target: 12 },
      info: "the first qualifying stretch is not the shortest",
    },
    whole: {
      label: "only the whole row reaches it",
      nums: [2, 2, 2],
      extra: { target: 6 },
      info: "the window never shrinks",
    },
    long: {
      label: "a longer row",
      nums: [1, 2, 3, 1, 1, 1, 7, 2, 1, 4, 5, 1],
      extra: { target: 11 },
    },
  },
  edges: [
    {
      key: "unreachable",
      name: "nothing reaches the target",
      example: "target 11 on [1, 1, 1, 1] → 0",
      why: "The answer is 0, not -1 and not some sentinel. It also has to be distinguishable from a legitimate width, which is why 0 works: no stretch has length zero.",
      think: "What does your answer start at, and could a real answer ever equal it?",
      preset: "unreachable",
      constraint: 3,
    },
    {
      key: "single",
      name: "one element is enough",
      example: "target 9 on [1, 4, 9, 2] → 1",
      why: "A single element can reach the target on its own, so the shortest answer is 1. Anything that only considers stretches of two or more misses it.",
      think: "Is a stretch of one a candidate in your search?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "notatfront",
      name: "the shortest stretch is not the first one",
      example: "target 12 on [1, 1, 1, 1, 8, 8] → 2",
      why: "The first stretch that qualifies runs from the front and is long. Stopping at the first success answers 5 or 6 for a row whose answer is 2.",
      think: "Does your search stop at the first qualifying stretch, or keep looking for a shorter one?",
      preset: "notatfront",
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
        "given: a row of POSITIVE integers and a target",
        "a stretch qualifies if its total is at least the target",
        "task: the LENGTH of the shortest qualifying stretch",
        "none qualifies: return 0",
      ],
      tools: [
        {
          name: "Array of positive integers",
          role: "a row where widening a stretch can only raise its total. That single fact is what turns a search over every pair of endpoints into a walk.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "at least the target — overshooting is allowed, so there is no exact-sum hunt here",
        "the answer is a length, and 0 means no stretch qualifies",
        "all values positive: the sum rises with the width and falls when it narrows",
      ],
      quiz: [
        {
          q: "Why does the promise that every value is positive matter so much?",
          choices: [
            "it keeps the totals small",
            "it makes a stretch's total rise as it widens, so a window can reason about growing and shrinking",
          ],
          answer: 1,
          explain:
            "With a negative in the row, a wider stretch could total less, and 'too small — widen it' would stop being sound. Monotonicity is the whole permission.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Extend from every start",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take each start, extend to the right adding as you go, and stop the moment the total reaches the target — recording the width. Keep the smallest.",
      takeaways: [
        "it already uses positivity once: it stops widening as soon as a start qualifies",
        "but every start re-adds values the previous start had already summed",
        "n starts, each walking up to the whole row",
      ],
      quiz: [
        {
          q: "Why can this rung stop widening as soon as a start qualifies?",
          choices: [
            "to save time, at the cost of missing answers",
            "because the values are positive, so any wider stretch from that start is longer and no more useful",
          ],
          answer: 1,
          explain:
            "It is not a heuristic. A longer stretch from the same start cannot be shorter, and shorter is the only thing being minimised.",
        },
      ],
      run: everyStart,
    },
    {
      key: "window",
      name: "Grow right, shrink left",
      short: "one pass, both edges forward",
      insight:
        "Each start re-sums a prefix the previous start already walked. Keep one window instead: push the right edge out until the total qualifies, then pull the left edge in while it still does — recording a width at every step, because each of those is a real candidate.",
      idea: problem.whyNow!,
      takeaways: [
        "record the width every time the window qualifies, not only once at the end",
        "shrinking while it still qualifies is what finds the SHORTEST rather than the first",
        "the right edge never backs up: a qualifying window cannot be improved by widening",
        "each element is added once and removed at most once",
      ],
      quiz: [
        {
          q: "The window reaches the target. Why keep shrinking rather than moving on?",
          choices: [
            "to save memory",
            "because a narrower window that still qualifies is a better answer, and only shrinking can find it",
          ],
          answer: 1,
          explain:
            "The width is what is being minimised. Every step of the shrink that still qualifies is a shorter candidate than the one before it.",
        },
      ],
      run: window,
    },
  ],
})
