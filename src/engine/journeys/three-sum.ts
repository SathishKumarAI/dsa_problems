// Triplets Summing to Zero (LeetCode 15) — journey content: story act +
// three approaches (brute → anchor + hash → anchor + two pointers) as frame
// generators, then the recap. Owns this problem's narrative, generators,
// presets, corner cases and contract check. Owns no rendering: each act's
// view() returns a StageModel and src/features/journey draws it.
//
// Pedagogy: no act names a later act (enforced by journeys.test.ts). The
// journey leans on Two Sum: fixing one number turns the rest into the pair
// search the learner already earned. Book: Khamies §3.2.2 (3Sum).

import { chipRow, range } from "../chips.ts"
import { entriesOf, hashLayout } from "../hashmap.ts"
import { randInt, shuffled } from "../random.ts"
import type { Act, Frame, Journey, StageModel } from "../types.ts"

export interface ThreeSumData {
  nums: number[]
}

type F = Frame<{
  i?: number
  j?: number
  k?: number
  L?: number
  R?: number
  m?: number
  order?: number[] // sorted view: original index per sorted slot
  s?: number[] // sorted values
  terms?: number[]
  need?: number
  seen?: [number, number][]
  hit?: boolean
  dup?: boolean
  found?: number[][]
  answer?: number[][]
  done?: number // anchors finished (sorted views dim slots < done)
  focus?: number[]
}>

// ---------- the problem's promise ----------

const key = (t: number[]) => t.join(",")
const canon = (a: number, b: number, c: number) =>
  [a, b, c].sort((x, y) => x - y)

export function allTriplets(nums: number[]): number[][] {
  const seen = new Set<string>()
  const out: number[][] = []
  const n = nums.length
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++)
        if (nums[i] + nums[j] + nums[k] === 0) {
          const t = canon(nums[i], nums[j], nums[k])
          if (!seen.has(key(t))) {
            seen.add(key(t))
            out.push(t)
          }
        }
  return out.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
}

export function classifyThreeSum(nums: number[]) {
  if (nums.length < 3)
    return {
      ok: false,
      warning: `Contract broken: ${nums.length} number${nums.length === 1 ? "" : "s"} — a triplet needs three. Every approach returns an empty list without looking.`,
    }
  return { ok: true, triplets: allTriplets(nums) }
}

const sortedView = (nums: number[]) => {
  const order = range(nums.length).sort((a, b) => nums[a] - nums[b])
  return { order, s: order.map((i) => nums[i]) }
}

// ---------- generators ----------

function* runStory({ nums }: ThreeSumData): Generator<F> {
  yield {
    hold: 3,
    noChips: true,
    note: "Why does this problem exist? An auditor gets a ledger of signed amounts — payments, refunds, adjustments — and a tip: some entries cancel out in threes. Find every set of three amounts that nets to exactly zero.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The auditor wants the AMOUNTS, not the row numbers, and no set listed twice — two rows with the same amount are the same evidence. That one rule (unique by value) will shape every solution. Here is the ledger.",
  }
  yield {
    hold: 3,
    note: `${nums.length} amounts. Find every triple that sums to zero; report each distinct triple once, as values.`,
  }
  const trips = allTriplets(nums)
  if (trips.length) {
    const t = trips[0]
    // show one triplet by position (first matching slots)
    const idx: number[] = []
    const pool = [...t]
    nums.forEach((v, i) => {
      const p = pool.indexOf(v)
      if (p > -1 && idx.length < 3) {
        pool.splice(p, 1)
        idx.push(i)
      }
    })
    yield {
      hold: 3,
      focus: idx,
      note: `${t[0]} + ${t[1]} + ${t[2]} = 0 — one triple. ${trips.length === 1 ? "It is the only one here." : `There are ${trips.length} distinct triples in this ledger.`} The game: find them all without trying every combination — and never list one twice.`,
    }
    const dupValue = nums.find((v, i) => nums.indexOf(v) !== i)
    yield {
      hold: 3,
      focus: idx,
      answer: trips,
      corner: dupValue !== undefined ? "dupes" : undefined,
      note:
        dupValue !== undefined
          ? `Notice ${dupValue} appears more than once. Different rows, same amount: any triple built from either copy is the SAME triple. That is the trap this problem is famous for.`
          : "No amount repeats here, so every triple you find by position is automatically distinct. Try the preset with repeated values later — the problem changes character.",
    }
  } else {
    yield {
      hold: 3,
      corner: "none",
      note: "…no three amounts cancel. The answer is the empty list — a legal, common answer that every approach must reach without crashing.",
    }
  }
}

