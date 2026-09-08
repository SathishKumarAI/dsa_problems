// Brackets With a Wildcard, derived. Two rungs and one idea: you cannot
// decide what a star means when you meet it, so do not decide — carry the
// RANGE of open counts every reading could still have.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/valid-parenthesis-string.ts"

type S = Data<string>

export function balances(chars: string[]) {
  let low = 0
  let high = 0
  for (const ch of chars) {
    if (ch === "(") {
      low += 1
      high += 1
    } else if (ch === ")") {
      low -= 1
      high -= 1
    } else {
      low -= 1
      high += 1
    }
    if (high < 0) return false
    if (low < 0) low = 0
  }
  return low === 0
}

const upTo = (n: number, i: number, role: ChipRole = "dim") =>
  Object.fromEntries(
    Array.from({ length: n }, (_, k) => [k, k < i ? role : "dim"])
  ) as Record<number, ChipRole>

function* story({ nums }: S): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Brackets, plus a wildcard. Every '*' may be read as an opening bracket, a closing bracket, or nothing at all — and each one is chosen independently. Can the string be read as balanced?",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The difficulty is that a star's meaning depends on what comes later, which you have not read yet. Committing to a choice when you meet it means guessing; the way out is to refuse to choose and carry every possibility at once.",
  }
  const answer = balances(nums)
  const stars = nums.filter((c) => c === "*").length
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((c, i) => [i, c === "*" ? "answer" : "focus"])
    ) as Record<number, ChipRole>,
    state: [{ label: "balances", value: answer ? "true" : "false" }],
    answer,
    corner: !answer
      ? "impossible"
      : stars >= 2
        ? "twostars"
        : stars === 1
          ? "emptyreading"
          : undefined,
    note: !answer
      ? `"${nums.join("")}" cannot be read as balanced under any choice of the star${stars === 1 ? "" : "s"}. False is a real answer, and reaching it means ruling out every reading — not failing to find one.`
      : stars >= 2
        ? `"${nums.join("")}" balances. There are ${stars} stars here and they need not agree: one can open while another closes, because each is chosen on its own.`
        : stars === 1
          ? `"${nums.join("")}" balances, and the star's job here includes possibly being NOTHING. That third reading is easy to forget, and it is what makes a lone star harmless rather than a problem to solve.`
          : `"${nums.join("")}" balances, with no wildcards involved at all.`,
  }
}

function* branchAll({ nums }: S): Generator<DFrame> {
  let explored = 0
  let found = false
  const walk = function* (at: number, open: number): Generator<DFrame, boolean> {
    if (open < 0) return false
    if (at === nums.length) {
      explored += 1
      if (open === 0 && !found) {
        found = true
        yield {
          line: 4,
          marks: upTo(nums.length, at, "answer"),
          state: [
            { label: "open", value: open },
            { label: "readings tried", value: explored },
          ],
          note: `A reading that balances, found after ${explored} complete attempt${explored === 1 ? "" : "s"}. Everything the search does after this is confirmation it does not need.`,
        }
      }
      return open === 0
    }
    const ch = nums[at]
    if (ch === "(") return yield* walk(at + 1, open + 1)
    if (ch === ")") return yield* walk(at + 1, open - 1)
    yield {
      line: 9,
      marks: { ...upTo(nums.length, at, "focus"), [at]: "answer" },
      state: [
        { label: "open", value: open },
        { label: "readings tried", value: explored },
      ],
      note: `A star at ${at}, with ${open} open bracket${open === 1 ? "" : "s"} outstanding. Three futures branch from here — open, close, or nothing — and each has to be followed separately.`,
    }
    if (yield* walk(at + 1, open + 1)) return true
    if (yield* walk(at + 1, open - 1)) return true
    return yield* walk(at + 1, open)
  }
  const answer = yield* walk(0, 0)
  yield {
    line: 17,
    answer,
    state: [
      { label: "answer", value: answer ? "true" : "false" },
      { label: "readings tried", value: explored },
    ],
    note: `${answer ? "true" : "false"}, after reaching the end of the string ${explored} time${explored === 1 ? "" : "s"}. Three branches per star: add one star to the input and this triples. And most of those branches differ only in a count nobody can tell apart later.`,
  }
}

function* range({ nums }: S): Generator<DFrame> {
  let low = 0
  let high = 0
  for (let i = 0; i < nums.length; i++) {
    const ch = nums[i]
    if (ch === "(") {
      low += 1
      high += 1
    } else if (ch === ")") {
      low -= 1
      high -= 1
    } else {
      low -= 1
      high += 1
    }
    if (high < 0) {
      yield {
        line: 14,
        marks: { ...upTo(nums.length, i, "focus"), [i]: "answer" },
        state: [{ label: "low·high", value: `${Math.max(low, 0)}·${high}` }],
        note: `Even the most generous reading — every star an opening bracket — has run out of open brackets to close. There is no reading left to save this, so the answer is false without reading another character.`,
      }
      yield { line: 14, answer: false, note: "Return false." }
      return
    }
    const clamped = low < 0
    if (clamped) low = 0
    yield {
      line: ch === "(" ? 6 : ch === ")" ? 9 : 12,
      marks: { ...upTo(nums.length, i, "focus"), [i]: "answer" },
      state: [
        { label: "low·high", value: `${low}·${high}` },
        { label: "at", value: i },
      ],
      note: `'${ch}' — ${ch === "(" ? "every reading gains an open bracket, so both ends of the range rise" : ch === ")" ? "every reading loses one, so both ends fall" : "a star pulls the two ends APART: the most frugal reading closes a bracket, the most generous opens one"}. The open count is somewhere in ${low}…${high}.${clamped ? " The low end would have gone negative, which means those readings closed a bracket that was never opened — they are illegal and simply discarded, so the low end is held at 0." : ""}`,
    }
  }
  const answer = low === 0
  yield {
    line: 17,
    answer,
    state: [{ label: "low·high", value: `${low}·${high}` }],
    note: `The string is finished with the open count somewhere in ${low}…${high}. ${answer ? "Zero is inside that range, so some reading ends balanced — true." : "Zero is not reachable: even the most frugal reading still has open brackets outstanding — false."} Two integers replaced the whole tree, because a reading is only ever distinguishable by how many opens it has outstanding.`,
  }
}

