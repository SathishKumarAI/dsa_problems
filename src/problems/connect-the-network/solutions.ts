// connect-the-network — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Reject immediately if there are fewer than n-1 cables, because no arrangement connects n computers with fewer. Otherwise union the endpoints of every cable in a disjoint-set forest and count how many components remain; joining k components into one takes exactly k-1 moves. The spare cables never have to be identified individually: having at least n-1 cables in total guarantees there are at least as many redundant ones as there are gaps to bridge, which is the small argument that turns this from a construction problem into a counting one."

export const whyNow = "Traversing to label components is linear too, but it needs the adjacency list built first — n extra entries and a second structure to hold the visited marks. The disjoint-set forest counts components as a side effect of reading the cables, so the answer needs one array and no graph at all."

export const arc = "This problem is worth keeping for its proof rather than its code. Two separate facts combine: you need at least n-1 cables, and joining k components costs k-1 moves. Once both are stated, no search for which cable to move is ever required — the counting argument guarantees a spare exists whenever a gap does. That is the shape of most good greedy and union-find arguments: prove that a choice always exists, and the algorithm stops being a search. Union-find earns its place here because counting components is what it does for free, as a by-product of the merges, and the answer is literally one less than the number of roots left standing."

export const complexity = { time: "O(n) for practical purposes", space: "O(n)" }

export const python = `def make_connected(n: int, connections: list[list[int]]) -> int:
    # n computers need at least n - 1 cables, whatever the arrangement
    if len(connections) < n - 1:
        return -1
    parent = list(range(n))
    size = [1] * n
    components = n

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in connections:
        ra, rb = find(a), find(b)
        if ra == rb:
            continue  # a spare cable; it need not be identified further
        if size[ra] < size[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        size[ra] += size[rb]
        components -= 1
    return components - 1`

export const alternatives: Solution[] = [
  {
    name: "Count components by flooding",
    summary:
      "Build an adjacency list, then run a search from each computer that has not been visited, marking everything it reaches. The number of searches started is the number of components, and the answer is one less — provided there are enough cables to begin with.",
    complexity: { time: "O(n + m)", space: "O(n + m)" },
    python: `def make_connected(n: int, connections: list[list[int]]) -> int:
    if len(connections) < n - 1:
        return -1
    adj: dict[int, list[int]] = {}
    for a, b in connections:
        adj.setdefault(a, []).append(b)
        adj.setdefault(b, []).append(a)
    seen = [False] * n
    components = 0
    for start in range(n):
        if seen[start]:
            continue
        components += 1
        stack = [start]
        seen[start] = True
        while stack:
            node = stack.pop()
            for nxt in adj.get(node, []):
                if not seen[nxt]:
                    seen[nxt] = True
                    stack.append(nxt)
    return components - 1`,
  },
]
