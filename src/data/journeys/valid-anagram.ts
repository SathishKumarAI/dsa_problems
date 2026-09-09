// Same Letters, Different Order, derived. Two words in one row (cells:
// "words"), the shape merge-two-sorted established for two inputs.
//
// The stage is the TALLY, drawn as a grid over the letters that actually
// appear — because the lesson is that an anagram is a claim about counts, and
// counts are what you should be looking at rather than the strings.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/arrays-hashing/valid-anagram.ts"

type W = Data<string>

const parts = (nums: string[]) => ({ s: nums[0] ?? "", t: nums[1] ?? "" })

/** The reference: is t a rearrangement of s? */
export function isAnagram(nums: string[]) {
  const { s, t } = parts(nums)
  if (s.length !== t.length) return false
  const counts = new Map<string, number>()
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1)
  for (const c of t) counts.set(c, (counts.get(c) ?? 0) - 1)
  return [...counts.values()].every((v) => v === 0)
}

/** Every letter either string uses, in order, so the tally has stable columns. */
const alphabet = (s: string, t: string) => [...new Set([...s, ...t])].sort()

/** The tally as a two-row grid: the letter, then its running count. */
const tally = (
  letters: string[],
  counts: Map<string, number>,
  label: string,
  mark?: (letter: string) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  letters.forEach((l, i) => {
    const m = mark?.(l)
    if (m) marks[`1,${i}`] = m
  })
  return {
    cells: [letters, letters.map((l) => counts.get(l) ?? 0)] as (
      number | string
    )[][],
    marks,
    label,
  }
}

function* story({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const answer = isAnagram(nums)
  const letters = alphabet(s, t)
  const counts = new Map<string, number>()
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1)
  for (const c of t) counts.set(c, (counts.get(c) ?? 0) - 1)
  yield {
    hold: 3,
    noChips: true,
    note: `Two words, "${s}" and "${t}". Is the second a rearrangement of the first — the same letters, each used the same number of times?`,
  }
  yield {
    hold: 3,
    row: [...s],
    marks: {},
    state: [
      { label: "s", value: s },
      { label: "t", value: t },
      { label: "lengths", value: `${s.length} · ${t.length}` },
    ],
    corner: s.length !== t.length ? "lengths" : undefined,
    note:
      s.length !== t.length
        ? `The lengths differ — ${s.length} against ${t.length} — so the answer is already false. That is the cheapest test in the problem and it belongs before anything else.`
        : "Same length, so the question is live. And note what it is NOT asking: not whether the two use the same set of letters, but whether they use them the same number of times.",
  }
  const offenders = letters.filter((l) => (counts.get(l) ?? 0) !== 0)
  yield {
    hold: 3,
    grid: tally(
      letters,
      counts,
      answer ? "every count is zero" : "a count left over",
      (l) => ((counts.get(l) ?? 0) === 0 ? "answer" : "focus")
    ),
    answer,
    corner:
      s.length !== t.length
        ? "lengths"
        : answer
          ? new Set(s).size < s.length
            ? "repeats"
            : "same"
          : new Set(s).size === new Set(t).size &&
              [...new Set(s)].every((c) => t.includes(c))
            ? "counts"
            : "letters",
    note: answer
      ? `Every letter's count came back to zero, so the two are anagrams.${new Set(s).size < s.length ? " Note the repeated letters: they are exactly why counting beats checking membership." : ""}`
      : offenders.length && [...new Set(s)].every((c) => t.includes(c))
        ? `Not anagrams — and look at WHY: both words use the same set of letters, and "${offenders[0]}" appears a different number of times in each. Membership is not the question; counts are.`
        : `Not anagrams: ${offenders.map((l) => `"${l}"`).join(", ")} ${offenders.length === 1 ? "does not balance" : "do not balance"}.`,
  }
}