function* runBrute({ nums }: ThreeSumData): Generator<F> {
  const n = nums.length
  const found: number[][] = []
  const seen = new Set<string>()
  let askedDup = false
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const sum = nums[i] + nums[j] + nums[k]
        const hit = sum === 0
        if (!hit) {
          yield {
            line: 4,
            i,
            j,
            k,
            terms: [nums[i], nums[j], nums[k]],
            found: found.map((t) => [...t]),
            note: `${nums[i]} + ${nums[j]} + ${nums[k]} = ${sum} — not zero, next triple`,
          }
          continue
        }
        const t = canon(nums[i], nums[j], nums[k])
        const dup = seen.has(key(t))
        if (!dup) {
          seen.add(key(t))
          found.push(t)
        }
        const allEqual = nums[i] === nums[j] && nums[j] === nums[k]
        yield {
          hold: 2,
          line: 5,
          i,
          j,
          k,
          terms: [nums[i], nums[j], nums[k]],
          hit: true,
          dup,
          found: found.map((t) => [...t]),
          corner: dup
            ? allEqual
              ? "zeros"
              : "dupes"
            : n === 3
              ? "tiny"
              : undefined,
          predict:
            dup && !askedDup
              ? {
                  q: `${nums[i]} + ${nums[j]} + ${nums[k]} = 0 again — same values, different slots. What should happen?`,
                  choices: [
                    "add it — the indices are different",
                    "drop it — this triple is already in the answer",
                    "stop — the answer is complete",
                  ],
                  answer: 1,
                }
              : undefined,
          note: dup
            ? `${nums[i]} + ${nums[j]} + ${nums[k]} = 0 — but [${t}] is already found. Different slots, same values: a REPEAT, dropped. The set of sorted triples is doing the real work here.`
            : `${nums[i]} + ${nums[j]} + ${nums[k]} = 0 — sort the three and record [${t}]${n === 3 ? ". n = 3: one triple to check, and it was the answer" : ""}`,
        }
        if (dup) askedDup = true
      }
  yield {
    hold: 3,
    line: 6,
    found: found.map((t) => [...t]),
    answer: found.map((t) => [...t]),
    corner: found.length === 0 ? "none" : undefined,
    note: found.length
      ? `every triple tried — ${found.length} distinct answer${found.length === 1 ? "" : "s"}. Correct, and n·(n−1)·(n−2)/6 = ${(n * (n - 1) * (n - 2)) / 6} sums for n = ${n}.`
      : `every triple tried — none sums to zero. Return the empty list: the loops fell through and the fallback line spoke.`,
  }
}

function* runHash({ nums }: ThreeSumData): Generator<F> {
  const { order, s } = sortedView(nums)
  const n = s.length
  const found: number[][] = []
  const seenT = new Set<string>()
  let askedSkip = false
  yield {
    hold: 2,
    line: 0,
    order,
    s,
    done: 0,
    found: [],
    note: "sort a copy first — equal amounts become neighbours, so an anchor we have already used is easy to recognise and skip",
  }
  for (let k = 0; k + 2 < n; k++) {
    if (k > 0 && s[k] === s[k - 1]) {
      yield {
        hold: 2,
        line: 2,
        order,
        s,
        k,
        done: k,
        found: found.map((t) => [...t]),
        corner: "dupes",
        predict: askedSkip
          ? undefined
          : {
              q: `The anchor ${s[k]} is the same amount as the previous anchor. What now?`,
              choices: [
                "skip it — every triple it could start was found from the previous anchor",
                "run the pair search again to be safe",
                "stop — no new triples can follow a repeat",
              ],
              answer: 0,
            },
        note: `anchor ${s[k]} equals the previous anchor — every triple it could start was already found. Skip it: that is how repeats are prevented at the anchor level.`,
      }
      askedSkip = true
      continue
    }
    const target = 0 - s[k] // 0 - 0 is +0; -s[k] would be -0 and break equality
    const seen: [number, number][] = []
    yield {
      hold: 2,
      line: 3,
      order,
      s,
      k,
      done: k,
      need: target,
      seen: [],
      found: found.map((t) => [...t]),
      note: `anchor ${s[k]}: the other two must sum to ${target}. That is the pair problem — with a memory of what has been seen`,
    }
    for (let m = k + 1; m < n; m++) {
      const x = s[m]
      const need = target - x
      const hitIdx = seen.find(([v]) => v === need)
      const hit = hitIdx !== undefined
      let dup = false
      if (hit) {
        const t = canon(s[k], need, x)
        dup = seenT.has(key(t))
        if (!dup) {
          seenT.add(key(t))
          found.push(t)
        }
      }
      yield {
        hold: hit ? 2 : undefined,
        line: hit ? 5 : 4,
        order,
        s,
        k,
        m,
        done: k,
        terms: [s[k], x],
        need,
        seen: seen.map((e) => [...e] as [number, number]),
        hit,
        dup,
        found: found.map((t) => [...t]),
        corner: dup ? "dupes" : hit && n === 3 ? "tiny" : undefined,
        note: hit
          ? dup
            ? `at ${x}: need ${need} — seen, but [${canon(s[k], need, x)}] is already in the answer. A repeated amount produced a repeat: dropped.`
            : `at ${x}: need ${need} — SEEN. Record [${canon(s[k], need, x)}]${n === 3 ? " — n = 3: one anchor, one lookup" : ""}`
          : `at ${x}: need ${need} — not seen yet; remember ${x}`,
      }
      // a set: the second copy of an amount adds nothing (and would draw twice)
      if (!seen.some(([v]) => v === x)) seen.push([x, order[m]])
    }
  }
  yield {
    hold: 3,
    line: 7,
    order,
    s,
    done: n,
    found: found.map((t) => [...t]),
    answer: found.map((t) => [...t]),
    corner: found.length === 0 ? "none" : undefined,
    note: found.length
      ? `done — ${found.length} distinct triple${found.length === 1 ? "" : "s"}, n anchors × one pass each. The memory costs O(n) per anchor and the repeats still had to be caught by hand.`
      : "done — no anchor found a pair. Empty list.",
  }
}

