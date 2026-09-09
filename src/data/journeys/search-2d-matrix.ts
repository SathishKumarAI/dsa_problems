// Search a Fully Sorted Matrix, derived. The grid arrives here already
// flattened, because that IS the lesson: two guarantees together mean the
// matrix was never two-dimensional for the purposes of searching it.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/search-2d-matrix.ts"

type N = Data<number> & { cols: number; target: number }

export const holdsTarget = (nums: number[], target: number) =>
  nums.includes(target)

const ruledOut = (n: number, lo: number, hi: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) if (i < lo || i > hi) marks[i] = "dim"
  return marks
}

const rowOf = (i: number, cols: number) => Math.floor(i / cols)

function* story({ nums, cols, target }: N): Generator<DFrame> {
  const rows = nums.length / cols
  yield {
    hold: 3,
    noChips: true,
    note: `A ${rows} by ${cols} grid, drawn here as one row because that is what it turns out to be. Every row of the grid ascends, AND every row starts above where the previous one ended. Is ${target} in it?`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Two guarantees, and the second one is the whole problem. Rows being sorted individually would leave a grid. Rows being sorted RELATIVE TO EACH OTHER means reading it left to right, top to bottom, gives one single ascending sequence — there is no second dimension left to search.",
  }
  const at = nums.indexOf(target)
  yield {
    hold: 3,
    marks: {
      ...(Object.fromEntries(
        nums.map((_, i) => [i, rowOf(i, cols) % 2 ? "dim" : "focus"])
      ) as Record<number, ChipRole>),
      ...(at >= 0 ? ({ [at]: "answer" } as Record<number, ChipRole>) : {}),
    },
    state: [
      { label: "target", value: target },
      { label: "found", value: at >= 0 ? "true" : "false" },
    ],
    answer: at >= 0,
    corner:
      at < 0
        ? "absent"
        : rows === 1
          ? "onerow"
          : at >= cols
            ? "spansrows"
            : undefined,
    note:
      at < 0
        ? `${target} is nowhere in the grid, so the answer is false. It falls between two neighbouring values that are already adjacent in the sequence — which is what "between rows" really means once the second dimension is gone.`
        : rows === 1
          ? `A single row, so the grid and the sequence are the same thing and ${target} sits at ${at}. The degenerate case, and any index arithmetic dividing by the width still has to survive it.`
          : at >= cols
            ? `${target} sits at position ${at} of the sequence — row ${rowOf(at, cols)}, column ${at % cols}. Nothing was searched twice and no row was chosen first: position ${at} is a single number, and the two coordinates are recovered from it by a division and a remainder.`
            : `${target} sits at position ${at} — row 0, column ${at}.`,
  }
}

function* scanAll({ nums, cols, target }: N): Generator<DFrame> {
  for (let i = 0; i < nums.length; i++) {
    const hit = nums[i] === target
    yield {
      line: 3,
      marks: { [i]: hit ? "answer" : "focus" },
      state: [
        { label: "row·col", value: `${rowOf(i, cols)}·${i % cols}` },
        { label: "value", value: nums[i] },
      ],
      note: hit
        ? `${nums[i]} at row ${rowOf(i, cols)}, column ${i % cols} — found.`
        : `${nums[i]} is not ${target}. Next cell.`,
    }
    if (hit) {
      yield { line: 4, answer: true, note: "Return true." }
      return
    }
  }
  yield {
    line: 5,
    answer: false,
    note: `Every cell read, ${target} nowhere: false. It walks past values it already knows are too small, because it never once uses the fact that anything is sorted.`,
  }
}

