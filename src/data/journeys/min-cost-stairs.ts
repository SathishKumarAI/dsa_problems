// Cheapest Way Up the Stairs, derived. Two rungs and no speed difference at
// all — both are linear. The argument is only about how much history a rule
// that looks back two steps actually needs to keep.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/min-cost-stairs.ts"

type N = Data<number>

export function cheapestClimb(cost: number[]) {
  const best = [...cost]
  for (let i = 2; i < cost.length; i++)
    best[i] = cost[i] + Math.min(best[i - 1], best[i - 2])
  return Math.min(best[cost.length - 1], best[cost.length - 2])
}

// The stairs actually stepped on by a cheapest route — the story act points at
// them, so they are reconstructed rather than described.
function routeOf(cost: number[]) {
  const best = [...cost]
  for (let i = 2; i < cost.length; i++)
    best[i] = cost[i] + Math.min(best[i - 1], best[i - 2])
  const n = cost.length
  let at = best[n - 1] <= best[n - 2] ? n - 1 : n - 2
  const route = [at]
  while (at >= 2) {
    at = best[at - 1] <= best[at - 2] ? at - 1 : at - 2
    route.unshift(at)
  }
  return route
}

const stepped = (n: number, route: number[]) =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [
      i,
      route.includes(i) ? "answer" : "dim",
    ])
  ) as Record<number, ChipRole>

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Each stair costs something to stand on. From a stair you may climb one step or two. Start on either of the first two, and get PAST the top as cheaply as you can.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Two details in that sentence do real work. You start ON a stair without paying to arrive at it, so the first two cost only themselves. And the goal is past the top, not on it — so the final stair need never be paid for at all.",
  }
  const answer = cheapestClimb(nums)
  const route = routeOf(nums)
  const dear = Math.max(...nums)
  yield {
    hold: 3,
    marks: stepped(nums.length, route),
    state: [{ label: "cheapest", value: answer }],
    answer,
    corner:
      nums.length === 2
        ? "twostairs"
        : !route.includes(nums.length - 1)
          ? "skiptop"
          : nums.some((v, i) => i > 0 && i < nums.length - 1 && v === dear && !route.includes(i))
            ? "stepover"
            : undefined,
    note:
      nums.length === 2
        ? `Two stairs, and you may start on either — so the answer is simply the cheaper of them: ${answer}. No climbing happens at all, and a rule written in terms of "the two stairs before this one" has nowhere to run.`
        : !route.includes(nums.length - 1)
          ? `The cheapest climb costs ${answer}, stepping on ${route.join(", ")} — and NOT on the last stair. The goal is past the top, so the final stair is optional; paying for it because it is last is a common way to answer too much.`
          : nums.some((v, i) => i > 0 && i < nums.length - 1 && v === dear && !route.includes(i))
            ? `The cheapest climb costs ${answer}. There is an expensive stair here that the route steps clean over — which is the whole reason a greedy "take the cheaper next step" fails: the cheap step now can strand you on the dear one next.`
            : `The cheapest climb costs ${answer}, stepping on stairs ${route.join(", ")}.`,
  }
}