function* runTwoPointer({ nums }: ThreeSumData): Generator<F> {
  const { order, s } = sortedView(nums)
  const n = s.length
  const found: number[][] = []
  let askedL = false
  let askedR = false
  yield {
    hold: 2,
    line: 0,
    order,
    s,
    done: 0,
    found: [],
    note: "sort a copy — now ORDER does two jobs: equal amounts sit together (repeats are skippable) and the two ends can squeeze toward a target",
  }
  for (let k = 0; k + 2 < n; k++) {
    if (s[k] > 0) {
      yield {
        hold: 3,
        line: 2,
        order,
        s,
        k,
        done: k,
        found: found.map((t) => [...t]),
        corner: "none",
        note: `anchor ${s[k]} > 0 — everything after it is even larger, so no three can cancel. Stop early. The sort bought this shortcut for free.`,
      }
      break
    }
    if (k > 0 && s[k] === s[k - 1]) {
      yield {
        line: 3,
        order,
        s,
        k,
        done: k,
        found: found.map((t) => [...t]),
        corner: "dupes",
        note: `anchor ${s[k]} repeats the previous anchor — skip; its triples are already found`,
      }
      continue
    }
    let L = k + 1
    let R = n - 1
    yield {
      hold: 2,
      line: 4,
      order,
      s,
      k,
      L,
      R,
      done: k,
      terms: [s[k], s[L], s[R]],
      found: found.map((t) => [...t]),
      note: `anchor ${s[k]}: the other two must sum to ${-s[k]} — squeeze from both ends of the rest`,
    }
    while (L < R) {
      const sum = s[k] + s[L] + s[R]
      yield {
        line: 6,
        order,
        s,
        k,
        L,
        R,
        done: k,
        terms: [s[k], s[L], s[R]],
        found: found.map((t) => [...t]),
        note: `${s[k]} + ${s[L]} + ${s[R]} = ${sum}`,
      }
      const choices = [
        "left pointer → right, onto a bigger amount",
        "right pointer → left, onto a smaller amount",
        "both move inward",
      ]
      if (sum < 0) {
        L++
        yield {
          line: 7,
          order,
          s,
          k,
          L,
          R,
          done: k,
          terms: [s[k], s[L], s[R]],
          found: found.map((t) => [...t]),
          predict: askedL
            ? undefined
            : {
                q: `${sum} is LESS than 0. Which pointer moves, and where?`,
                choices,
                answer: 0,
              },
          note: `${sum} < 0 — too small, the left pointer walks right onto a bigger amount`,
        }
        askedL = true
      } else if (sum > 0) {
        R--
        yield {
          line: 7,
          order,
          s,
          k,
          L,
          R,
          done: k,
          terms: [s[k], s[L], s[R]],
          found: found.map((t) => [...t]),
          predict: askedR
            ? undefined
            : {
                q: `${sum} is MORE than 0. Which pointer moves, and where?`,
                choices,
                answer: 1,
              },
          note: `${sum} > 0 — too big, the right pointer walks left onto a smaller amount`,
        }
        askedR = true
      } else {
        const t = [s[k], s[L], s[R]]
        found.push(t)
        const allEqual = s[k] === s[L] && s[L] === s[R]
        yield {
          hold: 2,
          line: 8,
          order,
          s,
          k,
          L,
          R,
          done: k,
          terms: t,
          hit: true,
          found: found.map((t) => [...t]),
          corner: allEqual ? "zeros" : n === 3 ? "tiny" : undefined,
          note: `${t[0]} + ${t[1]} + ${t[2]} = 0 — record [${t}], then move BOTH pointers: the same left amount cannot pair with a different right amount to the same sum${allEqual ? ". All three equal: legal — one triple may reuse an amount, the OUTPUT may not repeat a triple" : ""}`,
        }
        const l0 = s[L]
        const r0 = s[R]
        L++
        R--
        let skipped = false
        while (L < R && s[L] === l0) {
          L++
          skipped = true
        }
        while (L < R && s[R] === r0) {
          R--
          skipped = true
        }
        if (skipped)
          yield {
            hold: 2,
            line: 8,
            order,
            s,
            k,
            L,
            R,
            done: k,
            terms: L < R ? [s[k], s[L], s[R]] : undefined,
            found: found.map((t) => [...t]),
            corner: "dupes",
            note: `skip past the copies of ${l0} on the left and ${r0} on the right — they would rebuild [${t}]. Repeats are prevented by the walk itself, no set needed.`,
          }
      }
    }
  }
  yield {
    hold: 3,
    line: 9,
    order,
    s,
    done: n,
    found: found.map((t) => [...t]),
    answer: found.map((t) => [...t]),
    corner: found.length === 0 ? "none" : undefined,
    note: found.length
      ? `done — ${found.length} distinct triple${found.length === 1 ? "" : "s"}, no memory beyond the output, no repeat check. Sort once, then n squeezes.`
      : "done — no triple. Empty list.",
  }
}

