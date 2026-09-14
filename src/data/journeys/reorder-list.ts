// Fold the List Onto Itself, derived — a LIST journey about the one direction a
// singly linked list refuses to give you. Every rung is a different way to buy
// the BACK of the list: walk to it each time, copy it into an array, or reverse
// half of it in place and let the pointers do it for free.
//
// The stage labels nodes by identity (n0, n1, …) for the same reason swap-pairs
// does: two of the rungs move VALUES between nodes rather than relinking, and
// the row alone cannot tell you which happened.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/reorder-list.ts"

type N = Data<number>

/** first, last, second, second-last, … */
export const folded = <T,>(xs: T[]): T[] => {
  const out: T[] = []
  let lo = 0
  let hi = xs.length - 1
  while (lo <= hi) {
    out.push(xs[lo])
    if (lo !== hi) out.push(xs[hi])
    lo++
    hi--
  }
  return out
}

const idLabels = (order: number[]) =>
  Object.fromEntries(order.map((id, i) => [i, `n${id}`]))

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

/** where the fast/slow walk stops: the end of the FRONT half */
const splitAt = (n: number) => Math.ceil(n / 2) - 1

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "The list has to be folded onto itself: first node, then the last, then the second, then the second-last, and inward until they meet.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Read that ordering again and notice what it asks for. Every other node comes from the BACK of the list, read backwards — which is the one direction a singly linked list will not give you, because a node knows only its successor.",
  }
  const order = nums.map((_, i) => i)
  yield {
    hold: 3,
    list: {
      values: nums,
      label: "as given",
      labels: idLabels(order),
      marks: marksOf(nums.length, (i) =>
        i === 0 ? "focus" : i === nums.length - 1 ? "anchor" : undefined
      ),
    },
    state: [{ label: "becomes", value: folded(nums).join(" → ") }],
    answer: folded(nums),
    corner:
      nums.length === 1
        ? "single"
        : nums.length === 2
          ? "short"
          : nums.length % 2 === 1
            ? "odd"
            : undefined,
    note:
      nums.length <= 2
        ? `${nums.length === 1 ? "One node" : "Two nodes"}: already in the required order, so the answer is the list untouched. This is the case a solution must survive before it does anything clever.`
        : nums.length % 2 === 1
          ? `${nums.join(" → ")} becomes ${folded(nums).join(" → ")}. An odd length, so one node ends up alone in the middle — and it belongs to the FRONT half, which is what decides where the split goes.`
          : `${nums.join(" → ")} becomes ${folded(nums).join(" → ")}. The first and last nodes end up adjacent, which is the pairing to keep in your head.`,
  }
}

