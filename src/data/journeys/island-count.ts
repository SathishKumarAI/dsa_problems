// Connected Groups of Land, derived — and the first journey to draw a GRID
// rather than a row (engine/shape-views.tsx). The grid arrives flattened with
// its width as a parameter, exactly as the sorted-matrix journey does, because
// a row of cells plus a width is what a grid actually is.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/island-count.ts"

type G = Data<number> & { cols: number }

const at = (nums: number[], cols: number, r: number, c: number) =>
  nums[r * cols + c]

export function islandCount(nums: number[], cols: number) {
  const rows = nums.length / cols
  const g = [...nums]
  let count = 0
  const sink = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || g[r * cols + c] === 0) return
    g[r * cols + c] = 0
    sink(r + 1, c)
    sink(r - 1, c)
    sink(r, c + 1)
    sink(r, c - 1)
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (g[r * cols + c] === 1) {
        count += 1
        sink(r, c)
      }
  return count
}

// Which island each land cell belongs to — the story act colours them, so the
// grouping is computed rather than asserted.
function labelIslands(nums: number[], cols: number) {
  const rows = nums.length / cols
  const owner = nums.map(() => -1)
  let id = 0
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (nums[r * cols + c] !== 1 || owner[r * cols + c] >= 0) continue
      const stack = [[r, c]]
      owner[r * cols + c] = id
      while (stack.length) {
        const [y, x] = stack.pop()!
        for (const [dy, dx] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const ny = y + dy
          const nx = x + dx
          if (ny < 0 || nx < 0 || ny >= rows || nx >= cols) continue
          if (nums[ny * cols + nx] !== 1 || owner[ny * cols + nx] >= 0) continue
          owner[ny * cols + nx] = id
          stack.push([ny, nx])
        }
      }
      id += 1
    }
  return { owner, count: id }
}

const asGrid = (nums: number[], cols: number) => {
  const rows: number[][] = []
  for (let r = 0; r * cols < nums.length; r++)
    rows.push(nums.slice(r * cols, r * cols + cols))
  return rows
}

const marksFrom = (
  nums: number[],
  cols: number,
  pick: (i: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  for (let i = 0; i < nums.length; i++) {
    const role = pick(i)
    if (role) marks[`${Math.floor(i / cols)},${i % cols}`] = role
  }
  return marks
}

function* story({ nums, cols }: G): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A grid of land and water. Count the islands — groups of land cells joined edge to edge.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Only the four orthogonal neighbours connect. Two land cells touching at a corner are two separate islands, which is the one rule that turns this from a picture into a problem with a definite answer.",
  }
  const { owner, count } = labelIslands(nums, cols)
  const rows = nums.length / cols
  const diagonalOnly = (() => {
    for (let r = 0; r + 1 < rows; r++)
      for (let c = 0; c + 1 < cols; c++) {
        const a = at(nums, cols, r, c)
        const b = at(nums, cols, r + 1, c + 1)
        if (a === 1 && b === 1 && !at(nums, cols, r + 1, c) && !at(nums, cols, r, c + 1))
          return true
      }
    return false
  })()
  yield {
    hold: 3,
    grid: {
      cells: asGrid(nums, cols),
      label: `${count} island${count === 1 ? "" : "s"}`,
      marks: marksFrom(nums, cols, (i) =>
        owner[i] < 0 ? "dim" : owner[i] % 2 === 0 ? "answer" : "anchor"
      ),
    },
    state: [{ label: "islands", value: count }],
    answer: count,
    corner: !nums.includes(1)
      ? "nolands"
      : !nums.includes(0)
        ? "allland"
        : diagonalOnly
          ? "diagonal"
          : undefined,
    note: !nums.includes(1)
      ? "Nothing but water, so there are no islands at all: 0. A real answer, and the case where every loop runs and nothing happens."
      : !nums.includes(0)
        ? `Every cell is land, so the whole grid is ONE island: ${count}. Whatever marks a cell as counted has to cover the entire grid from a single starting point.`
        : diagonalOnly
          ? `${count} islands. Two land cells here touch only at a CORNER — and corners do not connect, so they are counted separately. A flood fill that checks eight neighbours instead of four merges them and answers one fewer.`
          : `${count} island${count === 1 ? "" : "s"}, coloured apart above. Each is a group of land cells you could walk between without crossing water.`,
  }
}

