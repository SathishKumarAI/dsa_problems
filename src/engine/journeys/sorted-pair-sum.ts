// Pair Sum in Sorted Array (LeetCode 167) — journey content: story act +
// three approaches (brute → hash map → converging pointers) as frame
// generators, then the code challenge and the recap. Owns this problem's
// narrative, generators, presets and contract check. Owns no rendering:
// each act's view() returns a StageModel and src/features/journey draws it.
//
// The pedagogy of THIS problem is the promise, not the trick: the array
// arrives sorted and the answer is required in O(1) space, so the hash map —
// the right answer to the unsorted version — is the rung that gets earned and
// then given up. Khamies §5.1.
//
// Pedagogy: no act names a later act (enforced by journeys.test.ts).

import { chipRow, range } from "../chips.ts"
import { entriesOf, hashLayout } from "../hashmap.ts"
import { distinct, randInt } from "../random.ts"
import type { Act, Frame, Journey, StageModel, SumModel } from "../types.ts"

export interface SortedPairData {
  nums: number[]
  target: number
}

type F = Frame<{
  i?: number
  j?: number
  L?: number
  R?: number
  sum?: number
  pair?: number[]
  answer?: number[]
  need?: number
  seen?: [number, number][]
  hit?: boolean
  op?: "get" | "set"
}>

// ---------- the problem's promise ----------

export const isSorted = (nums: number[]) =>
  nums.every((v, i) => i === 0 || nums[i - 1] <= v)

function allPairs(nums: number[], target: number) {
  const pairs: [number, number][] = []
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] + nums[j] === target) pairs.push([i, j])
  return pairs
}

export function classifySortedPair(nums: number[], target: number) {
  if (!isSorted(nums))
    return {
      ok: false,
      warning:
        "Contract broken: this array is not in non-decreasing order. Everything below still runs — watch which approach quietly gives a wrong answer and which one only gets slower.",
    }
  const pairs = allPairs(nums, target)
  if (pairs.length === 1) return { ok: true, pair: pairs[0] }
  if (pairs.length === 0)
    return {
      ok: false,
      warning: `Contract broken: no pair sums to ${target}. Every approach comes home empty-handed — watch how each one decides it is finished.`,
    }
  return {
    ok: false,
    warning: `Contract broken: ${pairs.length} pairs sum to ${target}. "Exactly one solution" is the promise — the approaches may return DIFFERENT (equally valid) pairs depending on where they look first.`,
  }
}

// ---------- generators ----------

