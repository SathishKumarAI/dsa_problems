// Evaluate Reverse Polish Notation, derived. The tokens are the row
// (cells: "words"), which is exactly how the expression is written.
//
// The stage is the STACK, growing and collapsing, because the whole insight is
// that an operator's two operands are always the two most recently finished
// values — and "most recently finished" is the definition of a stack.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/rpn-eval.ts"

type T = Data<string>

const OPS = ["+", "-", "*", "/"]

const apply = (op: string, left: number, right: number) =>
  op === "+"
    ? left + right
    : op === "-"
      ? left - right
      : op === "*"
        ? left * right
        : Math.trunc(left / right)

/** The reference: the value the expression evaluates to. */
export function evalRpn(tokens: string[]) {
  const stack: number[] = []
  for (const tok of tokens) {
    if (OPS.includes(tok)) {
      const right = stack.pop()!
      const left = stack.pop()!
      stack.push(apply(tok, left, right))
    } else stack.push(Number(tok))
  }
  return stack[stack.length - 1]
}

/** A valid expression: every operator finds two operands, one value at the end. */
const wellFormed = (tokens: string[]) => {
  let depth = 0
  for (const tok of tokens) {
    if (OPS.includes(tok)) {
      if (depth < 2) return false
      depth--
    } else {
      if (!/^-?\d+$/.test(tok)) return false
      depth++
    }
  }
  return depth === 1
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

/** The stack, bottom to top, as a single grid row. */
const stackView = (
  stack: number[],
  label: string,
  mark?: (i: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  const cells = stack.length ? stack : ["empty"]
  cells.forEach((_, i) => {
    const m = stack.length ? mark?.(i) : undefined
    if (m) marks[`0,${i}`] = m
  })
  return { cells: [cells] as (number | string)[][], marks, label }
}

function* story({ nums }: T): Generator<DFrame> {
  const answer = evalRpn(nums)
  const firstOp = nums.findIndex((t) => OPS.includes(t))
  const hasDivision = nums.includes("/")
  const negativeDiv = (() => {
    // does any division here actually truncate a negative quotient?
    const stack: number[] = []
    for (const tok of nums) {
      if (OPS.includes(tok)) {
        const right = stack.pop()!
        const left = stack.pop()!
        if (tok === "/" && left / right < 0 && !Number.isInteger(left / right))
          return true
        stack.push(apply(tok, left, right))
      } else stack.push(Number(tok))
    }
    return false
  })()
  yield {
    hold: 3,
    noChips: true,
    note: "An arithmetic expression with the operators written AFTER their operands — reverse Polish notation. No brackets anywhere, and none needed. Evaluate it.",
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      OPS.includes(nums[i]) ? "focus" : undefined
    ),
    state: [
      { label: "tokens", value: nums.length },
      { label: "expression", value: nums.join(" ") },
    ],
    note: `Look at the first operator, "${nums[firstOp]}" at position ${firstOp}: it applies to the two values immediately before it. That is the rule of the notation, and it never needs brackets because the position of the operator says everything the brackets would.`,
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, () => "dim"),
    state: [{ label: "answer", value: answer }],
    answer,
    corner: negativeDiv
      ? "truncation"
      : nums.length === 1
        ? "single"
        : hasDivision
          ? "order"
          : "nesting",
    note: negativeDiv
      ? `${answer} — and this expression divides a negative number. Truncation goes toward ZERO here, so −7 / 2 is −3 rather than −4. That is the one rule where languages disagree with each other and with mathematics.`
      : nums.length === 1
        ? `A single number is a valid expression, and its value is itself: ${answer}. No operator ever runs.`
        : `${answer}. Note that the operands an operator needs are always the two most recently FINISHED values — not the two tokens beside it, which may themselves be operators.`,
  }
}

/** Rung 1 — rewrite the list in place, over and over. */
function* rewriteInPlace({ nums }: T): Generator<DFrame> {
  let items = [...nums]
  let scans = 0
  let reads = 0
  yield {
    line: 1,
    marks: {},
    state: [{ label: "tokens", value: items.join(" ") }],
    note: "Work on the list itself: find the first operator, replace it and the two tokens before it with their value, and repeat until one token is left.",
  }
  while (items.length > 1) {
    let i = 0
    scans++
    while (!OPS.includes(items[i])) {
      i++
      reads++
    }
    const left = Number(items[i - 2])
    const right = Number(items[i - 1])
    const value = apply(items[i], left, right)
    const before = items.join(" ")
    items = [...items.slice(0, i - 2), String(value), ...items.slice(i + 1)]
    yield {
      line: 17,
      marks: {},
      state: [
        {
          label: "collapsed",
          value: `${left} ${nums[i] ?? ""} ${right}`.replace(/\s+/g, " "),
        },
        { label: "was", value: before },
        { label: "now", value: items.join(" ") },
      ],
      note: `${left} and ${right} collapse into ${value}. The list is now shorter — and the search for the next operator starts again at the beginning, over tokens that were already walked past.`,
    }
  }
  const answer = evalRpn(nums)
  yield {
    line: 18,
    answer,
    marks: {},
    state: [
      { label: "answer", value: answer },
      { label: "scans", value: scans },
      { label: "tokens re-read", value: reads },
    ],
    corner: nums.length === 1 ? "single" : undefined,
    note: `${answer}, after ${scans} ${scans === 1 ? "scan" : "scans"} and ${reads} tokens re-read. Correct — and each collapse restarts the search from the front, so an expression that is one long chain of operations is quadratic.`,
  }
}

