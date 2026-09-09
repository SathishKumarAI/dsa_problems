// Validate a Binary Search Tree, derived. Level-order slots (./tree-slots.ts).
//
// The lesson this journey exists for is the WRONG version: comparing a node to
// its two children passes on trees that are not BSTs, and the story act shows
// one. Both real rungs then fix it in different currencies — one by walking in
// sorted order, one by carrying the bound every ancestor implies.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import { problem } from "../problems/trees/validate-bst.ts"
import { asSlots, marksOf, present, wellFormed } from "./tree-slots.ts"

type T = Data<string>

const val = (nums: string[], i: number) => Number(nums[i])

/** The reference: a value is bounded by every ancestor, not just its parent. */
export function isBst(nums: string[]): boolean {
  const walk = (i: number, low: number, high: number): boolean => {
    if (!present(nums, i)) return true
    const v = val(nums, i)
    if (!(low < v && v < high)) return false
    return walk(2 * i + 1, low, v) && walk(2 * i + 2, v, high)
  }
  return walk(0, -Infinity, Infinity)
}

/** In-order slot indices — the walk a BST turns into a sorted list. */
export function inorderSlots(nums: string[]) {
  const out: number[] = []
  const walk = (i: number) => {
    if (!present(nums, i)) return
    walk(2 * i + 1)
    out.push(i)
    walk(2 * i + 2)
  }
  walk(0)
  return out
}

/** The check that looks right and is not: node against its own two children. */
const parentOnly = (nums: string[]) =>
  nums.every((_, i) => {
    if (!present(nums, i)) return true
    const v = val(nums, i)
    const l = 2 * i + 1
    const r = 2 * i + 2
    return (
      (!present(nums, l) || val(nums, l) < v) &&
      (!present(nums, r) || val(nums, r) > v)
    )
  })

const bound = (x: number) =>
  x === -Infinity ? "−∞" : x === Infinity ? "+∞" : String(x)

function* story({ nums }: T): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A binary tree, and one yes-or-no question: is it a binary search tree? Everything in a left subtree strictly smaller than the node above it, everything on the right strictly larger.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Read that again, because the whole problem hides in one word: everything. Not the two children — every descendant, however deep, is bound by every ancestor above it.",
  }
  const ok = isBst(nums)
  const local = parentOnly(nums)
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: ok ? "a valid BST" : "not a BST",
      marks: marksOf(nums.length, (i) =>
        present(nums, i) ? (ok ? "answer" : undefined) : undefined
      ),
    },
    answer: ok,
    corner:
      local && !ok
        ? "deep"
        : nums.filter((v) => present(nums, Number(v) >= 0 ? 0 : 0)).length ===
              1 &&
            present(nums, 0) &&
            !present(nums, 1) &&
            !present(nums, 2)
          ? "single"
          : undefined,
    note:
      local && !ok
        ? "Here is the trap, on screen. Every node is on the correct side of its OWN parent — and the tree is still not a BST, because a node further down breaks a rule set by a grandparent it never compares itself to."
        : ok
          ? "This one is valid: every value sits inside the window its ancestors leave open for it."
          : "Not a BST — and this one is caught even by the laziest check, because the violation is between a node and its own child.",
  }
  yield {
    hold: 3,
    tree: { slots: asSlots(nums), label: "two honest ways" },
    note: "So a local comparison is not enough. Either walk the tree in an order that makes the rule visible as one long sequence, or carry the rule down with you as an interval.",
  }
}

