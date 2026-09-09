// Remove the Nth Node From the End, derived. The row is the node values, and
// `n` counts from the END — which is the whole difficulty, because a list can
// only be walked from the front.
//
// Two ideas carry it: a gap of exactly n between two pointers converts a
// distance from the end into a distance from the front, and a dummy head makes
// "remove the first node" stop being a special case.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/remove-nth-from-end.ts"

type R = Data<number> & { n: number }

/** The reference: the list with the nth-from-last node gone. */
export const withoutNth = (nums: number[], n: number) => {
  const at = nums.length - n
  return [...nums.slice(0, at), ...nums.slice(at + 1)]
}

const marksOf = (len: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < len; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const view = (
  values: number[],
  label: string,
  marks?: Record<number, ChipRole>,
  labels?: Record<number, string>
) => ({ values, label, marks, labels })

function* story({ nums, n }: R): Generator<DFrame> {
  const at = nums.length - n
  const answer = withoutNth(nums, n)
  yield {
    hold: 3,
    noChips: true,
    note: `A singly linked list, and a node to remove — the ${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} counting from the END. Return the head of what is left.`,
  }
  yield {
    hold: 3,
    list: view(
      nums,
      `${n} from the end`,
      marksOf(nums.length, (i) => (i >= at ? "focus" : undefined)),
      { [at]: "this one" }
    ),
    state: [
      { label: "length", value: nums.length },
      { label: "n", value: n },
    ],
    note: `Counting from the end is the difficulty. The links only go forwards, so "${n} from the last" is not a position anything can walk to — it has to be turned into a distance from the FRONT first, and the length is what does that.`,
  }
  yield {
    hold: 3,
    list: view(
      answer,
      answer.length ? answer.join(" → ") : "the empty list",
      marksOf(answer.length, () => "answer")
    ),
    answer,
    corner:
      at === 0
        ? "head"
        : n === 1
          ? "tail"
          : nums.length === 1
            ? "only"
            : "middle",
    note:
      at === 0
        ? `n is ${n} and the list holds ${nums.length}, so the node to remove is the HEAD. That is the case that breaks code written around "point the node before it somewhere else" — there is no node before it.`
        : n === 1
          ? `n is 1, so the last node goes. The node before it has to point at nothing, which means the walk has to stop ON the node before rather than on the node itself.`
          : `${nums[at]} goes, leaving ${answer.join(" → ")}. Everything before it is untouched and everything after it moves up.`,
  }
}

/** Rung 1 — count the list, then walk forward to the position. */
function* countFirst({ nums, n }: R): Generator<DFrame> {
  let count = 0
  yield {
    line: 1,
    list: view(nums, "counting"),
    state: [{ label: "count", value: 0 }],
    note: "The length converts a distance from the end into a distance from the front. Getting it costs one full pass.",
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
        )
      ),
      state: [{ label: "count", value: count }],
      note: `${nums[i]} — ${count} so far.`,
    }
  }
  const at = count - n
  if (at === 0) {
    yield {
      line: 7,
      answer: withoutNth(nums, n),
      list: view(
        nums.slice(1),
        "the head is gone",
        marksOf(nums.length - 1, () => "answer")
      ),
      state: [
        { label: "length", value: count },
        { label: "position", value: 0 },
      ],
      corner: "head",
      note: `The node to remove is at position 0, so there is nothing before it to rewire — the answer is simply the second node onwards. This version needs an explicit test for that, written before the walk, and forgetting it is the classic crash.`,
    }
    return
  }
  yield {
    line: 9,
    list: view(
      nums,
      `walk to ${at - 1}`,
      marksOf(nums.length, (i) => (i === at ? "focus" : undefined)),
      { [at]: "to remove" }
    ),
    state: [
      { label: "length", value: count },
      { label: "position", value: at },
    ],
    note: `Position ${at} from the front is the node to remove, so the walk stops one earlier, at ${at - 1} — the node whose link has to change.`,
  }
  for (let i = 0; i < at; i++)
    yield {
      line: 10,
      list: view(
        nums,
        `step ${i}`,
        marksOf(nums.length, (k) =>
          k === i ? "focus" : k < i ? "dim" : undefined
        )
      ),
      state: [{ label: "step", value: `${i} of ${at - 1}` }],
      note: `At ${nums[i]}. This is the second pass over ground already walked once.`,
    }
  const answer = withoutNth(nums, n)
  yield {
    line: 11,
    answer,
    list: view(
      answer,
      answer.join(" → ") || "empty",
      marksOf(answer.length, () => "answer")
    ),
    state: [
      { label: "removed", value: nums[at] },
      { label: "nodes walked", value: count + at },
    ],
    corner: n === 1 ? "tail" : "middle",
    note: `${nums[at]} removed, after ${count + at} steps over two passes. Correct — and it needed the whole length before it could take a single useful step.`,
  }
}

