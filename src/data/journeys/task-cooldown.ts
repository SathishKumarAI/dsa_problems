// Task Scheduler, derived. A row of task labels (characters) and a cooldown n.
//
// The ladder here does NOT climb in cost — the formula is O(1) and the
// simulation is not. It climbs in what you get back: the formula returns a
// length and can say nothing about what runs when, while the simulation
// produces the schedule itself. The recap says so plainly.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/heaps/task-cooldown.ts"

type T = Data<string> & { n: number }

const countsOf = (tasks: string[]) => {
  const c = new Map<string, number>()
  for (const t of tasks) c.set(t, (c.get(t) ?? 0) + 1)
  return c
}

/** The reference: the shortest schedule length. */
export function shortestSchedule(tasks: string[], n: number) {
  const counts = [...countsOf(tasks).values()]
  const peak = Math.max(...counts)
  const ties = counts.filter((c) => c === peak).length
  return Math.max(tasks.length, (peak - 1) * (n + 1) + ties)
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

/** Run the heap simulation and hand back the schedule it produces. */
function simulate(tasks: string[], n: number) {
  const remaining = [...countsOf(tasks).entries()].map(([label, count]) => ({
    label,
    count,
  }))
  const cooling: { label: string; count: number; ready: number }[] = []
  const schedule: string[] = []
  let time = 0
  while (remaining.length || cooling.length) {
    time++
    while (cooling.length && cooling[0].ready === time) {
      const back = cooling.shift()!
      remaining.push({ label: back.label, count: back.count })
    }
    remaining.sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : 1))
    const pick = remaining.shift()
    if (!pick) {
      schedule.push("_")
      continue
    }
    schedule.push(pick.label)
    if (pick.count > 1)
      cooling.push({
        label: pick.label,
        count: pick.count - 1,
        ready: time + n + 1,
      })
  }
  return { schedule, time }
}

function* story({ nums, n }: T): Generator<DFrame> {
  const counts = countsOf(nums)
  const peak = Math.max(...counts.values())
  const ties = [...counts.values()].filter((c) => c === peak).length
  const answer = shortestSchedule(nums, n)
  const { schedule } = simulate(nums, n)
  yield {
    hold: 3,
    noChips: true,
    note: `A list of tasks and a cooldown of ${n}. Each task takes one unit of time, and two runs of the SAME task must be at least ${n} units apart. Idling is allowed. How short can the whole thing be?`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      counts.get(nums[i]) === peak ? "anchor" : undefined
    ),
    state: [
      { label: "tasks", value: nums.length },
      { label: "most frequent", value: `×${peak}` },
      { label: "tied at the top", value: ties },
    ],
    note: `The busiest task appears ${peak} ${peak === 1 ? "time" : "times"}${ties > 1 ? `, and ${ties} tasks are tied for that` : ""}. Idle time is forced by whichever task cannot be spread out far enough — so the schedule's length is decided by the most frequent task, not by the total.`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, () => "dim"),
    state: [
      { label: "answer", value: answer },
      { label: "schedule", value: schedule.join(" ") },
      { label: "idle", value: answer - nums.length },
    ],
    answer,
    corner:
      n === 0
        ? "nocooldown"
        : answer === nums.length
          ? "noidle"
          : ties > 1
            ? "ties"
            : "idle",
    note:
      n === 0
        ? `A cooldown of 0 means no separation is required at all, so the answer is just the number of tasks: ${answer}. Worth checking early — a formula with n + 1 in it must still give exactly this.`
        : answer === nums.length
          ? `${answer} — no idling needed. There is enough variety to keep every gap filled with real work, which is the case a formula built only from the busiest task must not overshoot.`
          : ties > 1
            ? `${answer}, with ${answer - nums.length} idle ${answer - nums.length === 1 ? "slot" : "slots"}: ${schedule.join(" ")}. Note the ${ties} tasks tied at ${peak}: each one needs a slot in the final block, which is exactly the term a naive formula forgets.`
            : `${answer}, with ${answer - nums.length} idle ${answer - nums.length === 1 ? "slot" : "slots"}: ${schedule.join(" ")}. The gaps are not waste to be optimised away — nothing else is available to run there.`,
  }
}

