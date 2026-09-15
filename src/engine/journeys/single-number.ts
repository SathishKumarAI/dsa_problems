// Single Number (LeetCode 136) — journey content: story act + four
// approaches (brute → hash map → sort & scan → XOR) as frame generators.
// Owns this problem's narrative, generators, presets and contract check.
// Owns no rendering: each act's view() returns a StageModel.

import { chipRow, range } from "../chips.ts"
import { entriesOf, hashLayout } from "../hashmap.ts"
import { distinct, randInt, shuffled } from "../random.ts"
import type { Act, BitRowModel, Frame, Journey } from "../types.ts"

export interface SingleNumberData {
  nums: number[]
}

const BITS = 7 // values stay under 128

type F = Frame<{
  i?: number
  j?: number
  pair?: number[]
  dim?: number[]
  single?: number
  answer?: number
  counts?: [number, number][]
  scanX?: number
  sorted?: number[]
  passed?: number
  x?: number | null
  acc?: number
  op?: "get" | "set" // challenge replay: what the learner's code did
}>

// ---------- the problem's promise ----------

export function classifySingle(nums: number[]) {
  const counts = new Map<number, number>()
  for (const v of nums) counts.set(v, (counts.get(v) || 0) + 1)
  const singles = [...counts].filter(([, c]) => c === 1).map(([v]) => v)
  const odd = [...counts].filter(([, c]) => c !== 1 && c !== 2)
  if (singles.length === 1 && odd.length === 0)
    return { ok: true, single: singles[0] }
  if (singles.length > 1)
    return {
      ok: false,
      warning: `Contract broken: ${singles.join(" and ")} both lack partners. The bit trick will return ${singles.reduce((a, b) => a ^ b)} — a value possibly not even in the array. The promise "exactly one single" is what makes it safe.`,
    }
  if (odd.length > 0)
    return {
      ok: false,
      warning: `Contract broken: ${odd[0][0]} appears ${odd[0][1]}×. Approaches that look for "has a partner" find no answer; the bit trick treats the odd copy as a loner. Same code, different lies.`,
    }
  return {
    ok: false,
    warning:
      "Contract broken: no value appears exactly once — there is no answer to find.",
  }
}

// ---------- generators ----------

function* runStory({ nums }: SingleNumberData): Generator<F> {
  yield {
    hold: 3,
    note: "A drawer of socks: every sock came in a pair, but one lost its twin. The drawer is shuffled. Your job: find the lonely one.",
  }
  const where = new Map<number, number[]>()
  nums.forEach((v, i) => (where.get(v) || where.set(v, []).get(v)!).push(i))
  const dim: number[] = []
  for (const [v, idxs] of where) {
    if (idxs.length === 2) {
      yield {
        hold: 2,
        pair: idxs,
        dim: [...dim],
        note: `${v} and ${v} — a pair. Pairs are noise; ignore them.`,
      }
      dim.push(...idxs)
    }
  }
  const single = [...where].find(([, ix]) => ix.length === 1)
  if (single) {
    yield {
      hold: 3,
      single: single[1][0],
      dim: [...dim],
      note: `${single[0]} stands alone — that is what every approach below must find. The question is only: at what cost in time and memory?`,
    }
  } else {
    yield {
      hold: 3,
      dim: [...dim],
      corner: "broken",
      note: "…this input has no loner. The problem's promise is broken — keep that in mind, it will matter later.",
    }
  }
}

function* runBrute({ nums }: SingleNumberData): Generator<F> {
  for (let i = 0; i < nums.length; i++) {
    let found = false
    for (let j = 0; j < nums.length && !found; j++) {
      if (j === i) continue
      yield {
        line: 3,
        i,
        j,
        note: `is nums[${j}] = ${nums[j]} the partner of nums[${i}] = ${nums[i]}?`,
      }
      if (nums[j] === nums[i]) {
        found = true
        yield {
          line: 3,
          i,
          j,
          note: `${nums[i]} has a partner at index ${j} — not our loner, move on`,
        }
      }
    }
    if (!found) {
      const edge =
        nums.length === 1
          ? "single"
          : i === nums.length - 1
            ? "last"
            : nums[i] === 0
              ? "zero"
              : undefined
      yield {
        hold: 2,
        line: 4,
        i,
        answer: nums[i],
        corner: edge,
        note: `${nums[i]} searched the whole drawer and found no partner — answer!${edge === "single" ? " n = 1: the inner loop never ran; the loner is the whole drawer" : edge === "last" ? " It sat in the last slot — every earlier value found its partner first, so the search only ends when it finally reaches the loner" : edge === "zero" ? " The answer is 0 — a legal loner that a truthiness check would call 'nothing found'" : ""}`,
      }
      return
    }
  }
  yield {
    hold: 2,
    line: 4,
    corner: "broken",
    note: "every element found a partner — the input broke the problem's promise",
  }
}

