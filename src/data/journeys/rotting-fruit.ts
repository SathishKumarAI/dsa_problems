// Rotting Fruit, derived. Grid as a flat row plus a width, like the other two
// grid journeys.
//
// What this one teaches is MULTI-SOURCE BFS: every rotten cell is a starting
// point, all at time zero, because the rot spreads from all of them at once.
// One BFS per source is both wrong and slow — wrong because it double-counts
// time from whichever source it started with.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/rotting-fruit.ts"

type G = Data<number> & { cols: number }

const FRESH = 1
const ROTTEN = 2

const ix = (cols: number, r: number, c: number) => r * cols + c

/** The reference: minutes until nothing is fresh, or -1 if something never rots. */
export function minutesToRot(nums: number[], cols: number) {
  const rows = nums.length / cols
  const g = [...nums]
  let fresh = g.filter((v) => v === FRESH).length
  let queue = g.map((_, k) => k).filter((k) => g[k] === ROTTEN)
  let minutes = 0
  while (queue.length && fresh) {
    const next: number[] = []
    for (const k of queue) {
      const r = Math.floor(k / cols)
      const c = k % cols
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        if (g[ix(cols, nr, nc)] !== FRESH) continue
        g[ix(cols, nr, nc)] = ROTTEN
        fresh--
        next.push(ix(cols, nr, nc))
      }
    }
    if (next.length) minutes++
    queue = next
  }
  return fresh ? -1 : minutes
}

const grid = (
  cells: number[],
  cols: number,
  label: string,
  mark?: (k: number) => ChipRole | undefined
) => {
  const rows = cells.length / cols
  const out: number[][] = []
  const marks: Record<string, ChipRole> = {}
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let c = 0; c < cols; c++) {
      row.push(cells[ix(cols, r, c)])
      const m = mark?.(ix(cols, r, c))
      if (m) marks[`${r},${c}`] = m
    }
    out.push(row)
  }
  return { cells: out, marks, label }
}

const neighbours = (k: number, cols: number, rows: number) => {
  const r = Math.floor(k / cols)
  const c = k % cols
  return (
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const
  )
    .map(([dr, dc]) => [r + dr, c + dc] as const)
    .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < rows && nc < cols)
    .map(([nr, nc]) => ix(cols, nr, nc))
}

function* story({ nums, cols }: G): Generator<DFrame> {
  const fresh = nums.filter((v) => v === FRESH).length
  const rotten = nums.filter((v) => v === ROTTEN).length
  const answer = minutesToRot(nums, cols)
  yield {
    hold: 3,
    noChips: true,
    note: "A crate of fruit: 0 is a gap, 1 is fresh, 2 is already rotten. Every minute, rot spreads to the fruit directly beside it. How many minutes until nothing fresh is left?",
  }
  yield {
    hold: 3,
    grid: grid(nums, cols, "0 gap · 1 fresh · 2 rotten", (k) =>
      nums[k] === ROTTEN ? "anchor" : nums[k] === FRESH ? "focus" : undefined
    ),
    state: [
      { label: "fresh", value: fresh },
      { label: "rotten", value: rotten },
    ],
    note: `${rotten} ${rotten === 1 ? "cell is" : "cells are"} rotten to begin with, and they all spread at the SAME time — not one after another. That word decides the whole shape of the answer.`,
  }
  yield {
    hold: 3,
    grid: grid(
      nums,
      cols,
      answer === -1
        ? "some fruit never rots"
        : `${answer} ${answer === 1 ? "minute" : "minutes"}`,
      (k) =>
        nums[k] === FRESH ? "focus" : nums[k] === ROTTEN ? "anchor" : undefined
    ),
    state: [{ label: "answer", value: answer }],
    answer,
    corner:
      answer === -1
        ? "unreachable"
        : fresh === 0
          ? "nofresh"
          : rotten > 1
            ? "multi"
            : undefined,
    note:
      answer === -1
        ? "Some fresh fruit has no path to any rotten cell — walled off by gaps — so it never rots and the answer is -1. Not an error: a stated outcome, and one a loop that only counts minutes will happily report as a number."
        : fresh === 0
          ? "Nothing is fresh to begin with, so the answer is 0 minutes. Also the case that separates 'the queue is empty' from 'the work is done' — there is work-shaped state here and no work."
          : rotten > 1
            ? `${answer} minutes, and note why it is not more: the rot starts from ${rotten} places at once. Working out the time from each source separately and taking the smallest per cell gets the same answer for far more work — running them together is the same thing done once.`
            : `${answer} minutes. One source, so the time for a cell is just its distance from that source through fresh fruit — gaps are walls, not shortcuts.`,
  }
}

