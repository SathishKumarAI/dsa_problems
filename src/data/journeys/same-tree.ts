// Are Two Trees Identical?, derived. TWO trees in one row of level-order
// tokens, separated by "|" — the shape merge-two-sorted established for two
// structures, reused here so the drawer stays a single field.
//
// The stage draws the two trees stacked as one slot array with a gap between
// them, which is what makes the mirrored pair — [1,2] against [1,.,2] — a
// picture rather than a sentence.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/same-tree/index.ts"
import { GAP, asSlots, present, wellFormed } from "./tree-slots.ts"

type T = Data<string>

const BAR = "|"

/** The row splits at the bar: tree p, then tree q. */
export function twoTrees(nums: string[]) {
  const at = nums.indexOf(BAR)
  return {
    p: nums.slice(0, at === -1 ? nums.length : at),
    q: at === -1 ? [] : nums.slice(at + 1),
  }
}

/** The reference: identical structure AND identical values, everywhere. */
export function sameShape(nums: string[]): boolean {
  const { p, q } = twoTrees(nums)
  const walk = (i: number): boolean => {
    const a = present(p, i)
    const b = present(q, i)
    if (!a && !b) return true
    if (a !== b) return false
    if (p[i] !== q[i]) return false
    return walk(2 * i + 1) && walk(2 * i + 2)
  }
  return walk(0)
}

/** A serialisation that records the empty children, and one that does not. */
const serialise = (slots: string[], i: number, keepGaps: boolean): string => {
  if (!present(slots, i)) return keepGaps ? "#" : ""
  return `(${slots[i]}${serialise(slots, 2 * i + 1, keepGaps)}${serialise(slots, 2 * i + 2, keepGaps)})`
}

/** The first slot where the two trees part company, or -1. */
function firstDifference(p: string[], q: string[]) {
  const walk = (i: number): number => {
    const a = present(p, i)
    const b = present(q, i)
    if (!a && !b) return -1
    if (a !== b || p[i] !== q[i]) return i
    const l = walk(2 * i + 1)
    return l !== -1 ? l : walk(2 * i + 2)
  }
  return walk(0)
}

/** Both trees on one stage: p's slots, a divider, then q's. */
const pair = (
  p: string[],
  q: string[],
  label: string,
  mark?: (side: "p" | "q", i: number) => ChipRole | undefined
) => {
  const slots = [
    ...asSlots(p),
    ...Array.from({ length: 0 }, () => null),
    ...asSlots(q),
  ]
  const marks: Record<number, ChipRole> = {}
  const labels: Record<number, string> = {}
  p.forEach((_, i) => {
    const m = mark?.("p", i)
    if (m) marks[i] = m
  })
  q.forEach((_, i) => {
    const m = mark?.("q", i)
    if (m) marks[p.length + i] = m
  })
  if (present(p, 0)) labels[0] = "p"
  if (present(q, 0)) labels[p.length] = "q"
  return { slots, marks, labels, label }
}