/** Rung 1 — sort both and compare. */
function* sortBoth({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const letters = alphabet(s, t)
  const sortedS = [...s].sort().join("")
  const sortedT = [...t].sort().join("")
  yield {
    line: 1,
    row: [...s],
    marks: {},
    state: [
      { label: "s", value: s },
      { label: "t", value: t },
    ],
    note: "Two anagrams have exactly one thing in common that is easy to compute: sorted, they are the same string. So sort both and see.",
  }
  yield {
    line: 1,
    row: [...sortedS],
    marks: {},
    state: [
      { label: "s sorted", value: sortedS },
      { label: "t sorted", value: sortedT },
      {
        label: "comparisons",
        value: `~${Math.ceil(s.length * Math.log2(Math.max(2, s.length))) * 2}`,
      },
    ],
    note: `"${sortedS}" against "${sortedT}". Correct — and it built two canonical strings to answer a yes-or-no question, which is more than the question needs.`,
  }
  const answer = isAnagram(nums)
  const counts = new Map<string, number>()
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1)
  for (const c of t) counts.set(c, (counts.get(c) ?? 0) - 1)
  yield {
    line: 1,
    answer,
    grid: tally(letters, counts, String(answer), (l) =>
      (counts.get(l) ?? 0) === 0 ? "answer" : "focus"
    ),
    state: [{ label: "answer", value: String(answer) }],
    corner: s.length !== t.length ? "lengths" : undefined,
    note: `${answer}. The sort put every letter of both strings in order to discover something about their totals — and the totals were never the thing that needed ordering.`,
  }
}

