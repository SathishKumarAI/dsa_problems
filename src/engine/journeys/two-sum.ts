// Two Sum (LeetCode 1) — journey content: story act + four approaches
// (brute → two pointers → two-pass hash → one-pass hash) as frame
// generators, then the code challenge and the recap. Owns this problem's
// narrative, generators, presets and contract check. Owns no rendering:
// each act's view() returns a StageModel and src/features/journey draws it.
//
// Pedagogy: no act names a later act (enforced by journeys.test.ts).

import { chipRow, range } from "../chips.ts"
import { entriesOf, hashLayout } from "../hashmap.ts"
import { distinct, randInt, shuffled } from "../random.ts"
import type { Act, Frame, Journey, StageModel, SumModel } from "../types.ts"

export interface TwoSumData {
  nums: number[]
  target: number
}

type F = Frame<{
  i?: number
  j?: number
  sum?: number
  pair?: number[]
  answer?: number[]
  order?: number[]
  s?: number[]
  L?: number
  R?: number
  need?: number
  seen?: [number, number][]
  hit?: boolean
  op?: "get" | "set"
}>

// ---------- the problem's promise ----------

function allPairs(nums: number[], target: number) {
  const pairs: [number, number][] = []
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] + nums[j] === target) pairs.push([i, j])
  return pairs
}

export function classifyTwoSum(nums: number[], target: number) {
  const pairs = allPairs(nums, target)
  if (pairs.length === 1) return { ok: true, pair: pairs[0] }
  if (pairs.length === 0)
    return {
      ok: false,
      warning: `Contract broken: no pair sums to ${target}. Every approach comes home empty-handed — watch each one's "no solution" ending.`,
    }
  return {
    ok: false,
    warning: `Contract broken: ${pairs.length} pairs sum to ${target}. "Exactly one solution" is the promise — the approaches may return DIFFERENT (equally valid) pairs depending on their search order.`,
  }
}

// ---------- generators ----------

function* runStory({ nums, target }: TwoSumData): Generator<F> {
  yield {
    hold: 3,
    noChips: true,
    note: `Why does this problem exist? You're at a register holding a gift card with exactly ${target} on it. Store rule: the card is use-it-or-lose-it, and you must buy exactly TWO items. Spend it to zero or leave money behind.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: `The cashier doesn't want the prices — they want WHICH shelf slots you took, so they can restock them. That tiny detail (positions, not values) will quietly shape every solution you build. Ready? Here's the shelf.`,
  }
  yield {
    hold: 3,
    note: `A gift card worth exactly ${target}. The shelf holds ${nums.length} priced items. Buy exactly two items that spend the card to zero — and report WHICH shelf slots they sit in, not their prices.`,
  }
  const pairs = allPairs(nums, target)
  if (pairs.length) {
    const [i, j] = pairs[0]
    yield {
      hold: 3,
      pair: [i, j],
      note: `${nums[i]} + ${nums[j]} = ${target} — this pair exists, and the promise says it's the only one. The game: find it without trying every combination.`,
    }
    yield {
      hold: 3,
      pair: [i, j],
      answer: [i, j],
      note: `The answer is the indices [${i}, ${j}], not the values ${nums[i]} and ${nums[j]}. Interviews dock points for returning values — remember that when we sort later.`,
    }
  } else {
    yield {
      hold: 3,
      corner: "nosolution",
      note: "…no pair spends the card exactly. The promise is broken — keep that in mind, it will matter.",
    }
  }
}

function* runBrute({ nums, target }: TwoSumData): Generator<F> {
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
        note: `${nums[i]} + ${nums[j]} = ${sum}${sum === target ? ` — that's the target!` : ` — not ${target}, keep looking`}${neg ? ". A negative price is still just a number to add — the arithmetic never cared about the sign" : ""}`,
      }
      if (sum === target) {
        const equal = nums[i] === nums[j]
        yield {
          hold: 2,
          line: 3,
          i,
          j,
          sum,
          answer: [i, j],
          corner: equal ? "duplicates" : nums.length === 2 ? "tiny" : undefined,
          predict: {
            q: `Found it: ${nums[i]} + ${nums[j]} = ${target}. What does the function return?`,
            choices: [
              `the indices [${i}, ${j}]`,
              `the values [${nums[i]}, ${nums[j]}]`,
              `the sum ${target}`,
            ],
            answer: 0,
          },
          note: `return [${i}, ${j}] — the positions of ${nums[i]} and ${nums[j]}${equal ? ". Two different slots, same price — legal, because j started at i + 1 so a slot never met itself" : nums.length === 2 ? ". n = 2: the loops ran exactly once — the smallest input is the whole search" : ""}`,
        }
        return
      }
    }
  }
  yield {
    hold: 2,
    line: 4,
    corner: "nosolution",
    note: "tried every pair — no solution, the promise was broken",
  }
}

