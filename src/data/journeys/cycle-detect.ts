// Detect a Cycle, derived — the first journey to draw a list that LOOPS
// (the `cycleTo` back-edge in engine/shape-views.tsx).
//
// The row is the node values in order; the `cycle` param says which index the
// last node points at, or -1 for a list that ends. That one scalar is the
// whole shape: a learner can point the tail anywhere and watch the runners.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/cycle-detect/index.ts"

type L = Data<number> & { cycle: number }

/** The reference: a list has a cycle exactly when a non-empty one loops back. */
export const loops = (nums: number[], cycle: number) =>
  nums.length > 0 && cycle >= 0 && cycle < nums.length

/** Where index i's next pointer goes, or null for the end of the list. */
const nextOf = (nums: number[], cycle: number, i: number) =>
  i + 1 < nums.length ? i + 1 : cycle >= 0 && cycle < nums.length ? cycle : null

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const view = (
  { nums, cycle }: L,
  label: string,
  marks?: Record<number, ChipRole>,
  labels?: Record<number, string>
) => ({
  values: nums,
  cycleTo: loops(nums, cycle) ? cycle : undefined,
  label,
  marks,
  labels,
})

function* story(d: L): Generator<DFrame> {
  const { nums, cycle } = d
  yield {
    hold: 3,
    noChips: true,
    note: "A singly linked list, and one yes-or-no question: does following next-pointers ever come back to a node it has already stood on?",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Nothing in a node says which one it is. A walk cannot notice that it is repeating itself — which is why the naive loop does not return a wrong answer, it never returns at all.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      answer: false,
      corner: "empty",
      note: "An empty list, which is legal input. There is no node to stand on, so the answer is false — and code that reads head.next before checking for a head crashes here instead of saying so.",
    }
    return
  }
  const has = loops(nums, cycle)
  yield {
    hold: 3,
    list: view(
      d,
      has ? `the tail points back at ${nums[cycle]}` : "the tail points at ∅",
      marksOf(nums.length, (i) =>
        has && i >= cycle ? "answer" : has ? "dim" : undefined
      )
    ),
    answer: has,
    corner:
      nums.length === 1 && has
        ? "self"
        : has && cycle === 0
          ? "whole"
          : has
            ? undefined
            : "none",
    note: has
      ? nums.length === 1
        ? "One node whose next pointer is itself. The smallest cycle there is, and the one that catches a fast runner that steps two without checking the node in between."
        : cycle === 0
          ? "Every node is inside the loop — there is no tail hanging off it. The walk never reaches an end because there is no end to reach."
          : `The last node points back at ${nums[cycle]}, so the walk goes ${nums.slice(0, cycle).join(" → ")} once and then circles ${nums.slice(cycle).join(" → ")} forever.`
      : "This list ends. The walk reaches ∅ and the answer is false — and that ending is the only thing that makes a plain walk safe.",
  }
  yield {
    hold: 3,
    list: view(d, "the question"),
    note: "Two ways to answer it. Write down every node you have visited and look for a repeat — or find something that must happen in a loop and cannot happen in a line.",
  }
}

/** Rung 1 — the visited set: correct, obvious, and O(n) memory. */
function* visitedSet(d: L): Generator<DFrame> {
  const { nums, cycle } = d
  const seen: number[] = []
  let at: number | null = nums.length ? 0 : null
  yield {
    line: 1,
    list: view(d, "seen: —"),
    state: [{ label: "seen", value: 0 }],
    note: "One empty set, and a walk that starts at the head.",
  }
  let steps = 0
  while (at !== null) {
    if (seen.includes(at)) {
      yield {
        line: 3,
        answer: true,
        list: view(
          d,
          `${nums[at]} again`,
          marksOf(nums.length, (i) =>
            i === at ? "answer" : seen.includes(i) ? "dim" : undefined
          ),
          { [at]: "seen before" }
        ),
        state: [{ label: "seen", value: seen.length }],
        corner: nums.length === 1 ? "self" : cycle === 0 ? "whole" : undefined,
        note: `${nums[at]} is already in the set, so the walk has been here before: a cycle. It took ${seen.length} nodes of memory to notice.`,
      }
      return
    }
    seen.push(at)
    steps++
    yield {
      line: 5,
      list: view(
        d,
        `seen ${seen.length}`,
        marksOf(nums.length, (i) =>
          i === at ? "focus" : seen.includes(i) ? "dim" : undefined
        ),
        { [at]: "here" }
      ),
      state: [{ label: "seen", value: seen.length }],
      note: `${nums[at]} is new. Into the set it goes, and the set now holds ${seen.length} of the ${nums.length} nodes.`,
    }
    at = nextOf(nums, cycle, at)
  }
  yield {
    line: 7,
    answer: false,
    list: view(
      d,
      "∅ reached",
      marksOf(nums.length, () => "dim")
    ),
    state: [{ label: "seen", value: seen.length }],
    corner: nums.length ? "none" : "empty",
    note: `The walk ran off the end after ${steps} ${steps === 1 ? "node" : "nodes"}, so there is no cycle. Right answer — paid for with a set as large as the list, on a problem whose stated point is constant space.`,
  }
}

