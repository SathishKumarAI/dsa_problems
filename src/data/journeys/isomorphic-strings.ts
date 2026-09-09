// Same Shape, Different Letters, derived. Two words in one row.
//
// The stage is the two MAPS, side by side, because the whole lesson is that
// one of them is not enough: a single forward map lets two different
// characters collapse onto the same target, which the definition forbids and
// which no amount of staring at the forward map reveals.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/arrays-hashing/isomorphic-strings.ts"

type W = Data<string>

const parts = (nums: string[]) => ({ s: nums[0] ?? "", t: nums[1] ?? "" })

/** The reference: consistent in BOTH directions. */
export function isIsomorphic(nums: string[]) {
  const { s, t } = parts(nums)
  if (s.length !== t.length) return false
  const forward = new Map<string, string>()
  const backward = new Map<string, string>()
  for (let i = 0; i < s.length; i++) {
    const a = s[i]
    const b = t[i]
    if (forward.has(a) && forward.get(a) !== b) return false
    if (backward.has(b) && backward.get(b) !== a) return false
    forward.set(a, b)
    backward.set(b, a)
  }
  return true
}

/** Only the forward half — the version that collapses two characters into one. */
export function forwardOnly(nums: string[]) {
  const { s, t } = parts(nums)
  if (s.length !== t.length) return false
  const forward = new Map<string, string>()
  for (let i = 0; i < s.length; i++) {
    if (forward.has(s[i]) && forward.get(s[i]) !== t[i]) return false
    forward.set(s[i], t[i])
  }
  return true
}

/** The two maps, drawn as a grid: pairs across, one row per direction. */
const maps = (
  forward: Map<string, string>,
  backward: Map<string, string>,
  label: string,
  mark?: (row: 0 | 1, key: string) => ChipRole | undefined
) => {
  const f = [...forward.entries()]
  const b = [...backward.entries()]
  const width = Math.max(f.length, b.length, 1)
  const marks: Record<string, ChipRole> = {}
  const row = (entries: [string, string][], which: 0 | 1) => {
    const cells: string[] = []
    for (let i = 0; i < width; i++) {
      const e = entries[i]
      cells.push(e ? `${e[0]}→${e[1]}` : "·")
      if (e) {
        const m = mark?.(which, e[0])
        if (m) marks[`${which},${i}`] = m
      }
    }
    return cells
  }
  return { cells: [row(f, 0), row(b, 1)], marks, label }
}