/** Rung 2 — one pass, one stack. */
function* onePass({ nums }: T): Generator<DFrame> {
  const stack: number[] = []
  yield {
    line: 1,
    grid: stackView(stack, "an empty stack"),
    state: [{ label: "stack", value: "empty" }],
    note: "One stack, one pass. A number is pushed; an operator takes the two values on top, combines them, and pushes the result back.",
  }
  for (let i = 0; i < nums.length; i++) {
    const tok = nums[i]
    if (!OPS.includes(tok)) {
      stack.push(Number(tok))
      yield {
        line: 15,
        grid: stackView(stack, `pushed ${tok}`, (k) =>
          k === stack.length - 1 ? "focus" : "dim"
        ),
        state: [
          { label: "token", value: tok },
          { label: "stack", value: stack.join(" ") },
        ],
        note: `${tok} is a value with nothing to do yet, so it waits on the stack. Nothing is decided by a number.`,
      }
      continue
    }
    const right = stack.pop()!
    const left = stack.pop()!
    const value = apply(tok, left, right)
    stack.push(value)
    const truncating =
      tok === "/" && left / right < 0 && !Number.isInteger(left / right)
    yield {
      line: tok === "+" ? 7 : tok === "-" ? 9 : tok === "*" ? 11 : 13,
      grid: stackView(stack, `${left} ${tok} ${right} = ${value}`, (k) =>
        k === stack.length - 1 ? "answer" : "dim"
      ),
      state: [
        { label: "operator", value: tok },
        { label: "left · right", value: `${left} · ${right}` },
        { label: "stack", value: stack.join(" ") },
      ],
      corner: truncating
        ? "truncation"
        : tok === "-" || tok === "/"
          ? "order"
          : undefined,
      note: truncating
        ? `${left} / ${right} is ${(left / right).toFixed(2)}, and the answer is ${value} — truncated toward ZERO, not floored. Floor division would give ${Math.floor(left / right)} here, and this is the only place in the problem where that distinction shows.`
        : tok === "-" || tok === "/"
          ? `${left} ${tok} ${right} = ${value}. The order matters for "${tok}", and the stack hands the operands back in reverse: the FIRST value popped is the right operand, the second is the left. Swap them and this expression quietly evaluates to something else.`
          : `${left} ${tok} ${right} = ${value}, pushed back as a single finished value. It is now indistinguishable from a number that was written there — which is why the stack never needs to remember how it got one.`,
    }
  }
  const answer = evalRpn(nums)
  yield {
    line: 16,
    answer,
    grid: stackView(stack, `${answer}`, () => "answer"),
    state: [
      { label: "answer", value: answer },
      { label: "stack height", value: stack.length },
      { label: "tokens", value: nums.length },
    ],
    corner: nums.length === 1 ? "single" : "nesting",
    note: `${answer}, in one pass over ${nums.length} ${nums.length === 1 ? "token" : "tokens"}, with exactly one value left on the stack. The expression is promised to be valid, which is what lets the pops go unchecked — and the single leftover value is what "valid" means.`,
  }
}