function* runTwoPointer({ nums, target }: TwoSumData): Generator<F> {
  const order = range(nums.length).sort((a, b) => nums[a] - nums[b])
  const s = order.map((i) => nums[i])
  let L = 0
  let R = s.length - 1
  let askedL = false
  let askedR = false
  const hasNeg = nums.some((v) => v < 0)
  yield {
    hold: 2,
    line: 0,
    order,
    s,
    L,
    R,
    corner: hasNeg ? "negatives" : undefined,
    note: `sort — but drag each value's ORIGINAL index along (the tiny #numbers), because the answer must be positions${hasNeg ? ". Negatives sort to the front; sorting compares values, it never uses one as a position" : ""}`,
  }
  while (L < R) {
    const sum = s[L] + s[R]
    yield { line: 3, order, s, L, R, sum, note: `${s[L]} + ${s[R]} = ${sum}` }
    if (sum === target) {
      const ans = [order[L], order[R]].sort((a, b) => a - b)
      const equal = s[L] === s[R]
      yield {
        hold: 2,
        line: 4,
        order,
        s,
        L,
        R,
        sum,
        answer: ans,
        corner: equal ? "duplicates" : nums.length === 2 ? "tiny" : undefined,
        note: `hit! sorted slots ${L} and ${R} map back to original indices [${ans}]${equal ? ". Equal values sit side by side once sorted, and L < R keeps them two different slots" : nums.length === 2 ? ". n = 2: L and R started on the only pair there is" : ""}`,
      }
      return
    }
    const choices = [
      "left pointer → right, onto a bigger value",
      "right pointer → left, onto a smaller value",
      "both move inward",
    ]
    if (sum < target) {
      L++
      yield {
        line: 5,
        order,
        s,
        L,
        R,
        predict: askedL
          ? undefined
          : {
              q: `${sum} is LESS than ${target}. Which pointer moves, and where?`,
              choices,
              answer: 0,
            },
        note: `${sum} < ${target} — need more, the left pointer walks right onto a bigger value`,
      }
      askedL = true
    } else {
      R--
      yield {
        line: 5,
        order,
        s,
        L,
        R,
        predict: askedR
          ? undefined
          : {
              q: `${sum} is MORE than ${target}. Which pointer moves, and where?`,
              choices,
              answer: 1,
            },
        note: `${sum} > ${target} — too much, the right pointer walks left onto a smaller value`,
      }
      askedR = true
    }
  }
  yield {
    hold: 2,
    line: 5,
    order,
    s,
    L,
    R,
    corner: "nosolution",
    note: "pointers met — no solution, the promise was broken",
  }
}

function* runHash({ nums, target }: TwoSumData): Generator<F> {
  const seen = new Map<number, number>()
  let negShown = false
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    const hit = seen.has(need)
    const neg = !negShown && need < 0
    if (neg) negShown = true
    yield {
      line: 3,
      i,
      need,
      seen: [...seen],
      hit,
      corner: neg ? "negatives" : undefined,
      hold: neg ? 2 : undefined,
      note: `at ${nums[i]}: I need ${need} — ${hit ? `and I've SEEN it, at index ${seen.get(need)}!` : "haven't seen it yet"}${neg ? ". A negative need is just another key to look up — keys are values, never positions" : ""}`,
    }
    if (hit) {
      const self = need === nums[i]
      yield {
        hold: 2,
        line: 3,
        i,
        need,
        seen: [...seen],
        hit,
        answer: [seen.get(need)!, i],
        corner: self ? "duplicates" : nums.length === 2 ? "tiny" : undefined,
        note: `return [${seen.get(need)}, ${i}] — one pass, done${self ? `. I needed ${need} and I AM ${nums[i]} — it worked only because the check ran BEFORE the store, so the map held the OTHER copy` : nums.length === 2 ? ". n = 2: one store, one lookup — the whole algorithm" : ""}`,
      }
      return
    }
    seen.set(nums[i], i)
    yield {
      line: 4,
      i,
      seen: [...seen],
      predict:
        i > 0
          ? undefined
          : {
              q: `${nums[0]}'s complement isn't in the map. What happens next?`,
              choices: [
                "store this value with its index, move on",
                "scan the rest of the array for the complement",
                "give up — no solution",
              ],
              answer: 0,
            },
      note: `remember: ${nums[i]} lives at index ${i}`,
    }
  }
  yield {
    hold: 2,
    line: 4,
    seen: [],
    corner: "nosolution",
    note: "scanned everything — no solution, the promise was broken",
  }
}

function* runTwoPassHash({ nums, target }: TwoSumData): Generator<F> {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i) // duplicates overwrite — pass 2's j != i guard handles it
    yield {
      line: 2,
      i,
      seen: [...map],
      note: `pass 1: file ${nums[i]} under index ${i}`,
    }
  }
  let negShown = false
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    const j = map.get(need)
    const hit = map.has(need) && j !== i
    const self = map.has(need) && j === i
    const neg = !negShown && need < 0
    if (neg) negShown = true
    yield {
      line: 4,
      i,
      need,
      seen: [...map],
      hit,
      corner: self ? "duplicates" : neg ? "negatives" : undefined,
      hold: self || neg ? 2 : undefined,
      note: `pass 2: at ${nums[i]} I need ${need} — ${!map.has(need) ? "not in the map" : self ? `the map points at index ${j}… that's MYSELF. The j != i guard saves us` : `the map says index ${j}`}${neg ? ". A negative need is just another key" : ""}`,
    }
    if (hit) {
      const ans = [i, j!].sort((a, b) => a - b)
      yield {
        hold: 2,
        line: 5,
        i,
        need,
        seen: [...map],
        hit,
        answer: ans,
        corner: nums.length === 2 ? "tiny" : undefined,
        note: `return [${ans}]${nums.length === 2 ? " — n = 2: two files, one lookup" : ""}`,
      }
      return
    }
  }
  yield {
    hold: 2,
    line: 5,
    corner: "nosolution",
    note: "no complement found — the promise was broken",
  }
}

