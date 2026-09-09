// Can the Sentence Be Cut Into Words?, derived. The row carries the string
// first and then the dictionary words — one token each, split on spaces.
//
// The stage is the ROW OF REACHABLE POSITIONS, which is the picture the table
// version actually works on: not "which words did I use" but "which cut points
// can I stand on". That substitution is the whole lesson, because two different
// segmentations ending at the same position are interchangeable from there on.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/word-break.ts"

type W = Data<string>

const parts = (nums: string[]) => ({
  s: nums[0] ?? "",
  words: nums.slice(1),
})

/** The reference: can the string be cut entirely into dictionary words? */
export function canSegment(nums: string[]) {
  const { s, words } = parts(nums)
  const allowed = new Set(words)
  const reachable = Array.from({ length: s.length + 1 }, () => false)
  reachable[0] = true
  for (let i = 1; i <= s.length; i++)
    for (let j = 0; j < i; j++)
      if (reachable[j] && allowed.has(s.slice(j, i))) {
        reachable[i] = true
        break
      }
  return reachable[s.length]
}

/** The cut points, drawn as a two-row grid: position, then reachable. */
const positions = (
  s: string,
  reachable: boolean[],
  label: string,
  mark?: (i: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  reachable.forEach((_, i) => {
    const m = mark?.(i)
    if (m) marks[`1,${i}`] = m
  })
  return {
    cells: [
      reachable.map((_, i) => (i === 0 ? "ε" : s[i - 1])),
      reachable.map((v) => (v ? "✓" : "·")),
    ] as (number | string)[][],
    marks,
    label,
  }
}

function* story({ nums }: W): Generator<DFrame> {
  const { s, words } = parts(nums)
  const answer = canSegment(nums)
  const reuse = (() => {
    // does any single word have to be used more than once?
    const allowed = new Set(words)
    const used = new Map<string, number>()
    const walk = (at: number): boolean => {
      if (at === s.length) return true
      for (const w of allowed)
        if (s.startsWith(w, at)) {
          used.set(w, (used.get(w) ?? 0) + 1)
          if (walk(at + w.length)) return true
          used.set(w, (used.get(w) ?? 0) - 1)
        }
      return false
    }
    return walk(0) && [...used.values()].some((c) => c > 1)
  })()
  yield {
    hold: 3,
    noChips: true,
    note: `A string, "${s}", and a list of words. Can the string be cut up so that every piece is one of those words, with nothing left over?`,
  }
  yield {
    hold: 3,
    row: [...s],
    marks: {},
    state: [
      { label: "string", value: s },
      { label: "words", value: words.join(", ") || "none" },
    ],
    note: "Two things to hold on to: a word may be used as many times as you like, and the WHOLE string has to be consumed. A cut that leaves a tail is a failure, not a partial success.",
  }
  yield {
    hold: 3,
    row: [...s],
    marks: {},
    state: [{ label: "answer", value: String(answer) }],
    answer,
    corner: !answer ? "deadend" : reuse ? "reuse" : "whole",
    note: !answer
      ? `No cutting works. Note what that requires you to be sure of: not that ONE attempt failed, but that every attempt does — which is exactly why a greedy first guess cannot answer this question.`
      : reuse
        ? `Yes — and at least one word is used more than once. Words are a dictionary, not a supply, so nothing is consumed by being used.`
        : `Yes, the whole string is covered.`,
  }
}

/** Rung 1 — backtrack over every split. */
function* backtrack({ nums }: W): Generator<DFrame> {
  const { s, words } = parts(nums)
  const allowed = new Set(words)
  const asked = new Map<number, number>()
  let calls = 0
  let repeats = 0
  function* walk(at: number, taken: string[]): Generator<DFrame, boolean> {
    calls++
    if (asked.has(at)) repeats++
    asked.set(at, (asked.get(at) ?? 0) + 1)
    if (at === s.length) {
      yield {
        line: 2,
        row: [...s],
        marks: Object.fromEntries(
          [...s].map((_, i) => [i, "answer" as ChipRole])
        ),
        state: [
          { label: "split", value: taken.join(" · ") },
          { label: "calls", value: calls },
        ],
        note: `"${taken.join(" · ")}" consumes the whole string, so the answer is true and every caller above hears it at once.`,
      }
      return true
    }
    for (let end = at + 1; end <= s.length; end++) {
      const piece = s.slice(at, end)
      if (!allowed.has(piece)) continue
      yield {
        line: 4,
        row: [...s],
        marks: Object.fromEntries(
          [...s]
            .map((_, i) => [
              i,
              i >= at && i < end ? "focus" : i < at ? "dim" : ("" as ChipRole),
            ])
            .filter(([, v]) => v) as [number, ChipRole][]
        ),
        state: [
          { label: "trying", value: piece },
          { label: "from", value: at },
          { label: "repeats", value: repeats },
        ],
        corner: repeats > 0 ? "repeat" : undefined,
        note: `"${piece}" fits at position ${at}, so try it and ask the same question of what follows. If that fails the walk comes back here and tries a longer word — which is what a greedy version never does.`,
      }
      if (yield* walk(end, [...taken, piece])) return true
    }
    return false
  }
  yield {
    line: 1,
    row: [...s],
    marks: {},
    state: [{ label: "at", value: 0 }],
    note: "Try every word that fits at the current position, and recurse on the rest. Nothing is committed: a dead end is walked back out of.",
  }
  const found = yield* walk(0, [])
  const answer = canSegment(nums)
  yield {
    line: 6,
    answer,
    row: [...s],
    marks: Object.fromEntries(
      [...s].map((_, i) => [i, (found ? "answer" : "dim") as ChipRole])
    ),
    state: [
      { label: "answer", value: String(answer) },
      { label: "calls", value: calls },
      { label: "positions repeated", value: repeats },
      { label: "distinct positions", value: s.length + 1 },
    ],
    corner: !answer ? "deadend" : undefined,
    note: `${answer}, from ${calls} calls — ${repeats} of them asking about a position that had already been settled. There are only ${s.length + 1} positions in this string, and each one's answer depends on nothing but the position itself.`,
  }
}

/** Rung 2 — one boolean per position. */
function* reachablePositions({ nums }: W): Generator<DFrame> {
  const { s, words } = parts(nums)
  const allowed = new Set(words)
  const reachable = Array.from({ length: s.length + 1 }, () => false)
  reachable[0] = true
  let checks = 0
  yield {
    line: 3,
    grid: positions(s, reachable, "position 0 is free", (i) =>
      i === 0 ? "anchor" : undefined
    ),
    state: [{ label: "reachable", value: "0" }],
    note: "One boolean per CUT POINT, not per word: can the string up to here be segmented? Position 0 is true before anything happens — the empty prefix needs no words at all — and everything else grows from that.",
  }
  for (let i = 1; i <= s.length; i++) {
    let hit: number | null = null
    for (let j = 0; j < i; j++) {
      checks++
      if (reachable[j] && allowed.has(s.slice(j, i))) {
        reachable[i] = true
        hit = j
        break
      }
    }
    yield {
      line: 8,
      grid: positions(
        s,
        reachable,
        hit === null
          ? `${i}: nothing reaches it`
          : `"${s.slice(hit, i)}" from ${hit}`,
        (k) =>
          k === i
            ? hit === null
              ? "focus"
              : "answer"
            : k === hit
              ? "anchor"
              : reachable[k]
                ? "dim"
                : undefined
      ),
      state: [
        { label: "position", value: i },
        {
          label: "reachable",
          value: reachable
            .map((v, k) => (v ? k : null))
            .filter((v) => v !== null)
            .join(" "),
        },
      ],
      corner: hit !== null && hit > 0 ? "reuse" : undefined,
      note:
        hit === null
          ? `Nothing reaches position ${i}: for every earlier reachable point, the text between it and here is not a word. It stays false, and no later position will ever build on it.`
          : `Position ${hit} was reachable and "${s.slice(hit, i)}" is a word, so position ${i} is reachable too. One hit is enough — HOW it was reached does not matter to anything that comes after.`,
    }
  }
  const answer = canSegment(nums)
  yield {
    line: 9,
    answer,
    grid: positions(s, reachable, String(answer), (i) =>
      i === s.length
        ? answer
          ? "answer"
          : "focus"
        : reachable[i]
          ? "dim"
          : undefined
    ),
    state: [
      { label: "answer", value: String(answer) },
      { label: "checks", value: checks },
      { label: "positions", value: s.length + 1 },
    ],
    corner: answer
      ? "whole"
      : // some prefix segmented and the tail did not: the near miss
        reachable.slice(0, -1).some(Boolean)
        ? "tail"
        : "deadend",
    note: `${answer} — read off the LAST position, because the whole string has to be consumed.${
      !answer && reachable.slice(0, -1).some(Boolean)
        ? ` Look at the ticks: position ${reachable.lastIndexOf(true)} IS reachable, so most of the string segments perfectly — and the answer is still false. Reading the furthest position reached instead of the last one turns every near miss like this into a wrong true.`
        : ""
    } ${checks} substring checks, each position settled once, and nothing recorded about which words were used: two segmentations ending at the same place are interchangeable, so only the place is worth storing.`,
  }
}

export const wordBreak = deriveJourney<string>(problem, {
  slug: "which-cut-points-can-you-stand-on",
  subtitle: "store the position, not the path that reached it",
  reveals: ["dp"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length >= 2 && nums.every((w) => /^[a-z]+$/.test(w))
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the string first, then the dictionary words, all lowercase — e.g. leetcode leet code",
        }
  },
  presets: {
    example: {
      label: "the example",
      nums: ["leetcode", "leet", "code"],
      info: "true",
    },
    reuse: {
      label: "a word used twice",
      nums: ["applepenapple", "apple", "pen"],
      info: "apple appears twice",
    },
    deadend: {
      label: "every split dead-ends",
      nums: ["catsandog", "cats", "dog", "sand", "and", "cat"],
      info: "false — and greedily too",
    },
    greedy: {
      label: "the longest word first is wrong",
      nums: ["aaaab", "aa", "aaa", "b"],
      info: "the long match ruins it",
    },
    whole: {
      label: "one word covers it",
      nums: ["cat", "cat", "dog"],
      info: "the smallest true",
    },
    tail: {
      label: "a leftover tail",
      nums: ["catx", "cat"],
      info: "false — nothing may be left",
    },
    long: {
      label: "a longer string",
      nums: ["catsanddogsandcats", "cat", "cats", "and", "sand", "dog", "dogs"],
      info: "eighteen characters",
    },
  },
  edges: [
    {
      key: "deadend",
      name: "every split dead-ends",
      example: '"catsandog" with cats, cat, sand, and, dog → false',
      why: "Both promising starts run out at the same tail. Answering false requires knowing that EVERY route fails, which is why a single greedy pass cannot decide this — and why the failing case is the one worth keeping.",
      think:
        "What would convince you the answer is false, rather than that one attempt failed?",
      preset: "deadend",
      constraint: 3,
    },
    {
      key: "reuse",
      name: "a word used more than once",
      example: '"applepenapple" with apple and pen → true',
      why: "The words are a dictionary, not a supply: nothing is consumed by being used. Code that removes a word once matched answers a different, stricter question and returns false here.",
      think: "Does your solution track which words are still available?",
      preset: "reuse",
      constraint: 2,
    },
    {
      key: "whole",
      name: "one word covers the string",
      example: '"cat" with cat in the dictionary → true',
      why: "The smallest true case. It is also where a loop that requires at least two pieces, or that starts its scan at position 1, answers false on the most obvious input there is.",
      think: "Is a single word a valid segmentation?",
      preset: "whole",
      constraint: 3,
    },
    {
      key: "tail",
      name: "a leftover tail",
      example: '"catx" with cat → false',
      why: "Most of the string segments perfectly and the answer is still false. The verdict is read at the LAST position, never at the furthest position reached — an easy substitution that turns every near-miss into a wrong true.",
      think: "Which entry of your table is the answer?",
      preset: "tail",
      constraint: 3,
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
        "given: a string, and a list of words",
        "a word may be used as many times as you like",
        "task: can the string be cut into a sequence of those words",
        "with nothing at all left over",
      ],
      tools: [
        {
          name: "The string and the dictionary",
          role: "the string first, then the words. What the solution ends up reasoning about is neither of those — it is the set of CUT POINTS between characters, and which of them can be stood on.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "words may be reused, so nothing is consumed by matching",
        "the whole string must be consumed — a leftover tail is a false",
        "answering false means every route fails, not that one did",
      ],
      quiz: [
        {
          q: "The dictionary holds one word, and the string is that word three times over. Possible?",
          choices: [
            "no — there is only one word",
            "yes: a word may be used as many times as needed",
          ],
          answer: 1,
          explain:
            "The list is a dictionary, not an inventory. Treating a match as consuming the word is the standard wrong reading.",
        },
      ],
      run: story,
    },
    {
      key: "backtrack",
      name: "Try every word, back out of dead ends",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "At the current position, try every dictionary word that fits, and recurse on what is left. Report success if any chain consumes the whole string.",
      takeaways: [
        "backing out is what makes it correct — a greedy longest-first match dies on catsandog",
        "but the same position is reached along many different chains of words",
        "and each time, the identical question is asked again from scratch",
        "so the work is exponential while the number of distinct questions is the string's length",
      ],
      quiz: [
        {
          q: "Two different sets of words both end at position 7. How much do their futures differ?",
          choices: [
            "they differ — different words were used",
            "not at all: what happens next depends only on the position",
          ],
          answer: 1,
          explain:
            "Nothing downstream reads the history. That is exactly the redundancy the next rung removes.",
        },
      ],
      run: backtrack,
    },
    {
      key: "reachable",
      name: "One boolean per cut point",
      short: "ask once",
      insight:
        "Backtracking re-solves the same suffix along every path that reaches it — and two segmentations that end in the same place are interchangeable from there on.",
      idea: problem.approach,
      takeaways: [
        "entry i means 'the first i characters can be segmented' — a position, not a path",
        "position 0 is true because the empty prefix needs nothing, and it seeds everything",
        "one hit is enough to mark a position: how it was reached is never read again",
        "and the answer is the LAST entry, because the whole string has to be consumed",
      ],
      quiz: [
        {
          q: "Why is one way of reaching a position enough, with no need to record which?",
          choices: [
            "to keep the code short",
            "because everything after that position depends on the position alone — the route there is never consulted",
          ],
          answer: 1,
          explain:
            "Storing reachability instead of segmentations is what collapses the exponential into a table of booleans.",
        },
      ],
      run: reachablePositions,
    },
  ],
})
