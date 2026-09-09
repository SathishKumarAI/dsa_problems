// Minimum Window Substring, derived. Both strings travel in the row as two
// tokens, s then t, and the frames draw the CHARACTERS of s so the window is
// visible as a span rather than as two numbers.
//
// The lesson is the counter: "does this window cover t" is a map comparison
// done once per candidate in the brute force, and a single integer maintained
// in the window version. That integer is what makes the check O(1).

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/sliding-window/min-cover-substring.ts"

type W = Data<string>

const parts = (nums: string[]) => ({ s: nums[0] ?? "", t: nums[1] ?? "" })

const countsOf = (str: string) => {
  const c = new Map<string, number>()
  for (const ch of str) c.set(ch, (c.get(ch) ?? 0) + 1)
  return c
}

/** The reference: the shortest window of s covering every character of t. */
export function minWindow(nums: string[]) {
  const { s, t } = parts(nums)
  if (!t || t.length > s.length) return ""
  const need = countsOf(t)
  let missing = t.length
  let bestLen = Infinity
  let bestAt = 0
  let left = 0
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    if ((need.get(ch) ?? 0) > 0) missing--
    need.set(ch, (need.get(ch) ?? 0) - 1)
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1
        bestAt = left
      }
      const out = s[left]
      need.set(out, (need.get(out) ?? 0) + 1)
      if ((need.get(out) ?? 0) > 0) missing++
      left++
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestAt, bestAt + bestLen)
}

