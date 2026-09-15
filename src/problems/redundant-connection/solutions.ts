// redundant-connection — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Keep a disjoint-set forest over the nodes and add the edges in order. For each edge, find the representative of both endpoints: if they differ the edge joins two separate components, so union them; if they match, the endpoints were already connected and this edge closes the cycle, so it is the answer. Path compression during find and union by size keep both operations effectively constant, so the whole scan is linear in the number of edges. Processing in input order is what satisfies the tie-break — the first edge that fails the test is precisely the last edge of the cycle in the input."

export const whyNow = "The incremental search still walks the component from one endpoint on every edge, so a long path costs a full traversal per edge. A disjoint-set forest answers 'same component?' by following two short parent chains, and each find flattens the chain it walked, so the answer arrives without ever touching the component's interior."

export const arc = "The question under this problem is not about trees at all: it is 'were these two things already in the same group?', asked once per edge, with the groups changing as you go. That is exactly what a disjoint-set forest exists for, and the two optimisations are worth understanding rather than memorising — path compression flattens a chain the moment you walk it, and union by size keeps a chain from getting deep in the first place. Together they make find so nearly constant that you can stop counting it. Once you can see a problem as a stream of merges with connectivity questions between them, union-find replaces a graph traversal with two array lookups, and that reframing is far more transferable than this particular puzzle. The trap here is the node labelling: nodes run from 1, arrays from 0."

export const complexity = { time: "O(n) for practical purposes", space: "O(n)" }

export const python = `def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    n = len(edges)
    parent = list(range(n + 1))  # nodes are 1..n, so slot 0 is unused
    size = [1] * (n + 1)

    def find(x: int) -> int:
        # path compression: every node walked now points straight at the root
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        # union by size: hang the smaller tree under the larger
        if size[ra] < size[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        size[ra] += size[rb]
    return []`

export const alternatives: Solution[] = [
  {
    name: "Remove each edge and test the rest",
    summary:
      "For every edge, delete it, and check whether the remaining n-1 edges still connect all n nodes. The last edge that passes is the answer. It is the definition read straight off the page and needs no data structure, at the price of a full traversal per edge.",
    complexity: { time: "O(n^2)", space: "O(n)" },
    python: `def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    n = len(edges)
    answer: list[int] = []
    for skip in range(n):
        adj: dict[int, list[int]] = {}
        for i, (a, b) in enumerate(edges):
            if i == skip:
                continue
            adj.setdefault(a, []).append(b)
            adj.setdefault(b, []).append(a)
        seen = {1}
        stack = [1]
        while stack:
            node = stack.pop()
            for nxt in adj.get(node, []):
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
        if len(seen) == n:
            answer = edges[skip]
    return answer`,
  },
  {
    name: "Add edges one at a time, search for a path",
    summary:
      "Build the graph incrementally. Before adding an edge, run a search from one endpoint over what has been built so far: if the other endpoint is already reachable, this edge closes the cycle. It stops at the right edge rather than testing all of them.",
    complexity: { time: "O(n^2) worst case", space: "O(n)" },
    whyNow:
      "Deleting each edge in turn rebuilds the entire graph n times and keeps going after the answer is found. Building once and asking the question before each insertion touches each edge a single time and stops the moment the cycle closes.",
    python: `def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    adj: dict[int, list[int]] = {}

    def reaches(src: int, dst: int) -> bool:
        seen = {src}
        stack = [src]
        while stack:
            node = stack.pop()
            if node == dst:
                return True
            for nxt in adj.get(node, []):
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
        return False

    for a, b in edges:
        if a in adj and b in adj and reaches(a, b):
            return [a, b]
        adj.setdefault(a, []).append(b)
        adj.setdefault(b, []).append(a)
    return []`,
  },
]