function* table({ nums }: N): Generator<DFrame> {
  const best = [...nums]
  yield {
    line: 3,
    row: best.map((v, i) => (i < 2 ? v : "?")),
    hold: 2,
    marks: { 0: "answer", 1: "answer" },
    state: [{ label: "best[0]·best[1]", value: `${best[0]}·${best[1]}` }],
    note: `The first two stairs cost only themselves — ${best[0]} and ${best[1]} — because you start on one of them and nothing was paid to arrive.`,
  }
  for (let i = 2; i < nums.length; i++) {
    best[i] = nums[i] + Math.min(best[i - 1], best[i - 2])
    const from = best[i - 1] <= best[i - 2] ? i - 1 : i - 2
    yield {
      line: 6,
      row: best.map((v, k) => (k <= i ? v : "?")),
      marks: {
        [i]: "answer",
        [i - 1]: "focus",
        [i - 2]: "focus",
        [from]: "anchor",
      },
      state: [
        { label: `best[${i}]`, value: best[i] },
        { label: "arrived from", value: from },
      ],
      note: `Stair ${i} costs ${nums[i]}. You can only arrive from ${i - 1} (${best[i - 1]}) or ${i - 2} (${best[i - 2]}), so take the cheaper — from ${from} — and add this stair's own cost: ${best[i]}.`,
    }
  }
  const answer = Math.min(best[nums.length - 1], best[nums.length - 2])
  yield {
    line: 6,
    row: best,
    answer,
    marks: {
      [nums.length - 1]: "focus",
      [nums.length - 2]: "focus",
    },
    state: [{ label: "cheapest", value: answer }],
    note: `Either of the last two stairs can step past the top, so the answer is the cheaper of them: ${answer}. Now look at which entries each step actually read — the one before, and the one before that. Never anything older.`,
  }
}

function* rolling({ nums }: N): Generator<DFrame> {
  let twoBack = nums[0]
  let oneBack = nums[1]
  yield {
    line: 2,
    hold: 2,
    marks: { 0: "anchor", 1: "focus" },
    state: [{ label: "two back · one back", value: `${twoBack}·${oneBack}` }],
    note: `Carry two numbers: the cheapest way to be standing two stairs back (${twoBack}) and one stair back (${oneBack}). At the start those are simply the first two stairs' own costs.`,
  }
  for (let i = 2; i < nums.length; i++) {
    const current = nums[i] + Math.min(oneBack, twoBack)
    yield {
      line: 4,
      marks: { [i]: "answer", [i - 1]: "focus", [i - 2]: "anchor" },
      state: [
        { label: "two back · one back", value: `${oneBack}·${current}` },
        { label: "arrived from", value: oneBack <= twoBack ? i - 1 : i - 2 },
      ],
      note: `Stair ${i} costs ${nums[i]}, on top of the cheaper of the two carried numbers (${Math.min(oneBack, twoBack)}) — ${current}. Then both slide along: what was one back becomes two back, and this becomes one back. Nothing older is kept, because nothing older is ever asked for.`,
    }
    twoBack = oneBack
    oneBack = current
  }
  const answer = Math.min(oneBack, twoBack)
  yield {
    line: 6,
    answer,
    state: [{ label: "cheapest", value: answer }],
    note: `${answer} — the cheaper of the final two, either of which can step past the top. Same recurrence, same order, same number of additions as the table; the only thing that changed is that nothing dead is being kept alive.`,
  }
}

