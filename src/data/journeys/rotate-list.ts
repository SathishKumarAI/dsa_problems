// Rotate the List to the Right by k, derived. Two things carry this one, and
// both are pictures rather than sentences.
//
// 1. k is enormous (up to 2 * 10^9 against 500 nodes), so the number on the
//    stage has nine digits and the list has five arrangements. The `state` row
//    prints k beside k % n on the rung that first divides, and the difference
//    IS the lesson.
// 2. The final rung joins the tail to the head before it cuts, and that join
//    is drawn: `cycleTo: 0` turns the row into a ring with a back-edge, so the
//    walk to the cut is a walk around a loop and the cut is one link leaving.
//
// The row is the node values; `k` rides along as a param.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/rotate-list.ts"

type R = Data<number> & { k: number }

/** The reference: the last k % n nodes moved to the front. */
export const rotated = (nums: number[], k: number) => {
  const n = nums.length
  if (!n) return []
  const s = ((k % n) + n) % n
  return [...nums.slice(n - s), ...nums.slice(0, n - s)]
}

/** A nine-digit k is unreadable without separators, and it is the whole point. */
const comma = (x: number) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

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

/** head/tail captions, collapsed when one node is both. */
const ends = (n: number) =>
  n === 1 ? { 0: "head · tail" } : { 0: "head", [n - 1]: "tail" }

const plural = (x: number, one: string, many = one + "s") =>
  `${comma(x)} ${x === 1 ? one : many}`

// ---------- act 0: the problem ----------

function* story(d: R): Generator<DFrame> {
  const { nums, k } = d
  const n = nums.length
  yield {
    hold: 3,
    noChips: true,
    note: "A singly linked list and a number k: every node slides k places to the right, and the nodes that fall off the end come back on at the front.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "k is the strange part. The constraints allow it up to 2,000,000,000 against a list of at most 500 nodes, so the distance asked for is routinely millions of times the length of the thing being moved.",
  }
  if (!n) {
    yield {
      hold: 3,
      answer: [],
      corner: "empty",
      note: "No nodes at all, which is legal input: there is nothing to move, the answer is the same empty list, and there is no length to do arithmetic against — code that starts by dividing by the number of nodes divides by zero here.",
    }
    return
  }
  const s = k % n
  const ans = rotated(nums, k)
  yield {
    hold: 3,
    list: view(
      nums,
      "as given",
      marksOf(n, (i) => (s && i >= n - s ? "focus" : undefined)),
      ends(n)
    ),
    state: [
      { label: "nodes", value: n },
      { label: "k", value: comma(k) },
    ],
    note: `${plural(n, "node")} and k = ${comma(k)}. However large k gets, the list has only ${plural(n, "arrangement")} to land in, so a nine-digit k and a one-digit k can name the very same answer.`,
  }
  yield {
    hold: 3,
    list: view(
      ans,
      ans.join(" → "),
      marksOf(n, () => "answer")
    ),
    answer: ans,
    corner: n === 1 ? "single" : s === 0 ? "noop" : k >= n ? "huge" : undefined,
    note:
      n === 1
        ? `One node, and k = ${comma(k)}. Every rotation of a one-node list hands back the same node, so the answer is the input — and this is the case where "the node before the cut" and "the node after it" are the same node.`
        : s === 0
          ? `k = ${comma(k)} on ${plural(n, "node")} lands the list exactly where it started, so the required answer is the untouched list. Handing back something rebuilt, re-linked or merely equal is not the same as handing back what came in.`
          : k >= n
            ? `The answer is ${ans.join(" → ")}. k is bigger than the list, so most of those ${comma(k)} places are laps that undo themselves — and a method whose cost grows with k pays for every one of them to reach one of ${plural(n, "arrangement")}.`
            : `${nums.join(" → ")} becomes ${ans.join(" → ")}: the last ${plural(s, "node")} moved to the front, everything else shifted right, and not one value changed.`,
  }
}

// ---------- act 1: rotate by one, k times ----------

// Five is enough to see the shape and to see it repeating; the point of this
// rung is that k can be two billion, which is a number, not an animation.
const CAP = 5

