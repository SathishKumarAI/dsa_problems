// Longest Common Subsequence, derived — and the first journey to draw a table
// being FILLED rather than a structure being walked. The grid view carries it
// unchanged: the cells are the sub-answers, and the marks say which three the
// current one is reading.
//
// Both strings travel in the row (cells: "words"), a and then b, so the drawer
// stays one field: "abcde ace".

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/longest-common-subsequence.ts"

type S = Data<string>

const pair = (nums: string[]) => ({ a: nums[0] ?? "", b: nums[1] ?? "" })

/** The reference: the length of the longest subsequence common to both. */
export function lcsLength(nums: string[]) {
  const { a, b } = pair(nums)
  const best = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      best[i][j] =
        a[i - 1] === b[j - 1]
          ? best[i - 1][j - 1] + 1
          : Math.max(best[i - 1][j], best[i][j - 1])
  return best[a.length][b.length]
}

/** One longest common subsequence, read back out of the table. */
function lcsString(a: string, b: string) {
  const best = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      best[i][j] =
        a[i - 1] === b[j - 1]
          ? best[i - 1][j - 1] + 1
          : Math.max(best[i - 1][j], best[i][j - 1])
  let i = a.length
  let j = b.length
  let out = ""
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out = a[i - 1] + out
      i--
      j--
    } else if (best[i - 1][j] >= best[i][j - 1]) i--
    else j--
  }
  return out
}

/** The table as a grid: a header row and column of characters, then the cells. */
const tableOf = (
  a: string,
  b: string,
  best: number[][],
  label: string,
  upto: (i: number, j: number) => boolean,
  mark?: (i: number, j: number) => ChipRole | undefined
) => {
  const cells: (number | string)[][] = []
  const marks: Record<string, ChipRole> = {}
  const head: number | string = "·"
  cells.push([head, "ε", ...[...b]])
  for (let i = 0; i <= a.length; i++) {
    const row: (number | string)[] = [i === 0 ? "ε" : a[i - 1]]
    for (let j = 0; j <= b.length; j++) {
      row.push(upto(i, j) ? best[i][j] : "")
      const m = mark?.(i, j)
      if (m) marks[`${i + 1},${j + 1}`] = m
    }
    cells.push(row)
  }
  return { cells, marks, label }
}

const empty = (a: string, b: string) =>
  Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  )

/** Which positions of `a` spell the example subsequence — earliest first. */
const markLcs = (a: string, sub: string) => {
  const marks: Record<number, ChipRole> = {}
  let taken = 0
  for (let i = 0; i < a.length && taken < sub.length; i++)
    if (a[i] === sub[taken]) {
      marks[i] = "answer"
      taken++
    }
  return marks
}

function* story({ nums }: S): Generator<DFrame> {
  const { a, b } = pair(nums)
  const answer = lcsLength(nums)
  const sub = lcsString(a, b)
  yield {
    hold: 3,
    noChips: true,
    note: `Two strings, "${a}" and "${b}". How long is the longest run of characters that appears in BOTH, in the same order — allowing gaps in either?`,
  }
  yield {
    hold: 3,
    marks: {},
    row: [...a],
    note: "The word to weigh is 'subsequence'. A substring is a contiguous slice; a subsequence keeps only the order, so characters may be skipped freely in either string. Those are different problems with very different answers.",
  }
  yield {
    hold: 3,
    row: [...a],
    marks: markLcs(a, sub),
    state: [
      { label: "a", value: a },
      { label: "b", value: b },
      { label: "answer", value: answer },
    ],
    answer,
    corner:
      answer === 0
        ? "nothing"
        : answer === Math.min(a.length, b.length)
          ? "contained"
          : sub.length !== new Set(sub).size
            ? "repeats"
            : "gaps",
    note:
      answer === 0
        ? "These two share no characters at all, so the answer is 0. A length of zero is an answer, not a failure — and it is what the empty prefixes of both strings already agree on before any work starts."
        : answer === Math.min(a.length, b.length)
          ? `The shorter string is entirely inside the longer one as a subsequence, so the answer is its full length, ${answer}. The upper bound, and worth knowing: no answer can exceed the shorter string.`
          : sub.length !== new Set(sub).size
            ? `${answer} — for example "${sub}". Note the repeated character: matching is by POSITION, not by letter, so the same letter can be used more than once as long as each use is a different pair of positions.`
            : `${answer}, for example "${sub}" — highlighted in a. Those characters are scattered in both strings; only their ORDER has to survive.`,
  }
}

