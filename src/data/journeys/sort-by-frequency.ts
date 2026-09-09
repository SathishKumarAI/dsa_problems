// Sort Characters by How Often They Appear, derived. The row is the string,
// as characters.
//
// The ladder does not climb in cost — both rungs are the same tally plus the
// same k log k — and the recap says so. The heap is here because it is the
// shape that generalises to "the top k without ordering the rest", which is
// the thing worth taking away. The tie-break is the part that is load-bearing
// in both.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/heaps/sort-by-frequency.ts"

type S = Data<string>

const countsOf = (chars: string[]) => {
  const counts = new Map<string, number>()
  for (const c of chars) counts.set(c, (counts.get(c) ?? 0) + 1)
  return counts
}

/** Falling count, then the character itself — so there is one right answer. */
const ranked = (counts: Map<string, number>) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))

/** The reference: the string rearranged by falling frequency. */
export function byFrequency(chars: string[]) {
  return ranked(countsOf(chars))
    .map(([ch, n]) => ch.repeat(n))
    .join("")
}

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

/** The tally: character over count. */
const tally = (
  pairs: [string, number][],
  label: string,
  mark?: (ch: string) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  pairs.forEach(([ch], i) => {
    const m = mark?.(ch)
    if (m) marks[`1,${i}`] = m
  })
  return {
    cells: [pairs.map(([ch]) => ch), pairs.map(([, n]) => n)] as (
      number | string
    )[][],
    marks,
    label,
  }
}

function* story({ nums }: S): Generator<DFrame> {
  const counts = countsOf(nums)
  const answer = byFrequency(nums)
  const order = ranked(counts)
  const tied = order.filter(([, n]) => n === order[0][1]).length > 1
  yield {
    hold: 3,
    noChips: true,
    note: "A string. Rearrange it so the characters that appear most often come first — and keep every copy, so the result is a rearrangement rather than a summary.",
  }
  yield {
    hold: 3,
    row: nums,
    marks: marksOf(nums.length, (i) =>
      counts.get(nums[i]) === order[0][1] ? "focus" : "dim"
    ),
    state: [
      { label: "characters", value: nums.length },
      { label: "distinct", value: counts.size },
    ],
    note: "The lit characters are the most frequent. Counting is the easy half; the whole question is what to do with the counts once you have them — and what to do when two of them are equal.",
  }
  yield {
    hold: 3,
    grid: tally(order, answer, () => "answer"),
    answer,
    corner: tied
      ? "ties"
      : counts.size === 1
        ? "one"
        : counts.size === nums.length
          ? "allsame"
          : "keepall",
    note: tied
      ? `"${answer}". Two characters appear the same number of times, so something has to break the tie — here the character itself does, which is what makes the answer unique. Leave it to the structure and two correct-looking programs disagree.`
      : counts.size === 1
        ? `One distinct character, so the answer is the string itself: "${answer}". Nothing to order.`
        : `"${answer}" — every copy kept, in falling order of how often each character appears.`,
  }
}

/** Rung 1 — sort the counted pairs. */
function* sortPairs({ nums }: S): Generator<DFrame> {
  const counts = countsOf(nums)
  yield {
    line: 3,
    grid: tally([...counts.entries()], "counted, unordered"),
    state: [{ label: "distinct", value: counts.size }],
    note: "One pass gives every character its count. Every version here starts the same way — what differs is what happens next.",
  }
  const order = ranked(counts)
  yield {
    line: 4,
    grid: tally(order, "sorted: falling count, then character", () => "focus"),
    state: [
      { label: "order", value: order.map(([c, n]) => `${c}×${n}`).join(" ") },
      {
        label: "comparisons",
        value: `~${Math.ceil(counts.size * Math.log2(Math.max(2, counts.size)))}`,
      },
    ],
    corner:
      order.filter(([, n]) => n === order[0][1]).length > 1
        ? "ties"
        : undefined,
    note: `Sorted by falling count, and by the character when counts are equal. That second key is not decoration — without it the order among equal counts depends on whatever the sort happened to do, and the answer stops being unique.`,
  }
  const answer = byFrequency(nums)
  let out = ""
  for (const [ch, n] of order) {
    out += ch.repeat(n)
    yield {
      line: 7,
      row: [...out],
      marks: marksOf(out.length, () => "answer"),
      state: [
        { label: "emitting", value: `${ch} × ${n}` },
        { label: "so far", value: out },
      ],
      note: `"${ch}" appears ${n} ${n === 1 ? "time" : "times"}, so it is written ${n} ${n === 1 ? "time" : "times"}. The count is not a label on the output — it IS how many characters come out.`,
    }
  }
  yield {
    line: 8,
    answer,
    row: [...answer],
    marks: marksOf(answer.length, () => "answer"),
    state: [
      { label: "answer", value: answer },
      { label: "length", value: answer.length },
    ],
    corner: countsOf(nums).size === nums.length ? "allsame" : "keepall",
    note: `"${answer}" — the same ${answer.length} characters as the input, in a different order. Correct, and the whole list of distinct characters was ordered to produce it.`,
  }
}

