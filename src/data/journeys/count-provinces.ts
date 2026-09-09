// Count the Provinces, derived. The adjacency MATRIX is the grid on screen —
// a graph written as a table, which is what makes this problem a good place to
// meet union-find: the same question answered by walking, and by merging.
//
// The ladder does not climb in cost. Both rungs are effectively linear in the
// matrix, and the flood fill is the shorter code. Union-find earns its place
// when the edges arrive over time, which the recap says plainly.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/count-provinces.ts"

type M = Data<number> & { cols: number }

const at = (nums: number[], n: number, i: number, j: number) => nums[i * n + j]

/** The reference: how many connected groups of cities the matrix describes. */
export function provinces(nums: number[], n: number) {
  const seen = Array.from({ length: n }, () => false)
  let groups = 0
  const sink = (i: number) => {
    seen[i] = true
    for (let j = 0; j < n; j++) if (at(nums, n, i, j) === 1 && !seen[j]) sink(j)
  }
  for (let i = 0; i < n; i++)
    if (!seen[i]) {
      sink(i)
      groups++
    }
  return groups
}

/** Which province each city ends in — the story act colours them. */
function labelOf(nums: number[], n: number) {
  const id = Array.from({ length: n }, () => -1)
  let next = 0
  const sink = (i: number, g: number) => {
    id[i] = g
    for (let j = 0; j < n; j++)
      if (at(nums, n, i, j) === 1 && id[j] === -1) sink(j, g)
  }
  for (let i = 0; i < n; i++) if (id[i] === -1) sink(i, next++)
  return id
}

const table = (
  nums: number[],
  n: number,
  label: string,
  mark?: (i: number, j: number) => ChipRole | undefined
) => {
  const cells: number[][] = []
  const marks: Record<string, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      row.push(at(nums, n, i, j))
      const m = mark?.(i, j)
      if (m) marks[`${i},${j}`] = m
    }
    cells.push(row)
  }
  return { cells, marks, label }
}

const symmetric = (nums: number[], n: number) => {
  if (nums.length !== n * n) return false
  for (let i = 0; i < n; i++) {
    if (at(nums, n, i, i) !== 1) return false
    for (let j = 0; j < n; j++) {
      if (at(nums, n, i, j) !== 0 && at(nums, n, i, j) !== 1) return false
      if (at(nums, n, i, j) !== at(nums, n, j, i)) return false
    }
  }
  return true
}

function* story({ nums, cols: n }: M): Generator<DFrame> {
  const id = labelOf(nums, n)
  const answer = provinces(nums, n)
  yield {
    hold: 3,
    noChips: true,
    note: "A table of cities. Cell [i][j] is 1 when city i is directly connected to city j. Count the provinces — groups of cities reachable from one another, directly or through others.",
  }
  yield {
    hold: 3,
    grid: table(nums, n, "the matrix is the graph", (i, j) =>
      i === j ? "dim" : at(nums, n, i, j) === 1 ? "focus" : undefined
    ),
    state: [{ label: "cities", value: n }],
    note: "This is a graph written as a table: row i lists which cities i touches. The diagonal is always 1 and says nothing — every city is connected to itself — and the table is symmetric, so each edge appears twice.",
  }
  const sizes = Array.from(
    { length: answer },
    (_, g) => id.filter((v) => v === g).length
  )
  const indirect = (() => {
    for (let a = 0; a < n; a++)
      for (let b = 0; b < n; b++)
        if (a !== b && id[a] === id[b] && at(nums, n, a, b) === 0) return [a, b]
    return null
  })()
  yield {
    hold: 3,
    grid: table(
      nums,
      n,
      `${answer} ${answer === 1 ? "province" : "provinces"}`,
      (i, j) =>
        i === j
          ? id[i] % 2
            ? "answer"
            : "anchor"
          : at(nums, n, i, j) === 1
            ? "focus"
            : undefined
    ),
    state: [
      { label: "provinces", value: answer },
      { label: "sizes", value: sizes.join(", ") },
    ],
    answer,
    corner: indirect
      ? "transitive"
      : answer === n
        ? "alone"
        : answer === 1
          ? "one"
          : undefined,
    note: indirect
      ? `${answer} ${answer === 1 ? "province" : "provinces"}. Look at cities ${indirect[0]} and ${indirect[1]}: their cell is 0, they are not directly connected — and they are in the same province anyway, because connection is TRANSITIVE. That is what makes this more than counting 1s.`
      : answer === n
        ? "Nothing is connected to anything, so every city is a province of one. A city with no neighbours is still a province — the answer is the number of cities, not zero."
        : answer === 1
          ? "Every city reaches every other, one way or another, so there is a single province covering them all."
          : `${answer} provinces, of sizes ${sizes.join(", ")}.`,
  }
}

