// Network Delay Time, derived. Edges arrive as flat triples — from, to, weight
// — with `nodes` and `source` as scalars, because a node no edge mentions is
// still a node that has to hear the signal.
//
// The stage is the DISTANCE TABLE: one column per node, its best known time
// underneath. Both rungs fill the same table; what differs is how many times
// each entry is touched, and why the second one is allowed to stop early.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/network-delay.ts"

type N = Data<number> & { nodes: number; source: number }

const FAR = Infinity

/** Flat triples → directed edges. */
export const wires = (nums: number[]) => {
  const out: [number, number, number][] = []
  for (let i = 0; i + 2 < nums.length; i += 3)
    out.push([nums[i], nums[i + 1], nums[i + 2]])
  return out
}

/** The reference: when the LAST node hears it, or -1 if one never does. */
export function networkDelay(nums: number[], nodes: number, source: number) {
  const best = Array.from({ length: nodes + 1 }, () => FAR)
  best[source] = 0
  for (let pass = 0; pass < nodes - 1; pass++)
    for (const [u, v, w] of wires(nums))
      if (best[u] + w < best[v]) best[v] = best[u] + w
  let slowest = 0
  for (let node = 1; node <= nodes; node++) {
    if (best[node] === FAR) return -1
    slowest = Math.max(slowest, best[node])
  }
  return slowest
}

const show = (d: number) => (d === FAR ? "∞" : String(d))

/** The distance table: node numbers, then best known time. */
const table = (
  best: number[],
  nodes: number,
  label: string,
  mark?: (node: number) => ChipRole | undefined
) => {
  const ids: (number | string)[] = []
  const times: (number | string)[] = []
  const marks: Record<string, ChipRole> = {}
  for (let node = 1; node <= nodes; node++) {
    ids.push(node)
    times.push(show(best[node]))
    const m = mark?.(node)
    if (m) marks[`1,${node - 1}`] = m
  }
  return { cells: [ids, times], marks, label }
}

function* story({ nums, nodes, source }: N): Generator<DFrame> {
  const edges = wires(nums)
  const answer = networkDelay(nums, nodes, source)
  const best = Array.from({ length: nodes + 1 }, () => FAR)
  best[source] = 0
  for (let pass = 0; pass < nodes - 1; pass++)
    for (const [u, v, w] of edges)
      if (best[u] + w < best[v]) best[v] = best[u] + w
  yield {
    hold: 3,
    noChips: true,
    note: `A signal starts at node ${source} and travels along one-way wires, each taking its own time. When has EVERY node heard it — or does one of them never hear it at all?`,
  }
  yield {
    hold: 3,
    grid: table(best, nodes, "the wires", (node) =>
      node === source ? "anchor" : undefined
    ),
    state: [
      {
        label: "edges",
        value: edges.map(([u, v, w]) => `${u}→${v}:${w}`).join(" ") || "none",
      },
      { label: "source", value: source },
    ],
    note: "The wires are DIRECTED: an edge from u to v says nothing about travelling from v to u. Reading them as two-way is the fastest way to an answer that is too small and looks reasonable.",
  }
  const unreachable = []
  for (let node = 1; node <= nodes; node++)
    if (best[node] === FAR) unreachable.push(node)
  yield {
    hold: 3,
    grid: table(
      best,
      nodes,
      answer === -1 ? "someone never hears it" : `${answer}`,
      (node) =>
        best[node] === FAR ? "focus" : best[node] === answer ? "answer" : "dim"
    ),
    state: [{ label: "answer", value: answer }],
    answer,
    corner:
      answer === -1
        ? "unreachable"
        : nodes === 1
          ? "alone"
          : edges.some(([u, v]) => !edges.some(([a, b]) => a === v && b === u))
            ? "directed"
            : "slowest",
    note:
      answer === -1
        ? `Node ${unreachable.join(", ")} never hears the signal, so the answer is -1. That is a stated outcome, and it is why the code has to look at every node at the end rather than just report the largest distance it happened to compute.`
        : nodes === 1
          ? "One node, and it is the source: it hears the signal at time 0. The answer is 0, not -1, and a loop that skips the source misses it."
          : `${answer} — the time the LAST node hears it. Each node's own answer is the SHORTEST path from the source to it; the overall answer is the largest of those, which is a maximum over minima and easy to mix up.`,
  }
}

