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
}>

// ---------- the problem's promise ----------

export function classifySingle(nums: number[]) {
  const counts = new Map<number, number>()
  for (const v of nums) counts.set(v, (counts.get(v) || 0) + 1)
  const singles = [...counts].filter(([, c]) => c === 1).map(([v]) => v)
  const odd = [...counts].filter(([, c]) => c !== 1 && c !== 2)
  if (singles.length === 1 && odd.length === 0) return { ok: true, single: singles[0] }
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
  return { ok: false, warning: "Contract broken: no value appears exactly once — there is no answer to find." }
}

// ---------- generators ----------

function* runStory({ nums }: SingleNumberData): Generator<F> {
  yield { hold: 3, note: "A drawer of socks: every sock came in a pair, but one lost its twin. The drawer is shuffled. Your job: find the lonely one." }
  const where = new Map<number, number[]>()
  nums.forEach((v, i) => (where.get(v) || where.set(v, []).get(v)!).push(i))
  const dim: number[] = []
  for (const [v, idxs] of where) {
    if (idxs.length === 2) {
      yield { hold: 2, pair: idxs, dim: [...dim], note: `${v} and ${v} — a pair. Pairs are noise; ignore them.` }
      dim.push(...idxs)
    }
  }
  const single = [...where].find(([, ix]) => ix.length === 1)
  if (single) {
    yield { hold: 3, single: single[1][0], dim: [...dim], note: `${single[0]} stands alone — that is what every approach below must find. The question is only: at what cost in time and memory?` }
  } else {
    yield { hold: 3, dim: [...dim], note: "…this input has no loner. The problem's promise is broken — keep that in mind, it will matter later." }
  }
}

function* runBrute({ nums }: SingleNumberData): Generator<F> {
  for (let i = 0; i < nums.length; i++) {
    let found = false
    for (let j = 0; j < nums.length && !found; j++) {
      if (j === i) continue
      yield { line: 3, i, j, note: `is nums[${j}] = ${nums[j]} the partner of nums[${i}] = ${nums[i]}?` }
      if (nums[j] === nums[i]) {
        found = true
        yield { line: 3, i, j, note: `${nums[i]} has a partner at index ${j} — not our loner, move on` }
      }
    }
    if (!found) {
      yield { hold: 2, line: 4, i, answer: nums[i], note: `${nums[i]} searched the whole drawer and found no partner — answer!` }
      return
    }
  }
  yield { hold: 2, line: 4, note: "every element found a partner — the input broke the problem's promise" }
}

function* runHash({ nums }: SingleNumberData): Generator<F> {
  const counts = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    counts.set(x, (counts.get(x) || 0) + 1)
    yield { line: 2, i, counts: [...counts], note: `counts[${x}] is now ${counts.get(x)}` }
  }
  for (const [x, c] of counts) {
    if (c === 1) {
      yield { hold: 2, line: 4, scanX: x, counts: [...counts], answer: x, note: `counts[${x}] = 1 — ${x} is the single number` }
      return
    }
    yield { line: 4, scanX: x, counts: [...counts], note: `counts[${x}] = ${c} — not 1, keep scanning` }
  }
  yield { hold: 2, line: 4, counts: [...counts], note: "no count of exactly 1 — the input broke the problem's promise" }
}

function* runSort({ nums }: SingleNumberData): Generator<F> {
  const s = nums.slice().sort((a, b) => a - b)
  yield { hold: 2, line: 0, sorted: s, passed: 0, note: "sort a copy — duplicates become adjacent, the order does the matching" }
  for (let i = 0; i + 1 < s.length; i += 2) {
    if (s[i] !== s[i + 1]) {
      yield { line: 2, sorted: s, pair: [i, i + 1], passed: i, note: `${s[i]} ≠ ${s[i + 1]} — the pair pattern broke` }
      yield { hold: 2, line: 3, sorted: s, single: i, passed: i, answer: s[i], note: `${s[i]} has no partner — answer` }
      return
    }
    yield { line: 2, sorted: s, pair: [i, i + 1], passed: i, note: `${s[i]} = ${s[i + 1]} — a matched pair, skip both` }
  }
  const last = s.length - 1
  yield { hold: 2, line: 4, sorted: s, single: last, passed: last, answer: s[last], note: `every pair matched — last element ${s[last]} is the single` }
}