/** Rung 1 — the closed formula. */
function* formula({ nums, n }: T): Generator<DFrame> {
  const counts = countsOf(nums)
  const peak = Math.max(...counts.values())
  const ties = [...counts.values()].filter((c) => c === peak).length
  yield {
    line: 3,
    marks: marksOf(nums.length, (i) =>
      counts.get(nums[i]) === peak ? "anchor" : "dim"
    ),
    state: [
      { label: "peak", value: peak },
      { label: "tied at peak", value: ties },
    ],
    note: `Only the busiest task shapes the schedule. Lay its ${peak} copies out first, each pair ${n} apart, and everything else drops into the gaps between them.`,
  }
  const blocks = (peak - 1) * (n + 1)
  yield {
    line: 5,
    marks: marksOf(nums.length, (i) =>
      counts.get(nums[i]) === peak ? "focus" : "dim"
    ),
    state: [
      { label: "(peak − 1) × (n + 1)", value: blocks },
      { label: "+ ties", value: blocks + ties },
    ],
    corner: ties > 1 ? "ties" : undefined,
    note: `${peak - 1} full blocks of ${n + 1} slots, then the final block holds the ${ties} ${ties === 1 ? "task" : "tasks"} tied at ${peak}: ${blocks} + ${ties} = ${blocks + ties}. That last term is the part everyone forgets — with two tasks tied, the schedule ends with both of them, not one.`,
  }
  const answer = shortestSchedule(nums, n)
  yield {
    line: 5,
    answer,
    marks: marksOf(nums.length, () => "dim"),
    state: [
      { label: "formula", value: blocks + ties },
      { label: "tasks", value: nums.length },
      { label: "answer", value: answer },
    ],
    corner:
      answer === nums.length && blocks + ties < nums.length
        ? "noidle"
        : n === 0
          ? "nocooldown"
          : undefined,
    note:
      answer === nums.length && blocks + ties < nums.length
        ? `The formula says ${blocks + ties}, and there are ${nums.length} tasks to run — so the answer is ${answer}. That max is not defensive coding: with enough variety the gaps fill themselves, and the block picture undercounts because it only ever looked at the busiest task.`
        : `${answer}, in constant time after the counting. It is the right number — and it says nothing whatsoever about WHICH task runs when, which is the usual follow-up question.`,
  }
}