function* unionFind({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const parent = nums.map((_, i) => i)
  const find = (a: number): number => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]]
      a = parent[a]
    }
    return a
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (at(nums, cols, r, c) !== 1) continue
      const here = r * cols + c
      for (const [dr, dc] of [
        [1, 0],
        [0, 1],
      ]) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= rows || nc >= cols) continue
        if (at(nums, cols, nr, nc) !== 1) continue
        const there = nr * cols + nc
        const joined = find(here) !== find(there)
        parent[find(here)] = find(there)
        yield {
          line: dr ? 18 : 20,
          grid: {
            cells: asGrid(nums, cols),
            label: "merging neighbours",
            marks: marksFrom(nums, cols, (i) =>
              i === here ? "focus" : i === there ? "anchor" : nums[i] ? undefined : "dim"
            ),
          },
          state: [
            { label: "groups", value: new Set(nums.map((v, i) => (v ? find(i) : -1)).filter((v) => v >= 0)).size },
          ],
          note: joined
            ? `Land at row ${r} column ${c} and its ${dr ? "lower" : "right-hand"} neighbour belong together — merge their groups. ${new Set(nums.map((v, i) => (v ? find(i) : -1)).filter((v) => v >= 0)).size} group${new Set(nums.map((v, i) => (v ? find(i) : -1)).filter((v) => v >= 0)).size === 1 ? "" : "s"} left.`
            : `Row ${r} column ${c} and its ${dr ? "lower" : "right-hand"} neighbour are already in the same group — nothing to do, and the check still had to be made.`,
        }
      }
    }
  const roots = new Set(
    nums.map((v, i) => (v === 1 ? find(i) : -1)).filter((v) => v >= 0)
  )
  yield {
    line: 21,
    answer: roots.size,
    grid: {
      cells: asGrid(nums, cols),
      label: `${roots.size} distinct group${roots.size === 1 ? "" : "s"}`,
      marks: marksFrom(nums, cols, (i) => (nums[i] ? "answer" : "dim")),
    },
    state: [{ label: "islands", value: roots.size }],
    note: `${roots.size}. Correct — and it built and maintained a parent for every cell in the grid, water included, to answer a question that only ever needed each land cell visited once.`,
  }
}

function* sinkThem({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const g = [...nums]
  let count = 0
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (g[r * cols + c] !== 1) continue
      count += 1
      yield {
        line: 13,
        grid: {
          cells: asGrid(g, cols),
          label: `island ${count}`,
          marks: marksFrom(g, cols, (i) =>
            i === r * cols + c ? "focus" : g[i] ? undefined : "dim"
          ),
        },
        state: [{ label: "islands", value: count }],
        note: `Row ${r} column ${c} is land nobody has reached yet, so it starts a NEW island — the ${count}${count === 1 ? "st" : count === 2 ? "nd" : count === 3 ? "rd" : "th"}. Every unvisited land cell begins exactly one, which is the whole counting rule.`,
      }
      const stack = [[r, c]]
      g[r * cols + c] = 0
      let sunk = 1
      while (stack.length) {
        const [y, x] = stack.pop()!
        for (const [dy, dx] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const ny = y + dy
          const nx = x + dx
          if (ny < 0 || nx < 0 || ny >= rows || nx >= cols) continue
          if (g[ny * cols + nx] !== 1) continue
          g[ny * cols + nx] = 0
          sunk += 1
          stack.push([ny, nx])
        }
      }
      yield {
        line: 6,
        grid: {
          cells: asGrid(g, cols),
          label: `island ${count} sunk`,
          marks: marksFrom(g, cols, (i) => (g[i] ? undefined : "dim")),
        },
        state: [
          { label: "islands", value: count },
          { label: "cells sunk", value: sunk },
        ],
        note: `Everything reachable from there is flooded — ${sunk} cell${sunk === 1 ? "" : "s"} turned to water. They are gone from the grid, so nothing can count them a second time: sinking IS the visited set, and it costs no extra memory at all.`,
      }
    }
  yield {
    line: 15,
    answer: count,
    grid: {
      cells: asGrid(g, cols),
      label: "nothing left to find",
      marks: marksFrom(g, cols, () => "dim"),
    },
    state: [{ label: "islands", value: count }],
    note: `${count}. The grid is empty because the algorithm ate it — one pass, every cell touched a constant number of times, and no parent array, no visited grid, nothing to maintain.`,
  }
}

