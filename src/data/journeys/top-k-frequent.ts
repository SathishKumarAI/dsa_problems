// Top K Frequent, derived.
//
// Three rungs and no new shape: a row of values, and the counting structures
// in the state line. The lesson is the last step — a count can never exceed n,
// so counts can be ARRAY INDICES, and indexing is what removes the comparison
// sort entirely.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/arrays-hashing/top-k-frequent.ts"

type K = Data<number> & { k: number }

const countsOf = (nums: number[]) => {
  const counts = new Map<number, number>()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  return counts
}

/** The reference, as a SET — the problem says order does not matter. */
export function topK(nums: number[], k: number) {
  const counts = countsOf(nums)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([v]) => v)
    .sort((a, b) => a - b)
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const showCounts = (counts: Map<number, number>) =>
  [...counts.entries()].map(([v, c]) => `${v}×${c}`).join(" ") || "empty"

function* story({ nums, k }: K): Generator<DFrame> {
  const counts = countsOf(nums)
  const answer = topK(nums, k)
  const distinct = counts.size
  yield {
    hold: 3,
    noChips: true,
    note: `A row of numbers and a k of ${k}. Return the ${k} ${k === 1 ? "value that appears" : "values that appear"} most often. Which order they come back in does not matter.`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      counts.get(nums[i]) === Math.max(...counts.values()) ? "focus" : undefined
    ),
    state: [
      { label: "values", value: nums.length },
      { label: "distinct", value: distinct },
      { label: "counts", value: showCounts(counts) },
    ],
    note: `${nums.length} numbers, ${distinct} of them distinct. Counting is the easy half and every version here starts with it — the interesting question is what to do with the counts once you have them.`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      answer.includes(nums[i]) ? "answer" : "dim"
    ),
    state: [
      { label: "k", value: k },
      { label: "answer", value: answer.join(", ") },
    ],
    answer,
    corner:
      k === distinct
        ? "all"
        : nums.length === distinct
          ? "unique"
          : k === 1
            ? "one"
            : "bounded",
    note:
      k === distinct
        ? `k equals the number of distinct values, so every one of them is in the answer and no ranking is needed at all. The upper end of what k is allowed to be.`
        : nums.length === distinct
          ? `Every value appears exactly once, so all the counts tie at 1 and any ${k} of them would do. The problem promises the answer is unique, so an input like this only reaches here when k covers everything.`
          : k === 1
            ? `One value wanted: ${answer.join("")}, which appears ${Math.max(...counts.values())} times.`
            : `${answer.join(", ")} — appearing ${answer.map((v) => counts.get(v)).join(" and ")} times. Note the counts: none of them can exceed ${nums.length}, and that bound turns out to be the whole trick.`,
  }
}

