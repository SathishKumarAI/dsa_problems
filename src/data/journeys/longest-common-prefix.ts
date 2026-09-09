// Prefix Shared by Every String, derived. The first journey whose row holds
// WORDS rather than numbers or single characters — `cells: "words"`. Two rungs,
// and the difference is whether you read the list across or down.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/arrays-hashing/longest-common-prefix.ts"

type W = Data<string>

export function sharedPrefix(words: string[]) {
  if (!words.length) return ""
  const first = words[0]
  for (let i = 0; i < first.length; i++)
    for (const w of words)
      if (i >= w.length || w[i] !== first[i]) return first.slice(0, i)
  return first
}

const all = (n: number, role: ChipRole) =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [i, role])
  ) as Record<number, ChipRole>

function* story({ nums }: W): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A list of words. Find the longest opening that every one of them shares — and the empty string if they share nothing at all.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Two facts bound the answer before any comparing starts. It can never be longer than the SHORTEST word, and one empty word anywhere forces an empty answer. Both are about columns, not about pairs of words.",
  }
  const prefix = sharedPrefix(nums)
  const shortest = nums.reduce((a, b) => (b.length < a.length ? b : a), nums[0])
  yield {
    hold: 3,
    marks: all(nums.length, prefix ? "answer" : "dim"),
    state: [{ label: "shared", value: prefix ? `"${prefix}"` : "nothing" }],
    answer: prefix,
    corner: nums.some((w) => !w.length)
      ? "emptyword"
      : !prefix
        ? "nothing"
        : prefix.length === shortest.length
          ? "shortest"
          : undefined,
    note: nums.some((w) => !w.length)
      ? "One of these words is empty. It has no first character to agree about, so the shared prefix is empty however long or alike the others are — a single empty string overrules everything."
      : !prefix
        ? `These words disagree at the very first character, so they share nothing: the answer is the empty string. That is a real answer, and it is decided by one column.`
        : prefix.length === shortest.length
          ? `The shared opening is "${prefix}" — the whole of "${shortest}", the shortest word here. The answer can never be longer than that, because the shortest word simply runs out of characters to agree with.`
          : `The shared opening is "${prefix}". They agree for ${prefix.length} character${prefix.length === 1 ? "" : "s"} and then part company.`,
  }
}

function* columns({ nums }: W): Generator<DFrame> {
  const first = nums[0]
  for (let i = 0; i < first.length; i++) {
    for (let w = 0; w < nums.length; w++) {
      const word = nums[w]
      const ranOut = i >= word.length
      const differs = !ranOut && word[i] !== first[i]
      if (ranOut || differs) {
        yield {
          line: 5,
          marks: { ...all(nums.length, "dim"), 0: "anchor", [w]: "focus" },
          state: [
            { label: "column", value: i },
            { label: "shared", value: `"${first.slice(0, i)}"` },
          ],
          note: ranOut
            ? `Column ${i}: "${word}" has run out of characters. It cannot agree about a column it does not have, so the prefix stops at ${i} — "${first.slice(0, i)}".`
            : `Column ${i}: "${word}" has '${word[i]}' where "${first}" has '${first[i]}'. First disagreement, so the prefix stops here — "${first.slice(0, i)}".`,
        }
        yield {
          line: 5,
          answer: first.slice(0, i),
          note: `Return "${first.slice(0, i)}".`,
        }
        return
      }
    }
    yield {
      line: 4,
      marks: all(nums.length, "answer"),
      state: [
        { label: "column", value: i },
        { label: "shared", value: `"${first.slice(0, i + 1)}"` },
      ],
      note: `Column ${i}: every word has '${first[i]}' there. All ${nums.length} agree, so the prefix reaches "${first.slice(0, i + 1)}".`,
    }
  }
  yield {
    line: 8,
    answer: first,
    marks: all(nums.length, "answer"),
    state: [{ label: "shared", value: `"${first}"` }],
    note: `Every column of "${first}" was matched by every word, so the whole of it is shared. Each character was read at most once per word, and the walk stopped the moment a column disagreed.`,
  }
}

