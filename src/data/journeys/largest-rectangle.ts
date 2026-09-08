// Largest Rectangle in Histogram, derived. Every rectangle is named by the bar
// that caps it, so the question is only ever "how far can this bar's height
// reach?" — and the whole journey is about finding both edges cheaply.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/largest-rectangle.ts"

type N = Data<number>

export function biggestRectangle(heights: number[]) {
  let best = 0
  let at = 0
  let span: [number, number] = [0, 0]
  for (let i = 0; i < heights.length; i++) {
    let left = i
    while (left > 0 && heights[left - 1] >= heights[i]) left -= 1
    let right = i
    while (right < heights.length - 1 && heights[right + 1] >= heights[i])
      right += 1
    const area = heights[i] * (right - left + 1)
    if (area > best) [best, at, span] = [area, i, [left, right]]
  }
  return { best, at, span }
}

const under = (n: number, from: number, to: number, cap: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) marks[i] = i >= from && i <= to ? "answer" : "dim"
  marks[cap] = "focus"
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Bars of width one, side by side. Find the largest rectangle that fits entirely underneath them — it must span consecutive bars, and its height is capped by the shortest bar it covers.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "There are far too many rectangles to try. But every one of them is capped by some bar, and the best rectangle capped by a given bar is the widest one at that bar's full height — so there are only as many candidates worth considering as there are bars.",
  }
  const { best, at, span } = biggestRectangle(nums)
  yield {
    hold: 3,
    marks: under(nums.length, span[0], span[1], at),
    state: [
      { label: "area", value: best },
      { label: "height × width", value: `${nums[at]} × ${span[1] - span[0] + 1}` },
    ],
    answer: best,
    corner:
      nums.length === 1
        ? "single"
        : nums.includes(0)
          ? "zero"
          : nums.every((v) => v === nums[0])
            ? "flat"
            : undefined,
    note:
      nums.length === 1
        ? `One bar, so one rectangle: ${nums[0]} × 1 = ${best}. Nothing to compare it against, and every edge-finding loop has to survive having no neighbours.`
        : nums.includes(0)
          ? `The best rectangle is ${nums[at]} tall and ${span[1] - span[0] + 1} wide — area ${best}. There is a bar of height 0 in this row, and it is a wall: no rectangle of any positive height can cross it, however wide the histogram is on either side.`
          : nums.every((v) => v === nums[0])
            ? `Every bar is the same height, so the best rectangle is the whole row: ${nums[0]} × ${nums.length} = ${best}. This is the case where "expand while the neighbour is at least as tall" expands across everything, from every bar.`
            : `The best rectangle is ${nums[at]} tall and ${span[1] - span[0] + 1} wide — area ${best}, capped by the bar at ${at}.`,
  }
}

function* expand({ nums }: N): Generator<DFrame> {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let left = i
    while (left > 0 && nums[left - 1] >= nums[i]) left -= 1
    let right = i
    while (right < nums.length - 1 && nums[right + 1] >= nums[i]) right += 1
    const area = nums[i] * (right - left + 1)
    const record = area > best
    if (record) best = area
    yield {
      line: 10,
      marks: under(nums.length, left, right, i),
      state: [
        { label: "area", value: area },
        { label: "best", value: best },
      ],
      note: `Bar ${i} is ${nums[i]} tall. Push out both ways while the neighbours are at least as tall: it reaches ${left} to ${right}, so at its own height it covers ${right - left + 1} bar${right - left === 0 ? "" : "s"} — area ${area}. ${record ? "The best so far." : `Best is still ${best}.`}`,
    }
  }
  yield {
    line: 11,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}. Right, and on a flat histogram every bar expands across the whole row — n bars, n steps each. The two edges are being rediscovered from scratch for every bar.`,
  }
}

function* divide({ nums }: N): Generator<DFrame> {
  let best = 0
  const solve = function* (lo: number, hi: number): Generator<DFrame> {
    if (lo > hi) return
    let m = lo
    for (let i = lo; i <= hi; i++) if (nums[i] < nums[m]) m = i
    const spanning = nums[m] * (hi - lo + 1)
    if (spanning > best) best = spanning
    yield {
      line: 5,
      marks: under(nums.length, lo, hi, m),
      state: [
        { label: "spanning", value: spanning },
        { label: "best", value: best },
      ],
      note: `Between ${lo} and ${hi} the shortest bar is ${nums[m]} at ${m}. A rectangle crossing it can be no taller than that, and the widest such one covers all ${hi - lo + 1} bars — area ${spanning}. Everything else lies entirely left of ${m} or entirely right of it.`,
    }
    yield* solve(lo, m - 1)
    yield* solve(m + 1, hi)
  }
  yield* solve(0, nums.length - 1)
  yield {
    line: 8,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}. Three cases settle a whole range at once, which is real progress — but finding the shortest bar means scanning the range, and when the shortest keeps landing at an end the range barely shrinks. On an already-sorted histogram this is quadratic again.`,
  }
}