export const rpnEval = deriveJourney<string>(problem, {
  slug: "the-two-most-recent-values",
  subtitle: "an operator wants what just finished, which is what a stack holds",
  reveals: ["stack"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer expression" },
  classify: (d) =>
    wellFormed(d.nums as string[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "a valid RPN expression: integers and + - * /, every operator with two operands before it, one value left at the end",
        },
  presets: {
    example: {
      label: "the example",
      nums: ["2", "1", "+", "3", "*"],
      info: "(2 + 1) × 3 = 9",
    },
    order: {
      label: "order matters",
      nums: ["10", "3", "-"],
      info: "7, not −7",
    },
    truncation: {
      label: "a negative division",
      nums: ["0", "7", "-", "2", "/"],
      info: "−3, not −4",
    },
    single: {
      label: "a bare number",
      nums: ["42"],
      info: "a valid expression",
    },
    nesting: {
      label: "an operator on two results",
      nums: ["2", "3", "+", "4", "5", "+", "*"],
      info: "5 × 9 = 45",
    },
    division: {
      label: "the example with division",
      nums: ["4", "13", "5", "/", "+"],
      info: "4 + 2 = 6",
    },
    long: {
      label: "a longer expression",
      nums: [
        "10",
        "6",
        "9",
        "3",
        "+",
        "-11",
        "*",
        "/",
        "*",
        "17",
        "+",
        "5",
        "+",
      ],
      info: "thirteen tokens",
    },
  },
  edges: [
    {
      key: "order",
      name: "the operands come back reversed",
      example: '["10", "3", "-"] → 7, and popping in the wrong order gives −7',
      why: "A stack returns the most recent value first, so the FIRST pop is the RIGHT operand. For + and × nobody notices; for − and ÷ the answer silently becomes something else, and every test with only additions passes.",
      think: "Which of your two pops is the left operand?",
      preset: "order",
      constraint: 2,
    },
    {
      key: "truncation",
      name: "division truncates toward zero",
      example: "−7 / 2 → −3, not −4",
      why: "Truncation toward zero is not floor division, and they differ exactly when the quotient is negative. Python's // floors, so a direct translation of the obvious operator is wrong on this input and right on every positive one.",
      think:
        "What does your language's integer division do with a negative quotient?",
      preset: "truncation",
      constraint: 3,
    },
    {
      key: "nesting",
      name: "an operator applied to two results",
      example: '["2","3","+","4","5","+","*"] → 5 × 9 = 45',
      why: "Neither operand of the × is a token — both are values produced earlier. This is what the notation is FOR, and it is the case that shows why the operands are 'the two most recently finished values' rather than 'the two tokens to the left'.",
      think: "Are an operator's operands always tokens?",
      preset: "nesting",
      constraint: 2,
    },
    {
      key: "single",
      name: "a bare number",
      example: '["42"] → 42',
      why: "One token, no operator, and a valid expression. It is the boundary where a loop that expects to run an operator at least once, or that reads the answer from a pop rather than from the remaining value, has nothing to work with.",
      think: "Where does your answer come from when no operator ever runs?",
      preset: "single",
      constraint: 0,
    },
  ],
  rungs: [
    {
      key: "story",
      name: "The Problem",
      short: "start here",
      insight: "",
      idea: problem.statement,
      pseudo: [
        "given: tokens in reverse Polish notation — operators after their operands",
        "each token is an integer or one of + - * /",
        "the expression is valid: an operator always has two operands waiting",
        "task: evaluate it, with division truncating toward zero",
      ],
      tools: [
        {
          name: "The token row",
          role: "the expression, read left to right, exactly as written. The stage below draws the STACK rather than the tokens, because the stack is the part that changes.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "an operator applies to the two most recently FINISHED values, which may themselves be results",
        "the notation needs no brackets: the operator's position says what brackets would",
        "order matters for − and ÷, and division truncates toward zero",
      ],
      quiz: [
        {
          q: "In [2, 3, +, 4, 5, +, *], what are the multiplication's operands?",
          choices: [
            "the tokens 5 and +",
            "the two results, 5 and 9 — neither of them is a token",
          ],
          answer: 1,
          explain:
            "That is the whole notation. Operands are finished values, not neighbouring symbols.",
        },
      ],
      run: story,
    },
    {
      key: "rewrite",
      name: "Collapse the first operator, repeat",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Scan for the first operator, replace it and the two tokens before it with their result, and repeat until one token remains.",
      takeaways: [
        "it works directly on the notation, with no extra structure at all",
        "and every collapse restarts the scan from the front",
        "so tokens already walked past are re-read once per operation",
      ],
      run: rewriteInPlace,
    },
    {
      key: "stack",
      name: "Push values, pop two, push the result",
      short: "one pass",
      insight:
        "Restarting the scan after every collapse re-reads the front of the expression again and again — and the only thing the scan is ever looking for is the two most recent values, which never moved.",
      idea: problem.approach,
      takeaways: [
        "a number is pushed; an operator pops two, combines, and pushes the result back",
        "a pushed result is indistinguishable from a written number, which is why nesting needs no special case",
        "the FIRST pop is the right operand — a stack hands values back in reverse",
        "and the single value left at the end is the answer, which is also what makes the expression valid",
      ],
      quiz: [
        {
          q: "Why does a result pushed back onto the stack need no marker saying it was computed?",
          choices: [
            "to save memory",
            "because nothing afterwards cares: an operand is an operand, however it came to be",
          ],
          answer: 1,
          explain:
            "That indifference is what collapses the nesting. The stack never has to model the tree — it only has to hold finished values.",
        },
      ],
      run: onePass,
    },
  ],
})
