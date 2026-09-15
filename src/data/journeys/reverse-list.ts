// Reverse a Linked List, derived — the first journey to draw a LIST
// (engine/shape-views.tsx). The row is the node values in order; the view
// draws the links, and the three-pointer act labels them prev / curr / next,
// which is the only way to see what "point backwards" actually does.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/reverse-list/index.ts"

type N = Data<number>

export const reversed = (nums: number[]) => [...nums].reverse()

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A singly linked list: each node knows only the one after it. Turn every link around so the last node becomes the first, and hand back the new head.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "That one-way knowledge is the difficulty. The moment a node points backwards, the rest of the list is unreachable through it — so whatever comes next has to be saved BEFORE the link is changed, not after.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      answer: [],
      corner: "empty",
      note: "An empty list, which is legal input. There is nothing to reverse and nothing to return but the same nothing — and code that reads head.next before checking for it crashes here rather than answering.",
    }
    return
  }
  yield {
    hold: 3,
    list: {
      values: nums,
      label: "as given",
      marks: marksOf(nums.length, (i) => (i === 0 ? "focus" : undefined)),
      labels: { 0: "head" },
    },
    state: [{ label: "becomes", value: reversed(nums).join(" → ") }],
    answer: reversed(nums),
    corner:
      nums.length === 1
        ? "single"
        : nums.some((v) => v < 0)
          ? "negatives"
          : undefined,
    note:
      nums.length === 1
        ? "One node. It is already its own reversal, and it is the case where the loop body never runs — the answer has to come from what the pointers were initialised to, not from anything the loop does."
        : nums.some((v) => v < 0)
          ? `${nums.join(" → ")} becomes ${reversed(nums).join(" → ")}. The values include negatives and it changes nothing: this problem never compares or reads a value, it only rewires links.`
          : `${nums.join(" → ")} becomes ${reversed(nums).join(" → ")}.`,
  }
}

function* copyOut({ nums }: N): Generator<DFrame> {
  const vals: number[] = []
  for (let i = 0; i < nums.length; i++) {
    vals.push(nums[i])
    yield {
      line: 3,
      list: {
        values: nums,
        label: "reading the values out",
        marks: marksOf(nums.length, (k) =>
          k === i ? "focus" : k < i ? "dim" : undefined
        ),
        labels: { [i]: "here" },
      },
      state: [{ label: "collected", value: vals.join(", ") }],
      note: `Read ${nums[i]} and walk on. The original list is untouched so far — this rung never rewires anything, it only copies.`,
    }
  }
  const out: number[] = []
  for (const v of vals) {
    out.unshift(v)
    yield {
      line: 7,
      list: {
        values: [...out],
        label: "building a second list",
        marks: marksOf(out.length, (k) => (k === 0 ? "answer" : undefined)),
        labels: { 0: "new head" },
      },
      state: [{ label: "built", value: out.join(" → ") }],
      note: `A NEW node holding ${v}, put in front of what has been built. Each one allocates.`,
    }
  }
  yield {
    line: 8,
    answer: out,
    list: { values: out, label: "the answer, freshly allocated" },
    state: [{ label: "nodes allocated", value: nums.length }],
    note: `${out.join(" → ")}. Correct, and it built ${nums.length} new node${nums.length === 1 ? "" : "s"} beside the ones it already had. The problem said "in place", so this is the honest baseline rather than an answer.`,
  }
}