const covers = (window: string, t: string) => {
  const need = countsOf(t)
  for (const ch of window) if (need.has(ch)) need.set(ch, need.get(ch)! - 1)
  return [...need.values()].every((v) => v <= 0)
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

function* story({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const answer = minWindow(nums)
  const at = answer ? s.indexOf(answer) : -1
  yield {
    hold: 3,
    noChips: true,
    note: `Two strings: s = "${s}" and t = "${t}". Find the shortest stretch of s that contains every character of t — including repeats — with anything else allowed in between.`,
  }
  yield {
    hold: 3,
    row: [...s],
    marks: marksOf(s.length, (i) => (t.includes(s[i]) ? "focus" : undefined)),
    state: [
      { label: "s", value: s },
      { label: "t", value: t },
      {
        label: "needed",
        value: [...countsOf(t).entries()]
          .map(([c, n]) => `${c}×${n}`)
          .join(" "),
      },
    ],
    note: `The lit characters are the ones t asks for. Note "including repeats": if t holds two of a letter, one occurrence in the window is not enough — which is why this is about COUNTS rather than about a set of characters.`,
  }
  yield {
    hold: 3,
    row: [...s],
    marks: marksOf(s.length, (i) =>
      at >= 0 && i >= at && i < at + answer.length ? "answer" : "dim"
    ),
    state: [{ label: "answer", value: answer || "(none)" }],
    answer,
    // a window carrying characters t never asked for is the `junk` case; one
    // that carries none and still cannot be trimmed is `whole`
    corner: !answer
      ? "impossible"
      : countsOf(t).size !== t.length
        ? "duplicates"
        : [...answer].some((c) => !t.includes(c))
          ? "junk"
          : "whole",
    note: !answer
      ? `No stretch of s covers "${t}" at all, so the answer is the empty string. Not a failure — an answer, and one that a version reporting "the best found so far" has to be careful to produce rather than a stray window.`
      : countsOf(t).size !== t.length
        ? `"${answer}". t repeats a character, so the window has to contain that many of it — counting distinct characters covered would accept a shorter window that is missing one.`
        : answer.length === s.length
          ? `The whole of s is the shortest window: nothing can be trimmed from either end without losing a required character.`
          : `"${answer}", starting at index ${at}. The characters between the required ones are free — a window is a contiguous stretch, so it carries whatever happens to sit inside it.`,
  }
}

/** Rung 1 — every substring, counted from scratch. */
function* everyWindow({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  let best = ""
  let checks = 0
  let recounts = 0
  yield {
    line: 3,
    row: [...s],
    marks: {},
    state: [{ label: "best", value: "(none)" }],
    note: "Take every start, extend to every end, and ask of each: does this window cover t?",
  }
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      checks++
      recounts += j - i + 1
      const win = s.slice(i, j + 1)
      if (!covers(win, t)) continue
      if (!best || win.length < best.length) best = win
      yield {
        line: 9,
        row: [...s],
        marks: marksOf(s.length, (k) =>
          k >= i && k <= j
            ? "focus"
            : best && k >= s.indexOf(best) && k < s.indexOf(best) + best.length
              ? "answer"
              : "dim"
        ),
        state: [
          { label: "window", value: win },
          { label: "best", value: best },
          { label: "windows checked", value: checks },
        ],
        note: `"${win}" covers "${t}". Extending it further only makes it longer, so this start is finished — but finding that out cost a fresh count of all ${win.length} of its characters.`,
      }
      break
    }
  }
  const answer = minWindow(nums)
  yield {
    line: 12,
    answer,
    row: [...s],
    marks: marksOf(s.length, (k) =>
      answer && k >= s.indexOf(answer) && k < s.indexOf(answer) + answer.length
        ? "answer"
        : "dim"
    ),
    state: [
      { label: "answer", value: answer || "(none)" },
      { label: "windows checked", value: checks },
      { label: "characters counted", value: recounts },
    ],
    corner: answer ? undefined : "impossible",
    note: `${answer ? `"${answer}"` : "no window covers t"}, after checking ${checks} ${checks === 1 ? "window" : "windows"} and counting ${recounts} characters. Every count started from nothing — and two windows differing by one character had almost identical counts.`,
  }
}

/** Rung 2 — one window, one integer. */
function* slide({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const need = countsOf(t)
  let missing = t.length
  let bestLen = Infinity
  let bestAt = 0
  let left = 0
  let moves = 0
  yield {
    line: 6,
    row: [...s],
    marks: {},
    state: [
      { label: "missing", value: missing },
      { label: "window", value: "empty" },
    ],
    note: `One number does the work of the whole check: ${missing} required characters are still missing. When it hits zero the window covers t, and nothing has to be compared to find that out.`,
  }
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    if ((need.get(ch) ?? 0) > 0) missing--
    need.set(ch, (need.get(ch) ?? 0) - 1)
    moves++
    if (missing > 0) {
      yield {
        line: 12,
        row: [...s],
        marks: marksOf(s.length, (k) =>
          k >= left && k <= right ? "focus" : "dim"
        ),
        state: [
          { label: "window", value: s.slice(left, right + 1) },
          { label: "missing", value: missing },
        ],
        note: `"${ch}" enters on the right. ${missing} still missing — grow. A character not in t is added too, and its count going negative is how the window remembers it has spare copies of something.`,
      }
      continue
    }
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1
        bestAt = left
      }
      const out = s[left]
      need.set(out, (need.get(out) ?? 0) + 1)
      if ((need.get(out) ?? 0) > 0) missing++
      left++
      moves++
      yield {
        line: 19,
        row: [...s],
        marks: marksOf(s.length, (k) =>
          k >= bestAt && k < bestAt + bestLen
            ? "answer"
            : k >= left && k <= right
              ? "focus"
              : "dim"
        ),
        state: [
          { label: "best", value: s.slice(bestAt, bestAt + bestLen) },
          { label: "missing", value: missing },
        ],
        corner: missing > 0 ? "shrink" : "duplicates",
        note:
          missing > 0
            ? `Dropping "${out}" from the left breaks the cover, so the window was as tight as it could be — the best is "${s.slice(bestAt, bestAt + bestLen)}". Back to growing on the right.`
            : `Still covered without "${out}", so it was surplus: shrink again. Only a character whose count goes ABOVE zero was actually needed — which is exactly how duplicates in t are handled without special-casing them.`,
      }
    }
  }
  const answer = minWindow(nums)
  yield {
    line: 21,
    answer,
    row: [...s],
    marks: marksOf(s.length, (k) =>
      answer && k >= bestAt && k < bestAt + answer.length ? "answer" : "dim"
    ),
    state: [
      { label: "answer", value: answer || "(none)" },
      { label: "edge moves", value: moves },
      { label: "length of s", value: s.length },
    ],
    corner: !answer
      ? "impossible"
      : [...answer].some((c) => !t.includes(c))
        ? "junk"
        : "whole",
    note: `${answer ? `"${answer}"` : "no window covers t"}, in ${moves} edge ${moves === 1 ? "move" : "moves"} over a string of ${s.length}. Each edge only ever moves right, so every character enters the window once and leaves once — and the cover check was a single comparison against zero throughout.`,
  }
}

