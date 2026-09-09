// Largest Island, derived. The grid arrives flattened with its width as a
// parameter, the same shape count-the-islands uses — a row of cells plus a
// width is what a grid is.
//
// The lesson is one line of the flood fill: WHERE the cell is marked. Marking
// on entry makes the mark the visited set; marking on exit walks back the way
// it came, forever.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/max-island-area.ts"

type G = Data<number> & { cols: number }

const ix = (cols: number, r: number, c: number) => r * cols + c

/** The reference: the size of the biggest four-connected group of 1s. */
export function biggestIsland(nums: number[], cols: number) {
  const rows = nums.length / cols
  const g = [...nums]
  let best = 0
  const fill = (r: number, c: number): number => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || g[ix(cols, r, c)] !== 1)
      return 0
    g[ix(cols, r, c)] = 0
    return 1 + fill(r + 1, c) + fill(r - 1, c) + fill(r, c + 1) + fill(r, c - 1)
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) best = Math.max(best, fill(r, c))
  return best
}

/** Which island each land cell belongs to, so the story act can colour them. */
function islandsOf(nums: number[], cols: number) {
  const rows = nums.length / cols
  const id = nums.map(() => -1)
  let next = 0
  for (let r0 = 0; r0 < rows; r0++)
    for (let c0 = 0; c0 < cols; c0++) {
      if (nums[ix(cols, r0, c0)] !== 1 || id[ix(cols, r0, c0)] !== -1) continue
      const stack = [[r0, c0]]
      id[ix(cols, r0, c0)] = next
      while (stack.length) {
        const [r, c] = stack.pop()!
        for (const [dr, dc] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
          if (nums[ix(cols, nr, nc)] !== 1 || id[ix(cols, nr, nc)] !== -1)
            continue
          id[ix(cols, nr, nc)] = next
          stack.push([nr, nc])
        }
      }
      next++
    }
  return { id, count: next }
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
      row.push(nums[ix(cols, r, c)])
      const m = mark?.(r, c)
      if (m) marks[`${r},${c}`] = m
    }
    cells.push(row)
  }
  return { cells, marks, label }
}

function* story({ nums, cols }: G): Generator<DFrame> {
  const { id, count } = islandsOf(nums, cols)
  const answer = biggestIsland(nums, cols)
  yield {
    hold: 3,
    noChips: true,
    note: "A grid of land and water. Land cells touching horizontally or vertically are one island — and the question is not how many islands there are, but how big the biggest one is.",
  }
  yield {
    hold: 3,
    grid: grid(nums, cols, "1 = land · 0 = water"),
    note: "Nothing in the grid says which island a cell belongs to. That grouping only exists once something walks it, which is why every version here is a walk of some kind.",
  }
  const sizes = Array.from(
    { length: count },
    (_, k) => id.filter((v) => v === k).length
  )
  const biggest = sizes.indexOf(Math.max(...sizes, 0))
  // land meeting only at a corner: two islands, and the reason the neighbour
  // list has four entries rather than eight
  const rows = nums.length / cols
  const cornerTouch = nums.some((v, k) => {
    if (v !== 1) return false
    const r = Math.floor(k / cols)
    const c = k % cols
    return [
      [1, 1],
      [1, -1],
    ].some(([dr, dc]) => {
      const nr = r + dr
      const nc = c + dc
      return (
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        nums[ix(cols, nr, nc)] === 1 &&
        id[k] !== id[ix(cols, nr, nc)]
      )
    })
  })
  yield {
    hold: 3,
    grid: grid(
      nums,
      cols,
      count
        ? `${count} ${count === 1 ? "island" : "islands"}, biggest ${answer}`
        : "no land at all",
      (r, c) =>
        id[ix(cols, r, c)] === -1
          ? undefined
          : id[ix(cols, r, c)] === biggest
            ? "answer"
            : "dim"
    ),
    state: [{ label: "largest island", value: answer }],
    answer,
    corner:
      count === 0
        ? "nowater"
        : count === 1 && answer === nums.length
          ? "allland"
          : cornerTouch
            ? "diagonal"
            : sizes.filter((v) => v === answer).length > 1
              ? "tie"
              : undefined,
    note:
      count === 0
        ? "No land anywhere. The largest island has 0 cells — an answer, not a failure, and the case a loop that starts its best at the first island's size never reaches."
        : count === 1 && answer === nums.length
          ? `Every cell is land, so there is one island covering the whole grid: ${answer} cells. Also the worst case for a recursive fill — it goes as deep as the grid is big.`
          : cornerTouch
            ? `${count} islands, of sizes ${sizes.join(", ")}, and the biggest holds ${answer}. Look at the cells meeting at a CORNER: they are two different islands, because connectivity is up, down, left and right only. Adding the diagonals to the neighbour list is the way to get an answer that is too big.`
            : sizes.filter((v) => v === answer).length > 1
              ? `Two islands tie at ${answer} cells. The question asks for a size, not for which island, so a tie needs no tie-break — but only if the code is comparing sizes rather than remembering an island.`
              : `${count} islands here, of sizes ${sizes.join(", ")}. The biggest holds ${answer} cells.`,
  }
}