function* oneStep({ nums, k }: R): Generator<DFrame> {
  const n = nums.length
  if (n < 2) {
    yield {
      line: 3,
      answer: [...nums],
      noChips: n === 0,
      list: n ? view(nums, "nothing to move", { 0: "answer" }, ends(n)) : undefined,
      corner: n === 0 ? "empty" : "single",
      state: [{ label: "k", value: comma(k) }],
      note:
        n === 0
          ? "The guard at the top of the loop body sees no head and returns immediately, so the empty list survives — by luck of where the check sits, not by design."
          : `One node has no node in front of it to hand the tail to, so the same guard returns it unchanged — ${comma(k)} times over, if the loop is entered at all.`,
    }
    return
  }
  let row = [...nums]
  yield {
    line: 1,
    list: view(
      row,
      `k = ${comma(k)} rotations, ${plural(n - 1, "link")} each`,
      undefined,
      ends(n)
    ),
    state: [
      { label: "rotations left", value: comma(k) },
      { label: "steps each", value: n - 1 },
    ],
    note: `The definition read literally: move the last node to the front, and do that ${comma(k)} times. Each of those rotations has to find the last node first, which is a walk over ${plural(n - 1, "link")}.`,
  }
  const shown = Math.min(k, CAP)
  for (let r = 0; r < shown; r++) {
    yield {
      line: 6,
      list: view(
        row,
        "walking to the tail — again",
        marksOf(n, (i) =>
          i === n - 1 ? "focus" : i === n - 2 ? "anchor" : "dim"
        ),
        { [n - 2]: "prev", [n - 1]: "tail" }
      ),
      state: [
        { label: "rotation", value: r + 1 },
        { label: "links walked", value: comma((r + 1) * (n - 1)) },
      ],
      note: `Rotation ${r + 1} starts by walking the whole list to reach ${row[n - 1]} and the node in front of it — the same walk the previous rotation just finished.`,
    }
    row = [row[n - 1], ...row.slice(0, n - 1)]
    yield {
      line: 11,
      list: view(
        row,
        row.join(" → "),
        marksOf(n, (i) => (i === 0 ? "answer" : undefined)),
        ends(n)
      ),
      state: [
        { label: "rotations done", value: r + 1 },
        { label: "rotations left", value: comma(k - r - 1) },
      ],
      note: `${row[0]} is the head now: one link broken, one made. ${
        k - r - 1 > 0
          ? `${plural(k - r - 1, "rotation")} still to go.`
          : "That was the last one."
      }`,
    }
  }
  const ans = rotated(nums, k)
  if (k > shown) {
    yield {
      line: 12,
      answer: ans,
      corner: "huge",
      list: view(
        ans,
        "where it ends up, eventually",
        marksOf(n, () => "answer"),
        ends(n)
      ),
      state: [
        { label: "rotations", value: comma(k) },
        { label: "links walked", value: comma(k * (n - 1)) },
      ],
      note: `The animation stops at ${CAP}; the loop does not. ${plural(k, "rotation")} × ${plural(n - 1, "link")} is ${comma(k * (n - 1))} pointer reads to produce one of ${plural(n, "arrangement")} — and every ${n} rotations put the list back exactly where it was, so nearly all of that work cancels itself out.`,
    }
    return
  }
  yield {
    line: 12,
    answer: ans,
    list: view(
      ans,
      ans.join(" → "),
      marksOf(n, () => "answer"),
      ends(n)
    ),
    state: [
      { label: "rotations", value: comma(k) },
      { label: "links walked", value: comma(k * (n - 1)) },
    ],
    note: `${ans.join(" → ") || "nothing"} — correct, and cheap only because k happened to be small here. The cost is written in k, and k is not bounded by the list.`,
  }
}

// ---------- act 2: values into an array, rebuild ----------

