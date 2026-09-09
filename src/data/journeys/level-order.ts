// Level Order Traversal, derived. The tree arrives as level-order slots
// (./tree-slots.ts), which is a happy accident worth naming out loud: the
// INPUT notation is already grouped by level, and the algorithm's whole job is
// to rediscover that grouping from nothing but parent → child links.
//
// The ladder here does not climb in cost — both rungs are O(n). It climbs in
// honesty: one produces the right grouping as a by-product of pre-order, the
// other produces it because a round of the loop IS a level.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import { problem } from "../problems/trees/level-order.ts"
import {
  GAP,
  asSlots,
  levelsOf,
  marksOf,
  present,
  wellFormed,
} from "./tree-slots.ts"

type T = Data<string>

/** The reference: node values grouped by depth, left to right within a level. */
export const levelValues = (nums: string[]) =>
  levelsOf(nums).map((row) => row.map((i) => Number(nums[i])))

const show = (levels: number[][]) =>
  levels.length ? levels.map((l) => `[${l.join(", ")}]`).join(" ") : "[]"

function* story({ nums }: T): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A binary tree, and an answer that is not one number but a shape: the values grouped by depth, top row first, left to right inside each row.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The difficulty is that a node knows its children and nothing else. Nothing in the tree says 'we are the same level' — that grouping has to be reconstructed from links that only ever point downward.",
  }
  if (!present(nums, 0)) {
    yield {
      hold: 3,
      answer: [],
      corner: "empty",
      note: "No tree at all. The answer is the empty list — not a list holding an empty level, which is the off-by-one that a careless loop produces here.",
    }
    return
  }
  const levels = levelValues(nums)
  const widest = Math.max(...levels.map((l) => l.length))
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: `${levels.length} ${levels.length === 1 ? "level" : "levels"}`,
      marks: marksOf(nums.length, (i) =>
        levelsOf(nums)[0].includes(i) ? "answer" : undefined
      ),
    },
    note: `This tree is ${levels.length} ${levels.length === 1 ? "level" : "levels"} deep and its widest level holds ${widest}. The top row is highlighted — that is the first list in the answer, and it is the only one the input hands you for free.`,
  }
  yield {
    hold: 3,
    answer: levels,
    tree: {
      slots: asSlots(nums),
      label: show(levels),
      marks: marksOf(nums.length, () => "answer"),
    },
    corner:
      levels.length === 1
        ? "single"
        : widest === 1
          ? "skewed"
          : nums.some((v) => v !== GAP && Number(v) < 0)
            ? "negatives"
            : "order",
    note:
      levels.length === 1
        ? "One level, so one list inside the answer. The outer list is never dropped, even when there is only one thing in it."
        : widest === 1
          ? `Every level holds exactly one node, so the answer is ${levels.length} lists of one. A chain is still a tree, and grouping by level is still the job.`
          : nums.some((v) => v !== GAP && Number(v) < 0)
            ? `${show(levels)} — negative values group exactly like any others. Depth decides membership; the value in the node never does.`
            : `${show(levels)}. Note what is being asked for: not the values in some order, but the values in groups. Getting the ORDER right and the GROUPING wrong is the common near-miss.`,
  }
}