/** Rung 1 — in-order: a BST flattens to a strictly increasing sequence. */
function* inorder({ nums }: T): Generator<DFrame> {
  const order = inorderSlots(nums)
  let prev = -Infinity
  const done: number[] = []
  yield {
    line: 1,
    tree: { slots: asSlots(nums), label: "prev = −∞" },
    state: [{ label: "prev", value: "−∞" }],
    note: "One number remembered: the value seen just before this one. Starting at −∞ so the first real node cannot fail against it.",
  }
  for (const i of order) {
    const v = val(nums, i)
    if (v <= prev) {
      yield {
        line: 8,
        answer: false,
        tree: {
          slots: asSlots(nums),
          label: `${v} ≤ ${bound(prev)}`,
          marks: marksOf(nums.length, (k) =>
            k === i ? "focus" : done.includes(k) ? "dim" : undefined
          ),
          labels: { [i]: "here" },
        },
        state: [
          { label: "prev", value: bound(prev) },
          { label: "here", value: v },
        ],
        corner: parentOnly(nums) ? "deep" : "duplicate",
        note: `In-order, ${v} arrives after ${bound(prev)} — and it is not larger. A BST walked in order is strictly increasing, so one step that does not increase is the whole disproof. Note it is caught by a COMPARISON WITH A NEIGHBOUR, which is why this version needs the walk to be exactly right.`,
      }
      return
    }
    done.push(i)
    prev = v
    yield {
      line: 10,
      tree: {
        slots: asSlots(nums),
        label: `${done.map((k) => nums[k]).join(" < ")}`,
        marks: marksOf(nums.length, (k) =>
          k === i ? "answer" : done.includes(k) ? "dim" : undefined
        ),
        labels: { [i]: `prev = ${v}` },
      },
      state: [
        { label: "seen so far", value: done.length },
        { label: "prev", value: v },
      ],
      note: `${v} is bigger than everything before it, so the sequence is still increasing: ${done.map((k) => nums[k]).join(" < ")}. Left subtree, then the node, then the right subtree — that order is what turns a tree into a sorted list.`,
    }
  }
  yield {
    line: 11,
    answer: true,
    tree: {
      slots: asSlots(nums),
      label: order.map((k) => nums[k]).join(" < "),
      marks: marksOf(nums.length, () => "answer"),
    },
    state: [{ label: "values", value: order.length }],
    corner: order.length === 1 ? "single" : undefined,
    note: `The whole walk came out strictly increasing, so this is a BST. Correct — but the reason lives in the walk rather than in the rule: every comparison here is between neighbours, and the property being checked is about ancestors.`,
  }
}

