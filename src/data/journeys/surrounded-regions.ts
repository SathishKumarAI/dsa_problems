// Capture the Enclosed Regions, derived. Grid as a flat row plus a width.
//
// The lesson is an inversion. "Is this region enclosed?" is a verdict that has
// to be carried through a traversal and applied afterwards; "is this region
// reachable from the border?" needs no verdict at all — everything the fill
// touches is safe, and everything it does not is captured.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/surrounded-regions.ts"

type G = Data<number> & { cols: number }

const ix = (cols: number, r: number, c: number) => r * cols + c

/** The reference: every 0 not reachable from the border becomes a 1. */
export function captured(nums: number[], cols: number) {
  const rows = nums.length / cols
  const safe = nums.map(() => false)
  const rescue = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return
    const k = ix(cols, r, c)
    if (nums[k] !== 0 || safe[k]) return
    safe[k] = true
    rescue(r + 1, c)
    rescue(r - 1, c)
    rescue(r, c + 1)
    rescue(r, c - 1)
  }
  for (let r = 0; r < rows; r++) {
    rescue(r, 0)
    rescue(r, cols - 1)
  }
  for (let c = 0; c < cols; c++) {
    rescue(0, c)
    rescue(rows - 1, c)
  }
  return nums.map((v, k) => (v === 0 && !safe[k] ? 1 : v))
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

const onBorder = (k: number, cols: number, rows: number) => {
  const r = Math.floor(k / cols)
  const c = k % cols
  return r === 0 || c === 0 || r === rows - 1 || c === cols - 1
}

