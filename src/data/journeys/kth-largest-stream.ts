// Kth Largest in a Stream, derived — and the journey that proves the claim
// made when the tree view was built: a binary heap needs no view of its own.
// A heap IS an array read as level-order slots (./tree-slots.ts), so the same
// drawing that shows a binary tree shows the heap, and sift-up is visibly a
// value climbing the picture.
//
// The row is the stream in arrival order; `k` is which largest to report.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/kth-largest-stream/index.ts"

type S = Data<number> & { k: number }

/** The reference: the kth largest value in the whole stream. */
export const kthLargestOf = (nums: number[], k: number) =>
  [...nums].sort((a, b) => b - a)[k - 1]

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

// ---- a min-heap on a plain array, which is what the language's library is ----

const swap = (h: number[], i: number, j: number) => {
  const t = h[i]
  h[i] = h[j]
  h[j] = t
}

/** Push, then climb while the newcomer beats its parent. Returns the path. */
function heapPush(h: number[], x: number) {
  h.push(x)
  const path = [h.length - 1]
  let i = h.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (h[p] <= h[i]) break
    swap(h, i, p)
    i = p
    path.push(i)
  }
  return path
}

/** Pop the root: last value to the top, then sink it. Returns the path down. */
function heapPop(h: number[]) {
  const out = h[0]
  const last = h.pop()!
  const path: number[] = []
  if (h.length) {
    h[0] = last
    let i = 0
    path.push(0)
    for (;;) {
      const l = 2 * i + 1
      const r = 2 * i + 2
      let small = i
      if (l < h.length && h[l] < h[small]) small = l
      if (r < h.length && h[r] < h[small]) small = r
      if (small === i) break
      swap(h, i, small)
      i = small
      path.push(i)
    }
  }
  return { out, path }
}

const asSlots = (h: number[]) => h.map((v) => v as number | string)