/** Rung 1 — grow one island by rescanning the whole grid. */
function* rescan({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const { id } = islandsOf(nums, cols)
  let best = 0
  let sweeps = 0
  const claimed = nums.map(() => false)
  yield {
    line: 1,
    grid: grid(nums, cols, "nothing claimed yet"),
    state: [{ label: "best", value: 0 }],
    note: "Start with a best of 0 — which is already the right answer for a grid with no land in it.",
  }
  for (let r0 = 0; r0 < rows; r0++)
    for (let c0 = 0; c0 < cols; c0++) {
      if (nums[ix(cols, r0, c0)] !== 1 || claimed[ix(cols, r0, c0)]) continue
      const island = id[ix(cols, r0, c0)]
      const members = new Set<number>([ix(cols, r0, c0)])
      claimed[ix(cols, r0, c0)] = true
      let grew = true
      while (grew) {
        grew = false
        sweeps++
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const k = ix(cols, r, c)
            if (nums[k] !== 1 || members.has(k)) continue
            const touches = [
              [r + 1, c],
              [r - 1, c],
              [r, c + 1],
              [r, c - 1],
            ].some(
              ([nr, nc]) =>
                nr >= 0 &&
                nc >= 0 &&
                nr < rows &&
                nc < cols &&
                members.has(ix(cols, nr, nc))
            )
            if (touches) {
              members.add(k)
              claimed[k] = true
              grew = true
            }
          }
        yield {
          line: 9,
          grid: grid(
            nums,
            cols,
            `sweep ${sweeps} — island of ${members.size}`,
            (r, c) =>
              members.has(ix(cols, r, c))
                ? "focus"
                : id[ix(cols, r, c)] === island
                  ? undefined
                  : nums[ix(cols, r, c)] === 1
                    ? "dim"
                    : undefined
          ),
          state: [
            { label: "sweeps", value: sweeps },
            { label: "this island", value: members.size },
          ],
          note: grew
            ? `A full pass over the grid found cells touching what is already claimed, so the island is now ${members.size}. Every cell was read again to discover that.`
            : `A whole pass added nothing, so this island is finished at ${members.size}. That last sweep read every cell in the grid to learn nothing.`,
        }
      }
      best = Math.max(best, members.size)
      yield {
        line: 12,
        grid: grid(nums, cols, `best so far ${best}`, (r, c) =>
          members.has(ix(cols, r, c)) ? "answer" : undefined
        ),
        state: [{ label: "best", value: best }],
        note: `Island finished at ${members.size}; the best so far is ${best}. On to the next unclaimed land cell.`,
      }
    }
  const answer = biggestIsland(nums, cols)
  yield {
    line: 13,
    answer,
    grid: grid(nums, cols, `largest ${answer}`),
    state: [
      { label: "answer", value: answer },
      { label: "full grid sweeps", value: sweeps },
    ],
    corner: answer === 0 ? "nowater" : undefined,
    note: `${answer}, after ${sweeps} full ${sweeps === 1 ? "sweep" : "sweeps"} of the grid. The count is the problem: growth needs one sweep per step outward, so a long thin island costs a sweep per cell of its length.`,
  }
}

