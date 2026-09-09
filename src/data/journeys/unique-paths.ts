// Paths Across a Grid, derived. The input is two numbers — the row holds m
// then n — which makes this the second journey with no sequence to walk, after
// generate-parens. What the stage draws is the TABLE being filled.
//
// The lesson lands in two steps rather than one: the recursion is exponential
// because it asks each cell's question once per path through it; and once the
// table exists, noticing that a cell reads only the row above and the value to
// its left collapses the whole grid to a single row updated in place.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/unique-paths.ts"

type G = Data<number>

const dims = (nums: number[]) => ({ m: nums[0] ?? 1, n: nums[1] ?? 1 })

/** The reference: how many right/down paths cross the grid. */
export function pathCount(nums: number[]) {
  const { m, n } = dims(nums)
  const row = Array.from({ length: n }, () => 1)
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) row[c] += row[c - 1]
  return row[n - 1]
}

/** The grid of path counts, with cells not yet filled left blank. */
const table = (
  m: number,
  n: number,
  value: (r: number, c: number) => number | "",
  label: string,
  mark?: (r: number, c: number) => ChipRole | undefined
) => {
  const cells: (number | string)[][] = []
  const marks: Record<string, ChipRole> = {}
  for (let r = 0; r < m; r++) {
    const row: (number | string)[] = []
    for (let c = 0; c < n; c++) {
      row.push(value(r, c))
      const k = mark?.(r, c)
      if (k) marks[`${r},${c}`] = k
    }
    cells.push(row)
  }
  return { cells, marks, label }
}

function* story({ nums }: G): Generator<DFrame> {
  const { m, n } = dims(nums)
  const answer = pathCount(nums)
  yield {
    hold: 3,
    noChips: true,
    note: `A robot at the top-left of a ${m} by ${n} grid, allowed to move only right or down. How many different paths reach the bottom-right corner?`,
  }
  yield {
    hold: 3,
    grid: table(
      m,
      n,
      () => "",
      "right or down only",
      (r, c) =>
        r === 0 && c === 0
          ? "anchor"
          : r === m - 1 && c === n - 1
            ? "answer"
            : undefined
    ),
    state: [
      { label: "rows", value: m },
      { label: "columns", value: n },
    ],
    note: "Only right and down, which is what keeps the count finite: every path has exactly the same length, and no path can ever revisit a cell. Allow a single move upward and there would be infinitely many.",
  }
  yield {
    hold: 3,
    grid: table(
      m,
      n,
      () => "",
      `${answer} ${answer === 1 ? "path" : "paths"}`,
      (r, c) => (r === 0 || c === 0 ? "focus" : undefined)
    ),
    answer,
    corner: m === 1 || n === 1 ? "thin" : m === 1 && n === 1 ? "one" : "edges",
    note:
      m === 1 || n === 1
        ? `One cell wide or one cell tall, so there is exactly ${answer} path: straight along. Worth having as a case because it is what the whole first row and first column of the table are made of.`
        : `${answer} paths. Look at the lit edges: every cell in the top row and the left column has exactly ONE way to reach it, because there is only one direction available to get there. That is the seed the rest is built from.`,
  }
}

