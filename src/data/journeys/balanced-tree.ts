// Is the Tree Balanced?, derived. Level-order slots (./tree-slots.ts).
//
// The whole lesson is one number doing two jobs. The naive version asks for a
// height and asks about balance separately, so it measures the same subtree
// once per ancestor. Letting the height carry a verdict — -1 for "already
// unbalanced below" — folds the two questions into one walk.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import { problem } from "../problems/trees/balanced-tree.ts"
import { asSlots, marksOf, present, wellFormed } from "./tree-slots.ts"

type T = Data<string>

const heightOf = (nums: string[], i: number): number =>
  present(nums, i)
    ? 1 + Math.max(heightOf(nums, 2 * i + 1), heightOf(nums, 2 * i + 2))
    : 0

/** The reference: is every node's pair of subtree heights within one? */
export function isHeightBalanced(nums: string[]): boolean {
  const walk = (i: number): number => {
    if (!present(nums, i)) return 0
    const l = walk(2 * i + 1)
    if (l === -1) return -1
    const r = walk(2 * i + 2)
    if (r === -1) return -1
    if (Math.abs(l - r) > 1) return -1
    return 1 + Math.max(l, r)
  }
  return walk(0) !== -1
}

/** The deepest node where the rule breaks, or -1. */
function firstOffender(nums: string[]) {
  let worst = -1
  const walk = (i: number): number => {
    if (!present(nums, i)) return 0
    const l = walk(2 * i + 1)
    const r = walk(2 * i + 2)
    if (Math.abs(l - r) > 1 && worst === -1) worst = i
    return 1 + Math.max(l, r)
  }
  walk(0)
  return worst
}

function* story({ nums }: T): Generator<DFrame> {
  const answer = isHeightBalanced(nums)
  const bad = firstOffender(nums)
  const live = nums.filter((v) => v !== ".").length
  yield {
    hold: 3,
    noChips: true,
    note: "A binary tree. Is it balanced — meaning at EVERY node, the heights of its two subtrees differ by no more than one?",
  }
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: `height ${heightOf(nums, 0)}`,
      marks: marksOf(nums.length, (i) =>
        present(nums, i) ? "focus" : undefined
      ),
    },
    state: [
      { label: "nodes", value: live },
      { label: "height", value: heightOf(nums, 0) },
    ],
    note: "At every node, not just the root. A tree can be beautifully even at the top and hopelessly lopsided three levels down, and that tree is not balanced.",
  }
  yield {
    hold: 3,
    tree: {
      slots: asSlots(nums),
      label: answer ? "balanced" : `broken at ${nums[bad]}`,
      marks: marksOf(nums.length, (i) =>
        answer
          ? present(nums, i)
            ? "answer"
            : undefined
          : i === bad
            ? "focus"
            : undefined
      ),
    },
    answer,
    corner: !live
      ? "empty"
      : answer
        ? live === 1
          ? "single"
          : undefined
        : bad === 0
          ? "root"
          : "deep",
    note: !live
      ? "An empty tree is balanced, and its height is 0. Both of those are answers rather than special cases, and the second one is what every recursion here bottoms out on."
      : answer
        ? live === 1
          ? "One node: two empty subtrees, both of height 0, difference 0. Balanced."
          : "Balanced: every node has subtree heights within one of each other."
        : bad === 0
          ? `Not balanced, and it fails at the root: its two sides differ by more than one. The cheapest possible failure to find.`
          : `Not balanced — and note WHERE: the rule breaks at ${nums[bad]}, not at the root. The root's own two sides may be perfectly even while a node below it is not, which is why 'at every node' is the whole specification.`,
  }
}