function* story({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const answer = captured(nums, cols)
  const flipped = nums.filter((v, k) => v === 0 && answer[k] === 1).length
  const survivors = nums.filter((v, k) => v === 0 && answer[k] === 0).length
  yield {
    hold: 3,
    noChips: true,
    note: "A grid of 1s and 0s. Every group of connected 0s that is completely surrounded — walled in with no way out — flips to 1. Groups that reach the edge of the grid survive.",
  }
  yield {
    hold: 3,
    grid: grid(nums, cols, "0 = open · 1 = wall", (k) =>
      nums[k] === 0 ? (onBorder(k, cols, rows) ? "anchor" : "focus") : undefined
    ),
    state: [
      { label: "open cells", value: nums.filter((v) => v === 0).length },
      {
        label: "on the border",
        value: nums.filter((v, k) => v === 0 && onBorder(k, cols, rows)).length,
      },
    ],
    note: "The 0s on the border are marked differently on purpose. Whether a region survives has nothing to do with its size or its shape — only with whether it touches the edge.",
  }
  yield {
    hold: 3,
    grid: grid(answer, cols, `${flipped} captured`, (k) =>
      nums[k] === 0 && answer[k] === 1
        ? "answer"
        : answer[k] === 0
          ? "anchor"
          : undefined
    ),
    answer,
    // a captured cell whose only open neighbour is diagonal is the case that
    // separates four-directional connectivity from eight
    corner: (() => {
      const cornerTrap = nums.some((v, k) => {
        if (v !== 0 || answer[k] !== 1) return false
        const r = Math.floor(k / cols)
        const c = k % cols
        return [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ].some(([dr, dc]) => {
          const nr = r + dr
          const nc = c + dc
          return (
            nr >= 0 &&
            nc >= 0 &&
            nr < rows &&
            nc < cols &&
            nums[ix(cols, nr, nc)] === 0 &&
            answer[ix(cols, nr, nc)] === 0
          )
        })
      })
      return cornerTrap
        ? "diagonal"
        : flipped === 0
          ? "allsafe"
          : survivors === 0
            ? "allcaptured"
            : "border"
    })(),
    note:
      nums.some((v, k) => v === 0 && answer[k] === 1) &&
      nums.some((v, k) => v === 0 && answer[k] === 0) &&
      flipped > 0 &&
      survivors > 0 &&
      nums.some((v, k) => {
        if (v !== 0 || answer[k] !== 1) return false
        const r = Math.floor(k / cols)
        const c = k % cols
        return [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ].some(([dr, dc]) => {
          const nr = r + dr
          const nc = c + dc
          return (
            nr >= 0 &&
            nc >= 0 &&
            nr < rows &&
            nc < cols &&
            nums[ix(cols, nr, nc)] === 0 &&
            answer[ix(cols, nr, nc)] === 0
          )
        })
      })
        ? `${flipped} captured, ${survivors} safe — and look at the pair meeting at a CORNER. One of them escapes and the other does not, because connectivity is up, down, left and right only. Add the diagonals to the neighbour list and the trapped cell is rescued by a cell it does not actually touch.`
        : flipped === 0
          ? "Nothing is captured here: every open region reaches the border, so the grid comes back exactly as it went in. An answer, not a no-op to skip."
          : survivors === 0
            ? `Every open cell was enclosed, so all ${flipped} flip. The other extreme, and the case where a version that forgets to restore its temporary marks destroys the whole grid.`
            : `${flipped} ${flipped === 1 ? "cell is" : "cells are"} captured and ${survivors} survive. The survivors are the ones connected to the edge — directly or through their neighbours, which is why this is a reachability question rather than a local one.`,
  }
}

/** Rung 1 — fill each region, then ask whether it touched the border. */
function* fillAndCheck({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const board = [...nums]
  const seen = nums.map(() => false)
  let regions = 0
  let undone = 0
  yield {
    line: 1,
    grid: grid(board, cols, "region by region"),
    state: [{ label: "regions", value: 0 }],
    note: "Take each region of 0s in turn, collect its cells, and remember along the way whether any of them sat on the border. Then decide.",
  }
  for (let start = 0; start < board.length; start++) {
    if (board[start] !== 0 || seen[start]) continue
    const cells: number[] = []
    let touches = false
    const stack = [start]
    seen[start] = true
    while (stack.length) {
      const k = stack.pop()!
      cells.push(k)
      if (onBorder(k, cols, rows)) touches = true
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
        const n = ix(cols, nr, nc)
        if (board[n] !== 0 || seen[n]) continue
        seen[n] = true
        stack.push(n)
      }
    }
    regions++
    if (!touches) {
      for (const k of cells) board[k] = 1
      undone += cells.length
    }
    yield {
      line: 12,
      grid: grid(
        board,
        cols,
        touches ? "touches the border" : "enclosed — flipped",
        (k) => (cells.includes(k) ? (touches ? "anchor" : "answer") : undefined)
      ),
      state: [
        { label: "region", value: regions },
        { label: "cells", value: cells.length },
        { label: "verdict", value: touches ? "survives" : "captured" },
      ],
      corner: touches ? "border" : undefined,
      note: touches
        ? `This region of ${cells.length} ${cells.length === 1 ? "cell" : "cells"} reaches the border, so it survives — and the whole of it had to be walked before that could be known, because the border cell might have been the last one found.`
        : `Nothing in this region reached the border, so all ${cells.length} of its cells flip. Note the shape of the work: collect everything, carry a verdict alongside, then go back over the cells to act on it.`,
    }
  }
  const answer = captured(nums, cols)
  yield {
    line: 14,
    answer,
    grid: grid(
      board,
      cols,
      `${regions} ${regions === 1 ? "region" : "regions"}`
    ),
    state: [
      { label: "regions", value: regions },
      { label: "cells flipped", value: undone },
    ],
    corner: undone === 0 ? "allsafe" : undefined,
    note: `Correct, over ${regions} ${regions === 1 ? "region" : "regions"}. Every region carried a verdict through its own traversal and then needed a second pass over its cells to apply it — a fair amount of bookkeeping for a question with a yes-or-no answer.`,
  }
}

/** Rung 2 — start from the border instead. */
function* fromTheBorder({ nums, cols }: G): Generator<DFrame> {
  const rows = nums.length / cols
  const board = [...nums]
  const SAFE = 2
  let rescued = 0
  const rescue = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return
    const k = ix(cols, r, c)
    if (board[k] !== 0) return
    board[k] = SAFE
    rescued++
    rescue(r + 1, c)
    rescue(r - 1, c)
    rescue(r, c + 1)
    rescue(r, c - 1)
  }
  yield {
    line: 12,
    grid: grid(board, cols, "start at the edges", (k) =>
      onBorder(k, cols, rows) ? "anchor" : undefined
    ),
    state: [{ label: "rescued", value: 0 }],
    corner: "border",
    note: "Turn the question round. 'Is this region enclosed?' needs a verdict carried through a walk; 'is it reachable from the border?' does not — so flood inward from every 0 on the edge, and stop asking about the interior altogether.",
  }
  for (let r = 0; r < rows; r++) {
    const before = rescued
    rescue(r, 0)
    rescue(r, cols - 1)
    if (rescued !== before)
      yield {
        line: 14,
        grid: grid(board, cols, `row ${r} edges`, (k) =>
          board[k] === SAFE ? "answer" : undefined
        ),
        state: [{ label: "rescued", value: rescued }],
        note: `The open cells on row ${r}'s two ends flood inward, marking everything they can reach. No verdict is being carried — a cell that is reached IS safe, and that is the entire meaning of the mark.`,
      }
  }
  for (let c = 0; c < cols; c++) {
    const before = rescued
    rescue(0, c)
    rescue(rows - 1, c)
    if (rescued !== before)
      yield {
        line: 18,
        grid: grid(board, cols, `column ${c} edges`, (k) =>
          board[k] === SAFE ? "answer" : undefined
        ),
        state: [{ label: "rescued", value: rescued }],
        note: `Same from the top and bottom of column ${c}. A region reached from any edge at all is safe, so the four sweeps together cover every way out of the grid.`,
      }
  }
  let flipped = 0
  for (let k = 0; k < board.length; k++) {
    if (board[k] === 0) {
      board[k] = 1
      flipped++
    } else if (board[k] === SAFE) board[k] = 0
  }
  const answer = captured(nums, cols)
  yield {
    line: 24,
    answer,
    grid: grid(board, cols, `${flipped} captured`, (k) =>
      nums[k] === 0 && board[k] === 1
        ? "answer"
        : board[k] === 0
          ? "anchor"
          : undefined
    ),
    state: [
      { label: "rescued", value: rescued },
      { label: "captured", value: flipped },
    ],
    corner:
      flipped === 0 ? "allsafe" : rescued === 0 ? "allcaptured" : "restore",
    note: `One sweep finishes it: every remaining 0 was never reached, so it is enclosed and becomes 1 — and every temporary mark goes back to 0. That restoration is not tidying up; skip it and the ${rescued} cells you rescued are left holding a value that means nothing outside this function.`,
  }
}