/** Rung 2 — the interval every ancestor implies. */
function* intervals({ nums }: T): Generator<DFrame> {
  const done: number[] = []
  let verdict = true
  function* walk(i: number, low: number, high: number): Generator<DFrame> {
    if (!present(nums, i)) return
    const v = val(nums, i)
    const inside = low < v && v < high
    yield {
      line: inside ? 3 : 5,
      tree: {
        slots: asSlots(nums),
        label: `${bound(low)} < ${v} < ${bound(high)} ?`,
        marks: marksOf(nums.length, (k) =>
          k === i
            ? inside
              ? "focus"
              : "answer"
            : done.includes(k)
              ? "dim"
              : undefined
        ),
        labels: { [i]: `(${bound(low)}, ${bound(high)})` },
      },
      state: [
        { label: "allowed", value: `(${bound(low)}, ${bound(high)})` },
        { label: "value", value: v },
      ],
      corner:
        !inside && parentOnly(nums)
          ? "deep"
          : !inside
            ? "duplicate"
            : // a negative value against an open lower bound is where the
              // sentinel matters: −∞ passes, the smallest int would not
              low === -Infinity && v < 0
              ? "range"
              : undefined,
      note: inside
        ? low === -Infinity && v < 0
          ? `${v} lies inside (${bound(low)}, ${bound(high)}). Watch the lower bound while it does: −∞ is not decoration. Seed that side with the smallest representable integer instead and a node legitimately holding that value compares as out of range — a wrong answer produced entirely by the sentinel.`
          : `${v} lies inside (${bound(low)}, ${bound(high)}) — the window left open by every ancestor above it, not just by its parent.`
        : `${v} is outside (${bound(low)}, ${bound(high)}), so this is not a BST. ${low === -Infinity || high === Infinity ? "One side of the window is still open; the other is what it broke." : `The bound it broke was set by an ancestor further up, and ${v} is on the correct side of its own parent — which is exactly why the parent-only check waves this tree through.`}`,
    }
    done.push(i)
    if (!inside) {
      verdict = false
      return
    }
    yield* walk(2 * i + 1, low, v)
    if (!verdict) return
    yield* walk(2 * i + 2, v, high)
  }
  yield {
    line: 9,
    tree: { slots: asSlots(nums), label: "(−∞, +∞)" },
    state: [{ label: "allowed at the root", value: "(−∞, +∞)" }],
    note: "The root may be anything, so it starts with the widest possible window. Each step down narrows exactly one side of it — and the narrowing is the algorithm.",
  }
  yield* walk(0, -Infinity, Infinity)
  const ok = isBst(nums)
  yield {
    line: ok ? 3 : 5,
    answer: ok,
    tree: {
      slots: asSlots(nums),
      label: ok ? "every node inside its window" : "a node outside its window",
      marks: marksOf(nums.length, (k) =>
        present(nums, k) ? (ok ? "answer" : "dim") : undefined
      ),
    },
    state: [{ label: "verdict", value: ok ? "valid BST" : "not a BST" }],
    corner: ok ? undefined : parentOnly(nums) ? "deep" : "duplicate",
    note: ok
      ? "Valid. Going left tightened the upper bound to the node's value, going right tightened the lower one, so by the time the walk reached a leaf its window carried every ancestor's rule at once — and that is the property the problem actually states."
      : "Rejected, and rejected by the rule itself rather than by a neighbouring comparison: the window said what was allowed there, and the value was not in it.",
  }
}

