// Lowest Common Ancestor in a BST, derived. Level-order slots
// (./tree-slots.ts), with p and q as scalar params.
//
// The ladder is a straight climb for once, and the reason is worth naming: the
// general-tree version is correct on ANY binary tree and therefore cannot use
// the one fact this problem hands you. Knowing the tree is sorted turns a
// search of everything into a walk down one path.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import { problem } from "../problems/trees/bst-ancestor.ts"
import { asSlots, marksOf, present, wellFormed } from "./tree-slots.ts"

type A = Data<string> & { p: number; q: number }

const val = (nums: string[], i: number) => Number(nums[i])

/** The reference: the deepest node having both targets as descendants. */
export function ancestorOf(nums: string[], p: number, q: number) {
  let i = 0
  while (present(nums, i)) {
    const v = val(nums, i)
    if (p < v && q < v) i = 2 * i + 1
    else if (p > v && q > v) i = 2 * i + 2
    else return v
  }
  return -1
}

const holds = (nums: string[], x: number) =>
  nums.some((_v, i) => present(nums, i) && val(nums, i) === x)

/** Every slot on the path from the root down to the value, inclusive. */
function pathTo(nums: string[], x: number) {
  const out: number[] = []
  let i = 0
  while (present(nums, i)) {
    out.push(i)
    if (val(nums, i) === x) return out
    i = x < val(nums, i) ? 2 * i + 1 : 2 * i + 2
  }
  return out
}

const sortedTree = (nums: string[]) => {
  const check = (i: number, low: number, high: number): boolean => {
    if (!present(nums, i)) return true
    const v = val(nums, i)
    if (!(low < v && v < high)) return false
    return check(2 * i + 1, low, v) && check(2 * i + 2, v, high)
  }
  return check(0, -Infinity, Infinity)
}

function* story({ nums, p, q }: A): Generator<DFrame> {
  const answer = ancestorOf(nums, p, q)
  const pathP = pathTo(nums, p)
  const pathQ = pathTo(nums, q)
  yield {
    hold: 3,
    noChips: true,
    note: `A binary search tree and two of its values, ${p} and ${q}. Find their lowest common ancestor — the DEEPEST node that has both of them below it.`,
  }
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: `${p} and ${q}`,
      marks: marksOf(nums.length, (i) =>
        present(nums, i) && (val(nums, i) === p || val(nums, i) === q)
          ? "focus"
          : undefined
      ),
    },
    state: [
      { label: "p", value: p },
      { label: "q", value: q },
    ],
    note: "And note the word deepest: the root is always A common ancestor, so an answer that is merely correct-ish is easy to produce. The question asks for the last node the two paths share.",
  }
  const shared = pathP.filter((i) => pathQ.includes(i))
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: `ancestor ${answer}`,
      marks: marksOf(nums.length, (i) =>
        val(nums, i) === answer
          ? "answer"
          : shared.includes(i)
            ? "anchor"
            : pathP.includes(i) || pathQ.includes(i)
              ? "dim"
              : undefined
      ),
    },
    state: [{ label: "answer", value: answer }],
    answer,
    corner:
      answer === p || answer === q
        ? "self"
        : answer === val(nums, 0)
          ? "root"
          : "straddle",
    note:
      answer === p || answer === q
        ? `The answer is ${answer} — which is one of the two targets. A node counts as a descendant of ITSELF, so when one target sits on the path to the other, it is the ancestor. Code that insists on finding two separate subtrees misses this entirely.`
        : answer === val(nums, 0)
          ? `${answer}, the root: the two targets are on opposite sides of it, so nothing deeper can hold both.`
          : `${answer}. The two paths run together from the root down to it, and part company there — which is exactly what "lowest common ancestor" means.`,
  }
}

