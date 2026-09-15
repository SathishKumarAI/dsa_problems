// count-provinces — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "count-provinces"

export const title = "How Many Connected Groups?"

export const pattern = "union-find"

export const difficulty: Difficulty = "medium"

export const leetcode = "number-of-provinces"

export const brief = "Count connected components from an adjacency matrix."

export const statement = "Given an n × n matrix where cell [i][j] is 1 when city i is directly connected to city j, count the provinces — groups of cities connected directly or indirectly, with no connection to any city outside the group."

export const constraints: string[] = [
  "1 <= n <= 200, and the matrix is n × n",
  "matrix[i][j] is 0 or 1, matrix[i][i] is 1, and matrix[i][j] equals matrix[j][i]",
  "connection is TRANSITIVE — a linked to b and b to c puts all three in one province even if a and c are not directly linked",
  "a city connected to nothing else is a province of one",
]

export const examples: Example[] = [
  {
    input: "matrix = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]",
    output: "2",
    note: "Cities 0 and 1 together, city 2 alone.",
  },
  {
    input: "matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]",
    output: "3",
    note: "Nothing is connected, so every city is its own province.",
  },
]