/** Rung 1 — flood fill from each unvisited city. */
function* floodFill({ nums, cols: n }: M): Generator<DFrame> {
  const seen = Array.from({ length: n }, () => false)
  let groups = 0
  let reads = 0
  yield {
    line: 9,
    grid: table(nums, n, "nothing visited"),
    state: [{ label: "provinces", value: 0 }],
    note: "One flag per city, all false, and a count at zero. A province is whatever one walk can reach.",
  }
  function* sink(i: number, g: number): Generator<DFrame> {
    seen[i] = true
    yield {
      line: 1,
      grid: table(nums, n, `city ${i} joins province ${g + 1}`, (r) =>
        r === i ? "focus" : seen[r] ? "dim" : undefined
      ),
      state: [
        { label: "reached", value: seen.filter(Boolean).length },
        { label: "province", value: g + 1 },
      ],
      note: `City ${i} is marked as seen before its row is read — the mark is the visited set, and marking on entry is what stops two connected cities calling each other forever.`,
    }
    for (let j = 0; j < n; j++) {
      reads++
      if (at(nums, n, i, j) === 1 && !seen[j]) yield* sink(j, g)
    }
  }
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue
    yield* sink(i, groups)
    groups++
    yield {
      line: 14,
      grid: table(nums, n, `${groups} so far`, (r) =>
        seen[r] ? "answer" : undefined
      ),
      state: [{ label: "provinces", value: groups }],
      note: `That walk reached everything it could, so one whole province is accounted for: ${groups} so far. The next unvisited city starts the next one.`,
    }
  }
  const answer = provinces(nums, n)
  yield {
    line: 15,
    answer,
    grid: table(
      nums,
      n,
      `${answer} ${answer === 1 ? "province" : "provinces"}`
    ),
    state: [
      { label: "provinces", value: answer },
      { label: "cells read", value: reads },
    ],
    corner: answer === n ? "alone" : answer === 1 ? "one" : undefined,
    note: `${answer}, after reading ${reads} cells. Short and correct — and note what it needs: the WHOLE matrix, present and unchanging, before the first walk. Every reachability question is answered by walking again.`,
  }
}