function* runStory({ nums, target }: SortedPairData): Generator<F> {
  yield {
    hold: 3,
    noChips: true,
    note: `Why does this problem exist? A library shelves its books by price, cheapest on the left. You have a voucher worth exactly ${target} and must spend it on exactly TWO books — no change given, nothing left over.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The librarian wants the two SHELF POSITIONS, not the two prices, and the desk has no notepad: whatever you work out has to fit in your head. Two details, and both of them decide what you are allowed to build.",
  }
  yield {
    hold: 3,
    note: `The shelf: ${nums.length} prices, and they are in order — cheapest to dearest. That ordering is not decoration, it is a promise, and it is the only thing this problem hands you that the unsorted version does not.`,
  }
  if (!isSorted(nums)) {
    yield {
      hold: 3,
      corner: "unsorted",
      note: "…except this shelf is out of order. The promise is broken. Keep it on screen — it decides which of the approaches below still tells the truth.",
    }
    return
  }
  const pairs = allPairs(nums, target)
  if (pairs.length) {
    const [i, j] = pairs[0]
    yield {
      hold: 3,
      pair: [i, j],
      note: `${nums[i]} + ${nums[j]} = ${target} — this pair exists, and the promise says it is the only one. The game: find it without a notepad, and without asking about every combination.`,
    }
    yield {
      hold: 3,
      pair: [i, j],
      answer: [i, j],
      note: `The answer is the positions [${i}, ${j}], not the prices ${nums[i]} and ${nums[j]}. Say the output out loud before writing code — half the mistakes in this problem are index bookkeeping.`,
    }
  } else {
    yield {
      hold: 3,
      corner: "nosolution",
      note: "…no two books spend the voucher exactly. The promise is broken — watch how each approach decides it has run out of road.",
    }
  }
}

function* runBrute({ nums, target }: SortedPairData): Generator<F> {
  let negShown = false
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const sum = nums[i] + nums[j]
      const neg = !negShown && (nums[i] < 0 || nums[j] < 0)
      if (neg) negShown = true
      yield {
        line: 2,
        i,
        j,
        sum,
        corner: neg ? "negatives" : undefined,
        hold: neg ? 2 : undefined,
        note: `${nums[i]} + ${nums[j]} = ${sum}${sum === target ? " — that is the voucher spent!" : ` — not ${target}, keep asking`}${neg ? ". A negative price is still just a number to add; the arithmetic never cared about the sign, and neither does the ordering" : ""}`,
      }
      if (sum === target) {
        yield {
          hold: 2,
          line: 3,
          i,
          j,
          sum,
          answer: [i, j],
          note: `found at positions [${i}, ${j}]. It works — but notice what it never used: it would have asked exactly the same questions if the shelf had been shuffled.`,
        }
        return
      }
    }
  }
  yield {
    hold: 2,
    line: 4,
    corner: "nosolution",
    note: "every pair asked, none of them hit — the promise was broken",
  }
}

function* runHash({ nums, target }: SortedPairData): Generator<F> {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    const hit = seen.has(need)
    const equal = hit && nums[i] === need
    yield {
      line: 2,
      i,
      need,
      hit,
      seen: [...seen.entries()],
      corner: equal ? "duplicates" : undefined,
      hold: equal ? 2 : undefined,
      note: `at position ${i}, price ${nums[i]} — I need ${need}. ${hit ? `and ${need} is already on the notepad${equal ? `. Two equal prices, and they are different books: the check happens BEFORE this one is written down, so ${nums[i]} can never match itself` : ""}` : "not written down yet"}`,
    }
    if (hit) {
      const at = seen.get(need)!
      yield {
        hold: 2,
        line: 3,
        i,
        need,
        hit: true,
        seen: [...seen.entries()],
        answer: [at, i],
        note: `positions [${at}, ${i}] — one pass, one lookup each. Fast. But look at the notepad: it grew to ${seen.size} entries, and the desk said no notepad.`,
      }
      return
    }
    seen.set(nums[i], i)
    yield {
      line: 4,
      i,
      seen: [...seen.entries()],
      note: `write ${nums[i]} down under position ${i}. The notepad is now ${seen.size} ${seen.size === 1 ? "entry" : "entries"} long — that is the bill for this speed.`,
    }
  }
  yield {
    hold: 2,
    line: 5,
    seen: [...seen.entries()],
    corner: "nosolution",
    note: "walked the whole shelf, nothing matched — the promise was broken",
  }
}

function* runSqueeze({ nums, target }: SortedPairData): Generator<F> {
  let L = 0
  let R = nums.length - 1
  let askedL = false
  let askedR = false
  const broken = !isSorted(nums)
  yield {
    hold: 2,
    line: 0,
    L,
    R,
    corner: broken ? "unsorted" : nums.length === 2 ? "tiny" : undefined,
    note: `one finger on the cheapest book, one on the dearest. No notepad, no copy of the shelf${broken ? ". The shelf is out of order, though, so every deduction below rests on something that is not true — watch it walk past the answer" : nums.length === 2 ? ". n = 2: the two fingers start on the only pair there is" : ""}`,
  }
  while (L < R) {
    const sum = nums[L] + nums[R]
    yield { line: 2, L, R, sum, note: `${nums[L]} + ${nums[R]} = ${sum}` }
    if (sum === target) {
      yield {
        hold: 2,
        line: 3,
        L,
        R,
        sum,
        answer: [L, R],
        note: `positions [${L}, ${R}] — and the desk stayed empty. Two numbers held in your head, nothing written down.`,
      }
      return
    }
    const choices = [
      "the left finger moves right, onto a dearer book",
      "the right finger moves left, onto a cheaper book",
      "both move inward at once",
    ]
    if (sum < target) {
      yield {
        line: 4,
        L,
        R,
        sum,
        predict: askedL
          ? undefined
          : {
              q: `${sum} is LESS than ${target}, and everything left of the right finger is cheaper still. Which finger moves?`,
              choices,
              answer: 0,
            },
        note: `${sum} < ${target}. ${nums[L]} has just been offered the dearest book available and still fell short — nothing left can rescue it, so position ${L} is gone for good.`,
      }
      askedL = true
      L++
    } else {
      yield {
        line: 5,
        L,
        R,
        sum,
        predict: askedR
          ? undefined
          : {
              q: `${sum} is MORE than ${target}, and everything right of the left finger is dearer still. Which finger moves?`,
              choices,
              answer: 1,
            },
        note: `${sum} > ${target}. ${nums[R]} has just been offered the cheapest book available and still overshot — it can never be part of the answer, so position ${R} is gone for good.`,
      }
      askedR = true
      R--
    }
  }
  yield {
    hold: 2,
    line: 6,
    L,
    R,
    corner: broken ? "unsorted" : "nosolution",
    note: broken
      ? "the fingers met with nothing found — and there WAS an answer on this shelf. Every step threw away a position on the strength of an ordering that was not there."
      : "the fingers met — no pair, the promise was broken. Each step discarded one position, so the walk was over in n steps either way.",
  }
}

// ---------- shared view helpers ----------

const eq = (a: number, b: number, sum: number, target: number): SumModel => ({
  a,
  b,
  sum,
  target,
})

function notepad(f: F, target: number): StageModel["panel"] {
  const map = hashLayout(entriesOf(f.seen ?? []), {
    probe: f.need ?? null,
    hit: !!f.hit,
    label: "the notepad — price @ position",
  })
  if (f.need === undefined) return { kind: "hash", map }
  return {
    kind: "need",
    need: f.need,
    hit: !!f.hit,
    target,
    x: target - f.need,
    map,
  }
}

// ---------- acts ----------

const story: Act<SortedPairData, F> = {
  key: "story",
  name: "The Problem",
  short: "start here",
  complexity: "no code yet — just the promise",
  insight: "",
  tools: [
    {
      name: "Sorted array",
      role: "a shelf whose prices only ever go up as you walk right. Everything below is a decision about whether to use that fact or ignore it.",
    },
  ],
  idea: "In plain words: given prices that are already in non-decreasing order and a target, find the TWO positions whose values add to the target. Promises: the order holds, exactly one such pair exists, and an element may not pair with itself. One more line in the statement is a bill rather than a promise — you must answer in constant extra space.",
  code: {
    pseudo: [
      "given: nums (non-decreasing) and a target",
      "promise: exactly one pair sums to target",
      "constraint: O(1) extra space — no copy, no table",
      "task: return the two positions",
    ],
  },
  hints: [
    'Reread the statement and mark every promise separately. "Sorted" is one. "Exactly one solution" is another. "Constant extra space" is not a promise at all — it is a bill you have to pay.',
    "Formalize it: input = a non-decreasing array of integers and a target; output = the two positions whose values add to the target. Now ask which of those promises a solution for an UNSORTED array would use. None of them — that gap is the whole problem.",
    "Bring three inputs before any code: the smallest legal one (n = 2), a plain one, and a corner one — two equal prices, negatives around a target of 0, a shelf that is not actually in order. Load one below and watch.",
  ],
  takeaways: [
    "the answer is positions, not prices — index bookkeeping is half of this problem",
    '"sorted" is information handed to you for free; ignoring it is a choice with a price',
    "constant extra space is stated in the problem, so anything that builds a table has already lost a mark",
  ],
  quiz: [
    {
      q: "Which of these does the statement PROMISE about the input?",
      choices: [
        "the values are distinct",
        "the values never decrease as you walk right",
        "the values are all positive",
      ],
      answer: 1,
      explain:
        "Non-decreasing is the promise. Values may repeat and they may be negative — both of those are corner cases waiting to happen.",
    },
    {
      q: "The statement also asks for constant extra space. What does that rule out?",
      choices: [
        "reading the array more than once",
        "building something that grows with n",
        "using a loop at all",
      ],
      answer: 1,
      explain:
        "Constant space is about what you BUILD, not how often you read. A few numbers held aside are free; anything that grows with the input is not.",
    },
  ],
  run: runStory,
  view(f, d) {
    if (f.noChips)
      return { chips: null, panel: { kind: "story", glyph: "📚 → 🎟️ → ❓" } }
    return {
      chips: chipRow(d.nums, {
        focus: f.pair && !f.answer ? f.pair : [],
        answer: f.answer ?? [],
      }),
      panel: { kind: "none" },
    }
  },
}

const brute: Act<SortedPairData, F> = {
  key: "brute",
  name: "Brute Force",
  short: "O(n²)",
  complexity: "O(n²) time · O(1) space",
  insight: "First instinct — ask every pair, and count what it costs.",
  tools: [
    {
      name: "Array only",
      role: "nothing built beside it. It reads the shelf and nothing else, which is why its space bill is already the one the problem demands.",
    },
  ],
  idea: "Take each position in turn and try it against every position to its right. It is correct, it needs no extra space, and it is the honest baseline — but count the questions: about n²/2 of them, and it would ask exactly the same ones if the shelf had been shuffled.",
  code: {
    pseudo: [
      "for i in 0..n-1:",
      "  for j in i+1..n-1:",
      "    if nums[i] + nums[j] == target:",
      "      return [i, j]",
      "return []",
    ],
    python: [
      "for i in range(len(nums)):",
      "    for j in range(i + 1, len(nums)):",
      "        if nums[i] + nums[j] == target:",
      "            return [i, j]",
      "return []",
    ],
    java: [
      "for (int i = 0; i < nums.length; i++)",
      "    for (int j = i + 1; j < nums.length; j++)",
      "        if (nums[i] + nums[j] == target)",
      "            return new int[] {i, j};",
      "return new int[0];",
    ],
    cpp: [
      "for (int i = 0; i < (int)nums.size(); i++)",
      "    for (int j = i + 1; j < (int)nums.size(); j++)",
      "        if (nums[i] + nums[j] == target)",
      "            return {i, j};",
      "return {};",
    ],
  },
  hints: [
    "Why does j start at i + 1 rather than at 0?",
    "Two reasons at once: a book may not pair with itself, and every pair would otherwise be asked about twice.",
    "The line to stare at: for j in i+1..n-1 — that single offset is the whole no-reuse rule.",
  ],
  takeaways: [
    "the baseline is not a failure — every later approach is measured against its question count",
    "its space bill is already O(1), which is the bill this problem cares about",
    "it never reads the ordering, so it would behave identically on a shuffled shelf — that is the weakness to name",
  ],
  quiz: [
    {
      q: "This approach already meets the constant-space requirement. So what is wrong with it?",
      choices: [
        "it can return the wrong pair",
        "it asks about n²/2 pairs, and it ignores the ordering entirely",
        "it needs the array to be in order",
      ],
      answer: 1,
      explain:
        "It is correct and it is cheap in space. The complaint is that it pays full price for information the input was handing it for free.",
    },
  ],
  run: runBrute,
  view(f, d) {
    const chips = chipRow(d.nums, {
      anchor: f.i !== undefined ? [f.i] : [],
      focus: f.j !== undefined ? [f.j] : [],
      answer: f.answer ?? [],
    })
    return {
      chips,
      panel:
        f.sum !== undefined && f.i !== undefined && f.j !== undefined
          ? { kind: "sum", eq: eq(d.nums[f.i], d.nums[f.j], f.sum, d.target) }
          : { kind: "none" },
    }
  },
}

const hash: Act<SortedPairData, F> = {
  key: "hash",
  name: "Hash Map",
  short: "O(n) time, O(n) space",
  complexity: "O(n) time · O(n) space — fast, but it builds something",
  insight:
    "Asking every pair repeats work — what if each book only had to be asked about once?",
  tools: [
    {
      name: "Hash Map",
      role: "a notepad from price to position. It buys the search with MEMORY: one lookup instead of a scan, paid for with an entry per book.",
    },
  ],
  idea: "Walk the shelf once. Standing on a price x, the only thing that can complete it is target − x, so ask the notepad whether that price has already gone past. If it has, you are done; if not, write x down and move on. Check before writing, or a price answers its own question. This is the right answer to the unsorted version of this problem — and it never once looks at the fact that the shelf is in order.",
  code: {
    pseudo: [
      "seen = {}",
      "for i in 0..n-1:",
      "  need = target - nums[i]",
      "  if need in seen: return [seen[need], i]",
      "  seen[nums[i]] = i",
      "return []",
    ],
    python: [
      "seen: dict[int, int] = {}",
      "for i, x in enumerate(nums):",
      "    need = target - x",
      "    if need in seen: return [seen[need], i]",
      "    seen[x] = i",
      "return []",
    ],
    java: [
      "Map<Integer, Integer> seen = new HashMap<>();",
      "for (int i = 0; i < nums.length; i++) {",
      "    int need = target - nums[i];",
      "    if (seen.containsKey(need)) return new int[] {seen.get(need), i};",
      "    seen.put(nums[i], i);",
      "} return new int[0];",
    ],
    cpp: [
      "unordered_map<int, int> seen;",
      "for (int i = 0; i < (int)nums.size(); i++) {",
      "    int need = target - nums[i];",
      "    if (seen.count(need)) return {seen[need], i};",
      "    seen[nums[i]] = i;",
      "} return {};",
    ],
  },
  hints: [
    "What single question do you ask while standing on one price?",
    '"Has the price I still need already walked past?" A map answers that in one lookup instead of a scan.',
    "The line to stare at: if need in seen — it runs BEFORE the write on the next line, which is what stops a price pairing with itself.",
  ],
  takeaways: [
    "one pass, one lookup per book — the question count drops from n²/2 to n",
    "check before storing, or an equal price matches itself",
    "the bill is an entry per book, and this statement says you may not pay it",
  ],
  quiz: [
    {
      q: "Why must the lookup happen before the write?",
      choices: [
        "otherwise the map ends up too large",
        "otherwise a price can pair with itself when the target is twice that price",
        "otherwise the loop never terminates",
      ],
      answer: 1,
      explain:
        "Write first and the notepad already contains the current book, so it answers its own question. Check, then write.",
    },
    {
      q: "What does this approach never use?",
      choices: [
        "the promise that exactly one pair exists",
        "the promise that the prices are in order",
        "the positions of the books",
      ],
      answer: 1,
      explain:
        "It is the solution to the unsorted problem, run on a sorted input. The ordering sits there unused — and the notepad it builds is exactly what the statement told you not to build.",
    },
  ],
  run: runHash,
  view(f, d) {
    return {
      chips: chipRow(d.nums, {
        focus: f.i !== undefined ? [f.i] : [],
        dim: f.i !== undefined ? range(f.i) : [],
        answer: f.answer ?? [],
      }),
      panel: notepad(f, d.target),
    }
  },
}

const squeeze: Act<SortedPairData, F> = {
  key: "squeeze",
  name: "Two Pointers",
  short: "O(n) time, O(1) space",
  complexity: "O(n) time · O(1) space — the interview answer",
  insight:
    "The notepad buys speed with memory the statement forbade. The ordering is still sitting there unused — what does it give away for free?",
  tools: [
    {
      name: "Two indices",
      role: "two numbers held in your head, walking towards each other. No copy of the shelf and no table: the ordering does the eliminating the notepad was paying for.",
    },
  ],
  idea: "Put one finger on the cheapest book and one on the dearest, and read their sum. Too small? The cheap book has just been offered the most expensive partner available and still fell short, so nothing remaining can save it and that position is finished. Too big? The mirror argument retires the dear one. Every comparison discards one position for good, so the walk ends in n steps — and the only things you ever held were two indices.",
  code: {
    pseudo: [
      "L = 0; R = n - 1",
      "while L < R:",
      "  s = nums[L] + nums[R]",
      "  if s == target: return [L, R]",
      "  if s < target: L = L + 1",
      "  else: R = R - 1",
      "return []",
    ],
    python: [
      "L, R = 0, len(nums) - 1",
      "while L < R:",
      "    s = nums[L] + nums[R]",
      "    if s == target: return [L, R]",
      "    if s < target: L += 1",
      "    else: R -= 1",
      "return []",
    ],
    java: [
      "int L = 0, R = nums.length - 1;",
      "while (L < R) {",
      "    int s = nums[L] + nums[R];",
      "    if (s == target) return new int[] {L, R};",
      "    if (s < target) L++;",
      "    else R--;",
      "} return new int[0];",
    ],
    cpp: [
      "int L = 0, R = (int)nums.size() - 1;",
      "while (L < R) {",
      "    int s = nums[L] + nums[R];",
      "    if (s == target) return {L, R};",
      "    if (s < target) L++;",
      "    else R--;",
      "} return {};",
    ],
  },
  hints: [
    "Why is it safe to throw a position away after a single comparison?",
    "Because of what it was compared against. The cheapest book was tried with the dearest partner available; if that fell short, every remaining partner is cheaper still, so it cannot be in any answer.",
    "The line to stare at: if s < target: L = L + 1 — that one line is the whole elimination argument, and it is sound only because the array is in order.",
  ],
  takeaways: [
    "each comparison eliminates one position for good, so n steps cover the whole shelf",
    "nothing is built: two indices are the entire memory bill",
    "the argument rests on the ordering — break that promise and it walks straight past the answer",
  ],
  quiz: [
    {
      q: "The sum is too small. Why is it safe to abandon the LEFT position entirely?",
      choices: [
        "because the left value is the smallest one left",
        "because it was just tried against the largest partner available and still fell short",
        "because the answer is never at the edges",
      ],
      answer: 1,
      explain:
        "Every remaining partner is smaller than the one it just failed with, so no remaining pair using that position can reach the target.",
    },
    {
      q: "Run this on a shelf that is NOT in order. What happens?",
      choices: [
        "it gets slower but stays correct",
        "it can discard the answer and report that none exists",
        "it loops forever",
      ],
      answer: 1,
      explain:
        "The elimination step is a deduction about ordering. Without the ordering the deduction is false, and a position holding the answer can be thrown away — confidently, and silently.",
    },
  ],
  run: runSqueeze,
  view(f, d) {
    const L = f.L ?? 0
    const R = f.R ?? d.nums.length - 1
    return {
      chips: chipRow(d.nums, {
        anchor: [L],
        focus: [R],
        dim: range(d.nums.length).filter((k) => k < L || k > R),
        answer: f.answer ?? [],
      }),
      panel:
        f.sum !== undefined
          ? { kind: "sum", eq: eq(d.nums[L], d.nums[R], f.sum, d.target) }
          : { kind: "none" },
    }
  },
}

// ---------- the challenge ----------

export const SORTED_PAIR_CHALLENGE = {
  fname: "pairSumSorted",
  signature: "function pairSumSorted(nums, target) {",
  starter:
    "// nums is sorted ascending — return the two indices\n// the desk has no notepad: two numbers is the whole budget\nlet L = 0, R = nums.length - 1;\n\n",
  cases: [
    { nums: [1, 3, 6, 9], target: 12, expected: [1, 3] },
    { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
    { nums: [1, 2], target: 3, expected: [0, 1], tag: "smallest legal" },
    { nums: [1, 3, 3, 8], target: 6, expected: [1, 2], tag: "equal prices" },
    {
      nums: [-5, -2, 0, 2, 7],
      target: 0,
      expected: [1, 3],
      tag: "negatives, target 0",
    },
    {
      nums: [1, 4, 8, 20, 44],
      target: 45,
      expected: [0, 4],
      tag: "answer at the extremes",
    },
  ],
  review: [
    {
      q: "Constant extra space: no Map, no Set, no copy of the array",
      check: (c: string) =>
        !/new (Map|Set)\b|\.slice\(|\.sort\(|\bObject\.keys\b/.test(c),
    },
    {
      q: "One walk, not nested loops",
      check: (c: string) => (c.match(/\bfor\b|\bwhile\b/g) || []).length <= 1,
    },
    {
      q: "The two positions stay distinct — the guard is L < R, never L <= R",
      check: (c: string) => {
        if (/<=\s*R\b/.test(c)) return false
        return /L\s*<\s*R|R\s*>\s*L/.test(c) ? true : undefined
      },
    },
    {
      q: "Say the invariant out loud: when you move a pointer, what have you just proved about the position you left behind?",
    },
    {
      q: "Could you re-derive the elimination argument cold tomorrow, without the reference?",
    },
  ],
  big: {
    n: 400,
    make: () => {
      const nums = distinct(400, 1, 5000).sort((a, b) => a - b)
      const i = randInt(0, 398)
      const j = randInt(i + 1, 399)
      return {
        nums,
        target: nums[i] + nums[j],
        expected: [i, j],
        anyPair: true,
      }
    },
  },
  reference:
    "let L = 0, R = nums.length - 1;\n" +
    "while (L < R) {\n" +
    "  const s = nums[L] + nums[R];\n" +
    "  if (s === target) return [L, R];\n" +
    "  if (s < target) L++;\n" +
    "  else R--;\n" +
    "}\nreturn [];",
}

const challenge: Act<SortedPairData, F> = {
  key: "challenge",
  name: "Code It",
  short: "prove it",
  complexity: "your turn — all 6 cases must pass",
  insight:
    "Watching is not writing. The shape is yours when your fingers can produce it.",
  tools: [
    {
      name: "Your call",
      role: "the shelf alone, a notepad, or two fingers. Whatever you reach for is the space bill you are choosing — the scorecard prices it.",
    },
  ],
  idea: "Write the body of pairSumSorted(nums, target) in the editor under the shelf. Your code runs in a sandboxed Worker against the same cases the site tests itself with — the smallest legal input, two equal prices, negatives around a target of 0, and an answer sitting at both extremes. Any working approach passes; only one of them keeps the desk empty.",
  code: { pseudo: squeeze.code.pseudo },
  takeaways: [
    "reproduce the shape from memory — peeking at the reference is allowed, twice is a signal",
    "a solution that builds a table still passes the cases; read which review line it failed",
    "the equal-prices case is where a loop guard of L <= R shows itself",
  ],
  gate: "pass",
  chart: false,
  hints: [
    "Say the plan in one sentence before typing: read the ends, then retire whichever one has just proved it cannot be in the answer.",
    "Two indices, a while loop, three branches: equal → return, too small → move the left one, too big → move the right one.",
    "Skeleton to fill: let L = 0, R = nums.length - 1 → while (L < R) → const s = nums[L] + nums[R] → return / L++ / R--.",
  ],
  nextLabel: "It is green — show me what I earned ▸",
  *run({ nums, target }, ctx) {
    if (!ctx.trace) {
      yield {
        hold: 2,
        line: -1,
        note: "write the function body in the editor below, hit Run tests — or trace it and WATCH your own code walk the shelf",
      }
      return
    }
    const { events, result, error } = ctx.trace
    if (!events.length)
      yield {
        hold: 2,
        note: "your code never touched nums 🤨 — it returned without reading the shelf",
      }
    for (let n = 0; n < events.length; n++) {
      const e = events[n]
      yield {
        i: e.i,
        op: e.op,
        note: `access #${n + 1}: your code ${e.op === "get" ? `read nums[${e.i}] (${e.v})` : `wrote nums[${e.i}] = ${e.v}`}`,
      }
    }
    if (error) {
      yield { hold: 2, note: `then it threw: ${error}` }
      return
    }
    const r = result as number[]
    const ok =
      Array.isArray(r) &&
      r.length === 2 &&
      r[0] !== r[1] &&
      nums[r[0]] + nums[r[1]] === target
    yield {
      hold: 3,
      answer: ok ? [...r].sort((a, b) => a - b) : undefined,
      note: ok
        ? `returned [${r}] — correct, in ${events.length} array accesses. Count them against the shelf length: that ratio IS your approach.`
        : `returned ${JSON.stringify(result)} — not a valid pair for target ${target}. Watch where the walk went wrong.`,
    }
  },
  view(f, d) {
    return {
      chips: chipRow(d.nums, {
        focus: f.op === "get" ? [f.i!] : [],
        anchor: f.op === "set" ? [f.i!] : [],
        answer: f.answer ?? [],
      }),
      panel: { kind: "challenge" },
    }
  },
}

