// Does One String Hide the Other's Letters?, derived. Two words in one row:
// the pattern first, then the text to search.
//
// Three rungs, and the last two look almost identical — both slide a
// fixed-width window and keep a tally. What separates them is a single
// integer: how many of the 26 letters currently agree. That number turns 26
// comparisons per step into two.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/permutation-in-string/index.ts"

type W = Data<string>

const parts = (nums: string[]) => ({ s1: nums[0] ?? "", s2: nums[1] ?? "" })

/** The reference: does s2 hold a contiguous rearrangement of s1? */
export function hidesPermutation(nums: string[]) {
  const { s1, s2 } = parts(nums)
  if (s1.length > s2.length) return false
  const target = [...s1].sort().join("")
  for (let i = 0; i + s1.length <= s2.length; i++)
    if ([...s2.slice(i, i + s1.length)].sort().join("") === target) return true
  return false
}

/** Where the first match starts, or -1 — the story act points at it. */
const matchAt = (s1: string, s2: string) => {
  const target = [...s1].sort().join("")
  for (let i = 0; i + s1.length <= s2.length; i++)
    if ([...s2.slice(i, i + s1.length)].sort().join("") === target) return i
  return -1
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

/** need over have, one column per letter either string uses. */
const tallies = (
  letters: string[],
  need: Map<string, number>,
  have: Map<string, number>,
  label: string
) => {
  const marks: Record<string, ChipRole> = {}
  letters.forEach((l, i) => {
    marks[`1,${i}`] =
      (need.get(l) ?? 0) === (have.get(l) ?? 0) ? "answer" : "focus"
  })
  return {
    cells: [
      letters,
      letters.map((l) => have.get(l) ?? 0),
      letters.map((l) => need.get(l) ?? 0),
    ] as (number | string)[][],
    marks,
    label,
  }
}

const lettersOf = (s1: string, s2: string) =>
  [...new Set([...s1, ...s2])].sort()

function* story({ nums }: W): Generator<DFrame> {
  const { s1, s2 } = parts(nums)
  const answer = hidesPermutation(nums)
  const at = matchAt(s1, s2)
  const scattered = [...new Set(s1)].every(
    (c) =>
      [...s2].filter((x) => x === c).length >=
      [...s1].filter((x) => x === c).length
  )
  yield {
    hold: 3,
    noChips: true,
    note: `Two strings: "${s1}" and "${s2}". Does the second contain a CONTIGUOUS stretch that is a rearrangement of the first?`,
  }
  yield {
    hold: 3,
    row: [...s2],
    marks: marksOf(s2.length, (i) =>
      s1.includes(s2[i]) ? "focus" : undefined
    ),
    state: [
      { label: "looking for", value: s1 },
      { label: "inside", value: s2 },
      { label: "window width", value: s1.length },
    ],
    corner: s1.length > s2.length ? "toolong" : undefined,
    note:
      s1.length > s2.length
        ? `"${s1}" is longer than "${s2}", so no window of that width exists and the answer is false before anything is scanned.`
        : `A rearrangement of "${s1}" is exactly ${s1.length} characters long, so the window being looked for has a width that is already known. That is unusual and it is the whole reason this is a fixed-width slide rather than a search.`,
  }
  yield {
    hold: 3,
    row: [...s2],
    marks: marksOf(s2.length, (i) =>
      at >= 0 && i >= at && i < at + s1.length ? "answer" : "dim"
    ),
    state: [{ label: "answer", value: String(answer) }],
    answer,
    corner:
      s1.length > s2.length
        ? "toolong"
        : !answer && scattered
          ? "scattered"
          : answer
            ? s1.length === s2.length
              ? "exact"
              : "found"
            : "absent",
    note:
      s1.length > s2.length
        ? "So this one never reaches the sliding."
        : answer
          ? `Found at index ${at}: "${s2.slice(at, at + s1.length)}" uses exactly the letters of "${s1}".`
          : scattered
            ? `False — and this is the case worth holding on to. Every letter of "${s1}" IS present in "${s2}", in sufficient numbers; they are just never adjacent. Contiguity is a real constraint, not a formality.`
            : `False: "${s2}" does not hold the letters of "${s1}" anywhere.`,
  }
}

/** Rung 1 — sort every window. */
function* sortEvery({ nums }: W): Generator<DFrame> {
  const { s1, s2 } = parts(nums)
  const target = [...s1].sort().join("")
  let sorts = 0
  yield {
    line: 1,
    row: [...s2],
    marks: {},
    state: [{ label: "target", value: target }],
    note: `Sort "${s1}" once to get "${target}", then take every window of ${s1.length} characters and sort it too. Equal sorted forms mean a rearrangement.`,
  }
  for (let i = 0; i + s1.length <= s2.length; i++) {
    const win = s2.slice(i, i + s1.length)
    const sorted = [...win].sort().join("")
    sorts++
    const hit = sorted === target
    yield {
      line: 4,
      row: [...s2],
      marks: marksOf(s2.length, (k) =>
        k >= i && k < i + s1.length ? (hit ? "answer" : "focus") : "dim"
      ),
      state: [
        { label: "window", value: win },
        { label: "sorted", value: sorted },
        { label: "sorts", value: sorts },
      ],
      note: hit
        ? `"${win}" sorts to "${sorted}" — the target. Found at ${i}.`
        : `"${win}" sorts to "${sorted}", which is not "${target}". Note what happens next: the window moves ONE character, and the whole thing is sorted again from scratch.`,
    }
    if (hit) break
  }
  const answer = hidesPermutation(nums)
  yield {
    line: 6,
    answer,
    row: [...s2],
    marks: marksOf(s2.length, (k) => {
      const at = matchAt(s1, s2)
      return at >= 0 && k >= at && k < at + s1.length ? "answer" : "dim"
    }),
    state: [
      { label: "answer", value: String(answer) },
      { label: "windows sorted", value: sorts },
    ],
    corner: answer ? undefined : "absent",
    note: `${answer}, after sorting ${sorts} ${sorts === 1 ? "window" : "windows"}. Correct, and it re-sorts almost the same characters every step: consecutive windows differ by exactly two letters, and this version knows nothing about that.`,
  }
}

/** Rung 2 — slide a tally, compare all 26 each move. */
function* compareAll({ nums }: W): Generator<DFrame> {
  const { s1, s2 } = parts(nums)
  const letters = lettersOf(s1, s2)
  const need = new Map<string, number>()
  for (const c of s1) need.set(c, (need.get(c) ?? 0) + 1)
  const have = new Map<string, number>()
  let comparisons = 0
  if (s1.length > s2.length) {
    yield {
      line: 2,
      answer: false,
      row: [...s2],
      marks: {},
      state: [{ label: "widths", value: `${s1.length} · ${s2.length}` }],
      corner: "toolong",
      note: "The pattern is longer than the text, so no window of the right width exists. One comparison, before any tally is built.",
    }
    return
  }
  yield {
    line: 6,
    grid: tallies(letters, need, have, "need below, have above"),
    state: [{ label: "window width", value: s1.length }],
    note: "Two tallies: what the window needs, and what it currently holds. The window is a fixed width, so every move adds one letter and drops one — the middle is never recounted.",
  }
  for (let i = 0; i < s2.length; i++) {
    have.set(s2[i], (have.get(s2[i]) ?? 0) + 1)
    if (i >= s1.length) {
      const out = s2[i - s1.length]
      have.set(out, (have.get(out) ?? 0) - 1)
    }
    comparisons += letters.length
    const hit =
      i >= s1.length - 1 &&
      letters.every((l) => (need.get(l) ?? 0) === (have.get(l) ?? 0))
    yield {
      line: 11,
      grid: tallies(
        letters,
        need,
        have,
        hit ? "every letter agrees" : `window ends at ${i}`
      ),
      state: [
        {
          label: "window",
          value: s2.slice(Math.max(0, i - s1.length + 1), i + 1),
        },
        { label: "comparisons", value: comparisons },
      ],
      note: hit
        ? `Every letter agrees, so this window is a rearrangement of "${s1}".`
        : `The window moved by one and the whole tally was compared again — all ${letters.length} letters here, 26 in the real thing. Only two of them changed.`,
    }
    if (hit) break
  }
  const answer = hidesPermutation(nums)
  yield {
    line: 13,
    answer,
    grid: tallies(letters, need, have, String(answer)),
    state: [
      { label: "answer", value: String(answer) },
      { label: "comparisons", value: comparisons },
    ],
    corner: answer ? "found" : "absent",
    note: `${answer}, with ${comparisons} letter comparisons. Linear in the text — but the constant is the alphabet, paid on every single step, to re-check 24 letters that could not possibly have changed.`,
  }
}

/** Rung 3 — carry the number of letters that agree. */
function* carryAgreement({ nums }: W): Generator<DFrame> {
  const { s1, s2 } = parts(nums)
  const letters = lettersOf(s1, s2)
  const need = new Map<string, number>()
  for (const c of s1) need.set(c, (need.get(c) ?? 0) + 1)
  const have = new Map<string, number>()
  if (s1.length > s2.length) {
    yield {
      line: 2,
      answer: false,
      row: [...s2],
      marks: {},
      state: [{ label: "widths", value: `${s1.length} · ${s2.length}` }],
      corner: "toolong",
      note: "Longer pattern than text: no window exists. Same free exit as before.",
    }
    return
  }
  for (let i = 0; i < s1.length; i++)
    have.set(s2[i], (have.get(s2[i]) ?? 0) + 1)
  const agrees = () =>
    letters.filter((l) => (need.get(l) ?? 0) === (have.get(l) ?? 0)).length
  let touched = 0
  yield {
    line: 8,
    grid: tallies(
      letters,
      need,
      have,
      `${agrees()} of ${letters.length} agree`
    ),
    state: [
      { label: "agree", value: `${agrees()} / ${letters.length}` },
      { label: "window", value: s2.slice(0, s1.length) },
    ],
    corner: [...new Set(s1)].some(
      (c) => [...s1].filter((x) => x === c).length > 1
    )
      ? "repeats"
      : undefined,
    note: [...new Set(s1)].some(
      (c) => [...s1].filter((x) => x === c).length > 1
    )
      ? `One number instead of a comparison: ${agrees()} of the ${letters.length} letters currently agree. Note the pattern repeats a letter, so agreement means the COUNTS match — a window holding one "${[...new Set(s1)].find((c) => [...s1].filter((x) => x === c).length > 1)}" does not agree with a pattern needing two, even though the letter is present.`
      : `One number instead of a comparison: ${agrees()} of the ${letters.length} letters currently hold the same count in both tallies. When that number reaches ${letters.length}, the window IS a rearrangement — and checking it is reading one integer.`,
  }
  if (agrees() === letters.length) {
    const answer = hidesPermutation(nums)
    yield {
      line: 15,
      answer,
      grid: tallies(letters, need, have, "all agree at the first window"),
      state: [{ label: "answer", value: String(answer) }],
      corner: s1.length === s2.length ? "exact" : "found",
      note: `The very first window already matches, so the answer is true before anything slides.${s1.length === s2.length ? " Note the widths: the two strings are the same length, so there is exactly one window and this is it." : ""}`,
    }
    return
  }
  for (let right = s1.length; right < s2.length; right++) {
    const entering = s2[right]
    const leaving = s2[right - s1.length]
    touched += entering === leaving ? 1 : 2
    have.set(entering, (have.get(entering) ?? 0) + 1)
    have.set(leaving, (have.get(leaving) ?? 0) - 1)
    const hit = agrees() === letters.length
    yield {
      line: 12,
      grid: tallies(
        letters,
        need,
        have,
        hit ? "all agree" : `+${entering} −${leaving}`
      ),
      state: [
        { label: "window", value: s2.slice(right - s1.length + 1, right + 1) },
        { label: "agree", value: `${agrees()} / ${letters.length}` },
        { label: "letters touched", value: touched },
      ],
      note: hit
        ? `"${s2.slice(right - s1.length + 1, right + 1)}" agrees on every letter.`
        : `"${entering}" in, "${leaving}" out. Only those two letters can have crossed into or out of agreement, so only those two counters are examined — the other ${letters.length - 2} are untouched because nothing could have changed them.`,
    }
    if (hit) break
  }
  const answer = hidesPermutation(nums)
  yield {
    line: 15,
    answer,
    grid: tallies(letters, need, have, String(answer)),
    state: [
      { label: "answer", value: String(answer) },
      { label: "letters touched", value: touched },
      { label: "text length", value: s2.length },
    ],
    corner: answer
      ? s1.length === s2.length
        ? "exact"
        : "found"
      : [...new Set(s1)].every(
            (c) =>
              [...s2].filter((x) => x === c).length >=
              [...s1].filter((x) => x === c).length
          )
        ? "scattered"
        : "absent",
    note: `${answer}, touching ${touched} counters across the whole scan rather than ${letters.length} per step. The agreement count is the trick: a letter can cross into or out of agreement at most once per move, so maintaining the number costs the same two updates the window already made.`,
  }
}

export const permutationInString = deriveJourney<string>(problem, {
  slug: "two-letters-move-so-check-two",
  subtitle: "carry how many agree, and a window check becomes one integer",
  reveals: ["sliding-window"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer text" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length === 2 && nums.every((w) => /^[a-z]+$/.test(w))
      ? { ok: true }
      : {
          ok: false,
          warning: "two lowercase words: the pattern, then the text",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["ab", "eidbaooo"],
      info: "true — ba at index 3",
    },
    scattered: {
      label: "the letters are there, not adjacent",
      nums: ["ab", "eidboaoo"],
      info: "false",
    },
    exact: {
      label: "same length",
      nums: ["abc", "bca"],
      info: "one window, and it matches",
    },
    toolong: {
      label: "the pattern is longer",
      nums: ["abcd", "abc"],
      info: "false before any scan",
    },
    absent: {
      label: "a letter that never appears",
      nums: ["az", "bbbb"],
      info: "false",
    },
    repeats: {
      label: "a repeated letter in the pattern",
      nums: ["aab", "xaabx"],
      info: "counts, not membership",
    },
    long: {
      label: "a longer text",
      nums: ["abc", "xxyzabcayyzz"],
      info: "twelve characters",
    },
  },
  edges: [
    {
      key: "scattered",
      name: "the letters are all there, but never adjacent",
      example: '"ab" in "eidboaoo" → false',
      why: "Both letters appear, in sufficient numbers, and the answer is false because the match must be CONTIGUOUS. A solution that only counts letters across the whole text — rather than inside a window — says true here.",
      think: "Is your check about the text, or about a window in it?",
      preset: "scattered",
      constraint: 2,
    },
    {
      key: "toolong",
      name: "the pattern is longer than the text",
      example: '"abcd" in "abc" → false',
      why: "No window of that width exists, so the answer arrives before any scanning. It also protects the fixed-width slide, which builds its first window by reading s1.length characters and would run off the end.",
      think:
        "What does your first window do when the text is too short to fill it?",
      preset: "toolong",
      constraint: 3,
    },
    {
      key: "exact",
      name: "the two strings are the same length",
      example: '"abc" in "bca" → true',
      why: "There is exactly one window and it is the whole text, so the answer is decided before the loop slides at all. A loop written to run at least once, or one that only checks AFTER a move, misses it.",
      think: "Do you test the first window before moving, or only after?",
      preset: "exact",
      constraint: 0,
    },
    {
      key: "found",
      name: "the window sits in the middle of the text",
      example: '"ab" in "eidbaooo" → true, starting at index 3',
      why: "The ordinary success, and the one that shows why the first window must be tested before any sliding as well as after: a match can be anywhere, including at position 0 or at the very end.",
      think: "Are the first and last windows both actually checked?",
      preset: "example",
      constraint: 0,
    },
    {
      key: "absent",
      name: "a letter the text never contains",
      example: '"az" in "bbbb" → false',
      why: "The cheapest false there is: no window can work because one required letter is nowhere at all. Worth keeping as the control — every rung catches it, which is what makes the scattered case the interesting failure rather than this one.",
      think:
        "Which of your failing cases needs the whole text scanned, and which does not?",
      preset: "absent",
      constraint: 1,
    },
    {
      key: "repeats",
      name: "a repeated letter in the pattern",
      example: '"aab" inside "xaabx" → true',
      why: "The window needs two a's, not merely an a. Any check written as 'every letter of the pattern appears in the window' accepts a window with one a, and is right whenever the pattern has no repeats.",
      think: "Does your comparison ask about presence or about counts?",
      preset: "repeats",
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
        "given: two lowercase strings, a pattern and a text",
        "a rearrangement of the pattern has exactly the pattern's length",
        "task: does the text contain a CONTIGUOUS stretch that is one",
        "a pattern longer than the text can never be found",
      ],
      tools: [
        {
          name: "Pattern and text",
          role: "two tokens in one row. The width of the thing being looked for is known before the search starts, which is what makes this a fixed-width slide rather than a search over both ends.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the window's width is known in advance — it is the pattern's length",
        "the match must be contiguous, so scattered letters in the right numbers do not count",
        "a fixed-width window changes by exactly one letter in and one out",
      ],
      quiz: [
        {
          q: 'Both an "a" and a "b" appear in the text. Does that make "ab" findable?',
          choices: [
            "yes — the letters are present",
            "no: they have to be adjacent, in one window",
          ],
          answer: 1,
          explain:
            "Contiguity is the constraint doing the work. Counting letters across the whole text answers a different question.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Sort every window",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Sort the pattern once. Then take every window of that width, sort it, and compare.",
      takeaways: [
        "it reuses the anagram idea directly: equal sorted forms mean a rearrangement",
        "and it re-sorts each window from scratch",
        "consecutive windows differ by exactly two letters, which this version has no way to exploit",
      ],
      run: sortEvery,
    },
    {
      key: "tally",
      name: "Slide a tally, compare it all",
      short: "no re-sorting",
      from: 1,
      insight:
        "Sorting each window orders characters that were already ordered a moment ago — two consecutive windows share all but two of their letters.",
      idea: "Keep a tally of the window and a tally of the pattern. Slide: add the entering letter, drop the leaving one, then compare the two tallies.",
      takeaways: [
        "the middle of the window is never recounted — one letter in, one out",
        "the comparison is now against a fixed-size tally rather than a sorted string",
        "but all 26 counts are compared on every step, and at most two of them changed",
      ],
      quiz: [
        {
          q: "After the window slides by one, how many letter counts can have changed?",
          choices: [
            "all of them",
            "at most two — the one entering and the one leaving",
          ],
          answer: 1,
          explain:
            "Which is exactly the observation the next rung turns into a saving.",
        },
      ],
      run: compareAll,
    },
    {
      key: "agree",
      name: "Carry how many agree",
      short: "check two",
      insight:
        "Comparing the whole tally every step re-reads 24 counts that could not have changed — the window moved one character, so only two letters can have crossed into or out of agreement.",
      idea: problem.approach,
      takeaways: [
        "one integer: how many of the 26 letters currently hold the same count in both tallies",
        "a letter crosses into or out of agreement at most once per move, so the number is adjusted, never recomputed",
        "the whole-window check becomes reading one integer",
        "and the first window has to be tested BEFORE the loop slides, or an exact-length match is missed",
      ],
      quiz: [
        {
          q: "Why is it safe to update the agreement count for only two letters?",
          choices: [
            "it is an approximation that is usually right",
            "because only two counters changed, and a letter's agreement can only change when its counter does",
          ],
          answer: 1,
          explain:
            "It is exact, not approximate. The invariant is maintained rather than recomputed — the same move that made the tally version fast, applied one level deeper.",
        },
      ],
      run: carryAgreement,
    },
  ],
})
