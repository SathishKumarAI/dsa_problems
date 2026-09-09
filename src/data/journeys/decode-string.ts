// Expand a Nested Encoding, derived. Two rungs that both handle the nesting
// correctly. The argument is about where the suspended work LIVES — implicit
// on the call stack, or explicit in one you can see.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/decode-string.ts"

type S = Data<string>

export function decoded(chars: string[]) {
  const counts: number[] = []
  const texts: string[] = []
  let current = ""
  let number = 0
  for (const ch of chars) {
    if (/[0-9]/.test(ch)) number = number * 10 + Number(ch)
    else if (ch === "[") {
      counts.push(number)
      texts.push(current)
      number = 0
      current = ""
    } else if (ch === "]") {
      const times = counts.pop()!
      current = texts.pop()! + current.repeat(times)
    } else current += ch
  }
  return current
}

const upTo = (n: number, i: number) =>
  Object.fromEntries(
    Array.from({ length: n }, (_, k) => [k, k < i ? "dim" : k === i ? "focus" : "dim"])
  ) as Record<number, ChipRole>

function* story({ nums }: S): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: 'A count, a bracket, and the text inside it repeats that many times. "3[a]" becomes "aaa". Expand the whole string.',
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The groups NEST, and that is the only difficulty. Meeting a '[' means the text you were building, and the count in front of it, both have to be set aside and picked up again later — and picked up in the reverse of the order they were set down.",
  }
  const out = decoded(nums)
  const depth = (() => {
    let d = 0
    let best = 0
    for (const ch of nums) {
      if (ch === "[") d += 1
      if (ch === "]") d -= 1
      best = Math.max(best, d)
    }
    return best
  })()
  const multi = /[0-9]{2}/.test(nums.join(""))
  const outside = nums.some((c, i) => /[a-z]/.test(c) && !nums.slice(0, i).includes("["))
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((c, i) => [i, /[0-9]/.test(c) ? "anchor" : c === "[" || c === "]" ? "focus" : "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "decodes to", value: out }],
    answer: out,
    corner:
      depth >= 2
        ? "nested"
        : multi
          ? "multidigit"
          : outside
            ? "loose"
            : undefined,
    note:
      depth >= 2
        ? `"${nums.join("")}" decodes to "${out}". The groups here are ${depth} deep, so an inner one must be fully expanded before the group around it can repeat the result — order of completion is inside-out, while reading is left to right.`
        : multi
          ? `"${nums.join("")}" decodes to "${out}". One of these counts has more than one digit, so a digit is not a number: the digits have to be accumulated until the bracket arrives.`
          : outside
            ? `"${nums.join("")}" decodes to "${out}". Some letters sit outside any group at all — they are simply themselves, and anything that assumes every letter belongs to a bracket loses them.`
            : `"${nums.join("")}" decodes to "${out}".`,
  }
}

function* recurse({ nums }: S): Generator<DFrame> {
  let at = 0
  let depth = 0
  const parse = function* (): Generator<DFrame, string> {
    let out = ""
    let number = 0
    while (at < nums.length) {
      const ch = nums[at]
      if (/[0-9]/.test(ch)) {
        number = number * 10 + Number(ch)
        at += 1
      } else if (ch === "[") {
        at += 1
        depth += 1
        yield {
          line: 8,
          marks: upTo(nums.length, at - 1),
          state: [
            { label: "depth", value: depth },
            { label: "built here", value: out || "—" },
          ],
          note: `A '[' after the count ${number}. Call the parser again for what is inside — and this call is now suspended, holding "${out || "nothing"}" and the count ${number} on the stack until the inner one returns.`,
        }
        const inner = yield* parse()
        out += inner.repeat(number)
        number = 0
      } else if (ch === "]") {
        at += 1
        depth -= 1
        yield {
          line: 11,
          marks: upTo(nums.length, at - 1),
          state: [
            { label: "depth", value: depth },
            { label: "returning", value: out || "—" },
          ],
          note: `A ']' — this group is complete. Return "${out}" to the call that is waiting for it, which will repeat it.`,
        }
        return out
      } else {
        out += ch
        at += 1
      }
    }
    return out
  }
  const answer = yield* parse()
  yield {
    line: 17,
    answer,
    state: [{ label: "decoded", value: answer }],
    note: `"${answer}". The nesting is expressed perfectly — each group is a call — but the suspended state lives on the call stack where it cannot be seen, and the reading position has to be threaded through every return.`,
  }
}

function* stack({ nums }: S): Generator<DFrame> {
  const counts: number[] = []
  const texts: string[] = []
  let current = ""
  let number = 0
  for (let i = 0; i < nums.length; i++) {
    const ch = nums[i]
    if (/[0-9]/.test(ch)) {
      number = number * 10 + Number(ch)
      yield {
        line: 6,
        marks: upTo(nums.length, i),
        state: [
          { label: "count so far", value: number },
          { label: "building", value: current || "—" },
        ],
        note: `'${ch}' is a digit, so fold it into the count: ${number}. Nothing happens until the '[' arrives — a count may be several digits long.`,
      }
    } else if (ch === "[") {
      counts.push(number)
      texts.push(current)
      number = 0
      current = ""
      yield {
        line: 9,
        marks: upTo(nums.length, i),
        state: [
          { label: "set aside", value: counts.length },
          { label: "building", value: "—" },
        ],
        note: `A '[' — set the count ${counts[counts.length - 1]} and the text "${texts[texts.length - 1] || "nothing"}" aside, and start building fresh. ${counts.length} group${counts.length === 1 ? "" : "s"} now suspended, and they will be resumed newest first.`,
      }
    } else if (ch === "]") {
      const times = counts.pop()!
      const prefix = texts.pop()!
      const inner = current
      current = prefix + inner.repeat(times)
      yield {
        line: 12,
        marks: upTo(nums.length, i),
        state: [
          { label: "set aside", value: counts.length },
          { label: "building", value: current },
        ],
        note: `A ']' — this group holds "${inner}"; repeat it ${times} time${times === 1 ? "" : "s"} and glue it onto "${prefix || "nothing"}", the text set aside when it opened. Building: "${current}".`,
      }
    } else {
      current += ch
      yield {
        line: 14,
        marks: upTo(nums.length, i),
        state: [
          { label: "set aside", value: counts.length },
          { label: "building", value: current },
        ],
        note: `'${ch}' is an ordinary letter — append it. It belongs to whichever group is currently open, or to no group at all if none is.`,
      }
    }
  }
  yield {
    line: 15,
    answer: current,
    state: [{ label: "decoded", value: current }],
    note: `"${current}". One left-to-right pass, no backtracking, and the suspended work is a list you can look at: one entry per open bracket, resumed newest first.`,
  }
}