const recap: Act<SortedPairData, F> = {
  key: "recap",
  name: "The Reveal",
  short: "what you earned",
  complexity: "journey complete 🏁",
  insight: "The argument you built has a name — and it outlives this problem.",
  tools: [
    {
      name: "Sorted array",
      role: "the given. Order is information: it lets one comparison speak for many candidates.",
    },
    {
      name: "Hash Map",
      role: "buys the search with MEMORY. The right answer when nothing is promised about order — and the wrong one when the statement bans the table.",
    },
    {
      name: "Two indices",
      role: "buys the same search with the ORDER that was already there. Constant space, because nothing new is built.",
    },
  ],
  idea: "You did not learn one more variant of one problem. You earned a way of reading a statement: every promise in it is a resource, and the fastest correct answer is usually the one that spends the resource you were handed instead of buying it again. Here the resource was the ordering, and paying for it a second time cost O(n) memory the statement had already forbidden.",
  code: {
    pseudo: [
      "what transfers to the next problem:",
      "  1. list the promises separately — sorted, distinct, exactly one",
      "  2. name the brute force and its question count",
      "  3. ask which promise each approach actually spends",
      "  4. converging indices: one comparison, one position retired",
      "  5. read the space bill in the statement before building anything",
    ],
  },
  takeaways: [
    "order is information — one comparison can eliminate a whole side",
    "the fast answer to the unsorted problem can be the wrong answer to the sorted one",
    "constant space is a requirement to read before coding, not a bonus to chase after",
  ],
  chart: false,
  *run() {
    yield {
      hold: 3,
      note: "the squeeze you argued for in act 4 has a name: TWO POINTERS, in its converging form. Here is the scorecard.",
    }
  },
  view(_f, d) {
    const rows = [brute, hash, squeeze].map((a) => ({
      name: a.name,
      built: (a.tools ?? []).map((t) => t.name).join(" + "),
      cost: a.complexity,
      insight: a.insight,
    }))
    return {
      chips: chipRow(d.nums, { answer: range(d.nums.length) }),
      panel: {
        kind: "recap",
        caption: "the journey, side by side — the middle column is the story",
        rows,
        note: "Read the middle column top to bottom. Nobody invented three algorithms here: somebody chose, three times, what to stand beside the same sorted shelf — and the cost followed from the choice, including the one the statement had already ruled out.",
        links: [
          {
            label: "Study the pattern: Two Pointers",
            detail:
              "the shape on its own — converge and chase, beyond this problem",
            href: "#/p/two-pointers",
          },
          {
            label: "Next problem: Triplets Summing to Zero",
            detail:
              "the same squeeze, one dimension harder — and duplicates that fight back",
            href: "#/journey/three-sum",
          },
        ],
      },
    }
  },
}

