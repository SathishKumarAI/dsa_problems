// The kth Largest Value, derived. Three rungs, and the argument is about how
// much order you have to build to read one position of it: all of it, none of
// it but a table the size of the value range, or just the k candidates that
// could still win.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/heaps/kth-largest-element.ts"

type N = Data<number> & { k: number }

export const kthLargest = (nums: number[], k: number) =>
  [...nums].sort((a, b) => a - b)[nums.length - k]

// A min-heap small enough to read: sift up on push, sift down on pop. Written
// out rather than faked with a sort, because the whole third rung is the claim
// that each element costs log k.
function push(heap: number[], x: number) {
  heap.push(x)
  let i = heap.length - 1
  while (i > 0) {
    const parent = (i - 1) >> 1
    if (heap[parent] <= heap[i]) break
    ;[heap[parent], heap[i]] = [heap[i], heap[parent]]
    i = parent
  }
}

function pop(heap: number[]) {
  const top = heap[0]
  const last = heap.pop()!
  if (heap.length) {
    heap[0] = last
    let i = 0
    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let small = i
      if (l < heap.length && heap[l] < heap[small]) small = l
      if (r < heap.length && heap[r] < heap[small]) small = r
      if (small === i) break
      ;[heap[small], heap[i]] = [heap[i], heap[small]]
      i = small
    }
  }
  return top
}

function* story({ nums, k }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Put this row in order and read the value ${k} place${k === 1 ? "" : "s"} from the end. That value is the answer — but building the order is the part worth arguing about.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Ranks are counted by POSITION, not by distinct value. In [3, 3, 1] the second largest is 3: the duplicate occupies a rank of its own rather than being folded into the first.",
  }
  const answer = kthLargest(nums, k)
  const ordered = [...nums].sort((a, b) => a - b)
  const at = nums.lastIndexOf(answer)
  yield {
    hold: 3,
    marks: {
      ...(Object.fromEntries(
        nums.map((v, i) => [i, v >= answer ? "focus" : "dim"])
      ) as Record<number, ChipRole>),
      [at]: "answer",
    },
    state: [{ label: `${k} from the end`, value: answer }],
    answer,
    corner:
      k === 1 || k === nums.length
        ? "ends"
        : new Set(nums).size < nums.length
          ? "duplicates"
          : nums.every((v) => v < 0)
            ? "negatives"
            : undefined,
    note:
      k === 1 || k === nums.length
        ? `k is ${k}, which is ${k === 1 ? "the maximum" : "the minimum"} — both ends of the range are legal values of k, so nothing may assume k sits comfortably in the middle. The answer is ${answer}.`
        : new Set(nums).size < nums.length
          ? `Ordered, this row reads ${ordered.join(", ")}, and the answer is ${answer}. A value appears more than once here, and each copy takes its own rank — the ${k}th largest is not the ${k}th DISTINCT largest.`
          : nums.every((v) => v < 0)
            ? `Every value here is below zero and the answer is ${answer}. Rank is about order alone — nothing about magnitude, nothing about sign — so anything seeded with 0, or reasoning about how far from zero a value sits, is answering a different question.`
            : `Ordered, this row reads ${ordered.join(", ")}. The value ${k} from the end is ${answer}.`,
  }
}

function* sortIndex({ nums, k }: N): Generator<DFrame> {
  const ordered = [...nums].sort((a, b) => a - b)
  yield {
    line: 1,
    row: ordered,
    hold: 2,
    state: [{ label: "ordered", value: ordered.join(", ") }],
    note: `Every value put in its place: ${ordered.join(", ")}. All ${nums.length} of them, fully ordered.`,
  }
  const at = ordered.length - k
  yield {
    line: 2,
    row: ordered,
    answer: ordered[at],
    marks: { [at]: "answer" },
    state: [{ label: "index", value: at }],
    note: `Read position ${at} — ${k} from the end: ${ordered[at]}. Correct, and n log n was spent arranging ${nums.length - 1} values whose exact order nobody asked about.`,
  }
}