// ---- rung 0: recursive fold, walking to the tail every level ----
function* recursiveFold({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  const out: number[] = []
  let walks = 0
  let lo = 0
  let hi = order.length - 1
  while (lo <= hi) {
    walks += Math.max(hi - lo, 0)
    yield {
      line: 5,
      list: {
        values: order.map((id) => nums[id]),
        label: "walking to the tail — again",
        labels: idLabels(order),
        marks: marksOf(order.length, (k) =>
          k === hi ? "anchor" : k === lo ? "focus" : k < lo || k > hi ? "dim" : undefined
        ),
      },
      state: [{ label: "steps walked so far", value: walks }],
      note: `The node after the head has to be the current LAST node, so this level walks from ${nums[order[lo]]} all the way to ${nums[order[hi]]} to find it. Nothing remembers where the tail was last time.`,
    }
    out.push(order[lo])
    if (lo !== hi) out.push(order[hi])
    yield {
      line: 10,
      list: {
        values: out.map((id) => nums[id]),
        label: "the tail spliced in behind the head",
        labels: idLabels(out),
        marks: marksOf(out.length, (k) =>
          k >= out.length - 2 ? "answer" : "dim"
        ),
      },
      state: [{ label: "steps walked so far", value: walks }],
      note:
        lo === hi
          ? `${nums[order[lo]]} is alone in the middle and keeps its place.`
          : `${nums[order[hi]]} now sits directly behind ${nums[order[lo]]}, and the recursion is handed everything still between them.`,
    }
    lo++
    hi--
  }
  yield {
    line: 12,
    answer: out.map((id) => nums[id]),
    list: {
      values: out.map((id) => nums[id]),
      label: "folded, correctly",
      labels: idLabels(out),
    },
    state: [
      { label: "steps walked", value: walks },
      { label: "frames held", value: Math.ceil(nums.length / 2) },
    ],
    note: `Right answer, and it is the statement typed out — which is why it is worth writing once. It paid twice: a walk to the tail at every level, and a stack frame per level. On 5 · 10^4 nodes that is both too slow and too deep.`,
  }
}

// ---- rung 1: index arithmetic, re-walking from the head every time ----
function* byIndex({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  const want = folded(order)
  let steps = 0
  for (let i = 0; i < want.length; i++) {
    steps += want[i]
    yield {
      line: 13,
      list: {
        values: order.map((id) => nums[id]),
        label: "counting forward from the head, every single time",
        labels: idLabels(order),
        marks: marksOf(order.length, (k) =>
          k === want[i] ? "focus" : k < want[i] ? "dim" : undefined
        ),
      },
      state: [
        { label: "position wanted", value: want[i] },
        { label: "steps walked so far", value: steps },
      ],
      note: `Position ${want[i]} is wanted next, and the only way there is from the head: ${want[i]} step${want[i] === 1 ? "" : "s"}. Reaching the back of the list costs the whole list, every time.`,
    }
  }
  yield {
    line: 25,
    answer: want.map((id) => nums[id]),
    list: {
      values: want.map((id) => nums[id]),
      label: "the values written back into the original nodes",
      labels: idLabels(order),
      marks: marksOf(order.length, () => "answer"),
    },
    state: [
      { label: "steps walked", value: steps },
      { label: "nodes moved", value: 0 },
    ],
    note: `The sequence is right — and look at the labels: n0 is still first. This rung REFILLS the nodes instead of relinking them, which the problem forbade. Two faults, one rung: quadratic, and answering a different question.`,
  }
}

// ---- rung 2: copy the values out, write them back folded ----
function* valuesCopy({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  yield {
    line: 4,
    list: {
      values: nums,
      label: "one pass, collecting values",
      labels: idLabels(order),
      marks: marksOf(nums.length, () => "dim"),
    },
    state: [{ label: "extra memory", value: `${nums.length} values` }],
    note: `One walk and the whole list is in an array, where the back is one index away. That is the trade this rung makes: memory for reach.`,
  }
  const want = folded(nums)
  yield {
    line: 13,
    list: {
      values: want,
      label: "written back, front and back alternating",
      labels: idLabels(order),
      marks: marksOf(want.length, () => "answer"),
    },
    state: [
      { label: "extra memory", value: `${nums.length} values` },
      { label: "nodes moved", value: 0 },
    ],
    note: `Linear at last. But the labels have not moved: n0 still holds the first slot. The values were poured into new homes, which is exactly what "the nodes must be relinked" rules out.`,
  }
  yield {
    line: 17,
    answer: want,
    list: { values: want, label: "the right sequence, the wrong mechanism", labels: idLabels(order) },
    state: [{ label: "nodes moved", value: 0 }],
    note: `${want.join(" → ")}. Worth writing to see the shape of the answer — and worth rejecting, because a node here could hold anything, and a caller holding a reference to one would watch its contents change under them.`,
  }
}

// ---- rung 3: collect the NODES, chain from both ends ----
function* nodesBothEnds({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  yield {
    line: 4,
    list: {
      values: nums,
      label: "the nodes themselves, parked in an array",
      labels: idLabels(order),
      marks: marksOf(nums.length, () => "dim"),
    },
    state: [{ label: "extra memory", value: `${nums.length} refs` }],
    note: `The same walk, but it keeps the NODES rather than their contents — so what follows is a genuine relink, not a refill.`,
  }
  const chain: number[] = []
  let lo = 0
  let hi = order.length - 1
  while (lo <= hi) {
    chain.push(order[lo])
    if (lo !== hi) chain.push(order[hi])
    yield {
      line: 15,
      list: {
        values: chain.map((id) => nums[id]),
        label: "chained alternately from the two ends",
        labels: idLabels(chain),
        marks: marksOf(chain.length, (k) =>
          k >= chain.length - 2 ? "focus" : "dim"
        ),
      },
      state: [
        { label: "extra memory", value: `${nums.length} refs` },
        { label: "from the front", value: nums[order[lo]] },
        { label: "from the back", value: lo === hi ? "—" : nums[order[hi]] },
      ],
      note:
        lo === hi
          ? `Only ${nums[order[lo]]} is left, so it is appended alone — the odd middle, handled by the loop rather than by a special case.`
          : `${nums[order[lo]]} from the front, then ${nums[order[hi]]} from the back. The array is doing what the list cannot: handing over the last node without a walk.`,
    }
    lo++
    hi--
  }
  yield {
    line: 20,
    answer: chain.map((id) => nums[id]),
    list: {
      values: chain.map((id) => nums[id]),
      label: "relinked — and the last node terminated",
      labels: idLabels(chain),
      marks: marksOf(chain.length, (k) => (k === chain.length - 1 ? "answer" : undefined)),
    },
    state: [{ label: "extra memory", value: `${nums.length} refs` }],
    note: `Correct, linear, and it really moves nodes. The last line matters more than it looks: without setting the final next to null the tail still points back into the middle of the list, and the list loops forever.`,
  }
}

// ---- rung 4 (optimal): split, reverse the back half, zip ----
function* splitReverseZip({ nums }: N): Generator<DFrame> {
  const order = nums.map((_, i) => i)
  if (nums.length < 3) {
    yield {
      line: 2,
      answer: nums,
      list: { values: nums, label: "already in the required order", labels: idLabels(order) },
      state: [{ label: "extra memory", value: "3 pointers" }],
      note: "One or two nodes are already folded — the guard returns them before any pointer moves.",
    }
    return
  }
  const cut = splitAt(nums.length)
  yield {
    line: 6,
    list: {
      values: nums,
      label: "two walkers: one step, two steps",
      labels: { ...idLabels(order), [cut]: "slow", [Math.min(2 * cut + 1, nums.length - 1)]: "fast" },
      marks: marksOf(nums.length, (k) =>
        k === cut ? "focus" : k === Math.min(2 * cut + 1, nums.length - 1) ? "anchor" : undefined
      ),
    },
    state: [{ label: "extra memory", value: "3 pointers" }],
    note: `One pointer takes a step for every two the other takes, so when the fast one runs out the slow one is at the middle — position ${cut}. The guard is on fast.next.next, which is what leaves an odd middle in the FRONT half.`,
  }
  const front = order.slice(0, cut + 1)
  const back = order.slice(cut + 1)
  yield {
    line: 10,
    list: {
      values: front.map((id) => nums[id]),
      label: "cut in two — this is the front half",
      labels: idLabels(front),
      marks: marksOf(front.length, (k) => (k === front.length - 1 ? "answer" : undefined)),
    },
    state: [
      { label: "front", value: front.map((id) => nums[id]).join(" → ") },
      { label: "back", value: back.map((id) => nums[id]).join(" → ") },
    ],
    note: `The link out of position ${cut} is cut, so the front half now ends properly. Two independent lists, and nothing has been copied.`,
  }
  const rev: number[] = []
  for (const id of back) {
    rev.unshift(id)
    yield {
      line: 14,
      list: {
        values: rev.map((i2) => nums[i2]),
        label: "the back half, reversed in place",
        labels: idLabels(rev),
        marks: marksOf(rev.length, (k) => (k === 0 ? "focus" : "dim")),
      },
      state: [{ label: "extra memory", value: "3 pointers" }],
      note: `${nums[id]} is pointed at what came before it. The back half is being turned around with the pointers it already has — no array, no copy, and this is what buys the backwards walk the problem seemed to forbid.`,
    }
  }
  const out: number[] = []
  for (let i = 0; i < Math.max(front.length, rev.length); i++) {
    if (i < front.length) out.push(front[i])
    if (i < rev.length) out.push(rev[i])
    yield {
      line: 22,
      list: {
        values: out.map((id) => nums[id]),
        label: "zipping the two halves together",
        labels: idLabels(out),
        marks: marksOf(out.length, (k) => (k >= out.length - 2 ? "answer" : "dim")),
      },
      state: [
        { label: "from the front", value: nums[front[Math.min(i, front.length - 1)]] },
        { label: "from the back", value: i < rev.length ? nums[rev[i]] : "—" },
      ],
      note: `One node from each half, alternating. Both nexts are saved before either is overwritten — the same discipline as any in-place relink, and the reason the zip never loses its place.`,
    }
  }
  yield {
    line: 26,
    answer: out.map((id) => nums[id]),
    list: {
      values: out.map((id) => nums[id]),
      label: "folded in place",
      labels: idLabels(out),
    },
    state: [
      { label: "extra memory", value: "3 pointers" },
      { label: "passes", value: 3 },
    ],
    note: `${out.map((id) => nums[id]).join(" → ")}. Three linear passes — find the middle, reverse the back, zip — and not one node copied. The front half is never longer than the back by more than one, which is why the zip runs out cleanly.`,
  }
}

export const reorderList = deriveJourney(problem, {
  slug: "fold-it-onto-itself",
  subtitle: "every other node comes from the back — the one direction the list refuses",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  presets: {
    example: { label: "the example", nums: [1, 2, 3, 4] },
    odd: {
      label: "an odd length",
      nums: [1, 2, 3, 4, 5],
      info: "one node ends up alone in the middle",
    },
    short: {
      label: "two nodes",
      nums: [1, 2],
      info: "already folded",
    },
    single: {
      label: "one node",
      nums: [7],
      info: "nothing to fold onto",
    },
    long: { label: "a longer list", nums: [1, 2, 3, 4, 5, 6, 7, 8] },
  },
  edges: [
    {
      key: "odd",
      name: "an odd number of nodes",
      example: "[1,2,3,4,5] → [1,5,2,4,3]",
      why: "The middle node has no partner and stays put at the end — and it belongs to the FRONT half, which is what decides where the split goes. Split one node later and the halves are the wrong sizes; the zip then runs out early and drops a node.",
      think: "When the two halves are unequal, which one holds the extra node?",
      preset: "odd",
      constraint: 2,
    },
    {
      key: "single",
      name: "a single node",
      example: "[7] → [7]",
      why: "There is no back half to read backwards, so every pointer the fast solution sets up has nothing to point at. It is the case where the guard has to fire before the split, not inside it.",
      think: "Where does your middle-finding walk stop when there is only one node?",
      preset: "single",
      constraint: 3,
    },
    {
      key: "short",
      name: "two nodes",
      example: "[1,2] → [1,2]",
      why: "Already in the required order, so the answer is the list untouched — and the smallest input where a split is even possible. A solution that splits and reverses unconditionally can sever or loop it before noticing there was nothing to do.",
      think: "What does your split do when there is nothing to split?",
      preset: "short",
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
        "given: the head of a singly linked list",
        "reorder it: first, last, second, second-last, …",
        "the NODES are relinked — refilling them with values is a different answer",
        "task: return the head",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "a chain where each node knows only its successor. There is no route backwards, which is the entire difficulty here: every other node of the answer comes from the back.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the fold pairs node i with node n − 1 − i, so the answer reads the back half backwards",
        "a singly linked list has no backwards — whatever solution you pick has to buy that ability",
        "one and two nodes are already folded, and an odd middle belongs to the front half",
      ],
      quiz: [
        {
          q: "Which part of the required order is the hard part?",
          choices: [
            "the first half — reading forward from the head",
            "the second, fourth, sixth… nodes — they come from the back, read backwards",
          ],
          answer: 1,
          explain:
            "Reading forward is what a linked list does. Everything expensive in every rung below is about reaching the back.",
        },
      ],
      run: story,
    },
    {
      key: "recursive",
      name: "Splice the tail in, then recurse",
      short: "the statement, typed out",
      from: 0,
      insight: "",
      idea: problem.alternatives![0].summary,
      takeaways: [
        "it is the problem statement turned into code, which makes it the honest baseline",
        "finding the tail costs a walk of the whole remaining list, at every level",
        "and it holds a frame per level, so a long list runs out of stack before it runs out of patience",
      ],
      run: recursiveFold,
    },
    {
      key: "index",
      name: "Count forward for every position",
      short: "no stack, still quadratic",
      from: 1,
      insight:
        "The recursion's depth was the complaint, so drop it: compute which position is wanted next and walk to it from the head.",
      idea: problem.alternatives![1].summary,
      takeaways: [
        "the stack is gone, and the cost is unchanged — reaching position i still walks i nodes",
        "it writes the values back into the original nodes rather than relinking them",
        "which is the same fault the next rung has, and it is worth naming before it is fixed",
      ],
      run: byIndex,
    },
    {
      key: "values",
      name: "Copy the values out and back",
      short: "linear, and answering a different question",
      from: 2,
      insight:
        "Every walk from the head exists to reach a position the list cannot address. An array can address any position at once — so read the list into one.",
      idea: problem.alternatives![2].summary,
      takeaways: [
        "finally linear: one pass out, one pass back",
        "but it moves VALUES between nodes, which the problem explicitly rules out",
        "watch the node labels on the stage stay exactly where they were",
      ],
      quiz: [
        {
          q: "The row reads 1 → 4 → 2 → 3 afterwards. What is still wrong?",
          choices: [
            "nothing — that is the required order",
            "every node is where it started; only the contents moved, and the problem asked for the nodes",
          ],
          answer: 1,
          explain:
            "With plain integers you cannot see the difference in the output, which is what makes it a trap worth meeting on purpose.",
        },
      ],
      run: valuesCopy,
    },
    {
      key: "nodes",
      name: "Collect the nodes, chain from both ends",
      short: "a real relink, bought with memory",
      from: 3,
      insight:
        "The array was the right idea and the wrong contents. Put the NODES in it and the same two-ended walk becomes a genuine rewiring.",
      idea: problem.alternatives![3].summary,
      takeaways: [
        "linear, and it moves nodes rather than values",
        "it holds a reference to every node — a full second structure beside the list",
        "and the final next must be set to null, or the tail still points into the middle and the list loops",
      ],
      run: nodesBothEnds,
    },
    {
      key: "split",
      name: "Split, reverse the back, zip",
      short: "three passes, three pointers",
      insight:
        "The array is only there to reach the back of the list. Half a list can be reversed in place in one pass — and a reversed back half hands over its last node first, for free.",
      idea: problem.whyNow!,
      takeaways: [
        "find the middle with a one-step and a two-step walker, guarding on fast.next.next so an odd middle stays in the front half",
        "cut, reverse the back half in place, then zip one node from each half",
        "three linear passes and three pointers — no copy of anything",
        "the front half is never more than one node longer than the back, which is what makes the zip end cleanly",
      ],
      quiz: [
        {
          q: "Why reverse the back half instead of indexing it?",
          choices: [
            "it is faster to reverse than to index",
            "a reversed back half hands over its LAST node first — which is exactly the order the fold wants, using pointers the list already has",
          ],
          answer: 1,
          explain:
            "That is the trade in one sentence: one in-place reversal replaces the whole second structure the earlier rungs needed.",
        },
      ],
      run: splitReverseZip,
    },
  ],
})