function* story({ nums }: T): Generator<DFrame> {
  const { p, q } = twoTrees(nums)
  const answer = sameShape(nums)
  const at = firstDifference(p, q)
  yield {
    hold: 3,
    noChips: true,
    note: "Two binary trees, and one yes-or-no question: are they the same? Same values, in the same positions, all the way down.",
  }
  yield {
    hold: 3,
    tree: pair(p, q, "p above, q below", (side, i) =>
      present(side === "p" ? p : q, i) ? "focus" : undefined
    ),
    state: [
      { label: "p", value: p.join(" ") || "empty" },
      { label: "q", value: q.join(" ") || "empty" },
    ],
    note: "Both halves of 'same' matter, and the second is the one people drop: the VALUES have to match and so does the SHAPE. A tree holding the same numbers arranged differently is a different tree.",
  }
  const mirrored =
    !answer &&
    [...p, ...q].every((v) => v === GAP || true) &&
    p.filter((v) => v !== GAP).length === q.filter((v) => v !== GAP).length
  yield {
    hold: 3,
    tree: pair(p, q, answer ? "identical" : "not the same", (side, i) =>
      answer
        ? present(side === "p" ? p : q, i)
          ? "answer"
          : undefined
        : i === at
          ? "focus"
          : undefined
    ),
    answer,
    corner: answer
      ? !present(p, 0) && !present(q, 0)
        ? "empty"
        : "identical"
      : mirrored
        ? "shape"
        : !present(p, 0) || !present(q, 0)
          ? "one-empty"
          : "value",
    note: answer
      ? !present(p, 0) && !present(q, 0)
        ? "Two empty trees. Identical — and that is an answer of true, not a case to reject. It is also the base case the recursion below unwinds to on every branch."
        : "Identical: every position holds the same value, and every empty child is empty in both."
      : mirrored
        ? `Not the same, and this is the case worth staring at: both trees hold the same values and the same number of nodes. What differs is WHERE — one has its child on the left, the other on the right. Slot ${at} is where they part.`
        : !present(p, 0) || !present(q, 0)
          ? "One tree is empty and the other is not, so they cannot be the same. Nothing else needs checking, and the answer arrives before any value is read."
          : `Not the same. They first disagree at slot ${at}: ${present(p, at) ? p[at] : "nothing"} against ${present(q, at) ? q[at] : "nothing"}.`,
  }
}

/** Rung 1 — turn each tree into a string and compare the strings. */
function* serialiseBoth({ nums }: T): Generator<DFrame> {
  const { p, q } = twoTrees(nums)
  const sp = serialise(p, 0, true)
  const sq = serialise(q, 0, true)
  const lossyP = serialise(p, 0, false)
  const lossyQ = serialise(q, 0, false)
  yield {
    line: 1,
    tree: pair(p, q, "walking p"),
    state: [{ label: "p as text", value: sp }],
    note: `Write the tree down: a node becomes "(value, then its two children)", and an EMPTY child becomes "#". That # is not decoration — it is the only thing recording shape.`,
  }
  yield {
    line: 3,
    tree: pair(q, [], "walking q"),
    state: [{ label: "q as text", value: sq }],
    note: `And the same for q: ${sq}. Two whole trees have now been read and two whole strings built, before a single comparison has been made.`,
  }
  const answer = sameShape(nums)
  yield {
    line: 6,
    answer,
    tree: pair(p, q, answer ? "the strings match" : "the strings differ", () =>
      answer ? "answer" : "dim"
    ),
    state: [
      { label: "p", value: sp },
      { label: "q", value: sq },
      { label: "same", value: String(answer) },
    ],
    corner: lossyP === lossyQ && sp !== sq ? "shape" : undefined,
    note:
      lossyP === lossyQ && sp !== sq
        ? `${answer}. Now look at what the # bought: WITHOUT the empty children these two serialise to the same string, "${lossyP}", and this rung would answer true on trees that are mirror images. The marker for nothing is what carries the shape.`
        : `${answer}, by string comparison. Correct — and it read both trees in full first, even when the roots already disagree, and it holds two strings as long as the trees.`,
  }
}