// ---------- view helpers ----------

function termsPanel(
  f: F,
  map?: ReturnType<typeof hashLayout>
): StageModel["panel"] {
  return {
    kind: "terms",
    terms: f.terms ?? [],
    target: 0,
    need: f.need,
    hit: f.hit,
    dup: f.dup,
    found: f.found ?? [],
    map,
  }
}

const sortedChips = (f: F, d: ThreeSumData, focus: number[]) =>
  chipRow(f.s ?? d.nums, {
    subs: f.order ? f.order.map(String) : null,
    anchor: f.k !== undefined ? [f.k] : [],
    focus,
    dim: f.done !== undefined ? range(Math.min(f.done, f.s?.length ?? 0)) : [],
  })

// ---------- the acts, in learning order ----------

const story: Act<ThreeSumData, F> = {
  key: "story",
  name: "The Problem",
  short: "start here",
  complexity: "no code yet — just the promise",
  insight: "",
  tools: [
    {
      name: "Array",
      role: "a ledger of signed amounts, addressed by row. You have solved 'two that sum to a target' — this asks for three that sum to zero, reported by value, each once.",
    },
  ],
  idea: "In plain words: given integers, return every distinct triple of values that adds to zero. Promises and traps: amounts can repeat; a triple may use the same amount twice ([-1, -1, 2]); the output may not list the same triple twice; the answer may be empty. Values, not indices — the opposite of Two Sum.",
  code: {
    pseudo: [
      "given: nums (signed integers, repeats allowed)",
      "task: every triple of VALUES with a + b + c = 0",
      "rule: no triple listed twice",
      "rule: three different rows — one row cannot be used twice",
    ],
  },
  hints: [
    "Reread the ask. Two Sum wanted indices; this wants VALUES, and it says 'unique triplets'. Say the output for [-1, 0, 1, 2, -1, -4] out loud — how many triples, and why not three?",
    "Formalize it as one question: input = a list of integers; output = the set of distinct sorted triples (a ≤ b ≤ c) with a + b + c = 0. 'Set' is the word that carries the whole difficulty.",
    "Bring three inputs before any code: the smallest legal one (n = 3), the classic one with a repeated amount, and one with no answer at all (all positive). The corner cases listed here are those inputs.",
  ],
  takeaways: [
    "the output is by VALUE and must be unique — repeated amounts are the whole difficulty",
    "one row cannot be used twice, but one amount can appear twice in a triple",
    "an empty answer is legal; every approach needs a fall-through",
  ],
  quiz: [
    {
      q: "Two rows hold −1. Both pair with 0 and 1 to make zero. How many triples go in the answer?",
      choices: [
        "two — the rows differ",
        "one — the values are the same",
        "none — repeats are invalid input",
      ],
      answer: 1,
      explain:
        "Triples are compared by value. Same three amounts, one entry — however many rows produced it.",
    },
    {
      q: "What exactly does the function return?",
      choices: [
        "lists of three indices",
        "lists of three values",
        "the count of triples",
      ],
      answer: 1,
      explain:
        "Values — the opposite of Two Sum. Index bookkeeping is not needed; uniqueness is.",
    },
  ],
  run: runStory,
  view(f, d) {
    if (f.noChips)
      return { chips: null, panel: { kind: "story", glyph: "🧾 → ⚖️ → 0" } }
    return {
      chips: chipRow(d.nums, {
        focus: f.answer ? [] : (f.focus ?? []),
        answer: f.answer ? (f.focus ?? []) : [],
      }),
      panel: f.answer
        ? { kind: "terms", terms: [], target: 0, found: f.answer }
        : { kind: "none" },
    }
  },
}