// ---------- view helpers ----------

const eq = (a: number, b: number, sum: number, target: number): SumModel => ({
  a,
  b,
  sum,
  target,
})

function needPanel(f: F, d: TwoSumData, label: string): StageModel["panel"] {
  const map = hashLayout(entriesOf(f.seen ?? []), {
    probe: f.need ?? null,
    hit: !!f.hit,
    label,
  })
  return f.need !== undefined && f.i !== undefined
    ? {
        kind: "need",
        need: f.need,
        hit: !!f.hit,
        target: d.target,
        x: d.nums[f.i],
        map,
      }
    : { kind: "hash", map }
}

// ---------- the acts, in learning order ----------

const story: Act<TwoSumData, F> = {
  key: "story",
  name: "The Problem",
  short: "start here",
  complexity: "no code yet — just the promise",
  insight: "",
  tools: [
    {
      name: "Array",
      role: "a shelf of prices, addressed by position. It's all you're handed — every approach below is a decision about what to build BESIDE it.",
    },
  ],
  idea: "In plain words: given prices and a target, find the TWO positions whose values add to the target. Promises: exactly one such pair exists, and you can't use the same element twice. Return indices, not values — that detail shapes every solution below.",
  code: {
    pseudo: [
      "given: nums and a target",
      "promise: exactly one pair sums to target",
      "you may not use the same element twice",
      "task: return the two indices",
    ],
  },
  hints: [
    "Reread the ask. It says return INDICES. Say the output for [2, 7, 11, 15] with target 9 out loud — is it [2, 7] or [0, 1]?",
    "Formalize it as one question: input = an array of integers and a target; output = the two positions whose values add to the target. Which words in the statement are promises you may lean on?",
    "Bring three inputs before any code: the smallest legal one (n = 2), a plain one, and a corner one — equal values, no answer, negatives. The corner cases listed here are those inputs; load one and watch.",
  ],
  takeaways: [
    "the answer is indices, not values — index bookkeeping is half the problem",
    '"exactly one solution" is a promise the fast solutions lean on',
    "same element twice is forbidden: j starts at i+1, maps check before storing",
  ],
  quiz: [
    {
      q: "What exactly must you return?",
      choices: [
        "the two values that hit the target",
        "the two indices where they sit",
        "the sum itself",
      ],
      answer: 1,
      explain:
        "Values are easy to read off — the problem wants WHERE they are. Index bookkeeping shapes every solution.",
    },
    {
      q: "How many valid pairs does the input promise?",
      choices: ["exactly one", "at least one", "any number"],
      answer: 0,
      explain:
        '"Exactly one solution exists" — the fast approaches quietly lean on that promise.',
    },
  ],
  run: runStory,
  view(f, d) {
    if (f.noChips)
      return { chips: null, panel: { kind: "story", glyph: "🎁 → 🛒 → ❓" } }
    return {
      chips: chipRow(d.nums, {
        focus: f.pair && !f.answer ? f.pair : [],
        answer: f.answer ?? [],
      }),
      panel: { kind: "none" },
    }
  },
}

const brute: Act<TwoSumData, F> = {
  key: "brute",
  name: "Brute Force",
  short: "O(n²)",
  complexity: "O(n²) time · O(1) space",
  insight: "First instinct — try every pair.",
  tools: [
    {
      name: "Array only",
      role: "read by index, nothing built alongside it. Zero extra memory is exactly why every question costs a full scan — you have nowhere to write an answer down.",
    },
  ],
  idea: 'Hold each item (▲) and try it against every later item (ring). j starts at i+1, not 0 — that halves the work and enforces "no element twice" for free. Still O(n²): fine for a shelf, hopeless for a warehouse.',
  code: {
    pseudo: [
      "for i in 0..n-1:",
      "  for j in i+1..n-1:",
      "    if nums[i] + nums[j] == target:",
      "      return [i, j]",
      "no solution",
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
      "            return new int[]{ i, j };",
      "return new int[]{};",
    ],
    cpp: [
      "for (int i = 0; i < n - 1; i++)",
      "    for (int j = i + 1; j < n; j++)",
      "        if (nums[i] + nums[j] == target)",
      "            return { i, j };",
      "return {};",
    ],
  },
  takeaways: [
    "the pair-checking nested loop is the O(n²) shape — learn to see it instantly",
    "starting j at i+1 both halves the work and bans using an element twice",
    "always know the brute force: it is the baseline every trick must beat",
  ],
  hints: [
    "Watch which pairs get tried — is any pair ever tried twice?",
    "i HOLDS one item (▲) while j sweeps everything after it. Together they visit each unordered pair exactly once.",
    "The line to stare at: for j in i+1..n-1 — j never looks backwards, so no repeats and no self-pairs.",
  ],
  quiz: [
    {
      q: "Why does j start at i+1 instead of 0?",
      choices: [
        "it saves memory",
        "it halves the work AND bans using the same element twice",
        "it makes the loop O(n)",
      ],
      answer: 1,
      explain:
        "Pairs are unordered — checking (i,j) and (j,i) is the same check. Starting at i+1 skips the mirror half and can never pair an element with itself.",
    },
    {
      q: "The nested pair-checking loop costs…",
      choices: [
        "O(n) — one pass per element",
        "O(n log n) — like sorting",
        "O(n²) — every pair",
      ],
      answer: 2,
      explain:
        "n choices for i times up to n for j ≈ n²/2 checks. Fine for a shelf, hopeless for a warehouse.",
    },
  ],
  run: runBrute,
  view(f, d) {
    const dim = f.answer ? [] : range(f.i ?? 0)
    return {
      chips: chipRow(d.nums, {
        anchor: f.i !== undefined && !f.answer ? [f.i] : [],
        focus: f.j !== undefined && !f.answer ? [f.j] : [],
        dim,
        answer: f.answer ?? [],
      }),
      panel:
        f.sum !== undefined
          ? { kind: "sum", eq: eq(d.nums[f.i!], d.nums[f.j!], f.sum, d.target) }
          : { kind: "none" },
    }
  },
}