function* viaArray({ nums, k }: R): Generator<DFrame> {
  const n = nums.length
  const vals: number[] = []
  for (let i = 0; i < n; i++) {
    vals.push(nums[i])
    yield {
      line: 4,
      list: view(
        nums,
        `copied: ${vals.length}`,
        marksOf(n, (x) => (x === i ? "focus" : x < i ? "dim" : undefined)),
        { [i]: "reading" }
      ),
      state: [{ label: "array", value: vals.join(", ") }],
      note: `${nums[i]} copied out. One walk gives every value and, for free, the count of them — and the count is the thing k has to be measured against.`,
    }
  }
  if (!n) {
    yield {
      line: 7,
      answer: [],
      noChips: true,
      corner: "empty",
      note: "The array came back empty, so this guard returns before the next line divides by its length. Without it the division is by zero on legal input.",
    }
    return
  }
  const s = k % n
  yield {
    line: 8,
    // no list on this frame: the numbers ARE the picture here, and a frame
    // that draws a shape hides the state row under it
    state: [
      { label: "k", value: comma(k) },
      { label: "n", value: n },
      { label: "k % n", value: s },
    ],
    corner: k >= n && s !== 0 ? "huge" : undefined,
    note: `${comma(k)} places on ${plural(n, "node")} is ${plural(Math.floor(k / n), "full lap")} that change nothing, plus ${plural(s, "place")} that do. k collapses to ${s} here, and it can only collapse once the length is known.`,
  }
  yield {
    line: 10,
    list: view(
      nums,
      s ? `slice at ${n - s}` : "no slice at all",
      marksOf(n, (i) => (s && i >= n - s ? "focus" : "dim")),
      ends(n)
    ),
    state: [
      { label: "k % n", value: s },
      { label: "cut at", value: n - s },
    ],
    corner: n === 1 ? "single" : s === 0 ? "noop" : undefined,
    note: s
      ? `The last ${plural(s, "value")} move to the front and the remaining ${comma(n - s)} follow. On an array that is one expression, which is exactly why it is worth seeing before the pointer version.`
      : `k % n is 0, so the slice is skipped entirely — and it must be, because slicing "the last zero values" reads as the WHOLE array in Python, not the empty one. The guard on this line is not decoration.`,
  }
  const ans = rotated(nums, k)
  yield {
    line: 14,
    answer: ans,
    list: view(
      ans,
      "a brand-new list, built back to front",
      marksOf(n, () => "answer"),
      ends(n)
    ),
    state: [
      { label: "extra memory", value: `${n} values + ${n} nodes` },
      { label: "original nodes", value: "discarded" },
    ],
    note: `${ans.join(" → ")} — right answer, and every node in it is new. A caller still holding one of the original nodes is holding something that is no longer in the list, and a problem about moving pointers has been answered by allocating a second list.`,
  }
}

// ---------- act 3: reverse three times ----------

function* reverseThrice({ nums, k }: R): Generator<DFrame> {
  const n = nums.length
  if (n < 2) {
    yield {
      line: 7,
      answer: [...nums],
      noChips: n === 0,
      list: n ? view(nums, "returned as it is", { 0: "answer" }, ends(n)) : undefined,
      corner: n === 0 ? "empty" : "single",
      note:
        n === 0
          ? "Fewer than two nodes, so nothing is reversed and the empty list goes straight back out. The guard also protects the modulus on the next line."
          : `One node reversed is one node, three times over, so the guard short-circuits it — and it has to, because dividing k by a length of zero is one node away.`,
    }
    return
  }
  yield {
    line: 3,
    list: view(
      nums,
      "counting",
      marksOf(n, () => "dim"),
      ends(n)
    ),
    state: [{ label: "n", value: n }],
    note: `A full walk just to learn there are ${plural(n, "node")}. No pointer is written yet; this pass exists only so k has something to be divided by.`,
  }
  const s = k % n
  yield {
    line: 8,
    state: [
      { label: "k", value: comma(k) },
      { label: "n", value: n },
      { label: "k % n", value: s },
    ],
    corner: k >= n && s !== 0 ? "huge" : undefined,
    note: `k = ${comma(k)} becomes ${s}. The same collapse as before, for the same reason: ${plural(n, "rotation")} is the identity, so only the remainder can matter.`,
  }
  if (s === 0) {
    yield {
      line: 10,
      answer: [...nums],
      corner: "noop",
      list: view(
        nums,
        "returned untouched",
        marksOf(n, () => "answer"),
        ends(n)
      ),
      state: [{ label: "reversals", value: 0 }],
      note: `Nothing moves, so all three reversals are skipped. That branch is load-bearing: reversing the whole list and then reversing the two pieces back is only correct when the split has something on both sides of it.`,
    }
    return
  }
  const all = [...nums].reverse()
  yield {
    line: 13,
    list: view(
      all,
      "the whole list reversed",
      marksOf(n, () => "focus"),
      ends(n)
    ),
    state: [{ label: "passes", value: 1 }],
    note: `${nums.join(" → ")} is now ${all.join(" → ")}. The nodes that had to reach the front are at the front already — in the wrong order, which the next two passes fix.`,
  }
  const front = all.slice(0, s).reverse()
  const rest = all.slice(s)
  yield {
    line: 21,
    list: view(
      [...front, ...rest],
      `the first ${plural(s, "node")} put back in order`,
      marksOf(n, (i) => (i < s ? "answer" : "dim")),
      { [s - 1]: "front tail" }
    ),
    state: [{ label: "passes", value: 2 }],
    note: `${front.join(" → ")} is the piece that moved to the front, now reading forwards again. Its last node has to be remembered here, because it is the node the second piece gets attached to.`,
  }
  const back = [...rest].reverse()
  const ans = [...front, ...back]
  yield {
    line: 29,
    list: view(
      ans,
      `the remaining ${plural(n - s, "node")} reversed too`,
      marksOf(n, (i) => (i >= s ? "answer" : "dim")),
      ends(n)
    ),
    state: [{ label: "passes", value: 3 }],
    note: `${back.join(" → ")} — the third reversal, and every node in the list has now been unlinked and relinked three separate times.`,
  }
  yield {
    line: 34,
    answer: ans,
    list: view(
      ans,
      ans.join(" → "),
      marksOf(n, () => "answer"),
      ends(n)
    ),
    state: [
      { label: "extra memory", value: "none" },
      { label: "pointer writes", value: 2 * n + 1 },
    ],
    note: `${ans.join(" → ")}, with no allocation at all — bought with ${comma(2 * n + 1)} pointer writes and three loops that each have to stop in exactly the right place. Three chances to lose the list for a job that moves it once.`,
  }
}