/** Rung 1 — branch at every cell. */
function* branch({ nums }: G): Generator<DFrame> {
  const { m, n } = dims(nums)
  const asked = new Map<string, number>()
  let calls = 0
  let repeats = 0
  function* walk(r: number, c: number): Generator<DFrame, number> {
    calls++
    const key = `${r},${c}`
    if (asked.has(key)) repeats++
    asked.set(key, (asked.get(key) ?? 0) + 1)
    if (r === m - 1 || c === n - 1) {
      yield {
        line: 2,
        grid: table(
          m,
          n,
          (rr, cc) => (asked.has(`${rr},${cc}`) ? 1 : ""),
          "an edge: one way home",
          (rr, cc) =>
            rr === r && cc === c
              ? "answer"
              : asked.has(`${rr},${cc}`)
                ? "dim"
                : undefined
        ),
        state: [
          { label: "at", value: `${r},${c}` },
          { label: "calls", value: calls },
        ],
        corner: "edges",
        note: `From ${r},${c} the robot is on the last row or the last column, so there is exactly one way to finish: straight along. That is the base case, and it is the only place this version produces a number.`,
      }
      return 1
    }
    const down = yield* walk(r + 1, c)
    const right = yield* walk(r, c + 1)
    yield {
      line: 3,
      grid: table(
        m,
        n,
        (rr, cc) => (asked.has(`${rr},${cc}`) ? "" : ""),
        `${down} + ${right}`,
        (rr, cc) =>
          rr === r && cc === c
            ? "focus"
            : (rr === r + 1 && cc === c) || (rr === r && cc === c + 1)
              ? "anchor"
              : (asked.get(`${rr},${cc}`) ?? 0) > 1
                ? "dim"
                : undefined
      ),
      state: [
        { label: "at", value: `${r},${c}` },
        { label: "down + right", value: `${down} + ${right}` },
        { label: "repeats so far", value: repeats },
      ],
      note: `${r},${c} is worth ${down + right}: everything reachable by going down, plus everything reachable by going right. Correct — and the two branches overlap almost everywhere, so cells in the middle are asked about again and again.`,
    }
    return down + right
  }
  const answer = yield* walk(0, 0)
  yield {
    line: 6,
    answer,
    grid: table(
      m,
      n,
      () => "",
      `${answer}`,
      () => "answer"
    ),
    state: [
      { label: "answer", value: answer },
      { label: "calls made", value: calls },
      { label: "questions repeated", value: repeats },
      { label: "distinct cells", value: m * n },
    ],
    corner: m === 1 || n === 1 ? "thin" : undefined,
    note: `${answer}, from ${calls} calls — ${repeats} of which re-asked a question already answered. There are only ${m * n} distinct cells, so the gap between ${calls} and ${m * n} is pure repetition, and it doubles with every extra row.`,
  }
}

/** Rung 2 — one row, updated in place. */
function* oneRow({ nums }: G): Generator<DFrame> {
  const { m, n } = dims(nums)
  const row = Array.from({ length: n }, () => 1)
  let writes = 0
  yield {
    line: 1,
    grid: table(
      m,
      n,
      (r) => (r === 0 ? 1 : ""),
      "the top row is all ones",
      (r) => (r === 0 ? "anchor" : undefined)
    ),
    state: [{ label: "row", value: row.join(" ") }],
    corner: "edges",
    note: "The top row is all ones: there is exactly one way to reach any cell along it, straight across. That row is the whole starting state, and there is no separate table.",
  }
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      const above = row[c]
      const left = row[c - 1]
      row[c] += row[c - 1]
      writes++
      yield {
        line: 4,
        grid: table(
          m,
          n,
          (rr, cc) => (rr === r ? (cc <= c ? row[cc] : 1) : rr < r ? "" : ""),
          `${above} + ${left} = ${row[c]}`,
          (rr, cc) =>
            rr === r && cc === c
              ? "focus"
              : rr === r && cc === c - 1
                ? "anchor"
                : rr === r - 1 && cc === c
                  ? "anchor"
                  : undefined
        ),
        state: [
          { label: "row", value: r },
          { label: "cell", value: row[c] },
        ],
        note: `The slot already held ${above} — the count from the row ABOVE, because nothing has overwritten it yet. Adding ${left}, the value to its left, which was updated a moment ago and so belongs to THIS row. One slot, two rows' worth of information, and that is why a single row is enough.`,
      }
    }
  }
  const answer = pathCount(nums)
  yield {
    line: 5,
    answer,
    grid: table(
      m,
      n,
      (r, c) => (r === m - 1 ? row[c] : ""),
      `${answer}`,
      (r, c) => (r === m - 1 && c === n - 1 ? "answer" : undefined)
    ),
    state: [
      { label: "answer", value: answer },
      { label: "additions", value: writes },
      { label: "memory", value: `${n} numbers` },
    ],
    corner: m === 1 && n === 1 ? "one" : m === 1 || n === 1 ? "thin" : "edges",
    note: `${answer}, in ${writes} ${writes === 1 ? "addition" : "additions"} and ${n} numbers of memory. Every cell was computed exactly once, and the grid was never stored — the row is overwritten as it descends, because a cell only ever needs the value above it and the one to its left.`,
  }
}