/** Rung 2 — union-find: merge the ends of every edge, count what is left. */
function* unionFind({ nums, cols: n }: M): Generator<DFrame> {
  const parent = Array.from({ length: n }, (_, i) => i)
  let merges = 0
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const roots = () => Array.from({ length: n }, (_, i) => find(i))
  yield {
    line: 9,
    grid: table(nums, n, "every city its own group", (i, j) =>
      i === j ? "focus" : undefined
    ),
    state: [{ label: "groups", value: n }],
    corner: "diagonal",
    note: `Start from the opposite end: ${n} ${n === 1 ? "city" : "cities"}, ${n} ${n === 1 ? "group" : "groups"}, nothing merged. The answer starts at its maximum and only ever falls. Note where the edge loop begins: at j = i + 1, so the highlighted diagonal is never read as an edge — a city connected to itself is true and useless, and merging it with itself is a step that does nothing but can be miscounted.`,
  }
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (at(nums, n, i, j) !== 1) continue
      const a = find(i)
      const b = find(j)
      if (a === b) {
        yield {
          line: 14,
          grid: table(nums, n, `${i} and ${j} already together`, (r, c) =>
            (r === i && c === j) || (r === j && c === i)
              ? "dim"
              : find(r) === a && r === c
                ? "anchor"
                : undefined
          ),
          state: [
            { label: "groups", value: new Set(roots()).size },
            { label: "edge", value: `${i}–${j}` },
          ],
          corner: "transitive",
          note: `Edge ${i}–${j}, and both ends already answer to the same representative — they were joined through other cities. Nothing to do. This is transitivity being enforced by the structure rather than discovered by a walk.`,
        }
        continue
      }
      parent[a] = b
      merges++
      yield {
        line: 15,
        grid: table(nums, n, `${i} joins ${j}`, (r, c) =>
          (r === i && c === j) || (r === j && c === i)
            ? "answer"
            : r === c && find(r) === find(i)
              ? "focus"
              : undefined
        ),
        state: [
          { label: "groups", value: new Set(roots()).size },
          { label: "merges", value: merges },
        ],
        note: `Edge ${i}–${j} joins two different groups, so one representative now points at the other. Every city in both groups moved at once — nobody walked them, and nobody had to.`,
      }
    }
  const answer = provinces(nums, n)
  yield {
    line: 16,
    answer,
    grid: table(
      nums,
      n,
      `${answer} ${answer === 1 ? "group" : "groups"} left`,
      (i, j) => (i === j ? (find(i) === i ? "answer" : "dim") : undefined)
    ),
    state: [
      { label: "provinces", value: answer },
      { label: "merges", value: merges },
    ],
    corner: answer === n ? "alone" : answer === 1 ? "one" : undefined,
    note: `${answer}. The answer is the number of cities that are still their own representative — highlighted on the diagonal. ${merges} ${merges === 1 ? "merge" : "merges"} did all the work, and each one settled a whole group rather than a city.`,
  }
}