/** Rung 1 — recurse from the ends, branching on every mismatch. */
function* branch({ nums }: S): Generator<DFrame> {
  const { a, b } = pair(nums)
  const best = empty(a, b)
  const asked = new Map<string, number>()
  let calls = 0
  let repeats = 0
  const seen = new Set<string>()
  function* walk(i: number, j: number): Generator<DFrame, number> {
    calls++
    const key = `${i},${j}`
    if (seen.has(key)) repeats++
    seen.add(key)
    if (i === 0 || j === 0) return 0
    const match = a[i - 1] === b[j - 1]
    let v: number
    if (match) v = (yield* walk(i - 1, j - 1)) + 1
    else {
      const dropA = yield* walk(i - 1, j)
      const dropB = yield* walk(i, j - 1)
      v = Math.max(dropA, dropB)
    }
    best[i][j] = v
    asked.set(key, (asked.get(key) ?? 0) + 1)
    yield {
      line: match ? 4 : 5,
      grid: tableOf(
        a,
        b,
        best,
        match
          ? `"${a[i - 1]}" matches`
          : `"${a[i - 1]}" ≠ "${b[j - 1]}" — try both`,
        (r, c) => asked.has(`${r},${c}`),
        (r, c) =>
          r === i && c === j
            ? "focus"
            : asked.get(`${r},${c}`)! > 1
              ? "dim"
              : undefined
      ),
      state: [
        { label: "prefixes", value: `${a.slice(0, i)} · ${b.slice(0, j)}` },
        { label: "answer here", value: v },
        { label: "calls", value: calls },
      ],
      note: match
        ? `Both prefixes end in "${a[i - 1]}", so that character is in some longest answer: take it and ask the same question of the two shorter prefixes. One branch, not two.`
        : `"${a[i - 1]}" and "${b[j - 1]}" differ, so at least one of them is unused — but which is unknown, so BOTH are tried. That is where the work explodes: two branches per mismatch, and they overlap.`,
    }
    return v
  }
  const answer = yield* walk(a.length, b.length)
  yield {
    line: 9,
    answer,
    grid: tableOf(
      a,
      b,
      best,
      `${answer}`,
      (r, c) => asked.has(`${r},${c}`),
      (r, c) => ((asked.get(`${r},${c}`) ?? 0) > 1 ? "dim" : undefined)
    ),
    state: [
      { label: "answer", value: answer },
      { label: "calls made", value: calls },
      { label: "questions repeated", value: repeats },
    ],
    corner: answer === 0 ? "nothing" : undefined,
    note: `${answer}, from ${calls} calls — and ${repeats} of them asked a question that had already been answered somewhere else in the tree. The dim cells are the repeats. There are only ${(a.length + 1) * (b.length + 1)} distinct questions here; the branching visits them over and over along different paths.`,
  }
}

