// Maximum Depth of Binary Tree, derived — the first journey to draw a TREE
// (engine/shape-views.tsx).
//
// The tree arrives as level-order tokens, "." for an absent node, which is the
// notation the problem's own example uses: [3, 9, 20, null, null, 15, 7]. Read
// as full heap indexing — the node at i has children 2i+1 and 2i+2 — so the
// row IS the drawing, and nothing has to be laid out by hand. That is why the
// four heap problems will be able to use this view unchanged.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/trees/max-depth.ts"

type T = Data<string>

const GAP = "."

export const present = (slots: string[], i: number) =>
  i < slots.length && slots[i] !== GAP

/** Level-order tokens → the slot array the tree view draws. */
const asSlots = (nums: string[]) =>
  nums.map((v) => (v === GAP ? null : (Number(v) as number | string)))

export function depthOfTree(nums: string[]) {
  const walk = (i: number): number =>
    present(nums, i) ? 1 + Math.max(walk(2 * i + 1), walk(2 * i + 2)) : 0
  return walk(0)
}

/** The nodes on one deepest root-to-leaf path — the story act points at them. */
function deepestPath(nums: string[]) {
  const path: number[] = []
  let i = 0
  while (present(nums, i)) {
    path.push(i)
    const l = 2 * i + 1
    const r = 2 * i + 2
    const dl = present(nums, l) ? depthFrom(nums, l) : 0
    const dr = present(nums, r) ? depthFrom(nums, r) : 0
    if (dl === 0 && dr === 0) break
    i = dl >= dr ? l : r
  }
  return path
}

function depthFrom(nums: string[], i: number): number {
  return present(nums, i)
    ? 1 + Math.max(depthFrom(nums, 2 * i + 1), depthFrom(nums, 2 * i + 2))
    : 0
}

const marksOf = (pick: (i: number) => ChipRole | undefined, n: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

function* story({ nums }: T): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A binary tree, and one number to return: how many nodes lie on the longest path from the root down to a leaf.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Depth counts NODES, not the steps between them — a single node is depth 1, and an empty tree is depth 0. That base case is not a detail; it is the whole reason the recursive version terminates.",
  }
  if (!nums.length || nums[0] === GAP) {
    yield {
      hold: 3,
      answer: 0,
      corner: "empty",
      note: "No tree at all. Depth 0 — a stated answer, not a missing one, and the thing every version here is ultimately built out of.",
    }
    return
  }
  const answer = depthOfTree(nums)
  const path = deepestPath(nums)
  const chain = nums.every(
    (v, i) =>
      v === GAP || !(present(nums, 2 * i + 1) && present(nums, 2 * i + 2))
  )
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: `depth ${answer}`,
      marks: marksOf(
        (i) => (path.includes(i) ? "answer" : undefined),
        nums.length
      ),
    },
    state: [{ label: "depth", value: answer }],
    answer,
    corner:
      nums.filter((v) => v !== GAP).length === 1
        ? "single"
        : chain
          ? "skewed"
          : nums.some((v) => v !== GAP && Number(v) < 0)
            ? "negatives"
            : undefined,
    note:
      nums.filter((v) => v !== GAP).length === 1
        ? "One node, no children, so the longest path is that node alone: depth 1. Not 0 — the root is on the path."
        : chain
          ? `Every node here has at most one child, so the tree is really a chain and the depth is its full length, ${answer}. Worth seeing before choosing a method: a recursion on a tree shaped like this goes ${answer} frames deep, and on a chain of 10,000 it does not return.`
          : nums.some((v) => v !== GAP && Number(v) < 0)
            ? `The depth is ${answer}, along ${path.map((i) => nums[i]).join(" → ")}. Some values are negative, which changes nothing at all — depth counts nodes, and a node's own value never enters the arithmetic.`
            : `The depth is ${answer}, along the path ${path.map((i) => nums[i]).join(" → ")}.`,
  }
}

function* bfs({ nums }: T): Generator<DFrame> {
  if (!nums.length || nums[0] === GAP) {
    yield { line: 4, answer: 0, note: "No root, so no levels: 0." }
    return
  }
  let level = [0]
  let depth = 0
  while (level.length) {
    depth += 1
    yield {
      line: 8,
      tree: {
        slots: asSlots(nums),
        label: `level ${depth}`,
        marks: marksOf(
          (i) =>
            level.includes(i) ? "focus" : present(nums, i) ? "dim" : undefined,
          nums.length
        ),
      },
      state: [
        { label: "levels", value: depth },
        { label: "in hand", value: level.length },
      ],
      note: `Level ${depth} holds ${level.length} node${level.length === 1 ? "" : "s"}: ${level.map((i) => nums[i]).join(", ")}. One round of the loop is one level, so the count of rounds IS the depth — and the whole level has to be in memory at once to do it.`,
    }
    const next: number[] = []
    for (const i of level)
      for (const c of [2 * i + 1, 2 * i + 2]) if (present(nums, c)) next.push(c)
    level = next
  }
  yield {
    line: 15,
    answer: depth,
    tree: { slots: asSlots(nums), label: `depth ${depth}` },
    state: [{ label: "depth", value: depth }],
    note: `${depth}. No recursion, so a chain-shaped tree cannot overflow anything — but the widest level was held in the queue all at once, and on a full tree that is half the nodes.`,
  }
}