/** Rung 2 — a gap of n, and a dummy head. */
function* twoPointers({ nums, n }: R): Generator<DFrame> {
  // index -1 stands for the dummy: a node in front of the head that holds
  // nothing and exists only so something always precedes the node to remove
  let leader = -1
  let follower = -1
  yield {
    line: 1,
    list: view(
      nums,
      "a dummy in front of the head",
      marksOf(nums.length, () => undefined),
      { 0: "head" }
    ),
    state: [{ label: "dummy", value: "→ head" }],
    note: "One node that holds no value, placed before the head. It exists so that the node to remove always has something in front of it — which is what turns 'remove the head' from a special case into an ordinary step.",
  }
  for (let k = 0; k < n; k++) {
    leader += 1
    yield {
      line: 4,
      list: view(
        nums,
        `gap ${k + 1} of ${n}`,
        marksOf(nums.length, (i) => (i === leader ? "anchor" : undefined)),
        { ...(leader >= 0 ? { [leader]: "leader" } : {}) }
      ),
      state: [{ label: "gap", value: k + 1 }],
      note: `The leader moves ahead alone. After ${n} steps the gap between the two pointers is exactly ${n} — and that gap is the whole idea: when the leader reaches the end, the follower is exactly ${n} nodes short of it.`,
    }
  }
  while (leader < nums.length - 1) {
    leader += 1
    follower += 1
    yield {
      line: 6,
      list: view(
        nums,
        "both move",
        marksOf(nums.length, (i) =>
          i === leader ? "anchor" : i === follower ? "focus" : undefined
        ),
        {
          [leader]: "leader",
          ...(follower >= 0 ? { [follower]: "follower" } : {}),
        }
      ),
      state: [
        { label: "leader", value: nums[leader] },
        { label: "follower", value: follower < 0 ? "dummy" : nums[follower] },
      ],
      note: `Both step, so the gap of ${n} is preserved. Nothing is counted; the distance is maintained rather than measured.`,
    }
  }
  const at = follower + 1
  const answer = withoutNth(nums, n)
  yield {
    line: 9,
    list: view(
      nums,
      `${nums[at]} is skipped`,
      marksOf(nums.length, (i) =>
        i === at ? "focus" : i === follower ? "anchor" : undefined
      ),
      {
        [at]: "removed",
        ...(follower >= 0 ? { [follower]: "follower" } : {}),
      }
    ),
    state: [
      { label: "follower", value: follower < 0 ? "the dummy" : nums[follower] },
      { label: "removing", value: nums[at] },
    ],
    corner: at === 0 ? "head" : n === 1 ? "tail" : "middle",
    note:
      at === 0
        ? `The follower never left the dummy, which means the node to remove is the head — and nothing special happens: the dummy's link is repointed exactly like any other node's. That is the entire reason the dummy exists.`
        : `The leader reached the last node, so the follower sits exactly ${n} nodes from the end: on the node BEFORE the one to remove. Its link skips over ${nums[at]}.`,
  }
  yield {
    line: 10,
    answer,
    list: view(
      answer,
      answer.join(" → ") || "the empty list",
      marksOf(answer.length, () => "answer")
    ),
    state: [
      { label: "answer", value: answer.join(" → ") || "empty" },
      { label: "passes", value: 1 },
    ],
    corner: nums.length === 1 ? "only" : undefined,
    note: `${answer.length ? answer.join(" → ") : "The empty list"}. One pass, no length, and the answer is dummy.next rather than the original head — which matters exactly when the head was the node removed.`,
  }
}