function* story({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const answer = isIsomorphic(nums)
  const forwardSays = forwardOnly(nums)
  yield {
    hold: 3,
    noChips: true,
    note: `Two strings, "${s}" and "${t}". Can the characters of the first be consistently replaced to produce the second — one character always becoming the same other character?`,
  }
  yield {
    hold: 3,
    row: [...s],
    marks: {},
    state: [
      { label: "s", value: s },
      { label: "t", value: t },
    ],
    note: "Two rules, and the second is the one that gets forgotten: each character maps to exactly one character, AND no two characters may map to the same one. The mapping has to be consistent in both directions.",
  }
  yield {
    hold: 3,
    row: [...s],
    marks: {},
    state: [{ label: "answer", value: String(answer) }],
    answer,
    corner:
      answer !== forwardSays
        ? "backward"
        : answer
          ? s === t
            ? "self"
            : "shape"
          : "forward",
    note:
      answer !== forwardSays
        ? `False — and this is the input to remember. Reading only left to right, every character of "${s}" maps somewhere consistent; the contradiction is that two DIFFERENT characters end up claiming the same target. A single map cannot see it.`
        : answer
          ? s === t
            ? "True, and trivially: every character maps to itself. Worth noting that a character mapping to itself is allowed — the rule is consistency, not change."
            : `True. The two strings have the same shape: wherever "${s}" repeats a character, "${t}" repeats one too, in the same places.`
          : `False: some character of "${s}" would have to become two different things.`,
  }
}

/** Rung 1 — encode each string as its pattern of first occurrences. */
function* encodeBoth({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const encode = (str: string) => {
    const first = new Map<string, number>()
    return [...str].map((ch, i) => {
      if (!first.has(ch)) first.set(ch, i)
      return first.get(ch)!
    })
  }
  const es = encode(s)
  const et = encode(t)
  yield {
    line: 2,
    row: [...s],
    marks: {},
    state: [{ label: "s", value: s }],
    note: "Rewrite each string as a pattern: every character becomes the position where that character was FIRST seen. Two isomorphic strings produce the same pattern, whatever letters they use.",
  }
  for (let i = 0; i < s.length; i++)
    yield {
      line: 5,
      row: [...s],
      marks: Object.fromEntries(
        [...s]
          .map((_, k) => [k, k === i ? "focus" : k < i ? "dim" : undefined])
          .filter(([, v]) => v) as [number, ChipRole][]
      ),
      state: [
        { label: "s so far", value: es.slice(0, i + 1).join(" ") },
        { label: "t so far", value: et.slice(0, i + 1).join(" ") },
      ],
      note: `"${s[i]}" first appeared at ${es[i]}, "${t[i]}" at ${et[i]}. The patterns are being built in full — both of them — before anything is compared.`,
    }
  const answer = isIsomorphic(nums)
  yield {
    line: 11,
    answer,
    row: [...s],
    marks: {},
    state: [
      { label: "s pattern", value: es.join(" ") },
      { label: "t pattern", value: et.join(" ") },
      { label: "answer", value: String(answer) },
    ],
    corner: s === t ? "self" : answer ? "shape" : undefined,
    note: `${answer}, by comparing "${es.join(" ")}" with "${et.join(" ")}". Neat, and correct in both directions for free — a position-of-first-occurrence encoding cannot collapse two characters onto one. The price is that it builds two whole sequences before it compares anything, so a string that fails at character two still costs two full passes.`,
  }
}

/** Rung 2 — two maps, decided at the first contradiction. */
function* twoMaps({ nums }: W): Generator<DFrame> {
  const { s, t } = parts(nums)
  const forward = new Map<string, string>()
  const backward = new Map<string, string>()
  if (s.length !== t.length) {
    yield {
      line: 2,
      answer: false,
      row: [...s],
      marks: {},
      state: [{ label: "lengths", value: `${s.length} · ${t.length}` }],
      note: "Different lengths cannot be isomorphic, and the shared loop below reads both at the same index — so this test protects the walk as well as answering the question.",
    }
    return
  }
  yield {
    line: 3,
    grid: maps(forward, backward, "forward above, backward below"),
    state: [{ label: "position", value: 0 }],
    note: "Two maps: what each character of s must become, and which character of s each target already belongs to. The second is the half people leave out.",
  }
  for (let i = 0; i < s.length; i++) {
    const a = s[i]
    const b = t[i]
    if (forward.has(a) && forward.get(a) !== b) {
      yield {
        line: 8,
        answer: false,
        grid: maps(
          forward,
          backward,
          `${a} already goes to ${forward.get(a)}`,
          (row, key) => (row === 0 && key === a ? "focus" : undefined)
        ),
        state: [
          { label: "at", value: `${a} → ${b}` },
          { label: "but", value: `${a} → ${forward.get(a)}` },
        ],
        corner: "forward",
        note: `"${a}" has to become "${b}" here and became "${forward.get(a)}" earlier. One character, two destinations — the forward rule broken, and the answer is decided at position ${i} rather than at the end.`,
      }
      return
    }
    if (backward.has(b) && backward.get(b) !== a) {
      yield {
        line: 10,
        answer: false,
        grid: maps(
          backward,
          forward,
          `${b} is already taken by ${backward.get(b)}`,
          (row, key) => (row === 0 && key === b ? "focus" : undefined)
        ),
        state: [
          { label: "at", value: `${a} → ${b}` },
          { label: "but", value: `${backward.get(b)} → ${b}` },
        ],
        corner: "backward",
        note: `"${b}" is already spoken for by "${backward.get(b)}", and now "${a}" wants it too. TWO characters onto one target — forbidden, and completely invisible to the forward map, which has no complaint about either of them.`,
      }
      return
    }
    forward.set(a, b)
    backward.set(b, a)
    yield {
      line: 12,
      grid: maps(forward, backward, `${a} ↔ ${b}`, (row, key) =>
        (row === 0 && key === a) || (row === 1 && key === b)
          ? "answer"
          : undefined
      ),
      state: [
        { label: "position", value: i },
        { label: "pairs", value: forward.size },
      ],
      corner: a === b && i === 0 ? "self" : undefined,
      note:
        a === b
          ? `"${a}" maps to itself, which is allowed — the rule is consistency, not change. Both maps record it, because a character claiming itself still claims a target.`
          : `"${a}" becomes "${b}", recorded in both directions. Nothing else may use "${b}" from here on, and that is precisely what the second map is for.`,
    }
  }
  const answer = isIsomorphic(nums)
  yield {
    line: 13,
    answer,
    grid: maps(forward, backward, "consistent both ways", () => "answer"),
    state: [
      { label: "answer", value: String(answer) },
      { label: "pairs", value: forward.size },
      { label: "characters read", value: s.length },
    ],
    corner: s === t ? "self" : "shape",
    note: `${answer}. Every character kept its promise in both directions. The two maps together are the definition written down — and unlike the pattern version, a contradiction stops the walk where it happens rather than after both strings have been rebuilt.`,
  }
}

export const isomorphicStrings = deriveJourney<string>(problem, {
  slug: "one-to-one-both-ways",
  subtitle: "a second map, for the rule the first one cannot see",
  reveals: ["arrays-hashing"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "longer strings" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length === 2 && nums.every((w) => /^[a-z]+$/.test(w))
      ? { ok: true }
      : { ok: false, warning: "two lowercase words — e.g. egg add" }
  },
  presets: {
    example: { label: "the example", nums: ["egg", "add"], info: "true" },
    forward: {
      label: "one character, two destinations",
      nums: ["foo", "bar"],
      info: "o would be both a and r",
    },
    backward: {
      label: "two characters, one destination",
      nums: ["badc", "baba"],
      info: "forward is fine; backward is not",
    },
    self: {
      label: "identical strings",
      nums: ["abc", "abc"],
      info: "every character maps to itself",
    },
    shape: {
      label: "same shape, no shared letters",
      nums: ["abab", "cdcd"],
      info: "true",
    },
    single: {
      label: "one character",
      nums: ["a", "z"],
      info: "trivially true",
    },
    long: {
      label: "longer strings",
      nums: ["paperpaper", "titletitle"],
      info: "ten characters",
    },
  },
  edges: [
    {
      key: "backward",
      name: "two characters onto the same target",
      example:
        '"badc" and "baba" → false, though the forward map never complains',
      why: "b→b, a→a, d→b, c→a: read left to right nothing contradicts, and the strings are still not isomorphic because d and b would both become b. This is the entire reason for the second map, and it is invisible to any solution that keeps only one.",
      think: "Can two different characters legally share a target?",
      preset: "backward",
      constraint: 2,
    },
    {
      key: "forward",
      name: "one character with two destinations",
      example: '"foo" and "bar" → false',
      why: "The obvious failure: o must be both a and r. Every solution catches this one, which is why it is the wrong case to test with — it says nothing about whether the backward half exists.",
      think: "Which of the two rules does this input actually exercise?",
      preset: "forward",
      constraint: 2,
    },
    {
      key: "self",
      name: "a character mapping to itself",
      example: '"abc" and "abc" → true',
      why: "Allowed — the rule is consistency, not change. A solution that requires every character to become a DIFFERENT one rejects the most obvious true case in the problem.",
      think: "Does your check demand that anything actually changes?",
      preset: "self",
      constraint: 3,
    },
    {
      key: "shape",
      name: "same shape, no letters in common",
      example: '"abab" and "cdcd" → true',
      why: "Isomorphism is about the pattern of repeats, not about the characters. Two strings sharing nothing at all can be isomorphic, which rules out any solution built on comparing the characters themselves.",
      think:
        "What is actually being compared — the letters, or where they repeat?",
      preset: "shape",
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
        "given: two strings of the same length",
        "replace each character of the first consistently to get the second",
        "each character maps to exactly ONE character",
        "and no two characters may map to the same one",
      ],
      tools: [
        {
          name: "Two strings",
          role: "two tokens in one row. What matters is not the characters but the PATTERN of repeats — which is why two strings with nothing in common can still be isomorphic.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the mapping must be consistent in both directions, and the second direction is the one people drop",
        "a character may map to itself",
        "the letters themselves never matter — only where they repeat",
      ],
      quiz: [
        {
          q: 'In "badc" → "baba", every character of the first maps somewhere consistent. Isomorphic?',
          choices: [
            "yes — nothing contradicts",
            "no: b and d would both have to become b, and two characters may not share a target",
          ],
          answer: 1,
          explain:
            "This is the whole problem in four letters. A single forward map has no complaint about this input.",
        },
      ],
      run: story,
    },
    {
      key: "encode",
      name: "Turn each string into its pattern",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Rewrite each string as the position at which each character was first seen, then compare the two encodings.",
      takeaways: [
        "the encoding is canonical, so two isomorphic strings always produce the same one",
        "and it is correct in both directions for free — first-occurrence positions cannot collapse two characters onto one",
        "but it builds two whole sequences before comparing anything, so an input that fails at the second character still costs two full passes",
      ],
      quiz: [
        {
          q: "Why does this version not need a second map?",
          choices: [
            "it checks the backward direction separately",
            "the encoding is by POSITION, so two different characters cannot produce the same code by accident",
          ],
          answer: 1,
          explain:
            "The canonical form does the work the second map does elsewhere. It is a real solution, not a lucky one.",
        },
      ],
      run: encodeBoth,
    },
    {
      key: "maps",
      name: "Two maps, both directions",
      short: "stop at the first contradiction",
      insight:
        "Encoding both strings works and is a neat trick — but it builds two whole sequences before comparing anything, when most failing inputs contradict themselves within a few characters.",
      idea: problem.approach,
      takeaways: [
        "forward: what this character must become. Backward: which character already owns that target",
        "the backward map is the half people forget, and without it two characters collapse onto one",
        "a contradiction stops the walk where it happens rather than after both strings are rebuilt",
        "a character mapping to itself is ordinary and needs no special case",
      ],
      quiz: [
        {
          q: "What does the backward map catch that the forward map cannot?",
          choices: [
            "a character mapping to two different targets",
            "two different characters mapping to the SAME target",
          ],
          answer: 1,
          explain:
            "The forward map only knows about one source at a time. Nothing in it can notice that a target has already been claimed.",
        },
      ],
      run: twoMaps,
    },
  ],
})