// ---------- act 4: count, cut, walk back, reattach ----------

function* cutFirst({ nums, k }: R): Generator<DFrame> {
  const n = nums.length
  if (!n) {
    yield {
      line: 2,
      answer: [],
      noChips: true,
      corner: "empty",
      note: "No head, so it returns before the count and before the division. Every approach that divides by the length needs this line; none of them can share it.",
    }
    return
  }
  yield {
    line: 6,
    list: view(
      nums,
      "counting",
      marksOf(n, () => "dim"),
      ends(n)
    ),
    state: [{ label: "n", value: n }],
    note: `One pass to the end: ${plural(n, "node")}. The pointer reaches the last node on the way and then throws that away — remember that it did.`,
  }
  const s = k % n
  yield {
    line: 8,
    state: [
      { label: "k", value: comma(k) },
      { label: "k % n", value: s },
      { label: "cut after", value: s ? n - s : "—" },
    ],
    corner: k >= n && s !== 0 ? "huge" : undefined,
    note: `k = ${comma(k)} collapses to ${s}, so the rotation is a single break in the chain: the link after node ${s ? n - s : n} is the only one that has to go.`,
  }
  if (s === 0) {
    yield {
      line: 10,
      answer: [...nums],
      corner: n === 1 ? "single" : "noop",
      list: view(
        nums,
        "returned untouched",
        marksOf(n, () => "answer"),
        ends(n)
      ),
      state: [{ label: "links changed", value: 0 }],
      note: `Nothing moves, and the whole procedure below is skipped by hand. The branch is here because the walk that follows assumes there is a node on both sides of the break — with nothing to rotate there is not.`,
    }
    return
  }
  const cut = n - s
  yield {
    line: 13,
    list: view(
      nums,
      `${plural(cut - 1, "step")} from the head`,
      marksOf(n, (i) =>
        i === cut - 1 ? "focus" : i === cut ? "anchor" : i < cut ? "dim" : undefined
      ),
      { [cut - 1]: "new tail", [cut]: "new head" }
    ),
    state: [
      { label: "steps", value: cut - 1 },
      { label: "new head", value: nums[cut] },
    ],
    note: `Stop ON ${nums[cut - 1]}, not on ${nums[cut]}: the walk has to end on the node BEFORE the break, because a singly linked node cannot be told to forget the node pointing at it. One step too far and ${nums[cut]} becomes the last node instead of the first.`,
  }
  const frontPiece = nums.slice(0, cut)
  const backPiece = nums.slice(cut)
  yield {
    line: 15,
    list: view(
      frontPiece,
      "the front piece, now ending in ∅",
      marksOf(cut, (i) => (i === cut - 1 ? "focus" : "dim")),
      { [cut - 1]: "ends here" }
    ),
    state: [
      { label: "back piece", value: backPiece.join(" → ") },
      { label: "lists now", value: 2 },
    ],
    note: `The link after ${nums[cut - 1]} is cut and there are two separate lists on the table. The answer is the second one followed by the first — which means the end of the second has to be found before anything can be joined.`,
  }
  yield {
    line: 16,
    list: view(
      backPiece,
      "back at the start of the piece that moves",
      marksOf(backPiece.length, (i) => (i === 0 ? "focus" : undefined)),
      { 0: "walking" }
    ),
    state: [{ label: "extra steps", value: 0 }],
    note: `A third walk begins, over ${plural(backPiece.length, "node")} the first walk already stood on. Nothing was written down about them, so they have to be visited again.`,
  }
  for (let i = 1; i < backPiece.length; i++) {
    yield {
      line: 18,
      list: view(
        backPiece,
        "still looking for the end",
        marksOf(backPiece.length, (x) =>
          x === i ? "focus" : x < i ? "dim" : undefined
        ),
        { [i]: "walking" }
      ),
      state: [{ label: "extra steps", value: i }],
      note: `${backPiece[i]} — ${plural(i, "step")} of re-walking, and the original count pass already touched this node once.`,
    }
  }
  const ans = rotated(nums, k)
  yield {
    line: 19,
    answer: ans,
    list: view(
      ans,
      ans.join(" → "),
      marksOf(n, () => "answer"),
      ends(n)
    ),
    state: [
      { label: "pointer writes", value: 2 },
      { label: "passes", value: 3 },
    ],
    note: `${ans.join(" → ")}. Two pointer writes of genuine work — behind three walks of the list, because the tail was found, dropped, and then hunted for a second time.`,
  }
}