/** Rung 2 — a heap of remaining counts and a cooldown queue. */
function* heapSim({ nums, n }: T): Generator<DFrame> {
  const remaining = [...countsOf(nums).entries()].map(([label, count]) => ({
    label,
    count,
  }))
  const cooling: { label: string; count: number; ready: number }[] = []
  const schedule: string[] = []
  let time = 0
  let idles = 0
  yield {
    line: 4,
    marks: {},
    state: [
      {
        label: "available",
        value: remaining.map((r) => `${r.label}×${r.count}`).join(" "),
      },
      { label: "cooling", value: "none" },
    ],
    note: "Two structures: a heap of what is available, ordered by how many copies are left, and a queue of tasks waiting out their cooldown with the time they become available again.",
  }
  while (remaining.length || cooling.length) {
    time++
    while (cooling.length && cooling[0].ready === time) {
      const back = cooling.shift()!
      remaining.push({ label: back.label, count: back.count })
    }
    remaining.sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : 1))
    const pick = remaining.shift()
    if (!pick) {
      schedule.push("_")
      idles++
      yield {
        line: 12,
        marks: {},
        state: [
          { label: "time", value: time },
          { label: "schedule", value: schedule.join(" ") },
          {
            label: "cooling",
            value: cooling.map((c) => `${c.label}@${c.ready}`).join(" "),
          },
        ],
        corner: "idle",
        note: `Nothing is available at time ${time} — everything left is still cooling. An idle slot, and not a mistake: the cooldown is a hard constraint, so the clock advances with no work done.`,
      }
      continue
    }
    schedule.push(pick.label)
    if (pick.count > 1)
      cooling.push({
        label: pick.label,
        count: pick.count - 1,
        ready: time + n + 1,
      })
    yield {
      line: 13,
      marks: marksOf(nums.length, (i) =>
        nums[i] === pick.label ? "focus" : "dim"
      ),
      state: [
        { label: "time", value: time },
        { label: "ran", value: pick.label },
        { label: "schedule", value: schedule.join(" ") },
      ],
      corner: n === 0 && time === 1 ? "nocooldown" : undefined,
      note:
        pick.count > 1
          ? `${pick.label} has the most copies left, so it runs now and goes into the queue until time ${time + n + 1}. Running the busiest first is the whole greedy choice: postponing it is what creates idles later.`
          : `${pick.label} runs its last copy and leaves for good.`,
    }
  }
  const answer = shortestSchedule(nums, n)
  yield {
    line: 16,
    answer,
    marks: marksOf(nums.length, () => "answer"),
    state: [
      { label: "answer", value: answer },
      { label: "schedule", value: schedule.join(" ") },
      { label: "idle slots", value: idles },
    ],
    corner: idles === 0 ? "noidle" : undefined,
    note: `${answer} — and unlike the formula, this rung can show its work: ${schedule.join(" ")}. Same number, more information, at the cost of walking every unit of time. Which one to reach for depends on whether the question is "how long" or "what runs when".`,
  }
}

