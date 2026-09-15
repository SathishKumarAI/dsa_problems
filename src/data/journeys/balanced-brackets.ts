// Balanced Brackets, derived. A row of characters, and a stack drawn in the
// state line as it grows and shrinks.
//
// The point of the ladder here is that "last opened, first closed" is not a
// hint about an implementation — it IS the definition of a stack, so the
// second rung is what the problem statement already said.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/balanced-brackets/index.ts"

type C = Data<string>

const PARTNER: Record<string, string> = { ")": "(", "]": "[", "}": "{" }

/** The reference: is this string well-formed? */
export function isBalanced(chars: string[]) {
  const st: string[] = []
  for (const ch of chars) {
    if (ch in PARTNER) {
      if (st.pop() !== PARTNER[ch]) return false
    } else st.push(ch)
  }
  return st.length === 0
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const show = (st: string[]) => (st.length ? st.join(" ") : "empty")

/** Which index each closer matches, or -1 where the string goes wrong. */
function pairing(chars: string[]) {
  const partner = Array.from({ length: chars.length }, () => -1)
  const st: number[] = []
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (ch in PARTNER) {
      const top = st.pop()
      if (top === undefined || chars[top] !== PARTNER[ch])
        return { partner, bad: i }
      partner[i] = top
      partner[top] = i
    } else st.push(i)
  }
  return { partner, bad: st.length ? st[st.length - 1] : -1 }
}

function* story({ nums }: C): Generator<DFrame> {
  const answer = isBalanced(nums)
  const { partner, bad } = pairing(nums)
  yield {
    hold: 3,
    noChips: true,
    note: "A string of brackets — round, square and curly. Is it well-formed: every opener closed by a closer of the same kind, and closed in the right order?",
  }
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      nums[i] in PARTNER ? "focus" : "anchor"
    ),
    state: [{ label: "length", value: nums.length }],
    note: "Counting is not enough. A string with three openers and three closers can still be wrong — what matters is that each closer answers the MOST RECENT opener still waiting.",
  }
  const unclosed = answer ? -1 : bad >= 0 && !(nums[bad] in PARTNER) ? bad : -1
  yield {
    hold: 3,
    marks: marksOf(nums.length, (i) =>
      answer
        ? partner[i] >= 0
          ? "answer"
          : undefined
        : i === bad
          ? "focus"
          : undefined
    ),
    state: [{ label: "answer", value: String(answer) }],
    answer,
    corner: answer
      ? nums.length === 0
        ? "empty"
        : "nested"
      : unclosed >= 0
        ? "unclosed"
        : "mismatch",
    note: answer
      ? `Well-formed. Every closer answers the opener directly inside it — the pairs nest, they never cross, and that is exactly the property "last opened, first closed" describes.`
      : unclosed >= 0
        ? `Not well-formed: the "${nums[unclosed]}" at position ${unclosed} is never closed. The string can be perfectly matched up to the end and still fail, so reaching the end is not the same as finishing.`
        : `Not well-formed: the "${nums[bad]}" at position ${bad} closes something that is not open, or closes the wrong kind. Two different ways to be wrong, and this is the one that shows up mid-string.`,
  }
}

/** Rung 1 — delete matched pairs until nothing changes. */
function* deletePairs({ nums }: C): Generator<DFrame> {
  let s = nums.join("")
  let passes = 0
  let reads = 0
  yield {
    line: 1,
    marks: {},
    state: [{ label: "string", value: s || "empty" }],
    note: 'A well-formed string always contains an adjacent pair like "()" somewhere. Delete every such pair and repeat — if the string ends up empty it was balanced.',
  }
  for (;;) {
    const before = s
    passes++
    reads += s.length * 3
    s = s.replace(/\(\)/g, "").replace(/\[\]/g, "").replace(/\{\}/g, "")
    if (s === before) break
    yield {
      line: 4,
      marks: {},
      state: [
        { label: "pass", value: passes },
        { label: "left", value: s || "empty" },
      ],
      note: `Pass ${passes} removes the adjacent pairs and leaves "${s || "nothing"}". Every deletion can create a new adjacent pair somewhere else, so the whole string has to be scanned again from the start.`,
    }
  }
  const answer = isBalanced(nums)
  yield {
    line: 5,
    answer,
    marks: {},
    state: [
      { label: "answer", value: String(answer) },
      { label: "passes", value: passes },
      { label: "characters read", value: reads },
    ],
    corner: answer ? undefined : "mismatch",
    note: `${answer} — "${s || "nothing"}" is what would not dissolve. Correct, and the cost is the giveaway: ${passes} ${passes === 1 ? "pass" : "passes"} over the string, because a deletion in the middle can only be noticed by looking at everything again. A chain of 5,000 nested brackets costs 5,000 scans.`,
  }
}