/** Rung 1 — simulate the whole grid, minute by minute. */
function* simulate({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const g = [...nums]
  let minutes = 0
  let reads = 0
  yield {
    line: 3,
    grid: grid(g, cols, "minute 0"),
    state: [{ label: "minute", value: 0 }],
    note: "One rule, applied to the whole crate: any fresh cell next to a rotten one is rotten next minute. Repeat until a minute changes nothing.",
  }
  for (;;) {
    const turning: number[] = []
    for (let k = 0; k < g.length; k++) {
      reads++
      if (g[k] !== FRESH) continue
      if (neighbours(k, cols, rows).some((n) => g[n] === ROTTEN))
        turning.push(k)
    }
    if (!turning.length) break
    minutes++
    for (const k of turning) g[k] = ROTTEN
    yield {
      line: 8,
      grid: grid(g, cols, `minute ${minutes}`, (k) =>
        turning.includes(k) ? "answer" : g[k] === ROTTEN ? "dim" : undefined
      ),
      state: [
        { label: "minute", value: minutes },
        { label: "rotted this minute", value: turning.length },
        { label: "cells read", value: reads },
      ],
      note: `${turning.length} ${turning.length === 1 ? "cell turns" : "cells turn"} in minute ${minutes}. Finding them cost a pass over the entire crate, including the cells that rotted minutes ago and will never change again.`,
    }
  }
  const answer = minutesToRot(nums, cols)
  const left = g.filter((v) => v === FRESH).length
  yield {
    line: 11,
    answer,
    grid: grid(
      g,
      cols,
      answer === -1 ? "still fresh, and unreachable" : "nothing fresh left",
      (k) => (g[k] === FRESH ? "focus" : undefined)
    ),
    state: [
      { label: "answer", value: answer },
      { label: "cells read", value: reads },
    ],
    corner:
      answer === -1
        ? "unreachable"
        : left === 0 && !nums.includes(FRESH)
          ? "nofresh"
          : undefined,
    note:
      answer === -1
        ? `A minute passed with nothing changing while ${left} fresh ${left === 1 ? "cell was" : "cells were"} still there, so they can never rot: -1. Notice that this version discovers that by doing a whole pass which achieves nothing — the stopping condition and the failure condition are the same event.`
        : `${answer}, after reading ${reads} cells. Correct, and the cost is a full grid scan per minute: a long thin line of fruit costs a scan of everything for every cell of its length.`,
  }
}

/** Rung 2 — multi-source BFS, one level per minute. */
function* multiBfs({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const g = [...nums]
  let fresh = g.filter((v) => v === FRESH).length
  let queue = g.map((_, k) => k).filter((k) => g[k] === ROTTEN)
  const seeded = [...queue]
  let minutes = 0
  let visits = 0
  yield {
    line: 5,
    grid: grid(
      g,
      cols,
      `${queue.length} ${queue.length === 1 ? "source" : "sources"}, all at minute 0`,
      (k) =>
        seeded.includes(k) ? "anchor" : g[k] === FRESH ? "focus" : undefined
    ),
    state: [
      { label: "queue", value: queue.length },
      { label: "fresh", value: fresh },
    ],
    corner: queue.length > 1 ? "multi" : fresh === 0 ? "nofresh" : undefined,
    note:
      queue.length > 1
        ? `Every rotten cell goes into the queue before the first minute, all of them at time zero. That is what makes the spread simultaneous — one queue with ${queue.length} sources, not ${queue.length} searches.`
        : `The queue is seeded with the rotten ${queue.length === 1 ? "cell" : "cells"} and the fresh ones are counted up front. That count is how the unreachable case gets detected without a second pass.`,
  }
  while (queue.length && fresh) {
    const next: number[] = []
    for (const k of queue) {
      visits++
      for (const n of neighbours(k, cols, rows)) {
        if (g[n] !== FRESH) continue
        g[n] = ROTTEN
        fresh--
        next.push(n)
      }
    }
    if (!next.length) break
    minutes++
    // a gap adjacent to this level is the moment to say what a 0 does: it is a
    // wall, not a cell that rot passes through
    const blocked = next.some((k) =>
      neighbours(k, cols, rows).some((n) => g[n] === 0)
    )
    yield {
      line: 14,
      corner: blocked ? "gaps" : undefined,
      grid: grid(g, cols, `minute ${minutes}`, (k) =>
        next.includes(k) ? "answer" : g[k] === ROTTEN ? "dim" : "focus"
      ),
      state: [
        { label: "minute", value: minutes },
        { label: "this level", value: next.length },
        { label: "fresh left", value: fresh },
      ],
      note: blocked
        ? `One level of the queue is one minute: ${next.length} ${next.length === 1 ? "neighbour rots" : "neighbours rot"} and become the next level. Some of them sit beside a GAP — a 0 never rots and never carries rot, so it is a wall. Treat it as passable and the search reaches cells the problem keeps unreachable.`
        : `One level of the queue is one minute: the ${queue.length} rotten ${queue.length === 1 ? "cell" : "cells"} from the previous round rot ${next.length} ${next.length === 1 ? "neighbour" : "neighbours"}, and those become the next level. Nobody computes a time — the minute IS the level number.`,
    }
    queue = next
  }
  const answer = minutesToRot(nums, cols)
  yield {
    line: 17,
    answer,
    grid: grid(
      g,
      cols,
      answer === -1 ? `${fresh} fresh, unreachable` : "nothing fresh left",
      (k) => (g[k] === FRESH ? "focus" : undefined)
    ),
    state: [
      { label: "answer", value: answer },
      { label: "cells dequeued", value: visits },
      { label: "cells in the grid", value: nums.length },
    ],
    corner:
      answer === -1
        ? "unreachable"
        : fresh === 0 && !nums.includes(FRESH)
          ? "nofresh"
          : undefined,
    note:
      answer === -1
        ? `The queue drained with ${fresh} fresh ${fresh === 1 ? "cell" : "cells"} still standing, so those cells have no path to any source: -1. The count taken at the start is what makes that a one-line test rather than another scan.`
        : `${answer}, having dequeued ${visits} of ${nums.length} cells — each rotten cell exactly once, and no cell re-read after it stopped changing. The minutes were never computed; they fell out of the level count.`,
  }
}

export const rottingFruit = deriveJourney<number>(problem, {
  slug: "everything-rots-at-once",
  subtitle: "seed the queue with every source, and a level becomes a minute",
  reveals: ["graphs"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger crate" },
  params: [{ key: "cols", label: "grid width" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const cols = d.cols as number
    if (!Number.isInteger(cols) || cols < 1 || nums.length % cols !== 0)
      return { ok: false, warning: "the width must divide the number of cells" }
    return nums.every((v) => v === 0 || v === 1 || v === 2)
      ? { ok: true }
      : {
          ok: false,
          warning: "every cell must be 0 (gap), 1 (fresh) or 2 (rotten)",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [2, 1, 1, 1, 1, 0, 0, 1, 1],
      extra: { cols: 3 },
      info: "one source, four minutes",
    },
    multi: {
      label: "two sources at once",
      nums: [2, 1, 1, 1, 1, 1, 1, 1, 2],
      extra: { cols: 3 },
      info: "they meet in the middle",
    },
    unreachable: {
      label: "fruit behind a gap",
      nums: [2, 1, 0, 0, 0, 1],
      extra: { cols: 3 },
      info: "the answer is -1",
    },
    nofresh: {
      label: "nothing fresh",
      nums: [0, 2, 2, 0],
      extra: { cols: 2 },
      info: "0 minutes, not -1",
    },
    empty: {
      label: "nothing but gaps",
      nums: [0, 0, 0, 0],
      extra: { cols: 2 },
      info: "also 0 minutes",
    },
    line: {
      label: "one long row",
      nums: [2, 1, 1, 1, 1, 1, 1, 1],
      extra: { cols: 8 },
      info: "worst case for rescanning",
    },
    long: {
      label: "a bigger crate",
      nums: [
        2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,
        2,
      ],
      extra: { cols: 5 },
      info: "two sources, five by five",
    },
  },
  edges: [
    {
      key: "unreachable",
      name: "fruit that can never rot",
      example: "a fresh cell walled off by gaps → -1",
      why: "-1 is a stated outcome, not a failure. Counting the fresh cells up front turns it into one comparison at the end; without that count, a loop that merely runs out of queue reports a number that is not an answer.",
      think: "How do you tell 'finished' from 'stuck' when the queue empties?",
      preset: "unreachable",
      constraint: 3,
    },
    {
      key: "nofresh",
      name: "nothing fresh to begin with",
      example: "only gaps and rotten cells → 0",
      why: "The answer is 0 minutes even though the queue is full of sources. Code that counts a level for every round of the queue reports 1 here — the minute must only be counted when something actually rots.",
      think:
        "Do you increment the clock before or after checking that anything changed?",
      preset: "nofresh",
      constraint: 1,
    },
    {
      key: "multi",
      name: "rot spreading from several places at once",
      example: "two rotten corners → they meet in the middle",
      why: "All sources start at minute zero. A search run from one source at a time gives a cell the distance from THAT source, which is not the minute it rots, and taking a minimum afterwards is the same computation done many times over.",
      think: "Is your queue seeded once with everything, or once per source?",
      preset: "multi",
      constraint: 2,
    },
    {
      key: "gaps",
      name: "gaps are walls, not shortcuts",
      example:
        "2, 1, 0, 0, 0, 1 — the far cell is not reached through the gaps",
      why: "An empty cell never rots and never carries rot. Treating it as passable connects regions the problem keeps apart, and the wrong answer is a number rather than a crash.",
      think:
        "Does your neighbour test ask 'in bounds' or 'in bounds and fresh'?",
      preset: "unreachable",
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
        "given: a grid of 0 (gap), 1 (fresh), 2 (rotten)",
        "each minute, rot spreads to the four orthogonal neighbours",
        "task: minutes until nothing is fresh",
        "or -1 if some fresh cell can never be reached",
      ],
      tools: [
        {
          name: "Grid",
          role: "a flat row plus a width. Rot spreads along edges between neighbouring cells, so this is a shortest-path question wearing a grid costume — and the distance is measured in minutes.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "every rotten cell starts spreading at the same moment, not one after another",
        "a gap is a wall: it never rots and never passes rot on",
        "unreachable fruit is an answer of -1, so 'finished' and 'stuck' have to be told apart",
      ],
      quiz: [
        {
          q: "Two cells are rotten at the start. When does the second one begin spreading?",
          choices: [
            "after the first one has finished",
            "at the same moment — minute zero, both of them",
          ],
          answer: 1,
          explain:
            "Everything happens at once. That is what a multi-source search models, and what one-search-per-source gets wrong.",
        },
      ],
      run: story,
    },
    {
      key: "simulate",
      name: "Play the minutes out",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Each minute, scan the whole grid and rot every fresh cell that touches a rotten one. Stop when a minute changes nothing.",
      takeaways: [
        "it models the rule exactly as written, which is why it is obviously right",
        "each minute costs a full pass, including over cells that finished rotting long ago",
        "and the last pass exists only to discover that nothing changed",
      ],
      quiz: [
        {
          q: "Why must the cells turning in a minute be collected before any of them is written?",
          choices: [
            "to keep the code tidy",
            "because rotting one cell in place would let it rot its neighbour in the same minute",
          ],
          answer: 1,
          explain:
            "Writing as you scan lets rot travel several cells in one pass in the scan's direction — an answer that is too small, and only in one direction.",
        },
      ],
      run: simulate,
    },
    {
      key: "bfs",
      name: "Every source in one queue",
      short: "a level is a minute",
      insight:
        "Rescanning the whole grid every minute re-reads cells that will never change again — and the only cells that can rot next are the ones beside the cells that just rotted.",
      idea: problem.whyNow!,
      takeaways: [
        "seed the queue with EVERY rotten cell before the first round: that is what makes the spread simultaneous",
        "one level of the queue is one minute, so the clock is the level count and is never computed",
        "count the fresh cells up front, and the unreachable case is one comparison at the end",
        "each cell is dequeued once, whatever the shape of the crate",
      ],
      quiz: [
        {
          q: "What is the difference between this and running a search from each rotten cell in turn?",
          choices: [
            "none — the answers agree",
            "the answers agree, but one queue does the work once; per-source searches compute a distance from each source and then throw most of them away",
          ],
          answer: 1,
          explain:
            "Seeding all sources at level zero means the first search to reach a cell is by definition the fastest one, so no minimum has to be taken afterwards.",
        },
      ],
      run: multiBfs,
    },
  ],
})