function* dfsStack({ nums }: T): Generator<DFrame> {
  const stack: [number, number][] = present(nums, 0) ? [[0, 1]] : []
  let best = 0
  while (stack.length) {
    const [i, d] = stack.pop()!
    const record = d > best
    best = Math.max(best, d)
    yield {
      line: 5,
      tree: {
        slots: asSlots(nums),
        label: record ? `deepest so far: ${best}` : `depth ${best}`,
        marks: marksOf(
          (k) =>
            k === i
              ? "focus"
              : stack.some(([s]) => s === k)
                ? "anchor"
                : undefined,
          nums.length
        ),
      },
      state: [
        { label: "at depth", value: d },
        { label: "waiting", value: stack.length },
      ],
      note: `Node ${nums[i]} is ${d} deep${record ? `, deeper than anything before it` : ""}. Its children go on the stack carrying their own depth, so nothing has to be recomputed on the way back up — there is no way back up.`,
    }
    for (const c of [2 * i + 1, 2 * i + 2])
      if (present(nums, c)) stack.push([c, d + 1])
  }
  yield {
    line: 10,
    answer: best,
    tree: { slots: asSlots(nums), label: `depth ${best}` },
    state: [{ label: "depth", value: best }],
    note: `${best}. One path in hand at a time instead of a whole level — but the depth is now carried by hand, in the stack, alongside every node.`,
  }
}

function* recurse({ nums }: T): Generator<DFrame> {
  let deepest = 0
  const walk = function* (i: number, d: number): Generator<DFrame, number> {
    if (!present(nums, i)) {
      yield {
        line: 2,
        tree: {
          slots: asSlots(nums),
          label: "the base case",
          marks: marksOf(
            (k) => (k === Math.floor((i - 1) / 2) ? "anchor" : undefined),
            nums.length
          ),
        },
        state: [{ label: "returns", value: 0 }],
        note: `Off the end of the tree. Return 0 — and that is the entire termination logic: nothing checks for a leaf, because a leaf is just a node whose two children both answer 0.`,
      }
      return 0
    }
    deepest = Math.max(deepest, d)
    const l = yield* walk(2 * i + 1, d + 1)
    const r = yield* walk(2 * i + 2, d + 1)
    const here = 1 + Math.max(l, r)
    yield {
      line: 3,
      tree: {
        slots: asSlots(nums),
        label: `depth below ${nums[i]}`,
        marks: marksOf((k) => (k === i ? "answer" : undefined), nums.length),
      },
      state: [
        { label: "left · right", value: `${l} · ${r}` },
        { label: `depth at ${nums[i]}`, value: here },
      ],
      note: `${nums[i]} asks its two children how deep they are — ${l} and ${r} — takes the larger and adds itself: ${here}. That sentence is the whole algorithm, and it is also the definition of depth.`,
    }
    return here
  }
  const answer = yield* walk(0, 1)
  yield {
    line: 3,
    answer,
    tree: { slots: asSlots(nums), label: `depth ${answer}` },
    state: [
      { label: "depth", value: answer },
      { label: "deepest frame", value: deepest },
    ],
    note: `${answer}, in three lines. No queue and no stack of pairs — the call stack already holds one path with its depth, which is exactly what both iterative versions were building by hand. The price is real: it went ${deepest} frames deep, and on a chain of 10,000 nodes that is where it stops working.`,
  }
}

const wellFormed = (nums: string[]) => {
  if (!nums.every((v) => v === GAP || Number.isInteger(Number(v)))) return false
  // a node cannot hang off an absent parent
  for (let i = 1; i < nums.length; i++)
    if (nums[i] !== GAP && nums[Math.floor((i - 1) / 2)] === GAP) return false
  return true
}

