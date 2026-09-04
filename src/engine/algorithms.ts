// Sort / search / graph algorithms as generators yielding step objects.
// Owns the algorithm catalog for the visualizer page. No DOM here.
//
// Array step: { type, indices?, values?, line, note }
//   compare — indices being compared        swap — indices swapped (array already mutated)
//   set     — index written with value       pivot — pivot / current range bounds
//   sorted  — indices in final position      discard — eliminated from the search range
// Graph step: { type: visit|frontier|edge|relax|done, node?, edge?, dist?, line, note }

import type { BaseFrame } from "./types.ts"

export type ArrayStepType = "compare" | "swap" | "set" | "pivot" | "sorted" | "discard"
export type GraphStepType = "visit" | "frontier" | "edge" | "relax" | "done"

export interface ArrayStep extends BaseFrame {
  type: ArrayStepType
  indices: number[]
  values?: number[]
  line: number
}

export interface GraphStep extends BaseFrame {
  type: GraphStepType
  node?: number
  edge?: [number, number]
  dist?: number[]
  line: number
}

export interface Graph {
  nodes: { x: number; y: number }[]
  edges: [number, number, number][]
  adj: Map<number, { v: number; w: number }[]>
}

interface AlgoBase {
  name: string
  complexity: string
  pseudocode: string[]
}
export interface ArrayAlgo extends AlgoBase {
  kind: "sort" | "search"
  run: (a: number[], target?: number) => Generator<ArrayStep>
}
export interface GraphAlgo extends AlgoBase {
  kind: "graph"
  weighted?: boolean
  run: (g: Graph) => Generator<GraphStep>
}
export type Algo = ArrayAlgo | GraphAlgo

const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, k) => lo + k)

