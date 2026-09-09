// Mirror a Binary Tree, derived. Level-order slots (./tree-slots.ts).
//
// The ladder here climbs in ROBUSTNESS, not in cost: both rungs are O(n) and
// the recursion is shorter. The explicit stack earns its place only on a tree
// deep enough to overflow the call stack — which the recap says rather than
// pretending the last rung is faster.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import { problem } from "../problems/trees/invert-tree.ts"
import { asSlots, marksOf, present, wellFormed } from "./tree-slots.ts"

type T = Data<string>

/** The reference: every node's children swapped, as level-order tokens. */
export function mirrored(nums: string[]): string[] {
  const out = nums.map(() => ".")
  const copy = (from: number, to: number) => {
    if (!present(nums, from)) return
    while (to >= out.length) out.push(".")
    out[to] = nums[from]
    copy(2 * from + 1, 2 * to + 2)
    copy(2 * from + 2, 2 * to + 1)
  }
  copy(0, 0)
  // trailing gaps are not part of the tree
  while (out.length && out[out.length - 1] === ".") out.pop()
  return out
}

const depthOf = (i: number) => Math.floor(Math.log2(i + 1))

function* story({ nums }: T): Generator<DFrame> {
  const answer = mirrored(nums)
  const live = nums.filter((v) => v !== ".").length
  yield {
    hold: 3,
    noChips: true,
    note: "A binary tree. Swap the left and right child of every node — not just the root — and hand the root back.",
  }
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: "before",
      marks: marksOf(nums.length, (i) =>
        present(nums, i) ? "focus" : undefined
      ),
    },
    state: [{ label: "nodes", value: live }],
    note: "Every node, at every depth. Swapping only the root's two children produces a tree that looks changed near the top and is untouched below — which is the wrong answer that reads as almost right.",
  }
  yield {
    hold: 3,
    tree: {
      slots: asSlots(answer),
      label: "after",
      marks: marksOf(answer.length, (i) =>
        present(answer, i) ? "answer" : undefined
      ),
    },
    answer,
    corner: !live
      ? "empty"
      : live === 1
        ? "single"
        : nums.every(
              (v, i) =>
                v === "." ||
                !present(nums, 2 * i + 1) ||
                !present(nums, 2 * i + 2)
            )
          ? "skewed"
          : "every",
    note: !live
      ? "An empty tree mirrors to an empty tree. That is the answer and the base case at once — nothing to swap, nothing to fail on."
      : live === 1
        ? "One node, no children. Mirroring it changes nothing at all, which is worth seeing: the operation is defined on every tree, including the ones it leaves alone."
        : `Mirrored: ${answer.join(" ")}. Every left-right pair has traded places, all the way to the leaves.`,
  }
}

/** Rung 1 — an explicit stack. */
function* iterative({ nums }: T): Generator<DFrame> {
  const slots = [...nums]
  const stack = [0]
  let pops = 0
  let deepest = 1
  yield {
    line: 1,
    tree: { slots: asSlots(slots), label: "stack: the root" },
    state: [
      { label: "stack", value: present(slots, 0) ? slots[0] : "empty tree" },
    ],
    note: "One stack, holding the root. Nothing about this version is recursive: the pending work is a list, and the list is visible.",
  }
  while (stack.length) {
    deepest = Math.max(deepest, stack.length)
    const i = stack.pop()!
    pops++
    if (!present(slots, i)) continue
    const l = 2 * i + 1
    const r = 2 * i + 2
    const left: string[] = []
    const right: string[] = []
    const grab = (from: number, into: string[], at: number) => {
      if (!present(slots, from)) return
      while (at >= into.length) into.push(".")
      into[at] = slots[from]
      grab(2 * from + 1, into, 2 * at + 1)
      grab(2 * from + 2, into, 2 * at + 2)
    }
    grab(l, left, 0)
    grab(r, right, 0)
    const put = (sub: string[], from: number, to: number) => {
      if (from >= sub.length || sub[from] === ".") return
      while (to >= slots.length) slots.push(".")
      slots[to] = sub[from]
      put(sub, 2 * from + 1, 2 * to + 1)
      put(sub, 2 * from + 2, 2 * to + 2)
    }
    const clear = (at: number) => {
      if (at >= slots.length) return
      slots[at] = "."
      clear(2 * at + 1)
      clear(2 * at + 2)
    }
    clear(l)
    clear(r)
    put(right, 0, l)
    put(left, 0, r)
    if (present(slots, l)) stack.push(l)
    if (present(slots, r)) stack.push(r)
    yield {
      line: 6,
      tree: {
        slots: asSlots(slots),
        label: `swapped under ${slots[i]}`,
        marks: marksOf(slots.length, (k) =>
          k === i
            ? "answer"
            : k === l || k === r
              ? "focus"
              : stack.includes(k)
                ? "anchor"
                : undefined
        ),
      },
      state: [
        { label: "popped", value: slots[i] },
        { label: "stack size", value: stack.length },
      ],
      corner: stack.length === 1 && depthOf(i) > 1 ? "skewed" : undefined,
      note: `${slots[i]} has its two children exchanged, and both are pushed for their own turn. The stack is holding ${stack.length} ${stack.length === 1 ? "node" : "nodes"} — that is the memory this version uses, and it is under the author's control rather than the runtime's.`,
    }
  }
  const answer = mirrored(nums)
  yield {
    line: 10,
    answer,
    tree: {
      slots: asSlots(slots),
      label: "mirrored",
      marks: marksOf(slots.length, (k) =>
        present(slots, k) ? "answer" : undefined
      ),
    },
    state: [
      { label: "pops", value: pops },
      { label: "deepest stack", value: deepest },
    ],
    corner: nums.filter((v) => v !== ".").length === 0 ? "empty" : "every",
    note: `Done in ${pops} ${pops === 1 ? "pop" : "pops"}, holding at most ${deepest} ${deepest === 1 ? "node" : "nodes"} at once. Correct, and longer than it needs to be for an ordinary tree — the stack is doing by hand what the next rung gets for free.`,
  }
}

