// The Middle of a Linked List, derived. The row is the node values; the list
// view draws the links and labels the two runners.
//
// One line decides this problem, and it is the loop condition. Continuing
// while BOTH the fast node and its successor exist lands slow on the second
// middle; stopping a step earlier lands it on the first. The even-length
// preset is where that shows.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/middle-of-list.ts"

type N = Data<number>

/** The reference: the middle node's value, the second one when even. */
export const middleValue = (nums: number[]) => nums[Math.floor(nums.length / 2)]

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const view = (
  nums: number[],
  label: string,
  marks?: Record<number, ChipRole>,
  labels?: Record<number, string>
) => ({ values: nums, label, marks, labels })

function* story({ nums }: N): Generator<DFrame> {
  const mid = Math.floor(nums.length / 2)
  const even = nums.length % 2 === 0
  yield {
    hold: 3,
    noChips: true,
    note: "A singly linked list, and the middle node wanted back. On an even-length list, the SECOND of the two middles — which is a decision the problem makes for you, and one the code has to encode exactly.",
  }
  yield {
    hold: 3,
    list: view(nums, `${nums.length} ${nums.length === 1 ? "node" : "nodes"}`),
    state: [{ label: "length", value: nums.length }],
    note: "A list cannot be indexed. There is no nums[n/2] here — the only way to reach a position is to walk to it, and the length is not known until the walk has finished.",
  }
  yield {
    hold: 3,
    list: view(
      nums,
      `middle: ${nums[mid]}`,
      marksOf(nums.length, (i) => (i === mid ? "answer" : "dim")),
      { [mid]: "middle" }
    ),
    answer: middleValue(nums),
    corner:
      nums.length === 1
        ? "single"
        : even
          ? "even"
          : nums.length === 2
            ? "pair"
            : "odd",
    note:
      nums.length === 1
        ? "One node, and it is its own middle. The smallest legal list, and the case where a loop that insists on stepping at least once overshoots."
        : even
          ? `${nums.length} nodes, so there are two middles — ${nums[mid - 1]} and ${nums[mid]} — and the answer is the second: ${nums[mid]}. Nothing about the geometry chooses between them; the specification does.`
          : `${nums.length} nodes, so the middle is unambiguous: ${nums[mid]}, with ${mid} on each side.`,
  }
}

/** Rung 1 — count, then walk half. */
function* countThenWalk({ nums }: N): Generator<DFrame> {
  let count = 0
  yield {
    line: 1,
    list: view(nums, "counting"),
    state: [{ label: "count", value: 0 }],
    note: "Two passes, and the first one exists only to learn the length. Nothing is decided during it.",
  }
  for (let i = 0; i < nums.length; i++) {
    count++
    yield {
      line: 4,
      list: view(
        nums,
        `count ${count}`,
        marksOf(nums.length, (k) =>
          k === i ? "focus" : k < i ? "dim" : undefined
        ),
        { [i]: "here" }
      ),
      state: [{ label: "count", value: count }],
      note: `${nums[i]} — that is ${count} so far. The walk is going all the way to the end and remembering only how many steps it took.`,
    }
  }
  const target = Math.floor(count / 2)
  yield {
    line: 7,
    list: view(nums, `walk ${target} of ${count}`),
    state: [
      { label: "length", value: count },
      { label: "steps to take", value: target },
    ],
    corner: count % 2 === 0 ? "even" : undefined,
    note: `${count} nodes, so the middle is ${target} steps from the head. Note the floor division: on an even length it lands on the SECOND middle, which is what was asked for — and it is the only place that decision appears in this version.`,
  }
  for (let i = 0; i <= target; i++)
    yield {
      line: 8,
      list: view(
        nums,
        `step ${i}`,
        marksOf(nums.length, (k) =>
          k === i ? "focus" : k < i ? "dim" : undefined
        ),
        { [i]: "here" }
      ),
      state: [{ label: "step", value: `${i} of ${target}` }],
      note:
        i === target
          ? `Arrived at ${nums[i]} — the middle.`
          : `Step ${i}: ${nums[i]}. Everything before the halfway point is being walked for the second time.`,
    }
  yield {
    line: 9,
    answer: middleValue(nums),
    list: view(
      nums,
      `${nums[target]}`,
      marksOf(nums.length, (k) => (k === target ? "answer" : "dim")),
      { [target]: "middle" }
    ),
    state: [
      { label: "answer", value: nums[target] },
      { label: "nodes walked", value: count + target + 1 },
    ],
    corner: nums.length === 1 ? "single" : undefined,
    note: `${nums[target]}, after walking ${count + target + 1} nodes over two passes. Correct — and it cannot start the second pass until the first has finished, which matters when the list arrives one node at a time.`,
  }
}