/** Rung 1 — DFS carrying a depth: right answer, for a reason easy to mistrust. */
function* dfsDepth({ nums }: T): Generator<DFrame> {
  const out: number[][] = []
  const seen: number[] = []
  yield {
    line: 1,
    tree: { slots: asSlots(nums), label: "out: []" },
    note: "One list of lists, empty. The walk will go all the way down one branch before it looks at the next — nothing about it is level by level.",
  }
  function* walk(i: number, depth: number): Generator<DFrame> {
    if (!present(nums, i)) return
    if (depth === out.length) {
      out.push([])
      yield {
        line: 5,
        tree: {
          slots: asSlots(nums),
          label: `a new row for depth ${depth}`,
          marks: marksOf(nums.length, (k) =>
            k === i ? "focus" : seen.includes(k) ? "dim" : undefined
          ),
          labels: { [i]: `depth ${depth}` },
        },
        state: [{ label: "out", value: show(out) }],
        note: `Depth ${depth} has never been reached before, so a row is opened for it. The row is created by the first node to arrive at that depth — which is the leftmost one, because the walk always tries left first.`,
      }
    }
    out[depth].push(Number(nums[i]))
    seen.push(i)
    yield {
      line: 6,
      tree: {
        slots: asSlots(nums),
        label: show(out),
        marks: marksOf(nums.length, (k) =>
          k === i ? "answer" : seen.includes(k) ? "dim" : undefined
        ),
        labels: { [i]: `→ row ${depth}` },
      },
      state: [
        { label: "depth", value: depth },
        { label: "out", value: show(out) },
      ],
      note: `${nums[i]} is appended to row ${depth}. The value is filed by the depth it was reached at, not by when it was visited — the recursion has no idea it is building levels.`,
    }
    yield* walk(2 * i + 1, depth + 1)
    yield* walk(2 * i + 2, depth + 1)
  }
  yield* walk(0, 0)
  const levels = levelValues(nums)
  yield {
    line: 8,
    answer: levels,
    tree: {
      slots: asSlots(nums),
      label: show(out),
      marks: marksOf(nums.length, () => "answer"),
    },
    state: [{ label: "out", value: show(out) }],
    corner: present(nums, 0) ? "order" : "empty",
    note: `${show(out)} — correct. But look at why: within a level the order is right only because pre-order always descends left before right, so the leftmost node at any depth is always reached first. The answer is a by-product of the walk's shape, not something the code ever states.`,
  }
}

/** Rung 2 — BFS with a length snapshot: one round of the loop is one level. */
function* bfs({ nums }: T): Generator<DFrame> {
  if (!present(nums, 0)) {
    yield {
      line: 3,
      answer: [],
      noChips: true,
      corner: "empty",
      note: "No root, so the answer is the empty list before the queue is ever built. The early return is not defensive clutter — without it the loop would append one empty level.",
    }
    return
  }
  const out: number[][] = []
  let queue = [0]
  const done: number[] = []
  yield {
    line: 5,
    tree: {
      slots: asSlots(nums),
      label: "queue: the root",
      marks: marksOf(nums.length, (i) => (i === 0 ? "focus" : undefined)),
    },
    state: [{ label: "queue", value: nums[0] }],
    note: "The queue starts holding one node. What is in the queue at the top of a round is always exactly one level — that invariant is the whole algorithm, and it is true here for free.",
  }
  let round = 0
  while (queue.length) {
    const k = queue.length
    round++
    yield {
      line: 8,
      tree: {
        slots: asSlots(nums),
        label: `k = ${k}`,
        marks: marksOf(nums.length, (i) =>
          queue.includes(i) ? "focus" : done.includes(i) ? "dim" : undefined
        ),
      },
      state: [
        { label: "round", value: round },
        { label: "k", value: k },
      ],
      note: `Snapshot the length first: ${k}. Children pushed during this round land BEHIND those ${k}, so popping exactly ${k} takes this level and not one node of the next. Read len(queue) inside the loop instead and the levels smear into each other.`,
    }
    const level: number[] = []
    const next: number[] = []
    for (const i of queue) {
      level.push(Number(nums[i]))
      done.push(i)
      for (const c of [2 * i + 1, 2 * i + 2]) if (present(nums, c)) next.push(c)
    }
    out.push(level)
    yield {
      line: 15,
      tree: {
        slots: asSlots(nums),
        label: show(out),
        marks: marksOf(nums.length, (i) =>
          queue.includes(i)
            ? "answer"
            : next.includes(i)
              ? "focus"
              : done.includes(i)
                ? "dim"
                : undefined
        ),
      },
      state: [
        { label: "level", value: `[${level.join(", ")}]` },
        {
          label: "queue",
          value: next.length ? next.map((i) => nums[i]).join(", ") : "empty",
        },
      ],
      corner:
        round === 1 && queue.length === 1 && !next.length
          ? "single"
          : undefined,
      note: `Those ${k} popped are one whole row: [${level.join(", ")}]. Their children — ${next.length ? next.map((i) => nums[i]).join(", ") : "none"} — are now the queue, and so are now the next level. Nobody had to compute a depth.`,
    }
    queue = next
  }
  const levels = levelValues(nums)
  const widest = Math.max(...levels.map((l) => l.length))
  yield {
    line: 16,
    answer: levels,
    tree: {
      slots: asSlots(nums),
      label: show(out),
      marks: marksOf(nums.length, () => "answer"),
    },
    state: [
      { label: "levels", value: out.length },
      { label: "widest", value: widest },
    ],
    corner:
      widest === 1
        ? "skewed"
        : nums.some((v) => v !== GAP && Number(v) < 0)
          ? "negatives"
          : "order",
    note: `${show(out)} in ${round} ${round === 1 ? "round" : "rounds"} — one round per level, by construction rather than by accident. The memory held is the widest level, ${widest} here; on a full tree that is half the nodes, which is the price of asking for rows instead of a path.`,
  }
}