/** Rung 1 — relax every edge, n − 1 times. */
function* relaxAll({ nums, nodes, source }: N): Generator<DFrame> {
  const edges = wires(nums)
  const best = Array.from({ length: nodes + 1 }, () => FAR)
  best[source] = 0
  let relaxations = 0
  let reads = 0
  yield {
    line: 2,
    grid: table(best, nodes, "everything unknown but the source", (node) =>
      node === source ? "anchor" : undefined
    ),
    state: [{ label: "source", value: source }],
    note: `Every node starts at infinity except the source, which is 0. Infinity here means "no route known yet" — not "no route exists", and telling those apart is left to the very end.`,
  }
  for (let pass = 0; pass < Math.max(1, nodes - 1); pass++) {
    let changed = false
    const improved: number[] = []
    for (const [u, v, w] of edges) {
      reads++
      if (best[u] + w < best[v]) {
        best[v] = best[u] + w
        changed = true
        improved.push(v)
      }
    }
    yield {
      line: 7,
      grid: table(best, nodes, `pass ${pass + 1}`, (node) =>
        improved.includes(node)
          ? "answer"
          : best[node] === FAR
            ? "focus"
            : "dim"
      ),
      state: [
        { label: "pass", value: `${pass + 1} of ${Math.max(1, nodes - 1)}` },
        {
          label: "improved",
          value: improved.length ? improved.join(", ") : "nothing",
        },
      ],
      note: changed
        ? `Pass ${pass + 1} improves ${improved.join(", ")}. Every edge in the list was examined to find them — including edges whose endpoints stopped changing several passes ago.`
        : `Pass ${pass + 1} changes nothing, so nothing later will either: the distances have settled. The whole edge list was still read to discover that.`,
    }
    relaxations += improved.length
    if (!changed) break
  }
  const answer = networkDelay(nums, nodes, source)
  yield {
    line: 12,
    answer,
    grid: table(best, nodes, answer === -1 ? "-1" : `${answer}`, (node) =>
      best[node] === FAR ? "focus" : best[node] === answer ? "answer" : "dim"
    ),
    state: [
      { label: "answer", value: answer },
      { label: "edge reads", value: reads },
      { label: "improvements", value: relaxations },
    ],
    corner: answer === -1 ? "unreachable" : undefined,
    note: `${answer}, after ${reads} edge ${reads === 1 ? "read" : "reads"} and only ${relaxations} that changed anything. Correct, and easy to justify — the longest shortest path has at most ${Math.max(0, nodes - 1)} edges, so that many passes is always enough. The waste is everything re-examined in between.`,
  }
}

/** Rung 2 — Dijkstra: settle the nearest unsettled node. */
function* dijkstra({ nums, nodes, source }: N): Generator<DFrame> {
  const edges = wires(nums)
  const out = new Map<number, [number, number][]>()
  for (const [u, v, w] of edges) out.set(u, [...(out.get(u) ?? []), [v, w]])
  const best = Array.from({ length: nodes + 1 }, () => FAR)
  best[source] = 0
  const settled = new Set<number>()
  const heap: [number, number][] = [[0, source]]
  let pops = 0
  let stale = 0
  yield {
    line: 9,
    grid: table(best, nodes, "the source is settled at 0", (node) =>
      node === source ? "anchor" : undefined
    ),
    state: [{ label: "heap", value: `0:${source}` }],
    corner: "positive",
    note: "Same table, and one extra promise: every wire takes a POSITIVE time. That is what makes the next line safe — the nearest unsettled node cannot be improved later, because any other route to it goes through something already further away.",
  }
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0])
    const [cost, node] = heap.shift()!
    pops++
    if (cost > best[node]) {
      stale++
      yield {
        line: 13,
        grid: table(best, nodes, `${cost}:${node} is stale`, (k) =>
          k === node ? "dim" : settled.has(k) ? "dim" : undefined
        ),
        state: [
          { label: "popped", value: `${cost}:${node}` },
          { label: "already", value: show(best[node]) },
        ],
        note: `This entry says ${node} costs ${cost}, and a better route of ${show(best[node])} was found after it was pushed. Skipping it is cheaper than hunting the old entry down and deleting it — leaving stale entries in the heap is a deliberate choice, not an oversight.`,
      }
      continue
    }
    settled.add(node)
    const improved: number[] = []
    for (const [nxt, w] of out.get(node) ?? []) {
      if (cost + w < best[nxt]) {
        best[nxt] = cost + w
        heap.push([best[nxt], nxt])
        improved.push(nxt)
      }
    }
    yield {
      line: 17,
      grid: table(best, nodes, `settled ${node} at ${cost}`, (k) =>
        k === node
          ? "answer"
          : improved.includes(k)
            ? "focus"
            : settled.has(k)
              ? "dim"
              : undefined
      ),
      state: [
        { label: "settled", value: [...settled].join(", ") },
        {
          label: "improved",
          value: improved.length ? improved.join(", ") : "nothing",
        },
      ],
      note: improved.length
        ? `${node} is the nearest unsettled node, so its ${cost} is FINAL — nothing reached later can offer it a shortcut. Its outgoing wires improve ${improved.join(", ")}, and each of those is relaxed from a distance that will never change again.`
        : `${node} settles at ${cost} and improves nothing: every node it points at already has a better route, or it points nowhere at all.`,
    }
  }
  const answer = networkDelay(nums, nodes, source)
  const missing: number[] = []
  for (let node = 1; node <= nodes; node++)
    if (best[node] === FAR) missing.push(node)
  yield {
    line: 24,
    answer,
    grid: table(best, nodes, answer === -1 ? "-1" : `${answer}`, (node) =>
      best[node] === FAR ? "focus" : best[node] === answer ? "answer" : "dim"
    ),
    state: [
      { label: "answer", value: answer },
      { label: "heap pops", value: pops },
      { label: "stale entries skipped", value: stale },
    ],
    corner: answer === -1 ? "unreachable" : nodes === 1 ? "alone" : "slowest",
    note:
      answer === -1
        ? `Node ${missing.join(", ")} is still at infinity after the heap drained, so no route to it exists: -1. Note that this is checked over every node at the end — the algorithm itself never notices, because it simply runs out of places to go.`
        : `${answer}, in ${pops} ${pops === 1 ? "pop" : "pops"} with ${stale} stale ${stale === 1 ? "entry" : "entries"} skipped. Each edge was relaxed from a node whose distance was already final, so nothing had to be revisited — the ordering did the work that ${Math.max(0, nodes - 1)} passes did before.`,
  }
}