export const surroundedRegions = deriveJourney<number>(problem, {
  slug: "start-where-the-exits-are",
  subtitle: "asking what escapes is easier than asking what is trapped",
  reveals: ["graphs"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger board" },
  params: [{ key: "cols", label: "grid width" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const cols = d.cols as number
    if (!Number.isInteger(cols) || cols < 1 || nums.length % cols !== 0)
      return { ok: false, warning: "the width must divide the number of cells" }
    return nums.every((v) => v === 0 || v === 1)
      ? { ok: true }
      : { ok: false, warning: "every cell must be 0 (open) or 1 (wall)" }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
      extra: { cols: 4 },
      info: "the bottom 0 survives",
    },
    border: {
      label: "a region reaching the edge",
      nums: [0, 1, 1, 0, 1, 1, 0, 0, 1],
      extra: { cols: 3 },
      info: "connected to the outside",
    },
    allsafe: {
      label: "nothing is enclosed",
      nums: [0, 0, 0, 0],
      extra: { cols: 2 },
      info: "the grid is unchanged",
    },
    allcaptured: {
      label: "one enclosed pocket",
      nums: [1, 1, 1, 1, 0, 1, 1, 1, 1],
      extra: { cols: 3 },
      info: "the middle flips",
    },
    single: {
      label: "a single cell",
      nums: [0],
      extra: { cols: 1 },
      info: "it IS the border",
    },
    diagonal: {
      label: "touching only at a corner",
      nums: [0, 1, 1, 1, 0, 1, 1, 1, 1],
      extra: { cols: 3 },
      info: "the middle is still trapped",
    },
    long: {
      label: "a bigger board",
      nums: [
        1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1,
        0,
      ],
      extra: { cols: 5 },
      info: "five by five",
    },
  },
  edges: [
    {
      key: "border",
      name: "a region that reaches the edge",
      example: "an open cell on the border keeps its whole region",
      why: "Touching ANY border cell saves the entire connected region, however large. That is why the fast version starts at the edges: reachability from the border is the definition of surviving, not a property to be checked afterwards.",
      think:
        "What exactly makes a region safe — its size, its shape, or one cell of it?",
      preset: "border",
      constraint: 2,
    },
    {
      key: "allsafe",
      name: "nothing is enclosed at all",
      example: "a grid of open cells → unchanged",
      why: "Every cell is reachable from the border, so the answer is the input. Code that flips first and rescues afterwards has to undo everything here, which is the shape of bug that leaves a grid half-converted.",
      think:
        "Does your solution ever write a value it might have to take back?",
      preset: "allsafe",
      constraint: 2,
    },
    {
      key: "allcaptured",
      name: "everything open is enclosed",
      example: "a single open cell walled in on all four sides → flipped",
      why: "The other extreme. It is where a version that marks safe cells with a temporary value and forgets to restore it does the most visible damage — nothing was rescued, so nothing hides the leftover markers.",
      think: "What do your temporary marks look like to the caller?",
      preset: "allcaptured",
      constraint: 1,
    },
    {
      key: "diagonal",
      name: "corners do not connect",
      example:
        "an open corner cell and an open centre → the centre is still trapped",
      why: "Connectivity is four-directional. Counting a diagonal as a connection rescues regions that are genuinely enclosed, and the wrong answer is a grid that looks almost right.",
      think: "How many neighbours does your fill visit?",
      preset: "diagonal",
      constraint: 3,
    },
    {
      key: "restore",
      name: "the temporary mark has to come back",
      example: "safe cells marked 2, then written back to 0",
      why: "The mark is scaffolding, not an answer: the caller's grid may only contain 0 and 1. Leaving a 2 behind returns a grid in a private encoding, which type-checks and renders and is wrong.",
      think: "What values may the grid hold when you hand it back?",
      preset: "example",
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
        "given: a grid of 0 (open) and 1 (wall)",
        "open cells joined up, down, left or right form a region",
        "a region that touches the border survives",
        "task: flip every other region to 1, and return the grid",
      ],
      tools: [
        {
          name: "Grid",
          role: "a flat row plus a width. What decides a cell's fate is not anything about the cell — it is whether the region it belongs to has a way out.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a region survives if ANY one of its cells is on the border",
        "connectivity is four-directional, so a corner touch joins nothing",
        "so the question is really about reachability, not about being surrounded",
      ],
      quiz: [
        {
          q: "A large open region has exactly one cell on the edge of the grid. What happens to it?",
          choices: [
            "most of it is captured; the edge cell survives",
            "all of it survives — one way out saves the whole region",
          ],
          answer: 1,
          explain:
            "Being enclosed is a property of the region, not of each cell. One escape route is enough for every cell connected to it.",
        },
      ],
      run: story,
    },
    {
      key: "regions",
      name: "Fill each region, then judge it",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Flood fill every region of open cells, collecting its cells and noting whether any of them sat on the border, then flip the ones that did not.",
      takeaways: [
        "it follows the problem statement literally, region by region",
        "the verdict has to be carried through the whole traversal — the border cell might be the last one found",
        "and acting on it needs a second pass over the region's cells",
      ],
      quiz: [
        {
          q: "Why can this version not decide as it goes?",
          choices: [
            "it could, with a better data structure",
            "because a region is only known to be safe once a border cell turns up, which may be at the very end of the walk",
          ],
          answer: 1,
          explain:
            "The verdict is a property of the whole region. Nothing local can settle it, which is why the cells are collected before anything is written.",
        },
      ],
      run: fillAndCheck,
    },
    {
      key: "border",
      name: "Flood inward from the edges",
      short: "invert it",
      insight:
        "Deciding whether a region is enclosed means carrying a verdict through a traversal and then going back to act on it — and the opposite question, 'can this region reach the border', has no verdict to carry at all.",
      idea: problem.approach,
      takeaways: [
        "flood from every open cell on the border: everything reached is safe, by definition",
        "no per-region bookkeeping, because being reached IS the answer",
        "then one sweep: every remaining 0 was unreachable and becomes 1",
        "and every temporary mark must be restored — it is scaffolding, and the caller's grid may only hold 0 and 1",
      ],
      quiz: [
        {
          q: "What does the temporary mark mean while the fill is running?",
          choices: [
            "this cell is being processed",
            "this cell is reachable from the border, and therefore already known to be safe",
          ],
          answer: 1,
          explain:
            "That is why no verdict is needed: the mark is the conclusion, applied the moment the cell is touched.",
        },
      ],
      run: fromTheBorder,
    },
  ],
})
