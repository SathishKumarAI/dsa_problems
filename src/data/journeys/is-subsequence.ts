// Is One String Hidden in the Other?, derived. The row on screen is t, the
// long string being walked; s rides alongside as a STRING parameter — the
// first journey to carry one. Two rungs, and the whole argument is whether
// taking the earliest match can ever be a mistake.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/is-subsequence/index.ts"

type T = Data<string> & { s: string }

export function hiddenIn(needle: string, hay: string[]) {
  let i = 0
  for (const ch of hay) if (i < needle.length && needle[i] === ch) i += 1
  return i === needle.length
}

// Where the greedy walk lands each character of s, for the narration.
function matchesAt(needle: string, hay: string[]) {
  const at: number[] = []
  let i = 0
  for (let j = 0; j < hay.length; j++)
    if (i < needle.length && needle[i] === hay[j]) {
      at.push(j)
      i += 1
    }
  return at
}

const picked = (n: number, at: number[]) =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [i, at.includes(i) ? "answer" : "dim"])
  ) as Record<number, ChipRole>

function* story({ nums, s }: T): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Is "${s}" hidden inside this string? Not as a contiguous stretch — you may delete characters freely, but you may not reorder what is left.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "So the letters have to appear in the right ORDER, with anything at all allowed between them. That makes this a question about two positions moving forward together, never backward.",
  }
  const answer = hiddenIn(s, nums)
  const at = matchesAt(s, nums)
  const contiguous = at.every((v, i) => i === 0 || v === at[i - 1] + 1)
  yield {
    hold: 3,
    marks: answer ? picked(nums.length, at) : {},
    state: [
      { label: "looking for", value: s || "nothing" },
      { label: "answer", value: answer ? "true" : "false" },
    ],
    answer,
    corner: !s.length
      ? "emptyneedle"
      : s.length > nums.length
        ? "longerneedle"
        : answer && !contiguous
          ? "scattered"
          : undefined,
    note: !s.length
      ? "There is nothing to look for, and nothing is hidden inside everything — including inside the empty string. True, and it is the case a loop can answer without running once."
      : s.length > nums.length
        ? `"${s}" is longer than the string it would have to hide in, so the answer is false and no character need be compared at all. Worth knowing, because the general method reaches it anyway — it simply runs out.`
        : answer && !contiguous
          ? `"${s}" is hidden here, at positions ${at.join(", ")} — not adjacent. Deleting is free; reordering is not, and that is the only rule.`
          : answer
            ? `"${s}" is hidden here, at positions ${at.join(", ")}.`
            : `"${s}" is not hidden here. Some character of it is either missing, or present only EARLIER than it would need to be.`,
  }
}

function* searchEach({ nums, s }: T): Generator<DFrame> {
  let at = 0
  for (let k = 0; k < s.length; k++) {
    const ch = s[k]
    let found = -1
    for (let j = at; j < nums.length; j++)
      if (nums[j] === ch) {
        found = j
        break
      }
    yield {
      line: found < 0 ? 8 : 6,
      marks: {
        ...Object.fromEntries(
          nums.map((_, i) => [i, i < at ? "dim" : "focus"])
        ) as Record<number, ChipRole>,
        ...(found >= 0 ? ({ [found]: "answer" } as Record<number, ChipRole>) : {}),
      },
      state: [
        { label: "looking for", value: ch },
        { label: "from", value: at },
      ],
      note:
        found < 0
          ? `'${ch}' does not appear anywhere from position ${at} onward. Whatever is left of the search is over: false.`
          : `'${ch}' found at ${found}, scanning forward from ${at}. Resume the next search just after it.`,
    }
    if (found < 0) {
      yield { line: 9, answer: false, note: "Return false." }
      return
    }
    at = found + 1
  }
  yield {
    line: 11,
    answer: true,
    state: [{ label: "answer", value: "true" }],
    note: `Every character of "${s}" was placed, so it is hidden here. Correct — and each search restarts a scan through the same region the previous one already walked.`,
  }
}

function* twoPointers({ nums, s }: T): Generator<DFrame> {
  let i = 0
  for (let j = 0; j < nums.length; j++) {
    const matched = i < s.length && s[i] === nums[j]
    if (matched) i += 1
    yield {
      line: 3,
      marks: {
        ...Object.fromEntries(
          nums.map((_, k) => [k, k < j ? "dim" : "focus"])
        ) as Record<number, ChipRole>,
        [j]: matched ? "answer" : "focus",
      },
      state: [
        { label: "matched", value: `${i}/${s.length}` },
        { label: "needs", value: i < s.length ? s[i] : "—" },
      ],
      note: matched
        ? `'${nums[j]}' is what was wanted, so take it — ${i} of ${s.length} placed${i < s.length ? `, now looking for '${s[i]}'` : ", and that is all of them"}. Taking it here rather than later leaves the most of the string still available.`
        : `'${nums[j]}' is not ${i < s.length ? `'${s[i]}'` : "needed at all"}. Step past it; nothing is lost, because deleting is free.`,
    }
  }
  const answer = i === s.length
  yield {
    line: 5,
    answer,
    state: [{ label: "answer", value: answer ? "true" : "false" }],
    note: answer
      ? `All ${s.length} character${s.length === 1 ? "" : "s"} placed, in order: true. One pass over the string, one pointer each, and never a step backwards.`
      : `Only ${i} of ${s.length} characters were placed before the string ran out: false. The pointer into "${s}" never reached the end, which is the whole test.`,
  }
}

