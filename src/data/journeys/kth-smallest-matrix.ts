// kth Smallest in a Sorted Matrix, derived. The matrix arrives flattened with
// its width, like the other grid journeys.
//
// The trap is in the shape of the input: rows and columns are each sorted, and
// the matrix as a whole is NOT. The last value of a row can be larger than the
// first of the next, so "walk it like a sorted list" is wrong on almost every
// matrix and right on the small ones people test with.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/heaps/kth-smallest-matrix.ts"

type M = Data<number> & { cols: number; k: number }

const at = (nums: number[], cols: number, r: number, c: number) =>
  nums[r * cols + c]

/** The reference: the kth smallest value, duplicates counted separately. */
export function kthSmallest(nums: number[], k: number) {
  return [...nums].sort((a, b) => a - b)[k - 1]
}

const grid = (
  nums: number[],
  cols: number,
  label: string,
  mark?: (r: number, c: number) => ChipRole | undefined
) => {
  const rows = nums.length / cols
  const cells: number[][] = []
  const marks: Record<string, ChipRole> = {}
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let c = 0; c < cols; c++) {
      row.push(at(nums, cols, r, c))
      const m = mark?.(r, c)
      if (m) marks[`${r},${c}`] = m
    }
    cells.push(row)
  }
  return { cells, marks, label }
}

const sortedBoth = (nums: number[], cols: number) => {
  const rows = nums.length / cols
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (c && at(nums, cols, r, c - 1) > at(nums, cols, r, c)) return false
      if (r && at(nums, cols, r - 1, c) > at(nums, cols, r, c)) return false
    }
  return true
}

function* story({ nums, cols, k }: M): Generator<DFrame> {
  const answer = kthSmallest(nums, k)
  const flatSorted = nums.every((v, i) => i === 0 || nums[i - 1] <= v)
  yield {
    hold: 3,
    noChips: true,
    note: `A matrix whose rows are each sorted and whose columns are each sorted. Return the ${k}th smallest value in the whole thing, counting duplicates as separate values.`,
  }
  yield {
    hold: 3,
    grid: grid(nums, cols, "sorted both ways", (_r, c) =>
      c === 0 ? "anchor" : undefined
    ),
    state: [
      { label: "cells", value: nums.length },
      { label: "k", value: k },
    ],
    corner: flatSorted ? undefined : "notflat",
    note: flatSorted
      ? "Rows sorted, columns sorted — and on this particular matrix reading it row by row happens to give one sorted sequence. That is a coincidence of the values, not a property of the shape."
      : `Rows sorted, columns sorted — and reading it row by row does NOT give a sorted sequence: ${at(nums, cols, 0, cols - 1)} at the end of the first row is larger than ${at(nums, cols, 1, 0)} at the start of the second. The two sortednesses are local, and treating the flattened matrix as one sorted list is the first wrong turn.`,
  }
  const sorted = [...nums].sort((a, b) => a - b)
  yield {
    hold: 3,
    grid: grid(nums, cols, `${k}th smallest: ${answer}`, (r, c) =>
      at(nums, cols, r, c) === answer
        ? "answer"
        : at(nums, cols, r, c) < answer
          ? "dim"
          : undefined
    ),
    state: [
      { label: "answer", value: answer },
      { label: "k", value: k },
    ],
    answer,
    corner:
      k === 1
        ? "first"
        : k === nums.length
          ? "last"
          : sorted.filter((v) => v === answer).length > 1
            ? "duplicates"
            : "notflat",
    note:
      k === 1
        ? `k is 1, so the answer is the smallest value overall — and on a matrix sorted both ways that is always the top-left corner, ${answer}, with no searching at all.`
        : k === nums.length
          ? `k covers every cell, so the answer is the largest: ${answer}, the bottom-right corner. The other end of the same guarantee.`
          : sorted.filter((v) => v === answer).length > 1
            ? `${answer}. It appears more than once, and that matters: the ${k}th smallest counts POSITIONS, so duplicates each take a place. It is a rank among cells, not among distinct values.`
            : `${answer}, the ${k}th value once every cell is in order.`,
  }
}

/** Rung 1 — flatten and sort. */
function* flattenSort({ nums, cols, k }: M): Generator<DFrame> {
  const values: number[] = []
  yield {
    line: 1,
    grid: grid(nums, cols, "collecting"),
    state: [{ label: "collected", value: 0 }],
    note: "Forget the shape entirely: tip every value into one list, sort it, and index.",
  }
  for (let i = 0; i < nums.length; i++) {
    values.push(nums[i])
    if (
      i % Math.max(1, Math.floor(nums.length / 4)) === 0 ||
      i === nums.length - 1
    )
      yield {
        line: 4,
        grid: grid(nums, cols, `${values.length} of ${nums.length}`, (r, c) =>
          r * cols + c <= i ? "dim" : undefined
        ),
        state: [{ label: "collected", value: values.length }],
        note: `${values.length} values collected. Every cell is read, whatever k is — including the ones far larger than the answer.`,
      }
  }
  const answer = kthSmallest(nums, k)
  const sorted = [...values].sort((a, b) => a - b)
  yield {
    line: 5,
    answer,
    grid: grid(nums, cols, `${answer}`, (r, c) =>
      at(nums, cols, r, c) === answer ? "answer" : "dim"
    ),
    state: [
      { label: "sorted", value: sorted.join(" ") },
      { label: "answer", value: answer },
      {
        label: "comparisons",
        value: `~${Math.ceil(nums.length * Math.log2(Math.max(2, nums.length)))}`,
      },
    ],
    corner: k === 1 ? "first" : k === nums.length ? "last" : undefined,
    note: `${answer}, by sorting all ${nums.length} values to read position ${k}. It throws away the sortedness the input already had and rebuilds it — and it does the same work whether k is 1 or ${nums.length}.`,
  }
}