/** Rung 2 — compare the two structures directly. */
function* compare({ nums }: T): Generator<DFrame> {
  const { p, q } = twoTrees(nums)
  let visits = 0
  let verdict = true
  function* walk(i: number): Generator<DFrame, boolean> {
    visits++
    const a = present(p, i)
    const b = present(q, i)
    if (!a && !b) return true
    if (a !== b) {
      verdict = false
      yield {
        line: 3,
        answer: false,
        tree: pair(p, q, "one is empty here", (_side, k) =>
          k === i ? "focus" : undefined
        ),
        state: [
          { label: "p", value: a ? p[i] : "nothing" },
          { label: "q", value: b ? q[i] : "nothing" },
        ],
        corner: i === 0 ? "one-empty" : "shape",
        note: `At slot ${i} one tree has a node and the other has nothing. That is a difference in SHAPE, caught without comparing a single value — and it is the case a serialisation only catches if it wrote the empties down.`,
      }
      return false
    }
    if (p[i] !== q[i]) {
      verdict = false
      yield {
        line: 5,
        answer: false,
        tree: pair(p, q, `${p[i]} ≠ ${q[i]}`, (_side, k) =>
          k === i ? "focus" : undefined
        ),
        state: [
          { label: "p", value: p[i] },
          { label: "q", value: q[i] },
        ],
        corner: "value",
        note: `Slot ${i} holds ${p[i]} in one tree and ${q[i]} in the other. The answer is false and the walk stops here — nothing below either node has to be looked at.`,
      }
      return false
    }
    yield {
      line: 6,
      tree: pair(p, q, `both ${p[i]}`, (_side, k) =>
        k === i ? "answer" : k < i ? "dim" : undefined
      ),
      state: [
        { label: "slot", value: i },
        { label: "matched so far", value: visits },
      ],
      note: `Both trees hold ${p[i]} at slot ${i}. Now the same question is asked of the two left subtrees and the two right subtrees — the recursion has exactly the shape of the thing it is checking.`,
    }
    if (!(yield* walk(2 * i + 1))) return false
    return yield* walk(2 * i + 2)
  }
  yield {
    line: 1,
    tree: pair(p, q, "start at both roots"),
    state: [{ label: "verdict", value: "unknown" }],
    note: "Three cases and nothing else: both empty is true, exactly one empty is false, otherwise the values must match and both subtree pairs must match too.",
  }
  yield* walk(0)
  const answer = sameShape(nums)
  if (!verdict) return
  yield {
    line: 6,
    answer,
    tree: pair(p, q, "identical", () => "answer"),
    state: [
      { label: "answer", value: String(answer) },
      { label: "positions compared", value: visits },
    ],
    corner: !present(p, 0) && !present(q, 0) ? "empty" : "identical",
    note: `${answer}, after ${visits} ${visits === 1 ? "position" : "positions"}. No strings were built and nothing was held in memory but the path currently being walked — and on trees that differ at the root, this rung stops after one comparison.`,
  }
}