export const isSubsequence = deriveJourney<string>(problem, {
  slug: "hidden-in-order",
  subtitle: "the earliest match is never the wrong one",
  reveals: ["two-pointers"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  params: [{ key: "s", label: "looking for", kind: "string" }],
  presets: {
    example: {
      label: "the example",
      nums: [..."ahbgdc"],
      extra: { s: "abc" },
    },
    toolate: {
      label: "present, but too early",
      nums: [..."ahbgdc"],
      extra: { s: "axc" },
      info: "the x is never available",
    },
    emptyneedle: {
      label: "nothing to look for",
      nums: [..."ahbgdc"],
      extra: { s: "" },
      info: "hidden inside anything",
    },
    longerneedle: {
      label: "longer than the string",
      nums: [..."abc"],
      extra: { s: "abcd" },
      info: "false before any comparison matters",
    },
    scattered: {
      label: "spread right out",
      nums: [..."axbxxcxx"],
      extra: { s: "abc" },
      info: "the picks are far apart",
    },
    long: {
      label: "a longer string",
      nums: [..."abppplleeptuoyaddd"],
      extra: { s: "apple" },
    },
  },
  edges: [
    {
      key: "emptyneedle",
      name: "nothing to look for",
      example: '"" inside "ahbgdc" → true',
      why: "The empty string is a subsequence of everything, including of itself. It is the answer a loop produces by never running, so it is easy to get right by accident and easy to break with an off-by-one.",
      think: "What does your answer say before the first comparison happens?",
      preset: "emptyneedle",
      constraint: 3,
    },
    {
      key: "scattered",
      name: "the picks are far apart",
      example: '"abc" inside "axbxxcxx" → true',
      why: "Order is the only rule; adjacency is not required at all. Anything looking for a contiguous stretch answers false here.",
      think: "Are you looking for a substring or a subsequence?",
      preset: "scattered",
      constraint: 2,
    },
    {
      key: "longerneedle",
      name: "longer than the string it hides in",
      example: '"abcd" inside "abc" → false',
      why: "It cannot fit, and the general method reaches that answer by simply running out of string. No special case is needed — but the pointer must be checked against its own end before it is used to read a character.",
      think: "Does your code read s[i] before checking that i is still in range?",
      preset: "longerneedle",
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
        "given: a string to hide, and a string to hide it in",
        "delete freely from the second one",
        "do not reorder what is left",
        "task: can the first be produced this way?",
      ],
      tools: [
        {
          name: "Two strings",
          role: "one is the row on screen and the other rides alongside. Both are read left to right and neither pointer ever moves backward — which is what makes one pass enough.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "order is required; adjacency is not",
        "the empty string is hidden inside everything",
        "both pointers only ever move forward, so nothing is ever reconsidered",
      ],
      quiz: [
        {
          q: 'Is "axc" hidden inside "ahbgdc"?',
          choices: ["yes", "no — there is no x at all"],
          answer: 1,
          explain:
            "Deleting cannot create a character that is not there. Order and presence are both required.",
        },
      ],
      run: story,
    },
    {
      key: "search",
      name: "Search for each character in turn",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "For each character of the string you are looking for, scan forward from just after the previous match until you find it. If a scan runs off the end, the answer is false.",
      takeaways: [
        "correct, and it makes the ordering requirement explicit — each search starts after the last match",
        "every search re-walks the region the previous one already crossed",
        "a long string with a needle near its end costs a scan per character",
      ],
      run: searchEach,
    },
    {
      key: "walk",
      name: "One pointer each, both moving forward",
      short: "one pass, nothing revisited",
      insight:
        "Each search resumes where the last one stopped, so the scans never actually overlap — they are one walk through the string, restarted needlessly. Walk it once and advance the other pointer whenever the characters agree.",
      idea: problem.whyNow!,
      takeaways: [
        "advance through the long string always; advance through the short one only on a match",
        "taking the earliest match is safe — an earlier match leaves strictly more of the string for what follows",
        "so nothing is ever reconsidered, and neither pointer moves backward",
        "the answer is simply whether the short string's pointer reached its end",
      ],
      quiz: [
        {
          q: "Why is it safe to take the first match rather than looking for a better one later?",
          choices: [
            "because matches are all equivalent",
            "because an earlier match leaves strictly more of the string available for the characters still to come",
          ],
          answer: 1,
          explain:
            "Any solution using a later match can be rewritten to use the earlier one and still work. Greedy is not a gamble here — it is provably no worse.",
        },
      ],
      run: twoPointers,
    },
  ],
})