/** Rung 2 — two runners, one pass. */
function* twoRunners({ nums }: N): Generator<DFrame> {
  let slow = 0
  let fast = 0
  let rounds = 0
  const label = (s: number, f: number) => {
    const out: Record<number, string> = {}
    out[s] = s === f ? "slow · fast" : "slow"
    if (f !== s && f < nums.length) out[f] = "fast"
    return out
  }
  yield {
    line: 1,
    list: view(
      nums,
      "both at the head",
      marksOf(nums.length, (i) => (i === 0 ? "focus" : undefined)),
      label(0, 0)
    ),
    state: [{ label: "round", value: 0 }],
    note: "Two pointers on the same node. One will move a node at a time, the other two — and the distance between them will do the arithmetic.",
  }
  while (fast < nums.length && fast + 1 < nums.length) {
    slow += 1
    fast += 2
    rounds++
    yield {
      line: 4,
      list: view(
        nums,
        `round ${rounds}`,
        marksOf(nums.length, (i) =>
          i === slow ? "focus" : i === fast ? "anchor" : undefined
        ),
        label(slow, fast)
      ),
      state: [
        { label: "slow", value: nums[slow] },
        {
          label: "fast",
          value: fast < nums.length ? nums[fast] : "past the end",
        },
      ],
      note: `Slow is on ${nums[slow]}, fast on ${fast < nums.length ? nums[fast] : "nothing"}. Fast has covered exactly twice the ground — so when it runs out, slow will be exactly halfway, and nobody counted anything.`,
    }
  }
  const answer = middleValue(nums)
  yield {
    line: 6,
    answer,
    list: view(
      nums,
      `${nums[slow]}`,
      marksOf(nums.length, (i) => (i === slow ? "answer" : "dim")),
      { [slow]: "middle" }
    ),
    state: [
      { label: "answer", value: nums[slow] },
      { label: "rounds", value: rounds },
      { label: "nodes walked", value: Math.min(fast, nums.length - 1) + 1 },
    ],
    corner:
      nums.length === 1
        ? "single"
        : nums.length === 2
          ? "pair"
          : nums.length % 2 === 0
            ? "even"
            : "odd",
    note:
      nums.length % 2 === 0
        ? `${nums[slow]} — the SECOND middle, and here is the line that decided it: the loop continues while fast AND fast.next both exist. Drop the second half of that test and slow stops one node earlier, on ${nums[slow - 1]}, which is the other middle and the wrong answer.`
        : `${nums[slow]}, in one pass and two pointers. The halfway point was never computed — it fell out of one runner moving twice as fast as the other.`,
  }
}