function* rowThenSearch({ nums, cols, target }: N): Generator<DFrame> {
  const rows = nums.length / cols
  let row = -1
  for (let r = 0; r < rows; r++) {
    const last = nums[r * cols + cols - 1]
    yield {
      line: 3,
      marks: {
        ...(Object.fromEntries(
          nums.map((_, i) => [i, rowOf(i, cols) === r ? "focus" : "dim"])
        ) as Record<number, ChipRole>),
        [r * cols + cols - 1]: "anchor",
      },
      state: [{ label: "row", value: r }],
      note: `Row ${r} ends at ${last}. ${last >= target ? `That is at least ${target}, so if the target is anywhere it is in this row.` : `Everything in this row is below ${target} — skip it entirely.`}`,
    }
    if (last >= target) {
      row = r
      break
    }
  }
  if (row < 0) {
    yield {
      line: 7,
      answer: false,
      note: `No row reaches ${target}, so it is past the end of the grid: false.`,
    }
    return
  }
  let lo = row * cols
  let hi = lo + cols - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const hit = nums[mid] === target
    yield {
      line: 11,
      marks: { ...ruledOut(nums.length, lo, hi), [mid]: hit ? "answer" : "focus" },
      state: [{ label: "inside row", value: row }],
      note: hit
        ? `${nums[mid]} — found, at column ${mid % cols} of row ${row}.`
        : `${nums[mid]} is ${nums[mid] < target ? "below" : "above"} ${target}; half of this row goes.`,
    }
    if (hit) {
      yield { line: 12, answer: true, note: "Return true." }
      return
    }
    if (nums[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  yield {
    line: 17,
    answer: false,
    note: `${target} is not in the only row that could hold it: false. Logarithmic inside the row — and the walk down to that row was linear in the number of rows, which is half the guarantee thrown away.`,
  }
}

function* flatten({ nums, cols, target }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let probes = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    probes += 1
    const hit = nums[mid] === target
    yield {
      line: hit ? 8 : nums[mid] < target ? 10 : 12,
      marks: { ...ruledOut(nums.length, lo, hi), [mid]: hit ? "answer" : "focus" },
      state: [
        { label: "row·col", value: `${rowOf(mid, cols)}·${mid % cols}` },
        { label: "probes", value: probes },
      ],
      note: hit
        ? `Position ${mid} of the sequence — row ${rowOf(mid, cols)}, column ${mid % cols} — holds ${target}. Found in ${probes} probe${probes === 1 ? "" : "s"}.`
        : `Position ${mid} is row ${rowOf(mid, cols)}, column ${mid % cols}: ${nums[mid]}, which is ${nums[mid] < target ? "below" : "above"} ${target}. Half of the WHOLE GRID goes — not half of a row.`,
    }
    if (hit) {
      yield { line: 8, answer: true, note: "Return true." }
      return
    }
    if (nums[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  yield {
    line: 13,
    answer: false,
    state: [{ label: "probes", value: probes }],
    note: `The range emptied: false, after ${probes} probe${probes === 1 ? "" : "s"} over ${nums.length} cells. One search, no row selection, and the two coordinates only ever appear when a cell is actually read — as a division and a remainder.`,
  }
}

export const search2dMatrix = deriveJourney(problem, {
  slug: "one-search-over-a-grid",
  subtitle: "two guarantees, and the second one removes a dimension",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger grid" },
  params: [
    { key: "cols", label: "row width" },
    { key: "target", label: "target" },
  ],
  classify: (d) => {
    const nums = d.nums as number[]
    const cols = d.cols as number
    if (!Number.isInteger(cols) || cols < 1 || nums.length % cols !== 0)
      return { ok: false, warning: "the row width must divide the number of cells" }
    return nums.every((v, i) => i === 0 || nums[i - 1] < v)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "read left to right, top to bottom, the grid must ascend — that is both guarantees at once",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60],
      extra: { cols: 4, target: 3 },
    },
    absent: {
      label: "it falls between rows",
      nums: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60],
      extra: { cols: 4, target: 13 },
      info: "in neither row's range",
    },
    spansrows: {
      label: "in a later row",
      nums: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60],
      extra: { cols: 4, target: 34 },
      info: "row 2, column 2",
    },
    onerow: {
      label: "a single row",
      nums: [2, 4, 6, 8],
      extra: { cols: 4, target: 6 },
      info: "grid and sequence are the same thing",
    },
    onecol: {
      label: "a single column",
      nums: [2, 4, 6],
      extra: { cols: 1, target: 4 },
      info: "width 1, and the arithmetic still has to hold",
    },
    long: {
      label: "a bigger grid",
      nums: [
        1, 4, 7, 11, 15, 18, 20, 23, 30, 34, 37, 41, 45, 48, 52, 55, 60, 64, 70,
        75,
      ],
      extra: { cols: 5, target: 48 },
    },
  },
  edges: [
    {
      key: "absent",
      name: "the target falls between rows",
      example: "target 13 in a grid holding 11 then 16 → false",
      why: "13 belongs between two values that are already neighbours in the sequence, so there is nowhere for it to be. 'Between rows' is only a picture — in the sequence it is an ordinary gap.",
      think: "Once the grid is one sequence, what does 'between rows' actually mean?",
      preset: "absent",
      constraint: 3,
    },
    {
      key: "onerow",
      name: "a single row",
      example: "[2, 4, 6, 8], width 4 → the sequence is the row",
      why: "The grid and the flattened sequence are identical, so every row/column calculation still has to produce row 0 and the right column rather than dividing by something it assumes is smaller.",
      think: "Does your index arithmetic hold when there is only one row — or only one column?",
      preset: "onerow",
      constraint: 0,
    },
    {
      key: "spansrows",
      name: "the target is in a later row",
      example: "target 34 → row 2, column 2",
      why: "A single search over the whole sequence lands there directly. Choosing a row first means walking past every earlier row to reach it, which is the linear part the second guarantee makes unnecessary.",
      think: "Do you need to know which row before you can search?",
      preset: "spansrows",
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
        "given: a grid, each row ascending",
        "and: every row starts above where the last one ended",
        "so: read top to bottom, left to right — one ascending sequence",
        "task: is the target in it?",
      ],
      tools: [
        {
          name: "Fully sorted grid",
          role: "two dimensions on the page and one in practice. Position k of the sequence is row k / width, column k % width — the coordinates are derived, never searched for.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "each row sorted would leave a genuine grid problem",
        "rows sorted relative to each other collapse it into a single sequence",
        "a position in that sequence carries both coordinates: divide for the row, take the remainder for the column",
      ],
      quiz: [
        {
          q: "Which guarantee makes the grid one sequence?",
          choices: [
            "that every row is sorted",
            "that every row starts above where the previous one ended",
          ],
          answer: 1,
          explain:
            "Sorted rows alone still leave rows to choose between. The second guarantee is what joins them end to end.",
        },
      ],
      run: story,
    },
    {
      key: "scan",
      name: "Read every cell",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the grid cell by cell comparing each value with the target.",
      takeaways: [
        "m × n reads, and it uses neither guarantee",
        "it walks past values it already knows are too small",
      ],
      run: scanAll,
    },
    {
      key: "rowfirst",
      name: "Pick the row, then search it",
      short: "half the guarantee",
      from: 1,
      insight:
        "The full scan uses nothing. Each row being sorted means a row can be searched properly — so find the row whose last value reaches the target, then binary search inside it.",
      idea: "Walk down the rows until one ends at or above the target, then run an ordinary binary search inside that single row.",
      takeaways: [
        "this exploits the first guarantee and ignores the second",
        "the walk down the rows is linear in the number of rows",
        "m + log n — better than m × n, and still carrying a linear term for no reason",
      ],
      run: rowThenSearch,
    },
    {
      key: "flatten",
      name: "One search over the whole thing",
      short: "log of the cell count",
      insight:
        "Choosing a row first treats the grid as two-dimensional, and the second guarantee says it is not. If the cells form one ascending sequence, then one binary search over all of them is the whole algorithm.",
      idea: problem.whyNow!,
      takeaways: [
        "search positions 0 to m·n − 1 as if the grid were a single row",
        "a position becomes coordinates only when a cell is read: divide by the width, take the remainder",
        "each probe discards half the GRID, not half a row",
        "log(m·n) — and it never needs to decide which row anything is in",
      ],
      quiz: [
        {
          q: "Why does this rung never need to choose a row?",
          choices: [
            "because it searches every row at once",
            "because a position in the sequence already determines the row — the coordinates come out of the arithmetic",
          ],
          answer: 1,
          explain:
            "The row is a consequence of the index, not a decision. Nothing is searched for twice.",
        },
      ],
      run: flatten,
    },
  ],
})