const twoptr: Act<TwoSumData, F> = {
  key: "twoptr",
  name: "Two Pointers",
  short: "O(n log n)",
  complexity: "O(n log n) time · O(n) space (index map)",
  insight: "Trying every pair repeats work — order the values and walk inward.",
  tools: [
    {
      name: "Sorted array",
      role: "ORDER is the tool here. Sorted, one comparison rules out a whole side of the range — unsorted, that deduction is illegal.",
    },
    {
      name: "Index array",
      role: "the sort scrambles positions, so a parallel list of original indices rides along. The bookkeeping IS the O(n) space.",
    },
    {
      name: "Two integer pointers",
      role: "L and R — two variables, not a structure. That's why the space bill stays small.",
    },
  ],
  idea: "Sort, then squeeze: a pointer at each end. Sum too small → only moving the LEFT pointer up can help; too big → only the RIGHT down. Each probe kills a whole pointer position, so the walk is linear after the sort. The trap: sorting scrambles positions — carry each value's original index along or you'll return the wrong thing.",
  code: {
    pseudo: [
      "order = indices sorted by value",
      "L = 0, R = n-1",
      "while L < R:",
      "  s = val[L] + val[R]",
      "  if s == target: return their indices",
      "  s < target ? L += 1 : R -= 1",
    ],
    python: [
      "order = sorted(range(len(nums)), key=lambda i: nums[i])",
      "L, R = 0, len(nums) - 1",
      "while L < R:",
      "    s = nums[order[L]] + nums[order[R]]",
      "    if s == target: return [order[L], order[R]]",
      "    L, R = (L + 1, R) if s < target else (L, R - 1)",
    ],
    java: [
      "int[][] p = valueIndexPairs(nums); Arrays.sort(p, (a, b) -> a[0] - b[0]);",
      "int L = 0, R = p.length - 1;",
      "while (L < R) {",
      "    int s = p[L][0] + p[R][0];",
      "    if (s == target) return new int[]{ p[L][1], p[R][1] };",
      "    if (s < target) L++; else R--; }",
    ],
    cpp: [
      "vector<array<int,2>> p; /* {value, index} */ sort(p.begin(), p.end());",
      "int L = 0, R = n - 1;",
      "while (L < R) {",
      "    int s = p[L][0] + p[R][0];",
      "    if (s == target) return { p[L][1], p[R][1] };",
      "    s < target ? L++ : R--; }",
    ],
  },
  takeaways: [
    "sorted + two pointers squeezing inward = linear scan; the sort is the cost",
    "each comparison eliminates a whole position — that's why it can't miss",
    "index-recovery trap: sort scrambles positions, so sort the INDICES by value",
  ],
  hints: [
    "The array got sorted before the pointers started. What did that buy?",
    "When the sum is too SMALL, only the left pointer moving right can raise it — every other move is provably useless. That's why nothing gets skipped.",
    "The line to stare at: s < target ? L += 1 : R -= 1 — exactly one forced move per probe.",
  ],
  quiz: [
    {
      q: "Why must the array be sorted for two pointers to work?",
      choices: [
        "sorted arrays use less memory",
        "so one comparison can eliminate a whole pointer position",
        "duplicates disappear after sorting",
      ],
      answer: 1,
      explain:
        "If the ends sum too small, the left value fails with its BEST partner — so it fails with all of them. Only order makes that deduction valid.",
    },
    {
      q: "What does sorting break, and how do we repair it?",
      choices: [
        "nothing — return the sorted positions",
        "the original indices — carry each value's index along through the sort",
        "the values — copy the array first",
      ],
      answer: 1,
      explain:
        "The answer must be ORIGINAL positions. Sort the indices by value (the tiny #numbers) or you return the wrong thing.",
    },
  ],
  run: runTwoPointer,
  view(f, d) {
    const answer = f.answer ?? []
    const chips = chipRow(d.nums, {
      dim: range(d.nums.length).filter((k) => !answer.includes(k)),
      answer,
    })
    if (!f.s) return { chips, panel: { kind: "none" } }
    const L = f.L!
    const R = f.R!
    const sorted = chipRow(f.s, {
      anchor: [L],
      focus: [R],
      dim: range(f.s.length).filter((k) => k < L || k > R),
      answer: f.answer ? [L, R] : [],
      subs: f.order!.map((o) => "#" + o),
    })
    return {
      chips,
      panel: {
        kind: "sorted",
        label: "sorted view (tiny number = original index)",
        chips: sorted,
        eq:
          f.sum !== undefined ? eq(f.s[L], f.s[R], f.sum, d.target) : undefined,
      },
    }
  },
}