function* runHash({ nums }: SingleNumberData): Generator<F> {
  const counts = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    counts.set(x, (counts.get(x) || 0) + 1)
    yield {
      line: 2,
      i,
      counts: [...counts],
      note: `counts[${x}] is now ${counts.get(x)}`,
    }
  }
  for (const [x, c] of counts) {
    if (c === 1) {
      const edge = nums.length === 1 ? "single" : x === 0 ? "zero" : undefined
      yield {
        hold: 2,
        line: 4,
        scanX: x,
        counts: [...counts],
        answer: x,
        corner: edge,
        note: `counts[${x}] = 1 — ${x} is the single number${edge === "single" ? ". n = 1: one entry, one count, one answer — the loops barely ran" : edge === "zero" ? ". The answer is 0: the count is 1, the value is falsy — test the count, never the value" : ""}`,
      }
      return
    }
    yield {
      line: 4,
      scanX: x,
      counts: [...counts],
      note: `counts[${x}] = ${c} — not 1, keep scanning`,
    }
  }
  yield {
    hold: 2,
    line: 4,
    counts: [...counts],
    corner: "broken",
    note: "no count of exactly 1 — the input broke the problem's promise",
  }
}

function* runSort({ nums }: SingleNumberData): Generator<F> {
  const s = nums.slice().sort((a, b) => a - b)
  yield {
    hold: 2,
    line: 0,
    sorted: s,
    passed: 0,
    note: "sort a copy — duplicates become adjacent, the order does the matching",
  }
  for (let i = 0; i + 1 < s.length; i += 2) {
    if (s[i] !== s[i + 1]) {
      yield {
        line: 2,
        sorted: s,
        pair: [i, i + 1],
        passed: i,
        note: `${s[i]} ≠ ${s[i + 1]} — the pair pattern broke`,
      }
      yield {
        hold: 2,
        line: 3,
        sorted: s,
        single: i,
        passed: i,
        answer: s[i],
        corner: s[i] === 0 ? "zero" : undefined,
        note: `${s[i]} has no partner — answer${s[i] === 0 ? ". 0 sorts first and is the loner: a legal answer that looks like 'nothing' to a truthiness check" : ""}`,
      }
      return
    }
    yield {
      line: 2,
      sorted: s,
      pair: [i, i + 1],
      passed: i,
      note: `${s[i]} = ${s[i + 1]} — a matched pair, skip both`,
    }
  }
  const last = s.length - 1
  yield {
    hold: 2,
    line: 4,
    sorted: s,
    single: last,
    passed: last,
    answer: s[last],
    corner: s.length === 1 ? "single" : "last",
    note:
      s.length === 1
        ? `n = 1: the loop never ran — the fallback line after it returns ${s[0]}, the whole drawer`
        : `every pair matched — the loop ran off the end without returning. The line AFTER the loop returns the last element ${s[last]}: the loner was the largest value`,
  }
}

function* runXor({ nums }: SingleNumberData): Generator<F> {
  const ok = classifySingle(nums).ok
  let acc = 0
  yield {
    line: 0,
    i: -1,
    x: null,
    acc,
    note: "start with acc = 0 (XOR identity: 0 XOR x = x)",
  }
  for (let i = 0; i < nums.length; i++) {
    const before = acc
    acc ^= nums[i]
    yield {
      line: 2,
      i,
      x: nums[i],
      acc,
      predict:
        i !== 1
          ? undefined
          : {
              q: `acc is ${before}. The next value is ${nums[i]}. What does acc become?`,
              choices: [
                `${before + nums[i]} — they add`,
                `${before ^ nums[i]} — equal bits cancel, different bits stay`,
                `${nums[i]} — the newest value wins`,
              ],
              answer: 1,
            },
      note: `${before} XOR ${nums[i]} = ${acc} — equal bits cancel to 0`,
    }
  }
  const edge = !ok
    ? "broken"
    : nums.length === 1
      ? "single"
      : acc === 0
        ? "zero"
        : undefined
  yield {
    hold: 2,
    line: 3,
    i: nums.length,
    x: null,
    acc,
    answer: acc,
    corner: edge,
    note:
      edge === "broken"
        ? `acc = ${acc} — but the promise was broken, so this is every loner folded together: a value that may not even be in the array. The trick never checks; it trusts`
        : edge === "single"
          ? `acc = ${acc} — n = 1: one fold, and 0 XOR x = x hands the value straight back`
          : edge === "zero"
            ? `all pairs annihilated — acc = 0 is the single number. 0 is also what nothing-at-all leaves behind; only the promise tells the two apart`
            : `all pairs annihilated — acc = ${acc} is the single number`,
  }
}