function* runXor({ nums }: SingleNumberData): Generator<F> {
  let acc = 0
  yield { line: 0, i: -1, x: null, acc, note: "start with acc = 0 (XOR identity: 0 XOR x = x)" }
  for (let i = 0; i < nums.length; i++) {
    const before = acc
    acc ^= nums[i]
    yield {
      line: 2, i, x: nums[i], acc,
      predict: i !== 1 ? undefined : {
        q: `acc is ${before}. The next value is ${nums[i]}. What does acc become?`,
        choices: [`${before + nums[i]} — they add`, `${before ^ nums[i]} — equal bits cancel, different bits stay`, `${nums[i]} — the newest value wins`],
        answer: 1,
      },
      note: `${before} XOR ${nums[i]} = ${acc} — equal bits cancel to 0`,
    }
  }
  yield { hold: 2, line: 3, i: nums.length, x: null, acc, answer: acc, note: `all pairs annihilated — acc = ${acc} is the single number` }
}

const bitRow = (tag: string, value: number, flip = 0): BitRowModel => ({ tag, value, flip, bits: BITS })

// ---------- the acts, in learning order ----------

const story: Act<SingleNumberData, F> = {
  key: "story",
  name: "The Problem",
  short: "start here",
  complexity: "no code yet — just the promise",
  insight: "",
  tools: [{ name: "Array", role: "a drawer of socks, addressed by position. Searching it costs a scan — every approach below is a different thing built beside it to avoid that scan." }],
  idea: "In plain words: a shuffled drawer where every value appears exactly twice, except one loner. Return the loner. The promise — exactly one single, everything else paired — is not decoration; it is what the clever solutions will lean on.",
  code: { pseudo: ["given: nums, length n", "promise: every value appears twice…", "…except exactly one value, once", "task: return that lone value"] },
  takeaways: [
    "the promise — exactly one single, all else paired — is a rule you may lean on",
    "correctness is not the game; every approach below is correct",
    "the game is cost: how much time, how much memory",
  ],
  quiz: [
    { q: "What does the input promise?", choices: ["every value appears exactly twice, except one that appears once", "the array is sorted", "all values are distinct"], answer: 0, explain: "Exactly one loner, everything else paired. Every clever approach leans on that." },
  ],
  run: runStory,
  view(f, d) {
    return { chips: chipRow(d.nums, { focus: f.pair ?? [], dim: f.dim ?? [], answer: f.single !== undefined ? [f.single] : [] }), panel: { kind: "none" } }
  },
}