export const middleOfList = deriveJourney<number>(problem, {
  slug: "twice-as-fast-is-halfway",
  subtitle: "the loop condition is the answer to which middle",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  classify: (d) =>
    d.nums.length > 0
      ? { ok: true }
      : {
          ok: false,
          warning: "at least one node — the list is never empty here",
        },
  presets: {
    example: {
      label: "the example",
      nums: [1, 2, 3, 4, 5],
      info: "the middle is 3",
    },
    even: {
      label: "an even length",
      nums: [1, 2, 3, 4, 5, 6],
      info: "the SECOND middle, 4",
    },
    single: { label: "one node", nums: [7], info: "its own middle" },
    pair: { label: "two nodes", nums: [1, 2], info: "the answer is 2" },
    long: {
      label: "a longer list",
      nums: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
      info: "eleven nodes",
    },
  },
  edges: [
    {
      key: "even",
      name: "an even number of nodes",
      example: "[1, 2, 3, 4, 5, 6] → 4, not 3",
      why: "There are two middles and the problem picks the second. That choice lives entirely in the loop condition: continuing while fast AND fast.next exist lands on the second, and stopping a step earlier lands on the first. Both look reasonable in the code.",
      think:
        "Which of the two middles does your loop stop on, and did you choose it?",
      preset: "even",
      constraint: 2,
    },
    {
      key: "single",
      name: "a single node",
      example: "[7] → 7",
      why: "The loop never runs, so the answer is the head — which is only right if the pointers start there rather than one step in. A version that steps before testing walks off the end of a one-node list.",
      think: "Does your loop test before its first step or after?",
      preset: "single",
      constraint: 3,
    },
    {
      key: "pair",
      name: "two nodes",
      example: "[1, 2] → 2",
      why: "The smallest even list: one round of the loop, and the answer is the second node. It is where an off-by-one in the loop condition first becomes visible, on an input small enough to check by eye.",
      think: "How many times does your loop run on a two-node list?",
      preset: "pair",
      constraint: 0,
    },
    {
      key: "odd",
      name: "an odd number of nodes",
      example: "[1, 2, 3, 4, 5] → 3",
      why: "Unambiguous — the same count on each side — which is exactly why it does not test the thing that goes wrong. A solution can be right on every odd list and wrong on every even one.",
      think:
        "Which lengths would catch your off-by-one, and which would hide it?",
      preset: "example",
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
        "given: the head of a singly linked list with at least one node",
        "a list cannot be indexed — a position is reached by walking",
        "task: return the middle node",
        "and on an even length, the SECOND of the two middles",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "drawn from the row of values. The only operation is 'go to the next one', which is why the length is unknown until the end and why every approach here is really about how many passes it needs.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a list has no index, so the middle can only be reached by walking",
        "an even length has two middles, and the problem picks the second",
        "that choice ends up living in a loop condition, not in a comment",
      ],
      quiz: [
        {
          q: "The list has six nodes. Which one is the answer?",
          choices: ["the third", "the fourth — the second of the two middles"],
          answer: 1,
          explain:
            "Both are 'a middle'. The specification picks one, and the code has to agree with it exactly.",
        },
      ],
      run: story,
    },
    {
      key: "count",
      name: "Count first, then walk half",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the list once to count the nodes, then walk again and stop at position length / 2.",
      takeaways: [
        "two passes: the first learns nothing but the length",
        "the floor division is where the second-middle rule lives, and it is easy to read",
        "and it cannot begin the second pass until the first has finished",
      ],
      run: countThenWalk,
    },
    {
      key: "runners",
      name: "One pointer twice as fast",
      short: "one pass",
      insight:
        "Counting the nodes and then walking half of them traverses the list twice, and the first traversal produces a single number the second one immediately consumes.",
      idea: problem.whyNow!,
      takeaways: [
        "fast covers twice the ground, so when it runs out slow has covered exactly half",
        "the halfway point is never computed — it falls out of the geometry",
        "one pass, two pointers, nothing stored",
        "and the even-length rule is now the loop condition: fast AND fast.next must exist",
      ],
      quiz: [
        {
          q: "Why does the loop test fast.next as well as fast?",
          choices: [
            "to avoid dereferencing null",
            "both: it keeps fast from stepping off the end, and it is what makes slow stop on the SECOND middle of an even list",
          ],
          answer: 1,
          explain:
            "The safety and the specification are the same line here, which is why changing it for one reason quietly changes the answer for the other.",
        },
      ],
      run: twoRunners,
    },
  ],
})