export const sameTree = deriveJourney<string>(problem, {
  slug: "same-values-same-places",
  subtitle: "shape counts as much as value, and the empties are the shape",
  reveals: ["trees"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "bigger trees" },
  classify: (d) => {
    const nums = d.nums as string[]
    if (nums.filter((t) => t === BAR).length !== 1)
      return { ok: false, warning: "two trees with a single | between them" }
    const { p, q } = twoTrees(nums)
    return wellFormed(p) && wellFormed(q)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "each side is level order, '.' for an absent node, and no node may hang off an absent parent",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["1", "2", "3", BAR, "1", "2", "3"],
      info: "identical",
    },
    shape: {
      label: "same values, mirrored",
      nums: ["1", "2", ".", BAR, "1", ".", "2"],
      info: "false — the shape differs",
    },
    value: {
      label: "one value differs",
      nums: ["1", "2", "3", BAR, "1", "2", "4"],
      info: "false at the last slot",
    },
    empty: {
      label: "both empty",
      nums: [".", BAR, "."],
      info: "true",
    },
    oneEmpty: {
      label: "one empty, one not",
      nums: ["1", BAR, "."],
      info: "false before any value is read",
    },
    rootDiffers: {
      label: "they differ at the root",
      nums: ["9", "2", "3", BAR, "1", "2", "3"],
      info: "one comparison is enough",
    },
    long: {
      label: "bigger trees",
      nums: [
        "4",
        "2",
        "7",
        "1",
        "3",
        "6",
        "9",
        BAR,
        "4",
        "2",
        "7",
        "1",
        "3",
        "6",
        "8",
      ],
      info: "differ in the last leaf",
    },
  },
  edges: [
    {
      key: "shape",
      name: "the same values in a different shape",
      example: "[1, 2] against [1, ., 2] → false",
      why: "Both trees hold 1 and 2, and they are not the same tree: one child hangs left, the other right. Any comparison that looks only at the values — a sorted list, a traversal without the empties — says true here.",
      think: "Does your comparison record where the NOTHING is?",
      preset: "shape",
      constraint: 2,
    },
    {
      key: "empty",
      name: "two empty trees",
      example: "both empty → true",
      why: "True, not a special case to reject. It is also the base case every branch of the recursion terminates on, so getting it wrong breaks every input rather than this one.",
      think: "What does your function return when handed two nothings?",
      preset: "empty",
      constraint: 3,
    },
    {
      key: "one-empty",
      name: "one empty, one not",
      example: "a tree against nothing → false",
      why: "Decided before any value is read. Code that dereferences both nodes to compare their values crashes here instead of answering — which is why the two empty-checks come before the value check, in that order.",
      think: "In what order do your three cases run?",
      preset: "oneEmpty",
      constraint: 3,
    },
    {
      key: "value",
      name: "one value out of place",
      example: "[1, 2, 3] against [1, 2, 4] → false",
      why: "Identical structure and one different number. It is the case that says values are checked at every position, not just at the root or the leaves.",
      think:
        "Do you compare every node, or only the ones the structure forced you to visit?",
      preset: "value",
      constraint: 1,
    },
    {
      key: "identical",
      name: "genuinely the same",
      example: "[1, 2, 3] against [1, 2, 3] → true",
      why: "The only case where the whole of both trees must be visited: a true answer cannot be reached early. Every false answer can stop, and this one cannot, which is the honest worst case.",
      think: "Which answer costs you the full traversal?",
      preset: "example",
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
        "given: two binary trees, either of which may be empty",
        "the same means: same values, in the same positions",
        "so structure counts as much as the numbers do",
        "task: return whether the two are the same",
      ],
      tools: [
        {
          name: "Two binary trees",
          role: "written as two level-order rows with | between them, and drawn one after the other. '.' marks an absent node — and in this problem the absences are half the question.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "same means values AND shape; the same numbers in a different arrangement are a different tree",
        "two empty trees are identical, and that is the base case rather than an exception",
        "one empty against one node is decided before any value is read",
      ],
      quiz: [
        {
          q: "Two trees hold exactly the same numbers. Are they the same tree?",
          choices: [
            "yes — the values are what matter",
            "not necessarily: the same values can hang in different places",
          ],
          answer: 1,
          explain:
            "[1, 2] and [1, ., 2] is the counterexample, and it is one line of input. Structure is half the definition.",
        },
      ],
      run: story,
    },
    {
      key: "serialise",
      name: "Write both down and compare the text",
      short: "the honest one",
      from: "serialise",
      insight: "",
      idea: "Turn each tree into a string that records every value and every empty child, then compare the two strings.",
      takeaways: [
        "it works, and the marker for an empty child is the entire reason it works",
        "leave the empties out and a mirrored pair serialises identically",
        "both trees are read in full before anything is compared, even when the roots already differ",
        "and it holds two strings as long as the trees",
      ],
      quiz: [
        {
          q: "Why must the serialisation record the empty children?",
          choices: [
            "to make the string easier to parse",
            "because without them, two differently shaped trees holding the same values produce the same string",
          ],
          answer: 1,
          explain:
            "The empties ARE the shape. A serialisation that drops them is comparing multisets of values wearing a costume.",
        },
      ],
      run: serialiseBoth,
    },
    {
      key: "compare",
      name: "Ask the same question of both",
      short: "three cases",
      insight:
        "The string version is correct only because it remembered to write down the nothings — an easy detail to get wrong, and one whose absence produces a plausible wrong answer rather than a crash.",
      idea: problem.approach,
      takeaways: [
        "three cases: both empty is true, one empty is false, otherwise values must match and both subtree pairs must match",
        "shape is checked by the emptiness cases, so it can never be silently dropped",
        "short-circuiting means trees that differ at the root cost one comparison",
        "nothing is held but the current path, however large the trees",
      ],
      quiz: [
        {
          q: "Where does this version check that the SHAPES agree?",
          choices: [
            "nowhere — it only compares values",
            "in the emptiness cases: one node against nothing is a shape difference, and it is caught before any value is read",
          ],
          answer: 1,
          explain:
            "That is why the shape cannot be forgotten here. It is not an extra check bolted on; it is the first thing the function does.",
        },
      ],
      run: compare,
    },
  ],
})
