// Course Order, derived. The edges arrive as flat pairs — course, prerequisite,
// course, prerequisite — and `courses` says how many nodes exist, because a
// course with no edges at all is still a course that has to be scheduled.
//
// The stage is the IN-DEGREE TABLE: one column per course, its unmet
// prerequisite count underneath. That table is the algorithm's whole state, and
// watching it drain to zero is watching Kahn's algorithm work.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/course-order.ts"

type C = Data<number> & { courses: number }

/** Flat pairs → [course, prerequisite] edges. */
export const edgesOf = (nums: number[]) => {
  const out: [number, number][] = []
  for (let i = 0; i + 1 < nums.length; i += 2) out.push([nums[i], nums[i + 1]])
  return out
}

/** The reference: a valid order, or [] when a cycle makes one impossible. */
export function courseOrder(nums: number[], courses: number) {
  const after: number[][] = Array.from({ length: courses }, () => [])
  const indeg = Array.from({ length: courses }, () => 0)
  for (const [a, b] of edgesOf(nums)) {
    after[b].push(a)
    indeg[a]++
  }
  const queue: number[] = []
  for (let c = 0; c < courses; c++) if (indeg[c] === 0) queue.push(c)
  const order: number[] = []
  while (queue.length) {
    const c = queue.shift()!
    order.push(c)
    for (const nxt of after[c]) if (--indeg[nxt] === 0) queue.push(nxt)
  }
  return order.length === courses ? order : []
}