/** Rung 2 — flood fill, marking on entry. */
function* flood({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const g = [...nums]
  const visits: number[] = []
  let best = 0
  yield {
    line: 2,
    grid: grid(nums, cols, "best = 0"),
    state: [{ label: "best", value: 0 }],
    note: "Same starting point, and a different way of remembering: a cell is sunk the moment it is claimed, so the grid itself becomes the visited set.",
  }
  function* fill(
    r: number,
    c: number,
    seed: string
  ): Generator<DFrame, number> {
    if (r < 0 || c < 0 || r >= rows || c >= cols || g[ix(cols, r, c)] !== 1)
      return 0
    g[ix(cols, r, c)] = 0
    visits.push(ix(cols, r, c))
    let area = 1
    yield {
      line: 6,
      grid: grid(nums, cols, `filling from ${seed}`, (rr, cc) =>
        rr === r && cc === c
          ? "focus"
          : g[ix(cols, rr, cc)] === 0 && nums[ix(cols, rr, cc)] === 1
            ? "answer"
            : undefined
      ),
      state: [
        { label: "claimed here", value: area },
        { label: "cells visited", value: visits.length },
      ],
      note: `${r},${c} is claimed and sunk in the same step. The sinking is not tidying up — it IS the visited set, and it happens on entry so the four recursive calls cannot walk back into this cell.`,
    }
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      area += yield* fill(r + dr, c + dc, seed)
    return area
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (g[ix(cols, r, c)] !== 1) continue
      const area = yield* fill(r, c, `${r},${c}`)
      best = Math.max(best, area)
      yield {
        line: 11,
        grid: grid(nums, cols, `island of ${area}, best ${best}`),
        state: [
          { label: "this island", value: area },
          { label: "best", value: best },
        ],
        note: `That fill returned ${area}. The number came back up the recursion — 1 for this cell plus whatever the four neighbours reported — so nothing had to count the island afterwards.`,
      }
    }
  const answer = biggestIsland(nums, cols)
  yield {
    line: 12,
    answer,
    grid: grid(nums, cols, `largest ${answer}`, (r, c) =>
      nums[ix(cols, r, c)] === 1 ? "answer" : undefined
    ),
    state: [
      { label: "answer", value: answer },
      { label: "cells visited", value: visits.length },
      { label: "cells in the grid", value: nums.length },
    ],
    corner:
      answer === 0 ? "nowater" : answer === nums.length ? "allland" : undefined,
    note: `${answer}, having visited ${visits.length} ${visits.length === 1 ? "cell" : "cells"} in a grid of ${nums.length} — every land cell exactly once, and no cell twice. ${answer === nums.length ? "Note the depth on this one: an all-land grid recurses as deep as it has cells, which is where the recursive version stops working." : "The mark on entry is what buys that: a claimed cell is no longer land, so there is nothing to walk back into."}`,
  }
}

export const maxIslandArea = deriveJourney<number>(problem, {
  slug: "how-big-is-the-biggest",
  subtitle: "sink each cell as you claim it, and the visited set is the grid",
  reveals: ["graphs"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger grid" },
  params: [{ key: "cols", label: "grid width" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const cols = d.cols as number
    if (!Number.isInteger(cols) || cols < 1 || nums.length % cols !== 0)
      return { ok: false, warning: "the width must divide the number of cells" }
    return nums.every((v) => v === 0 || v === 1)
      ? { ok: true }
      : { ok: false, warning: "every cell must be 0 (water) or 1 (land)" }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 1, 0, 0, 1, 0, 0, 0, 1],
      extra: { cols: 3 },
      info: "islands of 3 and 1",
    },
    nowater: {
      label: "nothing but water",
      nums: [0, 0, 0, 0],
      extra: { cols: 2 },
      info: "the answer is 0",
    },
    allland: {
      label: "all land",
      nums: [1, 1, 1, 1, 1, 1],
      extra: { cols: 3 },
      info: "one island, the whole grid",
    },
    diagonal: {
      label: "touching at a corner",
      nums: [1, 0, 0, 1],
      extra: { cols: 2 },
      info: "two islands of 1",
    },
    tie: {
      label: "two islands the same size",
      nums: [1, 1, 0, 0, 0, 0, 0, 1, 1],
      extra: { cols: 3 },
      info: "no tie-break needed",
    },
    snake: {
      label: "one long thin island",
      nums: [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
      extra: { cols: 4 },
      info: "worst case for growing by rescanning",
    },
    long: {
      label: "a bigger grid",
      nums: [
        1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0,
        1,
      ],
      extra: { cols: 5 },
      info: "five by five",
    },
  },
  edges: [
    {
      key: "nowater",
      name: "no land at all",
      example: "a grid of water → 0",
      why: "0 is the answer, not a missing one. Code that starts its best at the size of the first island found never runs, and code that returns the best of an empty list has nothing to return.",
      think: "What does your answer start as, and is that value ever wrong?",
      preset: "nowater",
      constraint: 3,
    },
    {
      key: "allland",
      name: "every cell is land",
      example: "a full grid → its cell count",
      why: "One island covering everything, and the deepest possible recursion: a fill goes as many frames deep as the grid has cells. This is the shape where the elegant version stops working and an explicit stack does not.",
      think: "How deep does your fill go on a 50 by 50 grid of all land?",
      preset: "allland",
      constraint: 0,
    },
    {
      key: "diagonal",
      name: "cells touching only at a corner",
      example: "land at [0,0] and [1,1] → 1, not 2",
      why: "Connectivity is four-directional. Adding the diagonals to the neighbour list merges islands that the problem says are separate, and the mistake shows up as an answer that is too large rather than as a crash.",
      think: "How many neighbours does your fill visit — four or eight?",
      preset: "diagonal",
      constraint: 2,
    },
    {
      key: "tie",
      name: "two islands of the same size",
      example: "two islands of 2 → 2",
      why: "The answer is a size, so a tie is not a decision. It is worth seeing because it is the case that punishes code remembering WHICH island is best rather than how big the best one is.",
      think: "Are you keeping a size or a set of cells?",
      preset: "tie",
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
        "given: a grid of 0 (water) and 1 (land)",
        "an island is land connected up, down, left or right",
        "task: return the number of cells in the biggest island",
        "a grid with no land answers 0",
      ],
      tools: [
        {
          name: "Grid",
          role: "written here as a flat row plus a width, which is what a grid is. Every land cell is a node with an edge to each land neighbour — the graph is there, it is just not written down.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "nothing in the grid records which island a cell is in — a walk is what creates that grouping",
        "connectivity is four-directional, so a corner touch is two islands",
        "no land at all is an answer of 0, not an empty result",
      ],
      quiz: [
        {
          q: "Two land cells touch only at their corners. One island or two?",
          choices: ["one", "two"],
          answer: 1,
          explain:
            "Connectivity is up, down, left and right. Diagonals are the most common way to get an answer that is too big.",
        },
      ],
      run: story,
    },
    {
      key: "grow",
      name: "Grow it by looking again",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Claim a land cell as a seed, then sweep the whole grid over and over, adding any land cell that touches what is claimed, until a sweep adds nothing.",
      takeaways: [
        "it is correct, and needs no recursion or stack at all",
        "but each step outward costs a full pass over the grid",
        "and the last pass always adds nothing — it exists only to prove the island is finished",
      ],
      quiz: [
        {
          q: "Which shape of island is worst for this version?",
          choices: [
            "a large square block",
            "a long thin snake — one sweep per cell of its length",
          ],
          answer: 1,
          explain:
            "Growth is one ring per sweep, so the cost tracks the island's longest path, not its area.",
        },
      ],
      run: rescan,
    },
    {
      key: "flood",
      name: "Sink each cell as you claim it",
      short: "one visit each",
      insight:
        "Re-scanning the whole grid for cells next to what you already hold re-reads everything once per step outward, when the only cells that could have been added are the ones next to the cells just claimed.",
      idea: problem.whyNow!,
      takeaways: [
        "the traversal carries its own frontier — the recursion is the queue",
        "marking on ENTRY is what makes the mark a visited set; mark on exit and the fill walks back into itself",
        "the area comes back up the recursion: 1 plus what the four neighbours report",
        "and every cell is read exactly once, whatever the island's shape",
      ],
      quiz: [
        {
          q: "Why is a cell sunk before recursing rather than after?",
          choices: [
            "it makes the code shorter",
            "because the four calls include the cell that called this one — unmarked, the fill immediately walks back where it came from",
          ],
          answer: 1,
          explain:
            "Every neighbour of a cell has that cell as a neighbour. The mark on entry is the only thing making the walk terminate.",
        },
      ],
      run: flood,
    },
  ],
})
