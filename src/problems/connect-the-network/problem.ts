// connect-the-network — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "connect-the-network"

export const title = "Spare Cables, Missing Links"

export const pattern = "union-find"

export const difficulty: Difficulty = "medium"

export const leetcode = "number-of-operations-to-make-network-connected"

export const brief = "Move existing cables to join every computer, or say it cannot be done."

export const statement = "There are n computers numbered 0..n-1 and a list of cables, each joining two of them. You may unplug any cable and plug it in between any two computers. Return the fewest moves that make every computer reachable from every other, or -1 if there are not enough cables to do it at all."

export const constraints: string[] = [
  "1 <= n <= 10^5 and 1 <= connections.length <= min(n * (n - 1) / 2, 10^5), so the answer must come out of one pass over the cables",
  "connections[i] = [a, b] with a != b, and no pair appears twice",
  "connecting n computers takes at least n - 1 cables, so fewer than that is -1 no matter how they are arranged",
  "a cable is only spare if BOTH its endpoints were already connected — otherwise unplugging it splits the network",
  "the answer depends only on counts: how many components there are, and whether enough spare cables exist",
]

export const examples: Example[] = [
  {
    input: "n = 4, connections = [[0,1],[0,2],[1,2]]",
    output: "1",
    note: "One of the three cables is redundant, and computer 3 is alone. Move the spare cable to reach it.",
  },
  {
    input: "n = 6, connections = [[0,1],[0,2],[0,3],[1,2],[1,3]]",
    output: "2",
    note: "Three components collapse into one by moving two spare cables. The count of moves is components minus one.",
  },
  {
    input: "n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]",
    output: "-1",
    note: "Four cables cannot connect six computers however they are arranged. The check is on the total, before any structure is examined.",
  },
]
