// Any Repeat in the Array?, derived. Three rungs that answer the same
// yes/no question and disagree only about what they are willing to pay:
// n² comparisons, an ordering nobody asked for, or n of memory.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import { problem } from "../problems/arrays-hashing/contains-duplicate.ts"

type N = Data<number>

// The first repeat, by exhaustion — the narration quotes its position, so it
// is computed rather than asserted.
export function firstRepeat(nums: number[]) {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const at = seen.get(nums[i])
    if (at !== undefined) return { hit: true, from: at, to: i }
    seen.set(nums[i], i)
  }
  return { hit: false, from: -1, to: -1 }
}

const WIDE = 1_000_000

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "One question, and the answer is a yes or a no: does any value in this row appear more than once? Not which value, not how many times, not where — just whether.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "That is a smaller question than it looks, and the size of it is the whole lesson: an approach that answers a bigger question than you asked has paid for something you are throwing away.",
  }
  const { hit, from, to } = firstRepeat(nums)
  yield {
    hold: 3,
    marks: hit ? { [from]: "anchor", [to]: "focus" } : {},
    state: [{ label: "answer", value: hit ? "true" : "false" }],
    answer: hit,
    corner:
      nums.length === 1
        ? "single"
        : nums.some((v) => Math.abs(v) >= WIDE)
          ? "wide"
          : hit && to <= 1
            ? "early"
            : undefined,
    note:
      nums.length === 1
        ? "One element, and an element cannot repeat itself — false. Worth saying out loud, because a loop that compares each position with the NEXT one has nothing to compare here."
        : nums.some((v) => Math.abs(v) >= WIDE)
          ? `The answer is ${hit ? "true" : "false"}, and look at the values: they are spread across a range far larger than the row is long. Counting how often each value occurs by indexing an array BY that value would need a table with a billion slots to hold ${nums.length} numbers.`
          : hit
            ? `${nums[from]} appears at ${from} and again at ${to}, so the answer is true${to <= 1 ? " — and it was decided by the second element. Everything after it is wasted work for an approach that insists on finishing" : ""}.`
            : "Every value here is distinct, so the answer is false — and false is the expensive answer: it can only be known after reading everything.",
  }
}

function* brute({ nums }: N): Generator<DFrame> {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const same = nums[i] === nums[j]
      yield {
        line: 3,
        marks: { [i]: "anchor", [j]: same ? "answer" : "focus" },
        state: [
          { label: "at", value: i },
          { label: "against", value: j },
        ],
        note: same
          ? `${nums[i]} at ${i} equals ${nums[j]} at ${j}. That is the whole answer — true, and nothing after this matters.`
          : `${nums[i]} against ${nums[j]}: different. ${j === nums.length - 1 ? `Position ${i} is clear; start again from ${i + 1}.` : "Keep comparing."}`,
      }
      if (same) {
        yield { line: 4, answer: true, note: "Return true." }
        return
      }
    }
  }
  yield {
    line: 5,
    answer: false,
    note: `Every one of the ${(nums.length * (nums.length - 1)) / 2} pairs was different, so the answer is false. Notice what it cost: the same value was carried across the whole tail once for every position it could sit in.`,
  }
}

function* sortFirst({ nums }: N): Generator<DFrame> {
  const ordered = [...nums].sort((a, b) => a - b)
  yield {
    line: 1,
    row: ordered,
    hold: 2,
    note: `Sorted: ${ordered.join(", ")}. Two equal values can no longer hide from each other — whatever order they arrived in, they are now neighbours.`,
  }
  for (let i = 1; i < ordered.length; i++) {
    const same = ordered[i] === ordered[i - 1]
    yield {
      line: 3,
      row: ordered,
      marks: { [i - 1]: "anchor", [i]: same ? "answer" : "focus" },
      state: [{ label: "compared", value: `${ordered[i - 1]} · ${ordered[i]}` }],
      note: same
        ? `${ordered[i]} twice in a row. True — and only one comparison per position was needed to see it.`
        : `${ordered[i - 1]} then ${ordered[i]}: different, so nothing equal can be hiding between them.`,
    }
    if (same) {
      yield { line: 4, row: ordered, answer: true, note: "Return true." }
      return
    }
  }
  yield {
    line: 5,
    row: ordered,
    answer: false,
    note: "No two neighbours matched, so the answer is false. One comparison per position — but the ordering that made that possible was never part of the question, and it cost n log n to buy.",
  }
}

function* withSet({ nums }: N): Generator<DFrame> {
  const seen = new Set<number>()
  for (let i = 0; i < nums.length; i++) {
    const known = seen.has(nums[i])
    yield {
      line: 3,
      marks: { [i]: known ? "answer" : "focus" },
      state: [
        { label: "value", value: nums[i] },
        { label: "held", value: seen.size },
      ],
      note: known
        ? `${nums[i]} is already held. True, on element ${i + 1} of ${nums.length}, without touching a single one that comes after it.`
        : `${nums[i]} is new — ${seen.size + 1} value${seen.size ? "s" : ""} held. The question "seen this?" was answered without comparing against any of them one by one.`,
    }
    if (known) {
      yield { line: 4, answer: true, note: "Return true." }
      return
    }
    seen.add(nums[i])
  }
  yield {
    line: 6,
    answer: false,
    state: [{ label: "held", value: seen.size }],
    note: `All ${nums.length} distinct, so false. One pass, one question per element, and the ordering nobody asked for was never built — the price is holding every value at once.`,
  }
}