function* story({ nums, k }: S): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Numbers arrive one at a time and never stop. After each one, answer the same question: what is the ${k}th largest value seen so far?`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The word that changes everything is 'each'. One answer at the end is easy; an answer after every arrival means whatever you build has to survive the next number without being rebuilt.",
  }
  const sorted = [...nums].sort((a, b) => b - a)
  const answer = kthLargestOf(nums, k)
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      nums[i] === answer ? "answer" : nums[i] > answer ? "focus" : "dim"
    ),
    state: [
      { label: "k", value: k },
      { label: `${k}th largest`, value: answer },
    ],
    answer,
    corner:
      k === 1
        ? "kone"
        : k === nums.length
          ? "kall"
          : nums.length !== new Set(nums).size
            ? "duplicates"
            : nums.some((v) => v < 0)
              ? "negatives"
              : undefined,
    note:
      k === 1
        ? `k is 1, so the question is just 'what is the largest', and the answer is ${answer}. Worth keeping in view: whatever you build must not fall over when it is asked to remember exactly one thing.`
        : k === nums.length
          ? `k equals the number of values, so the ${k}th largest is the smallest of all of them: ${answer}. Everything seen so far matters, and nothing may be discarded yet.`
          : nums.length !== new Set(nums).size
            ? `The ${k}th largest is ${answer}. Note the repeats: ranking counts POSITIONS, not distinct values, so a value appearing twice occupies two of the top ${k} places.`
            : `Sorted, the stream is ${sorted.join(" > ")}, and the ${k}th largest is ${answer}.`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) => (nums[i] >= answer ? "focus" : "dim")),
    state: [{ label: "values above the answer", value: k - 1 }],
    note: `Here is the observation everything else is built on: the dim values can never be the ${k}th largest again. A new arrival only ever pushes values DOWN the ranking, so anything already below the ${k}th place is finished.`,
  }
}

/** Rung 1 — re-sort on every add. */
function* sortPerAdd({ nums, k }: S): Generator<DFrame> {
  const seen: number[] = []
  let sortSteps = 0
  yield {
    line: 3,
    marks: marksOf(nums.length, () => "dim"),
    state: [{ label: "kept", value: 0 }],
    note: "Keep every number that has ever arrived, and answer by sorting the lot each time.",
  }
  for (let i = 0; i < nums.length; i++) {
    seen.push(nums[i])
    const sorted = [...seen].sort((a, b) => a - b)
    sortSteps += Math.ceil(seen.length * Math.log2(Math.max(2, seen.length)))
    const ready = seen.length >= k
    yield {
      line: 7,
      marks: marksOf(nums.length, (j) =>
        j === i ? "focus" : j < i ? "dim" : undefined
      ),
      state: [
        { label: "kept", value: seen.length },
        { label: "sorted", value: sorted.join(" ") },
        ...(ready
          ? [{ label: `${k}th largest`, value: sorted[sorted.length - k] }]
          : []),
      ],
      corner: ready && seen.length === k ? "kall" : undefined,
      note: ready
        ? `${nums[i]} arrives, the whole list is sorted again, and the ${k}th from the end is ${sorted[sorted.length - k]}. Correct — and the sort just re-ordered ${seen.length} values of which ${seen.length - 1} were already in order.`
        : `${nums[i]} arrives. Fewer than ${k} values have been seen, so there is no ${k}th largest to report yet — the question is only legal once ${k} numbers exist.`,
    }
  }
  const answer = kthLargestOf(nums, k)
  yield {
    line: 8,
    answer,
    marks: marksOf(nums.length, (j) => (nums[j] === answer ? "answer" : "dim")),
    state: [
      { label: `${k}th largest`, value: answer },
      { label: "sort work", value: `~${sortSteps} comparisons` },
    ],
    corner: k === 1 ? "kone" : undefined,
    note: `${answer}, and every answer along the way was right. The cost is the giveaway: roughly ${sortSteps} comparisons to answer ${nums.length} questions, because each add throws away an ordering it had just paid for.`,
  }
}

/** Rung 2 — keep the list sorted, insert into place. */
function* sortedInsert({ nums, k }: S): Generator<DFrame> {
  const sorted: number[] = []
  let shifts = 0
  yield {
    line: 4,
    marks: marksOf(nums.length, () => "dim"),
    state: [{ label: "sorted", value: "empty" }],
    note: "Same list, kept in order this time. If it is already sorted, the next number only has to find its place.",
  }
  for (let i = 0; i < nums.length; i++) {
    let at = 0
    while (at < sorted.length && sorted[at] < nums[i]) at++
    sorted.splice(at, 0, nums[i])
    shifts += sorted.length - at - 1
    const ready = sorted.length >= k
    yield {
      line: 7,
      marks: marksOf(nums.length, (j) =>
        j === i ? "focus" : j < i ? "dim" : undefined
      ),
      state: [
        { label: "sorted", value: sorted.join(" ") },
        { label: "shifted", value: sorted.length - at - 1 },
        ...(ready
          ? [{ label: `${k}th largest`, value: sorted[sorted.length - k] }]
          : []),
      ],
      note: ready
        ? `${nums[i]} slots in at position ${at}, pushing ${sorted.length - at - 1} ${sorted.length - at - 1 === 1 ? "value" : "values"} along. The ${k}th largest is ${sorted[sorted.length - k]}, read straight off the end.`
        : `${nums[i]} slots in at position ${at}. Still fewer than ${k} values, so nothing to report.`,
    }
  }
  const answer = kthLargestOf(nums, k)
  yield {
    line: 8,
    answer,
    marks: marksOf(nums.length, (j) => (nums[j] === answer ? "answer" : "dim")),
    state: [
      { label: `${k}th largest`, value: answer },
      { label: "values shifted", value: shifts },
    ],
    corner: nums.length !== new Set(nums).size ? "duplicates" : undefined,
    note: `${answer}, with ${shifts} values shifted along the way instead of a full sort each time. Better — and still linear per add, because keeping ALL of them in order is more than the question asks for. Nothing here ever needed to know the order of the small ones.`,
  }
}

/** Rung 3 — a min-heap holding exactly the k largest. Its root is the answer. */
function* minHeap({ nums, k }: S): Generator<DFrame> {
  const h: number[] = []
  yield {
    line: 5,
    tree: { slots: [], label: "an empty heap" },
    state: [
      { label: "k", value: k },
      { label: "heap size", value: 0 },
    ],
    note: `The heap will never hold more than ${k} values — the ${k} largest seen. Everything else is thrown away as it arrives, because it can never come back.`,
  }
  for (let i = 0; i < nums.length; i++) {
    const path = heapPush(h, nums[i])
    yield {
      line: 11,
      tree: {
        slots: asSlots(h),
        label: `pushed ${nums[i]}`,
        marks: marksOf(h.length, (j) =>
          j === path[path.length - 1]
            ? "focus"
            : path.includes(j)
              ? "dim"
              : undefined
        ),
        labels: { 0: "root" },
      },
      state: [
        { label: "heap size", value: h.length },
        { label: "root", value: h[0] },
      ],
      note:
        path.length > 1
          ? `${nums[i]} goes in at the bottom and climbs ${path.length - 1} ${path.length - 1 === 1 ? "level" : "levels"} while it beats its parent. That climb is the whole cost of an insert: the height of the tree, not its size.`
          : `${nums[i]} goes in at the bottom and stays there — its parent is already smaller, so nothing has to move.`,
    }
    if (h.length > k) {
      const { out, path: down } = heapPop(h)
      yield {
        line: 13,
        tree: {
          slots: asSlots(h),
          label: `evicted ${out}`,
          marks: marksOf(h.length, (j) =>
            j === 0 ? "answer" : down.includes(j) ? "dim" : undefined
          ),
          labels: { 0: `${k}th largest` },
        },
        state: [
          { label: "evicted", value: out },
          { label: "root", value: h[0] },
        ],
        corner: out === nums[i] ? "evict-self" : undefined,
        note:
          out === nums[i]
            ? `The heap held ${k + 1}, so its smallest goes — and the smallest was ${out}, the number that just arrived. A value that cannot make the top ${k} is discarded on the way in, which is exactly what keeps the heap size ${k} rather than ${nums.length}.`
            : `The heap held ${k + 1}, so its smallest, ${out}, is evicted — it has been pushed out of the top ${k} and can never return. The new root, ${h[0]}, is the ${k}th largest.`,
      }
    } else if (h.length === k) {
      yield {
        line: 14,
        tree: {
          slots: asSlots(h),
          label: `${k}th largest = ${h[0]}`,
          marks: marksOf(h.length, (j) => (j === 0 ? "answer" : undefined)),
          labels: { 0: `${k}th largest` },
        },
        state: [{ label: "root", value: h[0] }],
        corner: k === nums.length ? "kall" : k === 1 ? "kone" : undefined,
        note: `The heap now holds exactly ${k} values, so its minimum IS the ${k}th largest: ${h[0]}. No search, no sort — the answer is the root, and the root is where a min-heap keeps its smallest by construction.`,
      }
    }
  }
  const answer = kthLargestOf(nums, k)
  yield {
    line: 14,
    answer,
    tree: {
      slots: asSlots(h),
      label: `${k}th largest = ${h[0]}`,
      marks: marksOf(h.length, (j) => (j === 0 ? "answer" : "dim")),
      labels: { 0: "the answer" },
    },
    state: [
      { label: `${k}th largest`, value: answer },
      { label: "heap size", value: h.length },
      { label: "stream length", value: nums.length },
    ],
    corner: nums.some((v) => v < 0) ? "negatives" : undefined,
    note: `${answer}. The heap ended holding ${h.length} of the ${nums.length} values that arrived — a min-heap of the k largest, whose minimum is the answer to every question asked along the way. Cost per add is the height of a ${k}-node tree, and it does not grow with the length of the stream.`,
  }
}

export const kthLargestStream = deriveJourney<number>(problem, {
  slug: "the-smallest-of-the-big-ones",
  subtitle: "hold k values, throw the rest away as they arrive",
  reveals: ["heaps", "design"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer stream" },
  params: [{ key: "k", label: "k" }],
  classify: (d) => {
    const k = (d as S).k
    return Number.isInteger(k) && k >= 1 && k <= d.nums.length
      ? { ok: true }
      : {
          ok: false,
          warning:
            "k is at least 1 and no more than the number of values — the kth largest is only asked for once k values exist",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [4, 5, 8, 2, 3, 5, 10],
      extra: { k: 3 },
      info: "k = 3",
    },
    kone: {
      label: "k = 1",
      nums: [4, 5, 8, 2, 3],
      extra: { k: 1 },
      info: "just the maximum",
    },
    kall: {
      label: "k = every value",
      nums: [4, 5, 8],
      extra: { k: 3 },
      info: "the smallest of all",
    },
    duplicates: {
      label: "repeated values",
      nums: [5, 5, 5, 2, 8],
      extra: { k: 2 },
      info: "ranking counts positions",
    },
    negatives: {
      label: "negative values",
      nums: [-4, -9, -1, -7, -3],
      extra: { k: 2 },
      info: "no assumption that values are positive",
    },
    descending: {
      label: "arriving largest first",
      nums: [10, 9, 8, 7, 6, 5],
      extra: { k: 3 },
      info: "every newcomer is evicted at once",
    },
    long: {
      label: "a longer stream",
      nums: [4, 5, 8, 2, 3, 5, 10, 1, 9, 6, 7, 12],
      extra: { k: 4 },
      info: "twelve values, heap of 4",
    },
  },
  edges: [
    {
      key: "kone",
      name: "k = 1",
      example: "k = 1 → the largest value seen",
      why: "The heap holds a single value and its root is that value. Code that assumes the heap has children, or that compares a node with a sibling that is not there, breaks on the smallest legal k.",
      think:
        "Does your sift step read a child index without checking it exists?",
      preset: "kone",
      constraint: 0,
    },
    {
      key: "kall",
      name: "k equals the number of values",
      example: "k = 3 on three values → the smallest of them",
      why: "Nothing may be evicted yet: every value seen is in the top k. This is the boundary where 'discard the small ones' must not discard anything, and an off-by-one in the size test throws away the answer.",
      think: "Is your eviction test 'more than k' or 'k or more'?",
      preset: "kall",
      constraint: 3,
    },
    {
      key: "duplicates",
      name: "repeated values",
      example: "[5, 5, 5, 2, 8], k = 2 → 5",
      why: "Ranking counts positions, not distinct values, so three 5s occupy three of the places. A version that de-duplicates on the way in reports the 2nd largest DISTINCT value, which is a different question with the same shape.",
      think: "Does your structure hold values or a set of values?",
      preset: "duplicates",
      constraint: 2,
    },
    {
      key: "negatives",
      name: "negative values",
      example: "[-4, -9, -1, -7, -3], k = 2 → -3",
      why: "Nothing promises the numbers are positive, so a heap seeded with 0 as a floor, or an answer initialised to 0, is wrong before the first comparison.",
      think:
        "Did you initialise anything to zero that should have been initialised to the first value?",
      preset: "negatives",
      constraint: 2,
    },
    {
      key: "evict-self",
      name: "the arrival is evicted immediately",
      example:
        "arriving largest first: each new value is the smallest so far and leaves at once",
      why: "A value can fail to make the top k, and the code must handle 'push then pop the thing just pushed' without special-casing it. Skipping the push when the value looks too small is an optimisation that gets the boundary wrong.",
      think:
        "What happens when the value you just inserted is the one that must go?",
      preset: "descending",
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
        "given: k, and numbers that arrive one at a time",
        "after each arrival, report the kth largest value seen so far",
        "the question is only asked once k values exist",
        "task: answer every time, not just at the end",
      ],
      tools: [
        {
          name: "A stream",
          role: "the row, read left to right as arrivals. What has already gone past cannot be re-read, and what is coming is unknown — so the state you keep between arrivals is the whole design.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is needed after every arrival, so rebuilding from scratch each time is the thing to beat",
        "a value below the current kth largest can never become the kth largest again",
        "so only k values are worth keeping, however long the stream is",
      ],
      quiz: [
        {
          q: "A value arrives that is smaller than the current kth largest. Can it ever become the kth largest later?",
          choices: [
            "yes, once enough larger values arrive",
            "no — new arrivals only push values further down the ranking",
          ],
          answer: 1,
          explain:
            "Nothing is ever removed from the stream, so a value's rank can only get worse. That is what makes throwing it away safe.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Sort it again every time",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Keep every value that has arrived. On each add, append and re-sort, then read the kth from the end.",
      takeaways: [
        "obviously correct, and answers every question the same way",
        "it re-orders values that were already in order, once per arrival",
        "and it keeps the whole stream, when only k of it can ever matter",
      ],
      run: sortPerAdd,
    },
    {
      key: "insert",
      name: "Keep it sorted as you go",
      short: "insert, don't re-sort",
      from: 1,
      insight:
        "Re-sorting on every add throws away an ordering that was already paid for — the list was sorted a moment ago, and one new value cannot have disturbed much of it.",
      idea: "Keep the list in order and put each arrival straight into its place. The kth largest is then always the kth from the end.",
      takeaways: [
        "finding the position is fast; making room for it is not — the values above it all shift",
        "linear per add, with far better constants than a full sort",
        "and it still maintains the order of values that will never be asked about",
      ],
      quiz: [
        {
          q: "Finding the insertion point takes O(log n). Why is the add still linear?",
          choices: [
            "because the search is repeated for each element",
            "because inserting into an array shifts everything above the insertion point along",
          ],
          answer: 1,
          explain:
            "The search is cheap and the shifting is not. That gap is why the next rung stops maintaining a total order at all.",
        },
      ],
      run: sortedInsert,
    },
    {
      key: "heap",
      name: "Hold only the k that matter",
      short: "the root is the answer",
      insight:
        "Both versions above maintain a total order over the whole stream, and the question never asks for one — it asks for a single value. Sorting n things to read one of them is the work to remove.",
      idea: problem.whyNow!,
      takeaways: [
        "a min-heap of size k keeps its smallest at the root, and that smallest IS the kth largest",
        "push then evict if the size passes k — the evicted value is exactly the one that fell out of the top k",
        "cost per add is the height of a k-node tree, and does not grow with the length of the stream",
        "the heap is an array read as level-order slots, which is why it draws as the same tree",
      ],
      quiz: [
        {
          q: "Why a MIN-heap, when the question asks about the largest values?",
          choices: [
            "because a max-heap cannot be size-limited",
            "because the k largest are the survivors, and the one at risk of eviction is the smallest of them — which is also the answer",
          ],
          answer: 1,
          explain:
            "The root has to be the value you both report and evict. In a collection of the k largest, that is the smallest one.",
        },
      ],
      run: minHeap,
    },
  ],
})