export const minCostStairs = deriveJourney(problem, {
  slug: "cheapest-way-up",
  subtitle: "a rule that looks back two steps needs two numbers",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer staircase" },
  classify: (d) =>
    (d.nums as number[]).length >= 2
      ? { ok: true }
      : { ok: false, warning: "there must be at least two stairs" },
  presets: {
    example: {
      label: "the example",
      nums: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1],
    },
    twostairs: {
      label: "two stairs",
      nums: [10, 15],
      info: "start on the cheaper one and step past",
    },
    skiptop: {
      label: "the top stair is skipped",
      nums: [10, 15, 20],
      info: "the goal is PAST the top",
    },
    stepover: {
      label: "one stair worth stepping over",
      nums: [1, 100, 1],
      info: "greedy takes the cheap step and pays for it",
    },
    flat: {
      label: "every stair the same",
      nums: [5, 5, 5, 5, 5],
      info: "any two-step route ties",
    },
    long: {
      label: "a longer staircase",
      nums: [4, 2, 9, 1, 7, 3, 8, 2, 6, 10, 1, 5, 3],
    },
  },
  edges: [
    {
      key: "twostairs",
      name: "only two stairs",
      example: "[10, 15] → 10",
      why: "You start on either one and step straight past the top, so the answer is the cheaper of them. No climbing happens, and a loop written in terms of 'the two stairs before this one' must not run at all.",
      think: "Does your loop have anything to do when the staircase is as short as it is allowed to be?",
      preset: "twostairs",
      constraint: 0,
    },
    {
      key: "skiptop",
      name: "the top stair is never paid for",
      example: "[10, 15, 20] → 15",
      why: "The goal is past the top, so the last stair is optional. Answering with the cost of standing ON the final stair adds a payment the problem never asked for — 30 instead of 15.",
      think: "Where does the climb end — on the last stair, or beyond it?",
      preset: "skiptop",
      constraint: 3,
    },
    {
      key: "stepover",
      name: "a stair worth stepping over",
      example: "[1, 100, 1] → 2",
      why: "Taking the cheapest next step from stair 0 lands on the 100. The route has to step OVER it, which means a decision made one step at a time, on local cost alone, is wrong.",
      think: "Can the cheapest next step leave you somewhere expensive?",
      preset: "stepover",
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
        "given: a cost for standing on each stair",
        "from a stair, climb one step or two",
        "start on either of the first two, paying only its own cost",
        "task: the cheapest way to get PAST the top",
      ],
      tools: [
        {
          name: "Array of costs",
          role: "a row addressed by stair. What reaches a stair is fixed by position — only the two stairs immediately below it — so the structure of the answer is entirely local.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the first two stairs cost only themselves — nothing was paid to arrive",
        "the goal is past the top, so the final stair is optional",
        "the cheapest next step can strand you on an expensive stair, so local choices are not enough",
      ],
      quiz: [
        {
          q: "The stairs cost [1, 100, 1]. What is the cheapest climb?",
          choices: ["2, starting at 1 and stepping over the 100", "101"],
          answer: 0,
          explain:
            "Start on stair 0 for 1, step two to stair 2 for 1, then past the top. Taking the cheapest single step first would land on the 100.",
        },
      ],
      run: story,
    },
    {
      key: "table",
      name: "The cheapest way to stand on each stair",
      short: "one pass, one array",
      from: 0,
      insight: "",
      idea: "Write down, for every stair, the cheapest total cost of standing on it: its own cost plus the cheaper of the two stairs that could have reached it. The answer is the cheaper of the last two.",
      takeaways: [
        "the recurrence is the whole problem: only two stairs can reach any given one",
        "the first two entries are the base case, and they are the stairs' own costs",
        "the answer is the cheaper of the LAST TWO, because either can step past the top",
        "and every entry is read by exactly the next two steps, then never again",
      ],
      quiz: [
        {
          q: "Why is the answer the cheaper of the last two entries rather than the last one?",
          choices: [
            "to save a step",
            "because the goal is past the top, and either of the last two stairs can step past it",
          ],
          answer: 1,
          explain:
            "Standing on the final stair is not the goal. From the second-to-last, a two-step climb clears the top without paying for the last stair at all.",
        },
      ],
      run: table,
    },
    {
      key: "rolling",
      name: "Two numbers",
      short: "one pass, constant space",
      insight:
        "Each entry in that array is read by the next two steps and never again. Everything older is dead the moment the walk passes it, and an array of dead values is just an array.",
      idea: problem.whyNow!,
      takeaways: [
        "carry the cheapest cost of the two stairs behind you, and nothing else",
        "both slide along together each step — computing one from the other's new value is the classic bug",
        "same recurrence, same order, same additions; only the storage changed",
        "and the cost of the compression is that you can no longer say which stairs were used",
      ],
      quiz: [
        {
          q: "Both rungs are O(n). What is actually different?",
          choices: [
            "the number of additions",
            "how much of the history is kept alive — n entries against two",
          ],
          answer: 1,
          explain:
            "The arithmetic is identical. The table keeps every answer it has ever computed; the rolling version keeps only the two that anything will still ask for.",
        },
      ],
      run: rolling,
    },
  ],
})