const bitRow = (tag: string, value: number, flip = 0): BitRowModel => ({
  tag,
  value,
  flip,
  bits: BITS,
})

// ---------- the acts, in learning order ----------

const story: Act<SingleNumberData, F> = {
  key: "story",
  name: "The Problem",
  short: "start here",
  complexity: "no code yet — just the promise",
  insight: "",
  tools: [
    {
      name: "Array",
      role: "a drawer of socks, addressed by position. Searching it costs a scan — every approach below is a different thing built beside it to avoid that scan.",
    },
  ],
  idea: "In plain words: a shuffled drawer where every value appears exactly twice, except one loner. Return the loner. The promise — exactly one single, everything else paired — is not decoration; it is what the clever solutions will lean on.",
  code: {
    pseudo: [
      "given: nums, length n",
      "promise: every value appears twice…",
      "…except exactly one value, once",
      "task: return that lone value",
    ],
  },
  hints: [
    "Reread the promise: 'every element appears twice except one'. Which of those two clauses could a clever solution exploit, and which one merely describes the input?",
    "Formalize it as one question: input = an array where every value pairs up but one; output = the unpaired value. Now ask what should happen when n = 1.",
    "Bring three inputs before any code: n = 1, a plain shuffled drawer, and a corner one — the loner being the largest value, or the loner being 0. The corner cases listed here are those inputs.",
  ],
  takeaways: [
    "the promise — exactly one single, all else paired — is a rule you may lean on",
    "correctness is not the game; every approach below is correct",
    "the game is cost: how much time, how much memory",
  ],
  quiz: [
    {
      q: "What does the input promise?",
      choices: [
        "every value appears exactly twice, except one that appears once",
        "the array is sorted",
        "all values are distinct",
      ],
      answer: 0,
      explain:
        "Exactly one loner, everything else paired. Every clever approach leans on that.",
    },
  ],
  run: runStory,
  view(f, d) {
    return {
      chips: chipRow(d.nums, {
        focus: f.pair ?? [],
        dim: f.dim ?? [],
        answer: f.single !== undefined ? [f.single] : [],
      }),
      panel: { kind: "none" },
    }
  },
}

const brute: Act<SingleNumberData, F> = {
  key: "brute",
  name: "Brute Force",
  short: "O(n²)",
  complexity: "O(n²) time · O(1) space",
  insight: "First instinct — no cleverness, just check everything.",
  tools: [
    {
      name: "Array only",
      role: "nothing built alongside. Nowhere to write down what you already saw, so you re-look — n times.",
    },
  ],
  idea: "Pick up each sock and rummage through the whole drawer for its twin. For each of n elements you scan up to n others: n² looks. Fine for 9 socks, hopeless for a million. Watch the chart — this bar explodes as the array grows.",
  code: {
    pseudo: [
      "for i in 0..n-1:",
      "  found = false",
      "  for j ≠ i:",
      "    if nums[j] == nums[i]: found",
      "  if not found: return nums[i]",
    ],
    python: [
      "for i in range(len(nums)):",
      "    found = False",
      "    for j in range(len(nums)):",
      "        if j != i and nums[j] == nums[i]: found = True",
      "    if not found: return nums[i]",
    ],
    java: [
      "for (int i = 0; i < nums.length; i++) {",
      "    boolean found = false;",
      "    for (int j = 0; j < nums.length; j++)",
      "        if (j != i && nums[j] == nums[i]) found = true;",
      "    if (!found) return nums[i]; }",
    ],
    cpp: [
      "for (int i = 0; i < n; i++) {",
      "    bool found = false;",
      "    for (int j = 0; j < n; j++)",
      "        if (j != i && nums[j] == nums[i]) found = true;",
      "    if (!found) return nums[i]; }",
    ],
  },
  takeaways: [
    "nested loop over the same data = O(n²) — the shape to recognize",
    "correct but wasteful: it re-searches the whole drawer for every element",
    "always know the brute force first; it is the baseline every trick must beat",
  ],
  hints: [
    "How many times does the same sock get picked up?",
    "Every element re-scans the whole drawer. Nothing is remembered between scans — that repetition IS the n².",
    "The line to stare at: for j ≠ i — a full inner loop for every outer element.",
  ],
  quiz: [
    {
      q: "Why is this O(n²)?",
      choices: [
        "it sorts the array first",
        "for each of n elements it scans up to n others",
        "it uses a map of size n",
      ],
      answer: 1,
      explain:
        "n outer picks × n inner looks = n² comparisons. Nothing is remembered between picks.",
    },
  ],
  run: runBrute,
  view(f, d) {
    const done = f.answer !== undefined
    return {
      chips: chipRow(d.nums, {
        focus: f.j !== undefined ? [f.j] : [],
        anchor: !done && f.i !== undefined ? [f.i] : [],
        dim: range(f.i ?? 0),
        answer: done ? [f.i!] : [],
      }),
      panel: { kind: "none" },
    }
  },
}

