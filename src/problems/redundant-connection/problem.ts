// redundant-connection — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "redundant-connection"

export const title = "Find the Edge That Closed the Loop"

export const pattern = "union-find"

export const difficulty: Difficulty = "medium"

export const leetcode = "redundant-connection"

export const brief = "A tree plus one extra edge; say which edge to remove to get the tree back."

export const statement = "You are given a graph that began as a tree over n nodes and had exactly one extra edge added, so it now has n nodes and n edges and contains exactly one cycle. Return the edge that can be removed to leave a tree. If several edges would do, return the one appearing last in the input — which is the detail that makes the order of processing part of the answer."

export const constraints: string[] = [
  "n == edges.length and 3 <= n <= 1000, so even a quadratic answer passes — the reason to reach for union-find here is clarity, not the clock",
  "the graph is connected and has exactly one cycle, which is what makes 'the redundant edge' well defined",
  "edges[i] = [a, b] with a != b, undirected, and no edge appears twice",
  "nodes are labelled 1..n, so an array indexed from zero needs one extra slot or an offset — an off-by-one here silently mislabels the answer",
  "ties are broken by input order: among the edges on the cycle, return the LAST one given",
]

export const examples: Example[] = [
  {
    input: "edges = [[1,2],[1,3],[2,3]]",
    output: "[2,3]",
    note: "All three edges sit on the cycle. The last one wins, which is what processing in order gives for free.",
  },
  {
    input: "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]",
    output: "[1,4]",
    note: "[1,5] is a leaf edge added after the cycle closed. Returning the literal last edge is wrong — it must be the last one that closes a cycle.",
  },
  {
    input: "edges = [[1,2],[1,3],[1,4],[3,4]]",
    output: "[3,4]",
    note: "The cycle is 1-3-4-1, and [3,4] is the edge whose two endpoints were already connected when it arrived.",
  },
]