/** Rung 1 — measure the height at every node, separately. */
function* everyNode({ nums }: T): Generator<DFrame> {
  let measurements = 0
  let verdict = true
  function* check(i: number): Generator<DFrame, boolean> {
    if (!present(nums, i)) return true
    const l = heightOf(nums, 2 * i + 1)
    const r = heightOf(nums, 2 * i + 2)
    // heightOf walks the whole subtree, and it is called again at every ancestor
    measurements += l + r === 0 ? 1 : l + r
    if (Math.abs(l - r) > 1) {
      verdict = false
      yield {
        line: 8,
        answer: false,
        tree: {
          slots: asSlots(nums),
          label: `${l} against ${r}`,
          marks: marksOf(nums.length, (k) => (k === i ? "focus" : undefined)),
        },
        state: [
          { label: "at", value: nums[i] },
          { label: "left height", value: l },
          { label: "right height", value: r },
        ],
        corner: i === 0 ? "root" : "deep",
        note: `${nums[i]} has subtrees of height ${l} and ${r}. More than one apart, so the tree is not balanced and the answer is false.`,
      }
      return false
    }
    yield {
      line: 9,
      tree: {
        slots: asSlots(nums),
        label: `${nums[i]}: ${l} vs ${r}`,
        marks: marksOf(nums.length, (k) => (k === i ? "answer" : undefined)),
      },
      state: [
        { label: "at", value: nums[i] },
        { label: "heights measured", value: measurements },
      ],
      note: `${nums[i]} is fine: ${l} against ${r}. To learn that, both subtrees were walked to their leaves — and every node below ${nums[i]} will now be asked the same question, walking those same leaves again.`,
    }
    if (!(yield* check(2 * i + 1))) return false
    return yield* check(2 * i + 2)
  }
  yield {
    line: 1,
    tree: { slots: asSlots(nums), label: "two questions" },
    state: [{ label: "measurements", value: 0 }],
    note: "Two separate ideas: a function that measures a subtree's height, and a check that compares two heights at a node. Both are obviously right, and putting them together is where the cost hides.",
  }
  yield* check(0)
  const answer = isHeightBalanced(nums)
  if (!verdict) return
  yield {
    line: 10,
    answer,
    tree: {
      slots: asSlots(nums),
      label: "balanced",
      marks: marksOf(nums.length, (k) =>
        present(nums, k) ? "answer" : undefined
      ),
    },
    state: [
      { label: "answer", value: String(answer) },
      { label: "nodes re-walked", value: measurements },
    ],
    corner: nums.filter((v) => v !== ".").length <= 1 ? "single" : undefined,
    note: `${answer}, after re-walking ${measurements} nodes. Every node's height was measured once per ancestor above it, so a leaf near the bottom of a deep tree is visited as many times as it has ancestors. That is the shape of the waste.`,
  }
}