function* shrink({ nums }: W): Generator<DFrame> {
  let prefix = nums[0]
  yield {
    line: 3,
    hold: 2,
    marks: { ...all(nums.length, "dim"), 0: "answer" },
    state: [{ label: "prefix", value: `"${prefix}"` }],
    note: `Start by assuming the whole of the first word is shared: "${prefix}". Every later word can only cut it down, never extend it.`,
  }
  for (let i = 1; i < nums.length; i++) {
    let trims = 0
    while (!nums[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
      trims += 1
      if (!prefix) break
    }
    yield {
      line: 5,
      marks: { ...all(nums.length, "dim"), [i]: "focus", 0: "anchor" },
      state: [
        { label: "against", value: `"${nums[i]}"` },
        { label: "prefix", value: prefix ? `"${prefix}"` : "empty" },
      ],
      note: trims
        ? `"${nums[i]}" does not begin with the prefix, so trim the last character and ask again — ${trims} time${trims === 1 ? "" : "s"}, down to ${prefix ? `"${prefix}"` : "nothing at all"}. Each of those checks re-read the whole prefix from the start.`
        : `"${nums[i]}" already begins with "${prefix}". Nothing to trim.`,
    }
    if (!prefix) {
      yield { line: 7, answer: "", note: "The prefix is gone: return the empty string." }
      return
    }
  }
  yield {
    line: 9,
    answer: prefix,
    marks: all(nums.length, "answer"),
    state: [{ label: "shared", value: `"${prefix}"` }],
    note: `"${prefix}". Right, and every trim re-compares the surviving prefix against the whole word from its first character — the same leading characters, read again and again.`,
  }
}

export const longestCommonPrefix = deriveJourney<string>(problem, {
  slug: "shared-opening",
  subtitle: "read the list down its columns, not across its pairs",
  reveals: ["arrays-hashing"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  presets: {
    example: { label: "the example", nums: ["flower", "flow", "flight"] },
    nothing: {
      label: "nothing shared",
      nums: ["dog", "racecar", "car"],
      info: "they part at the first column",
    },
    shortest: {
      label: "one word is the answer",
      nums: ["interspecies", "inter", "interstellar"],
      info: "the shortest word runs out",
    },
    emptyword: {
      label: "an empty word",
      nums: ["abc", "", "abd"],
      info: "one empty string overrules everything",
    },
    identical: {
      label: "all the same word",
      nums: ["same", "same", "same"],
      info: "every column agrees",
    },
    long: {
      label: "a longer list",
      nums: ["prefixed", "prefix", "prefixation", "prefixes", "prefixing"],
    },
  },
  edges: [
    {
      key: "emptyword",
      name: "one of the words is empty",
      example: '["abc", "", "abd"] → ""',
      why: "An empty word has no first character to agree about, so the answer is empty however alike the others are. Anything that skips empty entries, or reads a character before checking the length, is wrong here.",
      think: "What does an empty word contribute to a column?",
      preset: "emptyword",
      constraint: 3,
    },
    {
      key: "nothing",
      name: "nothing at all is shared",
      example: '["dog", "racecar", "car"] → ""',
      why: "The very first column already disagrees, so the answer is decided after one column and a handful of characters. The empty string is a real answer, not a failure.",
      think: "How much work should this input cost — and does yours cost that?",
      preset: "nothing",
      constraint: 1,
    },
    {
      key: "shortest",
      name: "the shortest word is the answer",
      example: '["interspecies", "inter", "interstellar"] → "inter"',
      why: "The answer is bounded by the shortest word, which simply runs out of characters to agree with. Running out has to end the prefix exactly as a disagreement does.",
      think: "Do you treat 'this word has no character here' the same as 'this character differs'?",
      preset: "shortest",
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
        "given: a list of words",
        "a shared opening: every word starts with it",
        "bounded by the SHORTEST word",
        "task: return the longest one, or the empty string",
      ],
      tools: [
        {
          name: "Array of words",
          role: "a row whose cells are whole strings. The question is about a COLUMN across all of them — the character at position i of every word — rather than about any single word.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer can never be longer than the shortest word",
        "one empty word forces an empty answer",
        "a word running out and a word disagreeing both end the prefix, and end it the same way",
      ],
      quiz: [
        {
          q: 'The list is ["abc", "", "abd"]. What is the answer?',
          choices: ['"ab"', '""'],
          answer: 1,
          explain:
            "The empty word shares no first character with anything, so nothing is common to all three. One empty string is enough to empty the answer.",
        },
      ],
      run: story,
    },
    {
      key: "shrink",
      name: "Trim against each word in turn",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Assume the first word is the answer, then for each later word trim the answer from the right until it is a prefix of that word too.",
      takeaways: [
        "correct, and it never extends the answer — only cuts it",
        "each trim re-compares the whole surviving prefix from its first character",
        "the same leading characters are read over and over, once per trim per word",
      ],
      run: shrink,
    },
    {
      key: "columns",
      name: "Read one column at a time",
      short: "each character once, stop at the first no",
      insight:
        "Trimming compares whole strings when the answer is decided character by character. Read down the COLUMN instead: at position i every word must have a character and they must all agree — one disagreement ends the whole thing.",
      idea: problem.whyNow!,
      takeaways: [
        "the question is about columns, so read columns",
        "a word that has run out ends the prefix just as a disagreement does",
        "each character is touched at most once, and the walk stops at the first disagreeing column",
        "a list sharing nothing costs one column rather than a pass over every word",
      ],
      quiz: [
        {
          q: "Why is 'this word has no character at column i' handled exactly like 'this character differs'?",
          choices: [
            "for convenience",
            "because in both cases that word does not start with a prefix of length i + 1, which is the only thing being asked",
          ],
          answer: 1,
          explain:
            "The test is whether every word extends the prefix by one more character. Running out is simply one way of failing it.",
        },
      ],
      run: columns,
    },
  ],
})