/** Rung 2 — a heap of row fronts. */
function* heapFronts({ nums, cols, k }: M): Generator<DFrame> {
  const rows = nums.length / cols
  // heap entries as [value, row, column], kept ordered by value
  const heap: [number, number, number][] = []
  for (let r = 0; r < rows; r++) heap.push([at(nums, cols, r, 0), r, 0])
  heap.sort((a, b) => a[0] - b[0])
  let popped = 0
  let value = 0
  yield {
    line: 4,
    grid: grid(nums, cols, `${rows} row fronts`, (_r, c) =>
      c === 0 ? "focus" : undefined
    ),
    state: [
      { label: "heap", value: heap.map((h) => h[0]).join(" ") },
      { label: "k", value: k },
    ],
    note: `The smallest value not yet taken is always at the front of some row — never in the middle of one, because the rows are sorted. So only ${rows} cells are ever candidates, and a heap of that size holds all of them.`,
  }
  while (popped < k) {
    heap.sort((a, b) => a[0] - b[0])
    const [v, r, c] = heap.shift()!
    value = v
    popped++
    const pushed = c + 1 < cols
    if (pushed) heap.push([at(nums, cols, r, c + 1), r, c + 1])
    yield {
      line: pushed ? 10 : 8,
      grid: grid(nums, cols, `pop ${popped}: ${v}`, (rr, cc) =>
        rr === r && cc === c
          ? "answer"
          : pushed && rr === r && cc === c + 1
            ? "focus"
            : heap.some(([, hr, hc]) => hr === rr && hc === cc)
              ? "anchor"
              : undefined
      ),
      state: [
        { label: "popped", value: `${popped} of ${k}` },
        { label: "value", value: v },
        { label: "heap", value: heap.map((h) => h[0]).join(" ") || "empty" },
      ],
      corner: popped === 1 ? "first" : undefined,
      note: pushed
        ? `${v} is the smallest anywhere, so it comes out — and its replacement is the cell to its RIGHT, ${at(nums, cols, r, c + 1)}. That is the only candidate that row can offer next, because the row is sorted.`
        : `${v} comes out, and its row is finished — nothing is pushed back. The heap shrinks, and it never held more than ${rows} entries.`,
    }
    if (!heap.length) break
  }
  const answer = kthSmallest(nums, k)
  yield {
    line: 11,
    answer,
    grid: grid(nums, cols, `${answer}`, (r, c) =>
      at(nums, cols, r, c) === answer ? "answer" : undefined
    ),
    state: [
      { label: "answer", value: value },
      { label: "cells touched", value: popped + rows },
      { label: "cells in the matrix", value: nums.length },
    ],
    corner:
      k === nums.length
        ? "last"
        : [...nums].sort((a, b) => a - b).filter((v) => v === answer).length > 1
          ? "duplicates"
          : "notflat",
    note: `${value}, after ${popped} ${popped === 1 ? "pop" : "pops"} and touching about ${popped + rows} of the ${nums.length} cells. The far corner of the matrix was never read — which is the whole point when k is small, and exactly the work the sort could not avoid.`,
  }
}