function* countValues({ nums, k }: N): Generator<DFrame> {
  const low = Math.min(...nums)
  const high = Math.max(...nums)
  const counts = new Array<number>(high - low + 1).fill(0)
  for (const x of nums) counts[x - low] += 1
  yield {
    line: 4,
    hold: 2,
    state: [
      { label: "range", value: `${low}…${high}` },
      { label: "slots", value: counts.length },
    ],
    note: `One tally slot per value from ${low} to ${high} — ${counts.length} of them for ${nums.length} number${nums.length === 1 ? "" : "s"} — and one pass to fill them. No comparisons at all: each value indexes its own slot.`,
  }
  let remaining = k
  for (let value = high; value >= low; value--) {
    const c = counts[value - low]
    remaining -= c
    yield {
      line: 7,
      marks: Object.fromEntries(
        nums.map((v, i) => [i, v === value ? "focus" : "dim"])
      ) as Record<number, ChipRole>,
      state: [
        { label: "value", value },
        { label: "still to skip", value: Math.max(remaining, 0) },
      ],
      note:
        remaining <= 0
          ? `${value} occurs ${c} time${c === 1 ? "" : "s"}, which carries the count past ${k}. The ${k}th largest is ${value}.`
          : `${value} occurs ${c} time${c === 1 ? "" : "s"}; ${remaining} rank${remaining === 1 ? "" : "s"} still to walk down through.`,
    }
    if (remaining <= 0) {
      yield { line: 9, answer: value, note: `Return ${value}.` }
      return
    }
  }
  yield { line: 10, answer: low, note: `Return ${low}.` }
}

function* heapOfK({ nums, k }: N): Generator<DFrame> {
  const heap: number[] = []
  for (let i = 0; i < nums.length; i++) {
    push(heap, nums[i])
    const evicted = heap.length > k ? pop(heap) : null
    yield {
      line: evicted === null ? 6 : 8,
      marks: {
        ...(Object.fromEntries(
          nums.map((_, j) => [j, j <= i ? "dim" : "focus"])
        ) as Record<number, ChipRole>),
        [i]: "answer",
      },
      state: [
        { label: "k largest held", value: [...heap].sort((a, b) => a - b).join(", ") },
        { label: "smallest of them", value: heap[0] },
      ],
      note:
        evicted === null
          ? `${nums[i]} joins — fewer than ${k} values held so far, so everything is still a candidate. The smallest of them is ${heap[0]}.`
          : evicted === nums[i]
            ? `${nums[i]} arrives and is immediately the smallest of the ${k + 1}, so out it goes: it cannot be the ${k}th largest while ${k} bigger values already exist.`
            : `${nums[i]} arrives and pushes ${evicted} out — ${evicted} was the smallest, and now ${k} values beat it. The smallest of what remains is ${heap[0]}.`,
    }
  }
  yield {
    line: 9,
    answer: heap[0],
    state: [
      { label: "k largest", value: [...heap].sort((a, b) => a - b).join(", ") },
      { label: "answer", value: heap[0] },
    ],
    note: `${heap[0]}. The answer is the SMALLEST of the ${k} largest values — that identity is the whole design. Each element cost one push and at most one pop through a structure of size ${k}, and the other ${Math.max(nums.length - k, 0)} values were never ordered against each other at all.`,
  }
}