function* recurse({ nums }: N): Generator<DFrame> {
  let deepest = 0
  const walk = function* (i: number): Generator<DFrame, number[]> {
    if (i >= nums.length - 1) {
      yield {
        line: 2,
        list: {
          values: nums,
          label: "the base case",
          marks: marksOf(nums.length, (k) => (k === i ? "answer" : "dim")),
          labels: { [i]: "new head" },
        },
        state: [{ label: "frames deep", value: deepest }],
        note: `The last node. It is the new head, and it is the only thing this version knows for certain before the unwinding starts.`,
      }
      return i < nums.length ? [nums[i]] : []
    }
    deepest += 1
    const tail = yield* walk(i + 1)
    tail.push(nums[i])
    yield {
      line: 4,
      list: {
        values: [...tail],
        label: "unwinding",
        marks: marksOf(tail.length, (k) =>
          k === tail.length - 1 ? "focus" : "answer"
        ),
      },
      state: [
        { label: "frames deep", value: deepest },
        { label: "so far", value: tail.join(" → ") },
      ],
      note: `The tail behind ${nums[i]} is already reversed, so hook ${nums[i]} on the end of it and cut its old forward link. Every one of these is a frame that was waiting.`,
    }
    deepest -= 1
    return tail
  }
  const out = yield* walk(0)
  yield {
    line: 6,
    answer: out,
    list: { values: out, label: "reversed" },
    state: [{ label: "nodes", value: nums.length }],
    note: `${out.join(" → ")}, rewiring the nodes that were already there rather than building new ones. The cost is a frame per node: on a list of 5000 this is where it stops returning.`,
  }
}

function* threePointers({ nums }: N): Generator<DFrame> {
  // done[] is the reversed prefix; the rest is still pointing forwards
  const done: number[] = []
  for (let i = 0; i < nums.length; i++) {
    const rest = nums.slice(i)
    yield {
      line: 7,
      list: {
        values: [...[...done].reverse(), ...rest],
        label: "saving what comes next",
        marks: marksOf(done.length + rest.length, (k) =>
          k === done.length ? "focus" : k < done.length ? "answer" : undefined
        ),
        labels: {
          [done.length]: "curr",
          ...(done.length > 0 ? { [done.length - 1]: "prev" } : {}),
          ...(rest.length > 1 ? { [done.length + 1]: "next" } : {}),
        },
      },
      state: [
        { label: "reversed", value: done.length },
        { label: "left", value: rest.length },
      ],
      note:
        rest.length > 1
          ? `Before touching anything, remember that ${nums[i + 1]} comes after ${nums[i]}. Once ${nums[i]} points backwards, that is the only way to reach the rest of the list at all.`
          : `${nums[i]} is the last node, so there is nothing after it to save. It is about to become the head.`,
    }
    done.push(nums[i])
    yield {
      line: 8,
      list: {
        values: [...[...done].reverse(), ...nums.slice(i + 1)],
        label: "pointed backwards",
        marks: marksOf(nums.length, (k) => (k === 0 ? "answer" : undefined)),
        labels: { 0: i === nums.length - 1 ? "new head" : "prev" },
      },
      state: [
        { label: "reversed", value: done.length },
        { label: "left", value: nums.length - done.length },
      ],
      note: `${nums[i]} now points at ${i === 0 ? "nothing — and that nothing is what terminates the reversed list, for free" : nums[i - 1]}. Step both pointers forward and repeat.`,
    }
  }
  const out = [...done].reverse()
  yield {
    line: 10,
    answer: out,
    list: { values: out, label: "reversed in place" },
    state: [{ label: "extra memory", value: "3 pointers" }],
    note: `${out.join(" → ") || "nothing"}. The same rewiring as the recursion, with three pointers instead of a frame per node — and the null that prev started as is what became the tail's new next, which is why no special case is needed to terminate the list.`,
  }
}