// ---------- act 5 (optimal): close the ring, walk, cut ----------

function* ringCut({ nums, k }: R): Generator<DFrame> {
  const n = nums.length
  if (!n) {
    yield {
      line: 2,
      answer: [],
      noChips: true,
      corner: "empty",
      note: "No head, so it returns here. This guard cannot be dropped: the line that decides where to cut divides by the number of nodes, and there are none.",
    }
    return
  }
  for (let i = 0; i < n; i++) {
    yield {
      line: i === n - 1 ? 7 : 5,
      list: view(
        nums,
        `n = ${i + 1}`,
        marksOf(n, (x) => (x === i ? "focus" : x < i ? "dim" : undefined)),
        { 0: "head", [i]: i === n - 1 ? "tail" : "walking" }
      ),
      state: [{ label: "n", value: i + 1 }],
      note:
        i === n - 1
          ? `${nums[i]}.next is ∅, so this is the tail — and the walk that found it has counted ${plural(n, "node")} on the way. One pass, two facts, and this time the tail is kept.`
          : `${nums[i]} — ${i + 1} counted, and the pointer keeps going.`,
    }
  }
  yield {
    line: 9,
    list: {
      values: nums,
      cycleTo: 0,
      label: "tail.next = head",
      marks: { 0: "anchor", [n - 1]: "focus" },
      labels: ends(n),
    },
    state: [
      { label: "n", value: n },
      { label: "pointer writes", value: 1 },
    ],
    corner: n === 1 ? "single" : undefined,
    note:
      n === 1
        ? "One node pointing at itself — the smallest ring there is, and it behaves like every other: whatever the cut decides, the node that follows the break is this one."
        : `One assignment, and the list has no end: ${nums[n - 1]} points back at ${nums[0]}. Every arrangement the answer could possibly be is already drawn on the stage, so rotating is no longer a rearrangement — it is a choice of which link to break.`,
  }
  const s = k % n
  const steps = n - s
  yield {
    line: 10,
    list: {
      values: nums,
      cycleTo: 0,
      label: `steps = ${n} − ${comma(k)} % ${n} = ${steps}`,
      marks: marksOf(n, (i) => (i === steps % n ? "answer" : undefined)),
      labels: { [steps % n]: "will be the head" },
    },
    state: [
      { label: "k", value: comma(k) },
      { label: "k % n", value: s },
      { label: "steps", value: steps },
    ],
    corner: k >= n && s !== 0 ? "huge" : undefined,
    note: `${comma(k)} places is ${plural(Math.floor(k / n), "lap")} of this ring plus ${plural(s, "step")}, and a lap changes nothing — so the nine-digit k buys exactly ${plural(steps, "step")} of walking. Counting forwards from the head instead of backwards from the tail is what turns ${s} into ${steps}.`,
  }
  for (let i = 0; i < steps; i++) {
    yield {
      line: i === 0 ? 11 : 13,
      list: {
        values: nums,
        cycleTo: 0,
        label: i === 0 ? "new_tail starts at the head" : `${plural(i, "step")} along`,
        marks: marksOf(n, (x) =>
          x === i ? "focus" : x === steps % n ? "answer" : undefined
        ),
        labels: { [i]: "new tail?", [steps % n]: "will be the head" },
      },
      state: [
        { label: "steps", value: steps },
        { label: "taken", value: i },
      ],
      note:
        i === 0
          ? `The walk starts at ${nums[0]} and takes ${plural(steps - 1, "step")} — one fewer than steps, because it has to stop ON the new tail rather than on the node after it.`
          : `${nums[i]} — ${plural(i, "step")} of ${steps - 1}.`,
    }
  }
  const newTail = steps - 1
  const newHead = steps % n
  yield {
    line: 14,
    list: {
      values: nums,
      cycleTo: 0,
      label: "the one link that has to go",
      marks: { [newTail]: "focus", [newHead]: "answer" },
      labels:
        newTail === newHead
          ? { [newHead]: "new head · new tail" }
          : { [newTail]: "new tail", [newHead]: "new head" },
    },
    state: [
      { label: "new tail", value: nums[newTail] },
      { label: "new head", value: nums[newHead] },
    ],
    note:
      newTail === newHead
        ? `The new tail and the new head are the same single node, which is what a one-node ring has to mean.`
        : s === 0
          ? `The walk stopped on ${nums[newTail]} — the node the join was made FROM — and the head after it is still ${nums[newHead]}. The link about to be broken is the one that was just made.`
          : `${nums[newTail]} keeps everything in front of it and ${nums[newHead]} takes over the front. Break the link one node earlier and ${nums[newTail]} leads instead — the classic off-by-one here is not a crash, it is a plausible wrong list.`,
  }
  const ans = rotated(nums, k)
  yield {
    line: 15,
    answer: ans,
    list: view(
      ans,
      ans.join(" → "),
      marksOf(n, () => "answer"),
      ends(n)
    ),
    corner: s === 0 && n > 1 ? "noop" : undefined,
    state: [
      { label: "pointer writes", value: 2 },
      { label: "passes", value: 1 },
    ],
    note:
      s === 0
        ? `steps came out as ${n}, so the cut lands on exactly the link the join just made: the ring is opened where it was closed and the list comes back untouched, with no branch anywhere testing for it.`
        : `${ans.join(" → ")}. One walk, one link made, one link broken — and because the join happened before the cut, there was never a moment with two loose pieces to reunite.`,
  }
}