const brute: Act<ThreeSumData, F> = {
  key: "brute",
  name: "Brute Force",
  short: "O(n³)",
  complexity: "O(n³) time · O(#answers) space",
  insight:
    "Three rows, every combination — and a way to notice when you have seen the same three amounts before.",
  idea: "Three nested loops, i < j < k, so each set of rows is tried once. When the sum is zero, sort the three amounts and put them in a set: the set is what turns 'same values from different rows' into one answer. Correct and obvious — and n³ sums.",
  tools: [
    { name: "Array only", role: "three indices walking every combination." },
    {
      name: "Set of sorted triples",
      role: "the dedup. Sorting the three amounts makes [−1, 2, −1] and [−1, −1, 2] the same key.",
    },
  ],
  code: {
    pseudo: [
      "found = empty set of sorted triples",
      "for i in 0..n-1:",
      "  for j in i+1..n-1:",
      "    for k in j+1..n-1:",
      "      if nums[i] + nums[j] + nums[k] == 0:",
      "        add sorted(nums[i], nums[j], nums[k]) to found",
      "return found as a list",
    ],
    python: [
      "found = set()",
      "for i in range(n):",
      "    for j in range(i + 1, n):",
      "        for k in range(j + 1, n):",
      "            if nums[i] + nums[j] + nums[k] == 0:",
      "                found.add(tuple(sorted((nums[i], nums[j], nums[k]))))",
      "return [list(t) for t in found]",
    ],
    java: [
      "Set<List<Integer>> found = new HashSet<>();",
      "for (int i = 0; i < n; i++)",
      "    for (int j = i + 1; j < n; j++)",
      "        for (int k = j + 1; k < n; k++)",
      "            if (nums[i] + nums[j] + nums[k] == 0) {",
      "                List<Integer> t = new ArrayList<>(List.of(nums[i], nums[j], nums[k])); Collections.sort(t); found.add(t); }",
      "return new ArrayList<>(found);",
    ],
    cpp: [
      "set<vector<int>> found;",
      "for (int i = 0; i < n; i++)",
      "    for (int j = i + 1; j < n; j++)",
      "        for (int k = j + 1; k < n; k++)",
      "            if (nums[i] + nums[j] + nums[k] == 0) {",
      "                vector<int> t = {nums[i], nums[j], nums[k]}; sort(t.begin(), t.end()); found.insert(t); }",
      "return vector<vector<int>>(found.begin(), found.end());",
    ],
  },
  takeaways: [
    "i < j < k tries each set of ROWS once; the set of sorted triples makes each set of VALUES count once",
    "n·(n−1)·(n−2)/6 sums: at n = 1000 that is 166 million",
    "the dedup is not a detail — without it the brute force is WRONG, not just slow",
  ],
  hints: [
    "Watch the found list: when does the same triple try to enter twice, and what stops it?",
    "Three loops give every set of rows exactly once; the set gives every set of values exactly once. Two different 'once's.",
    "Line 5: sort the three before adding — order inside the triple must not create a new key.",
  ],
  quiz: [
    {
      q: "Why sort the three amounts before adding them to the set?",
      choices: [
        "so the output is sorted",
        "so the same three amounts in another order become the same key",
        "sorting is required by the problem",
      ],
      answer: 1,
      explain:
        "[−1, 2, −1] and [−1, −1, 2] are one triple. Sorting inside the triple makes the set see that.",
    },
    {
      q: "How many sums does this try for n = 20?",
      choices: [
        "20 × 20 × 20 = 8000",
        "20 · 19 · 18 / 6 = 1140",
        "20 · 19 / 2 = 190",
      ],
      answer: 1,
      explain:
        "i < j < k means each set of three rows once: C(20, 3) = 1140. Still cubic in n.",
    },
  ],
  run: runBrute,
  view(f, d) {
    return {
      chips: chipRow(d.nums, {
        anchor: f.i !== undefined ? [f.i] : [],
        focus: [f.j, f.k].filter((x): x is number => x !== undefined),
      }),
      panel: termsPanel(f),
    }
  },
}

const hash: Act<ThreeSumData, F> = {
  key: "hash",
  name: "Anchor + Hash",
  short: "O(n²) · O(n)",
  complexity: "O(n²) time · O(n) space",
  insight:
    "Fix ONE amount and the rest is a problem you have already solved: two that sum to a target.",
  idea: "Sort a copy (so equal anchors are neighbours and can be skipped), then for each anchor a run the one-pass pair search on everything after it with target −a: 'have I seen −a − x?'. n anchors × one pass = n². The memory is rebuilt per anchor, and repeats inside an anchor still need a check.",
  tools: [
    {
      name: "Sorted array",
      role: "so a repeated anchor is the previous slot, and skippable.",
    },
    {
      name: "Hash Set (per anchor)",
      role: "the pair search's memory: O(1) 'have I seen the complement?'. Rebuilt for every anchor.",
    },
  ],
  code: {
    pseudo: [
      "sort nums; out = []",
      "for k in 0..n-3:",
      "  if k > 0 and nums[k] == nums[k-1]: skip (same anchor, same triples)",
      "  seen = empty set; target = -nums[k]",
      "  for x in nums[k+1..]:",
      "    if target - x in seen: add [nums[k], target - x, x] to out (if new)",
      "    add x to seen",
      "return out",
    ],
    python: [
      "nums.sort(); out = []",
      "for k in range(len(nums) - 2):",
      "    if k > 0 and nums[k] == nums[k - 1]: continue",
      "    seen, target = set(), -nums[k]",
      "    for x in nums[k + 1:]:",
      "        if target - x in seen and [nums[k], target - x, x] not in out: out.append([nums[k], target - x, x])",
      "        seen.add(x)",
      "return out",
    ],
    java: [
      "Arrays.sort(nums); Set<List<Integer>> out = new LinkedHashSet<>();",
      "for (int k = 0; k + 2 < nums.length; k++) {",
      "    if (k > 0 && nums[k] == nums[k - 1]) continue;",
      "    Set<Integer> seen = new HashSet<>(); int target = -nums[k];",
      "    for (int m = k + 1; m < nums.length; m++) { int x = nums[m];",
      "        if (seen.contains(target - x)) out.add(List.of(nums[k], target - x, x));",
      "        seen.add(x); } }",
      "return new ArrayList<>(out);",
    ],
    cpp: [
      "sort(nums.begin(), nums.end()); set<vector<int>> out;",
      "for (int k = 0; k + 2 < n; k++) {",
      "    if (k > 0 && nums[k] == nums[k - 1]) continue;",
      "    unordered_set<int> seen; int target = -nums[k];",
      "    for (int m = k + 1; m < n; m++) { int x = nums[m];",
      "        if (seen.count(target - x)) out.insert({nums[k], target - x, x});",
      "        seen.insert(x); } }",
      "return vector<vector<int>>(out.begin(), out.end());",
    ],
  },
  takeaways: [
    "reduce: fix one, and the rest is a solved problem — the most reusable move in this whole journey",
    "the anchor skip prevents repeats at the top level; repeats INSIDE an anchor still need the 'if new' check",
    "n anchors × O(n) pass = O(n²), with an O(n) set rebuilt n times",
  ],
  hints: [
    "For one anchor, what is the target the other two must hit? Watch the 'need' line.",
    "Fixing an amount turns a 3-term problem into a 2-term one. You solved the 2-term one already — with a memory.",
    "Line 5: the lookup asks about target − x, where target = −anchor.",
  ],
  quiz: [
    {
      q: "With anchor a fixed, what must the other two amounts sum to?",
      choices: ["a", "−a", "0"],
      answer: 1,
      explain:
        "a + b + c = 0 means b + c = −a. The pair search runs with target −a.",
    },
    {
      q: "Why skip an anchor equal to the previous one?",
      choices: [
        "it would produce the same triples again",
        "equal anchors cannot form triples",
        "to save memory",
      ],
      answer: 0,
      explain:
        "Same anchor value, same suffix values available — every triple it starts was already found.",
    },
  ],
  run: runHash,
  view(f, d) {
    const map = hashLayout(entriesOf(f.seen ?? []), {
      probe: f.need ?? null,
      hit: !!f.hit,
      label: "seen for this anchor — value @ original row",
    })
    return {
      chips: sortedChips(f, d, f.m !== undefined ? [f.m] : []),
      panel: termsPanel(
        f,
        f.k !== undefined && f.need !== undefined ? map : undefined
      ),
    }
  },
}