export const containsDuplicate = deriveJourney(problem, {
  slug: "any-repeat",
  subtitle: "a yes-or-no question, and three prices for the same answer",
  reveals: ["arrays-hashing"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  presets: {
    example: { label: "the example", nums: [1, 2, 3, 1] },
    distinct: {
      label: "all distinct",
      nums: [1, 2, 3, 4],
      info: "the answer nobody can know early",
    },
    single: {
      label: "one element",
      nums: [7],
      info: "nothing to compare it with",
    },
    early: {
      label: "a repeat at the front",
      nums: [4, 4, 9, 2, 8, 1, 3],
      info: "decided by the second element",
    },
    wide: {
      label: "values far apart",
      nums: [1000000000, -1000000000, 7, 0],
      info: "four numbers spread over two billion",
    },
    long: {
      label: "a longer row",
      nums: [12, 5, 9, 20, 3, 17, 8, 14, 1, 11, 6, 19, 2, 15, 9],
    },
  },
  edges: [
    {
      key: "single",
      name: "one element",
      example: "[7] → false",
      why: "A loop that compares each position with the next one runs zero times here — fine — but one that reads nums[i + 1] without checking the bound does not.",
      think: "How many comparisons does a one-element row need, and does your loop make exactly that many?",
      preset: "single",
      constraint: 2,
    },
    {
      key: "wide",
      name: "values far apart",
      example: "[1000000000, -1000000000, 7, 0] → false",
      why: "There are four numbers spread across a range of two billion, so anything that counts occurrences by using the value as an index needs a table of two billion slots to hold four.",
      think: "Does your storage grow with how MANY numbers there are, or with how BIG they are?",
      preset: "wide",
      constraint: 3,
    },
    {
      key: "early",
      name: "the answer arrives immediately",
      example: "[4, 4, 9, 2, 8, 1, 3] → true, on the second element",
      why: "The answer is fully decided after two elements, and any approach that insists on processing the whole row first pays for five it never needed.",
      think: "The moment the answer is known, is there any reason to keep reading?",
      preset: "early",
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
        "given: a row of integers",
        "question: does SOME value occur more than once?",
        "not asked: which value, how often, or where",
        "task: return true or false",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row addressed by position. Two positions holding the same value is the only thing being looked for — the positions themselves are not part of the answer.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is one bit: true or false, never which value or where",
        "true can be known early; false can only be known at the end",
        "an approach that computes more than the question asked has paid for something it throws away",
      ],
      quiz: [
        {
          q: "Which answer can be returned before reading the whole row?",
          choices: ["true", "false", "both"],
          answer: 0,
          explain:
            "One repeat settles it forever, so true can stop early. Ruling out every repeat means reading everything, so false always costs the full row.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Every pair",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Compare each position with every position after it. If any two hold the same value, the answer is true; if none do, it is false.",
      takeaways: [
        "n(n−1)/2 comparisons and no memory beyond the two indices",
        "each value is carried across the whole tail once for every position it might repeat at",
        "it is right, and on 100 000 elements it is five billion comparisons",
      ],
      quiz: [
        {
          q: "The row is [1, 2, 3, 4]. How many comparisons does this make?",
          choices: ["4", "6", "16"],
          answer: 1,
          explain:
            "Every unordered pair of four positions: 4 × 3 / 2 = 6. The count grows with the square of the row.",
        },
      ],
      run: brute,
    },
    {
      key: "sort",
      name: "Put them in order",
      short: "one comparison per position",
      from: 1,
      insight:
        "The nested scan re-reads the entire tail for every element, because two equal values can be arbitrarily far apart. Put the row in order and they cannot: equal values become neighbours, so each position needs to look at exactly one other.",
      idea: "Sort a copy, then walk it once comparing each element with the one before it. Anything that repeats is now adjacent, so a single pass of neighbour comparisons decides it.",
      takeaways: [
        "ordering turns 'somewhere in the tail' into 'immediately beside'",
        "n log n to build an ordering the question never asked for",
        "it destroys the original positions — harmless here, fatal for a problem that has to report where",
      ],
      quiz: [
        {
          q: "Why does sorting make one comparison per position enough?",
          choices: [
            "because sorting removes duplicates",
            "because equal values must end up adjacent once the row is ordered",
          ],
          answer: 1,
          explain:
            "Nothing is removed. Ordering only guarantees that if two values are equal, nothing can sit between them — so the only place a repeat can hide is next door.",
        },
      ],
      run: sortFirst,
    },
    {
      key: "set",
      name: "Ask a set",
      short: "one pass, one question each",
      insight:
        "Sorting bought adjacency, and adjacency was never the question — 'have I seen this before?' was. A structure that answers exactly that, in constant time, skips the ordering entirely and can stop the instant the answer is known.",
      idea: problem.whyNow!,
      takeaways: [
        "answer the question that was asked, not a stronger one that implies it",
        "the early return is not a micro-optimisation: it is the difference between reading two elements and reading 100 000",
        "the price is n of memory — this rung trades space for both of the others' time",
        "this is the hash set, and 'seen before?' is the question it exists to answer",
      ],
      quiz: [
        {
          q: "What does this rung pay that the ordered walk does not?",
          choices: [
            "more comparisons per element",
            "memory proportional to the row",
            "a worse worst case",
          ],
          answer: 1,
          explain:
            "It holds every distinct value at once. That is the trade: linear memory buys a single constant-time question per element and the right to stop early.",
        },
      ],
      run: withSet,
    },
  ],
})
