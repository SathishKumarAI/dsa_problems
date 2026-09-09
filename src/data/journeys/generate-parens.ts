// Generate Parentheses, derived. The input is a single number — the row holds
// exactly one value, n — which makes this the first journey whose stage has no
// input sequence to walk at all. What grows on screen is the ANSWER.
//
// The lesson is where the legality test goes: at the end (filter) or at the
// moment of the choice (prune). Same rule, and the difference between 65,536
// strings and 1,430 at n = 8.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/generate-parens.ts"

type N = Data<number>

const nOf = (nums: number[]) => nums[0] ?? 0

/** The reference: every well-formed string of n pairs, in the usual order. */
export function allParens(n: number): string[] {
  const out: string[] = []
  const build = (opened: number, closed: number, current: string) => {
    if (current.length === 2 * n) {
      out.push(current)
      return
    }
    if (opened < n) build(opened + 1, closed, current + "(")
    if (closed < opened) build(opened, closed + 1, current + ")")
  }
  build(0, 0, "")
  return out
}

const balanced = (s: string) => {
  let depth = 0
  for (const ch of s) {
    depth += ch === "(" ? 1 : -1
    if (depth < 0) return false
  }
  return depth === 0
}

/** The strings so far, drawn as a grid of rows. */
const listing = (
  found: string[],
  label: string,
  mark?: (i: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  const rows = found.length ? found.map((s) => [s]) : [["—"]]
  rows.forEach((_, r) => {
    const m = mark?.(r)
    if (m) marks[`${r},0`] = m
  })
  return { cells: rows as (number | string)[][], marks, label }
}

function* story({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const answer = allParens(n)
  yield {
    hold: 3,
    noChips: true,
    note: `Given n = ${n}, list every well-formed string of ${n} opening and ${n} closing brackets. Not how many — the strings themselves.`,
  }
  yield {
    hold: 3,
    noChips: true,
    state: [
      { label: "n", value: n },
      { label: "arrangements", value: 2 ** (2 * n) },
      { label: "well-formed", value: answer.length },
    ],
    note: `There are ${2 ** (2 * n)} ways to arrange ${2 * n} brackets, and only ${answer.length} of them are legal. The gap between those two numbers is the entire problem: it is the difference between checking at the end and choosing correctly as you go.`,
  }
  yield {
    hold: 3,
    grid: listing(answer, `${answer.length} of them`, () => "answer"),
    answer,
    corner: n === 1 ? "smallest" : answer.length === 2 ? "two" : "prefix",
    note:
      n === 1
        ? 'One pair, one answer: "()". The smallest case, and the base every larger one is built out of.'
        : `${answer.length} strings. Look at what makes one legal: reading left to right, the count of open brackets never drops below zero, and it ends at exactly zero. Both halves matter — ")(" ends at zero too.`,
  }
}

/** Rung 1 — generate all 2^(2n) strings, keep the legal ones. */
function* filterAll({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const total = 2 ** (2 * n)
  const found: string[] = []
  let built = 0
  for (let mask = 0; mask < total; mask++) {
    let s = ""
    for (let i = 0; i < 2 * n; i++) s += mask & (1 << i) ? "(" : ")"
    built++
    const ok = balanced(s)
    if (ok) found.push(s)
    if (built % Math.max(1, Math.floor(total / 8)) === 0 || ok)
      yield {
        line: 11,
        grid: listing(
          found,
          `${found.length} kept of ${built} built`,
          () => "answer"
        ),
        state: [
          { label: "built", value: built },
          { label: "kept", value: found.length },
          { label: "just tried", value: s },
        ],
        note: ok
          ? `"${s}" is well-formed, so it is kept. It was produced by the same blind enumeration that produced every rejected string — nothing about the construction knew it would be legal.`
          : `${built} strings built so far, ${found.length} of them legal. "${s}" is not: it was constructed anyway, in full, and checked only once complete.`,
      }
  }
  const answer = allParens(n)
  yield {
    line: 15,
    answer,
    grid: listing(answer, "sorted", () => "answer"),
    state: [
      { label: "built", value: built },
      { label: "kept", value: answer.length },
      { label: "wasted", value: built - answer.length },
    ],
    corner: n === 1 ? "smallest" : undefined,
    note: `${answer.length} answers, from ${built} strings — ${built - answer.length} of them built completely and thrown away. At n = 8 that is 65,536 strings for 1,430 answers, and every one of the rejects was known to be doomed long before it was finished.`,
  }
}

/** Rung 2 — build with the rule, so nothing illegal is ever built. */
function* prune({ nums }: N): Generator<DFrame> {
  const n = nOf(nums)
  const found: string[] = []
  let nodes = 0
  function* build(
    opened: number,
    closed: number,
    current: string
  ): Generator<DFrame> {
    nodes++
    if (current.length === 2 * n) {
      found.push(current)
      yield {
        line: 2,
        grid: listing(found, `${found.length} complete`, (i) =>
          i === found.length - 1 ? "focus" : "answer"
        ),
        state: [
          { label: "complete", value: current },
          { label: "found", value: found.length },
        ],
        note: `"${current}" uses all ${n} pairs and every step of it was legal when it was taken — so no check is needed here. Completeness is the only thing the base case tests.`,
      }
      return
    }
    const canOpen = opened < n
    const canClose = closed < opened
    yield {
      line: canOpen && canClose ? 4 : canOpen ? 4 : 6,
      grid: listing(found, `"${current || "ε"}"`, () => "answer"),
      state: [
        { label: "so far", value: current || "ε" },
        { label: "opens left", value: n - opened },
        { label: "may close", value: canClose ? "yes" : "no" },
      ],
      corner: !canClose && current.length > 0 ? "prefix" : undefined,
      note: canClose
        ? `"${current || "nothing"}" so far: ${opened} opened, ${closed} closed. Both moves are legal here — an opening bracket while fewer than ${n} are used, and a closing one because there is something open to close.`
        : `"${current || "nothing"}" so far. A closing bracket is NOT legal: ${closed} are closed and only ${opened} opened, so it would have nothing to match. That single condition is what makes an illegal string impossible to build rather than something to filter out later.`,
    }
    if (canOpen) yield* build(opened + 1, closed, current + "(")
    if (canClose) yield* build(opened, closed + 1, current + ")")
  }
  yield* build(0, 0, "")
  const answer = allParens(n)
  yield {
    line: 13,
    answer,
    grid: listing(answer, `${answer.length} answers`, () => "answer"),
    state: [
      { label: "answers", value: answer.length },
      { label: "partial strings visited", value: nodes },
      { label: "blind enumeration would build", value: 2 ** (2 * n) },
    ],
    corner: answer.length === 2 ? "two" : undefined,
    note: `${answer.length} answers from ${nodes} partial strings, against ${2 ** (2 * n)} for the blind version. Every string visited here is either an answer or a prefix of one — nothing else is ever constructed, because the rule is applied at the moment of the choice rather than at the end.`,
  }
}

export const generateParens = deriveJourney<number>(problem, {
  slug: "never-build-what-cannot-work",
  subtitle: "check the rule when you choose, not when you finish",
  reveals: ["stack"],
  defaultPreset: "example",
  harder: { preset: "four", label: "n = 4" },
  classify: (d) => {
    const nums = d.nums as number[]
    return nums.length === 1 &&
      Number.isInteger(nums[0]) &&
      nums[0] >= 1 &&
      nums[0] <= 5
      ? { ok: true }
      : {
          ok: false,
          warning:
            "one number: n, from 1 to 5 (the real problem allows 8; the animation would be unreadable)",
        }
  },
  presets: {
    example: { label: "n = 3", nums: [3], info: "five answers" },
    smallest: { label: "n = 1", nums: [1], info: 'just "()"' },
    two: { label: "n = 2", nums: [2], info: "two of the sixteen" },
    four: { label: "n = 4", nums: [4], info: "fourteen answers" },
    five: { label: "n = 5", nums: [5], info: "forty-two answers" },
  },
  edges: [
    {
      key: "smallest",
      name: "n = 1",
      example: 'n = 1 → ["()"]',
      why: "The smallest legal input, and the answer is a list of one rather than a bare string. It is also where an off-by-one in the length test shows up immediately.",
      think: "What does your base case compare the length against?",
      preset: "smallest",
      constraint: 0,
    },
    {
      key: "prefix",
      name: "an illegal prefix is never extended",
      example: 'after ")" nothing can save the string',
      why: "The rule that a closing bracket needs something open is checked BEFORE the character is added. That is what turns an exponential enumeration into a walk over answers and their prefixes — the difference is not a constant factor.",
      think: "At what moment does your code decide a character is allowed?",
      preset: "example",
      constraint: 2,
    },
    {
      key: "two",
      name: "both halves of well-formed matter",
      example: 'n = 2 → "(())" and "()()" — and ")(" is neither',
      why: 'The running count must never go negative AND must end at zero. Checking only the total gives equal numbers of each bracket, which ")(" satisfies while being plainly wrong.',
      think: "Does your legality test have one condition or two?",
      preset: "two",
      constraint: 2,
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
        "given: a number n",
        "a string is well formed when its running count of open brackets",
        "never goes negative and ends at exactly zero",
        "task: list every well-formed string of n opening and n closing brackets",
      ],
      tools: [
        {
          name: "The answer itself",
          role: "there is no input sequence to walk here — n is a single number. What grows on the stage is the list of strings, which is unusual and worth noticing: the shape of the SEARCH is the whole problem.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "well formed has two halves: never negative, and ends at zero",
        "the number of arrangements is exponential; the number of answers is far smaller",
        "so where the legality test goes decides how much work is done",
      ],
      quiz: [
        {
          q: 'Why is ")(" not well formed, given it has one of each bracket?',
          choices: [
            "it is well formed — the counts match",
            "the running count goes negative at the first character, and negative is never allowed",
          ],
          answer: 1,
          explain:
            "Ending at zero is necessary and not sufficient. Both halves of the rule have to hold.",
        },
      ],
      run: story,
    },
    {
      key: "filter",
      name: "Build everything, keep what survives",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Produce all 2^(2n) strings of brackets and keep the ones whose running count never goes negative and ends at zero.",
      takeaways: [
        "it separates generating from checking, which makes both halves obvious",
        "and that separation is exactly the waste: a doomed string is still built in full",
        "at n = 8 it constructs 65,536 strings to keep 1,430",
      ],
      run: filterAll,
    },
    {
      key: "prune",
      name: "Ask what is legal before adding it",
      short: "no waste",
      insight:
        "Generating everything and filtering does exponential work to throw most of it away — and the moment a prefix goes negative, every extension of it is already doomed.",
      idea: problem.approach,
      takeaways: [
        "an opening bracket is legal while fewer than n are used",
        "a closing bracket is legal only while closes trail opens — which is the running-count rule, checked one character early",
        "so every string the recursion touches is an answer or a prefix of one",
        "and the completion test needs no legality check at all, because illegality never got this far",
      ],
      quiz: [
        {
          q: "Why does the completed string need no final check?",
          choices: [
            "because it is checked on the way out",
            "because every character was legal when it was added, so an illegal string was never constructed",
          ],
          answer: 1,
          explain:
            "The invariant is maintained rather than verified. That is what makes the search visit only useful states.",
        },
      ],
      run: prune,
    },
  ],
})