export const levelOrder = deriveJourney<string>(problem, {
  slug: "one-row-at-a-time",
  subtitle: "count the queue before you drain it, and a round becomes a level",
  reveals: ["trees"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a wider tree" },
  classify: (d) =>
    wellFormed(d.nums as string[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "level order, one token per slot, '.' for an absent node — and a node may not hang off an absent parent",
        },
  presets: {
    example: {
      label: "the example",
      nums: ["3", "9", "20", ".", ".", "15", "7"],
      info: "[[3], [9, 20], [15, 7]]",
    },
    empty: { label: "no tree at all", nums: ["."], info: "the answer is []" },
    single: { label: "one node", nums: ["5"], info: "one level, still nested" },
    skewed: {
      label: "a chain, not a tree",
      nums: ["1", "2", ".", "3", ".", ".", ".", "4"],
      info: "every level holds one node",
    },
    negatives: {
      label: "negative values",
      nums: ["-5", "-9", "-2", ".", ".", "-8", "."],
      info: "depth decides, not value",
    },
    lopsided: {
      label: "a level with a hole in it",
      nums: ["1", "2", "3", ".", "4", ".", "5"],
      info: "absent nodes are not blanks in the row",
    },
    long: {
      label: "a wider tree",
      nums: [
        "8",
        "4",
        "12",
        "2",
        "6",
        "10",
        "14",
        "1",
        "3",
        "5",
        "7",
        "9",
        "11",
        "13",
        "15",
      ],
      info: "four levels, widest is 8",
    },
  },
  edges: [
    {
      key: "empty",
      name: "no tree at all",
      example: "an empty tree → []",
      why: "The answer is a list of levels, and there are none — so [] rather than [[]]. A loop that appends a row before checking the queue produces the second, which is a different answer with the same shape.",
      think:
        "Does your first row get created before you know there is a node in it?",
      preset: "empty",
      constraint: 0,
    },
    {
      key: "single",
      name: "one node",
      example: "[5] → [[5]]",
      why: "The nesting survives even when there is only one value. Returning [5] passes a careless eye and fails the contract: the answer is a list of levels, always.",
      think:
        "Is your return type the same on the smallest input as on the largest?",
      preset: "single",
      constraint: 2,
    },
    {
      key: "skewed",
      name: "a chain rather than a tree",
      example: "each node with one child → one node per level",
      why: "Every level holds a single node, so the queue never holds more than one and the recursion goes as deep as the node count. The two versions fail in opposite directions on this shape.",
      think:
        "Which of your two costs — depth of stack, width of queue — does this input punish?",
      preset: "skewed",
      constraint: 0,
    },
    {
      key: "negatives",
      name: "negative node values",
      example: "[-5, -9, -2, ., ., -8, .] → [[-5], [-9, -2], [-8]]",
      why: "Grouping is by depth alone. Any version that uses a value as a sentinel — for an absent node, or for an unset row — is answering a different question the moment a real node holds that value.",
      think: "Does any number in your code do double duty as a marker?",
      preset: "negatives",
      constraint: 1,
    },
    {
      key: "order",
      name: "left to right inside a level",
      example: "[1, 2, 3, ., 4, ., 5] → [[1], [2, 3], [4, 5]]",
      why: "Membership is by depth, but ORDER inside a row is by position, and a level with a hole in it is where the two come apart: 4 and 5 are on the same row with different parents, and an absent sibling must not leave a gap in the answer.",
      think:
        "Does an absent node change the ROW its cousins land in, or only their neighbours?",
      preset: "lopsided",
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
        "given: a binary tree, possibly empty",
        "every node sits at a depth: the root at 0, its children at 1",
        "task: return the values grouped by depth, top down",
        "and left to right within each group",
      ],
      tools: [
        {
          name: "Binary tree",
          role: "drawn here from level order — the node at i has children 2i+1 and 2i+2, and '.' is an absent node. The notation groups by level already; the algorithm has to rebuild that grouping from links that only point down.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is a shape, not a sequence — grouping is the job, not the order",
        "a node knows its children and not its siblings, so 'same level' has to be reconstructed",
        "an empty tree answers with no rows at all, not with one empty row",
      ],
      quiz: [
        {
          q: "What does a node know about the other nodes on its own level?",
          choices: [
            "which ones are to its left and right",
            "nothing — it only knows its two children",
          ],
          answer: 1,
          explain:
            "Siblings are not linked. Every level-order algorithm exists to recover a relationship the data structure does not store.",
        },
      ],
      run: story,
    },
    {
      key: "depth",
      name: "File each value under its depth",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the tree recursively carrying the depth. Keep a list of rows; when the walk arrives at a depth for the first time, open a row for it, then append the value to the row for that depth.",
      takeaways: [
        "depth is carried down as an argument, so no node has to work out where it is",
        "the row is opened by the first node to reach that depth, which the walk guarantees is the leftmost",
        "the order within a row is correct because of the ORDER OF THE RECURSION, not because the code says so",
        "and it goes as deep as the tree — a chain of 10,000 nodes does not return",
      ],
      quiz: [
        {
          q: "Why do the values within each row come out left to right?",
          choices: [
            "because the rows are sorted afterwards",
            "because the recursion always descends into the left child before the right one",
          ],
          answer: 1,
          explain:
            "Nothing sorts anything. Swap those two recursive calls and every row comes out reversed — which is exactly how much this version relies on an accident of traversal order.",
        },
      ],
      run: dfsDepth,
    },
    {
      key: "queue",
      name: "Take a whole row per round",
      short: "count first",
      insight:
        "The recursive version gets the grouping right as a side effect of descending left before right — true, but it is a fact about pre-order rather than about levels, and nothing in the code says which level a round is on.",
      idea: problem.whyNow!,
      takeaways: [
        "at the top of every round the queue holds exactly one level — that is the invariant everything else follows from",
        "snapshotting the length BEFORE popping is what keeps this round's children out of this round",
        "the walk's shape now matches the answer's shape, so no traversal accident is being relied on",
        "the memory held is the widest level, which on a full tree is half the nodes",
      ],
      quiz: [
        {
          q: "Why is the queue's length read into a variable before the inner loop?",
          choices: [
            "to avoid recomputing it, which is slower",
            "because the loop pushes children into the same queue — reading the length as you go would pull the next level into this one",
          ],
          answer: 1,
          explain:
            "The queue grows while it is being drained. The snapshot is the line between one level and the next; without it, the rows run together.",
        },
      ],
      run: bfs,
    },
  ],
})