/** Rung 2 — one walk, with -1 meaning "already unbalanced". */
function* oneWalk({ nums }: T): Generator<DFrame> {
  let visits = 0
  let bailed = false
  function* walk(i: number): Generator<DFrame, number> {
    if (!present(nums, i)) return 0
    visits++
    const l = yield* walk(2 * i + 1)
    if (l === -1) return -1
    const r = yield* walk(2 * i + 2)
    if (r === -1) return -1
    if (Math.abs(l - r) > 1) {
      bailed = true
      yield {
        line: 8,
        answer: false,
        tree: {
          slots: asSlots(nums),
          label: `${l} against ${r} — stop`,
          marks: marksOf(nums.length, (k) => (k === i ? "focus" : undefined)),
        },
        state: [
          { label: "at", value: nums[i] },
          { label: "heights", value: `${l} · ${r}` },
          { label: "nodes visited", value: visits },
        ],
        corner: i === 0 ? "root" : "deep",
        note: `${nums[i]} is out of balance: ${l} against ${r}. It returns -1 instead of a height, and every ancestor above passes that -1 straight up without looking at anything else. The failure travels; nothing re-checks it.`,
      }
      return -1
    }
    const h = 1 + Math.max(l, r)
    yield {
      line: 9,
      tree: {
        slots: asSlots(nums),
        label: `${nums[i]} is ${h} tall`,
        marks: marksOf(nums.length, (k) => (k === i ? "answer" : undefined)),
      },
      state: [
        { label: "left · right", value: `${l} · ${r}` },
        { label: `height at ${nums[i]}`, value: h },
        { label: "nodes visited", value: visits },
      ],
      corner: Math.abs(l - r) === 1 ? "lopsided" : undefined,
      note:
        Math.abs(l - r) === 1
          ? `${nums[i]} has sides of ${l} and ${r} — off by exactly one, which is ALLOWED. The rule is "no more than one", so this passes; written with ≥ instead of >, it would fail here and on most real trees.`
          : `${nums[i]} is balanced here, and its height is ${h}. That one number is doing two jobs: it is the measurement its parent needs, and the fact that it is not -1 is the verdict its parent needs. Neither is computed twice.`,
    }
    return h
  }
  yield {
    line: 2,
    tree: { slots: asSlots(nums), label: "0 for nothing, -1 for broken" },
    state: [{ label: "convention", value: "-1 = unbalanced" }],
    corner: !present(nums, 0) ? "empty" : undefined,
    note: "One function, one walk. It returns a height — except that it returns -1 when the subtree below is already unbalanced, which is a value no real height can take.",
  }
  yield* walk(0)
  const answer = isHeightBalanced(nums)
  if (bailed) return
  yield {
    line: 12,
    answer,
    tree: {
      slots: asSlots(nums),
      label: "balanced",
      marks: marksOf(nums.length, (k) =>
        present(nums, k) ? "answer" : undefined
      ),
    },
    state: [
      { label: "answer", value: String(answer) },
      { label: "nodes visited", value: visits },
      {
        label: "nodes in the tree",
        value: nums.filter((v) => v !== ".").length,
      },
    ],
    corner: nums.filter((v) => v !== ".").length <= 1 ? "single" : undefined,
    note: `${answer}, having visited ${visits} ${visits === 1 ? "node" : "nodes"} — each exactly once. The height comes back up the recursion, so it never has to be asked for; and because -1 is not a height, one return value carries both the measurement and the verdict.`,
  }
}

