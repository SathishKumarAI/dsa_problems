// equations-possible — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Two passes, in this order. First, union the two letters of every == equation, building the groups that equality forces; a disjoint-set forest over the 26 letters is the whole structure. Then walk the != equations and reject the moment both letters find the same representative, because that pair is forced equal and forbidden from being equal at the same time. If none of them clashes, an assignment exists — give every group its own number. The order is not a convenience: an inequality checked before all the merges are in cannot see the equalities still to come."

export const whyNow = "Recomputing each letter's group by traversal for every inequality walks the same component again and again, and the graph has to be rebuilt to be traversed at all. The disjoint-set forest has already finished that work by the end of the first pass, so each inequality costs two finds."

export const arc = "The real content here is that not every relation may be processed in whatever order it arrives. Equality is an equivalence relation — reflexive, symmetric, transitive — and that is precisely what a disjoint-set structure models; inequality is a constraint ON those classes and can only be judged once the classes are final. Separating the constraints that BUILD structure from the constraints that TEST it, and doing all the building first, is a move that reappears in type checkers, in scheduling and in every constraint solver you are likely to meet. The corner case that catches people is the self-referring equation: a!=a is unsatisfiable on its own, and it falls out for free because a letter always finds itself."

export const complexity = { time: "O(n) over a fixed 26-letter universe", space: "O(1) — 26 slots regardless of input" }

export const python = `def equations_possible(equations: list[str]) -> bool:
    parent = list(range(26))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    # pass 1: every equality merges two groups
    for eq in equations:
        if eq[1] == "=":
            ra, rb = find(ord(eq[0]) - 97), find(ord(eq[3]) - 97)
            parent[rb] = ra
    # pass 2: an inequality inside one group is a contradiction
    for eq in equations:
        if eq[1] == "!":
            if find(ord(eq[0]) - 97) == find(ord(eq[3]) - 97):
                return False
    return True`

export const alternatives: Solution[] = [
  {
    name: "Close the equalities by brute force",
    summary:
      "Keep a table of which pairs are known equal and keep sweeping the equations, adding every consequence of transitivity, until a full sweep adds nothing. Then test the inequalities against the table. It computes the transitive closure the slow way, by repetition.",
    complexity: { time: "O(n * 26^3)", space: "O(26^2)" },
    python: `def equations_possible(equations: list[str]) -> bool:
    same = [[i == j for j in range(26)] for i in range(26)]
    for eq in equations:
        if eq[1] == "=":
            a, b = ord(eq[0]) - 97, ord(eq[3]) - 97
            same[a][b] = same[b][a] = True
    changed = True
    while changed:
        changed = False
        for k in range(26):
            for i in range(26):
                if not same[i][k]:
                    continue
                for j in range(26):
                    if same[k][j] and not same[i][j]:
                        same[i][j] = True
                        changed = True
    for eq in equations:
        if eq[1] == "!":
            a, b = ord(eq[0]) - 97, ord(eq[3]) - 97
            if same[a][b]:
                return False
    return True`,
  },
  {
    name: "Build the graph, then flood each group",
    summary:
      "Treat every equality as an undirected edge and run a traversal from each unvisited letter, painting its whole component with one group number. An inequality is violated when both letters carry the same paint. Two clean passes, and the structure is a plain adjacency list.",
    complexity: { time: "O(n + 26)", space: "O(n)" },
    whyNow:
      "Repeated sweeping recomputes the same consequences until nothing changes, so the closure costs a cube over the alphabet for no reason. A single traversal per component labels every letter once, and transitivity is then just 'reached by the same search'.",
    python: `def equations_possible(equations: list[str]) -> bool:
    adj: dict[int, list[int]] = {}
    for eq in equations:
        if eq[1] == "=":
            a, b = ord(eq[0]) - 97, ord(eq[3]) - 97
            adj.setdefault(a, []).append(b)
            adj.setdefault(b, []).append(a)
    group = [-1] * 26
    label = 0
    for start in range(26):
        if group[start] != -1:
            continue
        stack = [start]
        group[start] = label
        while stack:
            node = stack.pop()
            for nxt in adj.get(node, []):
                if group[nxt] == -1:
                    group[nxt] = label
                    stack.append(nxt)
        label += 1
    for eq in equations:
        if eq[1] == "!":
            a, b = ord(eq[0]) - 97, ord(eq[3]) - 97
            if group[a] == group[b]:
                return False
    return True`,
  },
]