// ---------- presets and page config ----------

function makeSortedPair(n: number, lo = 1, hi = 60): SortedPairData {
  for (let tries = 0; tries < 40; tries++) {
    const nums = distinct(n, lo, hi).sort((a, b) => a - b)
    const i = randInt(0, nums.length - 2)
    const j = randInt(i + 1, nums.length - 1)
    const target = nums[i] + nums[j]
    if (classifySortedPair(nums, target).ok) return { nums, target }
  }
  return { nums: [1, 3, 6, 9], target: 12 }
}

export const sortedPairSum: Journey<SortedPairData> = {
  slug: "sorted-pair-sum",
  title: "Pair Sum in Sorted Array",
  subtitle:
    "the same question as before, with one promise added — and the fast answer you already know is the wrong one",
  problemId: "sorted-pair-sum",
  leetcode: 167,
  acts: [story, brute, hash, squeeze, challenge, recap],
  resources: [
    {
      label: "LeetCode 167",
      url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    },
    {
      label: "GeeksforGeeks: two pointers technique",
      url: "https://www.geeksforgeeks.org/dsa/two-pointers-technique/",
    },
  ],
  presets: {
    random: { label: "random", make: () => makeSortedPair(randInt(6, 9)) },
    ends: {
      label: "answer at the extremes",
      make: () => {
        const nums = distinct(7, 1, 60).sort((a, b) => a - b)
        return { nums, target: nums[0] + nums[nums.length - 1] }
      },
      info: "The answer is the cheapest book and the dearest one. One approach finds it on its very first question; another grinds through the middle first. Watch the chart.",
    },
    tiny: {
      label: "n = 2 (smallest legal)",
      make: () => ({ nums: [1, 2], target: 3 }),
      info: "n = 2: the only pair there is. The smallest legal input is where an off-by-one in the loop guard shows first.",
    },
    dupes: {
      label: "equal prices (3 + 3)",
      make: () => ({ nums: [1, 3, 3, 8], target: 6 }),
      info: "Two books priced the same, side by side because the shelf is ordered. They are still two different positions — anything that treats a price as an identity has to be careful here.",
    },
    negatives: {
      label: "negatives (target 0)",
      make: () => ({ nums: [-5, -2, 0, 2, 7], target: 0 }),
      info: "Negative prices and a target of 0. Nothing about the ordering changes — negatives sit at the front — but code that assumes values are positive, or reads 0 as nothing-found, breaks here.",
    },
    big: {
      label: "big (n = 20)",
      make: () => makeSortedPair(20, 1, 200),
      info: "n = 20. Same code, twenty prices. Watch the chart: one bar asks about n²/2 pairs while another stays flat at n. That gap is what the notation was trying to tell you.",
    },
    unsorted: {
      label: "shelf out of order (broken promise)",
      make: () => ({ nums: [9, 1, 3, 5], target: 8 }),
      info: "The shelf is NOT in order, and there IS an answer on it. Every approach still runs — one of them now quietly reports that nothing exists.",
    },
    nosolution: {
      label: "no solution (broken promise)",
      make: () => ({ nums: [1, 2, 5, 11], target: 99 }),
    },
  },
  defaultPreset: "random",
  harder: { preset: "big", label: "Take on n = 20 — watch your code scale ▸" },
  params: [{ key: "target", label: "target" }],
  classify: (d) => classifySortedPair(d.nums, d.target),
  describe: (d) => d.nums.join(", "),
  parse: (text, params) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= -999 && v <= 999)
    const target = Number(params.target)
    return nums.length >= 2 && Number.isInteger(target)
      ? { nums, target }
      : null
  },
  challenge: SORTED_PAIR_CHALLENGE,
  reveals: ["two-pointers"],
  sample: { nums: [1, 3, 6, 9], target: 12 },
  edgeCases: [
    {
      key: "tiny",
      name: "smallest legal input",
      example: "[1, 2], target 3 → [0, 1]",
      why: "n = 2 means the two positions you start with are the only pair there is. A loop guard that is off by one — stopping too early, or letting both ends land on the same book — shows up here before anywhere else.",
      think:
        "Bring the smallest legal input first and trace it by hand. This shelf cannot be empty (n ≥ 2 is promised), so n = 2 is the boundary to check.",
      constraint:
        "2 <= numbers.length <= 3 * 10^4 — two elements is the smallest legal input",
      preset: "tiny",
    },
    {
      key: "duplicates",
      name: "two equal prices",
      example: "[1, 3, 3, 8], target 6 → [1, 2]",
      why: "Equal prices sit side by side once the shelf is ordered, and they are still two different positions. Anything that treats a price as an identity — a lookup keyed by value, a comparison that assumes values differ — has to decide what happens when the same number arrives twice.",
      think:
        "Ask what your solution keys on. If it is the value rather than the position, write down what happens when that value appears twice before you run it.",
      constraint:
        "-1000 <= numbers[i] <= 1000 — nothing promises the values are distinct, only that they never decrease",
      preset: "dupes",
    },
    {
      key: "negatives",
      name: "negatives around zero",
      example: "[-5, -2, 0, 2, 7], target 0 → [1, 3]",
      why: "Prices below zero and a target of zero. The ordering is untouched — negatives simply sit at the front — but code that assumes values are positive, or that reads 0 as nothing-found, answers wrongly here.",
      think:
        "Bring a case where the answer or the target is 0, and check every place your code tests a number for truth rather than for presence.",
      constraint:
        "-1000 <= numbers[i] <= 1000 — the range crosses zero, so a target of 0 is legal",
      preset: "negatives",
    },
    {
      key: "nosolution",
      name: "promise broken: no pair at all",
      example: "[1, 2, 5, 11], target 99 → nothing",
      why: "The statement promises exactly one answer exists, so it is tempting to write code that cannot fail to find one. Hand it a shelf where no two prices reach the target and every approach has to decide, in its own way, that it has run out of road — and return something sane rather than whatever the last loop left behind.",
      think:
        "Ask what your function returns when the search ends empty. An empty list is a decision; falling off the end of a function is an accident that looks like one.",
      constraint:
        "exactly one solution exists — a promise, which means the empty case is never tested for you",
      preset: "nosolution",
    },
    {
      key: "unsorted",
      name: "promise broken: out of order",
      example: "[9, 1, 3, 5], target 8 → 3 + 5, at positions 2 and 3",
      why: "The statement promises the prices never decrease. Feed it a shelf that does decrease and the answer is still sitting there — but an approach that discards positions by reasoning about the order throws the answer away and reports that none exists. Confidently, and without an error.",
      think:
        "For every promise in a statement, ask what your solution does when it is false. The dangerous answer is not a crash — it is a wrong answer delivered calmly.",
      constraint:
        "numbers is sorted ascending — the promise this whole problem is built on",
      preset: "unsorted",
    },
  ],
}