const twoptr: Act<ThreeSumData, F> = {
  key: "twoptr",
  name: "Anchor + Two Pointers",
  short: "O(n²) · O(1)",
  complexity: "O(n²) time · O(1) extra space — the interview answer",
  insight:
    "The array is already sorted for the anchor skip — so the pair search can use ORDER instead of memory.",
  idea: "For each anchor a, squeeze the rest from both ends: too small → left steps right, too big → right steps left, zero → record and move BOTH, stepping past equal neighbours so no triple repeats. No set at all: order prevents the repeats. Bonus: once the anchor is positive, nothing after it can cancel — stop.",
  tools: [
    {
      name: "Sorted array",
      role: "order does both jobs: skippable repeats and a squeezable range.",
    },
    {
      name: "Two integer pointers",
      role: "one comparison eliminates a whole side of the range — the squeeze you earned in Two Sum, now per anchor.",
    },
  ],
  code: {
    pseudo: [
      "sort nums; out = []",
      "for k in 0..n-3:",
      "  if nums[k] > 0: break — everything after is bigger, no zero sum left",
      "  if k > 0 and nums[k] == nums[k-1]: skip",
      "  L = k+1; R = n-1",
      "  while L < R:",
      "    s = nums[k] + nums[L] + nums[R]",
      "    if s < 0: L += 1   else if s > 0: R -= 1",
      "    else: add [nums[k], nums[L], nums[R]]; L += 1; R -= 1; skip equal neighbours",
      "return out",
    ],
    python: [
      "nums.sort(); out = []",
      "for k in range(len(nums) - 2):",
      "    if nums[k] > 0: break",
      "    if k > 0 and nums[k] == nums[k - 1]: continue",
      "    i, j = k + 1, len(nums) - 1",
      "    while i < j:",
      "        s = nums[k] + nums[i] + nums[j]",
      "        if s != 0: i, j = (i + 1, j) if s < 0 else (i, j - 1)",
      "        else: out.append([nums[k], nums[i], nums[j]]); i += 1; j -= 1; i, j = skip_equal(nums, i, j)",
      "return out",
    ],
    java: [
      "Arrays.sort(nums); List<List<Integer>> out = new ArrayList<>();",
      "for (int k = 0; k + 2 < nums.length; k++) {",
      "    if (nums[k] > 0) break;",
      "    if (k > 0 && nums[k] == nums[k - 1]) continue;",
      "    int i = k + 1, j = nums.length - 1;",
      "    while (i < j) {",
      "        int s = nums[k] + nums[i] + nums[j];",
      "        if (s < 0) i++; else if (s > 0) j--;",
      "        else { out.add(List.of(nums[k], nums[i], nums[j])); i++; j--; while (i < j && nums[i] == nums[i - 1]) i++; while (i < j && nums[j] == nums[j + 1]) j--; } } }",
      "return out;",
    ],
    cpp: [
      "sort(nums.begin(), nums.end()); vector<vector<int>> out;",
      "for (int k = 0; k + 2 < n; k++) {",
      "    if (nums[k] > 0) break;",
      "    if (k > 0 && nums[k] == nums[k - 1]) continue;",
      "    int i = k + 1, j = n - 1;",
      "    while (i < j) {",
      "        int s = nums[k] + nums[i] + nums[j];",
      "        if (s < 0) i++; else if (s > 0) j--;",
      "        else { out.push_back({nums[k], nums[i], nums[j]}); i++; j--; while (i < j && nums[i] == nums[i - 1]) i++; while (i < j && nums[j] == nums[j + 1]) j--; } } }",
      "return out;",
    ],
  },
  takeaways: [
    "sort once, then per anchor a squeeze: O(n²) time, no extra memory — order replaced the set",
    "after a hit move BOTH pointers and step past equal neighbours — that IS the dedup",
    "anchor > 0 ends the search early: the sort paid for a shortcut too",
  ],
  hints: [
    "After a hit, why can neither pointer stay where it is?",
    "In a sorted range, if left + right is too small, nothing paired with this left can help — left must move. Same on the other side.",
    "Line 8: three things happen on a hit — record, move both, skip equals.",
  ],
  quiz: [
    {
      q: "Why can the search stop once the anchor is positive?",
      choices: [
        "positive anchors are never part of a zero-sum triple",
        "the array is sorted, so everything after the anchor is positive too — three positives cannot sum to zero",
        "the remaining anchors are repeats",
      ],
      answer: 1,
      explain:
        "It is the sort that makes this legal: anchor > 0 implies all later amounts > 0.",
    },
    {
      q: "After recording a triple, the code moves both pointers and skips equal neighbours. What does that replace?",
      choices: ["the sort", "the set of found triples", "the anchor loop"],
      answer: 1,
      explain:
        "Order makes repeats adjacent, so stepping past equals prevents them — no set needed.",
    },
  ],
  run: runTwoPointer,
  view(f, d) {
    return {
      chips: sortedChips(
        f,
        d,
        [f.L, f.R].filter((x): x is number => x !== undefined)
      ),
      panel: termsPanel(f),
    }
  },
}

