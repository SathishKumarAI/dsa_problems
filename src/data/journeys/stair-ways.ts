// Ways to Climb Stairs, derived. The input is one number — the row holds n —
// the shape generate-parens and above-plus-left established.
//
// Three rungs and the classic arc: the recurrence written directly (and
// exponential), the same recursion with the answers remembered, and then the
// observation that only two of those remembered answers are ever read again.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/stair-ways.ts"

type N = Data<number>

const nOf = (nums: number[]) => nums[0] ?? 1

/** The reference: how many 1-or-2 step sequences reach the top. */
export function climbWays(nums: number[]) {
  const n = nOf(nums)
  let a = 1
  let b = 1
  for (let i = 0; i < n - 1; i++) {
    const next = a + b
    a = b
    b = next
  }
  return b
}

/** The table of answers, drawn as step index over ways. */
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

/** Every sequence of 1s and 2s summing to n — the story act lists a few. */
const routes = (n: number): string[] => {
  if (n === 0) return [""]
  if (n < 0) return []
  return [
    ...routes(n - 1).map((r) => "1" + r),
    ...routes(n - 2).map((r) => "2" + r),
  ]
}

function* story({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const answer = climbWays(nums)
  const all = n <= 6 ? routes(n) : []
  yield {
    hold: 3,
    noChips: true,
    note: `A staircase of ${n} ${n === 1 ? "step" : "steps"}, climbed one or two at a time. How many different sequences of moves reach the top?`,
  }
  yield {
    hold: 3,
    grid: table(
      n,
      (i) => (i === n ? "?" : ""),
      "the top is step " + n,
      (i) => (i === n ? "focus" : undefined)
    ),
    state: [{ label: "steps", value: n }],
    note: "Ask it backwards. Whatever the last move was, it was a 1 or a 2 — so every route to the top arrives either from the step below it or from two steps below. Those two sets never overlap, because the last move differs.",
  }
  yield {
    hold: 3,
    grid: table(
      n,
      (i) => climbWays([i || 1]),
      `${answer} ways`,
      (i) => (i === n ? "answer" : "dim")
    ),
    answer,
    corner: n === 1 ? "one" : n === 2 ? "two" : "disjoint",
    note:
      n === 1
        ? "One step, one way. The smallest input, and the base the whole recurrence rests on."
        : n === 2
          ? "Two steps, two ways: 1+1 or 2. This is where the recurrence first has two real predecessors rather than a base case."
          : `${answer} ways${all.length ? ` — ${all.slice(0, 4).join(", ")}${all.length > 4 ? ", …" : ""}` : ""}. And the count is Fibonacci, which is not a coincidence: the recurrence IS Fibonacci's, arrived at from a different question.`,
  }
}

/** Rung 1 — the recurrence, written directly. */
function* naive({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const asked = new Map<number, number>()
  let calls = 0
  function* ways(k: number): Generator<DFrame, number> {
    calls++
    asked.set(k, (asked.get(k) ?? 0) + 1)
    if (k <= 1) {
      yield {
        line: 2,
        grid: table(
          n,
          (i) => (asked.has(i) ? (i <= 1 ? 1 : "") : ""),
          `ways(${k}) = 1`,
          (i) => (i === k ? "answer" : undefined)
        ),
        state: [
          { label: "at", value: k },
          { label: "calls", value: calls },
        ],
        corner: k === 1 ? "one" : undefined,
        note: `ways(${k}) is 1 — from the bottom or from the first step there is exactly one way to be where you are. That is the base case, and it is the only place this version produces a number.`,
      }
      return 1
    }
    const a = yield* ways(k - 1)
    const b = yield* ways(k - 2)
    yield {
      line: 3,
      grid: table(
        n,
        (i) => (asked.has(i) ? "" : ""),
        `ways(${k}) = ${a} + ${b}`,
        (i) => (i === k ? "focus" : (asked.get(i) ?? 0) > 1 ? "dim" : undefined)
      ),
      state: [
        { label: "at", value: k },
        { label: `${k - 1} + ${k - 2}`, value: `${a} + ${b}` },
        { label: "calls", value: calls },
      ],
      note: `ways(${k}) = ${a} + ${b}. Correct, and look at the dim entries: they have been asked about more than once. ways(${k - 2}) is computed inside ways(${k - 1}) and then computed again here, from scratch.`,
    }
    return a + b
  }
  const answer = yield* ways(n)
  const repeats = [...asked.values()].reduce((t, v) => t + (v - 1), 0)
  yield {
    line: 3,
    answer,
    grid: table(
      n,
      (i) => climbWays([i || 1]),
      `${answer}`,
      () => "answer"
    ),
    state: [
      { label: "answer", value: answer },
      { label: "calls", value: calls },
      { label: "repeated questions", value: repeats },
    ],
    corner: n <= 2 ? (n === 1 ? "one" : "two") : "repeat",
    note: `${answer}, from ${calls} calls — ${repeats} of which re-asked a question already answered. There are only ${n + 1} distinct questions here, and the gap between that and ${calls} doubles with every extra step.`,
  }
}

/** Rung 2 — the same recursion, with the answers remembered. */
function* memoised({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const memo = new Map<number, number>()
  let calls = 0
  let hits = 0
  function* ways(k: number): Generator<DFrame, number> {
    calls++
    if (memo.has(k)) {
      hits++
      yield {
        line: 5,
        grid: table(
          n,
          (i) => memo.get(i) ?? "",
          `ways(${k}) already known`,
          (i) => (i === k ? "answer" : memo.has(i) ? "dim" : undefined)
        ),
        state: [
          { label: "at", value: k },
          { label: "from the cache", value: memo.get(k)! },
          { label: "cache hits", value: hits },
        ],
        note: `ways(${k}) is in the cache, so it comes back without any work. Every one of these hits is a whole subtree the naive version would have walked again.`,
      }
      return memo.get(k)!
    }
    if (k <= 1) {
      memo.set(k, 1)
      yield {
        line: 5,
        grid: table(
          n,
          (i) => memo.get(i) ?? "",
          `ways(${k}) = 1`,
          (i) => (i === k ? "answer" : undefined)
        ),
        state: [{ label: "at", value: k }],
        corner: k === 1 ? "one" : undefined,
        note: `ways(${k}) = 1, and it is written down. Nothing will ever compute it again.`,
      }
      return 1
    }
    const a = yield* ways(k - 1)
    const b = yield* ways(k - 2)
    memo.set(k, a + b)
    yield {
      line: 6,
      grid: table(
        n,
        (i) => memo.get(i) ?? "",
        `ways(${k}) = ${a + b}`,
        (i) => (i === k ? "focus" : memo.has(i) ? "dim" : undefined)
      ),
      state: [
        { label: "at", value: k },
        { label: "value", value: a + b },
        { label: "cached", value: memo.size },
      ],
      note: `${a} + ${b} = ${a + b}, stored against ${k}. The recursion has not changed at all — what changed is that each question is only ever answered once.`,
    }
    return a + b
  }
  const answer = yield* ways(n)
  yield {
    line: 6,
    answer,
    grid: table(
      n,
      (i) => memo.get(i) ?? "",
      `${answer}`,
      () => "answer"
    ),
    state: [
      { label: "answer", value: answer },
      { label: "calls", value: calls },
      { label: "cache hits", value: hits },
      { label: "entries stored", value: memo.size },
    ],
    corner: "repeat",
    note: `${answer}, with ${hits} of the ${calls} calls answered from the cache. Linear now — and the cost has moved rather than vanished: ${memo.size} stored entries, and a call stack ${n} frames deep on the way down.`,
  }
}

/** Rung 3 — two variables, walking up. */
function* rolling({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  let a = 1
  let b = 1
  yield {
    line: 1,
    grid: table(
      n,
      (i) => (i <= 1 ? 1 : ""),
      "ways(0) and ways(1)",
      (i) => (i <= 1 ? "anchor" : undefined)
    ),
    state: [
      { label: "a", value: a },
      { label: "b", value: b },
    ],
    corner: n === 1 ? "one" : undefined,
    note: "Two variables, holding the two base cases. Nothing else is ever stored — and the reason that works is worth saying out loud: the recurrence only ever looks back TWO steps.",
  }
  for (let i = 2; i <= n; i++) {
    const next = a + b
    a = b
    b = next
    yield {
      line: 3,
      grid: table(
        n,
        (k) => (k <= i ? climbWays([k || 1]) : ""),
        `ways(${i}) = ${next}`,
        (k) =>
          k === i
            ? "focus"
            : k === i - 1 || k === i - 2
              ? "anchor"
              : k < i
                ? "dim"
                : undefined
      ),
      state: [
        { label: "step", value: i },
        { label: "a · b", value: `${a} · ${b}` },
      ],
      corner: i === 2 ? "two" : undefined,
      note: `ways(${i}) = ${next}, the sum of the two before it. The pair then shifts along: what was ways(${i - 1}) becomes the older of the two, and ways(${i - 2}) is forgotten — nothing will ask for it again.`,
    }
  }
  const answer = climbWays(nums)
  yield {
    line: 4,
    answer,
    grid: table(
      n,
      (i) => climbWays([i || 1]),
      `${answer}`,
      (i) => (i === n ? "answer" : "dim")
    ),
    state: [
      { label: "answer", value: answer },
      { label: "memory", value: "2 numbers" },
      { label: "steps", value: n },
    ],
    corner: n <= 2 ? (n === 1 ? "one" : "two") : "disjoint",
    note: `${answer}, in ${Math.max(0, n - 1)} ${n - 1 === 1 ? "addition" : "additions"} and two variables. No array, no stack, no cache — because a table whose every entry is read exactly twice, by its two immediate successors, never needed to be a table.`,
  }
}

export const stairWays = deriveJourney<number>(problem, {
  slug: "only-the-last-two-matter",
  subtitle: "a table read twice by its neighbours is two variables",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a taller staircase" },
  classify: (d) => {
    const nums = d.nums as number[]
    return nums.length === 1 &&
      Number.isInteger(nums[0]) &&
      nums[0] >= 1 &&
      nums[0] <= 12
      ? { ok: true }
      : {
          ok: false,
          warning:
            "one number: n, from 1 to 12 (the real problem allows 45; the animation would not fit)",
        }
  },
  presets: {
    example: { label: "n = 4", nums: [4], info: "5 ways" },
    one: { label: "n = 1", nums: [1], info: "one way" },
    two: { label: "n = 2", nums: [2], info: "1+1 or 2" },
    five: { label: "n = 5", nums: [5], info: "8 ways" },
    long: { label: "a taller staircase", nums: [10], info: "89 ways" },
  },
  edges: [
    {
      key: "one",
      name: "a single step",
      example: "n = 1 → 1",
      why: "One way, and it is a base case rather than a computation. It is also where a loop written to run n times, or one seeded with the wrong pair, returns 2 — the answer being small is what makes the error easy to miss.",
      think: "What does your loop do when there is nothing to iterate over?",
      preset: "one",
      constraint: 0,
    },
    {
      key: "two",
      name: "two steps",
      example: "n = 2 → 2 (1+1 and 2)",
      why: "The first input where the recurrence has two real predecessors instead of a base case, and the smallest place an off-by-one in the seeding shows: ways(0) and ways(1) are both 1, which looks like a duplicate and is not.",
      think:
        "What are your two starting values, and which steps do they stand for?",
      preset: "two",
      constraint: 1,
    },
    {
      key: "disjoint",
      name: "the two cases never overlap",
      example: "every route to step n ends in a 1-step or a 2-step, never both",
      why: "Adding the two counts is only correct because no route is counted twice — the last move differs, so the sets are disjoint. That is the argument the whole recurrence rests on, and it is the thing to check before adding anything in any counting problem.",
      think: "Could a single route be counted in both halves of your sum?",
      preset: "example",
      constraint: 1,
    },
    {
      key: "repeat",
      name: "the same question asked many times",
      example: "ways(n−2) is computed inside ways(n−1) and again beside it",
      why: "The naive version's cost is entirely this repetition — there are only n + 1 distinct questions. Seeing the repeat count grow is what motivates every remaining rung, and it is the shape that recurs in every DP problem.",
      think: "How many DISTINCT questions does your recursion actually ask?",
      preset: "five",
      constraint: 2,
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
        "given: a staircase of n steps",
        "each move goes up 1 step or 2",
        "task: count the distinct sequences of moves that reach the top",
        "n is at least 1",
      ],
      tools: [
        {
          name: "The staircase",
          role: "there is no input sequence here — the row holds a single number. What the stage draws is the answer for every step up to n, which is the table the last rung proves it does not need.",
        },
      ],
      // the problem's third hint gives away the last act by name, which the
      // disclosure rule forbids on the story act — same nudge, no spoiler
      hints: [
        problem.hints[0],
        problem.hints[1],
        "Once you have the recurrence, look at how far back it reaches. That number decides how much of the table is worth keeping.",
      ],
      takeaways: [
        "every route arrives from one step below or two steps below",
        "those two sets never overlap, because the last move differs — which is why the counts can be added",
        "so ways(n) = ways(n−1) + ways(n−2), which is Fibonacci arrived at sideways",
      ],
      quiz: [
        {
          q: "Why can the two counts simply be added?",
          choices: [
            "because addition is how counting works",
            "because no route is in both sets: the last move is either a 1 or a 2, never both",
          ],
          answer: 1,
          explain:
            "Disjointness is the part that needs checking. Add two overlapping sets and the count is quietly too large.",
        },
      ],
      run: story,
    },
    {
      key: "naive",
      name: "Write the recurrence down",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "ways(n) = ways(n−1) + ways(n−2), with 1 for the two smallest cases. Straight from the definition.",
      takeaways: [
        "it is the recurrence itself, in three lines, and it is obviously correct",
        "and it recomputes the same subproblem down every branch",
        "there are only n + 1 distinct questions, and the call count doubles with each extra step",
      ],
      run: naive,
    },
    {
      key: "memo",
      name: "Remember what you worked out",
      short: "each question once",
      from: 1,
      insight:
        "The recursion is right and the repetition is the whole cost — the same question is asked once per path that reaches it, and the answer never changes.",
      idea: "Keep the same recursion, and store each answer the first time it is computed. A repeat becomes a lookup.",
      takeaways: [
        "the algorithm did not change — only whether it repeats itself",
        "linear now, and each entry is written once",
        "the cost has moved rather than gone: n stored entries, and a stack n frames deep",
      ],
      quiz: [
        {
          q: "What did adding the cache change about the recursion?",
          choices: [
            "the order it visits subproblems",
            "nothing about the algorithm — only that each distinct question is answered once",
          ],
          answer: 1,
          explain:
            "Memoisation is a change to the bookkeeping, not to the method. That is exactly what makes it the systematic first fix.",
        },
      ],
      run: memoised,
    },
    {
      key: "rolling",
      name: "Two variables",
      short: "no table at all",
      insight:
        "The cache holds n entries and the stack is n deep, for a recurrence that never looks back further than two steps — so almost everything stored is being kept for nobody.",
      idea: problem.whyNow!,
      takeaways: [
        "each entry is read exactly twice, by its two immediate successors, and then never again",
        "so two variables carry the whole state, walking upward",
        "no array, no cache, no stack — constant memory whatever n is",
        "and the same collapse is available in any DP whose recurrence has a fixed, short reach",
      ],
      quiz: [
        {
          q: "Why is a table unnecessary here when it was necessary for the memoised version?",
          choices: [
            "the table was never necessary",
            "because each entry is only ever read by its next two successors — once the walk moves past them, it is dead",
          ],
          answer: 1,
          explain:
            "It was necessary top-down, where the order of questions is unpredictable. Walking upward makes the reach visible, and the reach is two.",
        },
      ],
      run: rolling,
    },
  ],
})