export const islandCountJourney = deriveJourney(problem, {
  slug: "count-the-islands",
  subtitle: "sink each one as you find it, and the visited set disappears",
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
    },
    nolands: {
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
      info: "corners do not connect",
    },
    long: {
      label: "a bigger grid",
      nums: [
        1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0,
        1,
      ],
      extra: { cols: 5 },
    },
  },
  edges: [
    {
      key: "nolands",
      name: "nothing but water",
      example: "a grid of all 0s → 0",
      why: "Every loop runs and nothing happens. 0 is the answer, and it has to be what the count starts at rather than something the loop produces.",
      think: "What does your counter hold before the first land cell is found?",
      preset: "nolands",
      constraint: 1,
    },
    {
      key: "allland",
      name: "the whole grid is one island",
      example: "a grid of all 1s → 1",
      why: "A single flood fill has to reach every cell from one starting point. It is also where a recursive fill on a large grid runs out of stack, which is the reason the queue version exists.",
      think: "How deep can your flood fill go, and does the grid have a size where that matters?",
      preset: "allland",
      constraint: 0,
    },
    {
      key: "diagonal",
      name: "land touching only at a corner",
      example: "[[1, 0], [0, 1]] → 2",
      why: "Corners do not connect. A flood fill that visits all eight neighbours instead of four merges these into one island and answers one fewer, on a grid that looks obviously connected to a human eye.",
      think: "How many neighbours does a cell have, and did the problem say four or eight?",
      preset: "diagonal",
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
        "given: a grid of 1 (land) and 0 (water)",
        "two land cells connect if they share an EDGE",
        "an island = land cells reachable from each other",
        "task: how many islands?",
      ],
      tools: [
        {
          name: "Grid of cells",
          role: "a rectangle addressed by row and column. It is really a graph in disguise: each cell is a vertex, and the four orthogonal neighbours are its edges — nothing has to be built to make that true.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the grid is a graph: cells are vertices, four-adjacency is the edge set",
        "corners do not connect, and that single rule decides the answer",
        "every land cell nobody has reached yet starts exactly one new island",
      ],
      quiz: [
        {
          q: "Two land cells touch only at a corner. How many islands?",
          choices: ["one", "two"],
          answer: 1,
          explain:
            "Only the four orthogonal neighbours connect. A diagonal touch joins nothing, however connected it looks.",
        },
      ],
      run: story,
    },
    {
      key: "union",
      name: "Merge neighbours as you meet them",
      short: "a parent per cell",
      from: 1,
      insight: "",
      idea: "Give every cell its own group, then walk the grid merging each land cell with its right and lower land neighbours. The number of distinct groups among the land cells is the answer.",
      takeaways: [
        "it never needs to know where an island STARTS — the groups fall out of the merges",
        "and it is the right structure when cells arrive one at a time, with no grid to fill from",
        "for a fixed grid it maintains a parent for every cell, water included, and a lookup that is not quite constant",
      ],
      quiz: [
        {
          q: "When is this structure genuinely the better answer?",
          choices: [
            "on any large grid",
            "when land is ADDED over time and there is no complete grid to fill from",
          ],
          answer: 1,
          explain:
            "Flood fill needs something to fill. If cells appear one at a time, there is nothing to start from, and merging as they arrive is the only shape that works.",
        },
      ],
      run: unionFind,
    },
    {
      key: "sink",
      name: "Sink each island as you find it",
      short: "one pass, nothing kept",
      insight:
        "Merging maintains a parent array for every cell in order to answer a question that only needs each land cell visited once. And there is already somewhere to record a visit: the grid itself.",
      idea: problem.whyNow!,
      takeaways: [
        "every unvisited land cell starts exactly one island — that is the entire counting rule",
        "flooding it turns the land to water, so nothing can be counted twice",
        "sinking IS the visited set, so it costs no extra memory",
        "and the price is that the input is destroyed — copy it first if the caller still wants it",
      ],
      quiz: [
        {
          q: "Why does sinking the land remove the need for a visited set?",
          choices: [
            "because visited cells are faster to skip",
            "because a sunk cell is water, and the loop only ever starts from land",
          ],
          answer: 1,
          explain:
            "The grid and the visited set become the same object. The cost is that the caller's grid is destroyed, which is a real trade rather than a free win.",
        },
      ],
      run: sinkThem,
    },
  ],
})