export const validParenthesisString = deriveJourney<string>(problem, {
  slug: "brackets-with-a-wildcard",
  subtitle: "refuse to choose, and carry the range instead",
  reveals: ["stack"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  classify: (d) =>
    (d.nums as string[]).every((c) => c === "(" || c === ")" || c === "*")
      ? { ok: true }
      : { ok: false, warning: "only '(', ')' and '*' are allowed" },
  presets: {
    example: { label: "the example", nums: [..."(*))"] },
    emptyreading: {
      label: "the star is nothing",
      nums: [..."()*"],
      info: "the third reading, easy to forget",
    },
    twostars: {
      label: "two stars, different jobs",
      nums: [..."(**)"],
      info: "each one is chosen on its own",
    },
    impossible: {
      label: "no reading works",
      nums: [..."(((*)"],
      info: "two opens left over whatever the star does",
    },
    clamp: {
      label: "a star before its bracket",
      nums: [..."*)"],
      info: "illegal readings are discarded, not tracked",
    },
    long: { label: "a longer string", nums: [..."((*)*())*"] },
  },
  edges: [
    {
      key: "emptyreading",
      name: "the star stands for nothing",
      example: '"()*" → true',
      why: "A star has three readings, not two, and the empty one is the easy one to forget. Without it a trailing star has to become a bracket and breaks a string that was already balanced.",
      think: "How many things can a single star be?",
      preset: "emptyreading",
      constraint: 3,
    },
    {
      key: "twostars",
      name: "two stars doing different jobs",
      example: '"(**)" → true',
      why: "The stars are chosen independently, so one may open while another closes. Anything that decides what 'a star' means once, for the whole string, cannot express that.",
      think: "Is your decision about stars made per star, or once for all of them?",
      preset: "twostars",
      constraint: 2,
    },
    {
      key: "impossible",
      name: "no reading works",
      example: '"(((*)" → false',
      why: "Even the star's most helpful reading leaves two opens outstanding. False means every reading was ruled out — which a range can state directly and a search can only conclude after exhausting itself.",
      think: "What has to be true before you can say no reading works?",
      preset: "impossible",
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
        "given: a string of '(', ')' and '*'",
        "each '*' independently means '(' or ')' or nothing",
        "balanced: every ')' has an earlier unmatched '('",
        "task: can SOME reading balance?",
      ],
      tools: [
        {
          name: "String of three symbols",
          role: "a row read left to right, where two symbols are decided and the third is not. What a star should be depends on characters that have not been read yet.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a star has three readings, and 'nothing' is one of them",
        "stars are chosen independently — two of them need not agree",
        "what a star should be depends on the future, so it cannot be decided on arrival",
        "false means every reading fails, which is a stronger claim than 'I did not find one'",
      ],
      quiz: [
        {
          q: "Why can a star's meaning not be decided when you first meet it?",
          choices: [
            "because stars are ambiguous by definition",
            "because whether it should open or close depends on brackets further along that have not been read yet",
          ],
          answer: 1,
          explain:
            "The information needed arrives later. Deciding early is guessing, and a wrong guess is only discovered at the end.",
        },
      ],
      run: story,
    },
    {
      key: "branch",
      name: "Try every meaning of every star",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the string; at each star, follow all three readings separately and report whether any of them ends balanced.",
      takeaways: [
        "correct, and it directly expresses what the question asks",
        "three branches per star, so the work triples with every extra one",
        "and most branches differ only in the number of open brackets outstanding — a single number",
      ],
      quiz: [
        {
          q: "Two different branches reach the same position with the same number of open brackets. How do their futures differ?",
          choices: [
            "they differ, since they made different choices",
            "not at all — the past choices are invisible from here",
          ],
          answer: 1,
          explain:
            "Only the outstanding count matters from here on. That redundancy is exactly what collapses the tree.",
        },
      ],
      run: branchAll,
    },
    {
      key: "range",
      name: "Carry the range of open counts",
      short: "one pass, two integers",
      insight:
        "Two readings that arrive at the same place with the same number of unmatched opens are indistinguishable from that point on. So the only thing worth carrying is that number — and since the readings disagree about it, carry the smallest and largest it could be.",
      idea: problem.whyNow!,
      takeaways: [
        "a bracket moves both ends of the range together; a star pulls them apart",
        "if the HIGH end goes negative, even the most generous reading has failed — return false",
        "if the LOW end goes negative, only some readings failed — discard them by clamping to 0",
        "at the end, zero being inside the range means some reading balanced",
      ],
      quiz: [
        {
          q: "The low end of the range would go below zero. Why clamp it to 0 rather than return false?",
          choices: [
            "because negative counts are meaningless",
            "because only the readings that went negative are illegal — the others are still alive, and clamping discards exactly the dead ones",
          ],
          answer: 1,
          explain:
            "A negative HIGH end means every reading died, which is fatal. A negative low end means some did, and the survivors still have zero or more opens outstanding.",
        },
      ],
      run: range,
    },
  ],
})
