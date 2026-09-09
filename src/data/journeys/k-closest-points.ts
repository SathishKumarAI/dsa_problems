// K Closest Points, derived. Points arrive as flat pairs — x, y, x, y — with k
// as a scalar.
//
// The stage is a two-row table: the point, and its SQUARED distance. Squared,
// because the square root is a monotone function and therefore changes no
// comparison — the first thing to notice here, and the cheapest win in the
// problem.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/heaps/k-closest-points.ts"

type P = Data<number> & { k: number }

/** Flat pairs → points. */
export const pointsOf = (nums: number[]) => {
  const out: [number, number][] = []
  for (let i = 0; i + 1 < nums.length; i += 2) out.push([nums[i], nums[i + 1]])
  return out
}

const d2 = ([x, y]: [number, number]) => x * x + y * y

/** The reference: the k closest points, as a stable, comparable list. */
export function kClosest(nums: number[], k: number) {
  return pointsOf(nums)
    .map((p, i) => ({ p, i, d: d2(p) }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, k)
    .map(({ p }) => `${p[0]},${p[1]}`)
    .sort()
}

/** The table: each point over its squared distance. */
const table = (
  pts: [number, number][],
  label: string,
  mark?: (i: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  pts.forEach((_, i) => {
    const m = mark?.(i)
    if (m) marks[`1,${i}`] = m
  })
  return {
    cells: [pts.map(([x, y]) => `${x},${y}`), pts.map((p) => d2(p))] as (
      number | string
    )[][],
    marks,
    label,
  }
}

function* story({ nums, k }: P): Generator<DFrame> {
  const pts = pointsOf(nums)
  const answer = kClosest(nums, k)
  const dists = pts.map(d2)
  const cut = [...dists].sort((a, b) => a - b)[k - 1]
  yield {
    hold: 3,
    noChips: true,
    note: `${pts.length} points on a plane, and a k of ${k}. Return the ${k} closest to the origin. Which order they come back in does not matter.`,
  }
  yield {
    hold: 3,
    grid: table(pts, "x² + y²", () => undefined),
    state: [{ label: "points", value: pts.length }],
    corner: "sqrt",
    note: "Distance from the origin is √(x² + y²) — and the square root can be dropped. It is increasing, so it never changes which of two points is closer, and dropping it removes every floating-point comparison from the problem.",
  }
  const ties = dists.filter((v) => v === cut).length > 1
  yield {
    hold: 3,
    grid: table(pts, `${k} closest`, (i) =>
      answer.includes(`${pts[i][0]},${pts[i][1]}`) ? "answer" : "dim"
    ),
    state: [
      { label: "answer", value: answer.join("  ") },
      { label: "cut-off", value: cut },
    ],
    answer,
    corner:
      k === pts.length
        ? "all"
        : ties
          ? "ties"
          : pts.some(([x, y]) => x < 0 || y < 0)
            ? "negatives"
            : "sqrt",
    note:
      k === pts.length
        ? "k covers every point, so all of them come back and nothing is ranked. The largest legal k, and the case a slice or a bounded heap has to survive at its boundary."
        : ties
          ? `Two points tie at a squared distance of ${cut}. Either may be taken — the problem says any valid set of ${k} is accepted — so no tie-break is needed, and inventing one is extra work with a chance of being wrong.`
          : pts.some(([x, y]) => x < 0 || y < 0)
            ? `${answer.join("  ")}. Note the negative coordinates: squaring makes distance blind to direction, which is exactly right here and exactly wrong for anyone comparing raw x or y.`
            : `${answer.join("  ")} — the ${k} with the smallest x² + y².`,
  }
}

/** Rung 1 — sort everything by distance and slice. */
function* sortAll({ nums, k }: P): Generator<DFrame> {
  const pts = pointsOf(nums)
  const order = pts
    .map((p, i) => ({ p, i, d: d2(p) }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
  yield {
    line: 1,
    grid: table(pts, "unsorted", () => undefined),
    state: [{ label: "points", value: pts.length }],
    note: "One line: sort by squared distance, take the first k. Nothing to design.",
  }
  const answer = kClosest(nums, k)
  yield {
    line: 1,
    answer,
    grid: table(
      order.map(({ p }) => p),
      "sorted by distance",
      (i) => (i < k ? "answer" : "dim")
    ),
    state: [
      { label: "answer", value: answer.join("  ") },
      {
        label: "comparisons",
        value: `~${Math.ceil(pts.length * Math.log2(Math.max(2, pts.length)))}`,
      },
    ],
    corner: k === pts.length ? "all" : undefined,
    note: `${answer.join("  ")}. Correct, and it ordered all ${pts.length} points to read the first ${k}. When ${k} is close to ${pts.length} that is barely waste at all — which is why this rung is a real answer and not a straw man.`,
  }
}

/** Rung 2 — quickselect: partition until the k closest are in front. */
function* quickselect({ nums, k }: P): Generator<DFrame> {
  const pts = [...pointsOf(nums)]
  let lo = 0
  let hi = pts.length - 1
  let partitions = 0
  yield {
    line: 3,
    grid: table(pts, "nothing partitioned", () => undefined),
    state: [{ label: "range", value: `${lo} … ${hi}` }],
    note: "The k closest do not have to be in ORDER — they only have to be the first k. That is a weaker requirement than sorting, and it can be met without ever ordering anything fully.",
  }
  while (lo < hi) {
    const pivot = d2(pts[Math.floor((lo + hi) / 2)])
    let i = lo
    let j = hi
    while (i <= j) {
      while (d2(pts[i]) < pivot) i++
      while (d2(pts[j]) > pivot) j--
      if (i <= j) {
        const t = pts[i]
        pts[i] = pts[j]
        pts[j] = t
        i++
        j--
      }
    }
    partitions++
    yield {
      line: 14,
      grid: table(pts, `pivot ${pivot}`, (x) =>
        x < lo || x > hi ? "dim" : d2(pts[x]) <= pivot ? "focus" : undefined
      ),
      state: [
        { label: "pivot", value: pivot },
        { label: "range", value: `${lo} … ${hi}` },
        { label: "partitions", value: partitions },
      ],
      note: `Everything closer than ${pivot} is now in front of everything further. Neither side is sorted — and neither needs to be, because only the boundary at ${k} matters.`,
    }
    if (k - 1 <= j) hi = j
    else if (k - 1 >= i) lo = i
    else break
  }
  const answer = kClosest(nums, k)
  yield {
    line: 22,
    answer,
    grid: table(pts, `first ${k}`, (i) => (i < k ? "answer" : "dim")),
    state: [
      { label: "answer", value: answer.join("  ") },
      { label: "partitions", value: partitions },
    ],
    corner: pts.some(([x, y]) => x < 0 || y < 0) ? "negatives" : undefined,
    note: `${answer.join("  ")}, after ${partitions} ${partitions === 1 ? "partition" : "partitions"}. Expected linear, and the asymptotic winner — with two prices: it reorders the caller's array, and a run of unlucky pivots takes it quadratic. It also needs every point in memory at once.`,
  }
}

/** Rung 3 — a bounded heap: stream the points, hold k. */
function* boundedHeap({ nums, k }: P): Generator<DFrame> {
  const pts = pointsOf(nums)
  const kept: number[] = []
  yield {
    line: 3,
    grid: table(pts, "holding nothing", () => undefined),
    state: [{ label: "kept", value: 0 }],
    note: `A heap that never grows past ${k}, ordered so the WORST of the kept points is at the root — the one at risk of eviction, and the only one that ever has to be compared against.`,
  }
  for (let i = 0; i < pts.length; i++) {
    const d = d2(pts[i])
    let evicted: number | undefined
    if (kept.length < k) kept.push(i)
    else {
      kept.sort((a, b) => d2(pts[b]) - d2(pts[a]))
      if (d < d2(pts[kept[0]])) {
        evicted = kept.shift()
        kept.push(i)
      }
    }
    kept.sort((a, b) => d2(pts[b]) - d2(pts[a]))
    yield {
      line: evicted !== undefined ? 9 : 7,
      grid: table(pts, `arrived ${pts[i][0]},${pts[i][1]}`, (x) =>
        x === i ? "focus" : kept.includes(x) ? "answer" : "dim"
      ),
      state: [
        { label: "distance", value: d },
        {
          label: "kept",
          value: kept.map((x) => `${pts[x][0]},${pts[x][1]}`).join(" "),
        },
      ],
      note:
        evicted !== undefined
          ? `${pts[i][0]},${pts[i][1]} at ${d} beats the worst kept point, ${pts[evicted][0]},${pts[evicted][1]} at ${d2(pts[evicted])} — so they swap in one step. The evicted point can never return: distances do not change.`
          : kept.length < k
            ? `${pts[i][0]},${pts[i][1]} goes in; the heap holds ${kept.length} of the ${k} it is allowed.`
            : `${pts[i][0]},${pts[i][1]} at ${d} is worse than everything kept, so it is dropped immediately. One comparison against the root decided it — the other ${k - 1} kept points were never looked at.`,
    }
  }
  const answer = kClosest(nums, k)
  yield {
    line: 10,
    answer,
    grid: table(pts, `${k} closest`, (i) =>
      answer.includes(`${pts[i][0]},${pts[i][1]}`) ? "answer" : "dim"
    ),
    state: [
      { label: "answer", value: answer.join("  ") },
      { label: "held at once", value: k },
      { label: "points seen", value: pts.length },
    ],
    corner: (() => {
      const dists = pts.map(d2)
      const cut = [...dists].sort((a, b) => a - b)[k - 1]
      return dists.filter((v) => v === cut).length > 1 ? "ties" : undefined
    })(),
    note: `${answer.join("  ")}, having held ${k} points at a time rather than all ${pts.length}. Slower than quickselect on paper — and it streams: the points can arrive one at a time and never all exist at once, which is a promise the other two rungs cannot make.`,
  }
}

export const kClosestPoints = deriveJourney<number>(problem, {
  slug: "keep-the-k-nearest",
  subtitle: "drop the square root, and hold only what could still win",
  reveals: ["heaps"],
  defaultPreset: "example",
  harder: { preset: "long", label: "more points" },
  params: [{ key: "k", label: "k" }],
  classify: (d) => {
    const nums = d.nums as number[]
    const k = (d as P).k
    if (nums.length % 2 !== 0 || nums.length === 0)
      return { ok: false, warning: "pairs of coordinates: x, y, x, y …" }
    const count = nums.length / 2
    return Number.isInteger(k) && k >= 1 && k <= count
      ? { ok: true }
      : {
          ok: false,
          warning: `k is from 1 to the number of points (${count} here)`,
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 3, -2, 2, 5, 8],
      extra: { k: 2 },
      info: "(-2,2) and (1,3)",
    },
    all: {
      label: "k = every point",
      nums: [1, 1, 3, 3, 0, 5],
      extra: { k: 3 },
      info: "no ranking needed",
    },
    ties: {
      label: "a tie at the cut-off",
      nums: [1, 0, 0, 1, 4, 4],
      extra: { k: 1 },
      info: "both are at distance 1",
    },
    negatives: {
      label: "negative coordinates",
      nums: [-1, -1, -5, 2, 3, -1],
      extra: { k: 2 },
      info: "squaring ignores direction",
    },
    origin: {
      label: "a point at the origin",
      nums: [0, 0, 1, 1, 2, 2],
      extra: { k: 1 },
      info: "distance 0",
    },
    one: {
      label: "a single point",
      nums: [3, 4],
      extra: { k: 1 },
      info: "distance 25",
    },
    long: {
      label: "more points",
      nums: [3, 3, 5, -1, 0, 2, -2, -2, 6, 6, 1, 1, -4, 0, 2, 5],
      extra: { k: 3 },
      info: "eight points",
    },
  },
  edges: [
    {
      key: "sqrt",
      name: "the square root can be dropped",
      example: "compare x² + y² instead of √(x² + y²)",
      why: "The square root is increasing, so it never changes which of two points is closer. Dropping it removes every floating-point comparison — and within these coordinate bounds the squared value cannot overflow, which is why the constraints mention it.",
      think:
        "Does the comparison you need survive the transformation you are removing?",
      preset: "example",
      constraint: 3,
    },
    {
      key: "ties",
      name: "a tie at the cut-off",
      example: "(1,0) and (0,1) both at distance 1, with k = 1",
      why: "The problem accepts any valid set of k, so ties need no tie-break at all. Adding one is extra code that can only be wrong — and comparing points to break it invites comparing coordinates, which is meaningless here.",
      think:
        "Does your solution have to decide between two equally close points?",
      preset: "ties",
      constraint: 2,
    },
    {
      key: "negatives",
      name: "negative coordinates",
      example: "(-5, 2) is further than (-1, -1)",
      why: "Squaring makes distance blind to direction, which is correct — and it means nothing about x or y alone tells you anything. Sorting by either coordinate, or by their sum, gets this wrong immediately.",
      think:
        "Is your key the distance, or something that happens to correlate with it?",
      preset: "negatives",
      constraint: 1,
    },
    {
      key: "all",
      name: "k covers every point",
      example: "three points and k = 3",
      why: "The largest legal k. A bounded heap never evicts anything here, and a slice must not run off the end — the boundary where 'keep the k best' and 'keep everything' become the same instruction.",
      think:
        "What does your eviction step do when the heap is allowed to hold everything?",
      preset: "all",
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
        "given: points on a plane, and a k",
        "distance is measured from the origin",
        "task: return the k closest points",
        "any order, and ties may be broken any way at all",
      ],
      tools: [
        {
          name: "Points and distances",
          role: "the table: each point above its squared distance. Everything in this problem is a comparison between two of those numbers — the coordinates themselves are never compared.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "squared distance orders the points exactly as real distance does, without a square root",
        "the answer is a set, so nothing needs sorting for the caller",
        "ties at the cut-off may be broken arbitrarily",
      ],
      quiz: [
        {
          q: "Why compare x² + y² rather than √(x² + y²)?",
          choices: [
            "because it is an approximation that is close enough",
            "because the square root is increasing, so it changes no comparison — and dropping it removes the floating-point arithmetic entirely",
          ],
          answer: 1,
          explain:
            "It is exact, not approximate. The general move — drop a monotone transformation from inside a comparison — is worth keeping.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Sort them all, take the front",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Sort every point by squared distance and slice the first k.",
      takeaways: [
        "one line, and genuinely the right call when k is close to the number of points",
        "it produces a full ordering, of which only the first k is ever read",
        "and it needs every point in memory at once",
      ],
      run: sortAll,
    },
    {
      key: "quickselect",
      name: "Partition until the front is right",
      short: "no full order",
      from: 1,
      insight:
        "Sorting produces a total order and the question only asks which k are in front — a weaker requirement, and weaker requirements are cheaper to meet.",
      idea: "Partition around a pivot distance, keep partitioning the side containing position k, and stop when the first k positions hold the k closest — in no particular order.",
      takeaways: [
        "expected linear, and the asymptotic winner of the three",
        "neither side of a partition is ordered, which is exactly the work being skipped",
        "it reorders the caller's array, and unlucky pivots make it quadratic",
        "and it still needs every point present at once",
      ],
      quiz: [
        {
          q: "After the loop, are the first k points in order?",
          choices: [
            "yes",
            "no — they are the right k points, in no particular order, which is all the problem asked for",
          ],
          answer: 1,
          explain:
            "That is the whole saving. Ordering them would be work nobody requested.",
        },
      ],
      run: quickselect,
    },
    {
      key: "heap",
      name: "Hold k, and compare against the worst",
      short: "streams",
      insight:
        "Quickselect is expected linear but degrades on unlucky pivots, shuffles the caller's data, and needs every point at once — three costs that are invisible in the asymptotics.",
      idea: problem.approach,
      takeaways: [
        "a heap of size k, ordered so the WORST kept point is at the root",
        "each arrival is one comparison against that root: closer replaces it, further is dropped",
        "n log k, which beats sorting whenever k is much smaller than n",
        "and the points can arrive one at a time — the only rung here that never needs them all at once",
      ],
      quiz: [
        {
          q: "Why is the heap ordered with the FURTHEST kept point at the root?",
          choices: [
            "so the answer can be read straight off it",
            "because that is the point a newcomer has to beat — it is the only one eviction ever concerns",
          ],
          answer: 1,
          explain:
            "Same shape as keeping the k largest, mirrored. The root is always whichever kept item is closest to being thrown out.",
        },
      ],
      run: boundedHeap,
    },
  ],
})