const twopass: Act<TwoSumData, F> = {
  key: "twopass",
  name: "Two-Pass Hash",
  short: "O(n) / O(n)",
  complexity: "O(n) time · O(n) space — two passes",
  insight:
    "Sorting was only for finding things fast — a map finds in O(1) with no sort. Build the whole index first.",
  tools: [
    {
      name: "Array",
      role: "unchanged and unsorted — two straight passes over it.",
    },
    {
      name: "Hash Map",
      role: "value → index. Watch the panel: it is NOT a list of pills. It's a bucket table, and the hash decides which bucket a key lands in.",
    },
  ],
  idea: "Pass 1: file every value under its index, like building a phone book. Pass 2: for each value, look up its complement. New trap: the map now contains YOU, so target = 2x can match an element with itself — the j != i guard is mandatory. Duplicates survive because later entries overwrite earlier ones.",
  code: {
    pseudo: [
      "map = empty (value → index)",
      "for i, x in nums:   # pass 1",
      "  map[x] = i",
      "for i, x in nums:   # pass 2",
      "  j = map.get(target - x)",
      "  if j exists and j != i: return [i, j]",
    ],
    python: [
      "seen = {}",
      "for i, x in enumerate(nums):",
      "    seen[x] = i",
      "for i, x in enumerate(nums):",
      "    j = seen.get(target - x)",
      "    if j is not None and j != i: return [i, j]",
    ],
    java: [
      "Map<Integer, Integer> map = new HashMap<>();",
      "for (int i = 0; i < nums.length; i++)",
      "    map.put(nums[i], i);",
      "for (int i = 0; i < nums.length; i++) {",
      "    Integer j = map.get(target - nums[i]);",
      "    if (j != null && j != i) return new int[]{ i, j }; }",
    ],
    cpp: [
      "unordered_map<int, int> numMap;",
      "for (int i = 0; i < n; i++)",
      "    numMap[nums[i]] = i;",
      "for (int i = 0; i < n; i++) {",
      "    int complement = target - nums[i];",
      "    if (numMap.count(complement) && numMap[complement] != i) return { i, numMap[complement] }; }",
    ],
  },
  takeaways: [
    "build-then-lookup: two clean O(n) passes — easier to reason about than one-pass",
    "the j != i guard is mandatory: during pass 2 the map contains the current element",
    "duplicates work because later entries overwrite — [3,3] keeps index 1, and index 0 finds it",
  ],
  hints: [
    "Pass 1 never answers anything. What is it building, and for whom?",
    "It's a phone book: value → index. Pass 2 just looks up target − x in O(1) instead of scanning.",
    "The line to stare at: if j exists and j != i — the map contains YOU, so you could match yourself.",
  ],
  quiz: [
    {
      q: "In pass 2, why is the j != i guard mandatory?",
      choices: [
        "the map might point the current element at ITSELF when target = 2×x",
        "the map might be empty",
        "j could run past the end of the array",
      ],
      answer: 0,
      explain:
        'Pass 1 filed every element — including the one you\'re standing on. For target 6 at value 3, the map says "3 lives at your own index". The guard rejects that self-match.',
    },
  ],
  run: runTwoPassHash,
  view(f, d) {
    const answer = f.answer ?? []
    const dim = f.answer
      ? range(d.nums.length).filter((k) => !answer.includes(k))
      : []
    const label =
      f.need === undefined
        ? "pass 1 — building the map"
        : "pass 2 — looking up complements"
    return {
      chips: chipRow(d.nums, {
        focus: f.i !== undefined && !f.answer ? [f.i] : [],
        dim,
        answer,
      }),
      panel: needPanel(f, d, label),
    }
  },
}