/** Rung 2 — fill the table, each question asked once. */
function* table({ nums }: S): Generator<DFrame> {
  const { a, b } = pair(nums)
  const best = empty(a, b)
  let fills = 0
  yield {
    line: 2,
    grid: tableOf(
      a,
      b,
      best,
      "row 0 and column 0 are zero",
      (r, c) => r === 0 || c === 0,
      (r, c) => (r === 0 || c === 0 ? "anchor" : undefined)
    ),
    state: [{ label: "cells to fill", value: a.length * b.length }],
    note: "The table is best[i][j]: the answer for the first i characters of a and the first j of b. The border is 0 because an empty string shares nothing with anything — that row and column are the base case, written down once instead of tested every time.",
  }
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const match = a[i - 1] === b[j - 1]
      best[i][j] = match
        ? best[i - 1][j - 1] + 1
        : Math.max(best[i - 1][j], best[i][j - 1])
      fills++
      yield {
        line: match ? 6 : 8,
        grid: tableOf(
          a,
          b,
          best,
          match
            ? `"${a[i - 1]}" = "${b[j - 1]}" → ${best[i - 1][j - 1]} + 1`
            : `max(${best[i - 1][j]}, ${best[i][j - 1]})`,
          (r, c) => r === 0 || c === 0 || r < i || (r === i && c <= j),
          (r, c) =>
            r === i && c === j
              ? "focus"
              : match
                ? r === i - 1 && c === j - 1
                  ? "anchor"
                  : undefined
                : (r === i - 1 && c === j) || (r === i && c === j - 1)
                  ? "anchor"
                  : undefined
        ),
        state: [
          { label: "cell", value: `${i},${j}` },
          { label: "value", value: best[i][j] },
        ],
        corner: fills === 1 ? "gaps" : undefined,
        note: match
          ? `"${a[i - 1]}" and "${b[j - 1]}" agree, so this cell is the diagonal neighbour plus one — the pair is used, and what is left is the two shorter prefixes.`
          : `They differ, so one of the two characters goes unused: take the better of the cell above and the cell to the left. Both were computed already, so this is a lookup rather than a search.`,
      }
    }
  const answer = lcsLength(nums)
  yield {
    line: 9,
    answer,
    grid: tableOf(
      a,
      b,
      best,
      `answer ${answer}`,
      () => true,
      (r, c) => (r === a.length && c === b.length ? "answer" : undefined)
    ),
    state: [
      { label: "answer", value: answer },
      { label: "cells filled", value: fills },
      { label: "example", value: lcsString(a, b) || "—" },
    ],
    corner:
      answer === Math.min(a.length, b.length) && answer > 0
        ? "contained"
        : lcsString(a, b).length !== new Set(lcsString(a, b)).size
          ? "repeats"
          : undefined,
    note: `${answer}, in ${fills} ${fills === 1 ? "fill" : "fills"} — one per question, each answered exactly once. Every cell read only the row above and the cell to its left, which is also why two rows of memory would do instead of the whole table.`,
  }
}