export const ALGORITHMS: Record<string, Algo> = {
  bubble: {
    name: "Bubble Sort",
    kind: "sort",
    complexity: "O(n²) time · O(1) space",
    pseudocode: ["for i = 0 .. n-2", "  for j = 0 .. n-2-i", "    if a[j] > a[j+1]", "      swap a[j], a[j+1]", "  // a[n-1-i] is in place"],
    *run(a) {
      const n = a.length
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          yield { type: "compare", indices: [j, j + 1], line: 2, note: `compare ${a[j]} and ${a[j + 1]}` }
          if (a[j] > a[j + 1]) {
            ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
            yield { type: "swap", indices: [j, j + 1], line: 3, note: `${a[j + 1]} > ${a[j]}, swap` }
          }
        }
        yield { type: "sorted", indices: [n - 1 - i], line: 4, note: `largest of the pass bubbled to position ${n - 1 - i}` }
      }
      yield { type: "sorted", indices: [0], line: 4, note: "done" }
    },
  },

  selection: {
    name: "Selection Sort",
    kind: "sort",
    complexity: "O(n²) time · O(1) space",
    pseudocode: ["for i = 0 .. n-2", "  min = i", "  for j = i+1 .. n-1", "    if a[j] < a[min]: min = j", "  swap a[i], a[min]"],
    *run(a) {
      const n = a.length
      for (let i = 0; i < n - 1; i++) {
        let min = i
        yield { type: "pivot", indices: [i], line: 1, note: `find minimum of a[${i}..${n - 1}]` }
        for (let j = i + 1; j < n; j++) {
          yield { type: "compare", indices: [j, min], line: 3, note: `is ${a[j]} < ${a[min]}?` }
          if (a[j] < a[min]) min = j
        }
        if (min !== i) {
          ;[a[i], a[min]] = [a[min], a[i]]
          yield { type: "swap", indices: [i, min], line: 4, note: `swap minimum ${a[i]} into position ${i}` }
        }
        yield { type: "sorted", indices: [i], line: 4, note: `position ${i} fixed` }
      }
      yield { type: "sorted", indices: [n - 1], line: 4, note: "done" }
    },
  },

  insertion: {
    name: "Insertion Sort",
    kind: "sort",
    complexity: "O(n²) time · O(1) space",
    pseudocode: ["for i = 1 .. n-1", "  key = a[i]; j = i-1", "  while j >= 0 and a[j] > key", "    a[j+1] = a[j]; j--", "  a[j+1] = key"],
    *run(a) {
      const n = a.length
      yield { type: "sorted", indices: [0], line: 0, note: "first element is a sorted prefix" }
      for (let i = 1; i < n; i++) {
        const key = a[i]
        let j = i - 1
        yield { type: "pivot", indices: [i], line: 1, note: `insert ${key} into sorted prefix` }
        while (j >= 0 && a[j] > key) {
          yield { type: "compare", indices: [j, j + 1], line: 2, note: `${a[j]} > ${key}, shift right` }
          a[j + 1] = a[j]
          yield { type: "set", indices: [j + 1], values: [a[j]], line: 3, note: `shift ${a[j + 1]}` }
          j--
        }
        a[j + 1] = key
        yield { type: "set", indices: [j + 1], values: [key], line: 4, note: `place ${key} at position ${j + 1}` }
        yield { type: "sorted", indices: range(0, i), line: 4, note: `prefix a[0..${i}] sorted` }
      }
    },
  },

  merge: {
    name: "Merge Sort",
    kind: "sort",
    complexity: "O(n log n) time · O(n) space",
    pseudocode: ["mergeSort(lo, hi):", "  if hi - lo < 1: return", "  mid = (lo + hi) / 2", "  mergeSort(lo, mid); mergeSort(mid+1, hi)", "  merge the two sorted halves"],
    *run(a) {
      const n = a.length
      function* sort(lo: number, hi: number): Generator<ArrayStep> {
        if (hi - lo < 1) return
        const mid = (lo + hi) >> 1
        yield { type: "pivot", indices: [mid], line: 2, note: `split a[${lo}..${hi}] at ${mid}` }
        yield* sort(lo, mid)
        yield* sort(mid + 1, hi)
        const merged: number[] = []
        let i = lo
        let j = mid + 1
        while (i <= mid && j <= hi) {
          yield { type: "compare", indices: [i, j], line: 4, note: `compare ${a[i]} and ${a[j]}` }
          merged.push(a[i] <= a[j] ? a[i++] : a[j++])
        }
        while (i <= mid) merged.push(a[i++])
        while (j <= hi) merged.push(a[j++])
        for (let k = 0; k < merged.length; k++) {
          a[lo + k] = merged[k]
          yield { type: "set", indices: [lo + k], values: [merged[k]], line: 4, note: `write ${merged[k]} to position ${lo + k}` }
        }
      }
      yield* sort(0, n - 1)
      yield { type: "sorted", indices: range(0, n - 1), line: 4, note: "done" }
    },
  },

  quick: {
    name: "Quick Sort",
    kind: "sort",
    complexity: "O(n log n) avg, O(n²) worst · O(log n) space",
    pseudocode: ["quickSort(lo, hi):", "  if lo >= hi: return", "  pivot = a[hi]", "  partition: smaller left, bigger right", "  quickSort(lo, p-1); quickSort(p+1, hi)"],
    *run(a) {
      function* sort(lo: number, hi: number): Generator<ArrayStep> {
        if (lo >= hi) {
          if (lo === hi) yield { type: "sorted", indices: [lo], line: 1, note: `position ${lo} fixed` }
          return
        }
        const pivot = a[hi]
        yield { type: "pivot", indices: [hi], line: 2, note: `pivot = ${pivot}` }
        let p = lo
        for (let j = lo; j < hi; j++) {
          yield { type: "compare", indices: [j, hi], line: 3, note: `is ${a[j]} < pivot ${pivot}?` }
          if (a[j] < pivot) {
            if (p !== j) {
              ;[a[p], a[j]] = [a[j], a[p]]
              yield { type: "swap", indices: [p, j], line: 3, note: `move ${a[p]} left of pivot` }
            }
            p++
          }
        }
        ;[a[p], a[hi]] = [a[hi], a[p]]
        yield { type: "swap", indices: [p, hi], line: 3, note: `pivot ${pivot} to position ${p}` }
        yield { type: "sorted", indices: [p], line: 4, note: `pivot fixed at ${p}` }
        yield* sort(lo, p - 1)
        yield* sort(p + 1, hi)
      }
      yield* sort(0, a.length - 1)
    },
  },

  heap: {
    name: "Heap Sort",
    kind: "sort",
    complexity: "O(n log n) time · O(1) space",
    pseudocode: ["build max-heap from array", "for end = n-1 .. 1", "  swap a[0], a[end]  // max to back", "  siftDown(0, end-1)"],
    *run(a) {
      const n = a.length
      function* siftDown(i: number, end: number, line: number): Generator<ArrayStep> {
        for (;;) {
          const l = 2 * i + 1
          const r = 2 * i + 2
          let big = i
          if (l <= end) {
            yield { type: "compare", indices: [l, big], line, note: `compare child ${a[l]} with ${a[big]}` }
            if (a[l] > a[big]) big = l
          }
          if (r <= end) {
            yield { type: "compare", indices: [r, big], line, note: `compare child ${a[r]} with ${a[big]}` }
            if (a[r] > a[big]) big = r
          }
          if (big === i) return
          ;[a[i], a[big]] = [a[big], a[i]]
          yield { type: "swap", indices: [i, big], line, note: "sift down" }
          i = big
        }
      }
      for (let i = (n >> 1) - 1; i >= 0; i--) yield* siftDown(i, n - 1, 0)
      for (let end = n - 1; end >= 1; end--) {
        ;[a[0], a[end]] = [a[end], a[0]]
        yield { type: "swap", indices: [0, end], line: 2, note: `max ${a[end]} to position ${end}` }
        yield { type: "sorted", indices: [end], line: 2, note: `position ${end} fixed` }
        yield* siftDown(0, end - 1, 3)
      }
      yield { type: "sorted", indices: [0], line: 3, note: "done" }
    },
  },

  binary: {
    name: "Binary Search",
    kind: "search",
    complexity: "O(log n) time · O(1) space",
    pseudocode: ["lo = 0, hi = n-1", "while lo <= hi", "  mid = (lo + hi) / 2", "  if a[mid] == target: found", "  if a[mid] < target: lo = mid+1", "  else: hi = mid-1", "not found"],
    *run(a, target = 0) {
      let lo = 0
      let hi = a.length - 1
      yield { type: "pivot", indices: [lo, hi], line: 0, note: `search for ${target} in a[${lo}..${hi}]` }
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        yield { type: "compare", indices: [mid], line: 3, note: `mid = ${mid}: is a[mid] = ${a[mid]} equal to ${target}?` }
        if (a[mid] === target) {
          yield { type: "sorted", indices: [mid], line: 3, note: `found ${target} at index ${mid}` }
          return
        }
        if (a[mid] < target) {
          yield { type: "discard", indices: range(lo, mid), line: 4, note: `${a[mid]} < ${target} — target can't be in a[${lo}..${mid}], discard left half` }
          lo = mid + 1
        } else {
          yield { type: "discard", indices: range(mid, hi), line: 5, note: `${a[mid]} > ${target} — target can't be in a[${mid}..${hi}], discard right half` }
          hi = mid - 1
        }
        if (lo <= hi) yield { type: "pivot", indices: [lo, hi], line: 1, note: `range narrowed to a[${lo}..${hi}]` }
      }
      yield { type: "discard", indices: [], line: 6, note: `range empty — ${target} is not in the array` }
    },
  },

  bfs: {
    name: "BFS",
    kind: "graph",
    complexity: "O(V + E) time · O(V) space",
    pseudocode: ["queue = [start], seen = {start}", "while queue not empty:", "  u = queue.shift()   # FIFO!", "  for each neighbor v of u:", "    if v not seen:", "      seen.add(v); queue.push(v)"],
    *run(g) {
      const queue = [0]
      const seen = new Set([0])
      yield { type: "frontier", node: 0, line: 0, note: "start at node 0 — into the queue" }
      while (queue.length) {
        const u = queue.shift()!
        yield { type: "visit", node: u, line: 2, note: `visit ${u} — FIRST in, first out: the frontier expands in rings` }
        for (const { v } of g.adj.get(u)!) {
          yield { type: "edge", edge: [u, v], line: 3, note: `look along ${u} → ${v}` }
          if (!seen.has(v)) {
            seen.add(v)
            queue.push(v)
            yield { type: "frontier", node: v, edge: [u, v], line: 5, note: `${v} is new — queued. Distance from start: one ring further than ${u}` }
          }
        }
      }
      yield { type: "done", line: 1, note: "queue empty — every reachable node visited, in distance order" }
    },
  },

  dfs: {
    name: "DFS",
    kind: "graph",
    complexity: "O(V + E) time · O(V) space",
    pseudocode: ["stack = [start], seen = {start}", "while stack not empty:", "  u = stack.pop()   # LIFO!", "  for each neighbor v of u:", "    if v not seen:", "      seen.add(v); stack.push(v)"],
    *run(g) {
      const stack = [0]
      const seen = new Set([0])
      yield { type: "frontier", node: 0, line: 0, note: "start at node 0 — onto the stack" }
      while (stack.length) {
        const u = stack.pop()!
        yield { type: "visit", node: u, line: 2, note: `visit ${u} — LAST in, first out: dive deep before going wide` }
        for (const { v } of g.adj.get(u)!) {
          yield { type: "edge", edge: [u, v], line: 3, note: `look along ${u} → ${v}` }
          if (!seen.has(v)) {
            seen.add(v)
            stack.push(v)
            yield { type: "frontier", node: v, edge: [u, v], line: 5, note: `${v} is new — stacked. It may be visited long before its siblings` }
          }
        }
      }
      yield { type: "done", line: 1, note: "stack empty — one deep tendril at a time, that's the DFS shape" }
    },
  },

  dijkstra: {
    name: "Dijkstra",
    kind: "graph",
    weighted: true,
    complexity: "O((V + E) log V) time · O(V) space",
    pseudocode: ["dist[start] = 0, others ∞", "while unvisited nodes remain:", "  u = closest unvisited node", "  for each neighbor v of u:", "    if dist[u] + w(u,v) < dist[v]:", "      dist[v] = dist[u] + w(u,v)  # relax"],
    *run(g) {
      const n = g.nodes.length
      const dist: number[] = Array(n).fill(Infinity)
      const done = new Set<number>()
      dist[0] = 0
      yield { type: "relax", node: 0, dist: dist.slice(), line: 0, note: "dist[0] = 0; everyone else starts at ∞" }
      for (let round = 0; round < n; round++) {
        let u = -1
        for (let i = 0; i < n; i++) if (!done.has(i) && (u === -1 || dist[i] < dist[u])) u = i
        if (u === -1 || dist[u] === Infinity) break
        done.add(u)
        yield { type: "visit", node: u, dist: dist.slice(), line: 2, note: `lock in ${u} at distance ${dist[u]} — nothing unvisited can beat it` }
        for (const { v, w } of g.adj.get(u)!) {
          yield { type: "edge", edge: [u, v], dist: dist.slice(), line: 3, note: `try ${u} → ${v} (weight ${w})` }
          if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w
            yield { type: "relax", node: v, edge: [u, v], dist: dist.slice(), line: 5, note: `relax! ${v} now reachable in ${dist[v]} via ${u}` }
          }
        }
      }
      yield { type: "done", dist: dist.slice(), line: 1, note: "every label is now the true shortest distance from node 0" }
    },
  },
}