/** Rung 2 — the recursion, which is the definition. */
function* recurse({ nums }: T): Generator<DFrame> {
  const slots = [...nums]
  let depth = 0
  let deepest = 0
  let swaps = 0
  function* walk(i: number): Generator<DFrame> {
    depth++
    deepest = Math.max(deepest, depth)
    if (!present(slots, i)) {
      depth--
      return
    }
    yield* walk(2 * i + 1)
    yield* walk(2 * i + 2)
    const l = 2 * i + 1
    const r = 2 * i + 2
    const sub = (root: number): string[] => {
      const out: string[] = []
      const grab = (from: number, at: number) => {
        if (!present(slots, from)) return
        while (at >= out.length) out.push(".")
        out[at] = slots[from]
        grab(2 * from + 1, 2 * at + 1)
        grab(2 * from + 2, 2 * at + 2)
      }
      grab(root, 0)
      return out
    }
    const left = sub(l)
    const right = sub(r)
    const clear = (at: number) => {
      if (at >= slots.length) return
      slots[at] = "."
      clear(2 * at + 1)
      clear(2 * at + 2)
    }
    const put = (from: string[], at: number, to: number) => {
      if (at >= from.length || from[at] === ".") return
      while (to >= slots.length) slots.push(".")
      slots[to] = from[at]
      put(from, 2 * at + 1, 2 * to + 1)
      put(from, 2 * at + 2, 2 * to + 2)
    }
    clear(l)
    clear(r)
    put(right, 0, l)
    put(left, 0, r)
    swaps++
    yield {
      line: 3,
      tree: {
        slots: asSlots(slots),
        label: `${slots[i]} swapped`,
        marks: marksOf(slots.length, (k) =>
          k === i ? "answer" : k === l || k === r ? "focus" : undefined
        ),
      },
      state: [
        { label: "at", value: slots[i] },
        { label: "frames deep", value: depth },
      ],
      note: `${slots[i]} exchanges its two children. Whether the swap happens before or after the two recursive calls makes no difference — each call only rearranges its own subtree, so there is no ordering here to get wrong.`,
    }
    depth--
  }
  yield {
    line: 2,
    tree: { slots: asSlots(slots), label: "an empty node inverts to nothing" },
    state: [{ label: "frames deep", value: 0 }],
    corner: !present(nums, 0) ? "empty" : undefined,
    note: "The base case first: nothing inverts to nothing. That single line ends every branch, and it is why no leaf needs a test of its own.",
  }
  yield* walk(0)
  const answer = mirrored(nums)
  yield {
    line: 4,
    answer,
    tree: {
      slots: asSlots(slots),
      label: "mirrored",
      marks: marksOf(slots.length, (k) =>
        present(slots, k) ? "answer" : undefined
      ),
    },
    state: [
      { label: "swaps", value: swaps },
      { label: "deepest frame", value: deepest },
    ],
    corner:
      nums.filter((v) => v !== ".").length === 1
        ? "single"
        : deepest > 3
          ? "skewed"
          : "every",
    note: `${swaps} ${swaps === 1 ? "swap" : "swaps"}, in three lines, and the call stack went ${deepest} frames deep. That depth is the honest cost: on a tree shaped like a chain it is the node count, and the version above is the one that survives it.`,
  }
}