/** Rung 2 — Floyd: two speeds, no memory. */
function* floyd(d: L): Generator<DFrame> {
  const { nums, cycle } = d
  if (!nums.length) {
    yield {
      line: 6,
      answer: false,
      noChips: true,
      corner: "empty",
      note: "No head at all, so the loop condition is false before the first step and the answer is false. No pointer is ever dereferenced.",
    }
    return
  }
  let slow: number | null = 0
  let fast: number | null = 0
  const label = (s: number | null, f: number | null) => {
    const out: Record<number, string> = {}
    if (s !== null) out[s] = s === f ? "slow · fast" : "slow"
    if (f !== null && f !== s) out[f] = "fast"
    return out
  }
  yield {
    line: 1,
    list: view(
      d,
      "both at the head",
      marksOf(nums.length, (i) => (i === 0 ? "focus" : undefined)),
      label(0, 0)
    ),
    note: "Two runners on the same node. One will step once per round, the other twice — and neither writes anything down.",
  }
  let round = 0
  for (;;) {
    const fNext = fast === null ? null : nextOf(nums, cycle, fast)
    if (fast === null || fNext === null) {
      yield {
        line: 6,
        answer: false,
        list: view(
          d,
          "fast ran out of list",
          marksOf(nums.length, (i) =>
            i === slow ? "focus" : i === fast ? "anchor" : "dim"
          ),
          label(slow, fast)
        ),
        state: [{ label: "rounds", value: round }],
        corner: "none",
        note: `Fast reached the end after ${round} ${round === 1 ? "round" : "rounds"}. A line has an end; a loop does not — so falling off it IS the proof there is no cycle. Constant memory, and nothing to clean up.`,
      }
      return
    }
    slow = nextOf(nums, cycle, slow!)
    fast = nextOf(nums, cycle, fNext)
    round++
    if (slow === fast) {
      yield {
        line: 5,
        answer: true,
        list: view(
          d,
          `both on ${nums[slow!]}`,
          marksOf(nums.length, (i) => (i === slow ? "answer" : "dim")),
          label(slow, fast)
        ),
        state: [{ label: "rounds", value: round }],
        corner:
          nums.length === 1 ? "self" : cycle === 0 ? "whole" : "meeting-point",
        note:
          nums.length === 1
            ? `One node pointing at itself: fast steps twice and lands back where it started, on slow. Caught in ${round} ${round === 1 ? "round" : "rounds"} with no set at all.`
            : `They are on the same node after ${round} ${round === 1 ? "round" : "rounds"}. Inside the loop fast gains exactly one node on slow per round, so the gap goes 3, 2, 1, 0 — it cannot jump over. Meeting is not luck; it is arithmetic.`,
      }
      return
    }
    yield {
      line: 4,
      list: view(
        d,
        `round ${round}`,
        marksOf(nums.length, (i) =>
          i === slow ? "focus" : i === fast ? "anchor" : undefined
        ),
        label(slow, fast)
      ),
      state: [
        { label: "slow", value: nums[slow!] },
        { label: "fast", value: nums[fast!] },
      ],
      note: `Slow is on ${nums[slow!]}, fast on ${nums[fast!]}. Nothing is remembered between rounds — the only state is where the two runners stand.`,
    }
  }
}