export const removeNthFromEnd = deriveJourney<number>(problem, {
  slug: "a-gap-that-measures-the-end",
  subtitle: "hold two pointers n apart, and the end becomes a position",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  params: [{ key: "n", label: "n from the end" }],
  classify: (d) => {
    const n = (d as R).n
    return Number.isInteger(n) && n >= 1 && n <= d.nums.length
      ? { ok: true }
      : {
          ok: false,
          warning:
            "n counts from the end: at least 1, and no more than the number of nodes",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 2, 3, 4, 5],
      extra: { n: 2 },
      info: "4 is removed",
    },
    head: {
      label: "the head goes",
      nums: [1, 2, 3],
      extra: { n: 3 },
      info: "nothing precedes it",
    },
    tail: {
      label: "the last node goes",
      nums: [1, 2, 3],
      extra: { n: 1 },
      info: "the one before must end the list",
    },
    only: {
      label: "a single node",
      nums: [7],
      extra: { n: 1 },
      info: "the list becomes empty",
    },
    pair: {
      label: "two nodes, remove the first",
      nums: [1, 2],
      extra: { n: 2 },
      info: "the smallest head case",
    },
    long: {
      label: "a longer list",
      nums: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      extra: { n: 4 },
      info: "nine nodes",
    },
  },
  edges: [
    {
      key: "head",
      name: "the node to remove is the head",
      example: "[1, 2, 3] with n = 3 → [2, 3]",
      why: "There is no node in front of it to rewire, so any code written around 'point the previous node past this one' has no previous node. A dummy head in front of the list removes the case entirely rather than testing for it.",
      think: "What is in front of the first node in your solution?",
      preset: "head",
      constraint: 3,
    },
    {
      key: "tail",
      name: "the last node goes",
      example: "[1, 2, 3] with n = 1 → [1, 2]",
      why: "The walk has to stop ON the node before the one being removed, not on the node itself — and with n = 1 that is the difference between ending the list correctly and running off it.",
      think:
        "Which node does your pointer end on: the one to remove, or the one before?",
      preset: "tail",
      constraint: 2,
    },
    {
      key: "only",
      name: "a one-node list",
      example: "[7] with n = 1 → the empty list",
      why: "The answer is nothing at all, which is a legal list. Returning the original head here returns a node that was supposed to be gone — and the dummy version gets it right for free, because it returns dummy.next.",
      think:
        "What do you return, the head you were given or the head you now have?",
      preset: "only",
      constraint: 0,
    },
    {
      key: "middle",
      name: "a node in the middle",
      example: "[1, 2, 3, 4, 5] with n = 2 → [1, 2, 3, 5]",
      why: "The ordinary case, and the one where an off-by-one in the gap is invisible in the count but wrong in the answer: a gap of n − 1 or n + 1 removes a neighbour, and the result is still a plausible list.",
      think: "After the leader stops, exactly how far behind is the follower?",
      preset: "example",
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
        "given: a list, and an n counting from the END",
        "the links only go forwards, so the end is not a place you can start",
        "task: remove that node and return the head of what is left",
        "n is at least 1 and never more than the length",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "drawn from the row. To remove a node you must hold the one BEFORE it — which is the reason both the length and the dummy head exist in the versions below.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a distance from the end has to become a distance from the front",
        "removing a node means rewiring the node in front of it",
        "when the node to remove is the head, there is no node in front of it",
      ],
      quiz: [
        {
          q: "To remove a node from a singly linked list, which node do you need to be holding?",
          choices: ["the node itself", "the one before it"],
          answer: 1,
          explain:
            "You cannot unlink a node you are standing on — its predecessor is what points at it. That single fact is why the head is a special case, and why a dummy fixes it.",
        },
      ],
      run: story,
    },
    {
      key: "count",
      name: "Count, then walk forward",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk once to count the nodes. The nth from the end is at position length − n from the front, so walk again and stop one node earlier.",
      takeaways: [
        "the length is what converts a distance from the end into one from the front",
        "two passes, and the second cannot begin until the first has finished",
        "and the head case needs an explicit test of its own, written before the walk",
      ],
      quiz: [
        {
          q: "Why does this version need a special case for removing the head?",
          choices: [
            "because the head has no value",
            "because the walk stops one node before the target, and there is no node before the head",
          ],
          answer: 1,
          explain:
            "Every removal rewires a predecessor. The head has none, so it is either tested for or given one — and the next rung gives it one.",
        },
      ],
      run: countFirst,
    },
    {
      key: "gap",
      name: "Two pointers, n apart",
      short: "one pass",
      insight:
        "Counting the list produces a single number that is then used to walk part of it again — and the distance from the end can be held directly instead of measured.",
      idea: problem.approach,
      takeaways: [
        "move the leader n ahead, then move both: the gap of n is maintained, never recomputed",
        "when the leader reaches the last node, the follower is on the node BEFORE the one to remove",
        "a dummy head in front of the list means the follower always has somewhere to stand, even when the head is what goes",
        "and the answer is dummy.next, which is why removing the head needs no special case at all",
      ],
      quiz: [
        {
          q: "What is the dummy node actually for here?",
          choices: [
            "to hold the length",
            "to be the predecessor the head does not otherwise have, so removing the head is an ordinary rewire",
          ],
          answer: 1,
          explain:
            "It is a placeholder for a pointer, not for a value — the same trick that removes the first-node case from merging two lists.",
        },
      ],
      run: twoPointers,
    },
  ],
})