/** Rung 2 — one pass, and a stack of what is still open. */
function* stackPass({ nums }: C): Generator<DFrame> {
  const st: string[] = []
  const open: number[] = []
  const matched: number[] = []
  yield {
    line: 2,
    marks: {},
    state: [{ label: "stack", value: "empty" }],
    note: 'Nothing open yet. The stack will hold exactly the openers still waiting for a partner — which is the same list "last opened, first closed" is talking about.',
  }
  for (let i = 0; i < nums.length; i++) {
    const ch = nums[i]
    if (ch in PARTNER) {
      const top = st.pop()
      const from = open.pop()
      if (top !== PARTNER[ch]) {
        yield {
          line: 6,
          answer: false,
          marks: marksOf(nums.length, (k) =>
            k === i ? "focus" : matched.includes(k) ? "dim" : undefined
          ),
          state: [
            { label: "closer", value: ch },
            { label: "expected", value: top ? PARTNER[ch] : "nothing is open" },
          ],
          corner: top ? "mismatch" : "early",
          note: top
            ? `"${ch}" at position ${i} wants "${PARTNER[ch]}" to be the most recent opener, and it is "${top}". Wrong kind — the pairs would have to cross, and crossing is exactly what nesting forbids.`
            : `"${ch}" at position ${i} closes something, and nothing is open. The stack being empty is not a special case to guard against; it is one of the two ways this string can be wrong.`,
        }
        return
      }
      matched.push(i, from!)
      yield {
        line: 5,
        marks: marksOf(nums.length, (k) =>
          k === i || k === from
            ? "answer"
            : matched.includes(k)
              ? "dim"
              : undefined
        ),
        state: [
          { label: "closed", value: `${top}${ch}` },
          { label: "stack", value: show(st) },
        ],
        note: `"${ch}" matches the "${top}" opened at position ${from}. That pair is settled and can be forgotten entirely — which is why a stack is enough state and a full record of the string is not.`,
      }
    } else {
      st.push(ch)
      open.push(i)
      yield {
        line: 8,
        marks: marksOf(nums.length, (k) =>
          k === i
            ? "focus"
            : open.includes(k)
              ? "anchor"
              : matched.includes(k)
                ? "dim"
                : undefined
        ),
        state: [
          { label: "opened", value: ch },
          { label: "stack", value: show(st) },
        ],
        corner: st.length >= 3 ? "nested" : undefined,
        note:
          st.length >= 3
            ? `"${ch}" opens, and ${st.length} are now waiting: ${show(st)}. Deep nesting costs nothing here — the stack simply grows — and it is the case that made the deleting version rescan the string over and over.`
            : `"${ch}" opens and goes on the stack. Nothing is decided yet; an opener is a promise that something later has to keep.`,
      }
    }
  }
  const answer = isBalanced(nums)
  yield {
    line: 9,
    answer,
    marks: marksOf(nums.length, (k) => (open.includes(k) ? "focus" : "dim")),
    state: [
      { label: "stack at the end", value: show(st) },
      { label: "answer", value: String(answer) },
    ],
    corner: answer ? (nums.length === 0 ? "empty" : undefined) : "unclosed",
    note: answer
      ? `The stack is empty, so every opener was answered: ${answer}. One pass, and the memory held was the deepest nesting rather than the whole string.`
      : `The scan reached the end with ${st.length} ${st.length === 1 ? "opener" : "openers"} still waiting — ${show(st)}. Nothing went wrong DURING the pass, which is why the check after it matters: running out of string is not the same as being finished.`,
  }
}