export const uniquePaths = deriveJourney<number>(problem, {
  slug: "above-plus-left",
  subtitle: "one row, overwritten as it falls down the grid",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger grid" },
  classify: (d) => {
    const nums = d.nums as number[]
    return nums.length === 2 &&
      nums.every((v) => Number.isInteger(v) && v >= 1 && v <= 8)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "two numbers, rows then columns, each from 1 to 8 (the real problem allows 100; the animation would not fit)",
        }
  },
  presets: {
    example: { label: "3 by 7", nums: [3, 7], info: "28 paths" },
    small: { label: "3 by 2", nums: [3, 2], info: "3 paths" },
    thin: { label: "one row", nums: [1, 5], info: "exactly one path" },
    column: { label: "one column", nums: [6, 1], info: "also one path" },
    one: {
      label: "a single cell",
      nums: [1, 1],
      info: "one path: stand still",
    },
    square: { label: "4 by 4", nums: [4, 4], info: "20 paths" },
    long: { label: "a bigger grid", nums: [6, 6], info: "252 paths" },
  },
  edges: [
    {
      key: "thin",
      name: "one row, or one column",
      example: "1 by 5 → 1 path",
      why: "There is no choice to make anywhere, so the answer is 1. It is also the base case in disguise: the top row and left column of the table are exactly this input repeated, which is why they are seeded with ones.",
      think: "How many paths cross a grid with no room to turn?",
      preset: "thin",
      constraint: 3,
    },
    {
      key: "one",
      name: "a single cell",
      example: "1 by 1 → 1",
      why: "The robot is already at the corner, and doing nothing is a path. Returning 0 here is a defensible-looking mistake that breaks the recurrence for every larger grid built on it.",
      think: "Is 'no moves' a path?",
      preset: "one",
      constraint: 3,
    },
    {
      key: "edges",
      name: "the top row and the left column",
      example: "every cell on them has exactly one path in",
      why: "They are the only cells with no choice about where they came from, so they seed the whole table. Filling them with 0, or forgetting to fill them at all, produces an answer of 0 everywhere — a failure that looks like the algorithm rather than the setup.",
      think: "What is in your table before the first real cell is computed?",
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
        "given: a grid m rows by n columns",
        "the robot starts top-left and may move only RIGHT or DOWN",
        "task: how many distinct paths reach the bottom-right cell",
        "a grid one cell wide, or one tall, has exactly one",
      ],
      tools: [
        {
          name: "The grid",
          role: "there is no input sequence here — the row holds two numbers. What is drawn is the answer being built: how many ways reach each cell.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "right and down only, so no path can revisit a cell and every path is the same length",
        "exactly two cells lead into any interior cell: the one above and the one to the left",
        "the top row and left column have one path each, and they seed everything",
      ],
      quiz: [
        {
          q: "Which cells can lead directly into an interior cell?",
          choices: [
            "all four neighbours",
            "two: the cell above it and the cell to its left",
          ],
          answer: 1,
          explain:
            "Because the moves are right and down, arriving at a cell means having come from above or from the left. That is the entire recurrence.",
        },
      ],
      run: story,
    },
    {
      key: "branch",
      name: "Try both moves everywhere",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "From each cell, count the paths reached by moving down and by moving right, and add them. On the last row or last column there is exactly one way home.",
      takeaways: [
        "it states the rule directly and needs no table at all",
        "but the two branches overlap: a cell in the middle is reached along many different prefixes",
        "so the same cell's question is asked once per path through it, which is exponential",
        "while the number of DISTINCT questions is only m × n",
      ],
      quiz: [
        {
          q: "Two different prefixes arrive at the same cell. How much do their futures have in common?",
          choices: [
            "nothing — they took different routes",
            "everything: from that cell on, the count depends only on where you are",
          ],
          answer: 1,
          explain:
            "The history is not read by anything downstream. That is exactly what makes the repetition removable.",
        },
      ],
      run: branch,
    },
    {
      key: "row",
      name: "Add the one on your left",
      short: "one row",
      insight:
        "The recursion asks the same cell's question once for every path that passes through it — and a cell's answer depends only on its position, never on how the robot got there.",
      idea: problem.whyNow!,
      takeaways: [
        "paths(r, c) = paths(r−1, c) + paths(r, c−1), and the top row and left column are all ones",
        "each cell is computed exactly once",
        "one row is enough: the slot still holds the row above until it is overwritten, and the value to its left has already been updated for this row",
        "so the memory is a row rather than a grid, and the sweep direction is what makes that safe",
      ],
      quiz: [
        {
          q: "In the single-row version, what does row[c] hold at the moment it is read?",
          choices: [
            "the value for this row",
            "the value from the row ABOVE — it has not been overwritten yet, which is exactly what the recurrence needs",
          ],
          answer: 1,
          explain:
            "One slot carries both rows at different moments. Sweeping left to right is what keeps 'above' and 'left' straight without a second array.",
        },
      ],
      run: oneRow,
    },
  ],
})