/** Rung 1 — search both subtrees, ignoring the ordering. */
function* searchBoth({ nums, p, q }: A): Generator<DFrame> {
  let visits = 0
  function* walk(i: number): Generator<DFrame, number> {
    if (!present(nums, i)) return -1
    visits++
    const v = val(nums, i)
    if (v === p || v === q) {
      yield {
        line: 3,
        tree: {
          slots: asSlots(nums),
          label: `found ${v}`,
          marks: marksOf(nums.length, (k) => (k === i ? "focus" : undefined)),
        },
        state: [{ label: "nodes visited", value: visits }],
        note: `${v} is one of the targets, so this subtree reports itself upward. Nothing below is looked at — but everything ABOVE still has to hear about it.`,
      }
      return i
    }
    const left = yield* walk(2 * i + 1)
    const right = yield* walk(2 * i + 2)
    if (left !== -1 && right !== -1) {
      yield {
        line: 7,
        tree: {
          slots: asSlots(nums),
          label: `both sides reported`,
          marks: marksOf(nums.length, (k) =>
            k === i ? "answer" : k === left || k === right ? "focus" : undefined
          ),
        },
        state: [
          { label: "left found", value: nums[left] },
          { label: "right found", value: nums[right] },
        ],
        corner: "straddle",
        note: `${v} heard back from BOTH sides, so the two targets are split beneath it: it is the ancestor. Notice how much work that took — both subtrees were searched in full, because nothing told this version where to look.`,
      }
      return i
    }
    const found = left !== -1 ? left : right
    if (found !== -1)
      yield {
        line: 8,
        tree: {
          slots: asSlots(nums),
          label: `passing ${nums[found]} up`,
          marks: marksOf(nums.length, (k) =>
            k === i ? "anchor" : k === found ? "focus" : undefined
          ),
        },
        state: [{ label: "nodes visited", value: visits }],
        note: `Only one side found anything, so ${v} is not the ancestor and passes the result up unchanged.`,
      }
    return found
  }
  yield {
    line: 1,
    tree: { slots: asSlots(nums), label: "look everywhere" },
    state: [{ label: "nodes visited", value: 0 }],
    note: "This version works on any binary tree at all: it knows nothing about ordering, so it searches both subtrees of every node and waits to hear what came back.",
  }
  yield* walk(0)
  const answer = ancestorOf(nums, p, q)
  yield {
    line: 12,
    answer,
    tree: {
      slots: asSlots(nums),
      label: `${answer}`,
      marks: marksOf(nums.length, (k) =>
        present(nums, k) && val(nums, k) === answer ? "answer" : "dim"
      ),
    },
    state: [
      { label: "answer", value: answer },
      { label: "nodes visited", value: visits },
      {
        label: "nodes in the tree",
        value: nums.filter((v) => v !== ".").length,
      },
    ],
    corner: answer === p || answer === q ? "self" : undefined,
    note: `${answer}, after visiting ${visits} of the ${nums.filter((v) => v !== ".").length} nodes. Correct on ANY tree — and that generality is the cost: it explored subtrees that the ordering of this one could have ruled out before entering them.`,
  }
}