export const balancedTree = deriveJourney<string>(problem, {
  slug: "one-number-two-jobs",
  subtitle: "a height that can also say no, and nothing gets measured twice",
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
      label: "balanced",
      nums: ["3", "9", "20", ".", ".", "15", "7"],
      info: "true",
    },
    root: {
      label: "broken at the root",
      nums: ["1", "2", ".", "3", ".", ".", ".", "4"],
      info: "one side is three deep",
    },
    deep: {
      label: "broken further down",
      nums: [
        "1",
        "2",
        "3",
        "4",
        "5",
        ".",
        ".",
        "8",
        ".",
        ".",
        ".",
        ".",
        ".",
        ".",
        ".",
        "9",
      ],
      info: "the root looks fine",
    },
    empty: { label: "an empty tree", nums: ["."], info: "balanced, height 0" },
    single: { label: "one node", nums: ["5"], info: "balanced" },
    lopsided: {
      label: "off by exactly one",
      nums: ["1", "2", "3", "4"],
      info: "allowed — one is not more than one",
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
      info: "a full tree, balanced",
    },
  },
  edges: [
    {
      key: "deep",
      name: "balanced at the root, broken below",
      example:
        "a root whose two sides are even, with a lopsided node three levels down",
      why: "The rule applies at every node. Checking only the root — or only until the first even split — passes trees that are plainly unbalanced, and the mistake looks like a reasonable shortcut.",
      think: "Which nodes does your check actually visit?",
      preset: "deep",
      constraint: 2,
    },
    {
      key: "empty",
      name: "an empty tree",
      example: "nothing → true, height 0",
      why: "Balanced, and height 0. Both matter: the 0 is what makes the arithmetic work one level up, and returning -1 or an error here breaks every tree with a missing child.",
      think: "What height does your function give to nothing?",
      preset: "empty",
      constraint: 2,
    },
    {
      key: "single",
      name: "a single node",
      example: "[5] → true",
      why: "Two absent subtrees, both of height 0, a difference of 0. It is the smallest tree that exercises the base case on both sides at once, and a version that treats an absent child as anything other than height 0 fails here first.",
      think:
        "What height does an absent child report, and does the arithmetic above it still work?",
      preset: "single",
      constraint: 1,
    },
    {
      key: "lopsided",
      name: "off by exactly one",
      example: "heights 2 and 1 → still balanced",
      why: "The rule is 'no more than one', so a difference of exactly one is allowed. A comparison written with >= instead of > rejects most real trees, including every tree with an even number of nodes.",
      think: "Is your test 'greater than one' or 'not equal'?",
      preset: "lopsided",
      constraint: 3,
    },
    {
      key: "root",
      name: "broken at the root",
      example: "a chain hanging off one side → false immediately",
      why: "The cheapest failure there is, and the one that shows the difference between the two rungs: the second stops as soon as -1 appears, while the first has already measured the deep side to learn the same thing.",
      think:
        "When your check fails deep in the tree, what does the rest of the walk do?",
      preset: "root",
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
        "the height of a node is the longest path below it, in nodes",
        "task: return whether at EVERY node the two subtree heights",
        "differ by no more than one",
      ],
      tools: [
        {
          name: "Binary tree",
          role: "level-order slots. The question is about heights, and a height is only knowable by walking to the leaves — which is why the cost of this problem is entirely about how often you walk.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the rule holds at every node, not only the root",
        "a difference of exactly one is allowed; more than one is not",
        "an empty tree is balanced and has height 0",
      ],
      quiz: [
        {
          q: "A root's two subtrees are the same height. Is the tree balanced?",
          choices: [
            "yes — the heights match",
            "not necessarily: some node further down may still break the rule",
          ],
          answer: 1,
          explain:
            "Every node has to satisfy it. A perfectly even root sitting on a lopsided child is the standard counterexample.",
        },
      ],
      run: story,
    },
    {
      key: "measure",
      name: "Measure the height everywhere",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Write a height function. At each node, measure both subtrees and compare; then ask the same of every child.",
      takeaways: [
        "two small ideas, each obviously correct on its own",
        "but the height function walks a whole subtree, and it is called again at every ancestor",
        "so a node near the leaves is visited once for every ancestor it has",
        "which is quadratic on the shapes where the tree is deepest",
      ],
      quiz: [
        {
          q: "Why is this version slow?",
          choices: [
            "the comparison is expensive",
            "measuring a height walks the whole subtree, and every ancestor measures the same subtree again",
          ],
          answer: 1,
          explain:
            "The work is repeated, not intrinsic. Every node's height is computed once per ancestor rather than once.",
        },
      ],
      run: everyNode,
    },
    {
      key: "fold",
      name: "Let the height carry the verdict",
      short: "one walk",
      insight:
        "The height of a subtree is computed over and over because it is asked for from above — and the walk that answers a node's own question already knows everything its parent needs.",
      idea: problem.approach,
      takeaways: [
        "return the height, except return -1 when something below is already unbalanced",
        "-1 is safe precisely because no real height can be negative",
        "an ancestor seeing -1 passes it straight up: the failure travels rather than being rediscovered",
        "every node is visited exactly once, and the height arrives on the way back up",
      ],
      quiz: [
        {
          q: "Why can -1 stand in for 'unbalanced' without ambiguity?",
          choices: [
            "because it is a convention everyone knows",
            "because a height is never negative, so -1 cannot be mistaken for a measurement",
          ],
          answer: 1,
          explain:
            "That is the whole reason this trick is safe. Choose a sentinel a real answer can take, and the two meanings become indistinguishable.",
        },
      ],
      run: oneWalk,
    },
  ],
})