export const countProvinces = deriveJourney<number>(problem, {
  slug: "who-belongs-with-whom",
  subtitle:
    "merge the ends of every edge, then count who is left standing alone",
  reveals: ["graphs"],
  defaultPreset: "example",
  harder: { preset: "long", label: "more cities" },
  params: [{ key: "cols", label: "cities (n)" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const n = d.cols as number
    if (!Number.isInteger(n) || n < 1 || nums.length !== n * n)
      return { ok: false, warning: "the matrix must be n × n" }
    return symmetric(nums, n)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "cells are 0 or 1, the diagonal is 1, and [i][j] must equal [j][i]",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 1, 0, 1, 1, 0, 0, 0, 1],
      extra: { cols: 3 },
      info: "two provinces",
    },
    alone: {
      label: "nothing connected",
      nums: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      extra: { cols: 3 },
      info: "three provinces of one",
    },
    one: {
      label: "all one province",
      nums: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      extra: { cols: 3 },
      info: "everything reaches everything",
    },
    transitive: {
      label: "connected through a third city",
      nums: [1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1],
      extra: { cols: 4 },
      info: "0 and 2 never touch directly",
    },
    single: {
      label: "one city",
      nums: [1],
      extra: { cols: 1 },
      info: "one province",
    },
    long: {
      label: "more cities",
      nums: [
        1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0,
        0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
      ],
      extra: { cols: 6 },
      info: "a chain and a pair",
    },
  },
  edges: [
    {
      key: "transitive",
      name: "connected through somebody else",
      example: "0–1 and 1–2, with no 0–2 → one province of three",
      why: "Connection is transitive, so a province is not a list of direct links. Counting rows that share a 1 gets this wrong; the whole point of both approaches is to close that gap, one by walking and one by merging.",
      think: "Can two cities be in the same province with a 0 in their cell?",
      preset: "transitive",
      constraint: 2,
    },
    {
      key: "alone",
      name: "a city connected to nothing",
      example: "an identity matrix → one province per city",
      why: "A lone city is a province of one, so the answer is the number of cities and never zero. Code that only counts groups it merged, or that starts its count at 0 and adds one per edge, misses every isolated city.",
      think: "What does your count say for a city that no edge ever mentions?",
      preset: "alone",
      constraint: 3,
    },
    {
      key: "one",
      name: "everything in one province",
      example: "a matrix of 1s → 1",
      why: "The lower bound, and the case where every edge after the first few merges nothing. A union that does not check whether the two ends are already together will happily point a representative at itself and lose a group.",
      think:
        "What happens when you merge two cities that are already in the same group?",
      preset: "one",
      constraint: 1,
    },
    {
      key: "diagonal",
      name: "the diagonal is always 1",
      example: "matrix[i][i] = 1 for every i",
      why: "It says a city is connected to itself, which is true and useless. Counting it as an edge merges a city with itself and, in a version that counts merges rather than groups, silently changes the answer.",
      think: "Does your edge loop start at j = 0 or at j = i + 1?",
      preset: "single",
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
        "given: an n × n matrix, [i][j] = 1 when city i touches city j",
        "the matrix is symmetric and its diagonal is all 1s",
        "connection is transitive: a–b and b–c puts a, b, c together",
        "task: count the groups",
      ],
      tools: [
        {
          name: "Adjacency matrix",
          role: "a graph written as a table — row i lists what city i touches. Drawn here as the grid itself, so the edges are visible as cells rather than hidden behind an edge list.",
        },
      ],
      // the problem's third hint names a later act by name, which the
      // disclosure rule forbids on the story act — same nudges, no spoiler
      hints: [
        problem.hints[0],
        problem.hints[1],
        "There is more than one way to close the gap between 'directly connected' and 'in the same group'. One of them never walks the graph at all.",
      ],
      takeaways: [
        "a province is a connected component, not a list of direct links",
        "transitivity is the whole difficulty: two cities can share a province with a 0 between them",
        "a city connected to nothing is still a province",
      ],
      quiz: [
        {
          q: "Cities 0 and 2 have a 0 in their cell. Can they be in the same province?",
          choices: [
            "no — the matrix says they are not connected",
            "yes, if some other city connects to both",
          ],
          answer: 1,
          explain:
            "Connection is transitive. The matrix records direct links; a province is what those links add up to.",
        },
      ],
      run: story,
    },
    {
      key: "walk",
      name: "Reach everything you can, and call it one",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take an unvisited city, walk to everything reachable from it, and count that as one province. Repeat until every city has been visited.",
      takeaways: [
        "a province is defined by what one walk reaches, which is exactly the definition",
        "marking on entry keeps two connected cities from calling each other forever",
        "it is the shorter code, and for a matrix that is fully known it is the simpler answer",
        "but it needs the whole matrix up front, and answers a new question only by walking again",
      ],
      run: floodFill,
    },
    {
      key: "union",
      name: "Merge the two ends of every edge",
      short: "count the roots",
      insight:
        "Walking answers the question by exploring what is already known. Turn it around: instead of discovering groups at the end, maintain them as each connection is read.",
      idea: problem.approach,
      takeaways: [
        "every city starts as its own group, so the count starts at n and only falls",
        "merging two representatives moves every city in both groups at once",
        "the answer is the number of cities that are still their own representative",
        "and because merging maintains the answer, an edge arriving later needs no re-traversal — that is when this beats the walk",
      ],
      quiz: [
        {
          q: "Both approaches are about the same cost here. When does union-find actually win?",
          choices: [
            "on very large matrices",
            "when the edges arrive over time — it keeps the answer up to date instead of recomputing it",
          ],
          answer: 1,
          explain:
            "For a fixed matrix the flood fill is simpler and just as fast. The structure earns its keep when the graph changes.",
        },
      ],
      run: unionFind,
    },
  ],
})
