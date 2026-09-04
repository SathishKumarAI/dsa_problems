// Every sort sorts, binary search finds and misses, traversals reach every
// node, Dijkstra matches a brute-force shortest path.

import assert from "node:assert/strict"
import { test } from "node:test"
import { ALGORITHMS, buildArrayFrames, buildGraphFrames, makeGraph } from "./algorithms.ts"
import type { ArrayAlgo, GraphAlgo } from "./algorithms.ts"

const arr = (algo: ArrayAlgo) => algo
const graph = (algo: GraphAlgo) => algo

test("every sort sorts random, reversed, and duplicate-heavy inputs", () => {
  const inputs = [
    [5, 3, 8, 1, 9, 2, 7],
    [9, 8, 7, 6, 5, 4, 3, 2, 1],
    [2, 2, 1, 1, 3, 3, 2],
    [1],
    [],
  ]
  for (const key of ["bubble", "selection", "insertion", "merge", "quick", "heap"]) {
    const algo = ALGORITHMS[key]
    assert.equal(algo.kind, "sort")
    for (const input of inputs) {
      const a = input.slice()
      for (const _ of arr(algo as ArrayAlgo).run(a)) void _
      assert.deepEqual(a, input.slice().sort((x, y) => x - y), `${key} on [${input}]`)
    }
  }
})

test("binary search finds present targets and reports absent ones", () => {
  const algo = arr(ALGORITHMS.binary as ArrayAlgo)
  const a = [1, 3, 5, 7, 9, 11]
  const hit = [...algo.run(a.slice(), 7)]
  assert.equal(hit.at(-1)!.type, "sorted")
  assert.deepEqual(hit.at(-1)!.indices, [3])
  const miss = [...algo.run(a.slice(), 4)]
  assert.equal(miss.at(-1)!.type, "discard")
  assert.deepEqual(miss.at(-1)!.indices, [])
})

test("array frames are complete snapshots with running counters", () => {
  const frames = buildArrayFrames(ALGORITHMS.bubble as ArrayAlgo, [3, 1, 2])
  assert.equal(frames[0].note, "press play — or step through")
  assert.deepEqual(frames.at(-1)!.arr, [1, 2, 3])
  assert.ok(frames.at(-1)!.cmp > 0)
  assert.equal(frames.at(-1)!.sorted.length, 3)
  const search = buildArrayFrames(ALGORITHMS.binary as ArrayAlgo, [9, 1, 5], 5)
  assert.deepEqual(search[0].arr, [1, 5, 9], "search sorts the input first")
})

test("BFS and DFS visit every node of a connected graph exactly once", () => {
  for (let trial = 0; trial < 5; trial++) {
    const g = makeGraph(8)
    for (const key of ["bfs", "dfs"]) {
      const visits = [...graph(ALGORITHMS[key] as GraphAlgo).run(g)].filter((s) => s.type === "visit").map((s) => s.node)
      assert.equal(new Set(visits).size, 8, key)
      assert.equal(visits.length, 8, `${key} visits once`)
    }
  }
})

test("Dijkstra distances match Bellman-Ford on the same graph", () => {
  for (let trial = 0; trial < 5; trial++) {
    const g = makeGraph(7)
    const n = g.nodes.length
    const want = Array(n).fill(Infinity)
    want[0] = 0
    for (let k = 0; k < n; k++)
      for (const [u, v, w] of g.edges) {
        if (want[u] + w < want[v]) want[v] = want[u] + w
        if (want[v] + w < want[u]) want[u] = want[v] + w
      }
    const frames = buildGraphFrames(ALGORITHMS.dijkstra as GraphAlgo, g)
    assert.deepEqual(frames.at(-1)!.dist, want)
    assert.equal(frames.at(-1)!.visited.length, n)
  }
})