export const rotateList = deriveJourney<number>(problem, {
  slug: "close-the-ring-then-cut-it",
  subtitle:
    "k is bigger than the list, and the answer is one link away from where you already are",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "nine nodes" },
  params: [{ key: "k", label: "k" }],
  classify: (d) => {
    const k = (d as R).k
    return Number.isInteger(k) && k >= 0 && k <= 2_000_000_000
      ? { ok: true }
      : {
          ok: false,
          warning: "k is a whole number of places to the right, 0 to 2,000,000,000",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 2, 3, 4, 5],
      extra: { k: 2 },
      info: "the last two nodes come to the front",
    },
    wrap: {
      label: "k past the end",
      nums: [0, 1, 2],
      extra: { k: 4 },
      info: "four places on three nodes",
    },
    huge: {
      label: "k = 1,999,999,999",
      nums: [1, 2, 3, 4, 5],
      extra: { k: 1_999_999_999 },
      info: "nine digits of k against five nodes",
    },
    nochange: {
      label: "k is a whole number of laps",
      nums: [1, 2, 3, 4, 5],
      extra: { k: 5 },
      info: "the answer is the input",
    },
    zero: {
      label: "k = 0",
      nums: [1, 2, 3, 4, 5],
      extra: { k: 0 },
      info: "no places at all",
    },
    empty: {
      label: "an empty list",
      nums: [],
      extra: { k: 5 },
      info: "legal input, and no length to divide by",
    },
    single: {
      label: "one node",
      nums: [7],
      extra: { k: 3 },
      info: "the only node is both ends",
    },
    long: {
      label: "nine nodes",
      nums: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      extra: { k: 4 },
      info: "a longer walk to the cut",
    },
  },
  edges: [
    {
      key: "huge",
      name: "k is far larger than the list",
      example: "5 nodes, k = 1,999,999,999 → 1 → 2 → 3 → 4 → 5 becomes 2 → 3 → 4 → 5 → 1",
      why: "k goes up to 2,000,000,000 while the list holds at most 500 nodes, so the same arrangement is named by billions of different k. Any cost that is written in k rather than in the number of nodes does hundreds of millions of times the necessary work, and the length is not known until the list has been walked — so the size of k cannot be dealt with before the first pass finishes.",
      think:
        "How many genuinely different answers exist for a list of n nodes? Now compare that to the range k is allowed to take.",
      preset: "huge",
      constraint: 1,
    },
    {
      key: "noop",
      name: "k lands the list exactly where it started",
      example: "5 nodes, k = 5 (or k = 0, or k = 10) → the list unchanged",
      why: "Rotating by a whole number of lengths is the identity, and the answer must be the list as it came in. Code that splits the list before checking for this ends up joining the front piece to an empty back piece, or returning a node that was never meant to lead.",
      think:
        "What does your split do when the piece that is supposed to move to the front has no nodes in it?",
      preset: "nochange",
      constraint: 4,
    },
    {
      key: "empty",
      name: "no nodes at all",
      example: "[] with k = 5 → []",
      why: "There is no length here, so there is nothing to take a remainder against — the arithmetic that tames a huge k divides by zero on this input. It is legal input, and the answer is the empty list, so the guard has to come before the division rather than after it.",
      think:
        "Which is the first line of your solution that assumes at least one node exists?",
      preset: "empty",
      constraint: 3,
    },
    {
      key: "single",
      name: "one node, which is both ends",
      example: "[7] with k = 3 → [7]",
      why: "The head and the tail are the same node, so any step that treats them as two different nodes has to survive them being one. Every rotation of a one-node list is the identity, however large k is.",
      think:
        "When the head and the tail are the same node, which of your steps are quietly talking about that one node twice?",
      preset: "single",
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
        "given: the head of a singly linked list, and a number k",
        "every node moves k places to the right; what falls off the end returns at the front",
        "k may be as large as 2,000,000,000, and the list as short as 0 nodes",
        "task: return the head of the rotated list",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "a chain where each node knows only the node after it, so the front is reachable from anywhere and nothing is reachable from the back — which is why moving nodes to the FRONT is the easy direction and finding the last one is the expensive one.",
        },
      ],
      hints: [
        "Reread the k. It is not bounded by the length of the list, and that is stated in the constraints rather than implied.",
        "Write down, for a 5-node list, how many genuinely different answers exist. Then write down how many values k can take.",
        "Bring three inputs before any code: the empty list, a plain list with a small k, and a list whose k is enormous.",
      ],
      takeaways: [
        "the output is the input, cut in exactly one place and rejoined the other way round",
        "no value changes: the whole answer is which node the caller is handed",
        "k is unbounded by the list, so the cost must not be written in k",
        "and with no nodes there is no length, which is a case before it is a bug",
      ],
      quiz: [
        {
          q: "A list of 5 nodes. How many different lists can rotating it produce?",
          choices: [
            "as many as k can take — two billion",
            "five, because after five rotations it is back where it started",
          ],
          answer: 1,
          explain:
            "Rotation cycles through exactly n arrangements. Every k beyond that is naming one of the same five answers a second time.",
        },
        {
          q: "What must be returned?",
          choices: [
            "the number of places the nodes moved",
            "the head of the rotated list",
          ],
          answer: 1,
          explain:
            "The caller gets one node and reaches the rest through it, so the whole answer is which node that is — and after a rotation it is almost never the one that came in.",
        },
      ],
      run: story,
    },
    {
      key: "onestep",
      name: "Rotate by one, k times",
      short: "the definition, read literally",
      from: 0,
      insight: "",
      idea: problem.alternatives![0].summary,
      takeaways: [
        "one rotation is easy: find the last node, put it in front",
        "each one costs a full walk, because the last node is the hardest node to reach",
        "the cost is k walks, and k is not bounded by the list",
        "after n rotations the list is identical, so nearly all of that work cancels out",
      ],
      quiz: [
        {
          q: "Why is this hopeless rather than merely slow on 500 nodes and k = 2,000,000,000?",
          choices: [
            "linked lists are slower to traverse than arrays",
            "it performs k walks of the list for an answer that only has n possibilities — a trillion pointer reads to choose one of 500",
          ],
          answer: 1,
          explain:
            "Slow would be a constant factor. This is doing four million times the same 500 rotations, each one undoing the last five hundred.",
        },
      ],
      run: oneStep,
    },
    {
      key: "array",
      name: "Copy the values out and rebuild",
      short: "linear, and a second copy of the list",
      from: 1,
      insight: problem.alternatives![1].whyNow!,
      idea: problem.alternatives![1].summary,
      takeaways: [
        "the length is what turns a nine-digit k into a number smaller than the list",
        "on an array the rotation is one slice, so this is the version to check the others against",
        "it costs memory for every value, and hands back an entirely new set of nodes",
        "slicing 'the last zero values' is the whole array, not the empty one — that guard is real",
      ],
      quiz: [
        {
          q: "k = 1,999,999,999 on 5 nodes. What does k become?",
          choices: ["4", "399,999,999"],
          answer: 0,
          explain:
            "1,999,999,999 = 399,999,999 × 5 + 4. The laps change nothing, so only the remainder is work.",
        },
      ],
      run: viaArray,
    },
    {
      key: "reverse",
      name: "Reverse it, then reverse the pieces",
      short: "no allocation, three passes",
      from: 2,
      insight: problem.alternatives![2].whyNow!,
      idea: problem.alternatives![2].summary,
      takeaways: [
        "reversing the whole list brings the nodes that must move to the front, backwards",
        "reversing each piece separately puts them back in order",
        "no memory at all, and every node unlinked and relinked three times",
        "three loops, three stopping conditions, three chances to lose the list",
      ],
      run: reverseThrice,
    },
    {
      key: "cut",
      name: "Count, then cut and reattach",
      short: "one cut, and a hunt for the old tail",
      from: 3,
      insight: problem.alternatives![3].whyNow!,
      idea: problem.alternatives![3].summary,
      takeaways: [
        "the walk must stop ON the node before the break: a singly linked node cannot be told to forget the node pointing at it",
        "one step too far is not a crash, it is a plausible wrong list",
        "cutting first leaves two loose pieces, and joining them needs the end of the second one",
        "which means a third walk over nodes the counting pass already stood on",
      ],
      quiz: [
        {
          q: "The counting pass reaches the last node. Why does this version have to find it again?",
          choices: [
            "because the cut changed which node is last",
            "because it counted the nodes and kept nothing else — the pointer that stood on the tail was thrown away",
          ],
          answer: 1,
          explain:
            "The information was in its hand and dropped. The cut does change who the last node is, but the piece that needs re-walking is the one the count already crossed.",
        },
      ],
      run: cutFirst,
    },
    {
      key: "ring",
      name: "Close the ring, then cut it once",
      short: "close it, walk it, cut it",
      insight:
        "Cutting first leaves the front piece dangling, and the node it must be attached to is the one the counting walk already touched and let go. Do the attaching while that pointer is still in your hand — before there is anything loose to attach.",
      idea: problem.whyNow!,
      tools: [
        {
          name: "A closed ring",
          role: "the same nodes with the last one pointing at the first. It holds every rotation of the list at once, so the answer stops being a rearrangement and becomes a choice of which link to break.",
        },
      ],
      takeaways: [
        "one walk gives both the length and the tail, and the tail is kept this time",
        "joining the tail to the head is one assignment, made while the pointer is still there",
        "counted forwards from the head, the new head is n − k % n steps along",
        "stop one short of it: the walk ends on the new tail, and the node after it is the answer",
        "k % n == 0 cuts exactly the link the join just made, so the untouched list falls out with no branch",
      ],
      quiz: [
        {
          q: "Why walk n − k % n steps rather than k % n?",
          choices: [
            "they are the same number",
            "k % n counts backwards from the tail, and the only direction a singly linked list can be walked is forwards from the head",
          ],
          answer: 1,
          explain:
            "The last k % n nodes move to the front, so the cut sits that far from the END. Counted from the head it is n − k % n, which is the number the pointer can actually walk.",
        },
        {
          q: "k % n is 0. What happens with no special case for it?",
          choices: [
            "the list comes back with its head and tail swapped",
            "steps is n, so the walk stops on the old tail and the cut breaks the very link the join just made",
          ],
          answer: 1,
          explain:
            "The ring is opened exactly where it was closed. Doing the join before the cut is what makes that identity free instead of a branch.",
        },
      ],
      run: ringCut,
    },
  ],
})