export const longestCommonSubsequence = deriveJourney<string>(problem, {
  slug: "same-order-gaps-allowed",
  subtitle: "ask each pair of prefixes once, and the table answers the rest",
  reveals: ["dp"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "longer strings" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length === 2 && nums.every((s) => /^[a-z]+$/.test(s))
      ? { ok: true }
      : {
          ok: false,
          warning: "two lowercase words, separated by a space — e.g. abcde ace",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["abcde", "ace"],
      info: '"ace" — length 3',
    },
    nothing: {
      label: "nothing in common",
      nums: ["abc", "def"],
      info: "the answer is 0",
    },
    contained: {
      label: "one is inside the other",
      nums: ["axbxcx", "abc"],
      info: "the shorter string is the answer",
    },
    repeats: {
      label: "a repeated letter",
      nums: ["aab", "aba"],
      info: "positions match, not letters",
    },
    gaps: {
      label: "a subsequence, not a substring",
      nums: ["abcdefg", "aeg"],
      info: "gaps are free",
    },
    same: {
      label: "identical strings",
      nums: ["abcd", "abcd"],
      info: "the whole diagonal",
    },
    long: {
      label: "longer strings",
      nums: ["abcbdabe", "bdcaba"],
      info: "eight by six",
    },
  },
  edges: [
    {
      key: "nothing",
      name: "no shared characters",
      example: '"abc" and "def" → 0',
      why: "0 is a valid answer. It is also what the whole border of the table already says, so a correct fill returns it without any special case — but a recursion that assumes at least one match will not terminate on the right value.",
      think:
        "What does your base case return, and is it ever the final answer?",
      preset: "nothing",
      constraint: 3,
    },
    {
      key: "gaps",
      name: "gaps are allowed, so this is not a substring",
      example: '"abcdefg" and "aeg" → 3',
      why: "A subsequence keeps order and nothing else. Solving the substring problem here — requiring the characters to be adjacent — gives a smaller answer on almost every input and is right on some, which is how the mistake survives.",
      think:
        "Does your recurrence ever require the matched characters to be neighbours?",
      preset: "gaps",
      constraint: 2,
    },
    {
      key: "repeats",
      name: "the same letter more than once",
      example: '"aab" and "aba" → 2',
      why: "Matching is between POSITIONS, not letters, so one letter can be used twice as long as each use is a different pair of indices. Code that tracks which characters have been used, rather than which prefixes are left, gets this wrong.",
      think:
        "Is your state a set of used letters, or a pair of prefix lengths?",
      preset: "repeats",
      constraint: 2,
    },
    {
      key: "contained",
      name: "one string sits entirely inside the other",
      example: '"axbxcx" and "abc" → 3',
      why: "The answer is the shorter string's whole length, which is the upper bound for any input. Useful as a sanity check: an answer longer than the shorter string means the recurrence is counting something twice.",
      think: "What is the largest answer this problem can possibly have?",
      preset: "contained",
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
        "given: two lowercase strings",
        "a SUBSEQUENCE keeps order but may skip characters",
        "task: return the length of the longest one present in both",
        "no shared characters at all is an answer of 0",
      ],
      tools: [
        {
          name: "Two strings",
          role: "written here as two tokens in one row, a then b. What matters about them is their ORDER, not their positions — which is why the state that solves this is a pair of prefix lengths rather than anything about the characters themselves.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "subsequence means order without adjacency — gaps are free",
        "matching happens between positions, so a repeated letter is not a special case",
        "the answer can never exceed the length of the shorter string",
      ],
      quiz: [
        {
          q: 'Is "ace" a subsequence of "abcde"?',
          choices: [
            "no — the characters are not next to each other",
            "yes — order is kept, and gaps are allowed",
          ],
          answer: 1,
          explain:
            "Adjacency belongs to substrings. Confusing the two is the fastest way to a smaller answer that looks plausible.",
        },
      ],
      run: story,
    },
    {
      key: "branch",
      name: "Try both ways at every mismatch",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Compare the two ends. On a match, take the character and shrink both strings. On a mismatch, try dropping each end in turn and keep the better answer.",
      takeaways: [
        "the two rules ARE the definition of the answer, and they are three lines",
        "a match branches once; a mismatch branches twice, and those branches overlap",
        "the same pair of prefixes is asked about again and again along different paths",
        "the work is exponential, while the number of distinct questions is only (n+1) × (m+1)",
      ],
      quiz: [
        {
          q: "Why does a mismatch need two branches?",
          choices: [
            "to compare the two characters properly",
            "because one of the two characters is unused and nothing yet says which one",
          ],
          answer: 1,
          explain:
            "The decision cannot be made locally, so both are tried. Everything expensive about this rung follows from that.",
        },
      ],
      run: branch,
    },
    {
      key: "table",
      name: "Ask each question once",
      short: "fill the table",
      insight:
        "The branching re-solves the same pair of prefixes along many different paths — exponential work for a quadratic number of distinct questions.",
      idea: problem.whyNow!,
      takeaways: [
        "best[i][j] is the answer for the first i of a and the first j of b — that is the whole design",
        "row 0 and column 0 are zero, so the base case is written down rather than tested",
        "on a match take the diagonal plus one; on a mismatch take the better of above and left",
        "every cell reads only the row above and the cell to its left, so two rows of memory would do",
      ],
      quiz: [
        {
          q: "Why is the border of the table filled with zeros before anything else?",
          choices: [
            "to make the arithmetic easier to read",
            "because an empty prefix shares nothing with any string — it is the base case, stored rather than tested",
          ],
          answer: 1,
          explain:
            "With the border in place, every other cell can be filled by the same two lines, with no boundary checks anywhere.",
        },
      ],
      run: table,
    },
  ],
})