export const minCoverSubstring = deriveJourney<string>(problem, {
  slug: "grow-right-shrink-left",
  subtitle: "one integer answers 'does this window cover t' in constant time",
  reveals: ["sliding-window"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length === 2 && nums.every((w) => /^[A-Za-z]+$/.test(w))
      ? { ok: true }
      : {
          ok: false,
          warning: "two words of letters, s then t — e.g. ADOBECODEBANC ABC",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["ADOBECODEBANC", "ABC"],
      info: '"BANC"',
    },
    impossible: {
      label: "t cannot be covered",
      nums: ["a", "aa"],
      info: "two a's needed, one available",
    },
    duplicates: {
      label: "t repeats a character",
      nums: ["aaflslflsassdf", "aaa"],
      info: "three a's must all be inside",
    },
    whole: {
      label: "the whole string is the answer",
      nums: ["abc", "abc"],
      info: "nothing can be trimmed",
    },
    junk: {
      label: "rubbish in the middle",
      nums: ["axxxxbxxxxc", "abc"],
      info: "the window carries it anyway",
    },
    tiny: {
      label: "t is one character",
      nums: ["abcb", "b"],
      info: "the first b, length 1",
    },
    long: {
      label: "a longer string",
      nums: ["ADOBECODEBANCXYZABCA", "AABC"],
      info: "twenty characters",
    },
  },
  edges: [
    {
      key: "impossible",
      name: "no window covers t",
      example: 's = "a", t = "aa" → ""',
      why: "The empty string is the answer. It has to be distinguishable from a window of length zero and from a best-so-far that was never set — which is why the length starts at infinity rather than at zero or at the length of s.",
      think:
        "What does your 'best' start as, and can that value be mistaken for an answer?",
      preset: "impossible",
      constraint: 3,
    },
    {
      key: "duplicates",
      name: "t repeats a character",
      example: 't = "aaa" needs three a\'s inside the window',
      why: "Covering is about counts, not about which characters appear. A set-based check accepts a window with one a, which is shorter and wrong — and it is right on every input where t has no repeats.",
      think:
        "Does your check ask 'is this character present' or 'are there enough of it'?",
      preset: "duplicates",
      constraint: 2,
    },
    {
      key: "shrink",
      name: "the shrink stops one character too late",
      example:
        "drop a character, lose the cover, and the window before it was the answer",
      why: "The best is recorded BEFORE the left edge moves, because the move is what tests whether that character was needed. Recording afterwards reports a window that no longer covers t.",
      think:
        "At what moment in the loop is the current window still known to be valid?",
      preset: "example",
      constraint: 0,
    },
    {
      key: "whole",
      name: "the answer is all of s",
      example: 's = "abc", t = "abc" → "abc"',
      why: "Nothing can be trimmed from either end, so the shrink loop stops immediately and the best window is the whole string. It is the boundary where 'shrink while still covered' must not shrink at all.",
      think:
        "Does your shrink step run at least once before recording the best?",
      preset: "whole",
      constraint: 0,
    },
    {
      key: "junk",
      name: "characters t never asked for",
      example: 's = "axxxxbxxxxc", t = "abc" → the whole string',
      why: "A window is contiguous, so it carries whatever sits between the characters it needs. The counts of those extras go negative and must not be confused with a shortfall — which is why 'above zero' rather than 'non-zero' is the test when shrinking.",
      think: "What does a negative count in your map mean?",
      preset: "junk",
      constraint: 1,
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
        "given: two strings, s and t",
        "a window is a contiguous stretch of s",
        "it covers t when it holds every character of t, counting repeats",
        "task: return the shortest covering window, or the empty string",
      ],
      tools: [
        {
          name: "The window",
          role: "a span over the characters of s, drawn as the lit region. Both edges only ever move right, which is what makes a linear pass possible at all.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "covering is about counts, not about which characters are present",
        "a window is contiguous, so it carries whatever lies between the characters it needs",
        "no covering window at all is an answer: the empty string",
      ],
      quiz: [
        {
          q: 't = "aa". Does a window containing one "a" cover it?',
          choices: [
            "yes — the character is present",
            "no — two are needed, so counts matter",
          ],
          answer: 1,
          explain:
            "The most common wrong answer here is a set of characters. It is right whenever t has no repeats, which is most casual test cases.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Check every stretch",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take every start and extend rightwards until the window covers t, then keep the shortest one found.",
      takeaways: [
        "it defines the answer directly: the shortest window that passes the check",
        "every check counts the window's characters from scratch",
        "and two windows differing by a single character are counted almost identically, twice",
      ],
      run: everyWindow,
    },
    {
      key: "window",
      name: "One window, one counter",
      short: "each edge moves once",
      insight:
        "Comparing counters for every candidate re-counts characters that never changed — a window and the same window plus one character differ in exactly one count.",
      idea: problem.approach,
      takeaways: [
        "grow on the right until the window covers t, then shrink on the left while it still does",
        "one integer — how many required characters are still missing — makes the cover check a comparison against zero",
        "a count going below zero means surplus, which is how repeats in t need no special handling",
        "each edge only moves right, so every character enters and leaves once",
      ],
      quiz: [
        {
          q: "Why is the best window recorded before the left edge moves, rather than after?",
          choices: [
            "it reads better",
            "because moving the edge is what tests whether that character was needed — after the move the window may no longer cover t",
          ],
          answer: 1,
          explain:
            "The window is known to be valid at the top of the shrink loop and not afterwards. Recording at the wrong moment reports a window that is one character too short.",
        },
      ],
      run: slide,
    },
  ],
})
