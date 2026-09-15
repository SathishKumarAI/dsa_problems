// word-search — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "word-search"

export const title = "Trace a Word Through the Grid"

export const pattern = "backtracking"

export const difficulty: Difficulty = "medium"

export const leetcode = "word-search"

export const brief = "Can the word be spelled by walking neighbouring cells?"

export const statement = "Given a grid of letters — supplied here as one string per row — and a word, return true if the word can be spelled by moving between horizontally or vertically adjacent cells. A cell may not be used twice in the same path."

export const constraints: string[] = [
  "1 <= rows, columns <= 6, and every row has the same length",
  "1 <= word.length <= 15, lowercase letters",
  "moves are four-directional, and no cell may be reused WITHIN one path",
  "a cell freed when a path fails must become available again — the reuse ban is per path, not global",
]

export const examples: Example[] = [
  {
    input: 'board = ["abce", "sfcs", "adee"], word = "abcced"',
    output: "true",
  },
  {
    input: 'board = ["abce", "sfcs", "adee"], word = "abcb"',
    output: "false",
    note: "The second b would have to reuse the first one's cell.",
  },
]