/** Rung 2 — one tally, up for s and down for t. */
function* countUpDown({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const letters = alphabet(s, t)
  const counts = new Map<string, number>(letters.map((l) => [l, 0]))
  if (s.length !== t.length) {
    yield {
      line: 2,
      answer: false,
      row: [...s],
      marks: {},
      state: [{ label: "lengths", value: `${s.length} · ${t.length}` }],
      corner: "lengths",
      note: `${s.length} letters against ${t.length}. Different lengths can never be anagrams, so this returns before a single counter is touched — one comparison instead of a pass over both strings.`,
    }
    return
  }
  yield {
    line: 3,
    grid: tally(letters, counts, "one counter per letter"),
    state: [{ label: "letters in play", value: letters.length }],
    note: "One tally, and it does not grow with the input: the alphabet is fixed, so this is the same 26 counters whether the words are four letters or forty thousand.",
  }
  for (let i = 0; i < s.length; i++) {
    counts.set(s[i], (counts.get(s[i]) ?? 0) + 1)
    counts.set(t[i], (counts.get(t[i]) ?? 0) - 1)
    yield {
      line: 5,
      grid: tally(letters, counts, `+${s[i]} · −${t[i]}`, (l) =>
        l === s[i] || l === t[i]
          ? "focus"
          : (counts.get(l) ?? 0) === 0
            ? "dim"
            : undefined
      ),
      state: [
        { label: "position", value: i },
        {
          label: `${s[i]} up · ${t[i]} down`,
          value: `${counts.get(s[i])} · ${counts.get(t[i])}`,
        },
      ],
      note: `Position ${i}: "${s[i]}" from s goes up, "${t[i]}" from t goes down. Both strings are read in the SAME pass — there is no need to finish one before starting the other, because the tally does not care what order the evidence arrives in.`,
    }
  }
  const answer = isAnagram(nums)
  const offenders = letters.filter((l) => (counts.get(l) ?? 0) !== 0)
  yield {
    line: 7,
    answer,
    grid: tally(
      letters,
      counts,
      answer ? "all zero" : `${offenders.join(", ")} left over`,
      (l) => ((counts.get(l) ?? 0) === 0 ? "answer" : "focus")
    ),
    state: [
      { label: "answer", value: String(answer) },
      { label: "counters", value: letters.length },
    ],
    corner: answer
      ? new Set(s).size < s.length
        ? "repeats"
        : "same"
      : [...new Set(s)].every((c) => t.includes(c))
        ? "counts"
        : "letters",
    note: answer
      ? `Every counter is back to zero, so the letters balance exactly: ${answer}. One pass, and memory that is constant however long the words are.`
      : `${offenders.map((l) => `"${l}"`).join(", ")} ${offenders.length === 1 ? "is" : "are"} not zero, which names the disagreement rather than merely reporting one: a positive count is a letter s has more of, a negative one is a letter t has more of.`,
  }
}

export const validAnagram = deriveJourney<string>(problem, {
  slug: "count-dont-sort",
  subtitle: "an anagram is a claim about counts, so count",
  reveals: ["arrays-hashing"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "longer words" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length === 2 && nums.every((w) => /^[a-z]+$/.test(w))
      ? { ok: true }
      : { ok: false, warning: "two lowercase words — e.g. anagram nagaram" }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["anagram", "nagaram"],
      info: "true",
    },
    letters: {
      label: "different letters",
      nums: ["rat", "car"],
      info: "same length, false",
    },
    counts: {
      label: "same letters, different counts",
      nums: ["aab", "abb"],
      info: "the case membership misses",
    },
    lengths: {
      label: "different lengths",
      nums: ["ab", "abc"],
      info: "false before any counting",
    },
    repeats: {
      label: "a letter repeated",
      nums: ["aabb", "bbaa"],
      info: "true",
    },
    same: {
      label: "identical words",
      nums: ["abc", "abc"],
      info: "a word is its own anagram",
    },
    long: {
      label: "longer words",
      nums: ["listensilent", "silentlisten"],
      info: "twelve letters each",
    },
  },
  edges: [
    {
      key: "counts",
      name: "the same letters in different numbers",
      example: '"aab" and "abb" → false',
      why: "Both words use exactly the letters a and b, and they are not anagrams. Any solution built on sets — membership, a seen-set, comparing distinct characters — says true here, and is right on most other inputs.",
      think: "Is your check about which letters appear, or how many times?",
      preset: "counts",
      constraint: 3,
    },
    {
      key: "letters",
      name: "a letter one word does not have at all",
      example: '"rat" and "car" → false',
      why: "Same length, and one word holds a letter the other never uses. It is the easy failure — worth having because it is the one every approach catches, which makes it the control against the harder failure where the letters match and the counts do not.",
      think:
        "Which of your failures are caught by the first letter, and which need the whole word?",
      preset: "letters",
      constraint: 1,
    },
    {
      key: "lengths",
      name: "different lengths",
      example: '"ab" and "abc" → false',
      why: "Impossible before anything is counted, and it is the cheapest test in the problem. It also protects the one-pass version, which reads both strings at the same index and would run off the end of the shorter one.",
      think:
        "What does a single loop over two strings do when they are not the same length?",
      preset: "lengths",
      constraint: 2,
    },
    {
      key: "repeats",
      name: "repeated letters",
      example: '"aabb" and "bbaa" → true',
      why: "The ordinary case for a tally and the awkward one for anything cleverer. It is worth running because a solution that removes each matched letter from a copy of the other string also gets this right — slowly — and that similarity hides the difference until the strings get long.",
      think: "How does your solution handle the second 'a'?",
      preset: "repeats",
      constraint: 3,
    },
    {
      key: "same",
      name: "the two words are identical",
      example: '"abc" and "abc" → true',
      why: "A word is a rearrangement of itself, so true. It is the boundary where a solution that demands the order actually CHANGE returns false on the most obvious input in the problem.",
      think: "Does your answer require anything to have moved?",
      preset: "same",
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
        "given: two lowercase words",
        "an anagram uses exactly the same letters, each the same number of times",
        "task: return whether the second is a rearrangement of the first",
        "different lengths can never be",
      ],
      tools: [
        {
          name: "Two words",
          role: "two tokens in one row. The stage below draws the TALLY rather than the words, because the tally is what the answer is actually about.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "an anagram is a statement about counts, not about which letters appear",
        "different lengths is a free early exit",
        "the alphabet is fixed, so the tally never grows with the input",
      ],
      quiz: [
        {
          q: 'Are "aab" and "abb" anagrams? Both use only a and b.',
          choices: [
            "yes — the same letters",
            "no — a appears twice in one and once in the other",
          ],
          answer: 1,
          explain:
            "This is the input that separates counting from membership, and it is three letters long.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Sort them and compare",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Two anagrams have the same sorted form, so sort both strings and compare the results.",
      takeaways: [
        "one line, and it uses a real property rather than a trick",
        "but it builds two canonical strings to answer a yes-or-no question",
        "and it orders every letter, when only the totals were ever in question",
      ],
      run: sortBoth,
    },
    {
      key: "tally",
      name: "Up for one, down for the other",
      short: "one pass",
      insight:
        "Sorting proves the claim by rebuilding both strings in a canonical order — far more structure than a yes-or-no answer needs, and the ordering is thrown away the moment the comparison is done.",
      idea: problem.approach,
      takeaways: [
        "count up for s and down for t in the same pass — the tally does not care what order the evidence arrives in",
        "every counter back to zero means the letters balance exactly",
        "a non-zero counter NAMES the disagreement rather than just reporting one",
        "and the memory is the alphabet, so it is constant however long the words are",
      ],
      quiz: [
        {
          q: "Why can both strings be read in the same loop?",
          choices: [
            "to save time",
            "because the tally is order-independent: a letter added and a letter subtracted commute",
          ],
          answer: 1,
          explain:
            "That is also why the length check has to come first — the shared loop assumes both strings have the same number of positions.",
        },
      ],
      run: countUpDown,
    },
  ],
})