const hash: Act<SingleNumberData, F> = {
  key: "hash",
  name: "Hash Map",
  short: "O(n) / O(n)",
  complexity: "O(n) time · O(n) space",
  insight: "Brute force repeats work — what if we remembered what we've seen?",
  tools: [
    { name: "Array", role: "one pass over it, then never again." },
    {
      name: "Hash Map",
      role: "value → count. The panel shows what it really is: a bucket table. The hash picks the bucket, colliding keys share one and get chained.",
    },
  ],
  idea: "Keep a tally as you go: one pass to count every value, one pass over the tally to find the count of 1. We bought speed with memory — n² looks became n, but now a whole map rides along.",
  code: {
    pseudo: [
      "counts = empty map",
      "for x in nums:",
      "  counts[x] += 1",
      "for (x, c) in counts:",
      "  if c == 1: return x",
    ],
    python: [
      "counts = {}",
      "for x in nums:",
      "    counts[x] = counts.get(x, 0) + 1",
      "for x, c in counts.items():",
      "    if c == 1: return x",
    ],
    java: [
      "Map<Integer, Integer> counts = new HashMap<>();",
      "for (int x : nums)",
      "    counts.merge(x, 1, Integer::sum);",
      "for (var e : counts.entrySet())",
      "    if (e.getValue() == 1) return e.getKey();",
    ],
    cpp: [
      "unordered_map<int, int> counts;",
      "for (int x : nums)",
      "    counts[x]++;",
      "for (auto& [x, c] : counts)",
      "    if (c == 1) return x;",
    ],
  },
  takeaways: [
    "a dict is the 'remember what I saw' tool — it turns re-searching into lookup",
    "memory buys speed: n² comparisons became one pass + one scan",
    "in Python, collections.Counter(nums) does the first loop in one line",
  ],
  hints: [
    "What does the map hold after the first pass?",
    "A tally: value → how many times seen. The second loop only reads the tally, never the array.",
    "The line to stare at: counts[x] += 1 — one O(1) write replaces a whole inner loop.",
  ],
  quiz: [
    {
      q: "What did we pay to get from n² to n?",
      choices: [
        "nothing — it's free",
        "O(n) extra memory for the tally",
        "a sort",
      ],
      answer: 1,
      explain:
        "The map can grow to n entries. Time was bought with space — that trade is the whole idea.",
    },
  ],
  run: runHash,
  view(f, d) {
    const scanning = f.scanX !== undefined || f.line === 4
    const answer =
      scanning && f.answer !== undefined
        ? range(d.nums.length).filter((k) => d.nums[k] === f.answer)
        : []
    const dim = scanning
      ? range(d.nums.length).filter((k) => !answer.includes(k))
      : range(f.i ?? 0)
    return {
      chips: chipRow(d.nums, {
        focus: !scanning && f.i !== undefined ? [f.i] : [],
        dim,
        answer,
      }),
      panel: {
        kind: "hash",
        map: hashLayout(entriesOf(f.counts ?? []), {
          probe: f.scanX ?? null,
          hit: f.scanX !== undefined && f.answer === f.scanX,
          label: "counts — the memory we pay for (value × times seen)",
          fmt: "times",
        }),
      },
    }
  },
}