function* stack({ nums }: N): Generator<DFrame> {
  const st: number[] = []
  let best = 0
  for (let i = 0; i <= nums.length; i++) {
    const h = i === nums.length ? 0 : nums[i]
    while (st.length && nums[st[st.length - 1]] > h) {
      const top = st.pop()!
      const left = st.length ? st[st.length - 1] + 1 : 0
      const area = nums[top] * (i - left)
      const record = area > best
      if (record) best = area
      yield {
        line: 7,
        marks: under(nums.length, left, i - 1, top),
        state: [
          { label: "area", value: area },
          { label: "best", value: best },
        ],
        note: `${i === nums.length ? "The row has run out" : `${h} at ${i} is shorter than ${nums[top]}`}, so the bar at ${top} can reach no further right — and it has been waiting since ${left}, because everything it was stacked on top of was shorter still. ${nums[top]} × ${i - left} = ${area}${record ? ", the best so far" : ""}.`,
      }
    }
    if (i < nums.length) {
      st.push(i)
      yield {
        line: 8,
        marks: {
          ...(Object.fromEntries(
            nums.map((_, j) => [j, "dim"])
          ) as Record<number, ChipRole>),
          ...(Object.fromEntries(
            st.map((j) => [j, "anchor"])
          ) as Record<number, ChipRole>),
          [i]: "focus",
        },
        state: [
          { label: "waiting", value: st.map((j) => nums[j]).join(", ") },
          { label: "best", value: best },
        ],
        note: `Bar ${i} (${nums[i]}) joins the bars still waiting for a shorter one. They read ${st.map((j) => nums[j]).join(", ")} — never decreasing, because anything taller than an arrival has already been settled and removed.`,
      }
    }
  }
  yield {
    line: 9,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}. The sentinel at the end — a bar of height 0 that does not exist — is what flushes everything still waiting. Each bar is pushed once and popped once, so the whole thing is linear whatever the histogram looks like.`,
  }
}

export const largestRectangle = deriveJourney(problem, {
  slug: "biggest-rectangle-under-bars",
  subtitle: "every rectangle is named by the bar that caps it",
  reveals: ["stack"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer histogram" },
  presets: {
    example: { label: "the example", nums: [2, 1, 5, 6, 2, 3] },
    flat: {
      label: "every bar the same",
      nums: [4, 4, 4, 4],
      info: "one rectangle covers everything",
    },
    single: { label: "one bar", nums: [7], info: "no neighbours at all" },
    zero: {
      label: "a bar of height zero",
      nums: [5, 6, 0, 4, 5],
      info: "a wall nothing can cross",
    },
    rising: {
      label: "already sorted",
      nums: [1, 2, 3, 4, 5],
      info: "the shortest bar is always at an end",
    },
    long: {
      label: "a longer histogram",
      nums: [3, 1, 4, 6, 5, 2, 7, 3, 8, 2, 4, 1],
    },
  },
  edges: [
    {
      key: "single",
      name: "one bar",
      example: "[7] → 7",
      why: "There is nothing to expand into and no neighbour to compare against. Every edge-finding loop has to produce a width of exactly 1 without stepping off either end.",
      think: "What width does your code give a bar with no neighbours?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "flat",
      name: "every bar the same height",
      example: "[4, 4, 4, 4] → 16",
      why: "The best rectangle is the entire row. It is also the input where 'expand while the neighbour is at least as tall' expands across everything from every bar — n bars each walking n steps.",
      think: "On a flat histogram, how far does each bar expand, and how many bars do it?",
      preset: "flat",
      constraint: 2,
    },
    {
      key: "zero",
      name: "a bar of height zero",
      example: "[5, 6, 0, 4, 5] → 10",
      why: "Height 0 is allowed, and such a bar is a wall: no rectangle of positive height can span it. Anything assuming heights are positive, or that a wide span is always worth checking, is wrong here.",
      think: "Can a rectangle cross a bar of height zero, and does your width calculation know that?",
      preset: "zero",
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
        "given: bar heights, each one unit wide",
        "a rectangle spans consecutive bars",
        "its height is capped by the SHORTEST bar it covers",
        "task: return the largest area",
      ],
      tools: [
        {
          name: "Array of heights",
          role: "a row addressed by position, read as a histogram. A rectangle is a range of positions plus a height, and the height is decided entirely by the smallest value in the range.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "every rectangle is capped by some bar, so there are only n candidates worth checking",
        "for a given bar, the best rectangle at its own height is the widest one it can reach",
        "it reaches until the first STRICTLY shorter bar on each side",
      ],
      quiz: [
        {
          q: "Fixing one bar as the cap, what makes its best rectangle?",
          choices: [
            "the tallest neighbours it can find",
            "the widest span of bars that are all at least as tall as it",
          ],
          answer: 1,
          explain:
            "Its height is fixed at its own, so only width is left to maximise — and the span ends at the first bar shorter than it, on each side.",
        },
      ],
      run: story,
    },
    {
      key: "expand",
      name: "Push out from every bar",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take each bar as the cap, walk left while the neighbours are at least as tall, walk right the same way, and multiply its height by the span reached.",
      takeaways: [
        "makes the idea concrete: the edges are the first strictly shorter bars",
        "and it rediscovers those edges from scratch for every bar",
        "a flat histogram is the worst case — every bar walks the whole row",
      ],
      run: expand,
    },
    {
      key: "divide",
      name: "Split at the shortest bar",
      short: "three cases at a time",
      from: 1,
      insight:
        "Expanding from every bar re-measures the same neighbours over and over. Look at the SHORTEST bar in a range instead: any rectangle either crosses it — capped at its height, so widest is best — or lies entirely on one side of it.",
      idea: "Find the shortest bar in the range. The best rectangle either spans the whole range at that height, or lives strictly to its left, or strictly to its right. Recurse on the two sides.",
      takeaways: [
        "three cases, exhaustive and non-overlapping, settle a whole range at once",
        "the work now follows the recursion rather than the pairs of bars",
        "but finding the shortest bar means scanning the range",
        "and when the shortest keeps landing at an end — a sorted histogram — the range barely shrinks and it is quadratic again",
      ],
      quiz: [
        {
          q: "Which histogram makes this rung degrade to quadratic?",
          choices: [
            "one with many equal heights",
            "an already-sorted one, where the shortest bar is always at an end",
          ],
          answer: 1,
          explain:
            "Splitting at an end removes one bar per level, so the recursion is n deep with a full scan at each level.",
        },
      ],
      run: divide,
    },
    {
      key: "stack",
      name: "Settle a bar the moment a shorter one arrives",
      short: "one push and one pop each",
      insight:
        "Both edges of a bar's rectangle are the first strictly shorter bars beside it — and the right edge announces itself: it is whatever arrives and is shorter. Hold the bars still waiting for that, and each one is settled exactly once, when it happens.",
      idea: problem.whyNow!,
      takeaways: [
        "hold the bars whose right edge has not arrived yet, in non-decreasing height order",
        "a shorter arrival settles every taller bar waiting — its right edge is here",
        "the left edge is free: it is just past whatever the settled bar was sitting on",
        "a sentinel of height 0 at the end flushes everything still waiting",
        "this is the monotonic stack again, and the ordering it maintains is what makes both edges cheap",
      ],
      quiz: [
        {
          q: "When a bar is popped, where does its rectangle's LEFT edge come from?",
          choices: [
            "it has to be searched for",
            "it is just past the bar underneath it on the stack, which is the first shorter one to its left",
          ],
          answer: 1,
          explain:
            "The stack is non-decreasing, so whatever a bar sits on is the nearest shorter bar to its left. Both edges fall out of the structure rather than being looked for.",
        },
      ],
      run: stack,
    },
  ],
})