const brute: Act<SingleNumberData, F> = {
  key: "brute",
  name: "Brute Force",
  short: "O(n²)",
  complexity: "O(n²) time · O(1) space",
  insight: "First instinct — no cleverness, just check everything.",
  tools: [{ name: "Array only", role: "nothing built alongside. Nowhere to write down what you already saw, so you re-look — n times." }],
  idea: "Pick up each sock and rummage through the whole drawer for its twin. For each of n elements you scan up to n others: n² looks. Fine for 9 socks, hopeless for a million. Watch the chart — this bar explodes as the array grows.",
  code: {
    pseudo: ["for i in 0..n-1:", "  found = false", "  for j ≠ i:", "    if nums[j] == nums[i]: found", "  if not found: return nums[i]"],
    python: ["for i in range(len(nums)):", "    found = False", "    for j in range(len(nums)):", "        if j != i and nums[j] == nums[i]: found = True", "    if not found: return nums[i]"],
    java: ["for (int i = 0; i < nums.length; i++) {", "    boolean found = false;", "    for (int j = 0; j < nums.length; j++)", "        if (j != i && nums[j] == nums[i]) found = true;", "    if (!found) return nums[i]; }"],
    cpp: ["for (int i = 0; i < n; i++) {", "    bool found = false;", "    for (int j = 0; j < n; j++)", "        if (j != i && nums[j] == nums[i]) found = true;", "    if (!found) return nums[i]; }"],
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
    { q: "Why is this O(n²)?", choices: ["it sorts the array first", "for each of n elements it scans up to n others", "it uses a map of size n"], answer: 1, explain: "n outer picks × n inner looks = n² comparisons. Nothing is remembered between picks." },
  ],
  run: runBrute,
  view(f, d) {
    const done = f.answer !== undefined
    return {
      chips: chipRow(d.nums, { focus: f.j !== undefined ? [f.j] : [], anchor: !done && f.i !== undefined ? [f.i] : [], dim: range(f.i ?? 0), answer: done ? [f.i!] : [] }),
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
    { name: "Hash Map", role: "value → count. The panel shows what it really is: a bucket table. The hash picks the bucket, colliding keys share one and get chained." },
  ],
  idea: "Keep a tally as you go: one pass to count every value, one pass over the tally to find the count of 1. We bought speed with memory — n² looks became n, but now a whole map rides along.",
  code: {
    pseudo: ["counts = empty map", "for x in nums:", "  counts[x] += 1", "for (x, c) in counts:", "  if c == 1: return x"],
    python: ["counts = {}", "for x in nums:", "    counts[x] = counts.get(x, 0) + 1", "for x, c in counts.items():", "    if c == 1: return x"],
    java: ["Map<Integer, Integer> counts = new HashMap<>();", "for (int x : nums)", "    counts.merge(x, 1, Integer::sum);", "for (var e : counts.entrySet())", "    if (e.getValue() == 1) return e.getKey();"],
    cpp: ["unordered_map<int, int> counts;", "for (int x : nums)", "    counts[x]++;", "for (auto& [x, c] : counts)", "    if (c == 1) return x;"],
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
    { q: "What did we pay to get from n² to n?", choices: ["nothing — it's free", "O(n) extra memory for the tally", "a sort"], answer: 1, explain: "The map can grow to n entries. Time was bought with space — that trade is the whole idea." },
  ],
  run: runHash,
  view(f, d) {
    const scanning = f.scanX !== undefined || f.line === 4
    const answer = scanning && f.answer !== undefined ? range(d.nums.length).filter((k) => d.nums[k] === f.answer) : []
    const dim = scanning ? range(d.nums.length).filter((k) => !answer.includes(k)) : range(f.i ?? 0)
    return {
      chips: chipRow(d.nums, { focus: !scanning && f.i !== undefined ? [f.i] : [], dim, answer }),
      panel: {
        kind: "hash",
        map: hashLayout(entriesOf(f.counts ?? []), { probe: f.scanX ?? null, hit: f.scanX !== undefined && f.answer === f.scanX, label: "counts — the memory we pay for (value × times seen)", fmt: "times" }),
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
  tools: [{ name: "Sorted array", role: "ORDER replaces the map: twins become neighbours, so adjacency does the matching for free. You pay n log n once instead of n memory forever." }],
  idea: "Sort it: twins end up adjacent, so pairs occupy positions (0,1), (2,3), … until the single breaks the pattern. No map — the order does the matching. Slower than counting (n log n), but lean. Already-sorted input changes nothing: the sort still runs.",
  code: {
    pseudo: ["sorted = sort(nums)", "for i = 0, 2, 4, ...", "  if sorted[i] != sorted[i+1]:", "    return sorted[i]", "return sorted[n-1]"],
    python: ["s = sorted(nums)", "for i in range(0, len(s) - 1, 2):", "    if s[i] != s[i + 1]:", "        return s[i]", "return s[-1]"],
    java: ["int[] s = nums.clone(); Arrays.sort(s);", "for (int i = 0; i + 1 < s.length; i += 2)", "    if (s[i] != s[i + 1])", "        return s[i];", "return s[s.length - 1];"],
    cpp: ["vector<int> s(nums); sort(s.begin(), s.end());", "for (int i = 0; i + 1 < (int)s.size(); i += 2)", "    if (s[i] != s[i + 1])", "        return s[i];", "return s.back();"],
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
    { q: "Why does stepping by 2 work after sorting?", choices: ["the array has an even length", "twins are adjacent, so every pair occupies (i, i+1) until the loner breaks the rhythm", "sorting removes duplicates"], answer: 1, explain: "Order does the matching: pairs sit together, and the first mismatch at an even index is the single." },
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
    return { chips, panel: { kind: "sorted", label: "sorted copy", chips: sorted } }
  },
}

const xor: Act<SingleNumberData, F> = {
  key: "xor",
  name: "XOR",
  short: "O(n) / O(1)",
  complexity: "O(n) time · O(1) space — the follow-up answer",
  insight: "One pass AND no memory — can math do the matching for us?",
  tools: [{ name: "One integer", role: "no map, no sort, no second array — a single 32-bit accumulator. The structure disappeared entirely; the property of XOR does the work the map was doing." }],
  idea: "x XOR x = 0, and XOR doesn't care about order. So XOR everything: each pair annihilates bit by bit, and only the loner's bits survive. One variable, one pass. This leans entirely on the promise — feed it two singles and it lies confidently.",
  code: {
    pseudo: ["acc = 0", "for x in nums:", "  acc = acc XOR x", "return acc"],
    python: ["acc = 0", "for x in nums:", "    acc ^= x", "return acc"],
    java: ["int acc = 0;", "for (int x : nums)", "    acc ^= x;", "return acc;"],
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
    { q: "Why does XOR-ing everything leave only the single?", choices: ["XOR sorts the bits", "x ^ x = 0 and order doesn't matter, so every pair cancels", "XOR counts occurrences"], answer: 1, explain: "Pairs annihilate bit by bit regardless of where they sit; what remains is the value with no twin." },
    { q: "Feed XOR an array with TWO singles. It returns…", choices: ["the first single", "their XOR — possibly a value not in the array", "an error"], answer: 1, explain: "XOR leans entirely on the promise. Break it and the trick lies confidently." },
  ],
  run: runXor,
  view(f, d) {
    const i = f.i ?? 0
    const done = f.answer !== undefined
    const answer = done ? range(d.nums.length).filter((k) => d.nums[k] === f.answer) : []
    const dim = done ? range(d.nums.length).filter((k) => !answer.includes(k)) : range(Math.min(i, d.nums.length))
    const rows: BitRowModel[] = []
    if (f.x !== null && f.x !== undefined) rows.push(bitRow("x", f.x))
    rows.push(bitRow("acc", f.acc ?? 0, f.x ?? 0))
    return { chips: chipRow(d.nums, { focus: i >= 0 && i < d.nums.length && !done ? [i] : [], dim, answer }), panel: { kind: "bits", rows } }
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
  subtitle: "find the loner — then keep cutting the bill until the structure disappears",
  problemId: "single-number",
  leetcode: 136,
  acts: [story, brute, hash, sort, xor],
  resources: [
    { label: "LeetCode 136", url: "https://leetcode.com/problems/single-number/" },
    { label: "GeeksforGeeks: element that appears once", url: "https://www.geeksforgeeks.org/dsa/find-the-element-that-appears-once/" },
    { label: "Wikipedia: XOR properties", url: "https://en.wikipedia.org/wiki/Exclusive_or#Properties" },
  ],
  presets: {
    random: { label: "random", make: () => ({ nums: pairsPlusSingle(randInt(3, 5)) }) },
    single: { label: "n = 1", make: () => ({ nums: [randInt(1, 99)] }), info: "Best case for everything: loops barely run. n = 1 is the edge every solution must survive." },
    max: {
      label: "loner is the largest",
      make: () => {
        const pool = distinct(5).sort((a, b) => a - b)
        return { nums: shuffled([pool[4], ...pool.slice(0, 4).flatMap((v) => [v, v])]) }
      },
      info: "The single is the LARGEST value here. That is a nasty edge: any approach that walks in order and expects the odd one out to interrupt the pattern will run clean off the end. Watch which ones need a fallback line.",
    },
    big: { label: "big (n = 25)", make: () => ({ nums: pairsPlusSingle(12) }), info: "n = 25. Same code, twenty-five socks. Watch the chart: one bar explodes while the others barely move. That gap is what complexity notation was trying to tell you." },
    twosingles: {
      label: "two singles (broken promise)",
      make: () => {
        const pool = distinct(5)
        return { nums: shuffled([pool[0], pool[1], ...pool.slice(2).flatMap((v) => [v, v])]) }
      },
    },
    triple: {
      label: "a triple (broken promise)",
      make: () => {
        const pool = distinct(4)
        return { nums: shuffled([pool[0], pool[1], pool[1], pool[2], pool[2], pool[2]]) }
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
  sample: { nums: [2, 2, 3] },
}