const recap: Act<ThreeSumData, F> = {
  key: "recap",
  name: "The Reveal",
  short: "what you earned",
  complexity: "journey complete 🏁",
  insight:
    "One move carried the whole journey: fix one, reduce to a problem you already own.",
  tools: [
    {
      name: "Array",
      role: "the given, plus the dedup problem the values create.",
    },
    {
      name: "Sorted array + two pointers",
      role: "order prevents repeats AND powers the squeeze — one sort, two payoffs.",
    },
    {
      name: "Hash Set",
      role: "memory-based pair search; works, but rebuilt per anchor and blind to repeats.",
    },
  ],
  idea: 'You did not learn "3Sum". You earned REDUCTION — fix an anchor, hand the rest to a solved problem — and you saw why the two-pointer squeeze beats the hash set when the array is sorted anyway: the same order that skips repeats drives the search. That is the KSum family in one idea.',
  code: {
    pseudo: [
      "what transfers to the next problem:",
      "  1. fix one element; the rest is a smaller problem you know",
      "  2. sorted input: repeats are adjacent → skip, don't dedup",
      "  3. sorted input: squeeze beats memory",
      "  4. output by value? uniqueness is the real spec",
      "  5. empty answer is an answer — write the fall-through",
    ],
  },
  takeaways: [
    "reduction: 3Sum is n Two Sums; 4Sum is n 3Sums — the KSum family",
    "sort once when the output is by value: repeats become adjacent",
    "the interview answer is O(n²) time, O(1) space — and you built it from the brute force",
  ],
  chart: false,
  *run() {
    yield {
      hold: 3,
      note: "the move you made in acts 3 and 4 has a name: REDUCTION to Two Sum — the KSum family. The squeeze inside it: TWO POINTERS. You earned both — here's the scorecard.",
    }
  },
  view(_f, d) {
    return {
      chips: null,
      panel: {
        kind: "recap",
        caption: `three approaches on this ledger (${d.nums.length} amounts)`,
        rows: [
          {
            name: "Brute Force",
            built: "array + set of sorted triples",
            cost: "O(n³) · O(k)",
            insight:
              "every set of rows once; the set makes every set of values once",
          },
          {
            name: "Anchor + Hash",
            built: "sorted array + hash set per anchor",
            cost: "O(n²) · O(n)",
            insight: "fix one → the pair search you already own",
          },
          {
            name: "Anchor + Two Pointers",
            built: "sorted array + two pointers",
            cost: "O(n²) · O(1)",
            insight: "order skips repeats and powers the squeeze — no set",
          },
        ],
        note: "Next: 4Sum is one more anchor loop around this. Or go back to where the squeeze was born.",
        links: [
          {
            label: "Two Sum",
            detail:
              "the pair search this journey reduced to — replay it as the inner loop",
            href: "#/journey/two-sum",
          },
          {
            label: "Two Pointers",
            detail: "the pattern page: converge, chase, build",
            href: "#/p/two-pointers",
          },
        ],
      },
    }
  },
}

// ---------- presets and page config ----------