export const invertTree = deriveJourney<string>(problem, {
  slug: "swap-every-pair",
  subtitle: "the operation is one swap and two smaller versions of itself",
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
            "level order, one token per slot, '.' for an absent node — and no node may hang off an absent parent",
        },
  presets: {
    example: {
      label: "the example",
      nums: ["4", "2", "7", "1", "3", "6", "9"],
      info: "becomes 4 7 2 9 6 3 1",
    },
    empty: { label: "an empty tree", nums: ["."], info: "mirrors to nothing" },
    single: { label: "one node", nums: ["5"], info: "nothing changes" },
    skewed: {
      label: "a chain, not a tree",
      nums: ["1", "2", ".", "3", ".", ".", ".", "4"],
      info: "leans the other way afterwards",
    },
    lopsided: {
      label: "one child missing",
      nums: ["1", "2", "3", ".", "4"],
      info: "the gap moves too",
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
        "7",
        "9",
        "11",
        "13",
        "15",
      ],
      info: "four levels",
    },
  },
  edges: [
    {
      key: "empty",
      name: "an empty tree",
      example: "nothing → nothing",
      why: "Mirroring nothing is not an error, it is the base case that terminates every branch. A version that reads a node's children before checking the node exists crashes on legal input.",
      think: "What does your function do when handed an absent child?",
      preset: "empty",
      constraint: 2,
    },
    {
      key: "single",
      name: "a single node",
      example: "[5] → [5]",
      why: "The operation is defined on trees it leaves unchanged. It is also the smallest tree where both children are absent, so it exercises the base case twice in one call.",
      think: "Does your swap cope with both children being nothing?",
      preset: "single",
      constraint: 1,
    },
    {
      key: "every",
      name: "every node, not just the root",
      example: "[4, 2, 7, 1, 3, 6, 9] → [4, 7, 2, 9, 6, 3, 1]",
      why: "Swapping only the root's children looks like progress and is wrong below the first level. This is the input where that mistake is visible: the leaves have moved too.",
      think: "How far down does your swap reach?",
      preset: "example",
      constraint: 3,
    },
    {
      key: "skewed",
      name: "a chain rather than a tree",
      example: "every node with one child → the chain leans the other way",
      why: "A gap swaps with a node, so the whole chain changes sides. It is also the deepest a recursion can go for a given node count, which is exactly where the iterative version stops being an alternative and becomes the answer.",
      think:
        "How deep does your call stack go on a tree with 10,000 nodes in a line?",
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
        "every node has a left child and a right child, either may be absent",
        "task: exchange those two at EVERY node",
        "and return the root",
      ],
      tools: [
        {
          name: "Binary tree",
          role: "drawn from level order — node i has children 2i+1 and 2i+2, '.' is absent. A swap here moves whole subtrees, not just two values, which is why the picture is worth watching rather than the numbers.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the swap is at every node, and a version that only does the root looks nearly right",
        "an absent child swaps just as happily as a present one",
        "an empty tree mirrors to an empty tree, which is the base case rather than an exception",
      ],
      quiz: [
        {
          q: "A node has a left child and no right child. What happens to it?",
          choices: [
            "nothing — there is nothing to swap with",
            "the child moves to the right, and the absence moves to the left",
          ],
          answer: 1,
          explain:
            "Absence is a value here. Skipping the swap when one side is missing leaves half the tree unmirrored.",
        },
      ],
      run: story,
    },
    {
      key: "stack",
      name: "Keep the pending nodes in a list",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Push the root. Pop a node, swap its two children, push both of them, and repeat until the list is empty.",
      takeaways: [
        "no recursion at all: the work still to do is a list you can see",
        "the memory is the stack's size, which is under your control rather than the runtime's",
        "and it is more code than the operation deserves for an ordinary tree",
      ],
      run: iterative,
    },
    {
      key: "recurse",
      name: "Swap here, then do the same below",
      short: "three lines",
      insight:
        "The explicit stack holds nothing but nodes waiting for the same operation — which is precisely what the call stack already is.",
      idea: problem.approach,
      takeaways: [
        "mirroring a tree is: swap the root's two children, then mirror each of them",
        "the order of the swap and the two calls does not matter, because each call only touches its own subtree",
        "an empty node returns immediately, so no leaf needs a test",
        "and it goes as deep as the tree — which is why the stack version above is a fallback worth knowing, not a straw man",
      ],
      quiz: [
        {
          q: "Does the swap have to happen before the two recursive calls?",
          choices: [
            "yes — otherwise the children are inverted twice",
            "no — each call only rearranges its own subtree, so the order makes no difference",
          ],
          answer: 1,
          explain:
            "Worth checking rather than assuming: the two operations touch disjoint parts of the tree, which is what makes the ordering free.",
        },
      ],
      run: recurse,
    },
  ],
})