/** Rung 2 — let the ordering choose the direction. */
function* walkDown({ nums, p, q }: A): Generator<DFrame> {
  let i = 0
  let steps = 0
  yield {
    line: 1,
    tree: {
      slots: asSlots(nums),
      label: "start at the root",
      marks: marksOf(nums.length, (k) => (k === 0 ? "focus" : undefined)),
    },
    state: [
      { label: "p", value: p },
      { label: "q", value: q },
    ],
    note: "One pointer, starting at the root. Every step is decided by comparing both targets against the current value — there is no searching here at all.",
  }
  while (present(nums, i)) {
    const v = val(nums, i)
    steps++
    if (p < v && q < v) {
      yield {
        line: 4,
        tree: {
          slots: asSlots(nums),
          label: `both below ${v}`,
          marks: marksOf(nums.length, (k) =>
            k === i ? "focus" : k === 2 * i + 1 ? "anchor" : undefined
          ),
        },
        state: [{ label: "at", value: v }],
        note: `${p} and ${q} are both smaller than ${v}, so both live in the left subtree — and so does their ancestor. The entire right side is ruled out by one comparison, unvisited.`,
      }
      i = 2 * i + 1
      continue
    }
    if (p > v && q > v) {
      yield {
        line: 5,
        tree: {
          slots: asSlots(nums),
          label: `both above ${v}`,
          marks: marksOf(nums.length, (k) =>
            k === i ? "focus" : k === 2 * i + 2 ? "anchor" : undefined
          ),
        },
        state: [{ label: "at", value: v }],
        note: `Both are larger than ${v}, so go right. Again: half the remaining tree eliminated without being looked at, because the tree is sorted and that is information.`,
      }
      i = 2 * i + 2
      continue
    }
    yield {
      line: 6,
      answer: v,
      tree: {
        slots: asSlots(nums),
        label: `ancestor ${v}`,
        marks: marksOf(nums.length, (k) => (k === i ? "answer" : undefined)),
      },
      state: [
        { label: "answer", value: v },
        { label: "steps", value: steps },
      ],
      corner:
        p === q
          ? "same"
          : v === p || v === q
            ? "self"
            : i === 0
              ? "root"
              : "straddle",
      note:
        p === q
          ? `Both targets are ${p}, the same node. Neither "both smaller" nor "both larger" can hold against a value equal to the current one, so the straddle case catches it the moment the walk arrives — provided the two direction tests are STRICT. Written with ≤ or ≥ they would both be false here too, but the walk would already have gone past.`
          : v === p || v === q
            ? `${v} IS one of the targets, and the other is somewhere below it. A node is its own descendant, so the walk stops here — the straddle test covers this case without a line of its own, which is why it is written as "not both on the same side" rather than "one on each side".`
            : `${p} and ${q} fall on opposite sides of ${v}, so this is where their paths part: the lowest common ancestor. Found in ${steps} ${steps === 1 ? "step" : "steps"}, along a single path, with nothing remembered.`,
    }
    return
  }
}