export const decodeString = deriveJourney<string>(problem, {
  slug: "expand-the-encoding",
  subtitle: "where the suspended work lives",
  reveals: ["stack"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer encoding" },
  presets: {
    example: { label: "the example", nums: [..."3[a]2[bc]"] },
    nested: {
      label: "a group inside a group",
      nums: [..."3[a2[c]]"],
      info: "the inner one expands first",
    },
    multidigit: {
      label: "a count with two digits",
      nums: [..."12[ab]"],
      info: "a digit is not a number",
    },
    loose: {
      label: "letters outside any group",
      nums: [..."ab3[cd]ef"],
      info: "they are simply themselves",
    },
    plain: {
      label: "no groups at all",
      nums: [..."abcd"],
      info: "nothing to expand",
    },
    long: { label: "a longer encoding", nums: [..."2[a3[bc]d]e"] },
  },
  edges: [
    {
      key: "nested",
      name: "a group inside a group",
      example: '"3[a2[c]]" → "accaccacc"',
      why: "The inner group must be fully expanded before the outer one repeats it. Whatever holds the outer group's half-built text has to survive the inner group being processed in the middle of it.",
      think: "When you meet a second '[' before the first ']', what happens to the text you were building?",
      preset: "nested",
      constraint: 2,
    },
    {
      key: "multidigit",
      name: "a count with more than one digit",
      example: '"12[ab]" → "ababababababababababababab"',
      why: "A digit is not a count. Reading '1' as one and then '2' as two gives a completely different string, so digits have to accumulate until the bracket arrives.",
      think: "When do you stop reading digits and decide the count?",
      preset: "multidigit",
      constraint: 1,
    },
    {
      key: "loose",
      name: "letters outside any group",
      example: '"ab3[cd]ef" → "abcdcdef"',
      why: "Letters may sit before or after a group with no count attached at all. Anything that assumes every letter belongs to a bracket quietly loses them.",
      think: "Where do letters go when no group is open?",
      preset: "loose",
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
        "given: a string of letters, digits and brackets",
        "k[text] means: repeat text k times",
        "groups may NEST, and letters may sit outside them",
        "task: return the expanded string",
      ],
      tools: [
        {
          name: "String as a row of characters",
          role: "read strictly left to right, but FINISHED inside-out: an inner group completes before the group that contains it.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "a count may be several digits, so digits accumulate until the bracket",
        "an inner group must be fully expanded before its enclosing group repeats it",
        "letters outside any group are simply themselves",
        "reading order and completion order are not the same, which is the whole shape of the problem",
      ],
      quiz: [
        {
          q: 'In "3[a2[c]]", which group finishes first?',
          choices: ["the outer one, since it opened first", "the inner one"],
          answer: 1,
          explain:
            "The inner group's result is what the outer one repeats, so it has to be complete first. Last opened, first closed — that ordering is the clue to the structure.",
        },
      ],
      run: story,
    },
    {
      key: "recurse",
      name: "A call per group",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Parse with a function that reads a count, an opening bracket, the group inside it, and the closing bracket — calling itself for each nested group.",
      takeaways: [
        "the nesting maps exactly onto the calls: an inner group is an inner call",
        "each suspended group's half-built text sits on the call stack, invisible",
        "and the reading position has to be threaded out through every return",
      ],
      quiz: [
        {
          q: "What is holding the outer group's half-built text while the inner one is parsed?",
          choices: ["a variable in the outer call, kept alive on the call stack", "nothing — it is rebuilt afterwards"],
          answer: 0,
          explain:
            "Every suspended call is a frame holding exactly that. The structure is right; it is just somewhere you cannot inspect.",
        },
      ],
      run: recurse,
    },
    {
      key: "stack",
      name: "Set aside, and resume newest first",
      short: "one pass, nothing hidden",
      insight:
        "Every suspended group holds the same two things — the text built so far and the count in front of it — and they are always resumed in the reverse of the order they were suspended. That is a stack, so keep one explicitly rather than borrowing the call stack for it.",
      idea: problem.whyNow!,
      takeaways: [
        "on '[': push the count and the text so far, then start building fresh",
        "on ']': pop both, repeat what was just built, and glue it onto what was set aside",
        "digits accumulate into a count until the bracket arrives",
        "one left-to-right pass, no backtracking, and the suspended state is visible",
      ],
      quiz: [
        {
          q: "Why is a stack the right structure here rather than a queue?",
          choices: [
            "because it is faster",
            "because groups are resumed in the reverse of the order they were suspended — the innermost finishes first",
          ],
          answer: 1,
          explain:
            "Last opened, first closed. That ordering is what a stack is, and it is why the nesting maps onto it exactly.",
        },
      ],
      run: stack,
    },
  ],
})