export const kthSmallestMatrix = deriveJourney<number>(problem, {
  slug: "the-front-of-every-row",
  subtitle: "sorted rows mean only n cells can be next",
  reveals: ["heaps"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger matrix" },
  params: [
    { key: "cols", label: "width" },
    { key: "k", label: "k" },
  ],
  classify: (d) => {
    const nums = d.nums as number[]
    const { cols, k } = d as M
    if (!Number.isInteger(cols) || cols < 1 || nums.length % cols !== 0)
      return { ok: false, warning: "the width must divide the number of cells" }
    if (!sortedBoth(nums, cols))
      return {
        ok: false,
        warning: "every row and every column must be sorted ascending",
      }
    return Number.isInteger(k) && k >= 1 && k <= nums.length
      ? { ok: true }
      : {
          ok: false,
          warning: `k is from 1 to the number of cells (${nums.length})`,
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 5, 9, 10, 11, 13, 12, 13, 15],
      extra: { cols: 3, k: 8 },
      info: "the answer is 13",
    },
    notflat: {
      label: "rows sorted, matrix not",
      nums: [1, 9, 2, 10],
      extra: { cols: 2, k: 3 },
      info: "9 comes before 2",
    },
    first: {
      label: "k = 1",
      nums: [1, 5, 9, 10, 11, 13, 12, 13, 15],
      extra: { cols: 3, k: 1 },
      info: "always the top-left",
    },
    last: {
      label: "k = every cell",
      nums: [1, 5, 9, 10, 11, 13, 12, 13, 15],
      extra: { cols: 3, k: 9 },
      info: "always the bottom-right",
    },
    duplicates: {
      label: "repeated values",
      nums: [1, 2, 2, 3],
      extra: { cols: 2, k: 3 },
      info: "rank counts positions",
    },
    single: {
      label: "one cell",
      nums: [-5],
      extra: { cols: 1, k: 1 },
      info: "the smallest legal matrix",
    },
    long: {
      label: "a bigger matrix",
      nums: [1, 3, 5, 7, 2, 4, 6, 8, 5, 6, 9, 11, 7, 9, 12, 14],
      extra: { cols: 4, k: 7 },
      info: "four by four",
    },
  },
  edges: [
    {
      key: "notflat",
      name: "sorted rows do not make a sorted matrix",
      example: "[[1, 9], [2, 10]] — 9 sits before 2 when read row by row",
      why: "Each row and each column is ordered, and the flattened sequence is not. Treating the matrix as one sorted list — binary searching the flattened index, say — is wrong on most matrices and right on the tidy small ones people try first.",
      think:
        "Is the last value of a row always smaller than the first of the next?",
      preset: "notflat",
      constraint: 2,
    },
    {
      key: "duplicates",
      name: "repeated values",
      example: "[[1, 2], [2, 3]] with k = 3 → 2",
      why: "The kth smallest is a POSITION, not a distinct rank, so both 2s take a place. A version that de-duplicates on the way in answers a different question and returns 3 here.",
      think: "Does your k count cells or distinct values?",
      preset: "duplicates",
      constraint: 3,
    },
    {
      key: "first",
      name: "k = 1",
      example: "the smallest value is always the top-left corner",
      why: "Sorted rows and columns mean nothing can beat cell [0][0]. It is the boundary where the heap pops once and stops, and where a loop written to run k − 1 times does nothing at all.",
      think: "How many pops before you have the answer for k = 1?",
      preset: "first",
      constraint: 0,
    },
    {
      key: "last",
      name: "k = every cell",
      example: "k = n² → the bottom-right corner",
      why: "Every cell must be visited, so the heap version has no advantage left — it is the input where it degenerates to the same work as sorting, plus a heap. Worth knowing which end of k you are optimising for.",
      think: "At what k does the fast version stop being faster?",
      preset: "last",
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
        "given: a matrix whose every row and every column is sorted ascending",
        "the matrix as a whole is NOT one sorted sequence",
        "task: return the kth smallest value in it",
        "duplicates count separately, so k is a position",
      ],
      tools: [
        {
          name: "The matrix",
          role: "a flat row plus a width. What matters is where the sortedness lives: along each row and down each column, and nowhere else.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "rows and columns are sorted; the flattened matrix is not",
        "the smallest value not yet taken is always at the front of some row",
        "k counts positions, so duplicates each take one",
      ],
      quiz: [
        {
          q: "Reading the matrix row by row, is the result sorted?",
          choices: [
            "yes — every row is sorted",
            "no: the end of one row can be larger than the start of the next",
          ],
          answer: 1,
          explain:
            "Each row is sorted within itself. Nothing relates the end of one to the start of another, which is why the flattened view cannot be binary searched.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Tip it out and sort",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Collect every value into one list, sort it, and read position k − 1.",
      takeaways: [
        "it ignores the shape completely, which is why it is easy to write",
        "and it rebuilds an ordering the input had already half given you",
        "the work is the same whether k is 1 or the whole matrix",
      ],
      run: flattenSort,
    },
    {
      key: "heap",
      name: "Only the row fronts can be next",
      short: "stop at k",
      insight:
        "Flattening and sorting orders every value to read one of them — and the input's own sortedness says that most of those values could not possibly be next.",
      idea: problem.approach,
      takeaways: [
        "the smallest untaken value is at the front of some row, so there are only n candidates at any moment",
        "pop the smallest, then push the cell to ITS RIGHT — the only candidate that row can offer next",
        "the heap holds at most one entry per row, whatever the size of the matrix",
        "and it stops after k pops, so a small k never touches the far corner",
      ],
      quiz: [
        {
          q: "Why is it enough to hold one cell per row?",
          choices: [
            "to save memory",
            "because a row is sorted, so nothing behind its front can be the next smallest",
          ],
          answer: 1,
          explain:
            "The sortedness of the row is what makes the replacement correct. Without it, every unvisited cell would be a candidate.",
        },
      ],
      run: heapFronts,
    },
  ],
})