const sort: Act<SingleNumberData, F> = {
  key: "sort",
  name: "Sort & Scan",
  short: "O(n log n)",
  complexity: "O(n log n) time · O(1) extra space",
  insight: "The map costs memory — what if the drawer organized itself?",
  tools: [
    {
      name: "Sorted array",
      role: "ORDER replaces the map: twins become neighbours, so adjacency does the matching for free. You pay n log n once instead of n memory forever.",
    },
  ],
  idea: "Sort it: twins end up adjacent, so pairs occupy positions (0,1), (2,3), … until the single breaks the pattern. No map — the order does the matching. Slower than counting (n log n), but lean. Already-sorted input changes nothing: the sort still runs.",
  code: {
    pseudo: [
      "sorted = sort(nums)",
      "for i = 0, 2, 4, ...",
      "  if sorted[i] != sorted[i+1]:",
      "    return sorted[i]",
      "return sorted[n-1]",
    ],
    python: [
      "s = sorted(nums)",
      "for i in range(0, len(s) - 1, 2):",
      "    if s[i] != s[i + 1]:",
      "        return s[i]",
      "return s[-1]",
    ],
    java: [
      "int[] s = nums.clone(); Arrays.sort(s);",
      "for (int i = 0; i + 1 < s.length; i += 2)",
      "    if (s[i] != s[i + 1])",
      "        return s[i];",
      "return s[s.length - 1];",
    ],
    cpp: [
      "vector<int> s(nums); sort(s.begin(), s.end());",
      "for (int i = 0; i + 1 < (int)s.size(); i += 2)",
      "    if (s[i] != s[i + 1])",
      "        return s[i];",
      "return s.back();",
    ],
  },
  takeaways: [
    "ordering is information — sorting makes duplicates adjacent for free",
    "trade: O(n log n) time to avoid the map's O(n) memory",
    "edge to remember: if every pair matches, the single is the last element",
  ],
  hints: [
    "Why step by two?",
    "After sorting, twins sit side by side. Positions (0,1), (2,3)… are pairs until the loner shifts everything after it.",
    "The line to stare at: return sorted[n-1] — the fallback when every pair matched and the loner is last.",
  ],
  quiz: [
    {
      q: "Why does stepping by 2 work after sorting?",
      choices: [
        "the array has an even length",
        "twins are adjacent, so every pair occupies (i, i+1) until the loner breaks the rhythm",
        "sorting removes duplicates",
      ],
      answer: 1,
      explain:
        "Order does the matching: pairs sit together, and the first mismatch at an even index is the single.",
    },
  ],
  run: runSort,
  view(f, d) {
    const chips = chipRow(d.nums, { dim: range(d.nums.length) })
    if (!f.sorted) return { chips, panel: { kind: "none" } }
    const sorted = chipRow(f.sorted, {
      focus: f.pair ?? [],
      dim: range(f.passed ?? 0).filter((k) => k !== f.single),
      answer: f.single !== undefined ? [f.single] : [],
    })
    return {
      chips,
      panel: { kind: "sorted", label: "sorted copy", chips: sorted },
    }
  },
}

const xor: Act<SingleNumberData, F> = {
  key: "xor",
  name: "XOR",
  short: "O(n) / O(1)",
  complexity: "O(n) time · O(1) space — the follow-up answer",
  insight: "One pass AND no memory — can math do the matching for us?",
  tools: [
    {
      name: "One integer",
      role: "no map, no sort, no second array — a single 32-bit accumulator. The structure disappeared entirely; the property of XOR does the work the map was doing.",
    },
  ],
  idea: "x XOR x = 0, and XOR doesn't care about order. So XOR everything: each pair annihilates bit by bit, and only the loner's bits survive. One variable, one pass. This leans entirely on the promise — feed it two singles and it lies confidently.",
  code: {
    pseudo: ["acc = 0", "for x in nums:", "  acc = acc XOR x", "return acc"],
    python: ["acc = 0", "for x in nums:", "    acc ^= x", "return acc"],
    java: [
      "int acc = 0;",
      "for (int x : nums)",
      "    acc ^= x;",
      "return acc;",
    ],
    cpp: ["int acc = 0;", "for (int x : nums)", "    acc ^= x;", "return acc;"],
  },
  takeaways: [
    "x ^ x = 0, x ^ 0 = x, and order never matters — pairs annihilate",
    "O(n) time AND O(1) space — this is the interview answer",
    "it leans entirely on the promise: broken input makes it lie confidently",
  ],
  hints: [
    "Watch the bit rows: which bits survive when the same value arrives twice?",
    "Equal bits cancel to 0. A value seen twice contributes nothing — only the loner's bits are left standing.",
    "The line to stare at: acc = acc XOR x — one operation, no memory, no order.",
  ],
  quiz: [
    {
      q: "Why does XOR-ing everything leave only the single?",
      choices: [
        "XOR sorts the bits",
        "x ^ x = 0 and order doesn't matter, so every pair cancels",
        "XOR counts occurrences",
      ],
      answer: 1,
      explain:
        "Pairs annihilate bit by bit regardless of where they sit; what remains is the value with no twin.",
    },
    {
      q: "Feed XOR an array with TWO singles. It returns…",
      choices: [
        "the first single",
        "their XOR — possibly a value not in the array",
        "an error",
      ],
      answer: 1,
      explain:
        "XOR leans entirely on the promise. Break it and the trick lies confidently.",
    },
  ],
  run: runXor,
  view(f, d) {
    const i = f.i ?? 0
    const done = f.answer !== undefined
    const answer = done
      ? range(d.nums.length).filter((k) => d.nums[k] === f.answer)
      : []
    // Dim by PAIR, not by progress: a value whose twin has already gone past
    // has annihilated, so both chips fade together and what is left standing
    // is exactly what the accumulator still holds. Feed it a broken promise
    // (two singles) and two chips stay lit — which is the lie, made visible.
    const seen = new Map<number, number[]>()
    for (let k = 0; k < Math.min(i + 1, d.nums.length); k++)
      seen.set(d.nums[k], [...(seen.get(d.nums[k]) ?? []), k])
    const cancelled = [...seen.values()]
      .filter((ks) => ks.length % 2 === 0)
      .flat()
    const dim = done
      ? range(d.nums.length).filter((k) => !answer.includes(k))
      : cancelled
    const rows: BitRowModel[] = []
    if (f.x !== null && f.x !== undefined) rows.push(bitRow("x", f.x))
    rows.push(bitRow("acc", f.acc ?? 0, f.x ?? 0))
    return {
      chips: chipRow(d.nums, {
        focus: i >= 0 && i < d.nums.length && !done ? [i] : [],
        dim,
        answer,
      }),
      panel: { kind: "bits", rows },
    }
  },
}