/** Rung 2 — a heap, popped until it is empty. */
function* heapPops({ nums }: S): Generator<DFrame> {
  const counts = countsOf(nums)
  const heap = [...counts.entries()]
  let out = ""
  let pops = 0
  yield {
    line: 7,
    grid: tally(heap, "a heap of (count, character)", () => "focus"),
    state: [{ label: "in the heap", value: heap.length }],
    note: "Every (count, character) pair goes into a heap ordered by FALLING count, and by the character when counts are equal. The tie-break lives in the ordering itself rather than in a comparison afterwards.",
  }
  while (heap.length) {
    heap.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    const [ch, n] = heap.shift()!
    pops++
    const tiedWith = heap.filter(([, k]) => k === n).map(([c]) => c)
    out += ch.repeat(n)
    yield {
      line: 11,
      grid: tally([[ch, n], ...heap], `popped ${ch} × ${n}`, (c) =>
        c === ch ? "answer" : tiedWith.includes(c) ? "focus" : undefined
      ),
      state: [
        { label: "popped", value: `${ch} × ${n}` },
        { label: "so far", value: out },
        { label: "left in the heap", value: heap.length },
      ],
      corner: tiedWith.length ? "ties" : undefined,
      note: tiedWith.length
        ? `"${ch}" comes out with ${n}, and ${tiedWith.map((c) => `"${c}"`).join(", ")} ${tiedWith.length === 1 ? "has" : "have"} the same count. The character decides, so "${ch}" goes first — deterministically, in every language, which is exactly what the second key buys.`
        : `The largest count in the heap is ${n}, so "${ch}" comes out and is written ${n} ${n === 1 ? "time" : "times"}. Nothing below it in the heap has been ordered against anything else yet.`,
    }
  }
  const answer = byFrequency(nums)
  yield {
    line: 12,
    answer,
    row: [...answer],
    marks: marksOf(answer.length, () => "answer"),
    state: [
      { label: "answer", value: answer },
      { label: "pops", value: pops },
      { label: "distinct characters", value: counts.size },
    ],
    corner: counts.size === 1 ? "one" : "keepall",
    note: `"${answer}", in ${pops} ${pops === 1 ? "pop" : "pops"}. The same cost as sorting, for the same input — and the reason to know this shape is what it does NOT need: stopping after three pops gives the three most frequent characters without ever ordering the rest, which a sort cannot offer.`,
  }
}