export const bstAncestor = deriveJourney<string>(problem, {
  slug: "the-tree-knows-the-way",
  subtitle: "sorted means a comparison is a direction, not a search",
  reveals: ["trees"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger tree" },
  params: [
    { key: "p", label: "p" },
    { key: "q", label: "q" },
  ],
  classify: (d) => {
    const nums = d.nums as string[]
    const { p, q } = d as A
    if (!wellFormed(nums) || !present(nums, 0))
      return {
        ok: false,
        warning:
          "level order, '.' for an absent node, no node hanging off an absent parent, and at least a root",
      }
    if (!sortedTree(nums))
      return {
        ok: false,
        warning: "this has to be a SEARCH tree: left smaller, right larger",
      }
    return holds(nums, p) && holds(nums, q)
      ? { ok: true }
      : {
          ok: false,
          warning: "both targets must be values that exist in the tree",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["6", "2", "8", "0", "4", "7", "9"],
      extra: { p: 2, q: 8 },
      info: "the answer is the root",
    },
    self: {
      label: "one target is the ancestor",
      nums: ["6", "2", "8", "0", "4", "7", "9"],
      extra: { p: 2, q: 4 },
      info: "a node is its own descendant",
    },
    straddle: {
      label: "they part company halfway down",
      nums: ["6", "2", "8", "0", "4", "7", "9"],
      extra: { p: 0, q: 4 },
      info: "the answer is 2, not 6",
    },
    same: {
      label: "both targets are the same node",
      nums: ["6", "2", "8"],
      extra: { p: 2, q: 2 },
      info: "the node itself",
    },
    deep: {
      label: "a chain",
      nums: ["5", ".", "7", ".", ".", ".", "9"],
      extra: { p: 7, q: 9 },
      info: "one long path",
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
      extra: { p: 1, q: 7 },
      info: "four levels",
    },
  },
  edges: [
    {
      key: "self",
      name: "one target is the ancestor",
      example: "p = 2, q = 4 with 4 below 2 → 2",
      why: "A node is a descendant of itself, so when one target lies on the path to the other, it IS the answer. Code that waits to find the two targets in separate subtrees walks past this node and returns something too shallow or nothing at all.",
      think:
        "Does your stopping condition include 'the current node is one of them'?",
      preset: "self",
      constraint: 3,
    },
    {
      key: "straddle",
      name: "the paths part below the root",
      example: "p = 0, q = 4 → 2, not 6",
      why: "The root is always a common ancestor, so returning it is a plausible wrong answer. The question asks for the LOWEST, which is the last node both paths share.",
      think: "What makes a common ancestor the lowest one?",
      preset: "straddle",
      constraint: 2,
    },
    {
      key: "root",
      name: "the answer is the root",
      example: "p = 2, q = 8 → 6",
      why: "The two targets are on opposite sides from the very first comparison, so the walk stops immediately. Worth seeing because it is the case where the fast version does the least work of all.",
      think: "How many comparisons before you can stop?",
      preset: "example",
      constraint: 2,
    },
    {
      key: "same",
      name: "both targets are the same node",
      example: "p = q = 2 → 2",
      why: "Neither strictly-smaller nor strictly-larger holds against itself, so the straddle case catches it on the first node that equals them. A version using ≤ or ≥ in the direction tests walks straight past it.",
      think: "Are your comparisons strict, and what happens when p equals q?",
      preset: "same",
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
        "given: a binary SEARCH tree, and two values that exist in it",
        "left subtree smaller than the node, right subtree larger",
        "a node counts as a descendant of itself",
        "task: return the deepest node that has both values below it",
      ],
      tools: [
        {
          name: "Binary search tree",
          role: "level-order slots — and the ordering is not decoration here, it is the whole method. A comparison against a node says which side both targets are on, which is a direction rather than a hint.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the root is always a common ancestor, so 'lowest' is the entire difficulty",
        "a node is its own descendant, so one target can be the answer",
        "the ordering means a comparison eliminates half the tree unvisited",
      ],
      quiz: [
        {
          q: "p sits on the path from the root down to q. What is their lowest common ancestor?",
          choices: [
            "the node above p",
            "p itself — a node is a descendant of itself",
          ],
          answer: 1,
          explain:
            "This is the case that catches solutions looking for two separate subtrees. p has q below it and itself at the top.",
        },
      ],
      run: story,
    },
    {
      key: "search",
      name: "Look in both subtrees",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Recurse into both children looking for either target. A node is the answer when the two are found on different sides, or when it is one of them.",
      takeaways: [
        "correct on ANY binary tree, ordered or not",
        "and that generality is the price: it enters subtrees the ordering could have ruled out",
        "it also has to hear back from both sides before deciding, so nothing stops early",
      ],
      quiz: [
        {
          q: "What does this version know about where the targets are?",
          choices: [
            "which side to search, from the values",
            "nothing — that is why it searches both sides of every node",
          ],
          answer: 1,
          explain:
            "It is written for a general tree. On a search tree it is throwing away the one fact that makes the problem easy.",
        },
      ],
      run: searchBoth,
    },
    {
      key: "walk",
      name: "Compare, and go that way",
      short: "one path",
      insight:
        "Searching both subtrees at every node is what you do when you have no idea where the targets are — and a search tree tells you, in one comparison.",
      idea: problem.approach,
      takeaways: [
        "both targets smaller means go left, both larger means go right",
        "anything else is the straddle, and the straddle IS the answer — including when the node is one of the targets",
        "each step discards half the remaining tree without visiting it",
        "a single path down, no backtracking, and nothing stored but one pointer",
      ],
      quiz: [
        {
          q: "Why does the straddle case need no separate test for 'the node is one of the targets'?",
          choices: [
            "because it is handled earlier",
            "because 'not both smaller and not both larger' is already true when the node equals one of them",
          ],
          answer: 1,
          explain:
            "Writing the condition as the absence of the two directions covers the equality case for free. Writing it as 'one on each side' does not.",
        },
      ],
      run: walkDown,
    },
  ],
})