// ---------- the challenge and the reveal ----------

export const SINGLE_NUMBER_CHALLENGE = {
  fname: "singleNumber",
  answers: "value" as const,
  signature: "function singleNumber(nums) {",
  starter: "// nums is in scope — return the value that has no twin\\n\\n",
  cases: [
    { nums: [2, 2, 1], expected: 1 },
    { nums: [4, 1, 2, 1, 2], expected: 4 },
    { nums: [7], expected: 7, tag: "n = 1" },
    { nums: [0, 4, 4], expected: 0, tag: "the answer is 0" },
    { nums: [1, 1, 2, 2, 9], expected: 9, tag: "loner is last in order" },
    { nums: [-3, 5, 5], expected: -3, tag: "negatives" },
  ],
  review: [
    {
      q: "One pass, no nested loops",
      check: (c: string) => (c.match(/\bfor\b|\bwhile\b/g) || []).length <= 1,
    },
    {
      q: "Constant space — no Map, Set, object or second array",
      check: (c: string) => !/new (Map|Set)|\.sort\(/.test(c),
    },
    {
      q: "0 is a legal answer — no truthiness test on the result",
      check: (c: string) => !/if\s*\(\s*(acc|res|ans|result)\s*\)/.test(c),
    },
    {
      q: "Say the property out loud: why does every paired value vanish, whatever the order?",
    },
    { q: "Could you re-derive this cold tomorrow, without the reference?" },
  ],
  big: {
    n: 2001,
    make: () => {
      const pool = distinct(1000, 1, 9999)
      const single = 12345
      return {
        nums: shuffled([single, ...pool.flatMap((v) => [v, v])]),
        expected: single,
      }
    },
  },
  reference: "let acc = 0;\\nfor (const x of nums) acc ^= x;\\nreturn acc;",
}

const challenge: Act<SingleNumberData, F> = {
  key: "challenge",
  name: "Code It",
  short: "prove it",
  complexity: "your turn — all 6 cases must pass",
  insight:
    "Watching a trick is not owning it. It is yours when your fingers can produce it cold.",
  tools: [
    {
      name: "Your call",
      role: "count, sort, or fold. Whatever you reach for is the memory you pay for — the scorecard prices it against the one-integer answer.",
    },
  ],
  idea: "Write the body of singleNumber(nums) below. It runs in a sandboxed Worker against the cases that hurt: n = 1, an answer of 0, the loner sitting last, and negatives. Any correct approach goes green; the constant-space one is the answer to give in a room.",
  code: { pseudo: xor.code.pseudo },
  takeaways: [
    "n = 1 and an answer of 0 are the two cases that break a first draft",
    "if you tested `if (result)` instead of a found-flag, the 0 case just caught you",
    "reproduce it from memory — reading the reference twice is a signal, not a failure",
  ],
  gate: "pass",
  chart: false,
  hints: [
    "Say the plan in one sentence before typing: walk once, and let the pairs cancel each other out.",
    "You need an accumulator that forgets a value the second time it sees it. Which operator does that?",
    "Skeleton: let acc = 0 → for (const x of nums) acc ^= x → return acc.",
  ],
  nextLabel: "It's green — show me what I earned ▸",
  *run({ nums }, ctx) {
    if (!ctx.trace) {
      yield {
        hold: 2,
        line: -1,
        note: "write the function body in the editor below, hit Run tests — or trace it and WATCH your own code walk the drawer",
      }
      return
    }
    const { events, result, error } = ctx.trace
    if (!events.length) {
      yield {
        hold: 2,
        note: "your code never touched nums 🤨 — it returned without reading the drawer",
      }
      return
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
    const truth = classifySingle(nums)
    const ok = truth.ok && result === truth.single
    yield {
      hold: 3,
      answer: ok ? (result as number) : undefined,
      note: ok
        ? `returned ${result} — correct, in ${events.length} array accesses. One integer of memory would have needed exactly ${nums.length}.`
        : `returned ${JSON.stringify(result)} — not the lone value here. Watch where the walk went wrong.`,
    }
  },
  view(f, d) {
    const answer =
      f.answer !== undefined
        ? range(d.nums.length).filter((k) => d.nums[k] === f.answer)
        : []
    return {
      chips: chipRow(d.nums, {
        focus: f.op === "get" && f.i !== undefined ? [f.i] : [],
        anchor: f.op === "set" && f.i !== undefined ? [f.i] : [],
        answer,
      }),
      panel: { kind: "challenge" },
    }
  },
}

const recap: Act<SingleNumberData, F> = {
  key: "recap",
  name: "The Reveal",
  short: "what you earned",
  complexity: "journey complete 🏁",
  insight:
    "Three of these approaches remember. The last one computes — and that is the whole idea.",
  tools: [
    {
      name: "Array",
      role: "the given. Searching it for a partner costs a scan — the weakness every other approach was built to fix.",
    },
    {
      name: "Hash Map",
      role: "buys the search with MEMORY: O(1) answers, O(n) space. The obvious trade, and the one the follow-up forbids.",
    },
    {
      name: "Sorted array",
      role: "buys it with ORDER: twins become neighbours, no map — but you pay O(n log n) and you must handle the loner landing last.",
    },
    {
      name: "One integer",
      role: "buys it with a PROPERTY of the data: x ^ x = 0. No structure at all. This is what 'use the algebra' looks like.",
    },
  ],
  idea: 'You did not learn "Single Number". You earned the move that separates a good answer from the interview answer: when a structure feels heavy, ask whether an operation on the values already does the bookkeeping for you. XOR is that operation here — self-inverse, commutative, associative — and the same instinct finds the missing number, the swapped pair, and the two-loner variant.',
  code: {
    pseudo: [
      "what transfers to the next problem:",
      "  1. brute force first — name its weakness out loud",
      "  2. does MEMORY help? (a map of counts)",
      "  3. does ORDER help? (sort, then read neighbours)",
      "  4. does a PROPERTY of the values help? (x ^ x = 0)",
      "  5. every trick leans on a promise — say which one",
    ],
  },
  takeaways: [
    "memory, order, algebra: three ways to buy the same search, at three prices",
    "the O(1)-space answer exists because the DATA has a property, not because the code is clever",
    "a trick that leans on a promise lies confidently when the promise breaks — show that, do not hide it",
  ],
  chart: false,
  *run() {
    yield {
      hold: 3,
      note: "the fold you wrote in act 5 has a name: the XOR TRICK — the bit-manipulation family. The instinct behind it (look for an operation that cancels) is the part that transfers. Here's the scorecard.",
    }
  },
  view(_f, d) {
    return {
      chips: null,
      panel: {
        kind: "recap",
        caption: `four approaches on this drawer (${d.nums.length} socks)`,
        rows: [
          {
            name: "Brute Force",
            built: "array only",
            cost: "O(n²) · O(1)",
            insight: "ask every sock about every other sock",
          },
          {
            name: "Hash Map",
            built: "array + map of counts",
            cost: "O(n) · O(n)",
            insight: "remember what you have seen — memory buys the search",
          },
          {
            name: "Sort & Scan",
            built: "sorted copy",
            cost: "O(n log n) · O(1)",
            insight: "order puts twins side by side — no memory needed",
          },
          {
            name: "XOR",
            built: "one integer",
            cost: "O(n) · O(1)",
            insight: "the values cancel each other; no structure at all",
          },
        ],
        note: "Next: the same instinct solves 'find the missing number' (XOR the values against the indices) and 'find the two loners' (split by a set bit). Or go back to where the map pattern was born.",
        links: [
          {
            label: "Two Sum",
            detail:
              "where the hash-map lookup was earned — the other half of this trade",
            href: "#/journey/two-sum",
          },
          {
            label: "Arrays & Hashing",
            detail: "the pattern page: what a map buys, and what it costs",
            href: "#/p/arrays-hashing",
          },
        ],
      },
    }
  },
}

// ---------- presets ----------

function pairsPlusSingle(pairs: number): number[] {
  const pool = distinct(pairs + 1)
  return shuffled([pool[0], ...pool.slice(1).flatMap((v) => [v, v])])
}

export const singleNumber: Journey<SingleNumberData> = {
  slug: "single-number",
  title: "Single Number",
  subtitle:
    "find the loner — then keep cutting the bill until the structure disappears",
  problemId: "single-number",
  leetcode: 136,
  acts: [story, brute, hash, sort, xor, challenge, recap],
  resources: [
    {
      label: "LeetCode 136",
      url: "https://leetcode.com/problems/single-number/",
    },
    {
      label: "GeeksforGeeks: element that appears once",
      url: "https://www.geeksforgeeks.org/dsa/find-the-element-that-appears-once/",
    },
    {
      label: "Wikipedia: XOR properties",
      url: "https://en.wikipedia.org/wiki/Exclusive_or#Properties",
    },
  ],
  presets: {
    random: {
      label: "random",
      make: () => ({ nums: pairsPlusSingle(randInt(3, 5)) }),
    },
    single: {
      label: "n = 1",
      make: () => ({ nums: [randInt(1, 99)] }),
      info: "Best case for everything: loops barely run. n = 1 is the edge every solution must survive.",
    },
    max: {
      label: "loner is the largest",
      make: () => {
        const pool = distinct(5).sort((a, b) => a - b)
        return {
          nums: shuffled([pool[4], ...pool.slice(0, 4).flatMap((v) => [v, v])]),
        }
      },
      info: "The single is the LARGEST value here. That is a nasty edge: any approach that walks in order and expects the odd one out to interrupt the pattern will run clean off the end. Watch which ones need a fallback line.",
    },
    zero: {
      label: "loner is 0",
      make: () => ({ nums: [0, 4, 4] }),
      info: "The loner is 0. A legal answer — and the same value a truthiness check calls 'nothing found'. Watch which approaches would be fooled by `if result:`.",
    },
    big: {
      label: "big (n = 25)",
      make: () => ({ nums: pairsPlusSingle(12) }),
      info: "n = 25. Same code, twenty-five socks. Watch the chart: one bar explodes while the others barely move. That gap is what complexity notation was trying to tell you.",
    },
    twosingles: {
      label: "two singles (broken promise)",
      make: () => {
        const pool = distinct(5)
        return {
          nums: shuffled([
            pool[0],
            pool[1],
            ...pool.slice(2).flatMap((v) => [v, v]),
          ]),
        }
      },
    },
    triple: {
      label: "a triple (broken promise)",
      make: () => {
        const pool = distinct(4)
        return {
          nums: shuffled([
            pool[0],
            pool[1],
            pool[1],
            pool[2],
            pool[2],
            pool[2],
          ]),
        }
      },
    },
  },
  defaultPreset: "random",
  classify: (d) => classifySingle(d.nums),
  describe: (d) => d.nums.join(", "),
  parse: (text) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= 0 && v < 128)
    return nums.length ? { nums } : null
  },
  challenge: SINGLE_NUMBER_CHALLENGE,
  // XOR is the idea this journey withholds, so bit-manipulation is masked with
  // it. ADDED rather than swapped: arrays-hashing was masked before and
  // unmasking it here would be a leak introduced by a re-filing.
  reveals: ["arrays-hashing", "bit-manipulation"],
  sample: { nums: [2, 2, 3] },
  edgeCases: [
    {
      key: "single",
      name: "one element",
      example: "[7] → 7",
      why: "Every loop that compares neighbours or hunts for a partner runs zero or one times. Code that only returns from inside a loop returns nothing for n = 1.",
      think:
        "Bring the smallest legal input first. Whatever your code holds after the loop — an accumulator, a fallback line — must already be the answer.",
      constraint:
        "1 <= nums.length <= 3 * 10^4 — a single element is legal input",
      preset: "single",
    },
    {
      key: "last",
      name: "loner is last in order",
      example: "[1, 1, 2, 2, 9] → 9",
      why: "An approach that walks in order and waits for the odd one out to break the pattern runs off the end without returning. The answer needs a line AFTER the loop.",
      think:
        "Put the special element at every boundary — first, last, the largest value — and ask where your code returns from in each case.",
      constraint:
        "nums.length is always odd, so the loner can sit at either end",
      preset: "max",
    },
    {
      key: "zero",
      name: "the answer is 0",
      example: "[0, 4, 4] → 0",
      why: "0 is a legal loner, and a lot of code treats 0 as 'nothing found' (`if result:`). Cancelling everything also leaves 0 behind, so the real answer 0 looks exactly like no answer.",
      think:
        "Test for presence, not truthiness: `is not None`, a found flag, or trust the promise. Bring a case where the answer is falsy.",
      constraint:
        "-3 * 10^4 <= nums[i] <= 3 * 10^4 — 0 is inside the range, so 0 is a legal answer",
      preset: "zero",
    },
    {
      key: "broken",
      name: "promise broken",
      example: "[2, 2, 5, 9] → ?",
      why: "With two loners the approaches disagree: one returns the first it meets, one returns a value that is in neither. The promise is what makes the fast trick legal, not decoration.",
      think:
        "Say the promise back to the interviewer before coding, and decide out loud what to return when it is violated.",
      constraint:
        "every value appears exactly twice except one — this is the promise, and it is the only one",
      preset: "twosingles",
    },
  ],
}