export const kthLargestElement = deriveJourney(problem, {
  slug: "kth-from-the-end",
  subtitle: "how much order do you have to build to read one position of it",
  reveals: ["heaps"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "k", label: "k" }],
  classify: (d) => {
    const k = d.k as number
    const n = (d.nums as number[]).length
    return Number.isInteger(k) && k >= 1 && k <= n
      ? { ok: true }
      : { ok: false, warning: `k must be between 1 and ${n}` }
  },
  presets: {
    example: {
      label: "the example",
      nums: [3, 2, 1, 5, 6, 4],
      extra: { k: 2 },
    },
    duplicates: {
      label: "with a duplicate",
      nums: [3, 3, 1],
      extra: { k: 2 },
      info: "the repeat takes a rank of its own",
    },
    maximum: {
      label: "k = 1",
      nums: [3, 2, 1, 5, 6, 4],
      extra: { k: 1 },
      info: "the largest value",
    },
    minimum: {
      label: "k = length",
      nums: [3, 2, 1, 5, 6, 4],
      extra: { k: 6 },
      info: "the smallest value",
    },
    negatives: {
      label: "values below zero",
      nums: [-5, -1, -9, -3],
      extra: { k: 2 },
      info: "rank has nothing to do with sign",
    },
    long: {
      label: "a longer row",
      nums: [12, 3, 7, 19, 5, 1, 14, 8, 20, 2, 11, 6],
      extra: { k: 4 },
    },
  },
  edges: [
    {
      key: "duplicates",
      name: "the same value twice",
      example: "[3, 3, 1], k = 2 → 3",
      why: "Each copy occupies a rank of its own, so the 2nd largest is the second 3, not the 1. Anything that de-duplicates first answers 1 here.",
      think: "Are you ranking values, or ranking positions in the sorted order?",
      preset: "duplicates",
      constraint: 2,
    },
    {
      key: "ends",
      name: "k at either extreme",
      example: "k = 1 is the maximum, k = length is the minimum",
      why: "Both are legal, so nothing may assume k sits comfortably inside the range. A structure sized k must cope with holding one value, and with holding every value.",
      think: "Does your approach still behave when k is 1, and when k is the whole row?",
      preset: "maximum",
      constraint: 3,
    },
    {
      key: "negatives",
      name: "every value is negative",
      example: "[-5, -1, -9, -3], k = 2 → -3",
      why: "Rank is about order, not magnitude or sign. Anything seeded with 0, or reasoning about absolute values, answers a different question.",
      think: "What does your answer start at, before any value is read?",
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
        "given: a row of integers and a rank k",
        "imagine the row sorted ascending",
        "the answer is the value k places from the END",
        "duplicates each take a rank of their own",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row whose positions carry no meaning here — only the multiset of values does. What is wanted is one position of the ORDER, not the order itself.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "ranks are by position in sorted order, so duplicates do not merge",
        "k = 1 and k = length are both legal — the extremes are ordinary cases",
        "one position of the order is wanted; building all of it is the thing to avoid",
      ],
      quiz: [
        {
          q: "The row is [3, 3, 1] and k is 2. What is the answer?",
          choices: ["3", "1"],
          answer: 0,
          explain:
            "Sorted, the row is 1, 3, 3. Two places from the end is the second 3 — the duplicate holds a rank rather than collapsing into the first.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Order everything and index",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Sort the row ascending and read the element k places from the end. Two lines, obviously right.",
      takeaways: [
        "n log n comparisons to produce a total order",
        "exactly one position of that order is ever read",
        "everything else it computed is thrown away — that waste is the whole target",
      ],
      run: sortIndex,
    },
    {
      key: "count",
      name: "Tally each value and walk down",
      short: "no comparisons, a table instead",
      from: 1,
      insight:
        "Sorting arranges every element when only a rank is wanted. If each value can index its own slot, no elements need comparing at all — count them, then walk the value range downward until k ranks have been passed.",
      idea: "Tally how many times each value occurs across the whole range, then walk from the largest value downward subtracting counts until the running total reaches k.",
      takeaways: [
        "linear in the row, plus linear in the SPAN of the values",
        "no comparisons at all — the value is the address",
        "and the table is sized by the range, so widely spread values make it unusable",
      ],
      quiz: [
        {
          q: "The row is [1, 1000000000] and k is 1. What does this rung cost?",
          choices: [
            "two steps, it is a tiny row",
            "a table of a billion slots and a walk down through it",
          ],
          answer: 1,
          explain:
            "The cost follows the range, not the count. Two numbers spread a billion apart is the input this approach cannot survive.",
        },
      ],
      run: countValues,
    },
    {
      key: "heap",
      name: "Hold only the k that could still win",
      short: "n log k, k of memory",
      insight:
        "At any moment, only the k largest values seen so far are still candidates — everything else has already been beaten k times over. And among those k, the answer is always the smallest, so what is needed is a structure that surrenders its smallest cheaply.",
      idea: problem.whyNow!,
      takeaways: [
        "the answer, at every moment, is the SMALLEST of the k largest seen so far",
        "so hold exactly k values and evict the smallest whenever a bigger one arrives",
        "each element costs one push and at most one pop, both log k",
        "this is the min-heap, and holding it at size k is what makes 'kth largest' its natural question",
      ],
      quiz: [
        {
          q: "Why a MIN-heap when the question asks for the kth LARGEST?",
          choices: [
            "so the largest value is easy to read",
            "because the thing being evicted, and the eventual answer, are both the smallest of the k kept",
          ],
          answer: 1,
          explain:
            "The k largest are kept; the answer is the weakest of them. A structure whose cheap operation is 'give me the smallest' is exactly the one that both evicts and answers.",
        },
      ],
      run: heapOfK,
    },
  ],
})
