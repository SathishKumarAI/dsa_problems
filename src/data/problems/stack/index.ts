import type { Problem } from "../../types.ts"
import { problem as balancedBrackets } from "./balanced-brackets.ts"
import { problem as dailyWarmer } from "./daily-warmer.ts"
import { problem as largestRectangle } from "./largest-rectangle.ts"
import { problem as rpnEval } from "./rpn-eval.ts"
import { problem as generateParens } from "./generate-parens.ts"
import { problem as asteroidCollision } from "./asteroid-collision.ts"
import { problem as validParenthesisString } from "./valid-parenthesis-string.ts"
import { problem as decodeString } from "./decode-string.ts"
import { problem as removeKDigits } from "./remove-k-digits.ts"

export const stack: Problem[] = [
  balancedBrackets,
  dailyWarmer,
  largestRectangle,
  rpnEval,
  generateParens,
  asteroidCollision,
  validParenthesisString,
  decodeString,
  removeKDigits,
]