const hash: Act<TwoSumData, F> = {
  key: "hash",
  name: "One-Pass Hash",
  short: "O(n) / O(n)",
  complexity: "O(n) time · O(n) space — the interview answer",
  insight: "Why two trips? Check for the complement WHILE building the map.",
  tools: [
    { name: "Array", role: "one pass, left to right, never revisited." },
    {
      name: "Hash Map",
      role: "built AS you walk, so it only ever holds what's behind you. Below the waterline it's still buckets: hash, mod, chain — and it doubles itself when it gets crowded.",
    },
  ],
  idea: 'Walk once. At each value x, ask the map: "has target − x walked past already?" If yes, done — the map remembers where. If no, file x under its index and continue. One pass, O(1) lookups. Order matters: CHECK before you STORE, or x could match itself when target = 2x.',
  code: {
    pseudo: [
      "seen = empty map (value → index)",
      "for i, x in nums:",
      "  need = target - x",
      "  if need in seen: return [seen[need], i]",
      "  seen[x] = i",
    ],
    python: [
      "seen = {}",
      "for i, x in enumerate(nums):",
      "    need = target - x",
      "    if need in seen: return [seen[need], i]",
      "    seen[x] = i",
    ],
    java: [
      "Map<Integer, Integer> seen = new HashMap<>();",
      "for (int i = 0; i < nums.length; i++) {",
      "    int need = target - nums[i];",
      "    if (seen.containsKey(need)) return new int[]{ seen.get(need), i };",
      "    seen.put(nums[i], i); }",
    ],
    cpp: [
      "unordered_map<int, int> numMap;",
      "for (int i = 0; i < n; i++) {",
      "    int complement = target - nums[i];",
      "    if (numMap.count(complement)) return { numMap[complement], i };",
      "    numMap[nums[i]] = i; }",
    ],
  },
  takeaways: [
    '"have I seen my complement?" — THE hash-map interview pattern, memorize the shape',
    "check the map BEFORE storing, or target = 2x matches an element with itself",
    "one pass, O(n) time, O(n) space — beats two pointers by skipping the sort",
  ],
  hints: [
    "At index i, what exactly does the map contain?",
    "Only elements BEHIND you. So a hit always pairs (someone in the past, you) — no self-match possible.",
    "The order to stare at: check need in seen BEFORE seen[x] = i. Swap them and target = 2x breaks.",
  ],
  quiz: [
    {
      q: "Why CHECK the map before STORING the current value?",
      choices: [
        "checking first is faster",
        "store first and x can match itself when target = 2×x",
        "the map must stay small",
      ],
      answer: 1,
      explain:
        'Store 3 first with target 6, then ask "seen 3?" — yes, yourself. Check-before-store means the map only ever holds elements BEHIND you.',
    },
    {
      q: "One-pass hash costs…",
      choices: [
        "O(n) time · O(n) space",
        "O(n log n) time · O(1) space",
        "O(n²) time · O(n) space",
      ],
      answer: 0,
      explain:
        "One walk, O(1) lookups, and a map that can grow to n entries. Time is bought with space — that trade IS the pattern.",
    },
  ],
  run: runHash,
  view(f, d) {
    const answer = f.answer ?? []
    const dim = f.answer
      ? range(d.nums.length).filter((k) => !answer.includes(k))
      : range(f.i ?? 0)
    return {
      chips: chipRow(d.nums, {
        focus: f.i !== undefined && !f.answer ? [f.i] : [],
        dim,
        answer,
      }),
      panel: needPanel(f, d, "seen — what your code sees (value @ index)"),
    }
  },
}