export const sortByFrequency = deriveJourney<string>(problem, {
  slug: "most-first-and-a-rule-for-ties",
  subtitle: "the tie-break is what makes the answer one answer",
  reveals: ["heaps"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  classify: (d) => {
    const nums = d.nums as string[]
    return nums.length > 0 && nums.every((c) => /^[A-Za-z0-9]$/.test(c))
      ? { ok: true }
      : {
          ok: false,
          warning: "letters and digits only, at least one character",
        }
  },
  presets: {
    example: { label: "the example", nums: [..."tree"], info: '"eert"' },
    ties: {
      label: "two characters tie",
      nums: [..."cccaaa"],
      info: "the character breaks it",
    },
    one: { label: "one character repeated", nums: [..."aaaa"], info: '"aaaa"' },
    allsame: {
      label: "every character once",
      nums: [..."dcba"],
      info: "a full tie, so alphabetical",
    },
    keepall: {
      label: "copies are kept",
      nums: [..."aabbbcc"],
      info: "seven in, seven out",
    },
    digits: {
      label: "letters and digits",
      nums: [..."a1a1b"],
      info: "ordered by count, then character",
    },
    long: {
      label: "a longer string",
      nums: [..."mississippiriver"],
      info: "sixteen characters",
    },
  },
  edges: [
    {
      key: "ties",
      name: "two characters with the same count",
      example: '"cccaaa" → "aaaccc", not "cccaaa"',
      why: "Without an explicit tie-break the order among equal counts is whatever the sort or the heap happened to do, and two correct-looking programs disagree. The character itself is the rule here, which is what makes the answer unique.",
      think:
        "If two counts are equal, what decides which comes first — and is it written down?",
      preset: "ties",
      constraint: 1,
    },
    {
      key: "keepall",
      name: "every copy is kept",
      example: '"aabbbcc" → seven characters out, not three',
      why: "The answer is a rearrangement, so the output is exactly as long as the input. A solution that emits each distinct character once produces a plausible-looking string that is the wrong length.",
      think: "How long should the answer be?",
      preset: "keepall",
      constraint: 0,
    },
    {
      key: "allsame",
      name: "every character appears once",
      example: '"dcba" → "abcd"',
      why: "Every count ties, so the answer is decided entirely by the tie-break — this input tests nothing but that rule. It is the cleanest way to see whether the second key exists at all.",
      think:
        "What does your solution return when no character is more frequent than any other?",
      preset: "allsame",
      constraint: 2,
    },
    {
      key: "one",
      name: "a single distinct character",
      example: '"aaaa" → "aaaa"',
      why: "Nothing to order, and the answer is the input. It is the boundary where a loop that compares each pair against the next, or a heap that assumes at least two entries, has nothing to compare.",
      think:
        "Does anything in your solution assume more than one distinct character?",
      preset: "one",
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
        "given: a string of letters and digits",
        "task: rearrange it so more frequent characters come first",
        "every copy is kept, so the answer is as long as the input",
        "characters with equal counts are ordered by the character itself",
      ],
      tools: [
        {
          name: "The string",
          role: "the row, read once to count. After that the problem is entirely about the counts — which is why the stage switches to a tally.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "counting is the easy half; ordering the counts is the question",
        "every copy is kept, so the output is exactly as long as the input",
        "equal counts need an explicit rule, or the answer is not unique",
      ],
      quiz: [
        {
          q: "Two characters both appear three times. What decides which comes first?",
          choices: [
            "whichever the sort happens to put first",
            "an explicit rule — here the character itself, so the answer is the same everywhere",
          ],
          answer: 1,
          explain:
            "Leaving it to the structure means two correct-looking programs produce different strings, and only one matches the expected output.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Sort the counted pairs",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Tally the characters, sort the pairs by falling count and then by the character, and write each one out as many times as its count.",
      takeaways: [
        "the sort key has two parts, and the second is what makes the answer unique",
        "the count is not a label on the output — it is how many characters are emitted",
        "and it orders every distinct character, which is exactly what the answer needs here",
      ],
      run: sortPairs,
    },
    {
      key: "heap",
      name: "Pop the most frequent, repeatedly",
      short: "the shape that generalises",
      insight:
        "Sorting orders every character, and this answer does need all of them — so this rung is not faster. What it is, is the shape that survives a change in the question.",
      idea: problem.approach,
      takeaways: [
        "the same tally, and the same k log k: on this problem the heap is not a speed-up",
        "the tie-break lives in the heap's ordering, so it applies without a second comparison",
        "and the reason to know it: stopping after k pops gives the top k WITHOUT ordering the rest",
        "which is the version of this question that appears when the alphabet is large or the input is a stream",
      ],
      quiz: [
        {
          q: "The heap is no faster here. Why learn it on this problem?",
          choices: [
            "it is shorter to write",
            "because the same shape answers 'the top k' without ordering everything, and that question is one word away",
          ],
          answer: 1,
          explain:
            "The ladder climbs in generality rather than in speed — and saying so is more useful than pretending the last rung is always the fastest.",
        },
      ],
      run: heapPops,
    },
  ],
})
