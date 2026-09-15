// rpn-eval — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "rpn-eval"

export const title = "Evaluate Reverse Polish Notation"

export const pattern = "stack"

export const difficulty: Difficulty = "medium"

export const leetcode = "evaluate-reverse-polish-notation"

export const brief = "Evaluate an expression written operator-last."

export const statement = "Given an arithmetic expression in reverse Polish notation as a list of tokens, evaluate it and return the result. Each token is either an integer or one of +, -, * and /, and division truncates toward zero."

export const constraints: string[] = [
  "1 <= tokens.length <= 10^4",
  "each token is an operator or an integer in the range -200 to 200",
  "the expression is always valid, so an operator always has two operands waiting",
  "division truncates toward zero, so -7 / 2 is -3 and not -4",
]

export const examples: Example[] = [
  {
    input: 'tokens = ["2", "1", "+", "3", "*"]',
    output: "9",
    note: "(2 + 1) * 3.",
  },
  {
    input: 'tokens = ["4", "13", "5", "/", "+"]',
    output: "6",
    note: "4 + (13 / 5) = 4 + 2.",
  },
]