export const validateBst = deriveJourney<string>(problem, {
  slug: "the-window-every-ancestor-leaves-open",
  subtitle: "a node is bounded by everything above it, not by its parent",
  reveals: ["trees"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger tree to bound" },
  classify: (d) => {
    const nums = d.nums as string[]
    return wellFormed(nums) && present(nums, 0)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "level order, one token per slot, '.' for an absent node, a node may not hang off an absent parent — and the tree has at least one node",
        }
  },
  presets: {
    example: {
      label: "a valid BST",
      nums: ["5", "1", "8"],
      info: "1 < 5 < 8",
    },
    deep: {
      label: "every parent happy, still wrong",
      nums: ["5", "1", "8", ".", ".", "4", "9"],
      info: "4 is in 5's right subtree",
    },
    child: {
      label: "wrong at the parent",
      nums: ["5", "9", "8"],
      info: "even a lazy check catches this",
    },
    single: { label: "one node", nums: ["7"], info: "trivially a BST" },
    duplicate: {
      label: "a repeated value",
      nums: ["5", "5", "8"],
      info: "strictly, so equal fails",
    },
    negatives: {
      label: "negative values",
      nums: ["-5", "-9", "-2"],
      info: "ordinary numbers, ordinary bounds",
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
      info: "valid, four levels deep",
    },
  },
  edges: [
    {
      key: "deep",
      name: "a violation no parent can see",
      example: "[5, 1, 8, ., ., 4, 9] → false, though 4 < 8 and 8 > 5",
      why: "Every node is on the correct side of its own parent, and the tree is still not a BST: 4 sits in 5's right subtree. Any check that only compares a node with its children accepts this, which is the single most common wrong answer to this problem.",
      think:
        "Which ancestor's rule is a node three levels down still obliged to obey?",
      preset: "deep",
      constraint: 2,
    },
    {
      key: "single",
      name: "one node",
      example: "[7] → true",
      why: "A lone node has no ordering to break, so the answer is true — and it must come out of the same code, not a special case. The interval version returns true here because the window is still (−∞, +∞) and 7 is in it.",
      think:
        "Does your base case answer 'true' for nothing, or only for a leaf?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "duplicate",
      name: "a repeated value",
      example: "[5, 5, 8] → false",
      why: "The rule is strict on both sides, so equal is not allowed. A comparison written with <= or >= accepts this tree, and the bug survives every test whose values happen to be distinct.",
      think: "Is your comparison strict, and is it strict in both directions?",
      preset: "duplicate",
      constraint: 2,
    },
    {
      key: "range",
      name: "values reach the integer limits",
      example:
        "a node holding the smallest possible int, with −∞ as its lower bound",
      why: "The starting bounds must sit outside every legal value. Seeding them with the minimum and maximum int makes a legitimate node at that limit compare as out of range — which is why the code says infinity rather than a big number.",
      think:
        "Is your sentinel outside the value range, or merely at the edge of it?",
      preset: "negatives",
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
        "given: a binary tree with at least one node",
        "left subtree: EVERY value strictly smaller than the node",
        "right subtree: EVERY value strictly larger",
        "task: return whether the whole tree obeys that",
      ],
      tools: [
        {
          name: "Binary tree",
          role: "drawn here from level order — the node at i has children 2i+1 and 2i+2, and '.' is an absent node. What makes this problem hard is not the drawing but the word 'every': the rule reaches all the way down.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the rule binds every descendant, not the two children",
        "a tree where each node is on the right side of its own parent can still fail",
        "strictly smaller and strictly larger — equal values break it",
      ],
      quiz: [
        {
          q: "Every node in a tree is on the correct side of its own parent. Is it a BST?",
          choices: [
            "yes — that is the definition",
            "not necessarily: a node can obey its parent and still break a grandparent's rule",
          ],
          answer: 1,
          explain:
            "This is the whole problem. A value in a right subtree must beat the node that subtree hangs off, however many levels up that is.",
        },
      ],
      run: story,
    },
    {
      key: "inorder",
      name: "Flatten it and watch it climb",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk left subtree, node, right subtree — the in-order walk. On a BST that sequence comes out strictly increasing, so remember the previous value and fail the moment one does not beat it.",
      takeaways: [
        "in-order turns the tree into a sequence, and the BST property into 'this list is sorted'",
        "one number of state — the previous value — no matter how big the tree",
        "the deep violation IS caught, because an out-of-place value lands next to the wrong neighbour in the flattened order",
        "but every comparison is between neighbours, so the code never states the rule it is checking",
      ],
      quiz: [
        {
          q: "Why does the deep violation show up in the in-order walk?",
          choices: [
            "because the walk compares each node with its grandparent",
            "because flattening puts the offending value next to a value it must beat and does not",
          ],
          answer: 1,
          explain:
            "The order does the work. That is what makes it correct — and also what makes it fragile: get the traversal order wrong and the check silently means something else.",
        },
      ],
      run: inorder,
    },
    {
      key: "bounds",
      name: "Carry the window down",
      short: "state the rule",
      insight:
        "The flattened walk is correct, but every comparison in it is with a neighbour, so the ancestor rule is enforced by an accident of ordering rather than written anywhere. Say what a node is allowed to be, and the rule stops being implicit.",
      idea: problem.whyNow!,
      takeaways: [
        "each node carries the open interval its ancestors left it: left tightens the top, right tightens the bottom",
        "every ancestor's constraint is present at once, which is exactly what the problem says",
        "the base case is 'nothing is a valid BST', so an absent child needs no test of its own",
        "and the initial bounds must be outside the value range — infinity, not the biggest int",
      ],
      quiz: [
        {
          q: "Walking into a LEFT child, which side of the interval changes?",
          choices: [
            "the lower bound rises to the node's value",
            "the upper bound falls to the node's value",
          ],
          answer: 1,
          explain:
            "Everything to the left must be smaller than this node, so the node's value becomes the new ceiling. The floor is inherited unchanged from above.",
        },
      ],
      run: intervals,
    },
  ],
})