function makeThreeSum(n: number, lo = -6, hi = 6): ThreeSumData {
  for (let tries = 0; tries < 50; tries++) {
    const nums = Array.from({ length: n }, () => randInt(lo, hi))
    const t = allTriplets(nums)
    if (t.length >= 1 && t.length <= 4) return { nums: shuffled(nums) }
  }
  return { nums: [-1, 0, 1, 2, -1, -4] }
}

export const threeSum: Journey<ThreeSumData> = {
  slug: "three-sum",
  title: "Triplets Summing to Zero",
  subtitle:
    "three amounts that cancel — every distinct triple, once; three ways in, each earned by the last one's weakness",
  problemId: "three-sum-zero",
  leetcode: 15,
  acts: [story, brute, hash, twoptr, recap],
  resources: [
    { label: "LeetCode 15", url: "https://leetcode.com/problems/3sum/" },
    {
      label: "Khamies §3.2.2 — the 3Sum problem",
      url: "https://leanpub.com/how-to-solve-algorithm-problems-book",
    },
  ],
  presets: {
    random: { label: "random", make: () => makeThreeSum(randInt(6, 7)) },
    classic: {
      label: "the classic (repeated −1)",
      make: () => ({ nums: [-1, 0, 1, 2, -1, -4] }),
      info: "LeetCode's own example. Two rows hold −1, and both build [−1, 0, 1]. Watch how each approach keeps that triple from appearing twice.",
    },
    zeros: {
      label: "all zeros",
      make: () => ({ nums: [0, 0, 0, 0] }),
      info: "Four zeros: four sets of rows, ONE triple. A triple may reuse an amount; the output may not repeat a triple.",
    },
    positive: {
      label: "no answer (all positive)",
      make: () => ({ nums: [1, 2, 3, 4] }),
      info: "Nothing cancels. The answer is the empty list — watch which approach notices early and which grinds to the end.",
    },
    tiny: {
      label: "n = 3 (smallest legal)",
      make: () => ({ nums: [-1, 0, 1] }),
      info: "n = 3: exactly one set of rows to check. The smallest legal input is where an off-by-one shows first.",
    },
    big: {
      label: "big (n = 12)",
      make: () => makeThreeSum(12, -9, 9),
      info: "n = 12. Watch the chart: one bar counts sets of three rows, the others count anchors × a pass. That gap is the whole point.",
    },
  },
  defaultPreset: "classic",
  harder: { preset: "big", label: "Take on n = 12 — watch the cubic bar ▸" },
  classify: (d) => classifyThreeSum(d.nums),
  describe: (d) => d.nums.join(", "),
  parse: (text) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= -99 && v <= 99)
    return nums.length >= 3 && nums.length <= 14 ? { nums } : null
  },
  reveals: ["two-pointers"],
  sample: { nums: [-1, 0, 1, 2, -1, -4] },
  edgeCases: [
    {
      key: "tiny",
      name: "smallest legal input",
      example: "[-1, 0, 1] → [[-1, 0, 1]]",
      why: "n = 3 leaves exactly one set of rows. A loop bound written as n − 3 instead of n − 2, or an inner range that starts one too late, returns nothing here — and passes on bigger inputs.",
      think:
        "Bring the smallest legal input first and trace it by hand: every loop should run exactly once.",
      constraint:
        "3 <= nums.length <= 3000 — three elements is the smallest legal input",
      preset: "tiny",
    },
    {
      key: "dupes",
      name: "repeated amounts",
      example: "[-1, 0, 1, 2, -1, -4] → [[-1, -1, 2], [-1, 0, 1]]",
      why: "Two rows hold −1; each pairs with 0 and 1. By rows that is two triples, by values it is one — and the answer is by value. Anything that enumerates rows must recognise a triple it has already produced.",
      think:
        "Ask: is the output compared by value or by position? Can one triple contain the same amount twice? (Yes: [−1, −1, 2].) Can the output contain the same triple twice? (No.) Those answers decide where the repeat check lives.",
      constraint:
        "the triples must be distinct as sets of values, not as sets of indices",
      preset: "classic",
    },
    {
      key: "zeros",
      name: "all zeros",
      example: "[0, 0, 0, 0] → [[0, 0, 0]]",
      why: "Four rows, four sets of three rows, one triple by value. Also the case where all three amounts are equal — legal, and the easiest place for an off-by-one in 'skip equal neighbours' to skip too far.",
      think:
        "Put the repeated amount in every position of the triple: anchor, left, right. Then ask what 'skip equals' must not skip.",
      constraint:
        "-10^5 <= nums[i] <= 10^5 — zeros are legal, and [0, 0, 0] is a legal triple",
      preset: "zeros",
    },
    {
      key: "none",
      name: "no triple at all",
      example: "[1, 2, 3, 4] → []",
      why: "Nothing cancels, so the answer is an empty list. Correct code never crashes here and never invents a triple — and sorted input allows an early stop the moment the smallest remaining amount is positive.",
      think:
        "Write the fall-through (return the list, possibly empty) before the happy path; then ask whether the input's order lets you stop early.",
      constraint:
        "nothing promises a triple exists; an empty answer is a correct answer",
      preset: "positive",
    },
  ],
}