export const balancedBrackets = deriveJourney<string>(problem, {
  slug: "last-opened-first-closed",
  subtitle: "a stack is not a trick here — it is the definition, written down",
  reveals: ["stack"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length > 0 && nums.every((c) => "()[]{}".includes(c))
      ? { ok: true }
      : { ok: false, warning: "only the six characters ( ) [ ] { }" }
  },
  presets: {
    example: {
      label: "the example",
      nums: [..."([{}])"],
      info: "well-formed, and nested",
    },
    mismatch: {
      label: "the wrong kind of closer",
      nums: [..."(]"],
      info: "closes the wrong opener",
    },
    unclosed: {
      label: "an opener left over",
      nums: [..."(("],
      info: "nothing goes wrong until the end",
    },
    early: {
      label: "a closer with nothing open",
      nums: [...")("],
      info: "wrong at the first character",
    },
    nested: {
      label: "deeply nested",
      nums: [..."((((()))))"],
      info: "the stack grows to five",
    },
    flat: {
      label: "side by side, not nested",
      nums: [..."()[]{}"],
      info: "the stack never holds two",
    },
    crossed: {
      label: "pairs that cross",
      nums: [..."([)]"],
      info: "each kind is balanced, the order is not",
    },
    long: {
      label: "a longer string",
      nums: [..."{[()()]}([{}]){}"],
      info: "sixteen characters",
    },
  },
  edges: [
    {
      key: "mismatch",
      name: "a closer of the wrong kind",
      example: '"([)]" → false, though the counts are perfect',
      why: "Each kind of bracket is balanced here and the string is still wrong, because the pairs cross. Counting brackets — even counting each kind separately — accepts this string, which is why the ORDER has to be checked rather than the totals.",
      think: "Would your solution accept a string where every count is right?",
      preset: "crossed",
      constraint: 2,
    },
    {
      key: "unclosed",
      name: "an opener that is never closed",
      example: '"(" → false',
      why: "Nothing goes wrong during the scan: every closer that appears is correct. The failure is what is LEFT at the end, so a version that returns true on reaching the end without incident is wrong on the simplest possible input.",
      think: "What do you check after the loop finishes?",
      preset: "unclosed",
      constraint: 2,
    },
    {
      key: "early",
      name: "a closer with nothing open",
      example: '")(" → false at the first character',
      why: "The stack is empty when a closer arrives. Popping without checking either crashes or returns something that compares equal to nothing — and the second is worse, because it answers true on a string that is plainly wrong.",
      think: "What does your pop do on an empty stack?",
      preset: "early",
      constraint: 2,
    },
    {
      key: "nested",
      name: "deep nesting",
      example: '"((((()))))" → true, with five waiting at once',
      why: "The stack is as deep as the nesting, which is the honest memory cost of this problem. It is also the shape that makes the deleting approach quadratic: one pair dissolves per pass.",
      think:
        "How much does your solution hold at once on a chain of 5,000 openers?",
      preset: "nested",
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
        "given: a string of ( ) [ ] { } and nothing else",
        "every opener must be closed by a closer of the SAME kind",
        "and closed before anything opened before it",
        "task: return whether the string is well-formed",
      ],
      tools: [
        {
          name: "A row of characters",
          role: "read left to right, once. What has to be remembered as it goes is not the string but the openers still waiting — and that is a much smaller thing.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "counting brackets is not enough — a string with perfect counts can still cross",
        "a closer answers the most recent unclosed opener, never an older one",
        "there are two ways to fail: wrong closer mid-string, and openers left over at the end",
      ],
      quiz: [
        {
          q: 'Is "([)]" well-formed? Every kind appears exactly twice.',
          choices: [
            "yes — the counts are balanced",
            "no — the pairs cross, and nesting forbids that",
          ],
          answer: 1,
          explain:
            "This is the input that separates counting from checking. The counts say nothing about order.",
        },
      ],
      run: story,
    },
    {
      key: "delete",
      name: "Rub out the pairs",
      short: "the honest one",
      from: "delete",
      insight: "",
      idea: 'Repeatedly delete every adjacent matching pair — "()", "[]", "{}" — until the string stops changing. If nothing is left, it was balanced.',
      takeaways: [
        "it uses a real property: a well-formed string always contains an adjacent pair",
        "each deletion can create a new pair elsewhere, so the whole string is scanned again",
        "and deeply nested input dissolves one pair per pass, which is quadratic",
      ],
      run: deletePairs,
    },
    {
      key: "stack",
      name: "Remember what is still open",
      short: "one pass",
      insight:
        "Deleting pairs rescans the whole string after every deletion — and each rescan is looking for something the previous pass already walked past.",
      idea: problem.approach,
      takeaways: [
        '"last opened, first closed" is the definition of a stack, so this rung is the problem statement written as code',
        "a matched pair can be forgotten immediately, which is why a stack is enough and the string is not needed",
        "an empty stack on a closer is one failure; a non-empty stack at the end is the other",
        "one pass, and the memory held is the deepest nesting rather than the length",
      ],
      quiz: [
        {
          q: "Why can a matched pair be discarded the moment it is closed?",
          choices: [
            "to save memory",
            "because nothing later in the string can refer to it — it is settled, and only unclosed openers can still be wrong",
          ],
          answer: 1,
          explain:
            "That is what makes the stack sufficient. The only state with a future is the list of promises not yet kept.",
        },
      ],
      run: stackPass,
    },
  ],
})