/** The in-degree table, drawn as a two-row grid: course, then count. */
const table = (
  indeg: number[],
  label: string,
  mark?: (c: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  indeg.forEach((_, c) => {
    const m = mark?.(c)
    if (m) marks[`1,${c}`] = m
  })
  return {
    cells: [indeg.map((_, c) => c), indeg.map((v) => v)] as (
      number | string
    )[][],
    marks,
    label,
  }
}

const build = (nums: number[], courses: number) => {
  const after: number[][] = Array.from({ length: courses }, () => [])
  const indeg = Array.from({ length: courses }, () => 0)
  for (const [a, b] of edgesOf(nums)) {
    after[b].push(a)
    indeg[a]++
  }
  return { after, indeg }
}

function* story({ nums, courses }: C): Generator<DFrame> {
  const edges = edgesOf(nums)
  const { indeg } = build(nums, courses)
  const order = courseOrder(nums, courses)
  const free = indeg.filter((v) => v === 0).length
  yield {
    hold: 3,
    noChips: true,
    note: `${courses} courses and ${edges.length} ${edges.length === 1 ? "rule" : "rules"} of the form "this one first". Return an order you could actually take them in — or say that no such order exists.`,
  }
  yield {
    hold: 3,
    grid: table(indeg, "unmet prerequisites", (c) =>
      indeg[c] === 0 ? "answer" : "focus"
    ),
    state: [
      {
        label: "edges",
        value: edges.map(([a, b]) => `${b}→${a}`).join(" ") || "none",
      },
      { label: "can start now", value: free },
    ],
    note: `Under each course is the number of prerequisites it is still waiting on. The ${free} at zero ${free === 1 ? "is" : "are"} available immediately — and everything else in this problem follows from what happens to those counts when a course is taken.`,
  }
  yield {
    hold: 3,
    grid: table(
      indeg,
      order.length ? order.join(" → ") : "no valid order",
      (c) => (order.length ? "answer" : indeg[c] > 0 ? "focus" : "dim")
    ),
    state: [{ label: "answer", value: order.length ? order.join(", ") : "[]" }],
    answer: order,
    corner: !order.length
      ? "cycle"
      : edges.length === 0
        ? "noedges"
        : free > 1
          ? "many"
          : "chain",
    note: !order.length
      ? "No order exists: somewhere a course is its own distant prerequisite. A cycle is not an error to be reported — it is one of the two legal answers, and the code has to be able to tell it apart from 'not finished yet'."
      : edges.length === 0
        ? `No rules at all, so any order works — here, ${order.join(", ")}. Note that every course still has to appear: a course nothing mentions is easy to lose if the order is built only from the edge list.`
        : free > 1
          ? `${order.join(" → ")} is one valid order, and it is not the only one: ${free} courses were available at the start, so any of them could have gone first. The problem asks for A valid order, not THE order.`
          : `${order.join(" → ")}. Each course waits only for the ones it actually depends on, directly or indirectly.`,
  }
}

/** Rung 1 — depth-first, post-order, with a three-colour cycle check. */
function* dfsColours({ nums, courses }: C): Generator<DFrame> {
  const { after } = build(nums, courses)
  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const colour = Array.from({ length: courses }, () => WHITE)
  const post: number[] = []
  let cycle = false
  yield {
    line: 5,
    grid: table(colour, "white = untouched", () => undefined),
    state: [{ label: "finished", value: 0 }],
    note: "Three colours: white for untouched, grey for 'on the current path', black for finished. The grey is the only reason this works — it is what a cycle collides with.",
  }
  function* dfs(c: number): Generator<DFrame, boolean> {
    colour[c] = GRAY
    yield {
      line: 9,
      grid: table(colour, `course ${c} is on the path`, (k) =>
        k === c
          ? "focus"
          : colour[k] === GRAY
            ? "anchor"
            : colour[k] === BLACK
              ? "dim"
              : undefined
      ),
      state: [
        {
          label: "on the path",
          value: colour.filter((v) => v === GRAY).length,
        },
      ],
      note: `Course ${c} goes grey: it is on the path being explored right now. If the walk arrives back at a grey course, that path leads into itself.`,
    }
    for (const nxt of after[c]) {
      if (colour[nxt] === GRAY) {
        cycle = true
        yield {
          line: 12,
          answer: [],
          grid: table(colour, `back to ${nxt}, which is grey`, (k) =>
            k === nxt ? "focus" : colour[k] === GRAY ? "anchor" : undefined
          ),
          state: [{ label: "verdict", value: "cycle" }],
          corner: "cycle",
          note: `Course ${nxt} is already grey, so following the prerequisites has arrived back on the current path: a cycle. No order exists, and the answer is the empty list.`,
        }
        return false
      }
      if (colour[nxt] === WHITE && !(yield* dfs(nxt))) return false
    }
    colour[c] = BLACK
    post.push(c)
    yield {
      line: 16,
      grid: table(colour, `${c} finished`, (k) =>
        k === c ? "answer" : colour[k] === BLACK ? "dim" : undefined
      ),
      state: [{ label: "post-order", value: post.join(", ") }],
      note: `Everything course ${c} unlocks has been dealt with, so ${c} turns black and is appended. It is appended AFTER its dependents, which is why this list comes out backwards and has to be reversed at the end.`,
    }
    return true
  }
  for (let c = 0; c < courses && !cycle; c++)
    if (colour[c] === WHITE) yield* dfs(c)
  const order = courseOrder(nums, courses)
  if (cycle) return
  yield {
    line: 22,
    answer: order,
    grid: table(colour, order.join(" → "), () => "answer"),
    state: [
      { label: "post-order", value: post.join(", ") },
      { label: "reversed", value: [...post].reverse().join(", ") },
    ],
    corner: edgesOf(nums).length === 0 ? "noedges" : undefined,
    note: `Reversing gives a valid order. Correct — and note the two awkward parts: the answer arrives backwards, and detecting the cycle needed a colour that means "on the current path", which is not something the problem ever mentions.`,
  }
}

/** Rung 2 — Kahn's queue: take what is available, free its dependents. */
function* kahn({ nums, courses }: C): Generator<DFrame> {
  const { after, indeg } = build(nums, courses)
  const queue: number[] = []
  for (let c = 0; c < courses; c++) if (indeg[c] === 0) queue.push(c)
  const order: number[] = []
  yield {
    line: 8,
    grid: table(indeg, "everything at zero can start", (c) =>
      indeg[c] === 0 ? "answer" : "focus"
    ),
    state: [
      { label: "queue", value: queue.join(", ") || "empty" },
      { label: "order", value: "—" },
    ],
    corner:
      queue.length > 1 ? "many" : queue.length === 0 ? "cycle" : undefined,
    note: queue.length
      ? `The queue starts with every course that has no unmet prerequisite: ${queue.join(", ")}. Nothing has to be chosen carefully — any of them is a legal first course.`
      : "Nothing has an in-degree of zero, so there is no course that could be taken first. That alone means a cycle, before a single step is taken.",
  }
  while (queue.length) {
    const c = queue.shift()!
    order.push(c)
    const freed: number[] = []
    for (const nxt of after[c]) {
      indeg[nxt]--
      if (indeg[nxt] === 0) {
        queue.push(nxt)
        freed.push(nxt)
      }
    }
    yield {
      line: 14,
      grid: table(indeg, `took ${c}`, (k) =>
        k === c
          ? "dim"
          : freed.includes(k)
            ? "answer"
            : indeg[k] === 0
              ? "anchor"
              : "focus"
      ),
      state: [
        { label: "order", value: order.join(" → ") },
        { label: "queue", value: queue.join(", ") || "empty" },
      ],
      note: freed.length
        ? `Taking ${c} drops the counts of everything that depended on it, and ${freed.join(", ")} ${freed.length === 1 ? "reaches" : "reach"} zero — newly available, straight into the queue. The order is being built FORWARDS, so no reversal is coming.`
        : `${c} is taken. Nothing reached zero this time: its dependents are still waiting on other prerequisites.`,
    }
  }
  const answer = courseOrder(nums, courses)
  yield {
    line: 17,
    answer,
    grid: table(indeg, answer.length ? answer.join(" → ") : "stuck", (c) =>
      indeg[c] > 0 ? "focus" : "answer"
    ),
    state: [
      { label: "placed", value: `${order.length} of ${courses}` },
      { label: "answer", value: answer.length ? answer.join(", ") : "[]" },
    ],
    corner: answer.length
      ? edgesOf(nums).length === 0
        ? "noedges"
        : undefined
      : "cycle",
    note: answer.length
      ? `All ${courses} courses placed, in order, first try: ${answer.join(" → ")}. No reversal, no extra colour — the queue holds exactly what is available, and "available" is the only concept in play.`
      : `Only ${order.length} of ${courses} courses could ever be placed, so the rest are waiting on each other: a cycle. Notice how it was detected — by COUNTING what was placed, not by a special marker. The courses still showing a non-zero count are the ones inside it.`,
  }
}

export const courseOrderJourney = deriveJourney<number>(problem, {
  slug: "take-what-is-available",
  subtitle:
    "count what is still waiting, and a cycle is what never reaches zero",
  reveals: ["graphs"],
  defaultPreset: "example",
  harder: { preset: "long", label: "more courses" },
  params: [{ key: "courses", label: "courses" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const courses = (d as C).courses
    if (!Number.isInteger(courses) || courses < 1)
      return { ok: false, warning: "at least one course" }
    if (nums.length % 2 !== 0)
      return {
        ok: false,
        warning: "pairs: course, prerequisite, course, prerequisite …",
      }
    return nums.every((v) => Number.isInteger(v) && v >= 0 && v < courses)
      ? { ok: true }
      : { ok: false, warning: `course numbers run from 0 to ${courses - 1}` }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 0, 2, 0, 3, 1, 3, 2],
      extra: { courses: 4 },
      info: "0 unlocks 1 and 2",
    },
    cycle: {
      label: "a cycle",
      nums: [0, 1, 1, 0],
      extra: { courses: 2 },
      info: "each needs the other",
    },
    noedges: {
      label: "no prerequisites at all",
      nums: [],
      extra: { courses: 3 },
      info: "any order works",
    },
    chain: {
      label: "a straight chain",
      nums: [1, 0, 2, 1, 3, 2],
      extra: { courses: 4 },
      info: "only one valid order",
    },
    many: {
      label: "several available at once",
      nums: [3, 0, 3, 1, 3, 2],
      extra: { courses: 4 },
      info: "three could go first",
    },
    island: {
      label: "a cycle beside a valid part",
      nums: [1, 0, 3, 2, 2, 3],
      extra: { courses: 4 },
      info: "partly schedulable, so still []",
    },
    long: {
      label: "more courses",
      nums: [1, 0, 2, 0, 3, 1, 4, 2, 5, 3, 5, 4, 6, 5],
      extra: { courses: 7 },
      info: "seven courses",
    },
  },
  edges: [
    {
      key: "cycle",
      name: "a cycle, so no order exists",
      example: "0 needs 1 and 1 needs 0 → []",
      why: "The empty list is an answer, not a failure. It has to be distinguishable from 'not finished yet', which is why counting how many courses were placed beats waiting for the queue to run dry.",
      think: "How does your code tell 'stuck' apart from 'done'?",
      preset: "cycle",
      constraint: 3,
    },
    {
      key: "noedges",
      name: "a course nothing mentions",
      example: "three courses and no rules → any order, all three in it",
      why: "Every course must appear in the answer, including ones absent from the edge list. Building the graph from the edges alone silently drops them, and the result is a short order that looks valid.",
      think: "Where does your course list come from — the count, or the edges?",
      preset: "noedges",
      constraint: 1,
    },
    {
      key: "many",
      name: "several courses available at once",
      example:
        "three courses all feeding into one → any of the three may go first",
      why: "The answer is not unique, and nothing has to choose carefully between the available ones. Code written as though there is one right answer tends to invent an ordering rule the problem never asked for.",
      think:
        "Does your solution depend on WHICH available course it takes first?",
      preset: "many",
      constraint: 2,
    },
    {
      key: "chain",
      name: "a straight chain",
      example: "0 → 1 → 2 → 3 → exactly one valid order",
      why: "The opposite extreme: the queue never holds more than one course. Useful for seeing that the queue's size is about how much freedom there is, not about progress.",
      think: "What does a queue of size one tell you about the answer?",
      preset: "chain",
      constraint: 0,
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
        "given: a number of courses, and rules [course, prerequisite]",
        "a course may be taken once all its prerequisites are taken",
        "task: return an order in which all of them can be taken",
        "or an empty list if no such order exists",
      ],
      tools: [
        {
          name: "In-degree table",
          role: "one column per course with the number of prerequisites it is still waiting on. This table is the state every approach here maintains, in one form or another.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a course with nothing unmet can be taken right now, and any such course will do",
        "every course must appear in the answer, even one no rule mentions",
        "a cycle is a legal outcome, and the answer for it is the empty list",
      ],
      quiz: [
        {
          q: "Three courses have no prerequisites. Which one should be taken first?",
          choices: [
            "the one with the most dependents",
            "any of them — they are all legal, and the problem asks for a valid order, not the best one",
          ],
          answer: 1,
          explain:
            "Nothing distinguishes them. Inventing a rule to choose is extra work that answers a question nobody asked.",
        },
      ],
      run: story,
    },
    {
      key: "dfs",
      name: "Go deep, and record on the way out",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk each course depth-first. Colour it grey on the way in and black on the way out, appending it when it finishes. Meeting a grey course means the path leads back into itself.",
      takeaways: [
        "a course appended after all its dependents is a valid order — reversed",
        "the cycle check needs a third colour meaning 'on the current path', which the problem never mentions",
        "so the answer arrives backwards, and the failure case arrives through a trick",
      ],
      quiz: [
        {
          q: "Why is a THIRD colour needed, rather than just visited and unvisited?",
          choices: [
            "for speed",
            "because meeting a finished course is fine, while meeting one on the current path is a cycle — those two need telling apart",
          ],
          answer: 1,
          explain:
            "A diamond-shaped dependency reaches the same finished course twice and is perfectly valid. Only a course still on the stack is a cycle.",
        },
      ],
      run: dfsColours,
    },
    {
      key: "kahn",
      name: "Whatever is available, take it",
      short: "count down",
      insight:
        "The post-order walk produces a valid schedule but hands it back reversed, and it only reveals a cycle through a colour that means 'still on the stack'.",
      idea: problem.approach,
      takeaways: [
        "the queue holds exactly the courses available now, which is the only idea in play",
        "taking a course decrements its dependents; a count reaching zero is a course becoming available",
        "the order is built forwards, so nothing is reversed at the end",
        "and a cycle is detected by counting what was placed — no marker, no third colour",
      ],
      quiz: [
        {
          q: "How does this version know a cycle exists?",
          choices: [
            "it marks courses it has seen before",
            "fewer courses came out than went in — anything still waiting is waiting on something inside the cycle",
          ],
          answer: 1,
          explain:
            "The count is the whole test. Courses left with a non-zero in-degree at the end are exactly the ones caught in it.",
        },
      ],
      run: kahn,
    },
  ],
})