// Circle layout with jitter: readable without a layout engine. A ring keeps
// it connected; n-2 random extra edges give the traversals something to choose.
export function makeGraph(n = 9): Graph {
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: 50 + 38 * Math.cos(a) + (Math.random() * 6 - 3), y: 50 + 38 * Math.sin(a) + (Math.random() * 6 - 3) }
  })
  const edges: [number, number, number][] = []
  const seen = new Set<string>()
  const addEdge = (u: number, v: number) => {
    const key = Math.min(u, v) + "-" + Math.max(u, v)
    if (u === v || seen.has(key)) return
    seen.add(key)
    edges.push([u, v, 1 + Math.floor(Math.random() * 9)])
  }
  for (let i = 0; i < n; i++) addEdge(i, (i + 1) % n)
  for (let k = 0; k < n - 2; k++) addEdge(Math.floor(Math.random() * n), Math.floor(Math.random() * n))
  const adj = new Map<number, { v: number; w: number }[]>(nodes.map((_, i) => [i, []]))
  for (const [u, v, w] of edges) {
    adj.get(u)!.push({ v, w })
    adj.get(v)!.push({ v: u, w })
  }
  for (const list of adj.values()) list.sort((a, b) => a.v - b.v)
  return { nodes, edges, adj }
}

// ---------- precomputed timelines (what the visualizer plays) ----------