export const maxDepth = deriveJourney<string>(problem, {
  slug: "how-deep-is-the-tree",
  subtitle: "a node asks its children, and the empty tree answers 0",
  reveals: ["trees"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger tree" },
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
      info: "3 with children 9 and 20",
    },
    empty: { label: "no tree at all", nums: ["."], info: "depth 0" },
    single: { label: "one node", nums: ["5"], info: "depth 1, not 0" },
    skewed: {
      label: "a chain, not a tree",
      nums: ["1", "2", ".", "3", ".", ".", ".", "4"],
      info: "every node has one child",
    },
    negatives: {
      label: "negative values",
      nums: ["-5", "-9", "-2", ".", ".", "-8", "."],
      info: "values never enter the arithmetic",
    },
    long: {
      label: "a bigger tree",
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
        ".",
        ".",
        ".",
        ".",
        "15",
      ],
    },
  },
  edges: [
    {
      key: "empty",
      name: "no tree at all",
      example: "an empty tree → 0",
      why: "0 is the answer, and it is also the base case every other version is built out of — the recursion terminates on it, the queue loop never runs, and the stack starts empty.",
      think: "What does your function return when handed nothing?",
      preset: "empty",
      constraint: 2,
    },
    {
      key: "single",
      name: "one node",
      example: "[5] → 1",
      why: "Depth counts nodes, not the steps between them, so a lone root is 1 rather than 0. Off by one here and every answer is off by one.",
      think: "Is your unit a node or an edge?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "negatives",
      name: "negative node values",
      example: "[-5, -9, -2, ., ., -8, .] → 3",
      why: "Depth counts nodes, so a value never enters the arithmetic at all. Anything that compares values, or treats a negative as a sentinel for 'absent', is answering a different question.",
      think: "Does your code ever read what a node holds?",
      preset: "negatives",
      constraint: 1,
    },
    {
      key: "skewed",
      name: "a chain rather than a tree",
      example: "every node with one child → depth equals the node count",
      why: "The recursion goes as deep as the tree, and the node count can be 10,000. This is the shape where the elegant version stops working and the iterative ones do not.",
      think:
        "How deep does your call stack go on the worst-shaped input, not the average one?",
      preset: "skewed",
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
        "given: a binary tree, possibly empty",
        "a path runs root → child → … → leaf",
        "depth = the number of NODES on the longest such path",
        "task: return it; an empty tree is 0",
      ],
      tools: [
        {
          name: "Binary tree",
          role: "drawn here from level order — the node at i has children 2i+1 and 2i+2, and '.' is an absent node. Every node is the root of a smaller tree, which is the property the whole problem turns on.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "depth counts nodes, so one node is 1 and no nodes is 0",
        "every node is the root of a smaller tree — the answer for one is built from the answers for its children",
        "the shape of the tree, not its size, decides which method survives",
      ],
      quiz: [
        {
          q: "A tree is a single node with no children. What is its depth?",
          choices: ["0", "1"],
          answer: 1,
          explain:
            "Depth counts nodes on the path, and that node is on it. 0 belongs to the empty tree.",
        },
      ],
      run: story,
    },
    {
      key: "bfs",
      name: "Count the levels",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Hold the current level in a queue, and each round replace it with all of its children. The number of rounds is the depth.",
      takeaways: [
        "one round of the loop is exactly one level, so counting rounds counts depth",
        "no recursion, so no call stack to overflow on a chain-shaped tree",
        "and the widest level is held in memory at once — on a full tree that is half the nodes",
      ],
      run: bfs,
    },
    {
      key: "stack",
      name: "Carry the depth on a stack",
      short: "one path at a time",
      from: 1,
      insight:
        "Counting levels means holding an entire level at once, and the widest level is the widest part of the tree. A stack of node-and-depth pairs walks one path down instead, so what is held is a path rather than a tier.",
      idea: "Push the root with depth 1. Pop a node, record its depth as a candidate for the best, and push its children carrying one more. When the stack empties, the largest depth seen is the answer.",
      takeaways: [
        "each node carries its own depth, so nothing is recomputed on the way back — there is no way back",
        "what is in memory is a path, not a level",
        "and the depth is now bookkeeping the code does by hand",
      ],
      quiz: [
        {
          q: "Why does each stack entry carry its depth rather than the code tracking one number?",
          choices: [
            "to make the code shorter",
            "because popping jumps between branches — a single counter would be wrong the moment the walk changes branch",
          ],
          answer: 1,
          explain:
            "The stack does not unwind in a tidy order. Attaching the depth to the node is what makes each pop self-describing.",
        },
      ],
      run: dfsStack,
    },
    {
      key: "recurse",
      name: "Ask the children",
      short: "three lines",
      insight:
        "Both iterative versions maintain a container and a depth by hand — and a container of pending work with a value attached to each item is precisely what the call stack already is.",
      idea: problem.whyNow!,
      takeaways: [
        "depth(node) = 1 + the larger of its children's depths, which is also the definition of depth",
        "depth(nothing) = 0 is the entire termination logic; nothing has to test for a leaf",
        "the call stack carries the path and its depth, so neither is written down",
        "and it goes as deep as the tree — on a chain of 10,000 nodes it does not return",
      ],
      quiz: [
        {
          q: "Where does this version check whether a node is a leaf?",
          choices: [
            "before recursing into the children",
            "nowhere — a leaf is a node whose two children both answer 0",
          ],
          answer: 1,
          explain:
            "The base case does all of it. Adding an explicit leaf test is the usual way to make this version longer and no more correct.",
        },
      ],
      run: recurse,
    },
  ],
})