export const networkDelayJourney = deriveJourney<number>(problem, {
  slug: "settle-the-nearest-first",
  subtitle:
    "positive weights make the closest unfinished node already finished",
  reveals: ["graphs"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger network" },
  params: [
    { key: "nodes", label: "nodes (n)" },
    { key: "source", label: "start at (k)" },
  ],
  classify: (d) => {
    const nums = d.nums as number[]
    const nodes = (d as N).nodes
    const source = (d as N).source
    if (!Number.isInteger(nodes) || nodes < 1)
      return { ok: false, warning: "at least one node" }
    if (!Number.isInteger(source) || source < 1 || source > nodes)
      return { ok: false, warning: `the source is a node from 1 to ${nodes}` }
    if (nums.length % 3 !== 0)
      return { ok: false, warning: "triples: from, to, time, from, to, time …" }
    return wires(nums).every(
      ([u, v, w]) => u >= 1 && u <= nodes && v >= 1 && v <= nodes && w >= 1
    )
      ? { ok: true }
      : {
          ok: false,
          warning: `nodes run from 1 to ${nodes}, and every time is at least 1`,
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: [2, 1, 1, 2, 3, 1, 3, 4, 1],
      extra: { nodes: 4, source: 2 },
      info: "node 4 is slowest, at 2",
    },
    unreachable: {
      label: "the edge points the wrong way",
      nums: [1, 2, 1],
      extra: { nodes: 2, source: 2 },
      info: "-1",
    },
    alone: {
      label: "one node, no wires",
      nums: [],
      extra: { nodes: 1, source: 1 },
      info: "0, not -1",
    },
    detour: {
      label: "the long way round is shorter",
      nums: [1, 2, 9, 1, 3, 1, 3, 2, 1],
      extra: { nodes: 3, source: 1 },
      info: "2 beats the direct 9",
    },
    directed: {
      label: "one-way wires",
      nums: [1, 2, 1, 2, 3, 1],
      extra: { nodes: 3, source: 1 },
      info: "nothing comes back",
    },
    long: {
      label: "a bigger network",
      nums: [1, 2, 2, 1, 3, 4, 2, 3, 1, 2, 4, 7, 3, 5, 3, 5, 4, 1, 4, 6, 2],
      extra: { nodes: 6, source: 1 },
      info: "six nodes",
    },
  },
  edges: [
    {
      key: "unreachable",
      name: "a node that never hears it",
      example: "one edge 1 → 2 with the source at 2 → -1",
      why: "-1 is a stated outcome. Nothing inside the search notices it — the algorithm just runs out of places to go — so the check is a sweep over every node at the end, and a version that returns the largest distance it computed reports a plausible number instead.",
      think:
        "After the search, how do you distinguish 'far away' from 'not connected'?",
      preset: "unreachable",
      constraint: 1,
    },
    {
      key: "directed",
      name: "the wires are one-way",
      example: "1 → 2 → 3 with nothing coming back",
      why: "An edge [u, v, w] says nothing about travelling from v to u. Building the adjacency list in both directions is a two-character mistake that makes unreachable nodes reachable and shrinks the answer.",
      think: "Does your graph builder add one entry per edge, or two?",
      preset: "directed",
      constraint: 1,
    },
    {
      key: "slowest",
      name: "the answer is a maximum over minima",
      example: "each node's shortest time, then the largest of those",
      why: "Two different reductions in one sentence. Taking the largest edge, or summing anything, answers something else entirely — and on small examples the wrong reduction often agrees.",
      think: "Which of the two words — shortest, last — belongs to each step?",
      preset: "detour",
      constraint: 3,
    },
    {
      key: "positive",
      name: "every wire takes positive time",
      example: "weights of at least 1",
      why: "This is what licenses settling the nearest node and never revisiting it: any other route to it must pass through a node that is already further away, and a positive weight can only add to that. With a negative weight the whole argument collapses and this approach is simply wrong.",
      think:
        "What would a wire with negative time do to 'the nearest unsettled node is final'?",
      preset: "detour",
      constraint: 2,
    },
    {
      key: "alone",
      name: "the source on its own",
      example: "one node, no wires → 0",
      why: "The source hears it at time 0, so the answer is 0 rather than -1. Code that only records nodes it reached through an edge never records the source at all.",
      think: "Is the source in your distance table before the search starts?",
      preset: "alone",
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
        "given: nodes 1..n, one-way wires [from, to, time], and a starting node",
        "the signal travels along every wire out of a node it has reached",
        "task: the time the LAST node hears it",
        "or -1 if some node never does",
      ],
      tools: [
        {
          name: "Distance table",
          role: "one column per node with the best time known so far, starting at ∞ for everything but the source. Both approaches fill this same table — they differ only in the order they touch it.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "each node's own answer is a SHORTEST path; the answer overall is the largest of those",
        "wires are one-way, and reading them as two-way makes unreachable nodes reachable",
        "∞ at the end means no route exists, which is -1 rather than a big number",
      ],
      quiz: [
        {
          q: "The answer is described as the time the last node hears it. What is computed per node?",
          choices: [
            "the longest path from the source",
            "the shortest path — then the largest of those shortest paths is the answer",
          ],
          answer: 1,
          explain:
            "A maximum over minima. Getting either half backwards gives an answer that is right on simple graphs and wrong on interesting ones.",
        },
      ],
      run: story,
    },
    {
      key: "relax",
      name: "Improve every wire, over and over",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Set every distance to infinity but the source, then sweep the whole edge list improving whatever can be improved. Repeat n − 1 times — long enough for the longest possible shortest path.",
      takeaways: [
        "easy to justify: after k passes, every shortest path of k edges is correct",
        "it needs no ordering, no heap and no assumption about weights being positive",
        "and it re-reads every edge each pass, long after its endpoints have stopped changing",
      ],
      quiz: [
        {
          q: "Why is n − 1 passes always enough?",
          choices: [
            "because there are n − 1 edges",
            "because a shortest path never repeats a node, so it has at most n − 1 edges — and each pass fixes one more edge of it",
          ],
          answer: 1,
          explain:
            "That bound is the whole argument for this rung, and it is worth keeping: it is what makes the version correct even when the next one would not be.",
        },
      ],
      run: relaxAll,
    },
    {
      key: "dijkstra",
      name: "Take the nearest unfinished node",
      short: "settle once",
      insight:
        "Sweeping the whole edge list repeatedly re-examines edges long after their endpoints have stopped changing — and with positive weights there is a much stronger thing to say about which distances are already final.",
      idea: problem.approach,
      takeaways: [
        "with positive weights the nearest unsettled node cannot be improved later — any other route to it runs through something already further away",
        "so each edge is relaxed once, from a node whose distance is final",
        "stale heap entries are skipped when popped, which is cheaper than deleting them",
        "and the positivity is load-bearing: with a negative weight this rung is not merely slow, it is wrong",
      ],
      quiz: [
        {
          q: "Why not delete a heap entry when a better distance is found?",
          choices: [
            "because heaps cannot delete",
            "because finding it costs more than ignoring it later — a stale entry is recognised in one comparison when it pops",
          ],
          answer: 1,
          explain:
            "The skip is deliberate. It is why the heap can hold more entries than there are nodes, which surprises people reading the code for the first time.",
        },
      ],
      run: dijkstra,
    },
  ],
})