export interface ArrayFrame {
  arr: number[]
  marks: Record<number, "compare" | "swap" | "pivot">
  sorted: number[]
  discard: number[]
  line: number
  note: string
  cmp: number
  swp: number
}

// Drain a sort/search generator into complete per-step snapshots so step-back
// and scrubbing are array indexing. ponytail: full snapshots per frame, ~500KB
// worst case at size 60 — switch to diffs if sizes grow past that.
export function buildArrayFrames(algo: ArrayAlgo, input: number[], target?: number): ArrayFrame[] {
  const a = algo.kind === "search" ? input.slice().sort((x, y) => x - y) : input.slice()
  const frames: ArrayFrame[] = [{ arr: a.slice(), marks: {}, sorted: [], discard: [], line: -1, note: "press play — or step through", cmp: 0, swp: 0 }]
  const sorted = new Set<number>()
  const discard = new Set<number>()
  let cmp = 0
  let swp = 0
  for (const s of algo.run(a, target)) {
    if (s.type === "compare") cmp++
    if (s.type === "swap" || s.type === "set") swp++
    if (s.type === "sorted") s.indices.forEach((i) => sorted.add(i))
    if (s.type === "discard") s.indices.forEach((i) => discard.add(i))
    const marks: ArrayFrame["marks"] = {}
    if (s.type === "compare" || s.type === "swap" || s.type === "pivot") for (const i of s.indices) marks[i] = s.type
    if (s.type === "set") for (const i of s.indices) marks[i] = "swap"
    frames.push({ arr: a.slice(), marks, sorted: [...sorted], discard: [...discard], line: s.line, note: s.note, cmp, swp })
  }
  return frames
}

export interface GraphFrame {
  visited: number[]
  frontier: number[]
  current: number | null
  activeEdge: [number, number] | null
  dist: number[] | null
  line: number
  note: string
}

export function buildGraphFrames(algo: GraphAlgo, g: Graph): GraphFrame[] {
  const frames: GraphFrame[] = [{ visited: [], frontier: [], current: null, activeEdge: null, dist: null, line: -1, note: "press play — or step through" }]
  const visited = new Set<number>()
  const frontier = new Set<number>()
  let current: number | null = null
  for (const s of algo.run(g)) {
    if (s.type === "visit" && s.node !== undefined) {
      visited.add(s.node)
      frontier.delete(s.node)
      current = s.node
    }
    if (s.type === "frontier" && s.node !== undefined) frontier.add(s.node)
    if (s.type === "relax" && s.node !== undefined && !visited.has(s.node)) frontier.add(s.node)
    frames.push({ visited: [...visited], frontier: [...frontier], current, activeEdge: s.edge ?? null, dist: s.dist ?? null, line: s.line, note: s.note })
  }
  return frames
}
