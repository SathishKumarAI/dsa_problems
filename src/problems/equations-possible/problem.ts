// equations-possible — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "equations-possible"

export const title = "Can All These Equalities Hold at Once?"

export const pattern = "union-find"

export const difficulty: Difficulty = "medium"

export const leetcode = "satisfiability-of-equality-equations"

export const brief = "A list of a==b and a!=b claims about single letters; say whether any assignment satisfies them all."

export const statement = "You are given equations of exactly four characters each, either \"a==b\" or \"a!=b\", over single lowercase letters. Decide whether variables can be assigned integers so that every equation holds. The shape of the answer is what matters: equality is transitive and inequality is not, so the two kinds of claim cannot be processed in one pass."

export const constraints: string[] = [
  "1 <= equations.length <= 500, and each string is exactly four characters",
  "the operator is always \"==\" or \"!=\", never anything else, so no parsing beyond the middle two characters is needed",
  "variables are single lowercase letters, giving at most 26 of them — the universe is tiny and fixed",
  "\"a==a\" is always satisfiable and \"a!=a\" never is, and the self-referring case is the one a careless solution gets wrong",
  "equations arrive in no useful order, so an inequality may be read long before the equalities that contradict it",
]

export const examples: Example[] = [
  {
    input: "equations = [\"a==b\",\"b!=a\"]",
    output: "false",
    note: "The equality forces a and b to be equal; the inequality forbids it.",
  },
  {
    input: "equations = [\"b==a\",\"a==b\"]",
    output: "true",
    note: "The same claim twice is still one claim. Nothing contradicts it.",
  },
  {
    input: "equations = [\"a==b\",\"b==c\",\"a!=c\"]",
    output: "false",
    note: "Nothing directly equates a and c — transitivity does, which is exactly what merging groups captures and pairwise checking misses.",
  },
]