export const reverseList = deriveJourney(problem, {
  slug: "turn-the-links-around",
  subtitle: "save what comes next before you overwrite the way there",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  presets: {
    example: { label: "the example", nums: [1, 2, 3] },
    empty: { label: "an empty list", nums: [], info: "legal input" },
    single: { label: "one node", nums: [7], info: "the loop never runs" },
    pair: {
      label: "two nodes",
      nums: [1, 2],
      info: "the smallest real rewiring",
    },
    negatives: {
      label: "negative values",
      nums: [-3, 8, -1, 4],
      info: "values are never read",
    },
    long: { label: "a longer list", nums: [1, 2, 3, 4, 5, 6, 7] },
  },
  edges: [
    {
      key: "empty",
      name: "an empty list",
      example: "nothing → nothing",
      why: "Legal input. Code that reads head.next before checking that head exists crashes here rather than answering, and the loop condition is what has to catch it.",
      think: "What does your first line do when handed nothing?",
      preset: "empty",
      constraint: 2,
    },
    {
      key: "single",
      name: "one node",
      example: "[7] → [7]",
      why: "The loop body runs once and rewires nothing meaningful; the answer comes from what the pointers were initialised to. It is the case that catches a version returning the wrong variable at the end.",
      think:
        "Which pointer do you return — and is it right when nothing moved?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "negatives",
      name: "negative values",
      example: "[-3, 8, -1, 4] → [4, -1, 8, -3]",
      why: "Nothing here reads or compares a value; the whole problem is links. A solution that sorts, or that treats a value as a sentinel, has misread what is being asked.",
      think: "Does your code ever look at what a node holds?",
      preset: "negatives",
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
        "given: the head of a singly linked list",
        "each node knows only the node AFTER it",
        "turn every link around, in place",
        "task: return the new head",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "a chain where each node knows only its successor. There is no way back, which is why anything you overwrite is gone unless it was saved first.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "each node knows only the next one, so a rewired link destroys the only route onward",
        "the values are never read — this is entirely about links",
        "an empty list and a single node are both legal, and both skip the interesting part",
      ],
      quiz: [
        {
          q: "You set a node's next pointer to the node before it. What have you just lost?",
          choices: [
            "nothing, the list is doubly linked",
            "the rest of the list — that pointer was the only way to reach it",
          ],
          answer: 1,
          explain:
            "That is the whole problem in one sentence, and the reason the next node has to be saved before the link is changed.",
        },
      ],
      run: story,
    },
    {
      key: "copy",
      name: "Read the values, build a new list",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the list collecting values, then build a fresh list by putting each value in front of the one before it.",
      takeaways: [
        "obviously correct, and it never has to think about losing its way",
        "it allocates a second list the size of the first",
        "and it gives up the in-place requirement, which is the only thing the problem actually asked for",
      ],
      run: copyOut,
    },
    {
      key: "recurse",
      name: "Reverse the tail, then hook on",
      short: "in place, a frame per node",
      from: 1,
      insight:
        "Building a second list sidesteps the difficulty rather than facing it. The nodes are already there — reverse everything after the current node, then make that node the new tail of it.",
      idea: "Recurse to the end. On the way back, each node hooks itself onto the end of the already-reversed tail and drops its old forward link.",
      takeaways: [
        "it rewires the existing nodes, so it is genuinely in place",
        "the new head comes from the deepest call and is passed back untouched",
        "and it costs a stack frame per node — on 5000 nodes it stops returning",
      ],
      run: recurse,
    },
    {
      key: "three",
      name: "Three pointers, one pass",
      short: "in place, constant space",
      insight:
        "Every waiting frame holds exactly one thing: the node to hook on next. That is a single pointer, not a frame — so carry it, and the one after it, and walk forward once.",
      idea: problem.whyNow!,
      takeaways: [
        "save next, point backwards, step both forward — in that order, and the order is the whole thing",
        "prev starts as nothing, and that nothing becomes the tail's new next, terminating the list for free",
        "return prev, not curr: when the walk ends curr is off the end",
        "three pointers, whatever the length",
      ],
      quiz: [
        {
          q: "Why is the next node saved before the current node's link is changed?",
          choices: [
            "to avoid an extra read",
            "because that link is the only route to the rest of the list, and overwriting it first loses everything after this node",
          ],
          answer: 1,
          explain:
            "Swap those two lines and the list is severed at the first node. It is the single most common way to get this wrong.",
        },
      ],
      run: threePointers,
    },
  ],
})