export const taskCooldown = deriveJourney<string>(problem, {
  slug: "the-busiest-task-sets-the-clock",
  subtitle: "idle time is forced by the most frequent task, not by the total",
  reveals: ["heaps"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "more tasks" },
  params: [{ key: "n", label: "cooldown (n)" }],
  classify: (d) => {
    const nums = d.nums as string[]
    const n = (d as T).n
    if (!nums.length || !nums.every((t) => /^[A-Z]$/.test(t)))
      return {
        ok: false,
        warning: "tasks are single uppercase letters, e.g. AAABBB",
      }
    return Number.isInteger(n) && n >= 0 && n <= 100
      ? { ok: true }
      : { ok: false, warning: "the cooldown is a whole number from 0 to 100" }
  },
  presets: {
    example: {
      label: "the example",
      nums: [..."AAABBB"],
      extra: { n: 2 },
      info: "A B _ A B _ A B",
    },
    nocooldown: {
      label: "no cooldown at all",
      nums: [..."AAABBB"],
      extra: { n: 0 },
      info: "just the task count",
    },
    noidle: {
      label: "enough variety to fill the gaps",
      nums: [..."ABCDEF"],
      extra: { n: 2 },
      info: "no idling needed",
    },
    idle: {
      label: "one task dominates",
      nums: [..."AAAAB"],
      extra: { n: 3 },
      info: "idles are forced",
    },
    ties: {
      label: "two tasks tied at the top",
      nums: [..."AAABBBC"],
      extra: { n: 2 },
      info: "the last block holds both",
    },
    single: {
      label: "one task, many copies",
      nums: [..."AAAA"],
      extra: { n: 2 },
      info: "nothing to fill the gaps",
    },
    long: {
      label: "more tasks",
      nums: [..."AAABBCCDDEEFF"],
      extra: { n: 3 },
      info: "thirteen tasks",
    },
  },
  edges: [
    {
      key: "nocooldown",
      name: "a cooldown of zero",
      example: "AAABBB with n = 0 → 6",
      why: "No separation is required, so the answer is simply the number of tasks. A formula built on n + 1 still has to land exactly here, and code that assumes at least one gap between repeats reports 11.",
      think: "Does your arithmetic still work when the gap is zero?",
      preset: "nocooldown",
      constraint: 2,
    },
    {
      key: "noidle",
      name: "enough variety that nothing idles",
      example: "ABCDEF with n = 2 → 6",
      why: "The block picture, built only from the busiest task, undercounts here — it says 1 while there are 6 tasks to run. That is what the max against the task count is for, and without it the answer is shorter than the input.",
      think: "Can your answer ever be smaller than the number of tasks?",
      preset: "noidle",
      constraint: 0,
    },
    {
      key: "ties",
      name: "several tasks tied for most frequent",
      example: "AAABBBC with n = 2 → 8, not 7",
      why: "Every task tied at the peak needs its own slot in the final block. Dropping that term is the single most common error in the formula, and it is invisible whenever exactly one task is busiest.",
      think: "How many tasks share the top count, and where do they all go?",
      preset: "ties",
      constraint: 3,
    },
    {
      key: "idle",
      name: "idle slots are forced",
      example: "AAAAB with n = 3 → 13",
      why: "There is simply nothing available to run in some slots. Idle time is not inefficiency to be optimised away — a scheduler that refuses to idle cannot honour the cooldown at all.",
      think:
        "What does your loop do when the heap is empty and the queue is not?",
      preset: "idle",
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
        "given: task labels, and a cooldown n",
        "each task takes one unit of time",
        "two runs of the SAME task must be at least n units apart",
        "task: the shortest total time, idling where nothing may run",
      ],
      tools: [
        {
          name: "The task list",
          role: "the row — but only its COUNTS matter. Which order the labels arrive in changes nothing, and noticing that is what shrinks the problem to a handful of numbers.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the schedule's length is set by the most frequent task, not by the total",
        "idle slots are forced by the cooldown, not chosen",
        "every task tied for most frequent needs a slot at the end",
      ],
      quiz: [
        {
          q: "Does the ORDER the tasks are listed in change the answer?",
          choices: [
            "yes — it is a schedule, so order matters",
            "no — only how many times each label appears",
          ],
          answer: 1,
          explain:
            "The output is a schedule, but the input is a bag. That collapse from a list to a few counts is the first real simplification.",
        },
      ],
      run: story,
    },
    {
      key: "formula",
      name: "Lay out the busiest task first",
      short: "one line",
      from: 0,
      insight: "",
      idea: "Place the most frequent task's copies n apart. That makes (peak − 1) blocks of n + 1 slots, plus one final slot per task tied at the peak — and never fewer slots than there are tasks.",
      takeaways: [
        "constant time once the counting is done, which nothing below will beat",
        "the tied-at-the-peak term is the part that is easy to forget",
        "the max against the task count is what handles inputs with enough variety to fill every gap",
        "and it returns a length — nothing about what actually runs when",
      ],
      quiz: [
        {
          q: "Why is the answer taken as the larger of the formula and the number of tasks?",
          choices: [
            "for safety",
            "because the blocks are built from the busiest task alone, and with enough variety the gaps are all filled with real work",
          ],
          answer: 1,
          explain:
            "Without it, the formula can return a number smaller than the number of tasks — an answer that cannot be a schedule.",
        },
      ],
      run: formula,
    },
    {
      key: "heap",
      name: "Run the busiest available task, tick by tick",
      short: "the schedule",
      insight:
        "The formula gives a length in one line and can say nothing about what runs when — and it needs a special case for the tasks tied at the top, which is a sign it is reasoning about a picture rather than a process.",
      idea: problem.approach,
      takeaways: [
        "a heap of remaining counts always offers the task that most needs spreading out",
        "a queue holds cooling tasks stamped with the time they may return",
        "an empty heap with a full queue is an idle slot, and that is a legitimate outcome rather than a failure",
        "it costs a step per unit of time — and it produces the actual schedule, which the formula cannot",
      ],
      quiz: [
        {
          q: "Why run the task with the most copies left, rather than any available one?",
          choices: [
            "it happens to be simpler",
            "because that task is the one that will force idles later if it is postponed",
          ],
          answer: 1,
          explain:
            "Every unit spent on a rarer task is a unit the busiest one still has to wait through. Greedy on the busiest is what keeps the idles to a minimum.",
        },
      ],
      run: heapSim,
    },
  ],
})