export const cycleDetect = deriveJourney<number>(problem, {
  slug: "two-runners-one-track",
  subtitle: "a faster runner laps a slower one, and a line has no laps",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer tail into a smaller loop" },
  params: [{ key: "cycle", label: "tail → index (-1 = none)" }],
  classify: (d) => {
    const cycle = (d as L).cycle
    return Number.isInteger(cycle) && cycle >= -1 && cycle < d.nums.length
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the tail points at an index inside the list, or -1 for a list that ends",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 2, 3, 4],
      extra: { cycle: 1 },
      info: "4 points back at 2",
    },
    none: {
      label: "no cycle",
      nums: [1, 2, 3],
      extra: { cycle: -1 },
      info: "the walk reaches ∅",
    },
    empty: {
      label: "an empty list",
      nums: [],
      extra: { cycle: -1 },
      info: "legal input, answer false",
    },
    single: {
      label: "one node, no cycle",
      nums: [7],
      extra: { cycle: -1 },
      info: "fast.next is ∅ at once",
    },
    self: {
      label: "one node pointing at itself",
      nums: [7],
      extra: { cycle: 0 },
      info: "the smallest cycle",
    },
    whole: {
      label: "the whole list is the loop",
      nums: [1, 2, 3, 4],
      extra: { cycle: 0 },
      info: "no tail hangs off it",
    },
    long: {
      label: "a long tail into a small loop",
      nums: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      extra: { cycle: 6 },
      info: "six nodes, then a three-node loop",
    },
  },
  edges: [
    {
      key: "empty",
      name: "an empty list",
      example: "∅ → false",
      why: "There is no node to stand on. A version that reads head.next before testing head crashes on legal input, and a version that starts its runners at the head must survive both being ∅.",
      think: "What does your loop condition do before the first step?",
      preset: "empty",
      constraint: 0,
    },
    {
      key: "self",
      name: "one node pointing at itself",
      example: "a single node whose next is itself → true",
      why: "The shortest possible cycle. Fast moves two, so it must check the node in between before stepping through it — miss that and this input either crashes or is reported as cycle-free.",
      think:
        "Does fast test both nodes it steps over, or only the one it lands on?",
      preset: "self",
      constraint: 2,
    },
    {
      key: "whole",
      name: "every node is inside the loop",
      example: "1 → 2 → 3 → 4 → (back to 1) → true",
      why: "There is no tail leading in, so the runners are inside the cycle from the very first step. Anything that assumes a run-up before the loop is wrong here.",
      think:
        "Does your reasoning depend on there being nodes outside the cycle?",
      preset: "whole",
      constraint: 2,
    },
    {
      key: "none",
      name: "a list that ends",
      example: "1 → 2 → 3 → ∅ → false",
      why: "The false answer is not the absence of an answer: it is fast reaching ∅. That end is the only thing separating a safe walk from an infinite one.",
      think:
        "Which pointer proves there is no cycle — and can the slow one ever prove it?",
      preset: "none",
      constraint: 0,
    },
    {
      key: "meeting-point",
      name: "where they meet is not where the loop starts",
      example:
        "1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → (back to 7): they meet inside the loop, not at 7",
      why: "The collision node is wherever the arithmetic lands, and only says a cycle EXISTS. Reporting it as the entry point answers a different question — that one needs a second walk from the head.",
      think: "Are you asked whether a loop exists, or where it begins?",
      preset: "long",
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
        "given: the head of a singly linked list, possibly empty",
        "each node knows only the node after it",
        "the last node points at ∅ — or back at an earlier node",
        "task: return whether following next ever revisits a node",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "drawn here from the row of values, with a back-edge when the tail loops. A node carries no identity of its own, which is exactly why 'have I been here?' is a hard question to ask.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a cycle is not a wrong answer, it is a walk that never finishes",
        "nodes are anonymous — 'seen before' has to be tracked, or made unnecessary",
        "an ending is what makes a plain walk safe, and a loop has none",
      ],
      quiz: [
        {
          q: "Why can't the walk just notice it is repeating itself?",
          choices: [
            "because the values might repeat too",
            "because a node carries nothing that says which node it is — only where to go next",
          ],
          answer: 1,
          explain:
            "Equal values are a red herring: two different nodes may both hold 7. Identity is the node itself, and the walk is not given it.",
        },
      ],
      run: story,
    },
    {
      key: "set",
      name: "Write down where you have been",
      short: "the honest one",
      from: "set",
      insight: "",
      idea: "Keep a set of the nodes already visited. Walk the list; the first time a node is already in the set, that is the cycle. Reaching ∅ means there was none.",
      takeaways: [
        "correct, and about as simple as this gets",
        "it identifies nodes by identity, not by value — two nodes holding 7 are two nodes",
        "and it holds as many nodes as the list, on a problem that asks for constant space",
      ],
      quiz: [
        {
          q: "Why must the set hold the nodes rather than their values?",
          choices: [
            "values are slower to hash",
            "two different nodes can hold the same value, and a repeated value is not a repeated node",
          ],
          answer: 1,
          explain:
            "1 → 2 → 1 → ∅ has no cycle at all. A set of values calls it one.",
        },
      ],
      run: visitedSet,
    },
    {
      key: "floyd",
      name: "Two speeds, nothing written down",
      short: "constant space",
      insight:
        "The set is linear time and linear memory on a problem whose whole point is constant space — and it is remembering something it never needs to look up, only to test.",
      idea: problem.whyNow!,
      takeaways: [
        "inside a loop fast gains exactly one node per round, so the gap shrinks 3, 2, 1, 0 — they cannot pass each other",
        "on a list that ends, fast falls off it, and that is the whole proof of 'no cycle'",
        "two pointers is the entire memory cost, whatever the list length",
        "meeting proves a cycle EXISTS; where it starts is a second question, and a second walk",
      ],
      quiz: [
        {
          q: "Fast is three nodes behind slow inside the loop. Can it skip past without ever landing on it?",
          choices: [
            "yes, since it moves two at a time it can step over slow",
            "no — it closes the gap by exactly one per round, so the gap passes through 0",
          ],
          answer: 1,
          explain:
            "Fast moves 2 and slow moves 1, so the gap changes by exactly 1 each round. It cannot jump from 1 to −1 without being 0.",
        },
      ],
      run: floyd,
    },
  ],
})