export const TWO_SUM_CHALLENGE = {
  fname: "twoSum",
  signature: "function twoSum(nums, target) {",
  starter:
    "// nums and target are in scope — return the two indices\nconst seen = new Map();\n\n",
  cases: [
    { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
    { nums: [3, 2, 4], target: 6, expected: [1, 2] },
    { nums: [3, 3], target: 6, expected: [0, 1], tag: "equal values" },
    { nums: [5, 75, 25], target: 100, expected: [1, 2] },
    { nums: [3, 1, 3, 8], target: 6, expected: [0, 2], tag: "duplicates" },
    {
      nums: [1, 9, 4, 6, 30],
      target: 31,
      expected: [0, 4],
      tag: "answer at extremes",
    },
  ],
  review: [
    {
      q: "No-solution path returns something sane (an empty array, not undefined)",
      check: (c: string) => /return\s*(\[\]|null)/.test(c),
    },
    {
      q: "One pass, not nested loops",
      check: (c: string) => (c.match(/\bfor\b|\bwhile\b/g) || []).length <= 1,
    },
    {
      q: "Complement checked BEFORE storing — the target = 2x self-match trap",
      check: (c: string) => {
        const h = c.search(/\.has\(|in seen| in /)
        const s = c.search(/\.set\(|seen\[/)
        return h > -1 && s > -1 ? h < s : undefined
      },
    },
    {
      q: "Say the invariant out loud: what exactly does the map contain when you stand at index i?",
    },
    { q: "Could you re-derive this cold tomorrow, without the reference?" },
  ],
  big: {
    n: 400,
    make: () => {
      const nums = shuffled(distinct(400, 1, 5000))
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
    "const seen = new Map();\n" +
    "for (let i = 0; i < nums.length; i++) {\n" +
    "  const need = target - nums[i];\n" +
    "  if (seen.has(need)) return [seen.get(need), i];\n" +
    "  seen.set(nums[i], i);\n" +
    "}\nreturn [];",
}

const challenge: Act<TwoSumData, F> = {
  key: "challenge",
  name: "Code It",
  short: "prove it",
  complexity: "your turn — all 6 cases must pass",
  insight:
    "Watching is not writing. The pattern is yours when your fingers can produce it.",
  tools: [
    {
      name: "Your call",
      role: "array alone, sorted array + pointers, or a map. The structure you reach for IS the complexity you get — the scorecard will price your choice.",
    },
  ],
  idea: "Write the body of twoSum(nums, target) in the editor under the array. Your code runs in a sandboxed Worker against the same cases the site's own tests use — including the equal-values trap and the answer-at-the-extremes input. Any working approach passes; the one-pass map is the one to reach for.",
  code: { pseudo: hash.code.pseudo },
  takeaways: [
    "reproduce the shape from memory — peeking at the reference is allowed, twice is a signal",
    "your solution may be brute force; watch it pass and ask what n would break it",
    "the duplicates case [3,1,3,8] is where check-before-store proves itself",
  ],
  gate: "pass",
  chart: false,
  hints: [
    'Say the plan in one sentence before typing: "as I walk, I ask whether my complement already walked past."',
    "You want a Map. At each value x: need = target − x. If the map has need, you're done; otherwise file x under its index.",
    "Skeleton to fill: a for-loop over nums → const need = target - nums[i] → if (seen.has(need)) return [seen.get(need), i] → seen.set(nums[i], i).",
  ],
  nextLabel: "It's green — show me what I earned ▸",
  *run({ nums, target }, ctx) {
    if (!ctx.trace) {
      yield {
        hold: 2,
        line: -1,
        note: "write the function body in the editor below, hit Run tests — or trace it and WATCH your own code walk the array",
      }
      return
    }
    const { events, result, error } = ctx.trace
    if (!events.length)
      yield {
        hold: 2,
        note: "your code never touched nums 🤨 — it returned without reading the array",
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
      Array.isArray(r) && r.length === 2 && nums[r[0]] + nums[r[1]] === target
    yield {
      hold: 3,
      answer: ok ? [...r].sort((a, b) => a - b) : undefined,
      note: ok
        ? `returned [${r}] — correct, in ${events.length} array accesses. That count IS your algorithm's shape.`
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

const recap: Act<TwoSumData, F> = {
  key: "recap",
  name: "The Reveal",
  short: "what you earned",
  complexity: "journey complete 🏁",
  insight: "The ideas you fought for have names — now they're yours to reuse.",
  tools: [
    {
      name: "Array",
      role: "the given. Fast by index, slow to search — that weakness is what every other structure was invented to fix.",
    },
    {
      name: "Sorted array + two pointers",
      role: "buys the search with ORDER. Costs a sort up front and the index bookkeeping.",
    },
    {
      name: "Hash Map",
      role: "buys the search with MEMORY. Costs O(n) space, a hash per key, and an occasional full rehash when the table doubles.",
    },
  ],
  idea: 'You didn\'t learn "Two Sum". You earned two reusable weapons: the two-pointers squeeze (order lets one comparison eliminate many candidates) and the hash-map complement lookup ("have I seen what I need?") — THE most common interview pattern. Names last longer when they arrive after the struggle.',
  code: {
    pseudo: [
      "what transfers to the next problem:",
      "  1. always know the brute force",
      "  2. name its weakness out loud",
      "  3. ask: does order help? (two pointers)",
      "  4. ask: does memory help? (hash map)",
      "  5. return-what-exactly? read the contract",
    ],
  },
  takeaways: [
    "brute force is the baseline, not a failure — every trick is measured against it",
    "two pointers buys speed with ORDER; the hash map buys it with MEMORY",
    "you wrote the interview answer yourself — that's the part that sticks",
  ],
  chart: false,
  *run() {
    yield {
      hold: 3,
      note: "the squeeze you learned in act 3 has a name: TWO POINTERS. The complement lookup from acts 4–5: the HASH MAP pattern. You earned both — here's the scorecard.",
    }
  },
  view(_f, d) {
    const rows = [brute, twoptr, twopass, hash].map((a) => ({
      name: a.name,
      built: (a.tools ?? []).map((t) => t.name).join(" + "),
      cost: a.complexity,
      insight: a.insight,
    }))
    return {
      chips: chipRow(d.nums, { answer: range(d.nums.length) }),
      panel: {
        kind: "recap",
        caption:
          "the journey, side by side — the middle column is the real story",
        rows,
        note: "Read that column top to bottom: nobody invented four algorithms here. Somebody picked four different data structures to stand beside the same array, and the cost followed from the choice.",
        links: [
          {
            label: "Study the pattern: Two Pointers",
            detail:
              "the shape on its own — converge and chase, beyond this problem",
            href: "#/p/two-pointers",
          },
          {
            label: "Next problem: Single Number",
            detail:
              "a different superpower — can you beat the hash map's memory bill?",
            href: "#/journey/single-number",
          },
        ],
      },
    }
  },
}

// ---------- presets and page config ----------

function makeTwoSum(n: number, lo = 1, hi = 50): TwoSumData {
  for (let tries = 0; tries < 30; tries++) {
    const nums = shuffled(distinct(n, lo, hi))
    const i = randInt(0, nums.length - 2)
    const j = randInt(i + 1, nums.length - 1)
    const target = nums[i] + nums[j]
    if (classifyTwoSum(nums, target).ok) return { nums, target }
  }
  return { nums: [2, 7, 11, 15], target: 9 }
}

export const twoSum: Journey<TwoSumData> = {
  slug: "two-sum",
  title: "Two Sum",
  subtitle:
    "one array, one target, four ways in — each earned by the last one's weakness",
  problemId: "pair-sum",
  leetcode: 1,
  acts: [story, brute, twoptr, twopass, hash, challenge, recap],
  resources: [
    { label: "LeetCode 1", url: "https://leetcode.com/problems/two-sum/" },
    {
      label: "GeeksforGeeks: two sum",
      url: "https://www.geeksforgeeks.org/dsa/check-if-pair-with-given-sum-exists-in-array/",
    },
  ],
  presets: {
    random: { label: "random", make: () => makeTwoSum(randInt(6, 9)) },
    ends: {
      label: "answer at the extremes",
      make: () => {
        for (let tries = 0; tries < 30; tries++) {
          const nums = shuffled(distinct(7, 1, 50))
          const target = Math.min(...nums) + Math.max(...nums)
          if (classifyTwoSum(nums, target).ok) return { nums, target }
        }
        return { nums: [3, 9, 14, 1, 27, 6], target: 28 }
      },
      info: "The answer sits at the two EXTREMES — the smallest value and the largest. Some approaches will grind through the middle to find it; watch the chart for the one that does not.",
    },
    duplicates: {
      label: "equal values (3 + 3)",
      make: () => ({ nums: [3, 1, 3, 8], target: 6 }),
      info: "LC's favorite trap: the pair is two EQUAL values (3 + 3). Anything that remembers what it has seen must CHECK for the complement before STORING the current value — swap those lines and 3 matches itself.",
    },
    big: {
      label: "big (n = 20)",
      make: () => makeTwoSum(20, 1, 99),
      info: "n = 20. Same code, twenty prices. Watch the chart: one bar probes about n²/2 pairs while another stays flat. That gap is what complexity notation was trying to tell you.",
    },
    tiny: {
      label: "n = 2 (smallest legal)",
      make: () => ({ nums: [1, 2], target: 3 }),
      info: "n = 2: every loop runs at most once. The smallest legal input is where an off-by-one shows first.",
    },
    negatives: {
      label: "negatives (target 0)",
      make: () => ({ nums: [-3, 4, 3, 90], target: 0 }),
      info: "Negative values and target 0: the complement can be negative or zero. Anything that uses a value as a position breaks here; comparisons and lookups do not care.",
    },
    nosolution: {
      label: "no solution (broken promise)",
      make: () => ({ nums: [1, 2, 5, 11], target: 99 }),
    },
    multi: {
      label: "two valid pairs (broken promise)",
      make: () => ({ nums: [1, 4, 2, 3], target: 5 }),
    },
  },
  defaultPreset: "random",
  harder: { preset: "big", label: "Take on n = 20 — watch your code scale ▸" },
  params: [{ key: "target", label: "target" }],
  classify: (d) => classifyTwoSum(d.nums, d.target),
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
  challenge: TWO_SUM_CHALLENGE,
  reveals: ["two-pointers", "arrays-hashing"],
  sample: { nums: [2, 7, 11, 15], target: 9 },
  edgeCases: [
    {
      key: "tiny",
      name: "smallest legal input",
      example: "[1, 2], target 3 → [0, 1]",
      why: "n = 2 means every loop runs once at most. Off-by-one mistakes — j starting at i instead of i + 1, a loop that stops one early — show up here before anywhere else.",
      think:
        "Bring an empty or tiny case first. Two Sum cannot be empty (n ≥ 2 is promised), so n = 2 is the boundary to trace by hand.",
      constraint:
        "2 <= nums.length <= 10^4 — two elements is the smallest legal input",
      preset: "tiny",
    },
    {
      key: "duplicates",
      name: "two equal values",
      example: "[3, 1, 3, 8], target 6 → [0, 2]",
      why: "3 + 3 hits the target, but a value may not pair with itself. Anything that remembers a value must check for the complement BEFORE recording the current one, or guard j ≠ i — swap that order and 3 matches itself at index 0.",
      think:
        "Ask two questions before coding: can both indices be the same? (no) Can two different indices hold the same value? (yes) Those two answers fix the order of your check and your store.",
      constraint:
        "an element may not be paired with itself, though equal values at different indices may pair",
      preset: "duplicates",
    },
    {
      key: "negatives",
      name: "negative numbers",
      example: "[-3, 4, 3, 90], target 0 → [0, 2]",
      why: "The complement target − x can be negative or zero. Anything that uses a value as an array position, or assumes values are positive, breaks; comparisons and lookups do not care.",
      think:
        "Read the constraints line (−10⁹ ≤ nums[i] ≤ 10⁹) as part of the problem. Values are keys, never positions.",
      constraint:
        "-10^9 <= nums[i] <= 10^9 and -10^9 <= target <= 10^9 — negatives and a target of 0 are legal",
      preset: "negatives",
    },
    {
      key: "nosolution",
      name: "no pair at all",
      example: "[1, 2, 5, 11], target 99 → nothing",
      why: "The promise says exactly one answer exists, so correct code never reaches the end. Your loop still needs a defined ending, and the interviewer will ask what you return.",
      think:
        "Write the fall-through line (return [] or raise) before the happy path, so a broken promise fails loudly instead of returning garbage.",
      constraint:
        "exactly one valid pair exists — this is the promise the one-pass answer leans on",
      preset: "nosolution",
    },
  ],
}