/** Rung 1 — count, then sort the distinct values by count. */
function* sortByCount({ nums, k }: K): Generator<DFrame> {
  const counts = countsOf(nums)
  yield {
    line: 3,
    marks: {},
    state: [{ label: "counts", value: showCounts(counts) }],
    note: "One pass gives every value its count. That part is linear and nothing here will improve on it.",
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const comparisons = Math.ceil(
    counts.size * Math.log2(Math.max(2, counts.size))
  )
  yield {
    line: 4,
    marks: marksOf(nums.length, (i) =>
      sorted.slice(0, k).some(([v]) => v === nums[i]) ? "focus" : "dim"
    ),
    state: [
      { label: "sorted", value: sorted.map(([v, c]) => `${v}×${c}`).join(" ") },
      { label: "comparisons", value: `~${comparisons}` },
    ],
    note: `Sorted by count, then sliced at ${k}. Correct and three lines — and it put the WHOLE list in order to read the first ${k} of it, comparing counts against each other about ${comparisons} times.`,
  }
  const answer = topK(nums, k)
  yield {
    line: 4,
    answer,
    marks: marksOf(nums.length, (i) =>
      answer.includes(nums[i]) ? "answer" : "dim"
    ),
    state: [{ label: "answer", value: answer.join(", ") }],
    corner: k === counts.size ? "all" : undefined,
    note: `${answer.join(", ")}. The ordering of everything below ${k} was computed and thrown away — the price of asking a general-purpose sort for a specific question.`,
  }
}

/** Rung 2 — a heap of size k over the counts. */
function* heapOfK({ nums, k }: K): Generator<DFrame> {
  const counts = countsOf(nums)
  const heap: [number, number][] = []
  yield {
    line: 4,
    marks: {},
    state: [
      { label: "counts", value: showCounts(counts) },
      { label: "heap size", value: 0 },
    ],
    note: `Same counts, and a smaller ambition: keep only the ${k} best seen so far, so nothing below them is ever ordered.`,
  }
  for (const [value, c] of counts.entries()) {
    heap.push([value, c])
    heap.sort((a, b) => a[1] - b[1])
    let evicted: [number, number] | undefined
    if (heap.length > k) evicted = heap.shift()
    yield {
      line: 5,
      marks: marksOf(nums.length, (i) =>
        heap.some(([v]) => v === nums[i]) ? "focus" : "dim"
      ),
      state: [
        { label: "arrived", value: `${value}×${c}` },
        {
          label: "holding",
          value: heap.map(([v, n]) => `${v}×${n}`).join(" "),
        },
      ],
      note: evicted
        ? `${value} appears ${c} times and goes in; the heap held ${k + 1}, so its smallest — ${evicted[0]}×${evicted[1]} — drops out. It can never come back: counts do not change.`
        : `${value} appears ${c} times. The heap holds ${heap.length} of the ${k} it is allowed, so nothing is evicted yet.`,
    }
  }
  const answer = topK(nums, k)
  yield {
    line: 5,
    answer,
    marks: marksOf(nums.length, (i) =>
      answer.includes(nums[i]) ? "answer" : "dim"
    ),
    state: [
      { label: "answer", value: answer.join(", ") },
      { label: "heap size", value: heap.length },
    ],
    corner: k === 1 ? "one" : undefined,
    note: `${answer.join(", ")}. Better than sorting when ${k} is much smaller than the ${counts.size} distinct values — but every count still pays a logarithm on the way in, and the counts are being COMPARED, which the next rung stops doing entirely.`,
  }
}

/** Rung 3 — bucket by count; a count is an index. */
function* buckets({ nums, k }: K): Generator<DFrame> {
  const counts = countsOf(nums)
  const bucket: number[][] = Array.from({ length: nums.length + 1 }, () => [])
  yield {
    line: 4,
    marks: {},
    state: [
      { label: "counts", value: showCounts(counts) },
      { label: "buckets", value: `0 … ${nums.length}` },
    ],
    corner: "bounded",
    note: `Here is the observation the whole rung rests on: a value cannot appear more than ${nums.length} times, because there are only ${nums.length} numbers. So a count is not just a number to compare — it is a legal INDEX into an array of that size.`,
  }
  for (const [value, c] of counts.entries()) {
    bucket[c].push(value)
    yield {
      line: 6,
      marks: marksOf(nums.length, (i) => (nums[i] === value ? "focus" : "dim")),
      state: [
        { label: "value", value },
        { label: `bucket ${c}`, value: bucket[c].join(", ") },
      ],
      note: `${value} appears ${c} ${c === 1 ? "time" : "times"}, so it is dropped into bucket ${c}. No comparison happened — the count picked the slot directly.`,
    }
  }
  const out: number[] = []
  for (let c = nums.length; c >= 1 && out.length < k; c--) {
    if (!bucket[c].length) continue
    for (const v of bucket[c]) {
      if (out.length === k) break
      out.push(v)
    }
    yield {
      line: 10,
      marks: marksOf(nums.length, (i) =>
        out.includes(nums[i]) ? "answer" : "dim"
      ),
      state: [
        { label: "bucket", value: c },
        { label: "collected", value: out.join(", ") },
      ],
      note: `Bucket ${c} holds ${bucket[c].join(", ")} — every value appearing exactly ${c} times. Reading the buckets from the top down visits the counts in descending order for free, because the array index IS the count.`,
    }
  }
  const answer = topK(nums, k)
  yield {
    line: 12,
    answer,
    marks: marksOf(nums.length, (i) =>
      answer.includes(nums[i]) ? "answer" : "dim"
    ),
    state: [
      { label: "answer", value: answer.join(", ") },
      { label: "comparisons between counts", value: 0 },
    ],
    corner: nums.length === counts.size ? "unique" : undefined,
    note: `${answer.join(", ")}, with zero comparisons between counts. The array of buckets costs ${nums.length + 1} slots, most of them empty — that is the trade: memory bounded by n, in exchange for never sorting. It works only because the KEY is bounded, which is the condition to check before reaching for this anywhere else.`,
  }
}

export const topKFrequent = deriveJourney<number>(problem, {
  slug: "a-count-is-an-index",
  subtitle:
    "counts cannot exceed n, so they can be slots rather than comparisons",
  reveals: ["arrays-hashing"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "k", label: "k" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const k = (d as K).k
    const distinct = new Set(nums).size
    if (!nums.length) return { ok: false, warning: "at least one number" }
    return Number.isInteger(k) && k >= 1 && k <= distinct
      ? { ok: true }
      : {
          ok: false,
          warning: `k is at least 1 and at most the number of DISTINCT values (${distinct} here)`,
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [4, 4, 4, 6, 6, 2],
      extra: { k: 2 },
      info: "[4, 6]",
    },
    one: {
      label: "k = 1",
      nums: [5, 3, 5, 5, 3, 9],
      extra: { k: 1 },
      info: "just the most frequent",
    },
    all: {
      label: "k = every distinct value",
      nums: [7, 7, 2, 9],
      extra: { k: 3 },
      info: "no ranking needed",
    },
    unique: {
      label: "everything appears once",
      nums: [1, 2, 3, 4],
      extra: { k: 4 },
      info: "all the counts tie",
    },
    single: {
      label: "one number",
      nums: [9],
      extra: { k: 1 },
      info: "count 1, bucket 1",
    },
    heavy: {
      label: "one value dominates",
      nums: [8, 8, 8, 8, 8, 1, 2],
      extra: { k: 2 },
      info: "bucket 5 and bucket 1",
    },
    long: {
      label: "a longer row",
      nums: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9],
      extra: { k: 3 },
      info: "fifteen numbers",
    },
  },
  edges: [
    {
      key: "bounded",
      name: "a count can never exceed the row's length",
      example: "6 numbers → every count is between 1 and 6",
      why: "This bound is what licenses the bucket array. Reach for the same trick where the key is unbounded — the VALUES rather than their counts, say — and the array is either impossible or enormous.",
      think: "What is the largest index your bucket array can ever need?",
      preset: "heavy",
      constraint: 0,
    },
    {
      key: "all",
      name: "k covers every distinct value",
      example: "three distinct values and k = 3 → all of them",
      why: "The largest legal k. Nothing is ranked, and a loop that stops one bucket early, or that assumes something must be left out, returns a short answer on the boundary.",
      think:
        "Does your collection loop end because it has k, or because it ran out of buckets?",
      preset: "all",
      constraint: 2,
    },
    {
      key: "unique",
      name: "every value appears exactly once",
      example: "[1, 2, 3, 4] → all counts are 1",
      why: "Every count lands in the same bucket, so the answer comes from one slot and the order within it is arbitrary. The problem's promise that the answer is unique is what keeps this from being ambiguous — and it is a promise, not something to verify at runtime.",
      think:
        "What does your code do when the k-th and (k+1)-th counts are equal?",
      preset: "unique",
      constraint: 3,
    },
    {
      key: "one",
      name: "k = 1",
      example: "the single most frequent value",
      why: "The smallest legal k, and the case where the heap holds one element — a version whose sift step assumes two children, or whose slice assumes at least two results, breaks here rather than on a big input.",
      think: "Does anything in your solution assume more than one answer?",
      preset: "one",
      constraint: 2,
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
        "given: a row of numbers, and a k",
        "k is at least 1 and never more than the number of distinct values",
        "task: return the k values that occur most often",
        "the order of the answer does not matter",
      ],
      tools: [
        {
          name: "The row",
          role: "read once to count. After that the row is finished — everything else in this problem happens over the COUNTS, which is a much smaller collection.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "counting is linear and unavoidable; what happens after it is the whole question",
        "a count is bounded by the length of the row",
        "the answer is a set — nothing has to be sorted for the caller's benefit",
      ],
      quiz: [
        {
          q: "The row holds 6 numbers. What is the largest count any value can have?",
          choices: ["unbounded", "6 — there are only 6 numbers to be"],
          answer: 1,
          explain:
            "That bound is the thing to notice. It is what makes a count usable as an array index later.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Count, then sort by count",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Count with a hash map, sort the distinct values by their counts, and take the first k.",
      takeaways: [
        "the counting pass is linear, and every version below keeps it",
        "the sort is the only part costing more than linear",
        "and it orders everything below k, which nobody asked for",
      ],
      run: sortByCount,
    },
    {
      key: "heap",
      name: "Hold only the k best",
      short: "less ordering",
      from: 1,
      insight:
        "Sorting puts every distinct value in order to read the first k of them — and the ordering of everything after k is computed and then discarded.",
      idea: "Keep a min-heap of size k over the counts. Each count goes in; when the heap grows past k, its smallest drops out.",
      takeaways: [
        "nothing below the k best is ever ordered",
        "better than sorting when k is much smaller than the number of distinct values",
        "but every count still pays a logarithm on the way in",
        "and counts are still being compared with each other, which is the thing left to remove",
      ],
      run: heapOfK,
    },
    {
      key: "bucket",
      name: "Let the count pick the slot",
      short: "no comparisons",
      insight:
        "The heap still pays a logarithm per count, and it spends it comparing counts against each other — when a count is a small whole number with a known ceiling.",
      idea: problem.approach,
      takeaways: [
        "bucket[c] holds every value appearing exactly c times — the count IS the index",
        "reading buckets from the top down visits counts in descending order for free",
        "no comparison between counts happens anywhere",
        "it costs an array of n+1 slots, most of them empty, and only works because the key is bounded",
      ],
      quiz: [
        {
          q: "Why can this trick not be used on the VALUES instead of the counts?",
          choices: [
            "it could — values are numbers too",
            "values are unbounded, so the array would have no sensible size; counts are capped by the length of the row",
          ],
          answer: 1,
          explain:
            "Bucketing needs a bounded key. Checking that bound is the first thing to do before reaching for this anywhere else.",
        },
      ],
      run: buckets,
    },
  ],
})
